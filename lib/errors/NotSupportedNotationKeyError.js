/**
 * @memberof module:errors
 * @class NotSupportedNotationKeyError
 * @param {string} [message]
 * @constructor
 */
function NotSupportedNotationKeyError(message) {
  this.name = 'NotSupportedNotationKeyError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
NotSupportedNotationKeyError.prototype = Object.create(Error.prototype);
NotSupportedNotationKeyError.prototype.constructor = NotSupportedNotationKeyError;

module.exports = NotSupportedNotationKeyError;