var assert = require('chai').assert;
var maprdb = require('../index');
var condition = require('../lib/condition');

describe('Condition', function () {

  describe('Single operator', function() {

    /**
     * Generate human friendly message for each test-case (used as first parameter in the <code>it</code>)
     * Used in the single operator tests
     *
     * @param {object} json
     * @param {string} field
     * @param {string} op
     * @param {*} val
     * @returns {string}
     */
    function readableIt(json, field, op, val) {
      var jsonCopy = JSON.parse(JSON.stringify(json));
      jsonCopy[field][op] = val;
      return 'op -> "' + op + '". JSON ->  ' + JSON.stringify(jsonCopy);
    }

    /**
     * Generate JSON for conditions testing
     *
     * @param {string} field
     * @param {string} op something like '$eq', '$lte', '$gt' and any other allowed operator
     * @param {*} value
     * @returns {object}
     */
    function getJsonForTest(field, op, value) {
      var json = {};
      json[field] = {};
      json[field][op] = value;
      return json;
    }

    describe('eq', function () {

      var country = 'Canada';

      condition.conditionMap.eq.forEach(function (op) {
        var jsonForTest = getJsonForTest('country', op, country);
        it(readableIt(jsonForTest, 'country', op, country), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(country = "' + country + '")');
        });
      });

      it('{key: value}', function () {
        var c = new condition({country: country});
        assert.equal(c.toStringSync(), '(country = "' + country + '")');
      });

    });

    describe('neq', function () {

      var country = 'Canada';

      condition.conditionMap.neq.forEach(function (op) {
        var jsonForTest = getJsonForTest('country', op, country);
        it(readableIt(jsonForTest, 'country', op, country), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(country != "' + country + '")');
        });
      });

    });

    describe('le', function () {

      var age = 12;

      condition.conditionMap.le.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(age < {"$numberLong":' + age + '})');
        });
      });

    });

    describe('leq', function () {

      var age = 12;

      condition.conditionMap.leq.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(age <= {"$numberLong":' + age + '})');
        });
      });

    });

    describe('ge', function () {

      var age = 12;

      condition.conditionMap.gt.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(age > {"$numberLong":' + age + '})');
        });
      });

    });

    describe('gte', function () {

      var age = 12;

      condition.conditionMap.gte.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(age >= {"$numberLong":' + age + '})');
        });
      });

    });

    describe('between', function () {

      var age = [12, 20];

      condition.conditionMap.between.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '((age >= {"$numberLong":' + age[0] + '}) and (age <= {"$numberLong":' + age[1] + '}))');
        });


        it(readableIt(getJsonForTest('age', op, 'not_an_array'), 'age', op, 'not_an_array') + '  should throw error (not an array)', function () {
          jsonForTest = getJsonForTest('age', op, 'not_an_array');
          assert.throw(function () {
            new condition(jsonForTest);
          });
        });

        it(readableIt(getJsonForTest('age', op, [1]), 'age', op, [1]) + ' should throw error (array not with 2 elements)', function () {
          jsonForTest = getJsonForTest('age', op, [1]);
          assert.throw(function () {
            new condition(jsonForTest);
          });
        });
      });

    });

    describe('in', function () {

      var age = [12, 20];

      condition.conditionMap.in.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '((age = {"$numberLong":' + age[0] + '}) or (age = {"$numberLong":' + age[1] + '}))');
        });
      });

    });

    describe('nin', function () {

      var age = [12, 20];

      condition.conditionMap.nin.forEach(function (op) {
        var jsonForTest = getJsonForTest('age', op, age);
        it(readableIt(jsonForTest, 'age', op, age), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '((age != {"$numberLong":' + age[0] + '}) and (age != {"$numberLong":' + age[1] + '}))');
        });
      });

    });

    describe('exists', function () {

      condition.conditionMap.exists.forEach(function (op) {
        [true, false].forEach(function (val) {
          var jsonForTest = getJsonForTest('age', op, val);
          it(readableIt(jsonForTest, 'age', op, val), function () {
            var c = new condition(jsonForTest);
            assert.equal(c.toStringSync(), '(age ' + (val ? '!=' : '=') + ' null)');
          });
        });
        it(readableIt(getJsonForTest('age', op, ''), 'age', op, '') + ' should throw error (not a boolean)', function () {
          assert.throw(function () {
            new condition(getJsonForTest('age', op, ''));
          });
        });
      });

    });

    describe('matches', function () {

      var regexp = '/\n+/';

      condition.conditionMap.matches.forEach(function (op) {
        var jsonForTest = getJsonForTest('fName', op, regexp);
        it(readableIt(jsonForTest, 'fName', op, regexp), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(fName LIKE "/\\n+/")');
        });
      });
    });

    describe('notMatches', function () {

      var regexp = '/\n+/';

      condition.conditionMap.notMatches.forEach(function (op) {
        var jsonForTest = getJsonForTest('fName', op, regexp);
        it(readableIt(jsonForTest, 'fName', op, regexp), function () {
          var c = new condition(jsonForTest);
          assert.equal(c.toStringSync(), '(fName NOT_LIKE "/\\n+/")');
        });
      });
    });

  });

  describe('Combined', function () {

    describe('or', function () {

      var country1 = 'Canada';
      var country2 = 'Brazil';

      condition.conditionMap.eq.forEach(function (eqOp) {
        condition.conditionMap.neq.forEach(function (neqOp) {
          var cond = [
            {country: {}},
            {country: {}}
          ];
          cond[0].country[eqOp] = country1;
          cond[1].country[neqOp] = country2;
          it('JSON -> ' + JSON.stringify(cond), function () {
            var c = new condition(cond);
            assert.equal(c.toStringSync(), '((country = "' + country1 + '") or (country != "' + country2 + '"))');
          });
        });
      });

    });

    describe('$and, $or', function() {

      [
        {
          cond: {'age': {'$and': {'$ge': 30, '$lt': 40}}},
          e: '((age >= {"$numberLong":30}) and (age < {"$numberLong":40}))'
        },
        // skip for a while
        // {
        //   cond: {'country': {'$or': ['China', 'US']}, 'age': {'$and': {'$ge': 30, '$lt': 40}}},
        //   e: '(((country = "China") or (country = "US")) and ((age >= {"$numberLong":30}) and (age < {"$numberLong":40})))'
        // },
        {
          cond: {'age': {'$and': {'$ge': 30, '!$in': [40, 50]}}},
          e: '((age >= {"$numberLong":30}) and ((age != {"$numberLong":40}) and (age != {"$numberLong":50})))'
        },
        {
          cond: {
            'age': {
              '$or': [ { '$eq': 30 }, { '$eq': 60 } ]
            }
          },
          e: '((age = {"$numberLong":30}) or (age = {"$numberLong":60}))'
        },
        {
          cond: {
            'age': {
              '$or': [
                {
                  '$and': {
                    '$ge': 30,
                    '$lt': 40
                  }
                },
                {
                  '$and': {
                    '$ge': 50,
                    '$lt': 60
                  }
                }
              ]
            }
          },
          e: '(((age >= {"$numberLong":30}) and (age < {"$numberLong":40})) or ((age >= {"$numberLong":50}) and (age < {"$numberLong":60})))'
        },
        {
          cond: {
            'age': {
              '$or': [
                {
                  '$and': {
                    '$ge': 30,
                    '$lt': 40
                  }
                },
                {
                  '$in': [50, 60]
                }
              ]
            }
          },
          e: '(((age >= {"$numberLong":30}) and (age < {"$numberLong":40})) or ((age = {"$numberLong":50}) or (age = {"$numberLong":60})))'
        },
        {
          cond: {
            'age': {
              '$or': [
                {
                  '$and': {
                    '$ge': 30,
                    '$lt': 40
                  }
                },
                {
                  '$between': [50, 60]
                }
              ]
            }
          },
          e: '(((age >= {"$numberLong":30}) and (age < {"$numberLong":40})) or ((age >= {"$numberLong":50}) and (age <= {"$numberLong":60})))'
        },
        {
          cond: [
            {
              'age': {
                '$and': {
                  '$ge': 30,
                  '$lte': 40
                }
              }
            },
            {
              'age': {
                '$and': {
                  '$ge': 50,
                  '$lte': 60
                }
              }
            }
          ],
          e: '(((age >= {"$numberLong":30}) and (age <= {"$numberLong":40})) or ((age >= {"$numberLong":50}) and (age <= {"$numberLong":60})))'
        }
      ].forEach(function(test) {
          it('JSON -> ' + JSON.stringify(test.cond), function () {
            var c = new condition(test.cond);
            assert.equal(c.toStringSync(), test.e);
          });
      });

    });

    describe('custom methods call', function () {

      it('should parse correctly (with $date)', function () {

        var c = new condition();
        assert.equal(c.and().is('some_date', 'GREATER_OR_EQUAL', new Date('2011-05-01')).
            is('some_date', 'LESS', new Date('2015-12-28')).
            close().jCondition.toStringSync(), '((some_date >= {"$date":"2011-05-01T00:00:00.000Z"}) and (some_date < {"$date":"2015-12-28T00:00:00.000Z"}))');
      });

    });

  });

});
