var maprJClass = require('./jexports/MapRDBStaticClass');

module.exports = {

  /**
   *
   * @param {object} value 'com.mapr.db.Document'
   * @returns {object}
   */
  fromJSON: function(value) {
    var document = maprJClass.newDocumentSync();
    Object.keys(value).forEach(function(key) {
      document.setSync(key, value[key]);
    });
    return document;
  },

  // @TODO correct method to convert Document to JSON
  /**
   *
   * @param {object} value 'com.mapr.db.Document'
   * @returns {{}} 'com.mapr.db.Document'
   */
  toJSON: function(value) {
    var iterator = value.keySetSync().iteratorSync();
    var document = {};
    while (iterator.hasNextSync()) {
      var key = iterator.nextSync();
      document[key] = value.getSync(key);
    }
    return document;
  }

};
