var table = require('../../lib/table');
var typeChecker = require('./typeChecker');

/** @module utils/callbacksMaster **/
module.exports = {

  /**
   * Check if first argument is a function.
   * If true - return its call with wrapping argument into the <code>table</code>, if not - return default empty function.
   *
   * @param {*} func
   * @returns {function}
   * @method getCallbackWithTable
   */
  getCallbackWithTable: function (func) {

    return typeChecker.isFunction(func) ?
      function (err, t) {
        if (typeChecker.isObject(t)) {
          return func(err, new table(t));
        }
        return func(err, t);
      } :
      function () {
      };

  }
};
