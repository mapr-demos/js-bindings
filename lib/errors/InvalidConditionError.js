/**
 * @memberof module:errors
 * @class InvalidConditionError
 * @param {string} [message]
 * @constructor
 */
function InvalidConditionError(message) {
  this.name = 'InvalidConditionError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
InvalidConditionError.prototype = Object.create(Error.prototype);
InvalidConditionError.prototype.constructor = InvalidConditionError;

module.exports = InvalidConditionError;