var xBrowserSync = xBrowserSync || {};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.Encryption
 * Description:
 * ------------------------------------------------------------------------------------ */
xBrowserSync.Encryption = function(settings) {
    var self = {
        decryptData: function (encryptedData) {
            // Determine which decryption method to use based on sync version
            return settings.getSyncVersion()
                .then(function (syncVersion) {
                    if (!syncVersion) {
                        return self.decryptData_v1(encryptedData);
                    }
                    return self.decryptData_v2(encryptedData);
                });
        },
    
        decryptData_v1: function (encryptedData) {
            var password, syncId;
            // If no data provided, return an empty string
            if (!encryptedData) {
                return Promise.resolve('');
            }
    
            // Ensure password is in local storage
            return settings.getPasswordAndSyncId()
			.then((res) => {
				[password, syncId] = res;
                if (!password) {
                    return Promise.reject({ code: globals.ErrorCodes.PasswordRemoved });
                }

                // Decrypt using legacy crypto-js AES
                var decryptedData = CryptoJS.AES.decrypt(encryptedData, password).toString(CryptoJS.enc.Utf8);
                if (!decryptedData) {
                    return Promise.reject({ code: globals.ErrorCodes.InvalidData });
                }

                return decryptedData;
            });
        },
    
        decryptData_v2: function (encryptedData) {
            var encryptedDataBytes, iv;
            var password, syncId;
    
            // If no data provided, return an empty string
            if (!encryptedData) {
                return Promise.resolve('');
            }
    
            // Ensure both id and password are in local storage
            return settings.getPasswordAndSyncId()
			.then((res) => {
				[password, syncId] = res;    
                if (!syncId) {
                    return Promise.reject({ code: globals.ErrorCodes.IdRemoved });
                }
                if (!password) {
                    return Promise.reject({ code: globals.ErrorCodes.PasswordRemoved });
                }

                // Retrieve the hashed password from local storage and convert to bytes
                var keyData = base64js.toByteArray(password);

                // Convert base64 encoded encrypted data to bytes and extract initialization vector
                var encryptedBytes = base64js.toByteArray(encryptedData);
                iv = encryptedBytes.slice(0, 16);
                encryptedDataBytes = encryptedBytes.slice(16).buffer;

                // Generate a cryptokey using the stored password hash for decryption
                return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM', iv: iv }, false, ['decrypt']);
            })
            .then(function (key) {
                // Convert base64 encoded encrypted data to bytes
                return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encryptedDataBytes);
            })
            .then(function (decryptedBytes) {
                if (!decryptedBytes) {
                    throw new Error('Unable to decrypt data.');
                }

                // Uncompress the decrypted data and return
                var decryptedData = LZUTF8.decompress(new Uint8Array(decryptedBytes));
                return decryptedData;
            })
            .catch(function (err) {
                if (err && err.name !== 'OperationError') {
                    logError(err);
                }

                return Promise.reject({ code: globals.ErrorCodes.InvalidData });
            });
        },
       
        encryptData: function (data) {
            var iv, password, syncId;
    
            // If no data provided, return an empty string
            if (!data) {
                return Promise.resolve('');
            }
    
            // Ensure both id and password are in local storage
            return settings.getPasswordAndSyncId()
			.then((res) => {
				[password, syncId] = res;    
    
                if (!syncId) {
                    return Promise.reject({ code: globals.ErrorCodes.IdRemoved });
                }
                if (!password) {
                    return Promise.reject({ code: globals.ErrorCodes.PasswordRemoved });
                }

                // Retrieve the hashed password from local storage and convert to bytes
                var keyData = base64js.toByteArray(password);

                // Generate a random 16 byte initialization vector
                iv = crypto.getRandomValues(new Uint8Array(16));

                // Generate a new cryptokey using the stored password hash
                return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM', iv: iv }, false, ['encrypt']);
            })
            .then(function (key) {
                // Compress the data before encryption
                var compressedData = LZUTF8.compress(data);

                // Encrypt the data using AES
                return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, compressedData);
            })
            .then(function (encryptedData) {
                // Combine initialization vector and encrypted data and return as base64 encoded string
                var combinedData = concatUint8Arrays(iv, new Uint8Array(encryptedData));
                return base64js.fromByteArray(combinedData);
            })
            .catch(function (err) {
                logError(err);
                return Promise.reject({ code: globals.ErrorCodes.InvalidData });
            });
        },
        
        getPasswordHash: function (password, salt) {
            var encoder = new TextEncoder('utf-8');
            var encodedSalt = encoder.encode(salt);
    
            // Get cached sync version
            return settings.getSyncVersion()
            .then(function (syncVersion) {
                // If old sync version, don't hash password for legacy encryption
                if (!syncVersion) {
                    return Promise.resolve(password);
                }

                // Generate a new cryptokey using the stored password hash
                var keyData = encoder.encode(password);
                return crypto.subtle.importKey('raw', keyData, { name: 'PBKDF2' }, false, ['deriveKey']);
            })
            .then(function (importedKey) {
                // Run the key through PBKDF2 with many iterations using the provided salt
                return crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: encodedSalt,
                        iterations: 250000,
                        hash: 'SHA-256'
                    },
                    importedKey,
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
            })
            .then(function (derivedKey) {
                // Export the hashed key
                return crypto.subtle.exportKey('raw', derivedKey);
            })
            .then(function (exportedKey) {
                // Convert exported key to base64 encoded string and return
                var base64Key = base64js.fromByteArray(new Uint8Array(exportedKey));
                return base64Key;
            });
        }
    };
    return self;
}