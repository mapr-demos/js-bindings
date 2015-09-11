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
  exists: ['$exists']
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

module.exports = condition;