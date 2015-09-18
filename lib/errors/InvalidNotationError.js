/**
 * @memberof module:errors
 * @class InvalidNotationError
 * @param {string} [message]
 * @constructor
 */
function InvalidNotationError(message) {
  this.name = 'InvalidNotationError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
InvalidNotationError.prototype = Object.create(Error.prototype);
InvalidNotationError.prototype.constructor = InvalidNotationError;

module.exports = InvalidNotationError;