/** @module methodOverload **/

/**
 * @constructor
 * @param {arguments} args arguments passed to function
 */
var MethodOverload = function(args) {
  this.combo = [];
  this.argumentsMap = {};
  this.args = Array.prototype.slice.call(args);
};

/**
 *
 * @param {array} args arguments to process
 * @param {object} argumentMap map of arguments with linked filter function to catch argument by some condition
 *  e.g. argument type, and cast function to apply on catched argument e.g. convert JSON to Java Class
 * @returns {object} map which contains key=argument name, value=argument value applied to cast function
 */
MethodOverload.prototype.createArgumentsMap = function (args, argumentMap) {
  var res = {};
  var keys = Object.keys(argumentMap);
  Object.keys(argumentMap).forEach(function (i) {
    var filtered = args.filter(argumentMap[i].filterF);
    if (filtered.length) {
      res[i] = argumentMap[i].castF(filtered[0]);
    }
  });
  return res;
};

/**
 * @param {string[]} names... argument human names combination of possible overloading
 */
MethodOverload.prototype.addCombo = function () {
  this.combo.push(Array.prototype.slice.call(arguments));
};

/**
 * Attach filter function to specified argument. Required
 *
 * @param {string} argName name of the argument
 * @param {Function} filterFunc function to detect argument, should returns always <code>Boolean</code>
 * @returns {MethodOverload}
 */
MethodOverload.prototype.inspect = function (argName, filterFunc) {
  this.addArgToList(argName);
  this.argumentsMap[argName].filterF = filterFunc;
  return this;
};

/**
 * Attach convert function to specified argument. Not Required
 *
 * @param {string} argName name of the argument
 * @param {Function} convertFunc function to process on the catched argument
 * @returns {MethodOverload}
 */
MethodOverload.prototype.castTo = function (argName, convertFunc) {
  this.addArgToList(argName);
  this.argumentsMap[argName].castF = convertFunc;
  return this;
};

/**
 * Search possible combination using passed combinations, argument filtering and convertation
 * @TODO add signature exception based on combinations
 */
MethodOverload.prototype.build = function () {
  var filledArgs = this.createArgumentsMap(Array.prototype.slice.call(this.args), this.argumentsMap);
  this.argsList = this.getFromCombinations(filledArgs, this.combo);
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
      filterF: function() { return false; },
      castF: function(i) { return i; }
    };
  }
};


/**
 * Return list of arguments that match one of the combination
 * @param {array} args passed arguments
 * @param {array[]} overloadCombinations possible combinations
 * @returns {array}
 */
MethodOverload.prototype.getFromCombinations = function(args, overloadCombinations) {
  return overloadCombinations
    .map(function(keys) {
      var res = keys.map(function(key) {
        return args[key];
      }).filter(function(i) {
        return !!i;
      });
      return res.length === keys.length ? res : false;
    })
    .filter(function(i) {
      return i !== false;
    }).sort(function(a,b) { return a.length < b.length; })[0];
};

module.exports = MethodOverload;
