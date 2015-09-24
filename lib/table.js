var async = require('async');
var EventEmitter = require('events').EventEmitter;

var maprJClass = require('./jexports/MapRDBStaticClass');
var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var Document = require('./document');
var Condition = require('./condition');
var Mutation = require('./mutation');
var errorsManager = require('./utils/errorsManager');
var MethodOverload = require('./utils/methodOverload');
var slice = Array.prototype.slice;

/** @module Table **/

/**
 *
 * @constructor
 * @param {object|string} tableInstance
 */
var Table = function (tableInstance) {
  this.jTable = java.instanceOf(tableInstance, 'com.mapr.db.Table') ?
    tableInstance :
    maprJClass.getTableSync(tableInstance);
};

/**
 * Convert list of Documents to JSON.
 *
 * @param {DocumentStream} jDocs documents from java
 * @returns {object[]} converted documents to JSON
 */
var makeDocuments = function(jDocs) {
  var res = [];
  if (!jDocs) {
    return res;
  }
  var it = jDocs.iteratorSync();
  while (it.hasNextSync()) {
    res.push(new Document(it.nextSync()));
  }
  return res;
};

/**
 * Attach err, read, end handlers to stream of documents.
 *
 * @param {DocumentStream} jDocs documents from java
 * @param {Object} eventHandlers handlers object with 3 keys each value should be <code>function< { err: errHandler, read: readHandler}
 * @returns {EventEmitter}
 */
var makeDocumentsStream = function(jDocs, eventHandlers) {
  var emitter = new EventEmitter();
  var errHandlerWrap = function(eventCallback) {
    return function(err) {
      eventCallback(err) || {};
      emitter.emit('end');
    };
  };
  var endHandlerWrap = function(eventCallback) {
    return function() {
      eventCallback();
      emitter
        .removeAllListeners('read')
        .removeAllListeners('end');
      jDocs = null;
      emitter = null;
    };
  };
  var handlers = {
    err: errHandlerWrap(eventHandlers.err || function() {}),
    read: eventHandlers.read || function() {},
    end: endHandlerWrap(eventHandlers.end || function() {})
  };
  // when document received push it to callback
  emitter.on('read', handlers.read);

  emitter.on('err', handlers.err);

  // on end of iteration remove listeners and emitter
  emitter.on('end', handlers.end);

  var iterate = function(em, iterator) {
    iterator.hasNext(function(err, res) {
      if (res === true) {
        iterator.next(function(errInner, doc) {
          if (errInner) {
            em.emit('err', errInner);
          } else {
            em.emit('read', errInner, new Document(doc));
            iterate(em, iterator);
          }
        });
      } else {
        em.emit('end');
      }
    });
  };

  jDocs.iterator(function (err, iterator) {
    iterate(emitter, iterator);
  });

  return emitter;
};

/**
 * Make inline argument by specified index.
 * This method used to pass String... style argument to java method.
 *
 * <pre>
 *   var argList = [{ someArg: 1}, ['arg1', 'arg2', 'arg3']];
 *   console.log(inlineArgs(argList,1)); // [{ someArg: 1 }, 'arg1', 'arg2', 'arg3']
 * </pre>
 *
 * @param {arguments} args arguments passed to function
 * @param {number} pos index of argument that should be inline
 * @returns {array}
 */
var inlineArgs = function(args, pos) {
  errorsManager.assert(args.length, errorsManager.noArgumentsError());
  var tmp = slice.call(args);
  var argsTail = tmp.splice(1, pos);
  tmp = Array.prototype.concat.apply(tmp, argsTail[0]).concat(argsTail[1]);
  return tmp;
};

/**
 *
 * @param {Function} callback
 * @param {boolean} evented
 * @returns {Function}
 */
var findCallbackWrap = function(callback, evented) {
  return function(err, docs) {
      return evented ?
        makeDocumentsStream(docs, {read: callback, err: callback }) :
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
  errorsManager.assert(arguments.length, errorsManager.noArgumentsError());
  var args = new MethodOverload(arguments);

  args
    .addCombo('id', 'fields', 'callback')
    .addCombo('id', 'callback')
    .inspect('callback', typeChecker.isFunction.bind(typeChecker), 'Function')
    .inspect('id', function(i) {
      return typeChecker.isString(i);
    }, 'String')
    .inspect('fields', function(i) {
      return typeChecker.checkEachType(i, 'string');
    }, 'Array of Strings')
    .castTo('callback', function(originalCallback) {
      return function(err, doc) {
        originalCallback(err, new Document(doc));
      };
    })
    .build();

    return args.list() === 3 ?
      this.jTable.findById.apply(this.jTable, inlineArgs(args.list(), 2)) :
      this.jTable.findById.apply(this.jTable, args.list());
};

/**
 *
 */
Table.prototype.find = function() {
  return this._commonFind(arguments, false);
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

/**
 * Update document by specified id
 *
 * @param {string} id document `_id`
 * @param {object} mutation JSON described mutation
 * @param {function} callback callback function, error will be passed as first argument
 * @returns {*}
 */
Table.prototype.update = function (id, mutation, callback) {
  errorsManager.assert(arguments.length, errorsManager.noArgumentsError());
  return this.jTable.update(id, new Mutation(mutation), function(err) {
    callback(err);
  });
};

Table.prototype.eachDocument = function(condition, fields, callback) {
  return this._commonFind(arguments, true);
};

/**
 *
 * @returns {*}
 */
Table.prototype.stream = function() {
  errorsManager.assert(arguments.length, errorsManager.noArgumentsError());
  var args = new MethodOverload(arguments);

  args
    .addCombo('condition', 'fields', 'streamHandlers')
    .addCombo('condition', 'streamHandlers')
    .addCombo('fields', 'streamHandlers')
    .inspect('condition', function(i) {
      if (typeChecker.isObject(i)) {
        return !Object.keys(i).filter(function(key) { return typeChecker.isFunction(i[key]); }).length;
      }
      return typeChecker.checkEachType(i, 'object');
    }, 'JSON or Array of JSONs')
    .inspect('fields', function(i) {
      return typeChecker.checkEachType(i, 'string');
    }, 'Array of Strings')
    .inspect('streamHandlers', function(i) {
      return !!Object.keys(i).filter(function(key) { return typeChecker.isFunction(i[key]); }).length;
    }, 'Object')
    .castTo('condition', function(i) {
      return new Condition(i);
    })
    .castTo('streamHandlers', function(streamHandlers) {
      return function(err, jDocs) {
        makeDocumentsStream(jDocs, streamHandlers);
      };
    })
    .build();

  if (args.list().length) {
    // hack to pass conditions array as java.lang.String...
    return args.list().length === 3 ?
      this.jTable.find.apply(this.jTable, inlineArgs(args.list(), 2)) :
      this.jTable.find.apply(this.jTable, args.list());
  }
  return null;
};

/**
 * Delete document by specified id. You have to call table#flush method to apply changes to DB.
 *
 * @param {string} id document _id
 * @param {function} callback callback function, error will be assign to argument
 */
Table.prototype.delete = function(id, callback) {
  errorsManager.assert(arguments.length, errorsManager.noArgumentsError());
  this.jTable.delete(id, function (err, result) {
    return callback(err);
  });
};

/**
 *
 * @param {Arguments} prevArgs
 * @param {boolean} evented
 * @private
 */
Table.prototype._commonFind = function (prevArgs, evented) {
  errorsManager.assert(prevArgs.length, errorsManager.noArgumentsError());
  var args = new MethodOverload(prevArgs);

  args
    .addCombo('condition', 'fields', 'callback')
    .addCombo('condition', 'callback')
    .addCombo('fields', 'callback')
    .addCombo('callback')
    .inspect('callback', typeChecker.isFunction.bind(typeChecker), 'Function')
    .inspect('condition', function(i) {
      return typeChecker.isObject(i) || typeChecker.checkEachType(i, 'object');
    }, 'Object or Array of Objects')
    .inspect('fields', function(i) {
      return typeChecker.checkEachType(i, 'string');
    }, 'Array of Strings')
    .castTo('callback', function(i) {
      return evented ? findCallbackWrap(i, true) : findCallbackWrap(i);
    })
    .castTo('condition', function(i) {
      return new Condition(i);
    })
    .build();

  if (args.list().length) {
    return args.list().length === 3 ?
      this.jTable.find.apply(this.jTable, inlineArgs(args.list(), 2)) :
      this.jTable.find.apply(this.jTable, args.list());
  }
  return null;
};

module.exports = Table;
