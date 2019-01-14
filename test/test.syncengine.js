
describe('LocalStorage', function() {
    it('can get and set localstorage', function() {
      var x = new xBrowserSync.LocalStorage();
      return x.get("something")
      .then((val) => expect(val).to.eql(undefined))
      .then(() => x.set("something", "1234"))
      .then(() => x.get("something"))
      .then((val) => expect(val).to.eql("1234"));
    });
  });
  
  describe('SyncEngine', function() {
    it('can get local bookmarks', function() {
      var ls = new xBrowserSync.LocalStorage();
      var x = new xBrowserSync.SyncEngine(ls);
      return x.syncBrowserToLocalBookmarks()
      .then((val) => expect(val).to.eql({}))
    });

    it('gets browser bookmarks', function() {
      browser.bookmarks.getSubTree('2').then((bookmarks) => console.log(bookmarks))
    })
  });
  