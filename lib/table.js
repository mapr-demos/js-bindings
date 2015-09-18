var maprJClass = require('./jexports/MapRDBStaticClass');
var java = require('./jexports/javaInstance').javaInstance();
var async = require('async');
var typeChecker = require('./utils/typeChecker');
var Document = require('./document');
var Condition = require('./condition');
var errorsManager = require('./utils/errorsManager');
var javaJsConverter = require('./utils/JavaJsConverter');
var MethodOverload = require('./utils/methodOverload');

var slice = Array.prototype.slice;

/** @module Table **/

/**
 *
 * @constructor
 * @param {object|string} tableInstance
 */
var Table = function (tableInstance) {
  if (java.instanceOf(tableInstance, 'com.mapr.db.Table')) {
    this.jTable = tableInstance;
  }
  else {
    this.jTable = maprJClass.getTableSync(tableInstance);
  }
};

var makeDocuments = function(jDocs) {
  var res = [];
  if (!jDocs) {
    return [];
  }
  var it = jDocs.iteratorSync();
  while (it.hasNextSync()) {
    res.push(new Document(it.nextSync()));
  }
  return res;
};

var findCallbackWrap = function(callback) {
  return function(err, docs) {
    callback(err, makeDocuments(docs));
  };
};

/**
 * Get name of the table.
 *
 * @returns {string}
 */
Table.prototype.getNameSync = function () {
  return this.jTable.getNameSync();
};

/**
 * Insert Document to the table.
 *
 * @param {object|'com.mapr.db.DBDocument'} value data to insert
 * @param {function} callback
 */
Table.prototype.insert = function (value, callback) {
  return this.jTable.insert(new Document(value), callback || function() {});
};

/**
 * Push data to server.
 *
 * @param {function} callback
 */
Table.prototype.flush = function(callback) {
  this.jTable.flush(function(err, result) {
    return callback(err);
  });
};

/**
 *
 */
Table.prototype.findById = function() {
  return this._find('findById', 'isString', slice.call(arguments));
};

/**
 *
 */
Table.prototype.find = function() {
  errorsManager.assert(arguments.length, errorsManager.noArguments());
  var args = new MethodOverload(arguments);

  args.addCombo('condition', 'fields', 'callback');
  args.addCombo('condition', 'callback');
  args.addCombo('fields', 'callback');
  args.addCombo('callback');

  args.inspect('callback', typeChecker.isFunction.bind(typeChecker));
  args.inspect('condition', function(i) {
    return typeChecker.isObject(i) ||
      (typeChecker.isArray(i) && (i.filter(typeChecker.isObject.bind(typeChecker)).length));
  });
  args.inspect('fields', function(i) {
    return typeChecker.isArray(i) && i.filter(typeChecker.isString.bind(typeChecker)).length;
  });

  args.castTo('callback', function(i) {
    return findCallbackWrap(i);
  });
  args.castTo('condition', function(i) {
    return new Condition(i);
  });

  args.build();

  if (args.list().length) {
    // hack to pass conditions array as java.lang.String...
    if (args.list().length === 3) {
      var tmp = slice.call(args.list());
      var argsTail = tmp.splice(1,2);
      tmp = Array.prototype.concat.apply(tmp, argsTail[0]).concat(argsTail[1]);
      return this.jTable.find.apply(this.jTable, tmp);
    }
    return this.jTable.find.apply(this.jTable, args.list());
  }
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
Table.prototype._find = function (method, type, args) {
  errorsManager.assert(arguments.length, errorsManager.noArguments());
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

/**
 * Insert specified list of JSON documents to DB
 * @param {object[]} documents list of JSON documents to insert
 * @param {function} callback callback function
 */
Table.prototype.insertAll = function(documents, callback) {
  var self = this;
  async.each(documents, function(item, clb) {
    self.insert(item, function(err) {
      clb(err);
    });
  }, function(err) {
    callback(err);
  });
};

module.exports = Table;
