var xBrowserSync = xBrowserSync || {};
xBrowserSync.App = xBrowserSync.App || {};

/* ------------------------------------------------------------------------------------
 * Class name:  xBrowserSync.App.Controller 
 * Description: Main angular controller class for the app.
 * ------------------------------------------------------------------------------------ */

xBrowserSync.App.Controller = function ($scope, $q, $timeout, complexify, platform, globals, api, utility, bookmarks, platformImplementation) {
    'use strict';
    var vm, moduleName = 'xBrowserSync.App.Controller';

    /* ------------------------------------------------------------------------------------
     * Constructor
     * ------------------------------------------------------------------------------------ */

    var BrowserAction = function () {
        vm = this;
        vm.globals = globals;
        vm.platform = platform;
        vm.utility = utility;
        vm.scope = $scope;

        vm.working = false;

        vm.alert = {
            show: false,
            title: '',
            message: '',
            type: '',
            display: function (title, message, alertType) {
                vm.alert.title = title;
                vm.alert.message = message;
                vm.alert.type = alertType;
                vm.alert.show = true;
            }
        };

        vm.bookmark = {
            active: false,
            current: null,
            currentUrl: null,
            descriptionFieldOriginalHeight: null,
            displayUpdateForm: false,
            originalUrl: null,
            tagText: null,
            urlAsTitle: function (url) {
                return url.replace(/^https?:\/\//i, '');
            }
        };

        vm.device = {
            width: function () { return document.querySelector('body').clientWidth; },
            height: function () { return document.querySelector('body').clientHeight; }
        };

        vm.events = {
            backupRestoreForm_Backup_Click: backupRestoreForm_Backup_Click,
            backupRestoreForm_DisplayRestoreForm_Click: backupRestoreForm_DisplayRestoreForm_Click,
            backupRestoreForm_DisplayRestoreConfirmation_Click: backupRestoreForm_DisplayRestoreConfirmation_Click,
            backupRestoreForm_Restore_Click: backupRestoreForm_Restore_Click,
            backupRestoreForm_SelectBackupFile_Click: backupRestoreForm_SelectBackupFile_Click,
            bookmarkForm_BookmarkDescription_Change: bookmarkForm_BookmarkDescription_Change,
            bookmarkForm_BookmarkTags_Change: bookmarkForm_BookmarkTags_Change,
            bookmarkForm_BookmarkTags_Click: bookmarkForm_BookmarkTags_Click,
            bookmarkForm_BookmarkTags_KeyDown: bookmarkForm_BookmarkTags_KeyDown,
            bookmarkForm_BookmarkUrl_Change: bookmarkForm_BookmarkUrl_Change,
            bookmarkForm_CreateBookmark_Click: bookmarkForm_CreateBookmark_Click,
            bookmarkForm_CreateTags_Click: bookmarkForm_CreateTags_Click,
            bookmarkForm_DeleteBookmark_Click: bookmarkForm_DeleteBookmark_Click,
            bookmarkForm_RemoveTag_Click: bookmarkForm_RemoveTag_Click,
            bookmarkForm_ShareBookmark_Click: platform.Bookmarks.Share,
            bookmarkForm_UpdateBookmark_Click: bookmarkForm_UpdateBookmark_Click,
            bookmarkPanel_Close_Click: bookmarkPanel_Close_Click,
            debugPanel_EnableDebugMode_Click: debugPanel_EnableDebugMode_Click,
            displayQRCode_Click: displayQRCode_Click,
            handleSyncResponse: handleSyncResponse,
            introPanel_ShowHelp_Click: introPanel_ShowHelp_Click,
            introPanel1_Next_Click: introPanel1_Next_Click,
            introPanel2_Next_Click: introPanel2_Next_Click,
            introPanel2_Prev_Click: introPanel2_Prev_Click,
            introPanel3_Next_Click: introPanel3_Next_Click,
            introPanel3_Prev_Click: introPanel3_Prev_Click,
            introPanel4_Next_Click: introPanel4_Next_Click,
            introPanel4_Prev_Click: introPanel4_Prev_Click,
            introPanel5_Next_Click: introPanel5_Next_Click,
            introPanel5_Prev_Click: introPanel5_Prev_Click,
            introPanel6_Next_Click: introPanel6_Next_Click,
            introPanel6_Prev_Click: introPanel6_Prev_Click,
            introPanel7_Next_Click: introPanel7_Next_Click,
            introPanel7_Prev_Click: introPanel7_Prev_Click,
            introPanel8_Next_Click: introPanel8_Next_Click,
            introPanel8_Prev_Click: introPanel8_Prev_Click,
            introPanel9_Next_Click: introPanel9_Next_Click,
            introPanel9_Prev_Click: introPanel9_Prev_Click,
            introPanel10_Next_Click: introPanel10_Next_Click,
            introPanel10_Prev_Click: introPanel10_Prev_Click,
            introPanel11_Next_Click: introPanel11_Next_Click,
            introPanel11_Prev_Click: introPanel11_Prev_Click,
            introPanel12_Prev_Click: introPanel12_Prev_Click,
            openUrl: openUrl,
            queueSync: queueSync,
            searchForm_Clear_Click: searchForm_Clear_Click,
            searchForm_DeleteBookmark_Click: searchForm_DeleteBookmark_Click,
            searchForm_ScanCode_Click: searchForm_ScanCode_Click,
            searchForm_SearchText_Autocomplete: searchForm_SearchText_Autocomplete,
            searchForm_SearchText_Change: searchForm_SearchText_Change,
            searchForm_SearchText_KeyDown: searchForm_SearchText_KeyDown,
            searchForm_SearchResult_KeyDown: searchForm_SearchResult_KeyDown,
            searchForm_SearchResults_Scroll: searchForm_SearchResults_Scroll,
            searchForm_SelectBookmark_Press: searchForm_SelectBookmark_Press,
            searchForm_ShareBookmark_Click: platform.Bookmarks.Share,
            searchForm_UpdateBookmark_Click: searchForm_UpdateBookmark_Click,
            syncPanel_SyncBookmarksToolbar_Click: syncPanel_SyncBookmarksToolbar_Click,
            syncPanel_SyncBookmarksToolbar_Confirm: syncPanel_SyncBookmarksToolbar_Confirm,
            syncForm_CancelSyncConfirmation_Click: syncForm_CancelSyncConfirmation_Click,
            syncForm_Password_Change: syncForm_Password_Change,
            syncForm_ConfirmPassword_Click: syncForm_ConfirmPassword_Click,
            syncForm_ConfirmSync_Click: startSyncing,
            syncForm_DisableSync_Click: syncForm_DisableSync_Click,
            syncForm_EnableSync_Click: syncForm_EnableSync_Click,
            syncForm_ExistingSync_Click: syncForm_ExistingSync_Click,
            syncForm_NewSync_Click: syncForm_NewSync_Click,
            syncForm_Submit_Click: syncForm_Submit_Click,
            syncForm_UpgradeSync_Click: syncForm_UpgradeSync_Click,
            syncPanel_DisplayDataUsage_Click: displayDataUsage,
            syncPanel_DisplaySyncOptions_Click: syncPanel_DisplaySyncOptions_Click,
            searchForm_ToggleBookmark_Click: searchForm_ToggleBookmark_Click,
            updatedPanel_ReleaseNotes_Click: updatedPanel_ReleaseNotes_Click,
            updateServiceUrlForm_Cancel_Click: updateServiceUrlForm_Cancel_Click,
            updateServiceUrlForm_Confirm_Click: updateServiceUrlForm_Confirm_Click,
            updateServiceUrlForm_Display_Click: updateServiceUrlForm_Display_Click,
            updateServiceUrlForm_NewServiceUrl_Change: updateServiceUrlForm_NewServiceUrl_Change,
            updateServiceUrlForm_Update_Click: updateServiceUrlForm_Update_Click
        };

        vm.introduction = {
            displayIntro: false,
            displayPanel: function (panelToDisplay) {
                if (!panelToDisplay || panelToDisplay > vm.introduction.currentPanel) {
                    var panels = document.querySelectorAll('.intro-panel > div');

                    for (var i = 0; i < panels.length; i++) {
                        panels[i].classList.remove('reverse');
                    }
                }
                else if (panelToDisplay < vm.introduction.currentPanel) {
                    document.querySelector('#intro-panel-' + vm.introduction.currentPanel).classList.add('reverse');
                    document.querySelector('#intro-panel-' + panelToDisplay).classList.add('reverse');
                }

                vm.introduction.showLogo = (!panelToDisplay) ? true : false;
                vm.introduction.currentPanel = (!panelToDisplay) ? 0 : panelToDisplay;
            },
            showLogo: true,
            currentPanel: 0
        };

        vm.platformName = null;

        vm.search = {
            batchResultsNum: 10,
            cancelGetBookmarksRequest: null,
            displayDefaultState: displayDefaultSearchState,
            execute: searchBookmarks,
            getLookaheadTimeout: null,
            getSearchLookaheadTimeout: null,
            getSearchResultsTimeout: null,
            lastWord: null,
            lookahead: null,
            query: null,
            results: null,
            resultsDisplayed: 10,
            selectedBookmark: null,
            scrollDisplayMoreEnabled: true
        };

        vm.settings = {
            backupCompletedMessage: null,
            backupFileName: null,
            debugMode: false,
            dataToRestore: null,
            dataToRestoreIsValid: function () {
                return checkRestoreData(vm.settings.dataToRestore);
            },
            displayCancelSyncConfirmation: false,
            displayNewSyncPanel: true,
            displayQRCode: false,
            displayRestoreConfirmation: false,
            displayRestoreForm: false,
            displaySyncBookmarksToolbarConfirmation: false,
            displaySyncOptions: true,
            displayUpdateServiceUrlConfirmation: false,
            displayUpdateServiceUrlForm: false,
            fileRestoreEnabled: false,
            getSearchLookaheadDelay: 50,
            getSearchResultsDelay: 250,
            iCloudNotAvailable: false,
            messageLog: [],
            restoreCompletedMessage: null,
            service: {
                apiVersion: '',
                maxSyncSize: 0,
                newServiceUrl: '',
                status: null,
                statusMessage: '',
                url: null
            },
            syncBookmarksToolbar: true,
            syncDataSize: null,
            syncDataUsed: null
        };

        vm.sync = {
            asyncChannel: undefined,
            displayPasswordConfirmation: false,
            displaySyncConfirmation: false,
            displayUpgradeConfirmation: false,
            enabled: false,
            id: null,
            inProgress: false,
            secret: null,
            secretComplexity: {},
            secretConfirmation: null,
            upgradeConfirmed: false
        };

        vm.view = {
            current: 0,
            change: changeView,
            displayMainView: displayMainView,
            views: { login: 0, search: 1, bookmark: 2, settings: 3, updated: 4 }
        };

        // Initialise the app
        init();
    };


    /* ------------------------------------------------------------------------------------
     * Private functions
     * ------------------------------------------------------------------------------------ */

    var backupRestoreForm_Backup_Click = function () {
        // Display loading overlay
        platform.Interface.Loading.Show();

        platform.BackupData()
            .catch(function (err) {
                // Display alert
                var errMessage = utility.GetErrorMessageFromException(err);
                vm.alert.display(errMessage.title, errMessage.message, 'danger');
            })
            .finally(function () {
                $timeout(function () {
                    platform.Interface.Loading.Hide();

                    // Focus on done button
                    if (!utility.IsMobilePlatform(vm.platformName)) {
                        document.querySelector('.btn-done').focus();
                    }
                });
            });
    };

    var backupRestoreForm_DisplayRestoreForm_Click = function () {
        // Display restore form
        vm.settings.backupFileName = null;
        vm.settings.restoreCompletedMessage = null;
        vm.settings.displayRestoreConfirmation = false;
        vm.settings.dataToRestore = '';
        vm.settings.displayRestoreForm = true;
        document.querySelector('#backupFile').value = null;

        // Focus in restore textarea
        $timeout(function () {
            document.querySelector('#restoreForm textarea').select();
        });
    };

    var backupRestoreForm_DisplayRestoreConfirmation_Click = function () {
        // Display restore confirmation 
        vm.settings.displayRestoreForm = false;
        vm.settings.displayRestoreConfirmation = true;

        // Focus on confirm button
        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('.btn-confirm-restore').focus();
            });
        }
    };

    var backupRestoreForm_Restore_Click = function () {
        if (!vm.settings.dataToRestore) {
            // Display alert
            vm.alert.display(
                platform.GetConstant(globals.Constants.Error_NoDataToRestore_Title),
                platform.GetConstant(globals.Constants.Error_NoDataToRestore_Message),
                'danger');

            return;
        }

        // Start restore
        restoreData(JSON.parse(vm.settings.dataToRestore));
    };

    var backupRestoreForm_SelectBackupFile_Click = function () {
        platform.SelectFile();
    };

    var bookmarkForm_BookmarkDescription_Change = function () {
        // Limit the bookmark description to the max length
        $timeout(function () {
            vm.bookmark.current.description = utility.TrimToNearestWord(vm.bookmark.current.description, globals.Bookmarks.DescriptionMaxLength);
        });
    };

    var bookmarkForm_BookmarkTags_Change = function () {
        vm.alert.show = false;
        vm.bookmark.tagLookahead = null;

        if (!vm.bookmark.tagText || !vm.bookmark.tagText.trim()) {
            return;
        }

        // Get last word of tag text
        var matches = vm.bookmark.tagText.match(/[^,]+$/);
        var lastWord = matches ? matches[0].trimLeft() : null;

        // Display lookahead if word length exceeds minimum
        if (lastWord && lastWord.length > globals.LookaheadMinChars) {
            // Get tags lookahead
            bookmarks.GetLookahead(lastWord.toLowerCase(), null, null, true, vm.bookmark.current.tags)
                .then(function (results) {
                    if (!results) {
                        return;
                    }

                    var lookahead = results[0];
                    var word = results[1];

                    // Display lookahead
                    if (lookahead && word.toLowerCase() === lastWord.toLowerCase()) {
                        // Trim word from lookahead
                        lookahead = lookahead ? lookahead.substring(word.length) : null;
                        vm.bookmark.tagLookahead = lookahead.replace(/\s/g, '&nbsp;');
                        vm.bookmark.tagTextMeasure = vm.bookmark.tagText.replace(/\s/g, '&nbsp;');
                        vm.bookmark.tagLookahead = null;

                        // Set position of lookahead element
                        $timeout(function () {
                            var lookaheadElement = document.querySelector('#bookmark-panel .lookahead-container .lookahead');
                            var measureElement = document.querySelector('#bookmark-panel .lookahead-container .measure');
                            lookaheadElement.style.left = (measureElement.offsetLeft + measureElement.offsetWidth) + 'px';
                            vm.bookmark.tagLookahead = lookahead.replace(/\s/g, '&nbsp;');
                        });
                    }
                });
        }
    };

    var bookmarkForm_BookmarkTags_Click = function () {
        vm.bookmark.tagText += vm.bookmark.tagLookahead.replace(/&nbsp;/g, ' ');
        bookmarkForm_CreateTags_Click();
        if (!utility.IsMobilePlatform(vm.platformName)) {
            document.querySelector('input[name="bookmarkTags"]').focus();
        }
    };

    var bookmarkForm_BookmarkTags_KeyDown = function (event) {
        switch (true) {
            // If user pressed Enter
            case (event.keyCode === 13):
                // Add new tags
                event.preventDefault();
                bookmarkForm_CreateTags_Click();
                break;
            // If user pressed tab or right arrow key and lookahead present
            case ((event.keyCode === 9 || event.keyCode === 39) && vm.bookmark.tagLookahead):
                // Add lookahead to search query
                event.preventDefault();
                vm.bookmark.tagText += vm.bookmark.tagLookahead.replace(/&nbsp;/g, ' ');
                bookmarkForm_BookmarkTags_Change();
                if (!utility.IsMobilePlatform(vm.platformName)) {
                    document.querySelector('input[name="bookmarkTags"]').focus();
                }
                break;
        }
    };

    var bookmarkForm_BookmarkUrl_Change = function () {
        // Reset form if field is invalid
        if (vm.bookmarkForm.bookmarkUrl.$invalid) {
            vm.bookmarkForm.bookmarkUrl.$setValidity('Exists', true);
        }
    };

    var bookmarkForm_CreateBookmark_Click = function () {
        // Add tags if tag text present
        if (vm.bookmark.tagText && vm.bookmark.tagText.length > 0) {
            bookmarkForm_CreateTags_Click();
        }

        // Clone current bookmark object
        var bookmarkToCreate = utility.DeepCopy(vm.bookmark.current);

        // Check for protocol
        if (!globals.URL.ProtocolRegex.test(bookmarkToCreate.url)) {
            bookmarkToCreate.url = 'http://' + bookmarkToCreate.url;
        }

        // Validate the new bookmark
        bookmarkForm_ValidateBookmark(bookmarkToCreate)
            .then(function (isValid) {
                if (!isValid) {
                    // Bookmark URL exists, display validation error
                    vm.bookmarkForm.bookmarkUrl.$setValidity('Exists', false);
                    return;
                }

                // Sync changes
                platform.Sync(vm.sync.asyncChannel, {
                    type: globals.SyncType.Both,
                    changeInfo: {
                        type: globals.UpdateType.Create,
                        bookmark: bookmarkToCreate
                    }
                });

                // Set bookmark active status if current bookmark is current page
                platform.GetCurrentUrl()
                    .then(function (currentUrl) {
                        vm.bookmark.active = currentUrl && currentUrl.toUpperCase() === bookmarkToCreate.url.toUpperCase();

                        changeView(vm.view.views.search)
                            .then(function () {
                                // Add new bookmark into search results on mobile apps
                                if (utility.IsMobilePlatform(vm.platformName)) {
                                    var bookmarkToCreateClone = JSON.parse(JSON.stringify(bookmarkToCreate));
                                    bookmarkToCreateClone.id = bookmarks.GetNewBookmarkId(vm.search.results);
                                    bookmarkToCreateClone.class = 'added';
                                    $timeout(function () {
                                        // Add bookmark to results
                                        vm.search.results.unshift(bookmarkToCreateClone);

                                        $timeout(function () {
                                            // Remove animation class
                                            delete bookmarkToCreateClone.class;
                                        }, 500);
                                    }, 300);
                                }
                            });
                    });
            });
    };

    var bookmarkForm_CreateTags_Click = function () {
        // Clean and sort tags and add them to tag array
        var newTags = utility.GetTagArrayFromText(vm.bookmark.tagText);
        vm.bookmark.current.tags = _.sortBy(_.union(newTags, vm.bookmark.current.tags), function (tag) {
            return tag;
        });

        vm.bookmarkForm.$setDirty();
        vm.bookmark.tagText = '';
        vm.bookmark.tagLookahead = '';
        if (!utility.IsMobilePlatform(vm.platformName)) {
            document.querySelector('input[name="bookmarkTags"]').focus();
        }
    };

    var bookmarkForm_DeleteBookmark_Click = function () {
        var bookmarkToDelete = vm.bookmark.current;

        // Sync changes
        platform.Sync(vm.sync.asyncChannel, {
            type: globals.SyncType.Both,
            changeInfo: {
                type: globals.UpdateType.Delete,
                id: bookmarkToDelete.id
            }
        });

        // Set bookmark active status if current bookmark is current page
        platform.GetCurrentUrl()
            .then(function (currentUrl) {
                if (currentUrl && currentUrl.toUpperCase() === vm.bookmark.originalUrl.toUpperCase()) {
                    vm.bookmark.active = false;
                }

                // Display the search panel
                return changeView(vm.view.views.search);
            })
            .then(function () {
                // Find and delete the deleted bookmark element in the search results on mobile apps
                if (utility.IsMobilePlatform(vm.platformName)) {
                    if (vm.search.results && vm.search.results.length >= 0) {
                        var deletedBookmarkIndex = _.findIndex(vm.search.results, function (result) {
                            return result.id === bookmarkToDelete.id;
                        });

                        if (deletedBookmarkIndex >= 0) {
                            vm.search.results[deletedBookmarkIndex].class = 'deleted';
                            $timeout(function () {
                                // Remove bookmark from results
                                vm.search.results.splice(deletedBookmarkIndex, 1);
                            }, 500);
                        }
                    }
                }
            })
            .catch(function (err) {
                // Display alert
                var errMessage = utility.GetErrorMessageFromException(err);
                vm.alert.display(errMessage.title, errMessage.message, 'danger');
            });
    };

    var bookmarkForm_Init = function () {
        // If form properties already set, return 
        if (vm.bookmark.current) {
            vm.bookmark.displayUpdateForm = true;
            return $q.resolve();
        }

        var deferred = $q.defer(), loadMetadataDeferred = $q.defer(), timeout;

        // Check if current url is a bookmark
        bookmarks.IncludesCurrentPage()
            .then(function (result) {
                if (result) {
                    // Remove search score and set current bookmark to result
                    delete result.score;
                    vm.bookmark.current = result;

                    // Display update bookmark form and return
                    vm.bookmark.displayUpdateForm = true;
                    return deferred.resolve();
                }
                else {
                    // Otherwise display loading overlay and get page metadata for current url
                    timeout = platform.Interface.Loading.Show('retrievingMetadata', loadMetadataDeferred);
                    return platform.GetPageMetadata(loadMetadataDeferred)
                        .then(function (metadata) {
                            // Display add bookmark form
                            vm.bookmark.displayUpdateForm = false;

                            // Set current bookmark properties
                            var bookmark = new bookmarks.XBookmark(
                                null,
                                metadata.url,
                                null,
                                null);
                            vm.bookmark.current = bookmark;

                            if (metadata) {
                                // Set form properties to url metadata
                                bookmark.title = metadata.title;
                                bookmark.description = utility.TrimToNearestWord(metadata.description, globals.Bookmarks.DescriptionMaxLength);
                                bookmark.tags = utility.GetTagArrayFromText(metadata.tags);
                            }

                            return deferred.resolve();
                        });
                }
            })
            .catch(function (err) {
                // Set bookmark url
                if (err && err.url) {
                    var bookmark = new bookmarks.XBookmark(
                        '',
                        err.url);
                    vm.bookmark.current = bookmark;
                }

                // Display alert
                var errMessage = utility.GetErrorMessageFromException(err);
                vm.alert.display(errMessage.title, errMessage.message, 'danger');

                return deferred.resolve();
            })
            .finally(function () {
                platform.Interface.Loading.Hide('retrievingMetadata', timeout);
            });

        return deferred.promise;
    };

    var bookmarkForm_RemoveTag_Click = function (tag) {
        vm.bookmark.current.tags = _.without(vm.bookmark.current.tags, tag);
        vm.bookmarkForm.$setDirty();
        if (!utility.IsMobilePlatform(vm.platformName)) {
            document.querySelector('#bookmarkForm input[name="bookmarkTags"]').focus();
        }
    };

    var bookmarkForm_UpdateBookmark_Click = function () {
        // Add tags if tag text present
        if (vm.bookmark.tagText && vm.bookmark.tagText.length > 0) {
            bookmarkForm_CreateTags_Click();
        }

        // Clone current bookmark object
        var bookmarkToUpdate = utility.DeepCopy(vm.bookmark.current);

        // Check for protocol
        if (!globals.URL.ProtocolRegex.test(bookmarkToUpdate.url)) {
            bookmarkToUpdate.url = 'http://' + bookmarkToUpdate.url;
        }

        // Validate the new bookmark
        bookmarkForm_ValidateBookmark(bookmarkToUpdate, vm.bookmark.originalUrl)
            .then(function (isValid) {
                if (!isValid) {
                    // Bookmark URL exists, display validation error
                    vm.bookmarkForm.bookmarkUrl.$setValidity('Exists', false);
                    return;
                }

                // Sync changes
                platform.Sync(vm.sync.asyncChannel, {
                    type: globals.SyncType.Both,
                    changeInfo: {
                        type: globals.UpdateType.Update,
                        bookmark: bookmarkToUpdate
                    }
                });

                // Set bookmark active status if current bookmark is current page
                platform.GetCurrentUrl()
                    .then(function (currentUrl) {
                        if (currentUrl && currentUrl.toUpperCase() === vm.bookmark.originalUrl.toUpperCase()) {
                            vm.bookmark.active = currentUrl && currentUrl.toUpperCase() === bookmarkToUpdate.url.toUpperCase();
                        }

                        // Display the search panel
                        return changeView(vm.view.views.search);
                    })
                    .then(function () {
                        // Find and update the updated bookmark element in the search results on mobile apps
                        if (utility.IsMobilePlatform(vm.platformName)) {
                            if (vm.search.results && vm.search.results.length >= 0) {
                                var updatedBookmarkIndex = _.findIndex(vm.search.results, function (result) {
                                    return result.id === bookmarkToUpdate.id;
                                });

                                if (updatedBookmarkIndex >= 0) {
                                    $timeout(function () {
                                        vm.search.results[updatedBookmarkIndex] = bookmarkToUpdate;
                                    }, 500);
                                }
                            }
                        }
                    })
                    .catch(function (err) {
                        // Display alert
                        var errMessage = utility.GetErrorMessageFromException(err);
                        vm.alert.display(errMessage.title, errMessage.message, 'danger');
                    });
            });
    };

    var bookmarkForm_ValidateBookmark = function (bookmarkToValidate, originalUrl) {
        // Skip validation if URL is unmodified
        if (originalUrl && bookmarkToValidate.url.toUpperCase() === originalUrl.toUpperCase()) {
            return $q.resolve(true);
        }

        // Check if bookmark url already exists
        return bookmarks.Search({
            url: bookmarkToValidate.url
        })
            .then(function (results) {
                return results.length === 0;
            });
    };

    var bookmarkPanel_Close_Click = function () {
        vm.view.displayMainView();
    };

    var debugPanel_EnableDebugMode_Click = function () {
        var debugModeEnabled = !vm.settings.debugMode;
        vm.settings.debugMode = debugModeEnabled;
        vm.settings.messageLog = [];

        return $q.all([
            platform.LocalStorage.Set(globals.CacheKeys.DebugMessageLog),
            platform.LocalStorage.Set(globals.CacheKeys.DebugMode, debugModeEnabled)
        ]);
    };

    var changeView = function (view) {
        var deferred = $q.defer();

        // Get cached sync data
        platform.LocalStorage.Get([
            globals.CacheKeys.DebugMode,
            globals.CacheKeys.DisplayIntro,
            globals.CacheKeys.SyncEnabled,
            globals.CacheKeys.SyncId
        ])
            .then(function (cachedData) {
                var debugMode = cachedData[globals.CacheKeys.DebugMode];
                var displayIntro = cachedData[globals.CacheKeys.DisplayIntro];
                var syncEnabled = cachedData[globals.CacheKeys.SyncEnabled];
                var syncId = cachedData[globals.CacheKeys.SyncId];
                
                vm.alert.show = false;
                vm.introduction.displayIntro = !!displayIntro;                
                vm.settings.debugMode = !!debugMode;
                vm.settings.displaySyncOptions = !syncEnabled;
                vm.sync.id = syncId;
                vm.sync.enabled = !!syncEnabled;

                // Hide loading panel
                platform.Interface.Loading.Hide();

                // Reset current view
                switch (vm.view.current) {
                    case vm.view.views.bookmark:
                        vm.bookmark.current = null;
                        vm.bookmark.tagText = null;
                        vm.bookmark.tagTextMeasure = null;
                        vm.bookmark.tagLookahead = null;
                        vm.bookmark.displayUpdateForm = false;
                        break;
                    case vm.view.views.search:
                        vm.search.lookahead = null;
                        vm.search.selectedBookmark = null;
                        vm.search.query = null;
                        vm.search.queryMeasure = null;

                        // Clear search results for non-mobile platforms, otherwise refresh search
                        if (!utility.IsMobilePlatform(vm.platformName)) {
                            vm.search.results = null;
                        }
                        else {
                            $timeout(vm.search.execute);
                        }
                        break;
                    case vm.view.views.settings:
                        vm.settings.displayCancelSyncConfirmation = false;
                        vm.settings.displayQRCode = false;
                        vm.settings.displayRestoreConfirmation = false;
                        vm.settings.displayRestoreForm = false;
                        vm.settings.displaySyncBookmarksToolbarConfirmation = false;
                        vm.settings.displayUpdateServiceUrlConfirmation = false;
                        vm.settings.displayUpdateServiceUrlForm = false;
                        document.querySelector('#backupFile').value = null;
                        vm.settings.backupFileName = null;
                        vm.settings.backupCompletedMessage = null;
                        vm.settings.restoreCompletedMessage = null;
                        vm.settings.dataToRestore = '';
                        break;
                    case vm.view.views.login:
                        vm.sync.displayPasswordConfirmation = false;
                        vm.sync.displaySyncConfirmation = false;
                        vm.sync.displayUpgradeConfirmation = false;
                        vm.sync.secret = null;
                        vm.sync.secretComplexity = {};
                        vm.sync.secretConfirmation = null;
                        vm.sync.upgradeConfirmed = false;
                        if (vm.syncForm) {
                            vm.syncForm.$setPristine();
                            vm.syncForm.$setUntouched();
                        }
                        break;
                    case vm.view.views.updated:
                        platform.LocalStorage.Set(globals.CacheKeys.DisplayUpdated, false);
                        break;
                }

                vm.view.current = view;

                // Initialise new view
                switch (view) {
                    case vm.view.views.login:
                        // If not on a mobile platform, display new sync panel depending on if ID is set
                        vm.settings.displayNewSyncPanel = utility.IsMobilePlatform(vm.platformName) ? false : !syncId;

                        // Focus on first input field
                        if (!utility.IsMobilePlatform(vm.platformName)) {
                            $timeout(function () {
                                var inputField;
                                if (vm.settings.displayNewSyncPanel) {
                                    inputField = document.querySelector('.login-form-new input[name="txtPassword"]');
                                    if (inputField) {
                                        inputField.focus();
                                    }
                                }
                                else {
                                    // Focus on password field if id already set
                                    inputField = syncId ?
                                        document.querySelector('.login-form-existing input[name="txtPassword"]') :
                                        document.querySelector('input[name="txtId"]');
                                    if (inputField) {
                                        inputField.focus();
                                    }
                                }
                            });
                        }

                        // Check whether to display intro animation
                        if (!displayIntro) {
                            vm.introduction.displayPanel();
                        }

                        deferred.resolve(view);
                        break;
                    case vm.view.views.search:
                        $timeout(function () {
                            // Focus on search box
                            if (!utility.IsMobilePlatform(vm.platformName)) {
                                document.querySelector('input[name=txtSearch]').focus();
                            }
                            deferred.resolve(view);
                        }, 100);
                        break;
                    case vm.view.views.bookmark:
                        // Set bookmark form properties
                        bookmarkForm_Init()
                            .then(function () {
                                // Save url to compare for changes
                                vm.bookmark.originalUrl = vm.bookmark.current.url;

                                $timeout(function () {
                                    // Don't focus on title field for mobile apps unless not sharing a bookmark
                                    if ((!utility.IsMobilePlatform(vm.platformName)) ||
                                        vm.bookmark.current.url === 'http://') {
                                        document.querySelector('input[name="bookmarkTitle"]').focus();
                                    }
                                    deferred.resolve(view);
                                }, 100);
                            });
                        break;
                    case vm.view.views.settings:
                        vm.settings.service.status = null;

                        // Get current service url and sync bookmarks toolbar setting from cache
                        $q.all([
                            bookmarks.GetSyncBookmarksToolbar(),
                            platform.LocalStorage.Get(globals.CacheKeys.DebugMessageLog),
                            utility.GetServiceUrl(),
                        ])
                            .then(function (cachedData) {
                                var syncBookmarksToolbar = cachedData[0];
                                var debugMessageLog = cachedData[1];
                                var serviceUrl = cachedData[2];

                                vm.settings.messageLog = debugMessageLog;
                                vm.settings.service.url = serviceUrl;
                                vm.settings.service.newServiceUrl = serviceUrl;
                                vm.settings.syncBookmarksToolbar = syncBookmarksToolbar;

                                // Get service status and display service info
                                api.CheckServiceStatus()
                                    .then(function (serviceInfo) {
                                        setServiceInformation(serviceInfo);
                                        displayDataUsage();
                                    })
                                    .catch(function (err) {
                                        if (err && err.code === globals.ErrorCodes.ApiOffline) {
                                            vm.settings.service.status = globals.ServiceStatus.Offline;
                                        }
                                        else {
                                            vm.settings.service.status = globals.ServiceStatus.Error;
                                        }
                                    })
                                    .finally(function () {
                                        deferred.resolve(view);
                                    });
                            });
                        break;
                    case vm.view.views.updated:
                        $timeout(function () {
                            // Focus on release notes button
                            if (!utility.IsMobilePlatform(vm.platformName)) {
                                document.querySelector('#releaseNotesBtn').focus();
                            }
                            deferred.resolve(view);
                        }, 100);
                        break;
                    default:
                        deferred.resolve(view);
                        break;
                }

                // Attach events to new tab links
                $timeout(setNewTabLinks);
            });

        return deferred.promise;
    };

    var checkRestoreData = function (data) {
        var validData = false;

        if (data) {
            try {
                data = JSON.parse(data);

                if (data.xBrowserSync && data.xBrowserSync.bookmarks) {
                    validData = true;
                }
            }
            catch (err) { }
        }

        return validData;
    };

    var displayDataUsage = function () {
        vm.settings.syncDataSize = null;
        vm.settings.syncDataUsed = null;

        platform.LocalStorage.Get(globals.CacheKeys.SyncEnabled)
            .then(function (syncEnabled) {
                // Return if not synced
                if (!syncEnabled) {
                    return;
                }

                // Get  bookmarks sync size and calculate sync data percentage used
                bookmarks.SyncSize()
                    .then(function (bookmarksSyncSize) {
                        vm.settings.syncDataSize = bookmarksSyncSize / 1024;
                        vm.settings.syncDataUsed = (vm.settings.syncDataSize / vm.settings.service.maxSyncSize) * 100;
                    })
                    .catch(function (err) {
                        // Display alert
                        var errMessage = utility.GetErrorMessageFromException(err);
                        vm.alert.display(errMessage.title, errMessage.message, 'danger');
                    });
            });
    };

    var displayDefaultSearchState = function () {
        // Clear search and results
        vm.search.query = null;
        vm.search.queryMeasure = null;
        vm.search.lookahead = null;
        vm.search.results = null;

        // Focus on search box
        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('input[name=txtSearch]').focus();
            }, 100);
        }
    };

    var displayMainView = function () {
        return platform.LocalStorage.Get(globals.CacheKeys.SyncEnabled)
            .then(function (syncEnabled) {
                if (syncEnabled) {
                    return changeView(vm.view.views.search);
                }
                else {
                    return changeView(vm.view.views.login);
                }
            });
    };

    var displayQRCode_Click = function () {
        // Generate new QR code
        new QRious({
            element: document.getElementById('qr'),
            value: vm.sync.id
        });

        vm.settings.displayQRCode = true;
    };

    var handleSyncResponse = function (response) {
        return platform.LocalStorage.Get([
			globals.CacheKeys.Password,
			globals.CacheKeys.SyncEnabled,
			globals.CacheKeys.SyncId
        ])
            .then(function (cachedData) {
                vm.sync.secret = cachedData[globals.CacheKeys.Password];
                vm.sync.enabled = cachedData[globals.CacheKeys.SyncEnabled];
                vm.sync.id = cachedData[globals.CacheKeys.SyncId];

                var errMessage;

                switch (response.command) {
                    // After syncing bookmarks
                    case globals.Commands.SyncBookmarks:
                        // Hide loading panel
                        platform.Interface.Loading.Hide();
        
                        if (response.success) {
                            // Refresh interface/icon
                            $timeout(platform.Interface.Refresh);
        
                            // Disable the intro animation
                            vm.introduction.displayIntro = false;
                            platform.LocalStorage.Set(globals.CacheKeys.DisplayIntro, false)
                                .then(function () {
                                    // If initial sync, switch to search panel
                                    if (vm.view.current === vm.view.views.login) {
                                        vm.search.results = null;
                                        return changeView(vm.view.views.search);
                                    }
                                })
                                .then(function () {
                                    vm.search.displayDefaultState();
                                });
        
                            // Updated cached decrypted bookmarks
                            bookmarks.UpdateCache(response.bookmarks);
        
                            // Update bookmark icon
                            setBookmarkStatus();
                        }
                        else {
                            // Disable upgrade confirmed flag
                            vm.sync.upgradeConfirmed = false;
        
                            // If ID was removed disable sync and display login panel
                            if (response.error && response.error.code === globals.ErrorCodes.IdRemoved) {
                                changeView(vm.view.views.login)
                                    .finally(function () {
                                        errMessage = utility.GetErrorMessageFromException(response.error);
                                        vm.alert.display(errMessage.title, errMessage.message, 'danger');
                                    });
                            }
                            else {
                                errMessage = utility.GetErrorMessageFromException(response.error);
                                vm.alert.display(errMessage.title, errMessage.message, 'danger');
        
                                // If data out of sync, refresh sync
                                if (response.error && response.error.code === globals.ErrorCodes.DataOutOfSync) {
                                    platform.Sync(vm.sync.asyncChannel, { type: globals.SyncType.Pull });
                                }
                            }
                        }
                        break;
                    // After restoring bookmarks
                    case globals.Commands.RestoreBookmarks:
                        if (response.success) {
                            // Refresh data usage
                            displayDataUsage();
        
                            // Update current bookmark status
                            setBookmarkStatus();
        
                            // Updated cached decrypted bookmarks
                            bookmarks.UpdateCache(response.bookmarks);
        
                            vm.settings.displayRestoreForm = false;
                            vm.settings.displayRestoreConfirmation = false;
                            vm.settings.dataToRestore = '';
                            vm.settings.restoreCompletedMessage = platform.GetConstant(globals.Constants.Settings_BackupRestore_RestoreSuccess_Message);
        
                            if (!utility.IsMobilePlatform(vm.platformName)) {
                                $timeout(function () {
                                    document.querySelector('.btn-done').focus();
                                });
                            }
                            else {
                                // Refresh search results
                                vm.search.query = null;
                                vm.search.queryMeasure = null;
                                vm.search.lookahead = null;
                                vm.search.execute();
                            }
                        }
                        else {
                            errMessage = utility.GetErrorMessageFromException(response.error);
                            vm.alert.display(errMessage.title, errMessage.message, 'danger');
                        }
        
                        platform.Interface.Loading.Hide();
                        break;
                    case globals.Commands.NoCallback:
                    /* falls through */
                    default:
                        if (!response.success) {
                            errMessage = utility.GetErrorMessageFromException(response.error);
                            vm.alert.display(errMessage.title, errMessage.message, 'danger');
                        }
        
                        platform.Interface.Loading.Hide();
                        break;
                }
            });
    };

    var init = function () {
        var displayUpdated, syncEnabled, syncId;
        // Platform-specific initation
        return platform.Init(vm)
            .then(function () {
                // Reset network disconnected flag
                return platform.LocalStorage.Set(globals.CacheKeys.NetworkDisconnected, false);
            })
            .then(function () {
                // Get cached data
                return platform.LocalStorage.Get([
                    globals.CacheKeys.DisplayUpdated,
                    globals.CacheKeys.SyncEnabled,
                    globals.CacheKeys.SyncId
                ]);
            })
            .then(function (cachedData) {
                displayUpdated = cachedData[globals.CacheKeys.DisplayUpdated];
                syncEnabled = cachedData[globals.CacheKeys.SyncEnabled];
                syncId = cachedData[globals.CacheKeys.SyncId];

                // Set initial view based on if sync is curretly enabled
                return changeView(syncEnabled ? vm.view.views.search : vm.view.views.login);
            })
            .then(function () {
                // Display new sync panel depending on if ID is set
                if (vm.view.current === vm.view.views.login) {
                    vm.settings.displayNewSyncPanel = !syncId;
                }

                // Display updated panel if flag set
                if (displayUpdated) {
                    changeView(vm.view.views.updated);
                }

                // Set intro animation visibility
                if (vm.view.current === vm.view.views.login && vm.introduction.displayIntro) {
                    introPanel_DisplayIntro();
                }

                // Check if current page is a bookmark
                setBookmarkStatus();
            });
    };

    var introPanel_DisplayIntro = function () {
        vm.introduction.showLogo = false;

        $timeout(function () {
            vm.introduction.showLogo = true;

            $timeout(function () {
                vm.introduction.showLogo = false;

                $timeout(function () {
                    vm.introduction.displayPanel(1);
                }, 1000);
            }, 3000);
        }, 1000);
    };

    var introPanel_ShowHelp_Click = function () {
        vm.introduction.showLogo = false;

        $timeout(function () {
            vm.introduction.displayPanel(1);
        }, 500);
    };

    var introPanel1_Next_Click = function () {
        vm.introduction.displayPanel(2);
    };

    var introPanel2_Next_Click = function () {
        vm.introduction.displayPanel(3);
    };

    var introPanel2_Prev_Click = function () {
        vm.introduction.displayPanel(1);
    };

    var introPanel3_Next_Click = function () {
        vm.introduction.displayPanel(4);
    };

    var introPanel3_Prev_Click = function () {
        vm.introduction.displayPanel(2);
    };

    var introPanel4_Next_Click = function () {
        vm.introduction.displayPanel(5);
    };

    var introPanel4_Prev_Click = function () {
        vm.introduction.displayPanel(3);
    };

    var introPanel5_Next_Click = function () {
        vm.introduction.displayPanel(6);
    };

    var introPanel5_Prev_Click = function () {
        vm.introduction.displayPanel(4);
    };

    var introPanel6_Next_Click = function () {
        vm.introduction.displayPanel(7);
    };

    var introPanel6_Prev_Click = function () {
        vm.introduction.displayPanel(5);
    };

    var introPanel7_Next_Click = function () {
        vm.introduction.displayPanel(8);
    };

    var introPanel7_Prev_Click = function () {
        vm.introduction.displayPanel(6);
    };

    var introPanel8_Next_Click = function () {
        vm.introduction.displayPanel(9);
    };

    var introPanel8_Prev_Click = function () {
        vm.introduction.displayPanel(7);
    };

    var introPanel9_Next_Click = function () {
        vm.introduction.displayPanel(10);
    };

    var introPanel9_Prev_Click = function () {
        vm.introduction.displayPanel(8);
    };

    var introPanel10_Next_Click = function () {
        vm.introduction.displayPanel(11);
    };

    var introPanel10_Prev_Click = function () {
        vm.introduction.displayPanel(9);
    };

    var introPanel11_Next_Click = function () {
        vm.introduction.displayPanel(12);
    };

    var introPanel11_Prev_Click = function () {
        vm.introduction.displayPanel(10);
    };

    var introPanel12_Prev_Click = function () {
        vm.introduction.displayPanel(11);
    };

    var openUrl = function (event, url) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        if (url) {
            platform.OpenUrl(url);
        }
        else {
            platform.OpenUrl(event.currentTarget.href);
        }

        return false;
    };

    var queueSync = function (syncType) {
        // Start sync
        platform.Sync(
            vm.sync.asyncChannel,
            {
                type: syncType
            });
    };

    var restoreData = function (data, restoreCallback) {
        var syncEnabled;

        platform.LocalStorage.Get(globals.CacheKeys.SyncEnabled)
            .then(function (cachedSyncEnabled) {
                syncEnabled = cachedSyncEnabled;

                // Set ID and client secret if sync not enabled
                if (!syncEnabled) {
                    vm.sync.secret = null;
                    vm.sync.secretComplexity = {};

                    return $q.all([
                        platform.LocalStorage.Set(globals.CacheKeys.Password),
                        data.xBrowserSync.id ? platform.LocalStorage.Set(globals.CacheKeys.SyncId, data.xBrowserSync.id) : $q.resolve()
                    ]);
                }
            })
            .then(function () {
                var bookmarksToRestore = data.xBrowserSync.bookmarks;

                // Return if no bookmarks found
                if (!bookmarksToRestore) {
                    return restoreCallback();
                }

                // Display loading overlay 
                platform.Interface.Loading.Show();

                var syncData = {};
                syncData.type = (!syncEnabled) ? globals.SyncType.Pull : globals.SyncType.Both;
                syncData.bookmarks = bookmarksToRestore;

                // Start restore
                platform.Sync(vm.sync.asyncChannel, syncData, globals.Commands.RestoreBookmarks);
            });
    };

    var searchBookmarks = function () {
        var queryData = {
            url: null,
            keywords: []
        };

        if (vm.search.query) {
            // Iterate query words to form query data object
            var queryWords = vm.search.query.split(/[\s,]+/);
            _.each(queryWords, function (queryWord) {
                // Add query word as url if query is in url format, otherwise add to keywords
                if (!queryData.url && globals.URL.Regex.test(queryWord.trim())) {
                    queryData.url = queryWord.trim();
                }
                else {
                    var keyword = queryWord.trim().replace("'", '').replace(/\W$/, '').toLowerCase();
                    if (keyword) {
                        queryData.keywords.push(queryWord.trim());
                    }
                }
            });
        }

        bookmarks.Search(queryData)
            .then(function (results) {
                vm.search.scrollDisplayMoreEnabled = false;
                vm.search.resultsDisplayed = vm.search.batchResultsNum;
                vm.search.results = results;

                // Scroll to top of search results
                $timeout(function () {
                    document.querySelector('.search-results-panel').scrollTop = 0;
                    vm.search.scrollDisplayMoreEnabled = true;
                });
            })
            .catch(function (err) {
                vm.search.results = null;

                // Display alert
                var errMessage = utility.GetErrorMessageFromException(err);
                vm.alert.display(errMessage.title, errMessage.message, 'danger');
            });
    };

    var searchForm_Clear_Click = function () {
        vm.search.displayDefaultState();
    };

    var searchForm_DeleteBookmark_Click = function (event, bookmark) {
        // Delete the bookmark
        platform.Sync(vm.sync.asyncChannel, {
            type: globals.SyncType.Both,
            changeInfo: {
                type: globals.UpdateType.Delete,
                id: bookmark.id
            }
        });

        // Find and remove the deleted bookmark element in the search results
        if (vm.search.results && vm.search.results.length > 0) {
            var deletedBookmarkIndex = _.findIndex(vm.search.results, function (result) { return result.id === bookmark.id; });
            if (deletedBookmarkIndex >= 0) {
                vm.search.selectedBookmark = null;
                $timeout(function () {
                    vm.search.results[deletedBookmarkIndex].class = 'deleted';
                    $timeout(function () {
                        // Remove bookmark from results
                        vm.search.results.splice(deletedBookmarkIndex, 1);
                    }, 500);
                });
            }
        }
    };

    var searchForm_ScanCode_Click = function () {
        platform.ScanID();
    };

    var searchForm_SearchText_Autocomplete = function () {
        vm.search.query = vm.search.query + '' + vm.search.lookahead;
        searchForm_SearchText_Change();
        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('input[name=txtSearch]').focus();
            });
        }
    };

    var searchForm_SearchText_Change = function () {
        vm.alert.show = false;

        // Clear timeouts
        if (vm.search.getSearchLookaheadTimeout) {
            $timeout.cancel(vm.search.getSearchLookaheadTimeout);
            vm.search.getSearchLookaheadTimeout = null;
        }

        if (vm.search.getSearchResultsTimeout) {
            $timeout.cancel(vm.search.getSearchResultsTimeout);
            vm.search.getSearchResultsTimeout = null;
        }

        // No query, clear results
        if (!vm.search.query.trim()) {
            vm.search.displayDefaultState();
            return;
        }

        // Get last word of search query
        var queryWords = vm.search.query.split(/[\s]+/);
        var lastWord = _.last(queryWords);
        var getLookahead;

        // Display lookahead if word length exceed minimum
        if (lastWord && lastWord.length > globals.LookaheadMinChars) {
            // Get lookahead after delay
            vm.search.getSearchLookaheadTimeout = $timeout(function () {
                // Enable searching animation if bookmark cache is empty
                platform.LocalStorage.Get(globals.CacheKeys.Bookmarks)
                    .then(function (cachedBookmarks) {
                        if (!cachedBookmarks) {
                            searchForm_ToggleSearchingAnimation(true);
                        }
                    });

                // Cancel any exist http request to get bookmarks and refresh deferred
                if (vm.search.cancelGetBookmarksRequest &&
                    vm.search.cancelGetBookmarksRequest.promise.$$state.status === 0) {
                    vm.search.cancelGetBookmarksRequest.resolve();
                }
                vm.search.cancelGetBookmarksRequest = $q.defer();

                getLookahead = bookmarks.GetLookahead(lastWord.toLowerCase(), vm.search.results, vm.search.cancelGetBookmarksRequest.promise)
                    .then(function (results) {
                        if (!results) {
                            vm.search.lookahead = null;
                            return;
                        }

                        var lookahead = results[0];
                        var word = results[1];

                        if (lookahead && word.toLowerCase() === lastWord.toLowerCase()) {
                            // Trim word from lookahead
                            lookahead = lookahead ? lookahead.substring(word.length) : null;
                            vm.search.queryMeasure = vm.search.query.replace(/\s/g, '&nbsp;');
                            vm.search.lookahead = null;

                            // Set position of lookahead element
                            $timeout(function () {
                                var lookaheadElement = document.querySelector('#search-panel .lookahead-container .lookahead');
                                var measureElement = document.querySelector('#search-panel .lookahead-container .measure');
                                lookaheadElement.style.left = (measureElement.offsetLeft + measureElement.getBoundingClientRect().width) + 'px';
                                vm.search.lookahead = lookahead.replace(/\s/g, '&nbsp;');
                            });
                        }

                        vm.search.cancelGetBookmarksRequest = null;
                    })
                    .catch(function (err) {
                        // Display alert
                        var errMessage = utility.GetErrorMessageFromException(err);
                        vm.alert.display(errMessage.title, errMessage.message, 'danger');
                    })
                    .finally(function () {
                        searchForm_ToggleSearchingAnimation(false);
                    });
            }, vm.settings.getSearchLookaheadDelay);

            // Execute search after timeout and once lookahead request is finished
            vm.search.getSearchResultsTimeout = $timeout(function () {
                getLookahead.then(searchBookmarks);
            }, vm.settings.getSearchResultsDelay);
        }
        else {
            vm.search.lookahead = null;
        }
    };

    var searchForm_SearchText_KeyDown = function (event) {
        // If user pressed enter and search text present
        if (event.keyCode === 13) {
            document.activeElement.blur();

            if (vm.search.getSearchResultsTimeout) {
                $timeout.cancel(vm.search.getSearchResultsTimeout);
                vm.search.getSearchResultsTimeout = null;
            }

            // Get search results
            searchBookmarks();

            // Return focus to search box
            $timeout(function () {
                document.querySelector('input[name=txtSearch]').focus();
            });

            return;
        }

        // If user pressed down arrow and search results present
        if (event.keyCode === 40 && vm.search.results && vm.search.results.length > 0) {
            // Focus on first search result
            event.preventDefault();
            document.querySelector('.search-results-panel .list-group').firstElementChild.children[2].focus();
            return;
        }

        // If user pressed tab or right arrow key and lookahead present
        if ((event.keyCode === 9 || event.keyCode === 39) && vm.search.lookahead) {
            // Add lookahead to search query
            event.preventDefault();
            searchForm_SearchText_Autocomplete();
            return;
        }
    };

    var searchForm_SearchResult_KeyDown = function (event) {
        var currentIndex, newIndex;

        switch (true) {
            // Up arrow
            case (event.keyCode === 38):
                event.preventDefault();

                if (event.target.parentElement.previousElementSibling) {
                    // Focus on previous result
                    event.target.parentElement.previousElementSibling.children[2].focus();
                }
                else {
                    // Focus on search box
                    document.querySelector('input[name=txtSearch]').focus();
                }

                break;
            // Down arrow
            case (event.keyCode === 40):
                event.preventDefault();

                if (event.target.parentElement.nextElementSibling) {
                    // Focus on next result
                    event.target.parentElement.nextElementSibling.children[2].focus();
                }

                break;
            // Page up
            case (event.keyCode === 33):
                event.preventDefault();

                // Focus on result 6 down from current
                currentIndex = _.indexOf(event.target.parentElement.parentElement.children, event.target.parentElement);
                newIndex = currentIndex - 6;

                if (newIndex < 0) {
                    event.target.parentElement.parentElement.firstElementChild.children[2].focus();
                }
                else {
                    event.target.parentElement.parentElement.children[newIndex].children[2].focus();
                }

                break;
            // Page down
            case (event.keyCode === 34):
                event.preventDefault();

                // Focus on result 6 down from current
                currentIndex = _.indexOf(event.target.parentElement.parentElement.children, event.target.parentElement);
                newIndex = currentIndex + 6;

                if (event.target.parentElement.parentElement.children.length < newIndex) {
                    event.target.parentElement.parentElement.lastElementChild.children[2].focus();
                }
                else {
                    event.target.parentElement.parentElement.children[newIndex].children[2].focus();
                }

                break;
            // Home
            case (event.keyCode === 36):
                event.preventDefault();

                // Focus on first result
                event.target.parentElement.parentElement.firstElementChild.children[2].focus();

                break;
            // End
            case (event.keyCode === 35):
                event.preventDefault();

                // Focus on last result
                event.target.parentElement.parentElement.lastElementChild.children[2].focus();

                break;
            // Backspace
            case (event.keyCode === 8):
            // Space
            case (event.keyCode === 32):
            // Numbers and letters
            case (event.keyCode > 47 && event.keyCode < 112):
                // Focus on search box
                document.querySelector('input[name=txtSearch]').focus();
                break;
        }
    };

    var searchForm_SearchResults_Scroll = function () {
        if (vm.search.results && vm.search.results.length > 0 && vm.search.scrollDisplayMoreEnabled) {
            // Display next batch of results
            vm.search.resultsDisplayed += vm.search.batchResultsNum;
            vm.search.results = vm.search.results;
        }
    };

    var searchForm_SelectBookmark_Press = function (bookmarkId, event) {
        event.preventDefault();

        // Display menu for selected bookmark
        vm.search.selectedBookmark = bookmarkId;

    };

    var searchForm_ToggleBookmark_Click = function () {
        // Display bookmark panel
        changeView(vm.view.views.bookmark);
    };

    var searchForm_ToggleSearchingAnimation = function (active) {
        var searchIcon = document.querySelector('.search-form i');

        if (active) {
            searchIcon.classList.add("animate-flash");
        }
        else {
            searchIcon.classList.remove("animate-flash");
        }
    };

    var searchForm_UpdateBookmark_Click = function (bookmark) {
        // Set bookmark form properties to selected bookmark
        vm.bookmark.current = bookmark;

        // On mobiles, display bookmark panel with slight delay to avoid focussing on description field
        if (utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                changeView(vm.view.views.bookmark);
            }, 500);
        }
        else {
            changeView(vm.view.views.bookmark);
        }
    };

    var setBookmarkStatus = function () {
        platform.LocalStorage.Get(globals.CacheKeys.SyncEnabled)
            .then(function (syncEnabled) {
                if (!syncEnabled) {
                    return;
                }

                // If current page is a bookmark, actvate bookmark icon
                bookmarks.IncludesCurrentPage()
                    .then(function (result) {
                        vm.bookmark.active = !!result;
                    })
                    .catch(function (err) {
                        // Display alert
                        var errMessage = utility.GetErrorMessageFromException(err);
                        vm.alert.display(errMessage.title, errMessage.message, 'danger');
                    });
            });
    };

    var setNewTabLinks = function () {
        var links = document.querySelectorAll('a.new-tab');
        var onClickEvent = function () {
            return openUrl({ currentTarget: { href: this.href } });
        };

        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            link.onclick = onClickEvent;
        }
    };

    var setServiceInformation = function (serviceInfo) {
        vm.settings.service.status = serviceInfo.status;
        vm.settings.service.statusMessage = serviceInfo.message;
        vm.settings.service.maxSyncSize = serviceInfo.maxSyncSize / 1024;
        vm.settings.service.apiVersion = serviceInfo.version;
    };

    var startSyncing = function () {
        var syncType;

        // Display loading panel
        vm.sync.displaySyncConfirmation = false;
        vm.sync.displayUpgradeConfirmation = false;
        var loadingTimeout = platform.Interface.Loading.Show();

        // Check service status
        api.CheckServiceStatus()
            .then(function () {
                // Clear the current cached password
                return platform.LocalStorage.Set(globals.CacheKeys.Password);
            })
            .then(function () {
                // If a sync ID has not been supplied, get a new one
                if (!vm.sync.id) {
                    // Set sync type for create new sync
                    syncType = globals.SyncType.Push;

                    // Get new sync ID
                    return api.CreateNewSync()
                        .then(function (newSync) {
                            // Add sync data to cache and return
                            return $q.all([
                                platform.LocalStorage.Set(globals.CacheKeys.SyncId, newSync.id),
                                platform.LocalStorage.Set(globals.CacheKeys.SyncVersion, newSync.version)
                            ])
                                .then(function () {
                                    return newSync.id;
                                });
                        });
                }
                else {
                    // Set sync type for retrieve existing sync
                    syncType = globals.SyncType.Pull;

                    // Retrieve sync version for existing id
                    return api.GetBookmarksVersion(vm.sync.id)
                        .then(function (response) {
                            // If no sync version is set, confirm upgrade
                            if (!response.version) {
                                if (vm.sync.upgradeConfirmed) {
                                    syncType = globals.SyncType.Upgrade;
                                }
                                else {
                                    platform.Interface.Loading.Hide(null, loadingTimeout);
                                    vm.sync.displayUpgradeConfirmation = true;
                                    return;
                                }
                            }

                            // Add sync version to cache and return current sync ID
                            return $q.all([
                                platform.LocalStorage.Set(globals.CacheKeys.SyncId, vm.sync.id),
                                platform.LocalStorage.Set(globals.CacheKeys.SyncVersion, response.version)
                            ])
                                .then(function () {
                                    return vm.sync.id;
                                })
                        });
                }
            })
            .then(function (syncId) {
                if (!syncId) {
                    return;
                }

                // Generate a password hash, cache it then queue the sync
                return utility.GetPasswordHash(vm.sync.secret, syncId)
                    .then(function (passwordHash) {
                        platform.LocalStorage.Set(globals.CacheKeys.Password, passwordHash);
                        return queueSync(syncType);
                    });
            })
            .catch(function (err) {
                // Disable upgrade confirmed flag
                vm.sync.upgradeConfirmed = false;

                // Clear cached data
                platform.LocalStorage.Set([
                    globals.CacheKeys.Bookmarks,
                    globals.CacheKeys.Password,
                    globals.CacheKeys.SyncVersion
                ]);

                // Hide loading panel
                platform.Interface.Loading.Hide(null, loadingTimeout);

                // Display alert
                var errMessage = utility.GetErrorMessageFromException(err);
                vm.alert.display(errMessage.title, errMessage.message, 'danger');
            });
    };

    var syncForm_CancelSyncConfirmation_Click = function () {
        // TODO: Ensure any sync messaging or process is cancelled also
        vm.sync.enabled = false;

        bookmarks.DisableSync()
            .then(function () {
                // Switch to login panel
                changeView(vm.view.views.login);
            });
    };

    var syncForm_ConfirmPassword_Click = function () {
        vm.sync.displayPasswordConfirmation = true;

        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('input[name="txtPasswordConfirmation"]').focus();
            }, 100);
        }
    };

    var syncForm_DisableSync_Click = function () {
        // If sync is in progress, display confirmation
        platform.LocalStorage.Get(globals.CacheKeys.IsSyncing)
            .then(function (isSyncing) {
                if (isSyncing) {
                    vm.settings.service.displayCancelSyncConfirmation = true;
                    if (!utility.IsMobilePlatform(vm.platformName)) {
                        $timeout(function () {
                            document.querySelector('.btn-confirm-disable-sync').focus();
                        });
                    }
                    return;
                }

                syncForm_CancelSyncConfirmation_Click();
            });
    };

    var syncForm_EnableSync_Click = function () {
        platform.LocalStorage.Get(globals.CacheKeys.SyncId)
            .then(function (syncId) {
                if (syncId) {
                    // Display overwrite data confirmation panel
                    vm.sync.displaySyncConfirmation = true;
                    if (!utility.IsMobilePlatform(vm.platformName)) {
                        $timeout(function () {
                            document.querySelector('.btn-confirm-enable-sync').focus();
                        });
                    }
                }
                else {
                    // If no ID provided start syncing
                    startSyncing();
                }
            });
    };

    var syncForm_ExistingSync_Click = function () {
        vm.settings.displayNewSyncPanel = false;
        vm.sync.secret = null;

        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('input[name="txtId"]').focus();
            }, 100);
        }
    };

    var syncForm_NewSync_Click = function () {
        vm.settings.displayNewSyncPanel = true;
        vm.sync.displayPasswordConfirmation = false;
        platform.LocalStorage.Set(globals.CacheKeys.SyncId);
        platform.LocalStorage.Set(globals.CacheKeys.Password);
        vm.sync.id = null;
        vm.sync.secret = null;
        vm.sync.secretConfirmation = null;
        vm.sync.secretComplexity = {};

        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('.login-form-new input[name="txtPassword"]').focus();
            }, 100);
        }
    };

    var syncForm_Password_Change = function () {
        // Update client secret complexity value
        if (vm.sync.secret) {
            vm.sync.secretComplexity = complexify(vm.sync.secret);
        }
        else {
            vm.sync.secretComplexity = {};
        }
    };

    var syncForm_Submit_Click = function () {
        $timeout(function () {
            // Handle enter key press for login form
            if (vm.settings.displayNewSyncPanel) {
                if (vm.sync.displayPasswordConfirmation) {
                    document.querySelector('.login-form-new .btn-new-sync').click();
                }
                else {
                    document.querySelector('.login-form-new .btn-confirm-password').click();
                }
            }
            else {
                document.querySelector('.login-form-existing .btn-existing-sync').click();
            }
        });
    }

    var syncForm_UpgradeSync_Click = function () {
        vm.sync.upgradeConfirmed = true;
        startSyncing();
    };

    var syncPanel_DisplaySyncOptions_Click = function () {
        vm.settings.displaySyncOptions = true;

        if (!utility.IsMobilePlatform(vm.platformName)) {
            $timeout(function () {
                document.querySelector('#syncOptions-Panel .btn-back').focus();
            });
        }
    };

    var syncPanel_SyncBookmarksToolbar_Click = function () {
        $q.all([
            bookmarks.GetSyncBookmarksToolbar(),
            platform.LocalStorage.Get(globals.CacheKeys.SyncEnabled)
        ])
            .then(function (cachedData) {
                var syncBookmarksToolbar = cachedData[0];
                var syncEnabled = cachedData[1];

                // If sync not enabled or user just clicked to disable toolbar sync, update stored value and return
                if (!syncEnabled || syncBookmarksToolbar) {
                    return platform.LocalStorage.Set(globals.CacheKeys.SyncBookmarksToolbar, !syncBookmarksToolbar);
                }

                // Otherwise, display sync confirmation
                vm.settings.displaySyncBookmarksToolbarConfirmation = true;
                $timeout(function () {
                    document.querySelector('.btn-confirm-sync-toolbar').focus();
                });
            });
    };

    var syncPanel_SyncBookmarksToolbar_Confirm = function () {
        platform.LocalStorage.Get([
            globals.CacheKeys.SyncEnabled,
            globals.CacheKeys.SyncId
        ])
            .then(function (cachedData) {
                var syncEnabled = cachedData[globals.CacheKeys.SyncEnabled];
                var syncId = cachedData[globals.CacheKeys.SyncId];

                // If sync not enabled, return
                if (!syncEnabled) {
                    return;
                }

                // Enable setting and hide sync confirmation
                platform.LocalStorage.Set(globals.CacheKeys.SyncBookmarksToolbar, true);
                vm.settings.displaySyncBookmarksToolbarConfirmation = false;

                // Display loading overlay
                platform.Interface.Loading.Show();

                // Start sync with no callback action
                var syncData = {};
                syncData.type = (!syncId) ? globals.SyncType.Push : globals.SyncType.Pull;
                platform.Sync(vm.sync.asyncChannel, syncData, globals.Commands.NoCallback);
            });
    };

    var updatedPanel_ReleaseNotes_Click = function () {
        vm.events.openUrl(null, globals.ReleaseNotesUrlStem + globals.AppVersion);
        vm.view.displayMainView();
    };

    var updateServiceUrlForm_Cancel_Click = function () {
        // Hide form and scroll to top of section
        vm.settings.displayUpdateServiceUrlForm = false;
        document.querySelector('.status-panel h4').scrollIntoView();
    };

    var updateServiceUrlForm_Confirm_Click = function () {
        // Check service url
        var url = vm.settings.service.newServiceUrl.replace(/\/$/, '');

        // Disable sync
        vm.sync.enabled = false;
        bookmarks.DisableSync()
            .then(function () {
                // Update the service URL
                vm.settings.service.url = url;
                platform.LocalStorage.Set(globals.CacheKeys.ServiceUrl, url);

                // Remove saved client secret and ID
                platform.LocalStorage.Set(globals.CacheKeys.SyncId);
                platform.LocalStorage.Set(globals.CacheKeys.Password);
                vm.sync.secret = null;
                vm.sync.secretComplexity = {};

                // Update service status
                api.CheckServiceStatus()
                    .then(function (serviceInfo) {
                        setServiceInformation(serviceInfo);
                        displayDataUsage();

                        // Scroll to top of section
                        document.querySelector('.status-panel h4').scrollIntoView();
                    })
                    .catch(function (err) {
                        utility.LogMessage(globals.LogType.Info, err);
                        vm.settings.service.status = globals.ServiceStatus.Offline;
                    });

                // Reset view
                vm.settings.service.displayCancelSyncConfirmation = false;
                vm.settings.displayUpdateServiceUrlConfirmation = false;
                vm.settings.displayUpdateServiceUrlForm = false;
                vm.settings.service.newServiceUrl = vm.settings.service.url;
                vm.updateServiceUrlForm.newServiceUrl.$setValidity('InvalidService', true);
                vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceOffline', true);
                vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceVersionNotSupported', true);
            });
    };

    var updateServiceUrlForm_Display_Click = function () {
        // Reset form
        vm.updateServiceUrlForm.$setPristine();
        vm.settings.service.newServiceUrl = vm.settings.service.url;
        vm.updateServiceUrlForm.newServiceUrl.$setValidity('InvalidService', true);
        vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceOffline', true);
        vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceVersionNotSupported', true);

        // Display update form panel
        vm.settings.displayUpdateServiceUrlForm = true;

        // Validate service url
        updateServiceUrlForm_ValidateServiceUrl()
            .finally(function () {
                // Focus on url field
                document.querySelector('input[name="newServiceUrl"]').focus();
            });
    };

    var updateServiceUrlForm_NewServiceUrl_Change = function (event) {
        // Reset form if field is invalid
        if (vm.updateServiceUrlForm.newServiceUrl.$invalid) {
            vm.updateServiceUrlForm.newServiceUrl.$setValidity('InvalidService', true);
            vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceOffline', true);
            vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceVersionNotSupported', true);
        }
    };

    var updateServiceUrlForm_Update_Click = function () {
        // Check for protocol
        if (vm.settings.service.newServiceUrl && vm.settings.service.newServiceUrl.trim() && !globals.URL.ProtocolRegex.test(vm.settings.service.newServiceUrl)) {
            vm.settings.service.newServiceUrl = 'https://' + vm.settings.service.newServiceUrl;
        }

        // Validate service url
        return updateServiceUrlForm_ValidateServiceUrl()
            .then(function (isValid) {
                if (!isValid) {
                    return;
                }

                // Check if sync is enabled
                return platform.LocalStorage.Get(globals.CacheKeys.SyncEnabled)
                    .then(function (syncEnabled) {
                        if (!syncEnabled) {
                            updateServiceUrlForm_Confirm_Click();
                            return;
                        }

                        // Display confirmation panel
                        vm.settings.displayUpdateServiceUrlForm = false;
                        vm.settings.displayUpdateServiceUrlConfirmation = true;

                        if (!utility.IsMobilePlatform(vm.platformName)) {
                            $timeout(function () {
                                document.querySelector('.btn-confirm-update-service-url').focus();
                            });
                        }
                    });
            });
    };

    var updateServiceUrlForm_ValidateServiceUrl = function () {
        // Display loading overlay
        var loadingTimeout = platform.Interface.Loading.Show('checkingNewServiceUrl');

        // Check service url status
        var url = vm.settings.service.newServiceUrl.replace(/\/$/, '');
        return api.CheckServiceStatus(url)
            .then(function (serviceInfo) {
                return !!serviceInfo;
            })
            .catch(function (err) {
                if (err && err.code != null) {
                    switch (err.code) {
                        case globals.ErrorCodes.ApiOffline:
                            vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceOffline', false);
                            break;
                        case globals.ErrorCodes.ApiVersionNotSupported:
                            vm.updateServiceUrlForm.newServiceUrl.$setValidity('ServiceVersionNotSupported', false);
                            break;
                        default:
                            vm.updateServiceUrlForm.newServiceUrl.$setValidity('InvalidService', false);
                    }
                }
                else {
                    vm.updateServiceUrlForm.newServiceUrl.$setValidity('InvalidService', false);
                }

                // Focus on url field
                document.querySelector('input[name=newServiceUrl]').focus();

                return false;
            })
            .finally(function () {
                platform.Interface.Loading.Hide('checkingNewServiceUrl', loadingTimeout);
            });
    };

    // Call constructor
    return new BrowserAction();
};