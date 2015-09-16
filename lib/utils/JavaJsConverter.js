var java = require('../../lib/jexports/javaInstance').javaInstance();
var typeChecker = require('./typeChecker');

/** @module utils/JavaJsConverter **/
module.exports = {

  /**
   * Convert Java object to the proper JS variable
   * java.lang.Number -> number
   * java.util.Date   -> Date
   * java.util.List   -> array
   * java.util.Map    -> object
   * everything else  -> leave without changes
   *
   * @param {*} mixedVariable
   * @returns {*}
   * @method convertJavaToJs
   */
  convertJavaToJs: function (mixedVariable) {

    if (!typeChecker.isJavaObject(mixedVariable)) {
      return mixedVariable;
    }

    if (java.instanceOf(mixedVariable, 'java.lang.Number')) {
      return mixedVariable.doubleValueSync();
    }

    if (java.instanceOf(mixedVariable, 'java.util.Date')) {
      return new Date(
        mixedVariable.getYearSync() + 1900,
        mixedVariable.getMonthSync(),
        mixedVariable.getDateSync(),
        mixedVariable.getHoursSync(),
        mixedVariable.getMinutesSync(),
        mixedVariable.getSecondsSync()
      );
    }

    if (java.instanceOf(mixedVariable, 'java.util.List')) {
      var ret = [];
      var it = mixedVariable.iteratorSync();
      while (it.hasNextSync()) {
        ret.push(this.convertJavaToJs(it.nextSync()));
      }
      return ret;
    }

    if (java.instanceOf(mixedVariable, 'java.util.Map')) {
      ret = {};
      it = mixedVariable.keySetSync().iteratorSync();
      while (it.hasNextSync()) {
        var key = this.convertJavaToJs(it.nextSync());
        ret[key] = this.convertJavaToJs(mixedVariable.getSync(key));
      }
      return ret;
    }

    return mixedVariable;

  },

  /**
   * Convert JS variable to the proper Java object
   *  Array  -> java.util.ArrayList
   *  Object -> java.util.HashMap
   *  Date   -> java.util.Date
   *  everything else  -> leave without changes
   *
   * @param {*} mixedVariable
   * @returns {object}
   * @method convertJsToJava
   */
  convertJsToJava: function (mixedVariable) {

    var self = this;

    if (typeChecker.isArray(mixedVariable)) {
      var list = java.newInstanceSync('java.util.ArrayList');
      mixedVariable.forEach(function (item) {
        list.addSync(self.convertJsToJava(item));
      });
      return list;
    }

    if (typeChecker.isObject(mixedVariable)) {
      var hashMap = java.newInstanceSync('java.util.HashMap');
      Object.keys(mixedVariable).forEach(function (key) {
        hashMap.putSync(self.convertJsToJava(key), self.convertJsToJava(mixedVariable[key]));
      });
      return hashMap;
    }

    if(typeChecker.isDate(mixedVariable)) {
      return java.newInstanceSync('java.sql.Timestamp', java.newLong(mixedVariable.getTime()));
    }

    return mixedVariable;

  }

};
