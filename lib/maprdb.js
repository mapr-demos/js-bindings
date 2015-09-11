var maprJClass = require('./jexports/MapRDBStaticClass');

/**
 * Check if first argument is a function
 * If true - return it, if not - return default empty function
 *
 * @param {*} func
 * @returns {function}
 * @method getCallback
 */
function getCallback(func) {
  return '[object Function]' === {}.toString.call(func) ? func : function() {};
}

/** @module maprdb **/
module.exports = {

  /**
   * Create specified table asynchronously. Pass callback function as second parametr to get error if appeared
   * or created table instance.
   *
   * @param {string} tablePath - path to the table
   * @param {function} callback
   * @method createTable
   * @returns {*}
   */
  createTable: function(tablePath, callback) {
    return maprJClass.createTable(tablePath, getCallback(callback));
  },

  /**
   * Create table synchronously.
   *
   * @see {@link createTable}
   * @param {string} tablePath - path to the table
   * @method createTableSync
   * @returns {*}
   */
  createTableSync: maprJClass.createTableSync,

  /**
   * Delete specified table asynchronously. Pass callback function as second parametr to get error if appeared.
   *
   * @param {string} tablePath - path to the table
   * @param {function} callback
   * @method deleteTable
   * @returns {*}
   */
  deleteTable: function(tablePath, callback) {
    return maprJClass.deleteTable(tablePath, getCallback(callback));
  },

  /**
   * Delete table synchronously.
   *
   * @see {@link deleteTable}
   * @param {string} tablePath - path to the table
   * @method createTableSync
   * @returns {*}
   */
  deleteTableSync: maprJClass.deleteTableSync,

  /**
   * Check if specified table exists.
   *
   * @param {string} tablePath - path to the table
   * @method tableExists
   * @returns {boolean}
   */
  exists: function(tablePath) {
    return maprJClass.tableExistsSync(tablePath);
  }
};
