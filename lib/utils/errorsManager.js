var typeChecker = require('./typeChecker');
var InvalidConditionError = require('../errors/InvalidConditionError');
var NullTypeError = require('../errors/NullTypeError');
var ArgumentTypesBlackListError = require('../errors/ArgumentTypesBlackListError');
var ArgumentTypesWhiteListError = require('../errors/ArgumentTypesWhiteListError');
var InvalidNotationError = require('../errors/InvalidNotationError');
var ConstructorArgumentsError = require('../errors/ConstructorArgumentsError');
var NotSupportedNotationKeyError = require('../errors/NotSupportedNotationKeyError');
var NotSupportedSignatureError = require('../errors/NotSupportedSignatureError');
var NoArgumentsError = require('../errors/NoArgumentsError');
var MalformedObjectError = require('../errors/MalformedObjectError');

/**
 * @module errorsManager
 */

/**
 * Cover digit/number to the sequence one
 * <pre>
 * 1 -> '1st'
 * 2 -> '2nd'
 * 3 -> '3rd'
 * 4 -> '4th'
 * ...
 * </pre>
 * @param {number} index number to convert
 * @returns {string}
 */
function digitToSequenceNumber(index) {
  var m = {
    '1': '1st',
    '2': '2nd',
    '3': '3rd'
  };
  return m[index] ? m[index] : (index + 'th');
}

/**
 * Convert list of strings to the string with coma-separated values
 * Example:
 * <pre>
 *   var a = ['a', b', 'c'];
 *   var b = toComaList(a); // '"a", "b", "c"'
 * </pre>
 * @param {string[]} a array of strings that should be converted to coma-separated string
 * @returns {string}
 */
function toComaList(a) {
  return a && a.length ? a.map(function (t) {
    return '"' + t + '"';
  }).join(', ') : '';
}

/**
 * Convert list of signatures to the human readable string
 * Example
 * <pre>
 *   var signatures = [['a', 'b', 'c'], ['a', 'c']];
 *   var argumentsMap = {
 *    a: {
 *      humanFriendlyTypeMessage: 'human A'
 *    },
 *    b: {
 *      humanFriendlyTypeMessage: 'human B'
 *    },
 *    c: {
 *      humanFriendlyTypeMessage: ''
 *    }
 *   };
 *   formatSignatures(signatures, argumentsMap); // '["human A", "human B", "c"] or ["human A", "human B"]'
 * </pre>
 * @param {string[][]} signatures
 * @param {object} argumentsMap
 * @returns {string}
 */
function formatSignatures(signatures, argumentsMap) {
  return signatures.map(function (signature) {
    return '['+signature.map(function (argument) {
      return '"' + (argumentsMap[argument].humanFriendlyTypeMessage || argument) + '"';
    }).join(', ') + ']';
  }).join(' or ');
}

module.exports = {

  /**
   * Error for invalid constructor's parameter
   *
   * @param {string} klass instance type (mutation, condition etc)
   * @param {string} needed needed value type
   * @param {string} type gotten value type
   * @returns {string}
   */
  constructorArgumentsError: function (klass, needed, type) {
    return new ConstructorArgumentsError('"' + klass + '"-constructor expects "' + needed + '", but got "' + type + '".');
  },

  /**
   * Error for invalid notations
   *
   * @param {string} klass instance type (mutation, condition etc)
   * @param {string} key key-name with invalid value
   * @param {*} obj provided invalid value
   * @returns {InvalidNotationError}
   */
  invalidNotationError: function (klass, key, obj) {
    return new InvalidNotationError('Invalid "' + klass + '"-field for key "' + key +
      '". Should be an object like "{field: {$cond: \'state\'}}" but got "' + typeChecker.getType(obj) + '".');
  },

  /**
   * Error for type mismatch. Type isn't one of the allowed
   *
   * @param {string[]} allowedTypes list of allowed type
   * @param {string} valueType type of the argument
   * @param {string} methodName method where argument exists
   * @param {number} index index of argument in function definition
   * @returns {ArgumentTypesWhiteListError}
   */
  argumentTypesWhiteListError: function (allowedTypes, valueType, methodName, index) {
    allowedTypes = typeChecker.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
    return new ArgumentTypesWhiteListError('"' + valueType + '" is not allowed for "' + methodName + '" ' +
      digitToSequenceNumber(index) + ' argument. Only ' + toComaList(allowedTypes) +
      (allowedTypes.length === 1 ? ' is' : ' are') + ' allowed!');
  },

  /**
   * Error for type mismatch. Type is one of the not allowed
   *
   * @param {string[]} disallowedTypes list of disallowed type
   * @param {string} methodName method where argument exists
   * @param {number} index index of argument in function definition
   * @returns {ArgumentTypesBlackListError}
   */
  argumentTypesBlackListError: function (disallowedTypes, methodName, index) {
    disallowedTypes = typeChecker.isArray(disallowedTypes) ? disallowedTypes : [disallowedTypes];
    return new ArgumentTypesBlackListError(toComaList(disallowedTypes) + ' ' +
      (disallowedTypes.length === 1 ? ' is' : ' are') + ' not allowed for "' +
      methodName + '" ' + digitToSequenceNumber(index) + ' argument.');
  },

  /**
   * Error for not allowed null-type argument
   *
   * @param {string} methodName method where argument exists
   * @param {string} index index of argument in function definition
   * @returns {NullTypeError}
   */
  nullTypeError: function(methodName, index) {
    return new NullTypeError('"null" is not allowed for "' + methodName + '" ' + digitToSequenceNumber(index) + ' argument.');
  },

  /**
   * Error for invalid condition state
   *
   * @param {string} name provided state name
   * @returns {InvalidConditionError}
   */
  invalidConditionError: function (name) {
    return new InvalidConditionError('"' + name + '" is invalid condition name. Check "com.mapr.db.Condition$Op" for the list with valid conditions.');
  },

  /**
   * Error for not supported key for notations
   *
   * @param {string} klass instance type (mutation, condition etc)
   * @param {string} key invalid key-name
   * @returns {NotSupportedNotationKeyError}
   */
  notSupportedNotationKeyError: function (klass, key) {
    return new NotSupportedNotationKeyError('"' + key + '" is not supported for "' + klass + '".');
  },

  /**
   *
   * @param {string} methodName
   * @param {array} args
   * @param {*} signatures
   * @param {*} argumentsMap
   * @returns {NotSupportedSignatureError}
   */
  notSupportedMethodSignatureError: function (methodName, args, signatures, argumentsMap) {
    var argTypes = Array.prototype.slice.call(args || []).map(typeChecker.getType.bind(typeChecker)).join(', ');
    return new NotSupportedSignatureError('"Wrong method signature: ' + methodName +
      ' called with [' + argTypes + '] but expected ' + formatSignatures(signatures || [], argumentsMap || {}));
  },

  /**
   * Error for missing key(s) in the document
   *
   * @param {string|string[]} expectedKeys
   * @returns {MalformedObjectError}
   */
  malformedObjectError: function (expectedKeys) {
    var keys = typeChecker.isArray(expectedKeys) ? expectedKeys : [expectedKeys];
    var keysStr = toComaList(keys);
    return new MalformedObjectError('Document should contain key' + (keys.length === 1 ? '' : 's') + ': ' + keysStr + '.');
  },

  /**
   * Error for missing arguments in the some function's call
   *
   * @returns {NoArgumentsError}
   */
  noArgumentsError: function() {
    return new NoArgumentsError('Called without arguments');
  },

  /**
   * Basic error-thrower
   * If condition is <code>false</code> throw an error
   *
   * @param {boolean} condition condition to check
   * @param {string|Error} message if is string, Error is thrown, otherwise - throwed as is
   */
  assert: function(condition, message) {
    if (!condition) {
      throw typeChecker.isString(message) ? new Error(message) : message;
    }
  }

};
