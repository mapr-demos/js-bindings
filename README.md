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
var mapr = require('maprdb-js');
var table = mapr.createTable('/apps/my_table');
table.insert({_id: '1', name: 'John', lastName: 'Doe', age: 20}, function(err) {
  console.log('my first record');
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
