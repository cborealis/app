var xBrowserSync = xBrowserSync || {};
xBrowserSync.App = xBrowserSync.App || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.App.Platform
 * Description:	Defines an interface for platform-specific functionality in order
 *              to separate from common functionality. This interface must be
 *              implemented for all supported platforms, e.g. see 
 *              platform/chrome//platformImplementation.js.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.App.Platform = function () {
	'use strict';

	var notImplemented = function () {
		function NotImplementedException() {
			this.name = 'NotImplementedException';
			this.code = 10600;
		}

		// Throw not implemented exception
		throw new NotImplementedException();
	};

	/**
	 * 
	 * @param {string} constName 
	 * @param {string | string[]} [substitutions]
	 * @returns {string}
	 */
	var getConstant = function (constName, substitutions) {
		return browser.i18n.getMessage(constName, substitutions);
	};

	/**
	 * @param {string | string[]} storageKeys 
	 * @returns {Promise}
	 */
	var getFromLocalStorage = function (storageKeys) {
        return browser.storage.local.get(storageKeys).then(function(storageItems) {
			if (Array.isArray(storageKeys)) {
				console.log(storageItems);
				return storageItems;
			}
			else {
				console.log(storageItems);
				return storageItems[storageKeys];
			}
	   });
	};

	/**
	 * @param {string} storageKey 
	 * @param {*} value 
	 * @returns {Promise<void>}
	 */
	var setInLocalStorage = function (storageKey, value) {
		if (value != null) {
			var storageObj = {};
			storageObj[storageKey] = value;
			return browser.storage.local.set(storageObj);
		} else {
			return browser.storage.local.remove(storageKey);
		}
	};

	return /** @class xPlatform */ {
		AutomaticUpdates: {
			Start: notImplemented,
			Stop: notImplemented
		},
		BackupData: notImplemented,
		Bookmarks: {
			AddIds: notImplemented,
			Clear: notImplemented,
			Created: notImplemented,
			CreateSingle: notImplemented,
			Deleted: notImplemented,
			DeleteSingle: notImplemented,
			Get: notImplemented,
			Moved: notImplemented,
			Populate: notImplemented,
			Share: notImplemented,
			Updated: notImplemented,
			UpdateSingle: notImplemented
		},
		GetConstant: getConstant,
		GetCurrentUrl: notImplemented,
		GetPageMetadata: notImplemented,
		Init: notImplemented,
		Interface: {
			Loading: {
				Hide: notImplemented,
				Show: notImplemented
			},
			Refresh: notImplemented
		},
		LocalStorage: {
			Get: getFromLocalStorage,
			Set: setInLocalStorage
		},
		OpenUrl: notImplemented,
		ScanID: notImplemented,
		SelectFile: notImplemented,
		Sync: notImplemented
	};
};