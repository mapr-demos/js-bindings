var assert = require('chai').assert;
var document = require('../../lib/document');
var errorsManager = require('../../lib/utils/errorsManager');

describe('document', function () {

  describe('fromJSON', function () {

    it('should throw MalformedObjectError', function () {
      assert.throw(function () {
        var d = new document();
        d.fromJSON({});
      }, errorsManager.malformedObjectError().constructor);
    });

  });

});