var assert = require('chai').assert;
var maprdb = require('../index');
var mutation = require('../lib/mutation');
var java = require('../lib/jexports/javaInstance').javaInstance();
var errorsManager = require('../lib/utils/errorsManager');

describe('Mutation', function () {

  describe('parse json', function () {
    [
      {},
      {'field': {'$set': 'value'}},
      {'age': {'$set': 34}},
      {'age': {'$set': true}},
      {'age': {'$set': null}},
      {'age': {'$set': {}}},
      {'age': {'$set': [{a: 1}]}},
      {'age': {'$set': new Date()}},
      {'age': {'$set': 34}, 'country': {'$set': 'USA'}},
      {'interests': {'$set': ['x', 'y']}},
      {'address': {'$set': {'t': 'home'}}},
      {'field': {'$setOrReplace': 'value'}},
      {'age': {'$setOrReplace': 34}},
      {'age': {'$setOrReplace': true}},
      {'age': {'$setOrReplace': {}}},
      {'age': {'$setOrReplace': new Date()}},
      {'age': {'$setOrReplace': [{a: 1}]}},
      {'age': {'$setOrReplace': null}},
      {'age': {'$setOrReplace': 34}, 'country': {'$setOrReplace': 'USA'}},
      {'field': {'$append': 'value'}},
      {'name': {'$append': 'Doe'}},
      {'name': {'$append': [1,2,3]}},
      {'field': {'$setOrReplace': 'value'}},
      {'age': {'$setOrReplace': 34}},
      {'age': {'$setOrReplace': 34}, 'country': {'$setOrReplace': 'USA'}},
      {'age': {'$inc': 1}},
      {'age': {'$delete': true}}
    ].forEach(function (json) {
        it(JSON.stringify(json), function () {
          var m = new mutation(json);
          assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
          m.build();
          assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
        });
      });
  });

  describe('manual input', function () {

    var m = new mutation({});
    m.set('f1', 'v1').set('f2', [1, 2]).
      setOrReplace('f3', 3).setOrReplace('f4', '4').
      append('f6', '6').append('f10', [1, 2, 3]).
      increment('f7', 1).increment('f8', -1).
      delete('f9');
    assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
    m.build();
    assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
  });

  describe('errors thrown', function () {

    it('append not a string or array (should throw ArgumentTypesWhiteListError)', function () {
      assert.throw(function () {
        new mutation({'field': {$append: 1}});
      }, errorsManager.argumentTypesWhiteListError().constructor);
    });

    it('inc not a number (should throw ArgumentTypesWhiteListError)', function () {
      assert.throw(function () {
        new mutation({'field': {$inc: ''}});
      }, errorsManager.argumentTypesWhiteListError().constructor);
    });

    it('bad mutation key (should throw InvalidNotationError)', function () {
      assert.throw(function () {
        new mutation({'field': 'value'});
      }, errorsManager.invalidNotationError().constructor);
    });

    it('bad constructor arguments (should throw ConstructorArgumentsError)', function () {
      assert.throw(function () {
        new mutation('value');
      }, errorsManager.constructorArgumentsError().constructor);
    });

    it('empty constructor arguments (should throw ConstructorArgumentsError)', function () {
      assert.throw(function () {
        new mutation();
      }, errorsManager.constructorArgumentsError().constructor);
    });

    it('should throw NotSupportedNotationKeyError', function () {
      assert.throw(function () {
        new mutation({k: {'$not_support_key': ''}});
      }, errorsManager.notSupportedNotationKeyError().constructor);
    });

  });

});