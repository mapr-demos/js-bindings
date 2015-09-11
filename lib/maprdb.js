var maprJClass = require('./jexports/MapRDBStaticClass')

module.exports = {
  createTable: function(tablePath) {
    return maprJClass.createTableSync(tablePath);
  }
};
