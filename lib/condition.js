var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var JavaJsConverter = require('./utils/JavaJsConverter');
var maprJClass = require('./jexports/MapRDBStaticClass');

var jOp = function() {};

jOp.prototype.getField = function (name) {
  return java.getStaticFieldValue('com.mapr.db.Condition$Op', name);
};

var condition = function() {
  this.jCondition = maprJClass.newConditionSync();
  this.jOp = new jOp();
  var c = arguments[0];
  if (typeChecker.isArray(c)) {
    return this.parseConditionOr(c);
  }
  if (typeChecker.isObject(c)) {
    return this.parseConditionAnd(c);
  }
};

condition.conditionMap = {
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
 *
 * @param {object} json
 * @method parseConditionAnd
 */
condition.prototype.parseConditionAnd = function(json) {
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

    if (condition.conditionMap.eq.indexOf(state) !== -1) {
      return self.is(key, 'EQUAL', value);
    }
    if (condition.conditionMap.neq.indexOf(state) !== -1) {
      return self.is(key, 'NOT_EQUAL', value);
    }
    if (condition.conditionMap.le.indexOf(state) !== -1) {
      return self.is(key, 'LESS', value);
    }
    if (condition.conditionMap.leq.indexOf(state) !== -1) {
      return self.is(key, 'LESS_OR_EQUAL', value);
    }
    if (condition.conditionMap.gt.indexOf(state) !== -1) {
      return self.is(key, 'GREATER', value);
    }
    if (condition.conditionMap.gte.indexOf(state) !== -1) {
      return self.is(key, 'GREATER_OR_EQUAL', value);
    }
    if (condition.conditionMap.between.indexOf(state) !== -1) {
      return self.between(key, value);
    }
    if (condition.conditionMap.in.indexOf(state) !== -1) {
      return self.in(key, value);
    }
    if (condition.conditionMap.nin.indexOf(state) !== -1) {
      return self.nin(key, value);
    }
    if (condition.conditionMap.exists.indexOf(state) !== -1) {
      return self.exists(key, value);
    }
    if (condition.conditionMap.matches.indexOf(state) !== -1) {
      return self.matches(key, value, true);
    }
    if (condition.conditionMap.notMatches.indexOf(state) !== -1) {
      return self.matches(key, value, false);
    }
    if (condition.conditionMap._and.indexOf(state) !== -1) {
      return self._andInner(key, value);
    }
    if (condition.conditionMap._or.indexOf(state) !== -1) {
      return self._orInner(key, value);
    }
  });
};

/**
 *
 * @param {object[]} list
 * @method parseConditionOr
 */
condition.prototype.parseConditionOr = function (list) {
  var self = this;
  if (list.length > 1) {
    this.or();
  }
  list.forEach(function (c) {
    self.parseConditionAnd(c);
  });
};

/**
 *
 * @returns {condition}
 * @method and
 */
condition.prototype.and = function () {
  this.jCondition.andSync();
  return this;
};

/**
 *
 * @returns {condition}
 * @method or
 */
condition.prototype.or = function () {
  this.jCondition.orSync();
  return this;
};

/**
 *
 * @param {string} key
 * @param {string} state (field of the 'com.mapr.db.Condition$Op')
 * @param {string} value
 * @returns {condition}
 * @method is
 */
condition.prototype.is = function (key, state, value) {
  this.jCondition.isSync(key, this.jOp.getField(state), JavaJsConverter.convertJsToJava(value));
  return this;
};

/**
 *
 * @param {string} key
 * @param {object[]} list
 * @returns {condition}
 * @method in
 */
condition.prototype.in = function (key, list) {
  if (!typeChecker.isArray(list)) {
    throw '`in` second parameter should be an array of objects';
  }
  var self = this;
  this.or();
  list.forEach(function (item) {
    self.is(key, 'EQUAL', item);
  });
  this.close();
  return this;
};

/**
 *
 * @param {string} key
 * @param {object[]} list
 * @returns {condition}
 * @method nin
 */
condition.prototype.nin = function (key, list) {
  if (!typeChecker.isArray(list)) {
    throw '`nin` second parameter should be an array of objects';
  }
  var self = this;
  this.and();
  list.forEach(function (item) {
    self.is(key, 'NOT_EQUAL', item);
  });
  this.close();
  return this;
};

/**
 *
 * @param {string} key
 * @param {boolean} value
 * @returns {condition}
 * @method exists
 */
condition.prototype.exists = function (key, value) {
  if (!typeChecker.isBoolean(value)) {
    throw '`exists` second parameter should be a boolean';
  }
  value ? this.jCondition.existsSync(key) : this.jCondition.notExistsSync(key);
  return this;
};

/**
 *
 * @returns {condition}
 * @method close
 */
condition.prototype.close = function () {
  this.jCondition.closeSync();
  return this;
};

/**
 *
 * @param {string} key
 * @param {number[]} value
 * @method between
 */
condition.prototype.between = function (key, value) {
  if (!typeChecker.isArray(value) || value.length !== 2) {
    throw '`between` value should be an array of the two elements!';
  }
  this.and();
  this.is(key, 'GREATER_OR_EQUAL', value[0]);
  this.is(key, 'LESS_OR_EQUAL', value[1]);
  this.close();
};

/**
 *
 * @param {string} key
 * @param {string} value
 * @param {boolean} flag true - use matchesSync, false - use notMatchesSync
 * @returns {condition}
 * @method matches
 */
condition.prototype.matches = function (key, value, flag) {
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
 * @param {string} key
 * @param {object} value
 * @private
 * @method _andInner
 */
condition.prototype._andInner = function (key, value) {
  this.and();
  var self = this;
  Object.keys(value).forEach(function (k) {
    var newValue = {};
    newValue[key] = {};
    newValue[key][k] = value[k];
    self.parseConditionAnd(newValue);
  });
  this.close();
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
 * Wrapping with 'or' (@see or)
 * @param {string} key
 * @param {object} value
 * @private
 * @method _orInner
 */
condition.prototype._orInner = function (key, value) {
  this.or();
  var self = this;
  value.forEach(function (v) {
    var newValue = {};
    newValue[key] = v;
    self.parseConditionAnd(newValue);
  });
  this.close();
};

module.exports = condition;