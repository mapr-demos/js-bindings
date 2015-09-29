var path = require('path');
var java = require('../lib/jexports/javaInstance').javaInstance();
var maprdb = require('../index');
var assert = require('chai').assert;

describe('JVM options setter and getters', function () {
  describe('`maprHomeDir` setter getter', function() {
    it('should get default mapr home directory path', function () {
      assert.include(java.options, '-Dmapr.home.dir=/opt/mapr', 'option present in jvm');
      assert.equal(maprdb.maprHomeDir, '/opt/mapr');
    });
    it('should set specified `/my/home/dir` to maprHomeDir', function () {
      maprdb.maprHomeDir = '/my/home/dir';
      assert.include(java.options, '-Dmapr.home.dir=/my/home/dir', 'option present in jvm');
      assert.equal(maprdb.maprHomeDir, '/my/home/dir');
    });
  });
  describe('#jvmOptions', function() {
    it('should set new option `-DsomeOption=someValue`', function() {
      var testOption = '-DsomeOption=someValue';
      maprdb.jvmOptions.push(testOption);
      assert.include(java.options, testOption);
    });
  });
  describe('#jvmClasspath', function() {
    it('should add new file to classpath', function() {
      var testOption = './somefile';
      maprdb.jvmClasspath.push(testOption);
      assert.include(maprdb.jvmClasspath, testOption);
    });
    it('should add .jar files from directory to classpath', function() {
      var testDirPath = path.resolve(__dirname + '/mockJars');
      var testJarPath = path.resolve(__dirname + '/mockJars/test.jar');
      maprdb.jvmClasspath.pushDir(testDirPath);
      assert.include(maprdb.jvmClasspath, testJarPath);
    });
  });
});
