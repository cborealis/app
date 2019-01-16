
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
    var $injector = angular.injector(['ng','xBrowserSync.App.ExtensionBackground']);

    let globals = $injector.get('globals');
    let ls = $injector.get('localstorage');
    let settings = $injector.get('settings');
    let enc = $injector.get('encryption');
    let api = $injector.get('api');

    var bm = xBrowserSync.Bookmarks(globals, ls, settings, enc, api);
    var x = xBrowserSync.SyncEngine(ls, bm);
    return x.syncBrowserToLocalBookmarks()
    .then((val) => console.log(val))
  });

  it('get $q', function() {
    var $injector = angular.injector(['ng','xBrowserSync.App.ExtensionBackground']);

    let platform = $injector.get('platform');
    let globals = $injector.get('globals');
    let ls = $injector.get('localstorage');
    let settings = $injector.get('settings');
    let enc = $injector.get('encryption');
    let api = $injector.get('api');

    var bm = xBrowserSync.Bookmarks(globals, ls, settings, enc, api);
    var x = xBrowserSync.SyncEngine(ls, bm, platform, globals, api);  // localStorage, bookmarks, platform, globals, api, utility
    x.syncLocalAndServerBookmarks().then((a) => console.log(a));
  });

  it('gets browser bookmarks', function() {
    browser.bookmarks.getSubTree('2').then((bookmarks) => console.log(bookmarks))
  })
});
  