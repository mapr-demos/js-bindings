/**
 * @memberof module:errors
 * @class NotSupportedSignatureError
 * @param {string} [message]
 * @constructor
 */
function NotSupportedSignatureError(message) {
  this.name = 'NotSupportedSignatureError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
NotSupportedSignatureError.prototype = Object.create(Error.prototype);
NotSupportedSignatureError.prototype.constructor = NotSupportedSignatureError;

module.exports = NotSupportedSignatureError;
