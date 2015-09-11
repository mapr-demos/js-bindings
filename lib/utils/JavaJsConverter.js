var java = require('../../lib/jexports/javaInstance').javaInstance();
var typeChecker = require('./typeChecker');

module.exports = {

  convertJsToJava: function (mixedVariable) {

    var self = this;

    if (typeChecker.isArray(mixedVariable)) {
      var list = java.newInstanceSync('java.util.ArrayList');
      mixedVariable.forEach(function (item) {
        list.addSync(self.toString(item));
      });
      return list;
    }

    if (typeChecker.isObject(mixedVariable)) {
      var hashMap = java.newInstanceSync('java.util.HashMap');
      Object.keys(mixedVariable).forEach(function (key) {
        hashMap.putSync(self.toString(key), self.toString(mixedVariable[key]));
      });
      return hashMap;
    }

    if(typeChecker.isDate(mixedVariable)) {
      return java.newInstanceSync('java.sql.Timestamp', java.newLong(mixedVariable.getTime()));
    }

    return mixedVariable;

  }

};