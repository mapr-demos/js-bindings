/**
 * @memberof module:errors
 * @class MalformedObjectError
 * @param {string} [message]
 * @constructor
 */
function MalformedObjectError(message) {
  this.name = 'MalformedObjectError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
MalformedObjectError.prototype = Object.create(Error.prototype);
MalformedObjectError.prototype.constructor = MalformedObjectError;

module.exports = MalformedObjectError;