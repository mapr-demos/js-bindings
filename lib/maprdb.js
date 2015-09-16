var maprJClass = require('./jexports/MapRDBStaticClass');
var java = require('./jexports/javaInstance').javaInstance();
var table = require('./table');
var callbacksMaster = require('./utils/callbacksMaster');

/** @module maprdb **/
module.exports = {

  /**
   * Create specified table asynchronously. Pass callback function as second parameter to get error if appeared
   * or created table instance.
   *
   * @param {string} tablePath path to the table
   * @param {function} callback
   * @returns {*}
   * @method createTable
   */
  createTable: function(tablePath, callback) {
    return maprJClass.createTable(tablePath, callbacksMaster.getCallbackWithTable(callback));
  },

  /**
   * Create table synchronously.
   *
   * @see {@link createTable}
   * @param {string} tablePath path to the table
   * @returns {*}
   * @method createTableSync
   */
  createTableSync: function(tablePath) {
    return new table(maprJClass.createTableSync(tablePath));
  },

  /**
   * Delete specified table asynchronously. Pass callback function as second parameter to get error if appeared.
   *
   * @param {string} tablePath path to the table
   * @param {function} callback
   * @returns {*}
   * @method deleteTable
   */
  deleteTable: function(tablePath, callback) {
    return maprJClass.deleteTable(tablePath, callbacksMaster.getCallbackWithTable(callback));
  },

  /**
   * Delete table synchronously.
   *
   * @see {@link deleteTable}
   * @param {string} tablePath path to the table
   * @returns {*}
   * @method createTableSync
   */
  deleteTableSync: maprJClass.deleteTableSync,

  /**
   * Check if specified table exists.
   *
   * @param {string} tablePath path to the table
   * @returns {boolean}
   * @method tableExists
   */
  exists: function(tablePath) {
    return maprJClass.tableExistsSync(tablePath);
  },

  /**
   * Get table by path.
   *
   * @param {string} tablePath path to the table
   * @returns {table}
   * @method getTable
   */
  getTable: function (tablePath) {
    return new table(maprJClass.getTableSync(tablePath));
  }
};
