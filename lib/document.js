var maprJClass = require('./jexports/MapRDBStaticClass');
var typeChecker = require('./utils/typeChecker');
var java = require('./jexports/javaInstance').javaInstance();
var javaJsConverter = require('./utils/JavaJsConverter');

module.exports = {
  /**
   * Convert JSON object to maprdb Document.
   *
   * @param {object} value
   * @returns {*}
   */
  fromJSON: function(value) {
    if (!value._id) {
      throw 'No key or _id property in document is specified.';
    }
    return this.makeJavaFromJson(value);
  },

  makeJavaFromJson: function(value) {
    var that = this;
    if (typeChecker.isObject(value) && value._id) {
      var document = maprJClass.newDocumentSync();
      Object.keys(value).forEach(function(key) {
        document.setSync(that.makeJavaFromJson(key), that.makeJavaFromJson(value[key]));
      });
      return document;
    }
    return javaJsConverter.convertJsToJava(value);
  },

  /**
   * Convert maprdb Document to plain JSON.
   *
   * @param {object} value 'com.mapr.db.Document'
   * @returns {object}
   */
  toJSON: function(value) {
    return javaJsConverter.convertJavaToJs(value);
  }
};
