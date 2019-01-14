
function disableDebugInfo(module) {
    module.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
        $compileProvider.aHrefSanitizationWhitelist(/^\w+:.*$/);
    }]);
}

function injectAppServices(module) {
    // Add platform service
    module.factory('platform', [xBrowserSync.App.Platform]);

    // Add global service
    module.factory('globals', ['platform', xBrowserSync.App.Global]);

    // Add httpInterceptor service
    module.factory('httpInterceptor', ['$q', 'globals', xBrowserSync.App.HttpInterceptor]);
    module.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]);

    // Add utility service
    module.factory('utility', ['$q', 'platform', 'globals', xBrowserSync.App.Utility]);

    // Add api service
    module.factory('api', ['$http', '$q', 'platform', 'globals', 'utility', xBrowserSync.App.API]);

    // Add bookmarks service
    module.factory('bookmarks', ['$q', '$timeout', 'platform', 'globals', 'api', 'utility', xBrowserSync.App.Bookmarks]);

    // Add platform implementation service
    module.factory('platformImplementation', ['$http', '$interval', '$q', '$timeout', 'platform', 'globals', 'utility', 'bookmarks', xBrowserSync.App.PlatformImplementation]);
}

function injectMainController(module) {
    // Add main controller
    module.controller('Controller', ['$scope', '$q', '$timeout', 'Complexify', 'platform', 'globals', 'api', 'utility', 'bookmarks', 'platformImplementation', xBrowserSync.App.Controller]);
}