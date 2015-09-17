var maprJClass = require('./jexports/MapRDBStaticClass');
var typeChecker = require('./utils/typeChecker');
var java = require('./jexports/javaInstance').javaInstance();
var javaJsConverter = require('./utils/JavaJsConverter');

/** @module document **/

/**
 * Convert document from JSON->com.mapr.db.DBDocument or com.mapr.db.DBDocument->JSON instance.
 * Depends on passed input type, the result type will be inverted.
 *
 * @constructor
 * @param {object|com.mapr.db.DBDocument} value
 * @returns {com.mapr.db.DBDocument|object}
 */
var Document = function(value) {
  if (typeChecker.isJavaObject(value)) {
    return this.toJSON(value);
  } else if (typeChecker.isObject(value)) {
    return this.fromJSON(value);
  };
  return null;
};

var makeJavaFromJson = function(value) {
  if (typeChecker.isObject(value) && value._id) {
    var d = maprJClass.newDocumentSync();
    Object.keys(value).forEach(function(key) {
      d.setSync(makeJavaFromJson(key), makeJavaFromJson(value[key]));
    });
    return d;
  }
  return javaJsConverter.convertJsToJava(value);
};

/**
 * Convert maprdb Document to plain JSON.
 *
 * @param {object} value
 * @returns {*}
 */
Document.prototype.toJSON = function(value) {
  return javaJsConverter.convertJavaToJs(value);
};

/**
 * Convert JSON object to maprdb Document. (see: {@link toJSON})
 *
 * @param {object} value
 * @returns {*}
 */
Document.prototype.fromJSON = function(value) {
  if (!value._id) {
    throw 'No key or _id property in document is specified.';
  }
  return makeJavaFromJson(value);
};

module.exports = Document;
