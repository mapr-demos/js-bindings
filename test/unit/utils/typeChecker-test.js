var java = require('../../../lib/jexports/javaInstance').javaInstance();
var assert = require('chai').assert;
var typeChecker = require('../../../lib/utils/typeChecker');

describe('typeChecker', function () {

  describe('getType', function () {
    [
      {value: '', type: 'string'},
      {value: undefined, type: 'undefined'},
      {value: null, type: 'null'},
      {value: 123, type: 'number'},
      {value: new Number(321), type: 'number'},
      {value: true, type: 'boolean'},
      {value: function() {}, type: 'function'},
      {value: [1,2,3], type: 'array'},
      {value: new Array(2), type: 'array'},
      {value: /abc/, type: 'regexp'},
      {value: {}, type: 'object'},
      {value: new Error('error'), type: 'error'},
      {value: new Date('date'), type: 'date'}
    ].forEach(function(test) {
        it('"' + {}.toString.call(test.value) + '" is ' + test.type, function () {
            assert.equal(typeChecker.getType(test.value), test.type);
        });
      });
  });

  describe('getJavaType', function() {
    [
      {value: java.newInstanceSync('java.util.HashMap'), type: 'java.util.HashMap'},
      {value: java.newInstanceSync('java.util.ArrayList'), type: 'java.util.ArrayList'},
      {value: java.newInstanceSync('java.util.Date'), type: 'java.util.Date'},
      {value: java.newInstanceSync('java.sql.Timestamp', java.newLong(1234)), type: 'java.sql.Timestamp'},
      {value: java.newLong(1234), type: 'java.lang.Long'}
    ].forEach(function(test) {
        it('class is ' + test.type, function () {
          assert.equal(typeChecker.getJavaType(test.value), test.type);
        });
      });
  });

  describe('checkEachType', function () {
    [
      {list: '', types: 'string', e: false},
      {list: true, types: 'string', e: false},
      {list: 123, types: 'string', e: false},
      {list: {}, types: 'string', e: false},
      {list: [], types: 'string', e: false},
      {list: [''], types: 'string', e: true},
      {list: ['', 1], types: ['string', 'number'], e: true},
      {list: [{}, {}], types: ['object'], e: true}
    ].forEach(function(test) {
        it('checked value: ' + JSON.stringify(test.list) + ' allowed types: ' + JSON.stringify(test.types), function () {
          assert.equal(typeChecker.checkEachType(test.list, test.types), test.e);
        });
      });
  });

});