# Node.js Bindings for Argonaut

Once made the MaprDB JSON Client for Node.js should be available using npm

Get the client and access table
```javascript
// import the client
var maprdb = require(‘maprdb’)
```
`var table = maprdb.getTable("name")` Finds a table and returns a maprdb.Table object. This method will throw an exception according to the underlying Java API.

`maprdb.createTable("name")` Create a table. The callback will be called on success or failure.

`maprdb.delete("name")` Delete a table, the callback will be called on success or contain an error.

`maprdb.exists("name")` Check if table exist, done synchronously to be able to be easily used in application

## maprdb.Table operations
`table.findById( _id, function(err, doc){}  )` Find the specified document, returning all fields.

`table.findById( _id, fields,  function(err,  doc){}  )` Find the specified record (document), possibly returning only a subset of available columns. The return value is a JSON Document (JavaScript Object). The list of fields is a simple JavaScript array `["field1", "field2", "_id"]` 

`table.find(function(err, docs){})` Scan all documents, returning all fields.

`table.find(fields, function(err, docs){})` Scan all documents, returning specified fields. The full result (buffering) set will be passed to the callback "docs" parameter, so this method is not a good idea to use on large collections. (for a size safe version, see the stream method) 

```javascript
table.find(["first_name", "last_name", "age"], function(err, docs){
  for (i in docs) {
    console.log( docs[i] );
  }
})
```

[ 
  {"first_name" , "John" , "last_name" : "Doe", "age" : 34},
  {"first_name" , "Jane" , "last_name" : "Smith"}
]

`table.find(condition, function(err, docs){})` Find all documents matching a condition, callback will receive all matching documents in once call.

`table.find(condition, fields, function(err, docs){})` This function returns a list of documents based on the condition (see below). Like above the full result set (buffering) will be passed to the callback "docs" parameter, so this isn't the best approache for large result sets. (see `stream()` for an alternative) 

`table.stream(condition, fields, callbacks)` This function will stream the result set into various events. This alternative to eachDocument allows different conditions to be separated into different call-backs.

Here is an example of `stream()`

```javascript
var x = table.stream( condition, fields, {
  "read": function() {...})
  "error": function() {...})
  "end" function() {...})
})
```
`table.eachDocument(condition, fields, callback)` This method has the same behavior as `stream`, but uses a single callback.

`table.insert(document, function(err){})` Insert a new document getting the key for the document from the _id field. If the document already exists, this function will fail.

`table.insert(_id, document, function(err){})` Insert a new document with a specified key. If the document already has an _id field, 
it will be over-written in the database, but the local copy of the document will not be modified. 

`table.insertAll(documents, function(err){})` This is a client side non atomic insert of a number of documents. The `documents` argument is a dict where the keys and documents.

`table.update(_id, mutation, function(err){})` Performs the requested mutation on the document with the specified id. 
Will call the callback on error or successful update. On success, the err argument will be null.

`table.delete(_id, function(err){})` Deletes the document with the specified id. Will call the callback on error 
or successful update. On success, the err argument will be null.

## Document

Any JavaScript `Object` can be  sent to the database as a complete document. For mutations, there is a JSON encoded 
micro-language to describe which fields are changed and how. For example, this might be a document

```json
var doc = {
  "_id" : "00123",
  "name" : "John Doe",
  "interests" : ["movies", "sports"],
  "address" : {
    "street" : "123 Maple Street",
    "city" : "San Jose",
    "state" : "CA",
    "zip" : "95043",
    "country" : "USA"
  },
  "age" : 34
}
```
This document could be saved using `insert` or `insert_or_update` function call.

## Condition Objects

A condition is  used to send server-side query filters to the find operation. Conditions are normally
specified by using a simple micro-language.  For example:

`table.find( { "country" :"china" } )` Finds documents with the country field equal to `"china"`

`table.find( { "country" : "china" } , ["first_name" , "last_name" , "login"] )` Finds documents with country equal to `"china"`, returning only the specified name and login fields.

`table.eachDocument( { "country" :"china" }, callback )` Iterates over all documents with counter equal to `"china"`.

`table.eachDocument( { "country" : "china" } , ["first_name" , "last_name" , "login"], callback )` Same as above, but only returns a few fields.

## Sample conditions

Conditions are created fairly conventionally and have several forms of
short-cuts to handle very common cases. In general, a condition looks
like a mirror of some of the fields in the document except that values
are replaced by comparison functions. The most common short-cut is
that scalar values are short-cuts for an equality test with those
values.

For example, equality with a scalar value can have a short-cut expression:

```json
{ "country" : "China" } // country == "China"
```

Test for structured values like this:

```json
{ "country" : {"$eq": ["China","United States"]} } 
```

Many other tests are also available.  See
the wiki page on [the condition micro language](https://github.com/mapr-demos/js-bindings/wiki/Condition-Micro-Language)
for more details.

## Mutation

In order to change a record, you need to create a mutation object and
use it in an update command. The mutation object is sent to the server
and the actual update is done on the server side.

Mutations are specified in a micro-language similar to the condition
micro-language. If you want to set a field to a scalar value like a
number or a string, you can simply say something like `{"age":
34}`. If you want to do something more elaborate, you need to replace
the value of the field with an update expression. The most common
update expression is something like `{"$setOrReplace": ['a','b']}` but
you could also append a string to a field value, increment a number or
delete the field entirely.

See the wiki page on the [mutation micro language](https://github.com/mapr-demos/js-bindings/wiki/Mutation-micro-language)
for more details.
