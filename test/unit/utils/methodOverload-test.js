var assert = require('chai').assert;
var MethodOverload = require('../../../lib/utils/methodOverload');
var errorsManager = require('../../../lib/utils/errorsManager');
var typeChecker = require('../../../lib/utils/typeChecker');
var Condition = require('../../../lib/condition');

var MethodOverloadInstance;

describe('#methodOverload', function () {

  function addCFC(mo) {
    mo
      .addCombo('condition', 'fields', 'callback')
      .inspect('callback', typeChecker.isFunction.bind(typeChecker), 'Function')
      .inspect('condition', function(i) {
        return typeChecker.isObject(i) || typeChecker.checkEachType(i, 'object');
      }, 'Object or Array of Objects')
      .inspect('fields', function(i) {
        return typeChecker.checkEachType(i, 'string');
      }, 'Array of Strings')
      .castTo('callback', function() {
        return function () {return 1234;};
      })
      .castTo('condition', function(i) {
        return new Condition(i);
      });
    return mo;
  }

  beforeEach(function () {
    MethodOverloadInstance = new MethodOverload(['myArg']);
  });

  describe('#constructor', function () {

    it('should throw an error NoArgumentsError', function () {
      assert.throw(function () {
        MethodOverloadInstance = new MethodOverload();
      }, errorsManager.noArgumentsError().constructor);
    });

  });

  describe('#addArgToList', function () {

    it('should add args', function () {
      MethodOverloadInstance.addArgToList('myArg');
      assert.ok(typeChecker.isFunction(MethodOverloadInstance.argumentsMap['myArg'].filterF));
      assert.ok(typeChecker.isFunction(MethodOverloadInstance.argumentsMap['myArg'].castF));
    });

    it('shouldn\'t add args', function () {
      MethodOverloadInstance.addArgToList('myArg');
      MethodOverloadInstance.inspect('myArg', function () {
        return 1234;
      });
      MethodOverloadInstance.addArgToList('myArg');
      assert.equal(MethodOverloadInstance.argumentsMap['myArg'].filterF(), 1234);
    });

  });

  describe('#addCombo', function () {

    it('Is chainable', function () {
      assert.equal(MethodOverloadInstance.addCombo('a'), MethodOverloadInstance);
    });

    it('should throw an error NoArgumentsError', function () {
      assert.throw(function () {
        MethodOverloadInstance.addCombo();
      }, errorsManager.noArgumentsError().constructor);
    });

    it('should add combo', function () {
      MethodOverloadInstance.addCombo('a','b','c');
      assert.deepEqual(MethodOverloadInstance.combos, [['a','b','c']]);
      MethodOverloadInstance.addCombo('a','b');
      assert.deepEqual(MethodOverloadInstance.combos, [['a','b','c'],['a','b']]);

    });

  });

  describe('#inspect', function () {

    it('Is chainable', function () {
      assert.equal(MethodOverloadInstance.inspect('a', function () {}), MethodOverloadInstance);
    });

    it('Should throw ArgumentTypesWhiteListError', function () {
      assert.throw(function() {
        MethodOverloadInstance.inspect('a', 'not a function!');
      }, errorsManager.argumentTypesWhiteListError().constructor);
    });

    it('Should automatically add args to argumentsMap', function () {
      MethodOverloadInstance.inspect('myArg', function () {
        return 1234;
      });
      MethodOverloadInstance.addArgToList('myArg');
      assert.equal(MethodOverloadInstance.argumentsMap['myArg'].filterF(), 1234);
    });

  });

  describe('#castTo', function () {

    it('Is chainable', function () {
      assert.equal(MethodOverloadInstance.castTo('a', function () {}), MethodOverloadInstance);
    });

    it('Should throw ArgumentTypesWhiteListError', function () {
      assert.throw(function() {
        MethodOverloadInstance.castTo('a', 'not a function!');
      }, errorsManager.argumentTypesWhiteListError().constructor);
    });

    it('Should automatically add args to argumentsMap', function () {
      MethodOverloadInstance.castTo('myArg', function () {
        return 1234;
      });
      MethodOverloadInstance.addArgToList('myArg');
      assert.equal(MethodOverloadInstance.argumentsMap['myArg'].castF(), 1234);
    });

  });

  describe('#list', function () {

    it('should return argsList', function () {
      MethodOverloadInstance.argsList = ['some-predefined'];
      assert.deepEqual(MethodOverloadInstance.list(), ['some-predefined']);
    });

  });

  describe('#createArgumentsMap', function () {

    beforeEach(function () {
      MethodOverloadInstance = new MethodOverload([{}, ['a', 'b', 'c'], function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
    });

    it('should throw and Error', function () {
      MethodOverloadInstance.castTo('callback', function() {});
      assert.throw(function () {
        MethodOverloadInstance.createArgumentsMap();
      }, 'should return some value');
    });

    it('should map arguments CFC (one combo)', function () {

      var res = MethodOverloadInstance.createArgumentsMap();

      assert.deepEqual(Object.keys(res), ['callback', 'condition', 'fields']);
      assert.equal(res.callback(), 1234);
      assert.equal(res.condition, '<EMPTY>');
      assert.deepEqual(res.fields, ['a', 'b', 'c']);
    });

    it('should map arguments CFC (two combos)', function () {
      MethodOverloadInstance
        .addCombo('condition', 'callback');
      var res = MethodOverloadInstance.createArgumentsMap();

      assert.deepEqual(Object.keys(res), ['callback', 'condition', 'fields']);
      assert.equal(res.callback(), 1234);
      assert.equal(res.condition, '<EMPTY>');
      assert.deepEqual(res.fields, ['a', 'b', 'c']);
    });

    it('should map arguments CC (two combos)', function () {
      MethodOverloadInstance = new MethodOverload([{}, function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
      MethodOverloadInstance
        .addCombo('condition', 'callback');
      var res = MethodOverloadInstance.createArgumentsMap();

      assert.deepEqual(Object.keys(res), ['callback', 'condition']);
      assert.equal(res.callback(), 1234);
      assert.equal(res.condition, '<EMPTY>');
    });

    it('should map arguments C (three combos)', function () {
      MethodOverloadInstance = new MethodOverload([function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
      MethodOverloadInstance
        .addCombo('condition', 'callback')
        .addCombo('callback');
      var res = MethodOverloadInstance.createArgumentsMap();

      assert.deepEqual(Object.keys(res), ['callback']);
      assert.equal(res.callback(), 1234);
    });

  });

  describe('#getFromCombinations', function () {

    beforeEach(function () {
      MethodOverloadInstance = new MethodOverload([{}, ['a', 'b', 'c'], function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
    });

    it('should get arguments list CFC (one combo)', function () {
      var res = MethodOverloadInstance.createArgumentsMap();
      var argsList = MethodOverloadInstance.getFromCombinations(res);
      assert.equal(argsList.length, 3);
      assert.equal(argsList[0], '<EMPTY>');
      assert.deepEqual(argsList[1], ['a', 'b', 'c']);
      assert.equal(argsList[2](), 1234);
    });

    it('should get arguments list CFC (two combos)', function () {
      MethodOverloadInstance = new MethodOverload([{}, ['a', 'b', 'c'], function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
      MethodOverloadInstance
        .addCombo('condition', 'callback');
      var res = MethodOverloadInstance.createArgumentsMap();
      var argsList = MethodOverloadInstance.getFromCombinations(res);

      assert.equal(argsList.length, 3);
      assert.equal(argsList[0], '<EMPTY>');
      assert.deepEqual(argsList[1], ['a', 'b', 'c']);
      assert.equal(argsList[2](), 1234);
    });

    it('should map arguments list CC (two combos)', function () {
      MethodOverloadInstance = new MethodOverload([{}, function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
      MethodOverloadInstance
        .addCombo('condition', 'callback');
      var res = MethodOverloadInstance.createArgumentsMap();
      var argsList = MethodOverloadInstance.getFromCombinations(res);

      assert.equal(argsList.length, 2);
      assert.equal(argsList[0], '<EMPTY>');
      assert.equal(argsList[1](), 1234);
    });

    it('should map arguments list C (three combos)', function () {
      MethodOverloadInstance = new MethodOverload([function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
      MethodOverloadInstance
        .addCombo('condition', 'callback')
        .addCombo('callback');
      var res = MethodOverloadInstance.createArgumentsMap();
      var argsList = MethodOverloadInstance.getFromCombinations(res);

      assert.equal(argsList.length, 1);
      assert.equal(argsList[0](), 1234);
    });

  });

  describe('#build', function () {

    beforeEach(function () {
      MethodOverloadInstance = new MethodOverload([{}, ['a', 'b', 'c'], function () {}]);
      MethodOverloadInstance = addCFC(MethodOverloadInstance);
    });

    it('should throw NotSupportedMethodSignatureError', function () {
      MethodOverloadInstance.getFromCombinations = function () {
        return null;
      };
      assert.throw(function () {
        MethodOverloadInstance.build();
      }, errorsManager.notSupportedMethodSignatureError().constructor);
    });

  });

});