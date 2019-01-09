// Initialise the angular app
xBrowserSync.App.UI = angular.module('xBrowserSync.App.UI', [
    'angular-complexify',
    'angular.filter',
    'infinite-scroll',
    'ngAnimate',
    'ngSanitize'
]);

// Disable debug info
disableDebugInfo(xBrowserSync.App.UI);

// Restrict animations to elements with class prefix "animate-"
xBrowserSync.App.UI.config(['$animateProvider', function ($animateProvider) {
    $animateProvider.classNameFilter(/animate\-|view\-content/);
}]);

xBrowserSync.App.UI.run(['$templateRequest', function ($templateRequest) {
    // Pre-load templates
    $templateRequest('./views/login.html', true);
    $templateRequest('./views/search.html', true);
    $templateRequest('./views/bookmark.html', true);
    $templateRequest('./views/settings.html', true);
}]);

injectAppServices(xBrowserSync.App.UI);

injectMainController(xBrowserSync.App.UI);
