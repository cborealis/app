
describe('LocalStorage', function() {
  it('can get and set localstorage', function() {
    var x = xBrowserSync.LocalStorage();
    return x.get("something")
    .then((val) => expect(val).to.eql(undefined))
    .then(() => x.set("something", "1234"))
    .then(() => x.get("something"))
    .then((val) => expect(val).to.eql("1234"))
    .then(() => x.set("something", null));
  });
});
  
describe('SyncEngine', function() {
  it('can get local bookmarks', function() {
    var ls = xBrowserSync.LocalStorage();
    var bm = xBrowserSync.Bookmarks(ls);
    var x = new xBrowserSync.SyncEngine(ls, bm);
    return x.syncBrowserToLocalBookmarks()
    .then((val) => expect(val).to.eql({}))
  });

  it('get $q', function() {
    var $injector = angular.injector(['ng','xBrowserSync.App.ExtensionBackground']);

    // use the injector to kick off your application
    // use the type inference to auto inject arguments, or use implicit injection
    $injector.invoke(function($rootScope, $q, $http, api) {
      console.log($rootScope);
      console.log($q);
      console.log($http);
      console.log(api);

    });
    let platform = $injector.get('platform');
    let globals = $injector.get('globals');
    let api = $injector.get('api');
    let ls = $injector.get('localstorage');

    var bm = xBrowserSync.Bookmarks(ls);
    var x = new xBrowserSync.SyncEngine(ls, bm, platform, globals, api);
    x.syncLocalAndServerBookmarks().then((a) => console.log(a));
  });

  it('gets browser bookmarks', function() {
    browser.bookmarks.getSubTree('2').then((bookmarks) => console.log(bookmarks))
  })
});
  