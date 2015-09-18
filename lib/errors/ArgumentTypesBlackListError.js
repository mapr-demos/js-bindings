/** @module errors **/

/**
 * @memberof module:errors
 * @class ArgumentTypesBlackListError
 * @param {string} [message]
 * @constructor
 */
function ArgumentTypesBlackListError(message) {
  this.name = 'ArgumentTypesBlackListError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
ArgumentTypesBlackListError.prototype = Object.create(Error.prototype);
ArgumentTypesBlackListError.prototype.constructor = ArgumentTypesBlackListError;

module.exports = ArgumentTypesBlackListError;