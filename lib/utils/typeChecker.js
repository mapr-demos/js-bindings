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
  '[object Error]':    'error',
  '[object Arguments]':'arguments'
};

/** @module utils/typeChecker **/
module.exports = {

  /**
   * Check if value is a string.
   * @see #isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   * @method isString
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
   * @method isFunction
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
   * @method isTypeOf
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
   * @method isJavaObject
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
   * @method isArray
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
   * @method isNumber
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
   * @method isBoolean
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
   * @method isDate
   */
  isDate: function(value) {
    return this.isTypeOf(value, 'date');
  },

  /**
   * Check if value is null.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   * @method isNull
   */
  isNull: function (value) {
    return this.isTypeOf(value, 'null');
  },

  /**
   * Check if value is null.
   * @see isTypeOf
   *
   * @param {*} value
   * @returns {boolean}
   * @method isArguments
   */
  isArguments: function (value) {
    return this.isTypeOf(value, 'arguments');
  },


  /**
   *
   * @param {} value
   * @returns {}
   */
  isError: function(value) {
    return this.isTypeOf(value, 'error');
  },

  /**
   * Check if <code>value</code> is instance of <code>type</code>
   *
   * @param {*} value
   * @param {string} type
   * @returns {boolean}
   * @method isTypeOf
   */
  isTypeOf: function(value, type) {
    return this.getType(value) === type;
  },

  /**
   * Try detect type of value.
   *
   * @param {*} value
   * @returns {string}
   * @method getType
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
   * @method getJavaType
   */
  getJavaType: function (value) {
    if (!this.isJavaObject(value)) {
      return '';
    }
    return value.getClassSync().toString().replace('class ', '');
  },

  /**
   * Check if each list's item is type of <code>neededTypes</code>
   * @param {array} list checked array
   * @param {string|string[]} neededTypes type(s) that each list's element should be
   * @returns {boolean} true - each element has needed type, false - when list is not array, is empty array or not each element has needed type
   * @method checkEachType
   */
  checkEachType: function (list, neededTypes) {
    if (!this.isArray(list)) {
      return false;
    }
    var l = list.length;
    if (!l) {
      return false;
    }
    neededTypes = this.isArray(neededTypes) ? neededTypes : [neededTypes];
    for (var i = 0; i < l; i++) {
     if (neededTypes.indexOf(this.getType(list[i])) === -1) {
       return false;
     }
    }
    return true;
  }

};
