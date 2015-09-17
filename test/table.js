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

  describe('table#insert', function () {
    it('should insert some data', function (done) {
      var t = maprdb.getTable(tableNameForTests);
      t.insert({
        _id: '0123',
        name: 'John',
        lastName: 'Doe',
        nums: [1,2,3],
        interests: [
          {
            title: 'Coding',
            orderNum: 1,
            orderString: 'string',
            someProp: {
              someString: 'string',
              someNum: 1,
              someArray: [1,2,3, 'string']
            }
          }
        ]
      }, function() {
        t.findById('0123', function(document, err) {
          assert.equal(document._id, '0123', 'inserted document `_id` field validation');
          assert.equal(document.name, 'John', 'inserted document `name` field validation');
          assert.equal(document.lastName, 'Doe', 'inserted document `lastName` validation');
          assert.sameMembers(document.nums, [1,2,3], 'inserted document `nums` validation');
          assert.sameDeepMembers(document.interests, [
            {
              title: 'Coding',
              orderNum: 1,
              orderString: 'string',
              someProp: {
                someString: 'string',
                someNum: 1,
                someArray: [1,2,3, 'string']
              }
            }
          ], 'inserted document `interests` validation');
          done();
        });
      });
    });
  });

  describe('table#find', function() {
    beforeEach(function(done) {
      this.t = maprdb.getTable(tableNameForTests);
      this.t.insertAll([
        { _id: '1', name: 'John', age: 34 , city: 'Denver'},
        { _id: '2', name: 'Sam', age: 40, city: 'NY'},
        { _id: '3', name: 'Sam', age: 21, city: 'LA' }
      ], function(err) {
        assert.isNull(err, 'no errors thrown');
        done();
      });
    });

    afterEach(function() {
      this.t = null;
    });

    describe('#find(fields, callback)', function() {
      it('should find all data and returns documents with specified fields', function(done) {
        this.t.find(['name', 'city'], function(err, docs) {
          assert.equal(docs.length, 3, 'should return all documents from the table');
          docs.forEach(function(i) {
            assert.sameDeepMembers(Object.keys(i), ['_id', 'name', 'city'], 'all documents has same keys');
          });
          done();
        });
      });
    });

    describe('#find(condition, callback)', function() {
      [
        {
          condition: { name: { '$eq': 'John'}},
          e: {
            docsCount: 1,
            foundDocs: [
              { _id: '1', name: 'John', age: 34 , city: 'Denver'}
            ]
          }
        },
        {
          condition: { name: 'Sam'},
          e: {
            docsCount: 2,
            foundDocs: [
              { _id: '2', name: 'Sam', age: 40, city: 'NY'},
              { _id: '3', name: 'Sam', age: 21, city: 'LA' }
            ]
          }
        },
        {
          condition: [{ name: 'John'}, { age: 40 }],
          e: {
            docsCount: 2,
            foundDocs: [
              { _id: '1', name: 'John', age: 34 , city: 'Denver'},
              { _id: '2', name: 'Sam', age: 40, city: 'NY'},
            ]
          }
        },
        {
          condition: { age: { '$or': [ { '$eq': 40 }, {'$eq': 34 }]}},
          e: {
            docsCount: 2,
            foundDocs: [
              { _id: '1', name: 'John', age: 34 , city: 'Denver'},
              { _id: '2', name: 'Sam', age: 40, city: 'NY'},
            ]
          }
        },
        {
          condition: {'age': {'$or': [{'$and': {'$ge': 39, '$lt': 41}}, {'$and': {'$ge': 20, '$lt': 22}}]}},
          e: {
            docsCount: 2,
            foundDocs: [
              { _id: '2', name: 'Sam', age: 40, city: 'NY'},
              { _id: '3', name: 'Sam', age: 21, city: 'LA'},
            ]
          }
        }
      ].forEach(function(test) {
        it('passed condition: ' + JSON.stringify(test.condition) + ' found docs: ' + JSON.stringify(test.e.foundDocs), function(done) {
          this.t.find(test.condition, function(err, docs) {
            assert.equal(docs.length, test.e.docsCount, 'docs count validation');
            assert.deepEqual(docs, test.e.foundDocs, 'docs equality validation');
            done();
          });
        });
      });
    });


    describe('#find(condition, fields, callback)', function() {
      [
        {
          condition: { name: { '$eq': 'John'}},
          fields: ['name'],
          e: {
            docsCount: 1,
            foundDocs: [
              { _id: '1', name: 'John' }
            ]
          }
        },
        {
          condition: {'age': {'$or': [{'$and': {'$ge': 39, '$lt': 41}}, {'$and': {'$ge': 20, '$lt': 22}}]}},
          fields: ['age', 'city'],
          e: {
            docsCount: 2,
            foundDocs: [
              { _id: '2', age: 40, city: 'NY'},
              { _id: '3', age: 21, city: 'LA' }
            ]
          }
        }
      ].forEach(function(test) {
        it('passed condition: ' + JSON.stringify(test.condition) + ', passed fields: ' + test.fields + ' found docs: ' + JSON.stringify(test.e.foundDocs), function(done) {
          this.t.find(test.condition, test.fields, function(err, docs) {
            assert.equal(docs.length, test.e.docsCount, 'docs count validation');
            assert.deepEqual(docs, test.e.foundDocs, 'docs equality validation');
            done();
          });
        });
      });
    });
  });

});
