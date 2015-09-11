var toString = {}.toString;

var typesMap = {
  '[object Boolean]':  'boolean',
  '[object Number]':   'number',
  '[object String]':   'string',
  '[object Function]': 'function',
  '[object Array]':    'array',
  '[object Date]':     'date',
  '[object RegExp]':   'regexp',
  '[object Object]':   'object',
  '[object Error]':    'error'
};

module.exports = {

  /**
   * Check if value is a string.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isString: function(value) {
    return this.isTypeOf(value, 'string');
  },

  /**
   * Check if value is a function.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isFunction: function(value) {
    return this.isTypeOf(value, 'function');
  },

  /**
   * Check if value is an object.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isObject: function(value) {
    return this.isTypeOf(value, 'object');
  },

  /**
   * Check if value is a java-object.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isJavaObject: function(value) {
    return this.isTypeOf(value, 'java');
  },

  /**
   * Check if value is an array.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isArray: function(value) {
    return this.isTypeOf(value, 'array');
  },

  /**
   * Check if value is a number.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isNumber: function(value) {
    return this.isTypeOf(value, 'number');
  },

  /**
   * Check if value is a boolean.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isBoolean: function(value) {
    return this.isTypeOf(value, 'boolean');
  },

  /**
   * Check if value is a Date.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   */
  isDate: function(value) {
    return this.isTypeOf(value, 'date');
  },

  /**
   * Check if <code>value</code> is instance of <code>type</code>
   *
   * @param {*} value
   * @param {string} type
   * @returns {boolean}
   */
  isTypeOf: function(value, type) {
    return this.getType(value) === type;
  },

  /**
   * Try detect type of value.
   *
   * @param {*} value
   * @returns {string}
   */
  getType: function (value) {
    if (value === null) {
      return 'null';
    }
    if ('undefined' === typeof value) {
      return 'undefined';
    }
    var type = toString.call(value);
    var ret = typesMap[type];
    if (ret === 'object') {
      if (value instanceof Error) {
        ret = 'error';
      }
      else {
        if (value instanceof Date) {
          ret = 'date';
        }
      }
    }
    if (!ret) {
      // try check if it's a java object
      if (type.indexOf('[object nodeJava_') === 0) {
        return 'java';
      }
    }
    return ret;
  },

  /**
   * Try to get value's java class
   *
   * @param {object} value
   * @returns {string}
   */
  getJavaType: function (value) {
    if (!this.isJavaObject(value)) {
      return '';
    }
    return value.getClassSync().toString().replace('class ', '');
  }

};
