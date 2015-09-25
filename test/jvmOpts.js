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
});
