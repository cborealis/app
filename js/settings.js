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

        getNetworkDisconnected: function() {

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
