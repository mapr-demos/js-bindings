var maprJClass = require('./jexports/MapRDBStaticClass');

module.exports = {
  fromJSON: function(value) {
    var document = maprJClass.newDocumentSync();
    Object.keys(value).forEach(function(key) {
      document.setSync(key, value[key]);
    });
    return document;
  },
  // @TODO correct method to convert Document to JSON
  toJSON: function(value) {
    var iterator = value.keySetSync().iteratorSync();
    var document = {};
    while (iterator.hasNextSync()) {
      var key = iterator.nextSync();
      document[key] = value.getSync(key);
    }
    return document;
  }
}
