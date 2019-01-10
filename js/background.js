var xBrowserSync = xBrowserSync || {};
xBrowserSync.App = xBrowserSync.App || {};

/* ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.App.Background
 * Description:	Initialises Extension background required functionality; registers events; 
 *              listens for sync requests.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.App.Background = function ($q, platform, globals, utility, api, bookmarks) {
	'use strict';

	var vm, asyncChannel, moduleName = 'xBrowserSync.App.Background', networkErrorDetected = false, checkForUpdatesAttempts = 0, disconnectedAlertDisplayed = false;

	/* ------------------------------------------------------------------------------------
	 * Constructor
	 * ------------------------------------------------------------------------------------ */

	var Background = function () {
		vm = this;

		vm.install = function (details) {
			if (!details) {
				return;
			}

			switch (details.reason) {
				case 'update':
					if (details.previousVersion &&
						details.previousVersion !== browser.runtime.getManifest().version) {
						// If extension has been updated display updated message
						platform.LocalStorage.Set(globals.CacheKeys.DisplayUpdated, true);
					}
					break;
			}
		};

		vm.startup = function () {
			var disableEventListeners, isSyncing, syncEnabled;

			platform.LocalStorage.Get([
				globals.CacheKeys.DisableEventListeners,
				globals.CacheKeys.IsSyncing,
				globals.CacheKeys.SyncEnabled
			])
				.then(function (cachedData) {
					disableEventListeners = cachedData[globals.CacheKeys.DisableEventListeners];
					isSyncing = cachedData[globals.CacheKeys.IsSyncing];
					syncEnabled = cachedData[globals.CacheKeys.SyncEnabled];

					// Check if a sync was interrupted
					if (isSyncing) {
						// Disable sync
						platform.LocalStorage.Set(globals.CacheKeys.IsSyncing, false);
						platform.LocalStorage.Set(globals.CacheKeys.SyncEnabled, false);

						// Display alert
						displayAlert(
							platform.GetConstant(globals.Constants.Error_SyncInterrupted_Title),
							platform.GetConstant(globals.Constants.Error_SyncInterrupted_Message));

						return;
					}

					// Exit if sync isn't enabled or event listeners disabled
					if (disableEventListeners || !syncEnabled) {
						return;
					}

					// Check for updates to synced bookmarks
					bookmarks.CheckForUpdates()
						.then(function (updatesAvailable) {
							if (!updatesAvailable) {
								return;
							}

							return syncBookmarks({ type: globals.SyncType.Pull });
						})
						.catch(function (err) {
							// Display alert
							var errMessage = utility.GetErrorMessageFromException(err);
							displayAlert(errMessage.title, errMessage.message);
						});
				});
		};

		browser.runtime.onConnect.addListener(listenForMessages);
		browser.runtime.onMessage.addListener(handleMessage);
		browser.alarms.onAlarm.addListener(handleAlarm);
		browser.bookmarks.onCreated.addListener(createBookmark);
		browser.bookmarks.onRemoved.addListener(removeBookmark);
		browser.bookmarks.onChanged.addListener(changeBookmark);
		browser.bookmarks.onMoved.addListener(moveBookmark);
	};


	/* ------------------------------------------------------------------------------------
	 * Private functions
	 * ------------------------------------------------------------------------------------ */

	var changeBookmark = function (id, changeInfo) {
		// Exit if sync isn't enabled or event listeners disabled
		platform.LocalStorage.Get([
			globals.CacheKeys.DisableEventListeners,
			globals.CacheKeys.SyncEnabled
		])
			.then(function (cachedData) {
				if (cachedData[globals.CacheKeys.DisableEventListeners] ||
					!cachedData[globals.CacheKeys.SyncEnabled]) {
					return;
				}

				// Sync updates
				syncBookmarks({
					type: globals.SyncType.Push,
					changeInfo: {
						type: globals.UpdateType.Update,
						data: [id, changeInfo]
					}
				})
					.catch(function (err) {
						// Display alert
						var errMessage = utility.GetErrorMessageFromException(err);
						displayAlert(errMessage.title, errMessage.message);

						// If data out of sync, refresh sync
						if (err && err.code && err.code === globals.ErrorCodes.DataOutOfSync) {
							syncBookmarks({ type: globals.SyncType.Pull });
						}
					});
			});
	};

	var createBookmark = function (id, bookmark) {
		// Exit if sync isn't enabled or event listeners disabled
		platform.LocalStorage.Get([
			globals.CacheKeys.DisableEventListeners,
			globals.CacheKeys.SyncEnabled
		])
			.then(function (cachedData) {
				if (cachedData[globals.CacheKeys.DisableEventListeners] ||
					!cachedData[globals.CacheKeys.SyncEnabled]) {
					return;
				}

				// Get page metadata from current tab
				platform.GetPageMetadata()
					.then(function (metadata) {
						// Add metadata if provided
						if (metadata) {
							bookmark.description = utility.StripTags(metadata.description);
							bookmark.tags = utility.GetTagArrayFromText(metadata.tags);
						}

						return syncBookmarks({
							type: globals.SyncType.Push,
							changeInfo: {
								type: globals.UpdateType.Create,
								data: [id, bookmark]
							}
						});
					})
					.catch(function (err) {
						// Display alert
						var errMessage = utility.GetErrorMessageFromException(err);
						displayAlert(errMessage.title, errMessage.message);

						// If data out of sync, refresh sync
						if (err && err.code && err.code === globals.ErrorCodes.DataOutOfSync) {
							syncBookmarks({ type: globals.SyncType.Pull });
						}
					});
			});
	};

	var displayAlert = function (title, message, callback) {
		var options = {
			type: 'basic',
			title: title,
			message: message,
			iconUrl: 'img/notification-icon.png'
		};

		if (!callback) {
			callback = null;
		}

		browser.notifications.create('xBrowserSync-notification', options, callback);
	};

	var getLatestUpdates = function () {
		// Exit if sync isn't enabled or event listeners disabled
		platform.LocalStorage.Get([
			globals.CacheKeys.DisableEventListeners,
			globals.CacheKeys.SyncEnabled
		])
			.then(function (cachedData) {
				if (cachedData[globals.CacheKeys.DisableEventListeners] ||
					!cachedData[globals.CacheKeys.SyncEnabled]) {
					return;
				}

				return bookmarks.CheckForUpdates()
					.then(function (updatesAvailable) {
						if (!updatesAvailable) {
							return;
						}

						// Get bookmark updates
						return syncBookmarks({ type: globals.SyncType.Pull });
					});
			});
	};

	var handleAlarm = function (alarm) {
		// When alarm fires check for sync updates
		if (alarm && alarm.name === globals.Alarm.Name) {
			getLatestUpdates()
				// .catch(function (err) {
				// 	// If ID was removed disable sync
				// 	if (err.code === globals.ErrorCodes.NoDataFound) {
				// 		err.code = globals.ErrorCodes.IdRemoved;
				// 		bookmarks.DisableSync();
				// 	}

				// 	// Don't display alert if sync failed due to network connection
				// 	if (err.code === globals.ErrorCodes.HttpRequestFailed ||
				// 		err.code === globals.ErrorCodes.HttpRequestFailedWhileUpdating) {
				// 		return;
				// 	}

				// 	// Display alert
				// 	var errMessage = utility.GetErrorMessageFromException(err);
				// 	displayAlert(errMessage.title, errMessage.message);
				// });
		}
	};

	var handleMessage = function (msg) {
		switch (msg.command) {
			// Trigger bookmarks sync
			case globals.Commands.SyncBookmarks:
				syncBookmarks(msg, globals.Commands.SyncBookmarks);
				break;
			// Trigger bookmarks sync with no callback
			case globals.Commands.NoCallback:
				syncBookmarks(msg, globals.Commands.NoCallback);
				break;
			// Trigger bookmarks restore
			case globals.Commands.RestoreBookmarks:
				restoreBookmarks(msg);
				break;
		}
	};

	var listenForMessages = function (port) {
		if (port.name !== globals.Title) {
			return;
		}

		asyncChannel = port;

		// Listen for messages to initiate syncing
		asyncChannel.onMessage.addListener(function (msg) {
			handleMessage(msg);
		});
	};

	var moveBookmark = function (id, moveInfo) {
		// Exit if sync isn't enabled or event listeners disabled
		platform.LocalStorage.Get([
			globals.CacheKeys.DisableEventListeners,
			globals.CacheKeys.SyncEnabled
		])
			.then(function (cachedData) {
				if (cachedData[globals.CacheKeys.DisableEventListeners] ||
					!cachedData[globals.CacheKeys.SyncEnabled]) {
					return;
				}

				// Sync updates
				syncBookmarks({
					type: globals.SyncType.Push,
					changeInfo: {
						type: globals.UpdateType.Move,
						data: [id, moveInfo]
					}
				})
					.catch(function (err) {
						// Display alert
						var errMessage = utility.GetErrorMessageFromException(err);
						displayAlert(errMessage.title, errMessage.message);

						// If data out of sync, refresh sync
						if (err && err.code && err.code === globals.ErrorCodes.DataOutOfSync) {
							syncBookmarks({ type: globals.SyncType.Pull });
						}
					});
			});
	};

	var removeBookmark = function (id, removeInfo) {
		// Exit if sync isn't enabled or event listeners disabled
		platform.LocalStorage.Get([
			globals.CacheKeys.DisableEventListeners,
			globals.CacheKeys.SyncEnabled
		])
			.then(function (cachedData) {
				if (cachedData[globals.CacheKeys.DisableEventListeners] ||
					!cachedData[globals.CacheKeys.SyncEnabled]) {
					return;
				}

				// Sync updates
				syncBookmarks({
					type: globals.SyncType.Push,
					changeInfo: {
						type: globals.UpdateType.Delete,
						data: [id, removeInfo]
					}
				})
					.catch(function (err) {
						// Display alert
						var errMessage = utility.GetErrorMessageFromException(err);
						displayAlert(errMessage.title, errMessage.message);

						// If data out of sync, refresh sync
						if (err && err.code && err.code === globals.ErrorCodes.DataOutOfSync) {
							syncBookmarks({ type: globals.SyncType.Pull });
						}
					});
			});
	};

	var restoreBookmarks = function (restoreData) {
		$q(function (resolve) {
			// Upgrade containers to use current container names
			var upgradedBookmarks = bookmarks.UpgradeContainers(restoreData.bookmarks || []);

			// If bookmarks don't have unique ids, add new ids
			if (!bookmarks.CheckBookmarksHaveUniqueIds(upgradedBookmarks)) {
				platform.Bookmarks.AddIds(upgradedBookmarks)
					.then(function (updatedBookmarks) {
						resolve(updatedBookmarks);
					});
			}
			else {
				resolve(upgradedBookmarks);
			}
		})
			.then(function (bookmarksToRestore) {
				restoreData.bookmarks = bookmarksToRestore;
				syncBookmarks(restoreData, globals.Commands.RestoreBookmarks);
			});
	};

	var syncBookmarks = function (syncData, command) {
		// Check service status
		return api.CheckServiceStatus()
			.then(function () {
				// Start sync
				return bookmarks.Sync(syncData);
			})
			.then(function (bookmarks, initialSyncFailed) {
				// If this sync initially failed, alert the user and refresh search results
				if (initialSyncFailed) {
					displayAlert(
						platform.GetConstant(globals.Constants.ConnRestored_Title),
						platform.GetConstant(globals.Constants.ConnRestored_Message));
				}

				if (command) {
					try {
						asyncChannel.postMessage({
							command: command,
							bookmarks: bookmarks,
							success: true
						});
					}
					catch (err) { }
				}
			})
			.catch(function (err) {
				if (err && err.code) {
					utility.LogMessage(globals.LogType.Info, 'Sync error: ' + err.code);
				}

				if (command) {
					try {
						asyncChannel.postMessage({ command: command, success: false, error: err });
					}
					catch (innerErr) { }
				}
			})
			.finally(function () {
				utility.LogMessage(globals.LogType.Info, 'Sync data: ' + JSON.stringify(syncData));
			});
	};

	// Call constructor
	return new Background();
};

// Initialise the angular app
xBrowserSync.App.ExtensionBackground = angular.module('xBrowserSync.App.ExtensionBackground', []);

// Disable debug info
xBrowserSync.App.ExtensionBackground.config(['$compileProvider', function ($compileProvider) {
	$compileProvider.debugInfoEnabled(false);
}]);

injectAppServices(xBrowserSync.App.ExtensionBackground);

// Add background module
xBrowserSync.App.ExtensionBackground.controller('Controller', ['$q', 'platform', 'globals', 'utility', 'api', 'bookmarks', 'platformImplementation', xBrowserSync.App.Background]);

// Set synchronous event handlers
browser.runtime.onInstalled.addListener(function () {
	document.querySelector('#install').click();
});
browser.runtime.onStartup.addListener(function () {
	document.querySelector('#startup').click();
});