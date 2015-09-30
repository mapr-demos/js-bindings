var java = require('./jexports/javaInstance').javaInstance();
var maprJClass = function() {
  return require('./jexports/MapRDBStaticClass');
};
var table = function() {
  return require('./table');
};
var callbacksMaster = function () {
  return require('./utils/callbacksMaster');
};

/** @module maprdb **/
module.exports = {
  set maprHomeDir(dirPath) {
    java.options = java.options.filter(function(i) {
      return i.indexOf('-Dmapr.home.dir=') === -1;
    });
    java.options.push('-Dmapr.home.dir=' + dirPath);
  },

  /**
   * Path to mapr home directory.
   *
   * @property {string} maprHomeDir - mapr home dir setter
   */
  get maprHomeDir() {
    var optionPrefix = '-Dmapr.home.dir=';
    var option = java.options.filter(function(i) {
      return i.indexOf(optionPrefix) > -1;
    })[0];
    return option ? option.replace(optionPrefix, '') : null;
  },

  /**
   * List of java options. You can add any option you want using <code>push</code> method.
   *
   * @returns {string[]}
   */
  get jvmOptions() {
    return java.options;
  },

  /**
   * List of java -classpath option values. You can add path to jar, file, or directory by simply <code>push</code> or <code>pushDir</code>.
   *
   * @returns {string[]}
   */
  get jvmClasspath() {
    return java.classpath;
  },

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
    return maprJClass().createTable(tablePath, callbacksMaster().getCallbackWithTable(callback));
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
    maprJClass().createTableSync(tablePath);
    return this.getTable(tablePath);
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
    return maprJClass().deleteTable(tablePath, callbacksMaster().getCallbackWithTable(callback));
  },

  /**
   * Delete table synchronously.
   *
   * @see {@link deleteTable}
   * @param {string} tablePath path to the table
   * @returns {*}
   * @method createTableSync
   */
  deleteTableSync: function(tablePath) {
    maprJClass().deleteTableSync(tablePath);
  },

  /**
   * Check if specified table exists.
   *
   * @param {string} tablePath path to the table
   * @returns {boolean}
   * @method tableExists
   */
  exists: function(tablePath) {
    return maprJClass().tableExistsSync(tablePath);
  },

  /**
   * Get table by path.
   *
   * @param {string} tablePath path to the table
   * @returns {table}
   * @method getTable
   */
  getTable: function (tablePath) {
    var tableClass = table();
    return new tableClass(maprJClass().getTableSync(tablePath));
  }
};
