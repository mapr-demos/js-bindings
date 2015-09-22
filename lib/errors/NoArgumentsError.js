/**
 * @memberof module:errors
 * @class NoArgumentsError
 * @param {string} [message]
 * @constructor
 */
function NoArgumentsError(message) {
  this.name = 'NoArgumentsError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
NoArgumentsError.prototype = Object.create(Error.prototype);
NoArgumentsError.prototype.constructor = NoArgumentsError;

module.exports = NoArgumentsError;
