var xBrowserSync = xBrowserSync || {};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.LocalStorage
 * Description:
 * ------------------------------------------------------------------------------------ */
xBrowserSync.LocalStorage = function() {
    return {
        storageKeys: {
            LocalBookmarks: 'localBookmarks',
            SyncStatus: 'syncStatus',
            ServerBookmarks: 'serverBookmarks',
            ServiceUrl: 'serviceUrl',
            Password: 'password',
            SyncId: 'syncId',
            NetworkDisconnected: 'networkDisconnected'
        },
        /**
         * @param {string | string[]} storageKeys
         * @returns {Promise}
         */
        get: function (storageKeys) {
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
        },
        /**
         * @param {string} storageKey
         * @param {*} value
         * @returns {Promise<void>}
         */
        set: function (storageKey, value) {
            if (value != null) {
                var storageObj = {};
                storageObj[storageKey] = value;
                return browser.storage.local.set(storageObj);
            } else {
                return browser.storage.local.remove(storageKey);
            }
        }
    }
};
