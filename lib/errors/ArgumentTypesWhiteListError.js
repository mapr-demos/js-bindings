/**
 * @memberof module:errors
 * @class ArgumentTypesWhiteListError
 * @param {string} [message]
 * @constructor
 */
function ArgumentTypesWhiteListError(message) {
  this.name = 'ArgumentTypesWhiteListError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
ArgumentTypesWhiteListError.prototype = Object.create(Error.prototype);
ArgumentTypesWhiteListError.prototype.constructor = ArgumentTypesWhiteListError;

module.exports = ArgumentTypesWhiteListError;