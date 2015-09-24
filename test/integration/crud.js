var assert = require('chai').assert;
var maprdb = require('../../index');
var table = require('../../lib/table');

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
      maprdb.createTable(tableNameForTests, function(err, t) {
        assert.isUndefined(err, 'no error appears');
        assert.equal(t.getNameSync(), 'test_table');
        assert.isTrue(maprdb.exists(tableNameForTests), 'table was created');
        done();
      });
    });

    it('should create table sync', function () {
      maprdb.createTableSync(tableNameForTests);
      assert.isTrue(maprdb.exists(tableNameForTests), 'table was created');
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

  describe('Get table', function () {

    beforeEach(function (done) {
      if (!maprdb.exists(tableNameForTests)) {
        maprdb.createTable(tableNameForTests, function() {
          done();
        });
      } else {
        done();
      }
    });

    it('should get table', function () {
      var t = maprdb.getTable(tableNameForTests);
      assert.isTrue(t instanceof table, 'table is instance of correct class');
    });

    it('should throw error because table doesn\'t exist', function () {
      var fakeTableName = 'some-fake-table';
      assert.isFalse(maprdb.exists(fakeTableName));
      assert.throw(function() {
        maprdb.getTable(fakeTableName);
      });
    });

  });

});
