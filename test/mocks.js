
var testStorage = {};

/**
 * @param {string | string[]} storageKeys 
 * @returns {Promise}
 */
xBrowserSync.LocalStorage.prototype.get = function (storageKeys) {
    console.log("LocalStorage.get: " + storageKeys);
    if (Array.isArray(storageKeys)) {
        return Promise.resolve(testStorage);
    }
    else {
        return Promise.resolve(testStorage[storageKeys]);
    }
};

/**
 * @param {string} storageKey 
 * @param {*} value 
 * @returns {Promise<void>}
 */
xBrowserSync.LocalStorage.prototype.set = function (storageKey, value) {
    if (value != null) {
        testStorage[storageKey] = value;
    } else {
        delete testStorage[storageKey];
    }
    return Promise.resolve();
};
