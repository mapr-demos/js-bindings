var assert = require('chai').assert;
var maprdb = require('../index');

describe('Table CRUD', function() {

  var tableNameForTests = '/apps/test_table';

  function cleanUp(done) {
    if (maprdb.exists(tableNameForTests)) {
      maprdb.deleteTable(tableNameForTests, function() {
        done();
      });
    } else {
      done();
    }
  }

  beforeEach(cleanUp);

  afterEach(cleanUp);

  describe('Create table', function() {
    it('should create table', function(done) {
      assert.isFalse(maprdb.exists(tableNameForTests));
      maprdb.createTable(tableNameForTests, function(err, table) {
        assert.isUndefined(err, 'no error appers');
        assert.isTrue(maprdb.exists(tableNameForTests), 'table was created');
        done();
      });
    });
  });

  describe('Delete table', function () {
    beforeEach(function (done) {
      if (!maprdb.exists(tableNameForTests)) {
        maprdb.createTable(tableNameForTests, function() {
          done();
        });
      } else {
        done();
      }
    });

    it('should delete table', function(done) {
      assert.isTrue(maprdb.exists(tableNameForTests), 'table exists before delete operation');
      maprdb.deleteTable(tableNameForTests, function() {
        assert.isFalse(maprdb.exists(tableNameForTests), 'table not exist after removing');
        done();
      });
    });
  });

});
