//  _ = require('underscore')

var xBrowserSync = xBrowserSync || {};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.Bookmarks
 * Description:
 * @param {xGlobal} globals
 * @param {xLocalStorage} localStorage
 * @param {xSettings} settings
 * @param {xEncryption} encryption
 * @param {xAPI} api
 * ------------------------------------------------------------------------------------ */
xBrowserSync.Bookmarks = function (globals, localStorage, settings, encryption, api) {
    'use strict';
    /** @class xBookmarks */
    var self = {
        /**
         * @callback iteratorCallback
         * @param {browser.bookmarks.BookmarkTreeNode} bookmark
         */
        /**
         * @param {browser.bookmarks.BookmarkTreeNode[]} bookmarks
         * @param {iteratorCallback} iteratee
         */
        forEachBookmark: function (bookmarks, iteratee) {
            // Run the iteratee function for every bookmark
            (function iterateBookmarks(bookmarksToIterate) {
                for (var i = 0; i < bookmarksToIterate.length; i++) {
                    iteratee(bookmarksToIterate[i]);

                    // If the bookmark has children, iterate them
                    if (bookmarksToIterate[i].children && bookmarksToIterate[i].children.length > 0) {
                        iterateBookmarks(bookmarksToIterate[i].children);
                    }
                }
            })(bookmarks);
        },

        /**
         * @param {string} id 
         * @param {*} tree 
         * @param {number} index 
         * @returns { {result, path: [{bookmark, index}]} }
         */
        findBookmarkInTree: function (id, tree, index) {
            if (Array.isArray(tree)) {
                tree = {
                    id: -1,
                    children: tree
                };
            }
    
            if (tree.id === id) {
                let path = [{ bookmark: tree, index: index }];
                return { result: tree, path: path };
            } else {
                let children = tree.children || [];
                for (let i = 0; i < children.length; i++) {
                    let child = children[i];
                    let tmp = self.findBookmarkInTree(id, child, i);
                    if (!_.isEmpty(tmp)) {
                        tmp.path.unshift({ bookmark: tree, index: index });
                        return tmp;
                    }
                }
                return {};
            }
        },

        getNewBookmarkId: function (bookmarks) {
            let highestId = 0;
    
            self.forEachBookmark(bookmarks, function (bookmark) {
                if (!_.isUndefined(bookmark.id) && bookmark.id > highestId) {
                    highestId = bookmark.id;
                }
            });
    
            return highestId + 1;
        },
    
        /**
         * @returns {Promise<browser.bookmarks.BookmarkTreeNode[]>}
         */
        getBrowserBookmarks: function() {
            return browser.bookmarks.getTree().then((bookmarks) => bookmarks[0].children);
        },

        /**
         * @returns {Promise<[]>}
         */
        loadLocalBookmarks: function() {
            return localStorage.get(localStorage.storageKeys.LocalBookmarks)
                .then((localBookmarks) => {
                    return localBookmarks || [];
                })
        },

        /**
         * @param {[]} localBookmarks 
         * @returns {Promise<void>}
         */
        storeLocalBookmarks: function(localBookmarks) {
            return localStorage.set(localStorage.storageKeys.LocalBookmarks, localBookmarks);
        },

        /**
         * @returns {Promise<{}>}
         */
        loadSyncStatus: function() {
            return localStorage.get(localStorage.storageKeys.SyncStatus)
                .then((syncStatus) => {
                    return syncStatus || {};
                })
        },

        /**
         * @param {{}} syncStatus
         * @returns {Promise<void>}
         */
        storeSyncStatus: function(syncStatus) {
            return localStorage.set(localStorage.storageKeys.SyncStatus, syncStatus);
        },

        /**
         * @returns {Promise<boolean>}
         */
        checkIfServerBookmarksOutOfDate: function () {
            let localLastUpdated;
        
            return settings.getLastUpdated()
            .then((lastUpdated) => {
                localLastUpdated = lastUpdated;
                // Check if bookmarks have been updated
                return api.GetBookmarksLastUpdated();
            })
            .then((data) => {
                console.log("outofdate: " + localLastUpdated + "  " + data.lastUpdated);
                // If last updated is different the date in local storage, refresh bookmarks
                return !localLastUpdated || localLastUpdated !== data.lastUpdated;
            })
            .catch((err) => {
                if (err.code === globals.ErrorCodes.NoDataFound) {
                    err.code = globals.ErrorCodes.IdRemoved;
                }
                // Check if sync should be disabled
                if (self.checkIfDisableSync(err)) {
                    return self.hardResetSync().then(() => { throw Error(err); })
                }
                throw Error(err);
            });
        },

        /**
         * @param {boolean} force 
         * @returns {Promise<boolean>} if there was an update
         */
        retrieveServerBookmarksIfOutOfDate: function(force) {
            return self.checkIfServerBookmarksOutOfDate()
            .then((outofdate) => {
                if (outofdate || force) {
                    return api.GetBookmarks()
                    .then((serverBookmarks) => {
                        return localStorage.set(localStorage.storageKeys.ServerBookmarks, serverBookmarks.bookmarks)
                        .then(() => settings.setLastUpdated(serverBookmarks.lastUpdated))
                        .then(() => true);
                    });
                } else {
                    return false;
                }
            });
        },

        loadServerBookmarks: function() {
            return localStorage.get(localStorage.storageKeys.ServerBookmarks)
            .then((encryptedBookmarks) => {
                return encryption.decryptData(encryptedBookmarks);
            })
            .then((decryptedServerBookmarks) => {
                return JSON.parse(decryptedServerBookmarks);
            })
        },

        /**
         * @returns {boolean}
         */
        checkIfDisableSync: function (err) {
            return err.code === globals.ErrorCodes.ContainerChanged ||
                err.code === globals.ErrorCodes.IdRemoved ||
                err.code === globals.ErrorCodes.MissingClientData ||
                err.code === globals.ErrorCodes.NoDataFound ||
                err.code === globals.ErrorCodes.TooManyRequests;
        },

        hardResetSync: function () {
            // Disable checking for sync updates
            platform.AutomaticUpdates.Stop();   // TODO fix
    
            // Clear cached data
            return Promise.all([
                settings.setIsSyncing(false),
                settings.setSyncEnabled(false),
                localStorage.set(localStorage.storageKeys.ServerBookmarks, null),
                localStorage.set(localStorage.storageKeys.Password, null),
                localStorage.set(localStorage.storageKeys.SyncVersion, null)
            ]);
        }

    };
    return self;
};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.XBookmark
 * Description:
 * ------------------------------------------------------------------------------------ */
xBrowserSync.XBookmark = function (title, url, description, tags, children, xid, id, index, parentId, dateAdded, dateGroupModified) {
    this.xid = xid;
    this.xparentId;
    this.id = id;   // local to this browser
    this.index = index;  // local to this browser
    this.parentId = parentId;  // local to this browser
    this.dateAdded = dateAdded;
    this.dateModified;
    this.dateGroupModified = dateGroupModified;
    this.favIcon;
    this.rating;
    this.visits = {};   // browserId -> count
    this.profiles = [];

    if (title) {
        this.title = title.trim();
    }

    if (url) {
        this.url = url.trim();
    }
    else {
        this.children = children || [];
    }

    if (description) {
        this.description = utility.TrimToNearestWord(description, globals.Bookmarks.DescriptionMaxLength);
    }

    if (tags && tags.length > 0) {
        this.tags = tags;
    }
};

/** ------------------------------------------------------------------------------------
 * Class name:	xBrowserSync.SyncEngine
 * Description:	Responsible for synchronizing bookmark data.
 * @param {xLocalStorage} localStorage
 * @param {xBookmarks} bookmarks
 * @param {xPlatform} platform
 * @param {xGlobal} globals
 * @param {xAPI} api
 * @param {xUtility} utility
 * ------------------------------------------------------------------------------------ */
xBrowserSync.SyncEngine = function (localStorage, bookmarks, platform, globals, api, utility) {
    'use strict';
    let self = {
        extendBrowserBookmarkWithXBookmark: function(bookmark, xbookmark) {
            for (let v in xbookmark) {
                // copy all properties that bookmark doesn't already have
                if (bookmark[v] === undefined) {
                    bookmark[v] = xbookmark[v];
                }
            }
        },
        
        // TODO call in init
        // call this in a timer loop for edge
        syncBrowserToLocalBookmarks: function() {
            return bookmarks.loadLocalBookmarks()
            .then((localBookmarks) => {
                return bookmarks.getBrowserBookmarks()
                .then((browserBookmarks) => {
                    // Get all local bookmarks into dictionary
                    let localBookmarksById = {};
                    let foundContainers = [];
                    bookmarks.forEachBookmark(localBookmarks, (lbookmark) => {
                        localBookmarksById[lbookmark.id] = lbookmark;
                    });
                    bookmarks.forEachBookmark(browserBookmarks, (bbookmark) => {
                        if (localBookmarksById[bbookmark.id]) {
                            self.extendBrowserBookmarkWithXBookmark(bbookmark, localBookmarksById[bbookmark.id]);
                        }
                        if (self.xBookmarkIsContainer(bbookmark)) {
                            foundContainers.push(bbookmark);
                        }
                    });
                    self.moveContainersToRoot(foundContainers, browserBookmarks);
                    console.log(browserBookmarks);
                    return bookmarks.storeLocalBookmarks(browserBookmarks)
                        .then(() => browserBookmarks);
                });
            })
        },

        moveContainersToRoot(foundContainers, localBookmarks) {
            console.log("found containers: " + foundContainers);
            for (let i=0; i<foundContainers.length; i++) {
                let parent = bookmarks.findBookmarkInTree(foundContainers[i].parentId, localBookmarks);
                parent.result.children = _.filter(parent.result.children, (b) => b.id !== foundContainers[i].id);
                localBookmarks.push(foundContainers[i]);
            }
        },
        
        /**
         * check if newer version on server
         *   if yes, load from server and store
         * load localBookmarks
         * load syncStatus
         * merge
         *   but don't apply localBookmarks changes to browser yet, just remember what needs to be changed
         * send serverBookmarks to server
         * if not success => throw away all changes and begin again (meaning load from store again)
         * if success => save localBookmarks, syncStatus and serverBookmarks to store
         * apply localBookmarks changes to browser
         * @returns {*}
         */
        syncLocalAndServerBookmarks: function() {
            let serverBookmarksUpdated, serverBookmarks, localBookmarks, syncStatus;
            return bookmarks.retrieveServerBookmarksIfOutOfDate()
            .then((updated) => {
                serverBookmarksUpdated = updated;
                return Promise.all([bookmarks.loadServerBookmarks(), bookmarks.loadLocalBookmarks(), bookmarks.loadSyncStatus()])
            })
            .then((res) => {
                [serverBookmarks, localBookmarks, syncStatus] = res;
                return self.doTopLevelMerge(localBookmarks, serverBookmarks, syncStatus);
            })
        },

        doTopLevelMerge: function(localBookmarks, serverBookmarks, syncStatus) {
            // TODO move to platform
            var ffNativeRoots = {
                menuBookmarksId: 'menu________',
                mobileBookmarksId: 'mobile______',
                otherBookmarksId: 'unfiled_____',
                rootBookmarkId: 'root________',
                toolbarBookmarksId: 'toolbar_____'
            };
            var nativeRoots = {
                menuBookmarksId: 'N/A',
                mobileBookmarksId: 'N/A',
                rootBookmarkId: '0',
                toolbarBookmarksId: '1', 
                otherBookmarksId: '2'
            };
            var containerRoots = {
                menuBookmarksId: '[xbs] Menu',
                mobileBookmarksId: '[xbs] Mobile',
                otherBookmarksId: '[xbs] Other',
                toolbarBookmarksId: '[xbs] Toolbar'
            };
            for (let rootId in containerRoots) {
                let nativeRoot = _.findWhere(localBookmarks, { id: nativeRoots[rootId] });
                const title = { title: containerRoots[rootId] };
                let localRoot = _.findWhere(localBookmarks, title);
                let serverRoot = _.findWhere(serverBookmarks, title);
                console.log(rootId);
                console.log("native: ", nativeRoot);
                console.log("local:  ", localRoot);
                console.log("server: ", serverRoot);

                if (nativeRoot && localRoot) {
                    console.error("Found native root folder AND simulated root folder for ", rootId);
                    localBookmarks = _.filter(localBookmarks, (b) => b.id !== localRoot);
                    localRoot = undefined;
                }
                localRoot = localRoot || nativeRoot;
                if (!localRoot && serverRoot) {
                    // create local simulated root
                    localRoot = { id: bookmarks.getNewBookmarkId(localBookmarks), title: containerRoots[rootId], children: [] };  // set new ID here?
                    localBookmarks.push(localRoot);
                    // TODO remember change
                }
                if (localRoot && !serverRoot) {
                    // create server side root
                    serverRoot = { id: bookmarks.getNewBookmarkId(serverBookmarks), title: containerRoots[rootId], children: [], dateAdded: localRoot.dateAdded };
                    serverBookmarks.push(serverRoot);
                }
                if (localRoot && serverRoot) {
                    self.doRootFolderMerge(localRoot, serverRoot, localBookmarks, serverBookmarks, syncStatus);
                }
            }
            console.log("server ", serverBookmarks);
            console.log("local ", localBookmarks);
            console.log("sync ", syncStatus);

        },

        doRootFolderMerge(localRoot, serverRoot, localBookmarks, serverBookmarks, syncStatus) {
            self.processFolderAdds(localRoot, serverRoot, localBookmarks, serverBookmarks, syncStatus);
        },

        processFolderAdds(localFolder, serverFolder, localBookmarks, serverBookmarks, syncStatus) {
            let matches = self.matchBookmarks(localFolder.children, serverFolder.children, localBookmarks, serverBookmarks, syncStatus);
            console.log(matches);
            let lNewFolders = _.filter(matches, m => m.A && !m.B && !m.children);
            let sNewFolders = _.filter(matches, m => !m.A && m.B && !m.children);
            console.log(lNewFolders);
            console.log(sNewFolders);
        },

        matchBookmarks(lFolders, sFolders, localBookmarks, serverBookmarks, syncStatus) {
            let matches = [];
            for (let i=0; i<lFolders.length; i++) {
                let lbookmark = lFolders[i];
                let lsync = _.findWhere(syncStatus, { id: lbookmark.id });
                if (lsync) {
                    let rMatch = _.findWhere(sFolders, { id: lsync.xid });
                    if (rMatch) {
                        console.log("A B status");
                        matches.push({A: lbookmark, B: rMatch, status: lsync});
                    } else {
                        // search entire tree to see if bookmark was moved
                        let moved = bookmarks.findBookmarkInTree(lsync.xid, serverBookmarks);
                        if (moved.result) {
                            console.log("A B status, moved");
                            matches.push({A: lbookmark, B: moved.result, status: lsync});
                        } else {
                            console.log("A !B status");
                            matches.push({A: lbookmark, B: null, status: lsync});
                        }
                    }
                } else {
                    let rMatch;
                    if (lbookmark.url) {
                        rMatch = _.findWhere(sFolders, { url: lbookmark.url });
                    } else {
                        rMatch = _.findWhere(sFolders, { title: lbookmark.title });
                    }
                    if (rMatch) {
                        let rReverseSync = _.findWhere(syncStatus, { xid: rMatch.id });
                        if (rReverseSync) {
                            // we found a bookmark that is already synced -> match was wrong
                            console.log("A !B !status");
                            matches.push({A: lbookmark, B: null, status: null});
                        } else {
                            console.log("A B !status");
                            matches.push({A: lbookmark, B: rMatch, status: null});
                        }
                    } else {
                        console.log("A !B !status");
                        matches.push({A: lbookmark, B: null, status: null});
                    }
                }
            }
            for (let i=0; i<sFolders.length; i++) {
                let sbookmark = sFolders[i];
                let ssync = _.findWhere(syncStatus, { xid: sbookmark.id });
                if (ssync) {
                    let lMatch = _.findWhere(lFolders, { id: ssync.id });
                    if (lMatch) {
                        console.log("A B status");
//                        matches.push({A: lbookmark, B: rMatch, status: lsync});
                    } else {
                        // search entire tree to see if bookmark was moved
                        let moved = bookmarks.findBookmarkInTree(ssync.id, localBookmarks);
                        if (moved.result) {
                            console.log("A B status, moved");
                            matches.push({A: moved.result, B: sbookmark, status: ssync});
                        } else {
                            console.log("!A B status");
                            matches.push({A: null, B: sbookmark, status: ssync});
                        }
                    }
                } else {
                    let lMatch;
                    if (sbookmark.url) {
                        lMatch = _.findWhere(lFolders, { url: sbookmark.url });
                    } else {
                        lMatch = _.findWhere(lFolders, { title: sbookmark.title });
                    }
                    if (lMatch) {
                        let lReverseSync = _.findWhere(syncStatus, { id: lMatch.id });
                        if (lReverseSync) {
                            // we found a bookmark that is already synced -> match was wrong
                            console.log("!A B !status");
                            matches.push({A: null, B: sbookmark, status: null});
                        } else {
                            console.log("A B !status");
//                            matches.push({A: lbookmark, B: rMatch, status: null});
                        }
                    } else {
                        console.log("!A B !status");
                        matches.push({A: null, B: sbookmark, status: null});
                    }
                }
            }
            return matches;
        },

        doMerge: function(serverBookmarks, localBookmarks, syncStatus) {
            let sbDirs = serverBookmarks.filter((val) => val.hasOwnProperty("children"));
            let lbDirs = localBookmarks.filter((val) => val.hasOwnProperty("children"));
            console.log(sbDirs);
            console.log(lbDirs);
        },
    
        xBookmarkIsContainer: function (bookmark) {
            return (bookmark.title === globals.Bookmarks.MenuContainerName ||
                bookmark.title === globals.Bookmarks.MobileContainerName ||
                bookmark.title === globals.Bookmarks.OtherContainerName ||
                bookmark.title === globals.Bookmarks.ToolbarContainerName);
        },
    
        /*
        
            browserBookmarks (not in android) => localBookmarks => syncStatus <= serverBookmarks
        
        https://unterwaditzer.net/2016/sync-algorithm.html
        
        all bookmark listeners/actions:
        if (!localBookmarks)
            localBookmarks = getAllBrowserBookmarks => do in init()
        update localBookmarks with change
        
        sync_all:
        var localBookmarks, serverBookmarks, syncStatus (in localstorage)
        if (!localBookmarks)
            localBookmarks = getAllBrowserBookmarks
        if (!syncStatus)
            syncStatus = {}
        
        doAgain:
        serverBookmarks = getBookmarksFromServer
        syncTwoWay(localBookmarks, serverBookmarks, syncStatus)
        storeBookmarksToServer(serverBookmarks)
        -> may throw OptimisticLockError when lastsync changed in the meantime
            -> doAgain
        
        folder adds must be processed first
        then folder changes
        then bookmarks
        then folder moves
        then folder deletes
        only delete folder if empty
        
        syncTwoWay:
        A !B !status:
            insert A in B, insert in status
        !A B !status:
            insert B in A, insert in status
        A !B status:
            A != status.A:
            conflictResolution, update status
            A == status.A:
                delete B in A, delete status
        !A B status:
            B != status.B:
            conflictResolution, update status
            B == status.B:
                delete A in B, delete status
        A B !status:
            conflictResolution, insert in status
        !A !B status:
            delete in status
        A B status:
            A != status.A && B == status.B:
            update B with A, update status
            A == status.A && B != status.B:
            update A with B, update status
            A != status.A && B != status.B:
            conflictResolution, update status
        
        
        */

        /* ------------------------------------------------------------------------------------
        * Public functions
        * ------------------------------------------------------------------------------------ */

        checkBookmarksHaveUniqueIds: function (bookmarks) {
            // Find any bookmark without an id
            var bookmarksHaveIds = true;
            self.Each(bookmarks, function (bookmark) {
                if (_.isUndefined(bookmark.id)) {
                    bookmarksHaveIds = false;
                }
            });

            if (!bookmarksHaveIds) {
                return false;
            }

            // Get all local bookmarks into flat array
            var allBookmarks = [];
            self.Each(bookmarks, function (bookmark) {
                allBookmarks.push(bookmark);
            });

            // Find a bookmark with a duplicate id
            var duplicateIds = _.chain(allBookmarks)
                .countBy('id')
                .find(function (count) {
                    return count > 1;
                }
                )
                .value();

            if (!_.isUndefined(duplicateIds)) {
                return false;
            }

            return true;
        },


        sync_handleBoth: function (syncData) {
            var bookmarks, getBookmarksToSync, lastUpdated, updateLocalBookmarksInfo;

            return platform.LocalStorage.Get([
                globals.CacheKeys.Password,
                globals.CacheKeys.LastUpdated,
                globals.CacheKeys.SyncId
            ])
                .then(function (cachedData) {
                    var password = cachedData[globals.CacheKeys.Password];
                    lastUpdated = cachedData[globals.CacheKeys.LastUpdated];
                    var syncId = cachedData[globals.CacheKeys.SyncId];

                    // Check secret and bookmarks ID are present
                    if (!password || !syncId) {
                        return disableSync()
                            .then(function () {
                                return $q.reject({ code: globals.ErrorCodes.MissingClientData });
                            });
                    }

                    if (syncData.bookmarks) {
                        // Sync with provided bookmarks
                        getBookmarksToSync = $q.resolve(syncData.bookmarks || []);
                    }
                    else {
                        updateLocalBookmarksInfo = {
                            type: syncData.changeInfo.type
                        };
                        getBookmarksToSync = api.GetBookmarks()
                            .then(function (data) {
                                console.log(lastUpdated);
                                console.log(data.lastUpdated);
                                // Check if data is out of sync
                                if (!lastUpdated || lastUpdated !== data.lastUpdated) {
                                    return $q.reject({ code: globals.ErrorCodes.DataOutOfSync });
                                }

                                // Decrypt bookmarks
                                return utility.DecryptData(data.bookmarks);
                            })
                            .then(function (decryptedData) {
                                return JSON.parse(decryptedData);
                            });

                        // Update bookmarks before syncing
                        switch (syncData.changeInfo.type) {
                            // Create bookmark
                            case globals.UpdateType.Create:
                                getBookmarksToSync
                                    .then(function (bookmarksToUpdate) {
                                        // Add new id to new bookmark
                                        var newBookmark = syncData.changeInfo.bookmark;
                                        newBookmark.id = getNewBookmarkId(bookmarksToUpdate);

                                        // Add new bookmark to unfiled container
                                        var otherContainer = getContainer(globals.Bookmarks.OtherContainerName, bookmarksToUpdate, true);
                                        otherContainer.children.push(newBookmark);

                                        // Get path info for updating local bookmarks
                                        updateLocalBookmarksInfo.pathInfo = findBookmarkInTree(newBookmark.id, bookmarksToUpdate);

                                        return bookmarksToUpdate;
                                    });
                                break;
                            // Update bookmark
                            case globals.UpdateType.Update:
                                getBookmarksToSync
                                    .then(function (bookmarksToUpdate) {
                                        // Update bookmark
                                        bookmarksToUpdate = recursiveUpdate(bookmarksToUpdate, syncData.changeInfo.bookmark);

                                        // Get path info for updating local bookmarks
                                        updateLocalBookmarksInfo.pathInfo = findBookmarkInTree(syncData.changeInfo.bookmark.id, bookmarksToUpdate);

                                        return bookmarksToUpdate;
                                    });
                                break;
                            // Delete bookmark
                            case globals.UpdateType.Delete:
                                getBookmarksToSync
                                    .then(function (bookmarksToUpdate) {
                                        // Get path info for updating local bookmarks
                                        updateLocalBookmarksInfo.pathInfo = findBookmarkInTree(syncData.changeInfo.id, bookmarksToUpdate);

                                        // Remove bookmarks containing url parameter
                                        return recursiveDelete(bookmarksToUpdate, syncData.changeInfo.id);
                                    });
                                break;
                            // Ambiguous sync
                            case !syncData.changeInfo:
                            /* falls through */
                            default:
                                getBookmarksToSync = $q.reject({ code: globals.ErrorCodes.AmbiguousSyncRequest });
                                break;
                        }
                    }

                    // Sync bookmarks
                    return getBookmarksToSync;
                })
                .then(function (result) {
                    // Remove empty containers then encrypt
                    bookmarks = removeEmptyContainers(result || []);
                    return utility.EncryptData(JSON.stringify(bookmarks));
                })
                .then(function (encryptedBookmarks) {
                    // Update cached bookmarks
                    return updateCache(bookmarks, encryptedBookmarks)
                        .then(function () {
                            // Sync provided bookmarks and set local bookmarks
                            return $q.all([
                                api.UpdateBookmarks(encryptedBookmarks),
                                isRestore ? refreshLocalBookmarks(bookmarks) : updateLocalBookmarks(updateLocalBookmarksInfo)
                            ]);
                        });
                })
                .then(function (data) {
                    // Update cached last updated date and return decrypted bookmarks
                    return platform.LocalStorage.Set(globals.CacheKeys.LastUpdated, data[0].lastUpdated)
                        .then(function () {
                            return bookmarks;
                        });
                });
        },

        sync_handlePull: function (syncData) {
            var bookmarks, encryptedBookmarks, lastUpdated, syncVersion;

            if (syncData.bookmarks) {
                // Local import, update browser bookmarks
                return refreshLocalBookmarks(syncData.bookmarks);
            }

            return platform.LocalStorage.Get([
                globals.CacheKeys.Password,
                globals.CacheKeys.SyncId
            ])
                .then(function (cachedData) {
                    var password = cachedData[globals.CacheKeys.Password];
                    var syncId = cachedData[globals.CacheKeys.SyncId];

                    // Check secret and bookmarks ID are present
                    if (!password || !syncId) {
                        return disableSync()
                            .then(function () {
                                return $q.reject({ code: globals.ErrorCodes.MissingClientData });
                            });
                    }

                    // Get synced bookmarks
                    return api.GetBookmarks();
                })
                .then(function (data) {
                    encryptedBookmarks = data.bookmarks;
                    lastUpdated = data.lastUpdated;

                    // Decrypt bookmarks
                    return utility.DecryptData(data.bookmarks);
                })
                .then(function (decryptedData) {
                    bookmarks = JSON.parse(decryptedData);

                    // If bookmarks don't have unique ids, add new ids and re-sync
                    var hasUniqueIds = checkBookmarksHaveUniqueIds(bookmarks);
                    if (!hasUniqueIds) {
                        return platform.Bookmarks.AddIds(bookmarks)
                            .then(function (bookmarksWithIds) {
                                // Queue sync for bookmarks with ids
                                queueSync({
                                    bookmarks: bookmarksWithIds,
                                    type: globals.SyncType.Push
                                });

                                return bookmarksWithIds;
                            });
                    }
                    else {
                        // Update cached bookmarks and return
                        return updateCache(bookmarks, encryptedBookmarks);
                    }
                })
                .then(function (bookmarksToSet) {
                    // Update browser bookmarks
                    return refreshLocalBookmarks(bookmarksToSet);
                })
                .then(function () {
                    // Update cached last updated date
                    return platform.LocalStorage.Set(globals.CacheKeys.LastUpdated, lastUpdated);
                })
                .then(function () {
                    // Return decrypted bookmarks
                    return bookmarks;
                });
        },

        sync_handlePush: function (syncData) {
            var bookmarks, getBookmarks;

            return platform.LocalStorage.Get([
                globals.CacheKeys.LastUpdated,
                globals.CacheKeys.Password,
                globals.CacheKeys.SyncEnabled,
                globals.CacheKeys.SyncId
            ])
                .then(function (cachedData) {
                    var lastUpdated = cachedData[globals.CacheKeys.LastUpdated];
                    var password = cachedData[globals.CacheKeys.Password];
                    var syncEnabled = cachedData[globals.CacheKeys.SyncEnabled];
                    var syncId = cachedData[globals.CacheKeys.SyncId];

                    // Check secret and sync ID are present
                    if (!password || !syncId) {
                        return disableSync()
                            .then(function () {
                                return $q.reject({ code: globals.ErrorCodes.MissingClientData });
                            });
                    }

                    if (!syncData.changeInfo) {
                        // New sync, get local bookmarks
                        getBookmarks = platform.Bookmarks.Get();
                    }
                    else {
                        // Check sync is enabled
                        if (!syncEnabled) {
                            return $q.resolve();
                        }

                        // Get synced bookmarks and decrypt
                        getBookmarks = api.GetBookmarks()
                            .then(function (data) {
                                // Check if data is out of sync
                                if (!lastUpdated || lastUpdated !== data.lastUpdated) {
                                    return $q.reject({ code: globals.ErrorCodes.DataOutOfSync });
                                }

                                // Decrypt bookmarks
                                return utility.DecryptData(data.bookmarks);
                            })
                            .then(function (decryptedData) {
                                var bookmarks = JSON.parse(decryptedData);

                                // Handle local updates
                                switch (syncData.changeInfo.type) {
                                    // Create bookmark
                                    case globals.UpdateType.Create:
                                        return platform.Bookmarks.Created(bookmarks, syncData.changeInfo.data)
                                            .then(function (results) {
                                                return results.bookmarks;
                                            });
                                    // Delete bookmark
                                    case globals.UpdateType.Delete:
                                        return platform.Bookmarks.Deleted(bookmarks, syncData.changeInfo.data)
                                            .then(function (results) {
                                                return results.bookmarks;
                                            });
                                    // Update bookmark
                                    case globals.UpdateType.Update:
                                        return platform.Bookmarks.Updated(bookmarks, syncData.changeInfo.data)
                                            .then(function (results) {
                                                return results.bookmarks;
                                            });
                                    // Move bookmark
                                    case globals.UpdateType.Move:
                                        return platform.Bookmarks.Moved(bookmarks, syncData.changeInfo.data)
                                            .then(function (results) {
                                                return results.bookmarks;
                                            });
                                    // Ambiguous sync
                                    default:
                                        return $q.reject({ code: globals.ErrorCodes.AmbiguousSyncRequest });
                                }
                            });
                    }

                    // Push bookmarks
                    return getBookmarks;
                })
                .then(function (result) {
                    // Remove empty containers then encrypt
                    bookmarks = removeEmptyContainers(result || []);
                    return utility.EncryptData(JSON.stringify(bookmarks));
                })
                .then(function (encryptedBookmarks) {
                    // Update cached bookmarks and synced bookmarks
                    return updateCache(bookmarks, encryptedBookmarks)
                        .then(function () {
                            return api.UpdateBookmarks(encryptedBookmarks);
                        });
                })
                .then(function (data) {
                    // Update cached last updated date
                    return platform.LocalStorage.Set(globals.CacheKeys.LastUpdated, data.lastUpdated);
                })
                .then(function () {
                    // Return decrypted bookmarks
                    return bookmarks;
                });
        },

        sync_handleUpgrade: function (syncData) {
            var bookmarks, password, syncId;

            return platform.LocalStorage.Get([
                globals.CacheKeys.Password,
                globals.CacheKeys.SyncId
            ])
                .then(function (cachedData) {
                    password = cachedData[globals.CacheKeys.Password];
                    syncId = cachedData[globals.CacheKeys.SyncId];

                    // Check secret and sync ID are present
                    if (!password || !syncId) {
                        return disableSync()
                            .then(function () {
                                return $q.reject({ code: globals.ErrorCodes.MissingClientData });
                            });
                    }

                    // Get synced bookmarks and decrypt
                    return api.GetBookmarks();
                })
                .then(function (data) {
                    // Decrypt bookmarks
                    return utility.DecryptData(data.bookmarks);
                })
                .then(function (decryptedData) {
                    bookmarks = decryptedData ? JSON.parse(decryptedData) : null;

                    // Upgrade containers to use current container names
                    bookmarks = upgradeContainers(bookmarks || []);

                    // Set the sync version to the current app version
                    return platform.LocalStorage.Set(globals.CacheKeys.SyncVersion, globals.AppVersion);
                })
                .then(function () {
                    // Generate a new password hash from the old clear text password and sync ID
                    return utility.GetPasswordHash(password, syncId);
                })
                .then(function (passwordHash) {
                    // Cache the new password hash and encrypt the data
                    return platform.LocalStorage.Set(globals.CacheKeys.Password, passwordHash);
                })
                .then(function () {
                    return utility.EncryptData(JSON.stringify(bookmarks));
                })
                .then(function (encryptedBookmarks) {
                    // Update cached bookmarks, synced bookmarks and sync version
                    return updateCache(bookmarks, encryptedBookmarks)
                        .then(function () {
                            // Sync provided bookmarks and set local bookmarks
                            return $q.all([
                                api.UpdateBookmarks(encryptedBookmarks, true),
                                refreshLocalBookmarks(bookmarks)
                            ]);
                        });
                })
                .then(function (data) {
                    // Update cached last updated date and return decrypted bookmarks
                    return platform.LocalStorage.Set(globals.CacheKeys.LastUpdated, data[0].lastUpdated);
                })
                .then(function () {
                    return bookmarks;
                });
        },

        updateLocalBookmarks: function (changeInfo) {
            switch (changeInfo.type) {
                // Create new local bookmark
                case globals.UpdateType.Create:
                    return platform.Bookmarks.CreateSingle(changeInfo.pathInfo.result, changeInfo.pathInfo.path);
                // Update existing local bookmark
                case globals.UpdateType.Update:
                    return platform.Bookmarks.UpdateSingle(changeInfo.pathInfo.result, changeInfo.pathInfo.path);
                // Delete existing local bookmark
                case globals.UpdateType.Delete:
                    return platform.Bookmarks.DeleteSingle(changeInfo.pathInfo.path);
                // Ambiguous sync
                case !changeInfo:
                /* falls through */
                default:
                    return $q.reject({ code: globals.ErrorCodes.AmbiguousSyncRequest });
            }
        },

        upgradeContainers: function (bookmarks) {
            // Upgrade containers to use current container names
            var otherContainer = getContainer(globals.Bookmarks.OtherContainerNameOld, bookmarks, true);
            if (otherContainer) {
                otherContainer.title = globals.Bookmarks.OtherContainerName;
            }

            var toolbarContainer = getContainer(globals.Bookmarks.ToolbarContainerNameOld, bookmarks);
            if (toolbarContainer) {
                toolbarContainer.title = globals.Bookmarks.ToolbarContainerName;
            }

            var xbsContainerIndex = bookmarks.findIndex(function (x) {
                return x.title === globals.Bookmarks.UnfiledContainerNameOld;
            });
            if (xbsContainerIndex >= 0) {
                var xbsContainer = bookmarks.splice(xbsContainerIndex, 1)[0];
                xbsContainer.title = 'Legacy xBrowserSync bookmarks';
                otherContainer.children = otherContainer.children || [];
                otherContainer.children.splice(0, 0, xbsContainer);
            }

            // Remove empty containers
            bookmarks = removeEmptyContainers(bookmarks);

            return bookmarks;
        }
    };
    return self;
};
