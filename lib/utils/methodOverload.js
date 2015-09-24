var errorsManager = require('./errorsManager');
var typeChecker = require('./typeChecker');
var slice = Array.prototype.slice;

/** @module methodOverload **/

/**
 * @constructor
 * @param {arguments} args arguments passed to function
 */
var MethodOverload = function (args) {
  this.combo = [];
  this.argumentsMap = {};
  errorsManager.assert(args && args.length, errorsManager.noArgumentsError());
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
  keys.forEach(function (i) {
    var filtered = args.filter(self.argumentsMap[i].filterF);
    if (filtered.length) {
      res[i] = self.argumentsMap[i].castF(filtered[0]);
    }
  });
  return res;
};

/**
 * @returns {MethodOverload}
 */
MethodOverload.prototype.addCombo = function () {
  errorsManager.assert(arguments && arguments.length, errorsManager.noArgumentsError());
  errorsManager.assert(typeChecker.checkEachType(slice.call(arguments), 'string'), 'Each argument should be a string');
  this.combo.push(slice.call(arguments));
  return this;
};

/**
 * Attach filter function to specified argument. Required
 *
 * @param {string} argName name of the argument
 * @param {Function} filterFunc function to detect argument, should returns always <code>Boolean</code>
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
 * Search possible combination using passed combinations, argument filtering and convertation
 */
MethodOverload.prototype.build = function () {
  var filledArgs = this.createArgumentsMap();
  this.argsList = this.getFromCombinations(filledArgs);
  errorsManager.assert(this.argsList !== null, errorsManager.notSupportedMethodSignatureError('build', this.args, this.combo, this.argumentsMap));
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
 * @param {object} args passed arguments
 * @returns {array}
 */
MethodOverload.prototype.getFromCombinations = function (args) {
  var ret = this.combo
    .map(function (keys) {
      var res = keys.map(function (key) {
        return args[key];
      }).filter(function (i) {
        return !!i;
      });
      return res.length === keys.length ? res : false;
    })
    .filter(function (i) {
      return i !== false;
    }).sort(function (a, b) {
      return a.length < b.length;
    });
  return ret && ret[0] ? ret[0] : null;
};

module.exports = MethodOverload;
