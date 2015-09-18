var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var JavaJsConverter = require('./utils/JavaJsConverter');
var maprJClass = require('./jexports/MapRDBStaticClass');
var errorsManager = require('./utils/errorsManager');

/** @module condition **/
var jOp = function() {};

/**
 * Get <code>com.mapr.db.Condition$Op</code> state by its name
 *
 * @param {string} name state name
 * @returns {object}
 * @throws {InvalidConditionError}
 */
jOp.prototype.getField = function (name) {
  try {
    return java.getStaticFieldValue('com.mapr.db.Condition$Op', name);
  }
  catch(e) {
    throw errorsManager.invalidConditionError(name);
  }
};


/**
 * @param {object|object[]} json object or array with notations
 * @constructor
 * @throws {ConstructorArgumentsError}
 */
var Condition = function(json) {
  this.jCondition = maprJClass.newConditionSync();
  this.jOp = new jOp();
  if (typeChecker.isArray(json) && typeChecker.checkEachType(json, 'object')) {
    this.parseConditionOr(json);
    this.build();
    return this.jCondition;
  }
  if (typeChecker.isObject(json)) {
    this.parseConditionAnd(json);
    this.build();
    return this.jCondition;
  }
  throw errorsManager.constructorArgumentsError('condition', 'object or array of objects', typeChecker.getType(json));
};

/**
 * Check value (<code>value</code>) type to be in the list of allowed type (<code>allowedTypes</code>)
 * If type isn't allowed throws Error
 *
 * @param {string[]} allowedTypes list of allowed types
 * @param {*} value checked value
 * @param {string} methodName name of the function where this value going to be used
 * @param {number} index value's position in the list of <code>methodName</code> arguments
 * @throws {ArgumentTypesWhiteListError}
 * @static
 */
Condition.checkValueType = function(allowedTypes, value, methodName, index) {
  var valueType = typeChecker.getType(value);
  if (allowedTypes.indexOf(valueType) === -1) {
    throw errorsManager.argumentTypesWhiteListError(allowedTypes, valueType, methodName, index);
  }
};

/**
 * @static
 * @property conditionMap
 * @type {object}
 */
Condition.conditionMap = {
  eq:  ['$eq', '$equal', '='],
  neq: ['$ne', '$neq', '!='],
  le: ['$lt', '$less', '<'],
  leq: ['$lte', '$le', '<='],
  gt: ['$gt', '$greater', '>'],
  gte: ['$ge', '$gte', '>='],
  between: ['$between'],
  in: ['$in'],
  nin: ['!$in'],
  exists: ['$exists'],
  matches: ['$matches', '$like'],
  notMatches: ['!$matches', '!$like'],
  _or: ['$or'],
  _and: ['$and']
};

/**
 * Parse object with notations
 *
 * @param {object} json json with notations
 * @throws {NotSupportedNotationKeyError}
 */
Condition.prototype.parseConditionAnd = function(json) {
  var self = this;
  var keys = Object.keys(json);
  if (keys.length > 1) {
    this.and();
  }
  keys.forEach(function(key) {

    var state, value;
    if (typeChecker.isObject(json[key])) {
      state = Object.keys(json[key])[0];
      value = json[key][state];
    }
    else {
      state = '$eq'; // default `and` state
      value = json[key];
    }

    if (Condition.conditionMap.eq.indexOf(state) !== -1) {
      return self.is(key, 'EQUAL', value);
    }
    if (Condition.conditionMap.neq.indexOf(state) !== -1) {
      return self.is(key, 'NOT_EQUAL', value);
    }
    if (Condition.conditionMap.le.indexOf(state) !== -1) {
      return self.is(key, 'LESS', value);
    }
    if (Condition.conditionMap.leq.indexOf(state) !== -1) {
      return self.is(key, 'LESS_OR_EQUAL', value);
    }
    if (Condition.conditionMap.gt.indexOf(state) !== -1) {
      return self.is(key, 'GREATER', value);
    }
    if (Condition.conditionMap.gte.indexOf(state) !== -1) {
      return self.is(key, 'GREATER_OR_EQUAL', value);
    }
    if (Condition.conditionMap.between.indexOf(state) !== -1) {
      return self.between(key, value);
    }
    if (Condition.conditionMap.in.indexOf(state) !== -1) {
      return self.in(key, value);
    }
    if (Condition.conditionMap.nin.indexOf(state) !== -1) {
      return self.nin(key, value);
    }
    if (Condition.conditionMap.exists.indexOf(state) !== -1) {
      return self.exists(key, value);
    }
    if (Condition.conditionMap.matches.indexOf(state) !== -1) {
      return self.matches(key, value, true);
    }
    if (Condition.conditionMap.notMatches.indexOf(state) !== -1) {
      return self.matches(key, value, false);
    }
    if (Condition.conditionMap._and.indexOf(state) !== -1) {
      return self._andInner(key, value);
    }
    if (Condition.conditionMap._or.indexOf(state) !== -1) {
      return self._orInner(key, value);
    }
    throw errorsManager.notSupportedNotationKeyError('condition', state);
  });
  if (keys.length > 1) {
    this.close();
  }
};

/**
 * Parse list of conditions
 *
 * @param {object[]} list array of JSONs. Each JSON - separated block with notations
 * @throws {NotSupportedNotationKeyError}
 */
Condition.prototype.parseConditionOr = function (list) {
  var self = this;
  if (list.length > 1) {
    this.or();
  }
  list.forEach(function (c) {
    self.parseConditionAnd(c);
  });
  if (list.length > 1) {
    this.close();
  }
};

/**
 * Alias for <code>com.mapr.db.Condition.and</code>
 *
 * @returns {Condition}
 */
Condition.prototype.and = function () {
  this.jCondition.andSync();
  return this;
};

/**
 * Alias for <code>com.mapr.db.Condition.or</code>
 *
 * @returns {Condition}
 */
Condition.prototype.or = function () {
  this.jCondition.orSync();
  return this;
};

/**
 * Add 'is' rule to the condition
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {string} state (field of the 'com.mapr.db.Condition$Op')
 * @param {*} value checked value (may be almost anything, but not array, object or null)
 * @returns {Condition}
 * @throws {NullTypeError}
 * @throws {ArgumentTypesBlackListError}
 */
Condition.prototype.is = function (key, state, value) {
  if (typeChecker.isNull(value)) {
    throw errorsManager.nullTypeError('is', 3);
  }
  var disallowedTypes = ['array', 'object'];
  var valueType = typeChecker.getType(value);
  if(disallowedTypes.indexOf(valueType) !== -1) {
    throw errorsManager.argumentTypesBlackListError(disallowedTypes, 'is', 3);
  }
  this.jCondition.isSync(key, this.jOp.getField(state), JavaJsConverter.convertJsToJava(value));
  return this;
};

/**
 * Add 'in' rule to the condition
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {object[]} list list of values, one of which should be equal to the document's field
 * @returns {Condition}
 * @throws {ArgumentTypesWhiteListError}
 */
Condition.prototype.in = function (key, list) {
  Condition.checkValueType(['array'], list, 'in', 2);
  this.jCondition.inSync(key, JavaJsConverter.convertJsToJava(list));
  return this;
};

/**
 * Add 'notIn' rule to the condition
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {object[]} list list of values that shouldn't be equal to the document's field
 * @returns {Condition}
 * @throws {ArgumentTypesWhiteListError}
 */
Condition.prototype.nin = function (key, list) {
  Condition.checkValueType(['array'], list, 'nin', 2);
  this.jCondition.notInSync(key, JavaJsConverter.convertJsToJava(list));
  return this;
};

/**
 * Add 'exists/not exists' rule to the condition
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {boolean} value true - key should exists, false - shouldn't
 * @returns {Condition}
 * @throws {ArgumentTypesWhiteListError}
 */
Condition.prototype.exists = function (key, value) {
  Condition.checkValueType(['boolean'], value, 'exists', 2);
  value ? this.jCondition.existsSync(key) : this.jCondition.notExistsSync(key);
  return this;
};

/**
 * Alias for <code>com.mapr.db.Condition.close</code>
 *
 * @returns {Condition}
 */
Condition.prototype.close = function () {
  this.jCondition.closeSync();
  return this;
};

/**
 * Build condition.
 *
 * @returns {Condition}
 */
Condition.prototype.build = function() {
  this.jCondition.buildSync();
  return this;
};

/**
 * Add 'between' rule to the condition
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {number[]} value array with two numbers. Needed value should be between this two numbers
 * @return {Condition}
 */
Condition.prototype.between = function (key, value) {
  if (!typeChecker.isArray(value) || value.length !== 2 || !typeChecker.checkEachType(value, 'number')) {
    throw new Error('`between` 2nd argument should be an array of the two numbers!');
  }
  this.and();
  this.is(key, 'GREATER_OR_EQUAL', value[0]);
  this.is(key, 'LESS_OR_EQUAL', value[1]);
  this.close();
  return this;
};

/**
 * Add 'match/not match' rule to the condition
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {string} value string with regexp for matching/not matching document's key-value
 * @param {boolean} flag true - use matchesSync, false - use notMatchesSync
 * @returns {Condition}
 */
Condition.prototype.matches = function (key, value, flag) {
  Condition.checkValueType(['string'], value, 'matches', 2);
  flag ? this.jCondition.matchesSync(key, value) : this.jCondition.notMatchesSync(key, value);
  return this;
};

/**
 * Parse combined condition like:
 * <pre>
 *   {key: {'$and': {'$ge': 30, '$lt': 40}}}
 * </pre>
 * Convert each "and"-statement to the object like:
 * <pre>
 *   {key: {'$ge': 30}},
 *   {key: {'$lt': 40}}
 * </pre>
 * Wrapping with 'and' (@see and)
 *
 * @param {string} key document's field-name which is affected by notation
 * @param {object} value json with notations
 * @private
 */
Condition.prototype._andInner = function (key, value) {
  var keys = Object.keys(value);
  if (keys.length > 1) {
    this.and();
  }
  var self = this;
  keys.forEach(function (k) {
    var newValue = {};
    newValue[key] = {};
    newValue[key][k] = value[k];
    self.parseConditionAnd(newValue);
  });
  if (keys.length > 1) {
    this.close();
  }
};

/**
 * Parse combined condition like:
 * <pre>
 *  {key: {'$or': [ {'$and': {'$ge': 30, '$lt': 40}}, {'$and': {'$ge': 50, '$lt': 60}}]}}
 * </pre>
 * Convert each "or"-statement to the object like
 * <pre>
 *  {key: {'$and': {'$ge': 30, '$lt': 40}}},
 *  {key: {'$and': {'$ge': 50, '$lt': 60}}}
 * </pre>
 * Wrapping with 'or'
 *
 * @see Condition#or
 * @param {string} key document's field-name which is affected by notation
 * @param {array} value array of JSONs. Each JSON - separated block with notations
 * @private
 */
Condition.prototype._orInner = function (key, value) {
  if (value.length > 1) {
    this.or();
  }
  var self = this;
  value.forEach(function (v) {
    var newValue = {};
    newValue[key] = v;
    self.parseConditionAnd(newValue);
  });
  if (value.length > 1) {
    this.close();
  }
};

/**
 * Return string representation of created condition
 *
 * @returns {string}
 */
Condition.prototype.toString = function() {
  return this.jCondition.toStringSync();
};

module.exports = Condition;
