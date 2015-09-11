var java = require('java');
var path = require('path');
var targetDir = path.resolve('./target/dependency');

java.options.push('-Dmapr.home.dir=/opt/mapr');
java.classpath.pushDir(targetDir);

exports.javaInstance = function() {
  return java;
};
