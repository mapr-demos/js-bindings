var assert = require('chai').assert;
var maprdb = require('../index');
var mutation = require('../lib/mutation');
var java = require('../lib/jexports/javaInstance').javaInstance();

describe('Mutation', function () {

  describe('parse json', function () {
    [
      {'field': {'$set': 'value'}},
      {'age': {'$set': 34}},
      {'age': {'$set': 34}, 'country': {'$set': 'USA'}},
      {'interests': {'$set': ['x', 'y']}},
      {'address': {'$set': {'t': 'home'}}},
      {'field': {'$setOrReplace': 'value'}},
      {'age': {'$setOrReplace': 34}},
      {'age': {'$setOrReplace': 34}, 'country': {'$setOrReplace': 'USA'}},
      {'field': {'$append': 'value'}},
      {'name': {'$append': 'Doe'}},
      {'field': {'$setOrReplace': 'value'}},
      {'age': {'$setOrReplace': 34}},
      {'age': {'$setOrReplace': 34}, 'country': {'$setOrReplace': 'USA'}},
      {'field': {'$inc': 'value'}},
      {'age': {'$inc': 1}},
      {'age': {'$delete': true}}
    ].forEach(function (json) {
        it(JSON.stringify(json), function () {
          var m = new mutation(this.json);
          assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
          m.build();
          assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
        });
      });
  });

  describe('manual input', function () {

    var m = new mutation();
    m.set('f1', 'v1').set('f2', [1, 2]).
      setOrReplace('f3', 3).setOrReplace('f4', '4').
      append('f6', '6').append('f10', [1, 2, 3]).
      increment('f7', 1).increment('f8', -1).
      delete('f9');
    assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
    m.build();
    assert.ok(java.instanceOf(m.jMutation, 'com.mapr.db.Mutation'));
  });

});