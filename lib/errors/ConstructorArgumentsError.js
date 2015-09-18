/**
 * @memberof module:errors
 * @class ConstructorArgumentsError
 * @param {string} [message]
 * @constructor
 */
function ConstructorArgumentsError(message) {
  this.name = 'ConstructorArgumentsError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
ConstructorArgumentsError.prototype = Object.create(Error.prototype);
ConstructorArgumentsError.prototype.constructor = ConstructorArgumentsError;

module.exports = ConstructorArgumentsError;