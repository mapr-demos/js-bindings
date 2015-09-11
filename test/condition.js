var assert = require('chai').assert;
var maprdb = require('../index');
var condition = require('../lib/condition');

describe('Condition', function () {

  describe('eq', function () {

    var country = 'Canada';

    beforeEach(function () {
      this.jsonToTest = {
        country: {}
      };
    });

    condition.conditionMap.eq.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.country[op] = country;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '(country = "' + country + '")');
      });
    });

    it('{key: value}', function () {
      this.jsonToTest.country = country;
      var c = new condition(this.jsonToTest);
      assert.equal(c.jCondition.toStringSync(), '(country = "' + country + '")');
    });

  });

  describe('neq', function () {

    var country = 'Canada';

    beforeEach(function () {
      this.jsonToTest = {
        country: {}
      };
    });

    condition.conditionMap.neq.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.country[op] = country;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '(country != "' + country + '")');
      });
    });

  });

  describe('le', function () {

    var age = 12;

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.le.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '(age < {"$numberLong":' + age + '})');
      });
    });

  });

  describe('leq', function () {

    var age = 12;

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.leq.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '(age <= {"$numberLong":' + age + '})');
      });
    });

  });

  describe('ge', function () {

    var age = 12;

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.gt.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '(age > {"$numberLong":' + age + '})');
      });
    });

  });

  describe('gte', function () {

    var age = 12;

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.gte.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '(age >= {"$numberLong":' + age + '})');
      });
    });

  });

  describe('between', function () {

    var age = [12, 20];

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.between.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '((age >= {"$numberLong":' + age[0] + '}) and (age <= {"$numberLong":' + age[1] + '}))');
      });

      it(op + '. should throw error (not an array)', function () {
        var self = this;
        this.jsonToTest.age[op] = 'not_an_array';
        assert.throw(function () {new condition(self.jsonToTest);});
      });

      it(op + '. should throw error (array not with 2 elements)', function () {
        var self = this;
        this.jsonToTest.age[op] = [1];
        assert.throw(function () {new condition(self.jsonToTest);});
      });
    });

  });

  describe('in', function () {

    var age = [12, 20];

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.in.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '((age = {"$numberLong":' + age[0] + '}) or (age = {"$numberLong":' + age[1] + '}))');
      });
    });

  });

  describe('nin', function () {

    var age = [12, 20];

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.nin.forEach(function (op) {
      it(op, function () {
        this.jsonToTest.age[op] = age;
        var c = new condition(this.jsonToTest);
        assert.equal(c.jCondition.toStringSync(), '((age != {"$numberLong":' + age[0] + '}) and (age != {"$numberLong":' + age[1] + '}))');
      });
    });

  });

  describe('exists', function () {

    beforeEach(function () {
      this.jsonToTest = {
        age: {}
      };
    });

    condition.conditionMap.exists.forEach(function (op) {
      [true, false].forEach(function (val) {
        it(op + ': ' + val, function () {
          this.jsonToTest.age[op] = val;
          var c = new condition(this.jsonToTest);
          assert.equal(c.jCondition.toStringSync(), '(age ' + (val ? '!=' : '=') + ' null)');
        });
      });
      it(op + '. should throw error (not a boolean)', function () {
        var self = this;
        this.jsonToTest.age[op] = '';
        assert.throw(function () {new condition(self.jsonToTest);});
      });
    });

  });

  describe('Combined', function () {

    describe('or', function () {

      var country1 = 'Canada';
      var country2 = 'Brazil';

      condition.conditionMap.eq.forEach(function (eqOp) {
        condition.conditionMap.neq.forEach(function (neqOp) {
          it(eqOp + ' or ' + neqOp, function () {
            var cond = [
              {country: {}},
              {country: {}}
            ];
            cond[0].country[eqOp] = country1;
            cond[1].country[neqOp] = country2;
            var c = new condition(cond);
            assert.equal(c.jCondition.toStringSync(), '((country = "' + country1 + '") or (country != "' + country2 + '"))');
          });
        });
      });
    });

    describe('custom methods call', function () {

      it('should parse correctly', function () {

        var c = new condition();
        assert.equal(c.and().is('some_date', 'GREATER_OR_EQUAL', new Date('2011-05-01')).
            is('some_date', 'LESS', new Date('2015-12-28')).
            close().jCondition.toStringSync(), '((some_date >= {"$date":"2011-05-01T00:00:00.000Z"}) and (some_date < {"$date":"2015-12-28T00:00:00.000Z"}))');

      });

    });

  });

});