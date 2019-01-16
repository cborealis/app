var xBrowserSync = xBrowserSync || {};
xBrowserSync.App = xBrowserSync.App || {};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.App.API
 * Description:	Responsible for communicating with the xBrowserSync API service.
 * @param {xBrowserSync.Settings} settings
 * @param {xBrowserSync.App.Global} globals
 * ------------------------------------------------------------------------------------ */
xBrowserSync.App.API = function ($http, $q, settings, globals, utility) {
	'use strict';

	var moduleName = 'xBrowserSync.App.API';

	/* ------------------------------------------------------------------------------------
	 * Public functions
	 * ------------------------------------------------------------------------------------ */
	
	/**
	 * @param {string} url 
	 */
	 var checkServiceStatus = function (url) {
		var data;

		// Get current service url if not provided
		var getServiceUrl = !url ? settings.getServiceUrl() : $q.resolve(url);
		return getServiceUrl
			.then(function (serviceUrl) {
				// Request service info
				return $http({
					method: 'GET',
					url: serviceUrl + globals.URL.ServiceInformation,
					timeout: 3000,
				});
			})
			.then(apiRequestSucceeded)
			.then(function (response) {
				data = response.data;

				// Check service is a valid xBrowserSync API
				if (!data || data.status === null || data.version === null) {
					return $q.reject({ code: globals.ErrorCodes.ApiInvalid });
				}

				// Check service is online
				if (data.status === globals.ServiceStatus.Offline) {
					return $q.reject({ code: globals.ErrorCodes.ApiOffline });
				}

				// Check service version is supported by this client
				if (compareVersions(data.version, globals.ApiVersion) < 0) {
					return $q.reject({ code: globals.ErrorCodes.ApiVersionNotSupported });
				}

				return data;
			})
			.catch(function (err) {
				utility.LogMessage(globals.LogType.Info, err);

				if (err.status) {
					return getErrorCodeFromHttpError(err);
				}
				else {
					return $q.reject(err);
				}
			});
	};

	var createNewSync = function () {
		var data;

		return settings.getServiceUrl()
			.then(function (serviceUrl) {
				var data = {
					version: globals.AppVersion
				};

				return $http.post(serviceUrl + globals.URL.Bookmarks,
					JSON.stringify(data));
			})
			.then(apiRequestSucceeded)
			.then(function (response) {
				data = response.data;

				// Check response data is valid before returning
				if (!data || !data.id || !data.lastUpdated || !data.version) {
					return $q.reject({ code: globals.ErrorCodes.NoDataFound });
				}

				return data;
			})
			.catch(function (err) {
				utility.LogMessage(globals.LogType.Info, err);

				if (err.status) {
					return getErrorCodeFromHttpError(err);
				}
				else {
					return $q.reject(err);
				}
			});
	};

	var getBookmarks = function (canceller) {
		var data, password, syncId;

		// Check secret and sync ID are present
		return settings.getPasswordAndSyncId()
			.then(function (res) {
				[password, syncId] = res;
				if (!password || !syncId) {
					return $q.reject({ code: globals.ErrorCodes.MissingClientData });
				}

				// Get current service url
				return settings.getServiceUrl();
			})
			.then(function (serviceUrl) {
				return $http.get(serviceUrl + globals.URL.Bookmarks + '/' + syncId,
					{ timeout: canceller });
			})
			.then(apiRequestSucceeded)
			.then(function (response) {
				data = response.data;

				// Check response data is valid before returning
				if (!data || !data.lastUpdated) {
					return $q.reject({ code: globals.ErrorCodes.NoDataFound });
				}

				return data;
			})
			.catch(function (err) {
				// Return if request was cancelled
				if (err.config &&
					err.config.timeout &&
					err.config.timeout.$$state &&
					err.config.timeout.$$state.status &&
					err.config.timeout.$$state.status === 1) {
					return $q.reject({ code: globals.ErrorCodes.HttpRequestCancelled });
				}

				utility.LogMessage(globals.LogType.Info, err);

				if (err.status) {
					return getErrorCodeFromHttpError(err);
				}
				else {
					return $q.reject(err);
				}
			});
	};

	var getBookmarksLastUpdated = function () {
		var data, password, syncId;

		// Check secret and sync ID are present
		return settings.getPasswordAndSyncId()
			.then((res) => {
				[password, syncId] = res;
				if (!password || !syncId) {
					return $q.reject({ code: globals.ErrorCodes.MissingClientData });
				}

				// Get current service url
				return settings.getServiceUrl();
			})
			.then(function (serviceUrl) {
console.log("yep! " +  syncId);
				return $http.get(serviceUrl + globals.URL.Bookmarks +
					'/' + syncId + globals.URL.LastUpdated);
			})
			.then(apiRequestSucceeded)
			.then(function (response) {
				data = response.data;

				// Check response data is valid before returning
				if (!data || !data.lastUpdated) {
					return $q.reject({ code: globals.ErrorCodes.NoDataFound });
				}

				return data;
			})
			.catch(function (err) {
				utility.LogMessage(globals.LogType.Info, err);

				if (err.status) {
					return getErrorCodeFromHttpError(err);
				}
				else {
					return $q.reject(err);
				}
			});
	};

	var getBookmarksVersion = function (syncId) {
		var data;

		// Get current service url
		return settings.getServiceUrl()
			.then(function (serviceUrl) {
				return $http.get(serviceUrl + globals.URL.Bookmarks +
					'/' + syncId + globals.URL.Version);
			})
			.then(apiRequestSucceeded)
			.then(function (response) {
				data = response.data;

				// Check response data is valid before returning
				if (!data) {
					return $q.reject({ code: globals.ErrorCodes.NoDataFound });
				}

				return data;
			})
			.catch(function (err) {
				utility.LogMessage(globals.LogType.Info, err);

				if (err.status) {
					return getErrorCodeFromHttpError(err);
				}
				else {
					return $q.reject(err);
				}
			});
	};

	var updateBookmarks = function (encryptedBookmarks, updateSyncVersion) {
		var data, password, syncId;

		// Check secret and sync ID are present
		return settings.getPasswordAndSyncId()
			.then(function (res) {
				[password, syncId] = res;
				if (!password || !syncId) {
					return $q.reject({ code: globals.ErrorCodes.MissingClientData });
				}

				// Get current service url
				return settings.getServiceUrl();
			})
			.then(function (serviceUrl) {
				var data = {
					bookmarks: encryptedBookmarks
				};

				// If updating sync version, set as current app version
				if (updateSyncVersion) {
					data.version = globals.AppVersion;
				}

				return $http.put(serviceUrl + globals.URL.Bookmarks + '/' + syncId,
					JSON.stringify(data));
			})
			.then(apiRequestSucceeded)
			.then(function (response) {
				data = response.data;

				// Check response data is valid before returning
				if (!data || !data.lastUpdated) {
					return $q.reject({ code: globals.ErrorCodes.NoDataFound });
				}

				return data;
			})
			.catch(function (err) {
				utility.LogMessage(globals.LogType.Info, err);

				if (err.status) {
					return getErrorCodeFromHttpError(err);
				}
				else {
					return $q.reject(err);
				}
			});
	};


	/* ------------------------------------------------------------------------------------
	 * Private functions
	 * ------------------------------------------------------------------------------------ */

	var apiRequestSucceeded = function (response) {
		// Reset network disconnected flag
		return settings.setNetworkDisconnected(false)
			.then(function () {
				return response;
			});
	};

	var getErrorCodeFromHttpError = function (httpErr) {
		var getErrorCodePromise;

		switch (httpErr.status) {
			// 405 Method Not Allowed: server not accepting new syncs
			case 405:
				getErrorCodePromise = $q.resolve(globals.ErrorCodes.NotAcceptingNewSyncs);
				break;
			// 406 Not Acceptable: daily new sync limit reached
			case 406:
				getErrorCodePromise = $q.resolve(globals.ErrorCodes.DailyNewSyncLimitReached);
				break;
			// 409 Conflict: invalid id
			case 409:
				getErrorCodePromise = $q.resolve(globals.ErrorCodes.NoDataFound);
				break;
			// 413 Request Entity Too Large: sync data size exceeds server limit
			case 413:
				getErrorCodePromise = $q.resolve(globals.ErrorCodes.RequestEntityTooLarge);
				break;
			// 429 Too Many Requests: daily new sync limit reached
			case 429:
				getErrorCodePromise = $q.resolve(globals.ErrorCodes.TooManyRequests);
				break;
			// -1: No network connection
			case -1:
				getErrorCodePromise = settings.setNetworkDisconnected(true)
					.then(function () {
						return globals.ErrorCodes.HttpRequestFailed;
					});
				break;
			// Otherwise generic request failed
			default:
				getErrorCodePromise = $q.resolve(globals.ErrorCodes.HttpRequestFailed);
		}

		return getErrorCodePromise
			.then(function (errorCode) {
				return {
					code: errorCode
				};
			});
	};

	return /** @exports xBrowserSync.App.API */ {
		CheckServiceStatus: checkServiceStatus,
		CreateNewSync: createNewSync,
		GetBookmarks: getBookmarks,
		GetBookmarksLastUpdated: getBookmarksLastUpdated,
		GetBookmarksVersion: getBookmarksVersion,
		UpdateBookmarks: updateBookmarks
	};
};