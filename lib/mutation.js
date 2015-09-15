var maprJClass = require('./jexports/MapRDBStaticClass');
var java = require('./jexports/javaInstance').javaInstance();
var typeChecker = require('./utils/typeChecker');
var JavaJsConverter = require('./utils/JavaJsConverter');

/**
 *
 */
var mutation = function () {
  this.jMutation = maprJClass.newMutationSync();
  var m = arguments[0];
  if (typeChecker.isObject(m)) {
    return this.parseMutation(m);
  }
};

mutation.mutationMap = {
  set:  ['$set'],
  setOrReplace: ['$setOrReplace'],
  increment: ['$inc'],
  append: ['$append'],
  delete: ['$delete']
};

mutation.prototype.parseMutation = function (json) {
  var self = this;
  var keys = Object.keys(json);

  keys.forEach(function(key) {

    var state, value;
    if (typeChecker.isObject(json[key])) {
      state = Object.keys(json[key])[0];
      value = json[key][state];
    }
    else {
      throw 'bad mutation key: ' + json[key];
    }

    if (mutation.mutationMap.set.indexOf(state) !== -1) {
      return self.set(key, value);
    }

    if (mutation.mutationMap.setOrReplace.indexOf(state) !== -1) {
      return self.setOrReplace(key, value);
    }

    if (mutation.mutationMap.increment.indexOf(state) !== -1) {
      return self.increment(key, value);
    }

    if (mutation.mutationMap.append.indexOf(state) !== -1) {
      return self.append(key, value);
    }

    if (mutation.mutationMap.delete.indexOf(state) !== -1) {
      return self.delete(key);
    }

  });
};

mutation.prototype.set = function (name, value) {
  this.jMutation = this.jMutation.setSync(name, JavaJsConverter.convertJsToJava(value));
  return this;
};

mutation.prototype.setOrReplace = function (name, value) {
  this.jMutation = this.jMutation.setOrReplaceSync(name, JavaJsConverter.convertJsToJava(value));
  return this;
};

mutation.prototype.append = function (name, value) {
  this.jMutation = this.jMutation.appendSync(name, JavaJsConverter.convertJsToJava(value));
  return this;
};

mutation.prototype.increment = function(name, value) {
  this.jMutation = this.jMutation.incrementSync(name, value);
  return this;
};

mutation.prototype.delete = function(name) {
  this.jMutation = this.jMutation.deleteSync(name);
  return this;
};

mutation.prototype.build = function () {
  this.jMutation = this.jMutation.buildSync();
  return this;
};

module.exports = mutation;