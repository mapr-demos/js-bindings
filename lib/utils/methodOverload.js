var errorsManager = require('./errorsManager');
var typeChecker = require('./typeChecker');
var slice = Array.prototype.slice;

/** @module methodOverload **/

/**
 * @typedef {{humanFriendlyTypeMessage: string, filterF: function, castF: function}} argumentsMapItem
 */

/**
 * @constructor
 * @param {arguments} args arguments passed to function
 */
var MethodOverload = function (args) {
  /**
   * @type {string[][]}
   */
  this.combos = [];
  /**
   * Each value is argumentsMapItem
   * @see argumentsMapItem
   * @type {object}
   */
  this.argumentsMap = {};
  errorsManager.assert(args && args.length, errorsManager.noArgumentsError());
  /**
   * @type {array}
   */
  this.args = slice.call(args);
};

/**
 *
 * @returns {object} map which contains key=argument name, value=argument value applied to cast function
 */
MethodOverload.prototype.createArgumentsMap = function () {
  var res = {};
  var self = this;
  var args = slice.call(this.args);
  var keys = Object.keys(this.argumentsMap);
  keys.forEach(function (argumentsMapKey) {
    var filtered = args.filter(self.argumentsMap[argumentsMapKey].filterF);
    if (filtered.length) {
      var v = self.argumentsMap[argumentsMapKey].castF(filtered[0]);
      errorsManager.assert(typeChecker.getType(v) !== 'undefined', '"castF" for "' + argumentsMapKey + '" should return some value');
      res[argumentsMapKey] = v;
    }
  });
  return res;
};

/**
 * @param {...string}
 * @returns {MethodOverload}
 */
MethodOverload.prototype.addCombo = function () {
  errorsManager.assert(arguments && arguments.length, errorsManager.noArgumentsError());
  errorsManager.assert(typeChecker.checkEachType(slice.call(arguments), 'string'), 'Each argument should be a string');
  this.combos.push(slice.call(arguments));
  return this;
};

/**
 * Attach filter function to specified argument. Required
 *
 * @param {string} argName name of the argument
 * @param {Function} filterFunc function to detect argument, should always returns <code>Boolean</code>
 * @param {String} [humanFriendlyTypeMessage]
 * @returns {MethodOverload}
 */
MethodOverload.prototype.inspect = function (argName, filterFunc, humanFriendlyTypeMessage) {
  errorsManager.assert(typeChecker.isFunction(filterFunc), errorsManager.argumentTypesWhiteListError(['function'], typeChecker.getType(filterFunc), 'inspect', 2));
  this.addArgToList(argName);
  this.argumentsMap[argName].filterF = filterFunc;
  this.argumentsMap[argName].humanFriendlyTypeMessage = '' + humanFriendlyTypeMessage;
  return this;
};

/**
 * Attach convert function to specified argument. Not Required
 *
 * @param {string} argName name of the argument
 * @param {Function} convertFunc function to process on the caught argument
 * @returns {MethodOverload}
 */
MethodOverload.prototype.castTo = function (argName, convertFunc) {
  errorsManager.assert(typeChecker.isFunction(convertFunc), errorsManager.argumentTypesWhiteListError(['function'], typeChecker.getType(convertFunc), 'castTo', 2));
  this.addArgToList(argName);
  this.argumentsMap[argName].castF = convertFunc;
  return this;
};

/**
 * Search possible combination using passed combinations, argument filtering and conversion
 */
MethodOverload.prototype.build = function () {
  var filledArgs = this.createArgumentsMap();
  this.argsList = this.getFromCombinations(filledArgs);
  errorsManager.assert(!typeChecker.isNull(this.argsList), errorsManager.notSupportedMethodSignatureError('build', this.args, this.combos, this.argumentsMap));
};

/**
 * Get final result.
 *
 * @returns {array}
 */
MethodOverload.prototype.list = function () {
  return this.argsList;
};

/**
 * Create default filter and cast function for specified argument
 * @param {string} argName argument name
 */
MethodOverload.prototype.addArgToList = function (argName) {
  if (!this.argumentsMap[argName]) {
    this.argumentsMap[argName] = {
      humanFriendlyTypeMessage: '',
      filterF: function () {
        return false;
      },
      castF: function (i) {
        return i;
      }
    };
  }
};


/**
 * Return list of arguments that match one of the combination
 * Combination with greater number of arguments will be returned
 * if there are more than 1 appropriate combo
 * @param {object} args passed arguments
 * @returns {array}
 */
MethodOverload.prototype.getFromCombinations = function (args) {
  var ret = this.combos
    // get arguments values for each combo
    .map(function (combo) {
      /* @var combo {string[]} */
      var res = combo
        .map(function (argName) {
          return args[argName]; // @type {*} may be undefined
        })
        // remove undefined/null etc
        .filter(function (argValue) {
          return !!argValue;
        });
      // if combo is not fully filled, it isn't valid and shouldn't be used
      return res.length === combo.length ? res : false;
    })
    .filter(function (i) {
      return i !== false;
    })
    // sort combinations by number of arguments (desc)
    .sort(function (a, b) {
      return a.length < b.length;
    });
  return ret && ret[0] ? ret[0] : null;
};

module.exports = MethodOverload;
