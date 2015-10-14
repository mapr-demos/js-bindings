# js-bindings
Node-centric Javascript bindings for MapR DB JSON API
=======
Setup
---

Install Node 0.10.x or 0.12.x.

This package has dependencies which use native addons. You will need c++ compiler, python and other software depends on your OS.

**General requirements**

- python v2.7 (v3.x.x not supported)
- maven >= v3.1.x
- GCC compiler

**Ubuntu/Debian**
```
sudo apt-get install build-essential gcc
```

**Redhat/Centos**
```
sudo yum install build-essential gcc gcc-c++
```

For additional info please check [node-gyp installation section](https://github.com/nodejs/node-gyp#installation)

Installation
---
Clone this repo and execute.

```
cd /path/to/src && npm install
```


Usage
---
Run sandbox VM.

Add VM ip address to your host file:

```
sudo echo "VM_IP_HERE maprdemo" >> /etc/hosts
```

On host machine create folder `/opt/mapr/conf`:

```
mkdir -p /opt/mapr/conf
```

Create configuration file `mapr-clusters.conf` in `/opt/mapr/conf` with following content:

```
echo "demo.mapr.com maprdemo:722" > /opt/mapr/conf/mapr-clusters.conf
```

Connect by ssh to VM and change permissions for directory */mapr/demo.mapr.com/apps*:

```
chmod -R 777 /mapr/demo.mapr.com/apps
```

You have to link it to your global packages if you want to use package as dependency in your project:

```
cd /path/to/src && npm link
```

Suppose you have a project on path `~/my-project`:

```
cd ~/my-project && npm link maprdb-js
```

Now you can require and use this package as external dependency. For example:

```javascript
// index.js

var maprdb = require('maprdb-js');
// let's create a table asynchronously
maprdb.createTable('/apps/my_table', function(error, table) {
  if (!error) {
    // insert new document to the table
    table.insert({_id: '1', name: 'John', lastName: 'Doe', age: 20}, function(err) {
      console.log('my first record');
    });
  } else {
    console.log(error);
  }
});
```

More info about package API you can see in [spec.md](./spec.md).

### JVM options

Because of JNI and node-java package limitations you can set jvm options or `maprHomeDir` only once before any method call. For example.

```javascript
var maprdb = require('maprdb-js');
maprdb.maprHomeDir = '/some/dir'; // works fine
maprdb.createTable('/apps/my_table')
maprdb.maprHomeDir = '/another/dir'; // will throw error
```

#### maprdb.jvmOptions

Array of options to pass to the creation of the JVM.

**Example**

```javascript
var maprdb = require('maprdb-js');
maprdb.jvmOptions.push('-Xmx1024m');
maprdb.jvmOptions.push('-DcustomOption=customValue');
```

#### maprdb.jvmClasspath

Array of paths or jars to pass to the creation of the JVM.

**Example**

```javascript
var maprdb = require('maprdb-js');
maprdb.jvmClasspath.push('some.jar'); // add .jar file
maprdb.jvmClasspath.push('Some.class'); // add .class file
maprdb.jvmClasspath.pushDir('someDir'); // add all files from ./someDir
```


API Documents
---


- [maprdb](#maprdb)
    - [getTable](#gettable)
    - [createTableSync](#createtablesync)
    - [createTable](#createtable)
    - [deleteTable](#deletetable)
    - [exists](#exists)

- [table](#Table)
    - [find](#find)
    - [findById](#findbyid)
    - [update](#update)
    - [insert](#insert)
    - [insertAll](#insertall)
    - [stream](#stream)
    - [eachDocument](#eachdocument)
    - [close](#close)



## maprdb

#### getTable

```javascript
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');
```

#### createTableSync

```javascript
var maprdb = require('maprdb');
var table = maprdb.createTableSync('/apps/my_table');
```

#### createTable

```javascript
var maprdb = require('maprdb');
maprdb.createTable('/apps/my_table', function (err, table) {
	// callback body
});
```
#### deleteTable
```javascript
var maprdb = require('maprdb');
maprdb.deleteTable('/apps/my_table', function (err, res) {
	// callback body
});
```

#### exists

```javascript
var maprdb = require('maprdb');
var tableExists = maprdb.exists('/apps/my_table'); // true|false
```

## Table

#### find

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

// pass fields to return and callback
table.find(['name'], function(err, docs) {
    console.log(err, docs);
    // output: [
    //    {_id: '01', name: 'John'},
    //    {_id: '02', name: 'Sam'}
    // ]
});

// pass condition to match and callback
table.find({ age: 20}, function(err, docs) {
    console.log(docs); // output: [{_id: '02', name: 'Sam', age: 20}]
});

// pass condition to match, fields to return and callback
table.find({ age: 20}, ['age'], function(err, docs) {
    console.log(docs); // output: [{_id: '02', age: 20}]
});

// pass callback only, return all documents
table.find(function(err, docs) {
    console.log(docs);
    // output: [
    //    {_id: '01', name: 'John', age: 10},
    //    {_id: '02', name: 'Sam', age: 20}
    // ]
});
// close table
table.close();
```

#### findById

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

// pass document _id and callback
table.findById('01', function(err, doc) {
    console.log(doc); // output: {_id: '01', name: 'John', age: 10}
});

// pass document _id, fields to return
table.findById('02', ['age'], function(err, doc) {
    console.log(doc) // output: [{_id: '02', age: 20}]
});

// close table
table.close();
```

#### update

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

// pass document _id and mutation
table.update('01', { age: { $inc: 1}}, function(err) {
   // callback body
});

// close table
table.close();
```

#### insert

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

table.insert({ _id: '10', name: 'Tom'}, function(err) {
    // callback body
});

// close table
table.close();
```

#### insertAll

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

table.insertAll([
        { _id: '10', name: 'Tom'},
        { _id: '12', name: 'Jerry'}
    ], function(err) {
        // callback body
});

// close table
table.close();
```

#### stream

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

table.stream({age: { $gte: 10}}, {
    err: function(err) {
        // error handler
    },
    read: function(doc) {
        // handle single document
    },
    end: function() {
        // handle end of iteration
    }
});

// close table
table.close();
```

#### eachDocument

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');

table.eachDocument({age: { $gte: 10}}, function(doc, err) {
    // handle single document and error
});

// close table
table.close();
```

#### close

Conventional method to close table when you've completed all needed operations.
This will prevent memory leaks.

```javascript
/* documents:
    {_id: '01', name: 'John', age: 10},
    {_id: '02', name: 'Sam', age: 20}
*/
var maprdb = require('maprdb');
var table = maprdb.getTable('/apps/my_table');
// make some operations over table
// and close it when you don't need it anymore
table.close();
```


Run Tests
---
```
npm test
```

Documentation
---

To generate developer documentation execute:

```
npm run docs
```
