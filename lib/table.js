var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var document = require('./document');

/**
 *
 * @param {object} tableInstance
 */
var table = function (tableInstance) {
  if (java.instanceOf(tableInstance, 'com.mapr.db.Table')) {
    this.jTable = tableInstance;
  }
};

table.prototype.getNameSync = function () {
  return this.jTable.getNameSync();
};

table.prototype.insert = function (value, callback) {
  return this.jTable.insert(document.fromJSON(value), callback || function() {});
};

table.prototype.flush = function(callback) {
  this.jTable.flush(function(err, result) {
    callback(err);
  });
};

table.prototype.findById = function() {
  var args = Array.prototype.slice.call(arguments);
  if (!args.length) {
    throw 'Called without arguments';
  } else {
    var callback = args.filter(typeChecker.isFunction.bind(typeChecker))[0];
    var id = args.filter(typeChecker.isString.bind(typeChecker))[0];
    var fields = args.filter(typeChecker.isArray.bind(typeChecker))[0];
    var fArgs = [];
    if (id) fArgs.push(id);
    if (fields) fArgs.push(fields);
    if (callback) {
      fArgs.push(function(err, doc) {
        if (err) {
          callback(null, err);
        } else {
          callback(document.toJSON(doc), err);
        }
      });
    }
    this.jTable.findById.apply(this.jTable, fArgs);
  }
};

table.prototype.find = function() {
  var args = Array.prototype.slice.call(arguments);
  if (!args.length) {
    throw 'Called without arguments';
  } else {
    var condition = args.filter(typeChecker.isObject.bind(typeChecker))[0];
    var fields = args.filter(typeChecker.isArray.bind(typeChecker))[0];
    var callback = args.filter(typeChecker.isFunction.bind(typeChecker))[0];
    var fArgs = [];
    if (condition) fArgs.push(fields);
    if (fields) fArgs.push(fields);
    if (callback) {
      fArgs.push(function(err, doc) {
        if (err) {
          callback(null, err);
        } else {
          callback(document.toJSON(doc), err);
        }
      });
    }
    this.jTable.find.apply(this.jTable, fArgs);
  }
};

module.exports = table;
