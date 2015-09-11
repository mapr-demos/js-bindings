var java = require('../../lib/jexports/javaInstance').javaInstance();
var assert = require('chai').assert;
var JavaJsConverter = require('../../lib/utils/JavaJsConverter');
var typeChecker = require('../../lib/utils/typeChecker');

describe('JavaJsConverter', function () {

  describe('convertJsToJava', function () {

    it('should parse array as `java.util.ArrayList`', function () {
      var result = JavaJsConverter.convertJsToJava([1, 2, 3]);
      assert.ok(java.instanceOf(result, 'java.util.ArrayList'));
    });

    it('should parse object as `java.util.HashMap`', function () {
      var result = JavaJsConverter.convertJsToJava({a: 1, b: 2, c: 3});
      assert.ok(java.instanceOf(result, 'java.util.HashMap'));
    });

    it('should parse date as `java.util.Date`', function () {
      var result = JavaJsConverter.convertJsToJava(new Date());
      assert.ok(java.instanceOf(result, 'java.sql.Timestamp'));
    });

  });

  describe('convertJavaToJs', function() {

    it('should parse `java.lang.Number` as number', function () {
      var javaNumber = java.newLong(1234);
      assert.equal(JavaJsConverter.convertJavaToJs(javaNumber), 1234);
    });

    it('should parse `java.util.List` as array', function () {
      var javaList = java.newInstanceSync('java.util.ArrayList');
      javaList.addSync('item1');
      javaList.addSync('item2');
      assert.deepEqual(JavaJsConverter.convertJavaToJs(javaList), ['item1', 'item2']);
    });

    it('should parse `java.util.Date` as Date', function () {
      var testedDate = new Date();
      var javaDate = java.newInstanceSync('java.util.Date', java.newLong(testedDate.getTime()));
      var jsDate = JavaJsConverter.convertJavaToJs(javaDate);
      ['getUTCFullYear', 'getUTCMonth', 'getUTCDate', 'getUTCHours', 'getUTCMinutes', 'getUTCSeconds'].forEach(function (m) {
        assert.equal(testedDate[m](), jsDate[m]());
      });
    });

    it('should parse `java.util.Map` as object', function () {
      var javaHashMap = java.newInstanceSync('java.util.HashMap');
      javaHashMap.putSync('a', 1);
      javaHashMap.putSync('b', 2);
      var jsObject = JavaJsConverter.convertJavaToJs(javaHashMap);
      assert.deepEqual(jsObject, {a: 1, b: 2});
    });

  });

});