var toString = {}.toString;

var typesMap = {
  '[object Function]': 'function',
  '[object Object]': 'object',
  '[object String]': 'string',
  '[object Array]': 'array',
  '[object Number]': 'number'
};

module.exports = {
  isString: function(value) {
    return this.isTypeOf(value, 'string');
  },
  isFunction: function(value) {
    return this.isTypeOf(value, 'function');
  },
  isObject: function(value) {
    return this.isTypeOf(value, 'object');
  },
  isArray: function(value) {
    return this.isTypeOf(value, 'array');
  },
  isNumber: function(value) {
    return this.isTypeOf(value, 'number');
  },
  isTypeOf: function(value, type) {
    return typesMap[toString.call(value)] === type;
  }
};
