/**
 * @memberof module:errors
 * @class NullTypeError
 * @param {string} [message]
 * @constructor
 */
function NullTypeError(message) {
  this.name = 'NullTypeError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
NullTypeError.prototype = Object.create(Error.prototype);
NullTypeError.prototype.constructor = NullTypeError;

module.exports = NullTypeError;