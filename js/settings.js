var xBrowserSync = xBrowserSync || {};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.Settings
 * Description:
 * @param {xBrowserSync.LocalStorage} localStorage
 * @param {xBrowserSync.App.Global} globals
 * ------------------------------------------------------------------------------------ */
xBrowserSync.Settings = function(localStorage, globals) {
    'use strict';
    return {
        getServiceUrl: function () {
            // Get service url from local storage
            return localStorage.get(localStorage.storageKeys.ServiceUrl)
                .then(function (cachedServiceUrl) {
                    // If no service url cached, use default
                    return cachedServiceUrl || globals.URL.DefaultServiceUrl;
                });
        },

        getPasswordAndSyncId: function () {
            return localStorage.get([
                localStorage.storageKeys.Password,
                localStorage.storageKeys.SyncId,
            ]).then((keys) => [keys[localStorage.storageKeys.Password],keys[localStorage.storageKeys.SyncId]]);
        },

        getLastUpdated: function() {
            return localStorage.get(localStorage.storageKeys.LastUpdated);
        },

        setLastUpdated: function(lastUpdated) {
            return localStorage.set(localStorage.storageKeys.LastUpdated, lastUpdated);
        },

        getIsSyncing: function() {
            return localStorage.get(localStorage.storageKeys.IsSyncing);
        },

        setIsSyncing: function(isSyncing) {
            return localStorage.set(localStorage.storageKeys.IsSyncing, isSyncing);
        },

        getSyncEnabled: function() {
            return localStorage.get(localStorage.storageKeys.SyncEnabled);
        },

        setSyncEnabled: function(syncEnabled) {
            return localStorage.set(localStorage.storageKeys.SyncEnabled, syncEnabled);
        },

        getSyncVersion: function() {
            return localStorage.get(localStorage.storageKeys.SyncVersion);
        },

        getNetworkDisconnected: function() {
            return localStorage.get(localStorage.storageKeys.NetworkDisconnected);
        },

        /**
         * @param {boolean} isDisconnected
         * @returns {Promise<void>}
         */
        setNetworkDisconnected: function(isDisconnected) {
            return localStorage.set(localStorage.storageKeys.NetworkDisconnected, isDisconnected);
        }
    }
};
