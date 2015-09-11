var assert = require('chai').assert;
var maprdb = require('../index');
var table = require('../lib/table');

describe('Table', function () {

  var tableNameForTests = '/apps/test_table';

  beforeEach(function() {
    if (!maprdb.exists(tableNameForTests)) {
      maprdb.createTableSync(tableNameForTests);
    }
  });

 afterEach(function () {
   if (maprdb.exists(tableNameForTests)) {
     maprdb.deleteTableSync(tableNameForTests);
   }
 });

  describe('INSERT', function () {
    it('should insert some data', function (done) {
      var t = maprdb.getTable(tableNameForTests);
      t.insert({
        _id: '0123',
        name: 'John',
        lastName: 'Doe'
      }, function() {
        t.findById('0123', function(document, err) {
          assert.equal(document._id, '0123', 'inserted document `_id` field validation');
          assert.equal(document.name, 'John', 'inserted document `name` field validation');
          assert.equal(document.lastName, 'Doe', 'inserted document `lastName` validation');
          done();
        });
      });
    });
  });

});
