var java = require('./javaInstance').javaInstance();

module.exports = java.import('com.mapr.db.MapRDB');
