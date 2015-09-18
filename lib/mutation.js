var maprJClass = require('./jexports/MapRDBStaticClass');
var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var JavaJsConverter = require('./utils/JavaJsConverter');
var errorsManager = require('./utils/errorsManager');

/**
 * @see 'com.mapr.db.Mutation'
 * @module mutation
 */

/**
 * Uses <code>com.mapr.db.MaRDB.newMutation</code>
 * @constructor
 * @param {object} json object with notations
 * @throws {ConstructorArgumentsError}
 */
var mutation = function (json) {
  this.jMutation = maprJClass.newMutationSync();
  var mType = typeChecker.getType(json);
  if (!typeChecker.isObject(json)) {
    throw errorsManager.constructorArgumentsError('mutation', 'object', mType);
  }
  return this.parseMutation(json);
};

/**
 * Check value (<code>value</code>) type to be in the list of allowed type (<code>allowedTypes</code>)
 * If type isn't allowed throws Error
 * @param {string[]} allowedTypes list of allowed types
 * @param {*} value checked value
 * @param {string} methodName name of the function where this value going to be used
 * @param {number} index value's position in the list of <code>methodName</code> arguments
 * @throws {ArgumentTypesWhiteListError}
 * @static
 */
mutation.checkValueType = function(allowedTypes, value, methodName, index) {
  var valueType = typeChecker.getType(value);
  if (allowedTypes.indexOf(valueType) === -1) {
    throw errorsManager.argumentTypesWhiteListError(allowedTypes, valueType, methodName, index);
  }
};

/**
 * Method name -> list of notations
 * @static
 * @type {{set: string[], setOrReplace: string[], increment: string[], append: string[], delete: string[]}}
 */
mutation.mutationMap = {
  set:  ['$set'],
  setOrReplace: ['$setOrReplace'],
  increment: ['$inc'],
  append: ['$append'],
  delete: ['$delete']
};

/**
 * Parse json  with notations and call proper java-methods
 * @param {string} json object with notations
 * @throws {InvalidNotationError}
 * @throws {ArgumentTypesWhiteListError}
 * @throws {NotSupportedNotationKeyError}
 */
mutation.prototype.parseMutation = function (json) {
  var self = this;
  var keys = Object.keys(json);

  keys.forEach(function(key) {

    var state, value;
    if (typeChecker.isObject(json[key])) {
      state = Object.keys(json[key])[0];
      value = json[key][state];
    }
    else {
      throw errorsManager.invalidNotationError('mutation', key, json[key]);
    }

    if (mutation.mutationMap.set.indexOf(state) !== -1) {
      return self.set(key, value);
    }

    if (mutation.mutationMap.setOrReplace.indexOf(state) !== -1) {
      return self.setOrReplace(key, value);
    }

    if (mutation.mutationMap.increment.indexOf(state) !== -1) {
      return self.increment(key, value);
    }

    if (mutation.mutationMap.append.indexOf(state) !== -1) {
      return self.append(key, value);
    }

    if (mutation.mutationMap.delete.indexOf(state) !== -1) {
      return self.delete(key);
    }
    throw errorsManager.notSupportedNotationKeyError('mutation', state);
  });
};

/**
 * Set value by key-name
 * If value is null <code>com.mapr.db.Mutation.setNull</code> is used, otherwise - <code>com.mapr.db.Mutation.set</code>
 * @param {string} name key-name
 * @param {*} value value to set
 * @returns {mutation}
 */
mutation.prototype.set = function (name, value) {
  this.jMutation = typeChecker.isNull(value) ?
    this.jMutation.setNullSync(name) :
    this.jMutation.setSync(name, JavaJsConverter.convertJsToJava(value));
  return this;
};

/**
 * Set or replace value by key-name
 * If value is null <code>com.mapr.db.Mutation.setOrReplaceNull</code> is used, otherwise - <code>com.mapr.db.Mutation.setOrReplace</code>
 * @param name key-name
 * @param value value to set
 * @returns {mutation}
 */
mutation.prototype.setOrReplace = function (name, value) {
    this.jMutation = typeChecker.isNull(value) ?
      this.jMutation.setOrReplaceNullSync(name) :
      this.jMutation.setOrReplaceSync(name, JavaJsConverter.convertJsToJava(value));
  return this;
};

/**
 * Append to the value by key-name
 * Uses <code>com.mapr.db.Mutation.append</code>
 * @param {string} name key-name
 * @param {string|array} value value to append
 * @throws {ArgumentTypesWhiteListError}
 * @returns {mutation}
 */
mutation.prototype.append = function (name, value) {
  mutation.checkValueType(['string', 'array'], value, 'append', 2);
  this.jMutation = this.jMutation.appendSync(name, JavaJsConverter.convertJsToJava(value));
  return this;
};

/**
 * Increment value by key-name
 * Uses <code>com.mapr.db.Mutation.increment</code>
 * @param {string} name key-name
 * @param {number} value value to append
 * @throws {ArgumentTypesWhiteListError}
 * @returns {mutation}
 */
mutation.prototype.increment = function(name, value) {
  mutation.checkValueType(['number'], value, 'increment', 2);
  this.jMutation = this.jMutation.incrementSync(name, value);
  return this;
};

/**
 * Delete value by key-name
 * Uses <code>com.mapr.db.Mutation.delete</code>
 * @param {string} name key-name
 * @returns {mutation}
 */
mutation.prototype.delete = function(name) {
  this.jMutation = this.jMutation.deleteSync(name);
  return this;
};

/**
 * Build mutation
 * Uses <code>com.mapr.db.Mutation.build</code>
 * @returns {mutation}
 */
mutation.prototype.build = function () {
  this.jMutation = this.jMutation.buildSync();
  return this;
};

module.exports = mutation;