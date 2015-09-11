var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var document = require('./document');

var slice = Array.prototype.slice;

/**
 *
 * @param {object} tableInstance
 */
var table = function (tableInstance) {
  if (java.instanceOf(tableInstance, 'com.mapr.db.Table')) {
    this.jTable = tableInstance;
  }
};

/**
 *
 */
table.prototype.getNameSync = function () {
  return this.jTable.getNameSync();
};

/**
 *
 * @param value
 * @param callback
 */
table.prototype.insert = function (value, callback) {
  return this.jTable.insert(document.fromJSON(value), callback || function() {});
};

/**
 *
 * @param callback
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
      console.log('!!!!', err, doc);
      return err ? callback(null, err) : callback(document.toJSON(doc), err);
    });
  }
  // fArgs - id/condition, fields, callback
  return this.jTable[method].apply(this.jTable, fArgs);
};

module.exports = table;