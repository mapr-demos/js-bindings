var java = require('../../lib/jexports/javaInstance').javaInstance();
var assert = require('chai').assert;
var typeChecker = require('../../lib/utils/typeChecker');

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

});