var assert = require('chai').assert;
var maprdb = require('../../index');
var table = require('../../lib/table');
var errorsManager = require('../../lib/utils/errorsManager');

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
        t.findById('0123', function(err, document) {
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

  describe('table#findById(id, *fields, callback)', function() {
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

    [
      {
        args: ['1'],
        m: 'method called with signature (id, callback)',
        e: { _id: '1', name: 'John', age: 34 , city: 'Denver'}
      },
      {
        args: ['2', ['name', 'age']],
        m: 'method called with signature (id, fields, callback)',
        e: { _id: '2', age: 40, name: 'Sam'}
      }
    ].forEach(function(test) {
      it(test.m, function (done) {
        var calledArgs = test.args;
        var wrapFn = function(err, doc) {
          assert.deepEqual(doc, test.e);
          done();
        };
        calledArgs.push(wrapFn);
        this.t.findById.apply(this.t, calledArgs);
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

  describe('table#update(_id, mutation, callback)', function() {
    beforeEach(function(done) {
      this.t = maprdb.getTable(tableNameForTests);
      this.t.insertAll([
        { _id: '1', name: 'John'},
        { _id: '2', name: 'Sam', age: 40, city: 'NY', interests: ['Coding', 'Bike']},
      ], function(err) {
        assert.isNull(err, 'no errors thrown');
        done();
      });
    });

    afterEach(function() {
      this.t = null;
    });

    [
      {
        mutation: {'age': {$inc: 1}},
        id: '2',
        e: {
          errorE: false,
          result: { _id: '2', name: 'Sam', age: 41, city: 'NY', interests: ['Coding', 'Bike']}
        }
      },
      {
        mutation: {'age': {$inc: -10 }, 'city': { $delete: true}},
        id: '2',
        e: {
          errorE: false,
          result: { _id: '2', name: 'Sam', age: 30, interests: ['Coding', 'Bike']}
        }
      },
      {
        mutation: {name: {$append: ' Joe'}, age: {$setOrReplace: '20'}},
        id: '2',
        e: {
          errorE: false,
          result: { _id: '2', name: 'Sam Joe', age: '20', city: 'NY', interests: ['Coding', 'Bike'] }
        }
      },
      {
        mutation: {interests: {$append: ['Cars', 'Motobike'] }, role: { $set: 'admin' } },
        id: '2',
        e: {
          errorE: false,
          result: { _id: '2', name: 'Sam', age: 40, city: 'NY', interests: ['Coding', 'Bike', 'Cars', 'Motobike'], role: 'admin' }
        }
      },
      {
        mutation: {_id: { $inc: 2}},
        id: '1',
        e: {
          errorE: true,
          result: {},
          errorManager: errorsManager.notSupportedNotationKeyError().constructor
        },
        m: 'cannot mutate `_id`, error should thrown'
      }
    ].forEach(function(test) {
      var message = test.m || ('passed mutation:' + JSON.stringify(test.mutation) + ' result:' + JSON.stringify(test.e.result));
      it(message, function(done) {
        var self = this;
        try {
          self.t.update(test.id, test.mutation, function(err) {
            self.t.findById(test.id, function(err2, doc) {
              assert.deepEqual(doc, test.e.result, 'document after mutation');
              done();
            });
          });
        } catch (e) {
          if (test.e.errorE) {
            assert.equal(e.name, test.e.errorManager.name);
            done();
          } else {
            assert.fail();
          }
        }
      });
    });
  });

  describe('table#eachDocument(condition, fields, callback)', function () {
    beforeEach(function(done) {
      this.t = maprdb.getTable(tableNameForTests);
      this.t.insertAll([
        { _id: '1', name: 'John', age: 34 , city: 'Denver'},
        { _id: '2', name: 'Sam', age: 40, city: 'NY'},
        { _id: '3', name: 'Sam', age: 21, city: 'LA' },
        { _id: '4', name: 'Ben', age: 16, city: 'Oslo' }
      ], function(err) {
        assert.isNull(err, 'no errors thrown');
        done();
      });
    });

    afterEach(function() {
      this.t = null;
    });

    describe('#eachDocument', function() {
      [
        {
          args: [['name']],
          m: 'called with signature (fields, callback)',
          e: [
            { _id: '1', name: 'John'},
            { _id: '2', name: 'Sam'},
            { _id: '3', name: 'Sam'},
            { _id: '4', name: 'Ben'}
          ]
        },
        {
          args: [{name: {$eq: 'John'}}, ['age', 'name']],
          m: 'called with signature (fields, condition, callback)',
          e: [
            { _id: '1', name: 'John', age: 34}
          ]
        }
      ].forEach(function(test) {
        it(test.m, function(done) {
          this.timeout(5000);
          var res = [];
          var calledArgs = test.args;
          var wrapFn = function(err, doc) {
            res.push(doc);
            if (res.length === test.e.length) {
              assert.deepEqual(res, test.e, 'data validation');
              done();
            }
          };
          calledArgs.push(wrapFn);

          this.t.eachDocument.apply(this.t, calledArgs);
        });
      });
    });
  });

  describe('table#stream', function() {
    beforeEach(function(done) {
      this.t = maprdb.getTable(tableNameForTests);
      this.t.insertAll([
        { _id: '1', name: 'John', age: 34 , city: 'Denver'},
        { _id: '2', name: 'Sam', age: 40, city: 'NY'},
        { _id: '3', name: 'Sam', age: 21, city: 'LA' },
        { _id: '4', name: 'Ben', age: 16, city: 'Oslo' }
      ], function(err) {
        assert.isNull(err, 'no errors thrown');
        done();
      });
    });

    afterEach(function() {
      this.t = null;
    });

    [
      {
        args: [['name']],
        m: 'called with signature (fields, streamHandlers)',
        e: [
          { _id: '1', name: 'John'},
          { _id: '2', name: 'Sam'},
          { _id: '3', name: 'Sam'},
          { _id: '4', name: 'Ben'}
        ]
      },
      {
        args: [{name: {$eq: 'John'}}, ['age', 'name']],
        m: 'called with signature (condition, fields, streamHandlers)',
        e: [
          { _id: '1', name: 'John', age: 34}
        ]
      },
    ].forEach(function(test) {
      it(test.m, function(done) {
        // to be sure that
        this.timeout(5000);
        var res = [];
        var calledArgs = test.args;
        var wrapFn = function(err, doc) {
          res.push(doc);
          if (res.length === test.e.length) {
            assert.deepEqual(res, test.e, 'data validation');
            done();
          }
        };
        calledArgs.push({
          read: wrapFn
        });

        this.t.stream.apply(this.t, calledArgs);
      });
    });
  });

  describe('table#delete', function() {
    beforeEach(function(done) {
      this.t = maprdb.getTable(tableNameForTests);
      this.t.insertAll([
        { _id: '1', name: 'John', age: 34 , city: 'Denver'},
        { _id: '2', name: 'Sam', age: 40, city: 'NY'},
        { _id: '3', name: 'Sam', age: 21, city: 'LA' },
        { _id: '4', name: 'Ben', age: 16, city: 'Oslo' }
      ], function(err) {
        assert.isNull(err, 'no errors thrown');
        done();
      });
    });

    afterEach(function() {
      this.t = null;
    });

    [
      {
        _id: '1',
        e: [ '2', '3', '4']
      },
      {
        _id: '2',
        e: [ '1', '3', '4']
      },
      {
        _id: '3',
        e: [ '1', '2', '4']
      },
      {
        _id: '4',
        e: [ '1', '2', '3']
      }
    ].forEach(function(test) {
      it('should remove document with _id ' + test._id, function(done) {
        var self = this;
        this.t.delete(test._id, function(err) {
          assert.isUndefined(err, 'no error thrown');
          self.t.flush(function() {
            self.t.find(function(errFind, docs) {
              assert.isUndefined(errFind, 'no error thrown');
              assert.sameMembers(docs.map(function(item) { return item._id; }), test.e);
              done();
            });
          });
        });
      });
    });
  });
});
