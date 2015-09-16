var maprJClass = require('./jexports/MapRDBStaticClass');
var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var Document = require('./document');

var slice = Array.prototype.slice;

/** @module table **/

/**
 *
 * @constructor
 * @param {object|string} tableInstance
 */
var table = function (tableInstance) {
  if (java.instanceOf(tableInstance, 'com.mapr.db.Table')) {
    this.jTable = tableInstance;
  }
  else {
    this.jTable = maprJClass.getTableSync(tableInstance);
  }
};

/**
 * Get name of the table.
 *
 * @returns {string}
 */
table.prototype.getNameSync = function () {
  return this.jTable.getNameSync();
};

/**
 * Insert Document to the table.
 *
 * @param {object|com.mapr.db.DBDocument} value data to insert
 * @param {function} callback
 */
table.prototype.insert = function (value, callback) {
  return this.jTable.insert(new Document(value), callback || function() {});
};

/**
 * Push data to server.
 *
 * @param {function} callback
 */
table.prototype.flush = function(callback) {
  this.jTable.flush(function(err, result) {
    return callback(err);
  });
};

/**
 *
 */
table.prototype.findById = function() {
  return this._find('findById', 'isString', slice.call(arguments));
};

/**
 *
 */
table.prototype.find = function() {
  return this._find('find', 'isObject', slice.call(arguments));
};

/**
 *
 * @param {string} method - find|findById
 * @param {string} type - isString|isObject or any other from the <code>typeChecker</code>  (@see typeChecker).
 *  Checks type of the first argument used in the <code>method</code>
 * @param {array} args
 * @returns {*}
 * @private
 */
table.prototype._find = function (method, type, args) {
  if (!args.length) {
    throw 'Called without arguments';
  }
  var firstParameter = args.filter(typeChecker[type].bind(typeChecker))[0];
  var fields = args.filter(typeChecker.isArray.bind(typeChecker))[0];
  var callback = args.filter(typeChecker.isFunction.bind(typeChecker))[0];
  var fArgs = firstParameter ? [firstParameter] : [];
  if (fields) {
    fArgs.push(fields);
  }
  if (callback) {
    fArgs.push(function(err, doc) {
      return err ? callback(null, err) : callback(new Document(doc), err);
    });
  }
  // fArgs - id/condition, fields, callback
  return this.jTable[method].apply(this.jTable, fArgs);
};

module.exports = table;
