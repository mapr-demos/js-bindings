var assert = require('chai').assert;
var maprdb = require('../index');

describe('Table Creation', function() {
  it('should create table', function() {
    assert.ok(maprdb.createTable('/apps/some_table'));
  });
});
