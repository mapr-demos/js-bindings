var java = require('../../lib/jexports/javaInstance').javaInstance();
var assert = require('chai').assert;
var JavaJsConverter = require('../../lib/utils/JavaJsConverter');

describe('JavaJsConverter', function () {

  describe('convertJsToJava', function () {

    it('should parse as `java.util.ArrayList`', function () {
      var result = JavaJsConverter.convertJsToJava([1, 2, 3]);
      assert.ok(java.instanceOf(result, 'java.util.ArrayList'));
    });

    it('should parse as `java.util.HashMap`', function () {
      var result = JavaJsConverter.convertJsToJava({a: 1, b: 2, c: 3});
      assert.ok(java.instanceOf(result, 'java.util.HashMap'));
    });

    it('should parse as `java.sql.Timestamp`', function () {
      var result = JavaJsConverter.convertJsToJava(new Date());
      assert.ok(java.instanceOf(result, 'java.sql.Timestamp'));
    });

  });

});