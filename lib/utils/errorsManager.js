var typeChecker = require('./typeChecker');

/**
 * @module errorsManager
 */

/**
 * Cover digit/number to the sequence one
 * 1 -> '1st'
 * 2 -> '2nd'
 * 3 -> '3rd'
 * 4 -> '4th'
 * ...
 * @param {number} index
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
 * @param {string[]} a
 * @returns {string}
 */
function toComaList(a) {
  return a.length ? a.map(function (t) {
    return '"' + t + '"';
  }).join(', ') : '';
}

module.exports = {

  /**
   * Error-message for invalid constructor's parameter
   *
   * @param {string} klass instance type (mutation, condition etc)
   * @param {string} needed needed value type
   * @param {string} type gotten value type
   * @returns {string}
   * @method constructorArguments
   */
  constructorArguments: function (klass, needed, type) {
    return '"' + klass + '"-constructor expects "' + needed + '", but got "' + type + '".';
  },

  /**
   * Error-message for invalid notations
   *
   * @param {string} klass instance type (mutation, condition etc)
   * @param {string} key key-name with invalid value
   * @param {*} obj invalid value
   * @returns {string}
   * @method invalidNotation
   */
  invalidNotation: function (klass, key, obj) {
    return 'Invalid "' + klass + '"-field for key "' + key + '". Should be an object like "{field: {$cond: \'state\'}}" but got "' + typeChecker.getType(obj) + '".';
  },

  noArguments: function() {
    return 'Called without arguments.';
  },

  assert: function(condition, message) {
    if (!condition) {
      throw message;
    }
  }

};
