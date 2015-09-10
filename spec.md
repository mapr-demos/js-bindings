# Node.js Bindings for Argonaut

Once made the MaprDB JSON Client for Node.js should be available using npm

Get the client and access table
```javascript
// import the client
var maprdb = require(‘maprdb’);
```
`var table = maprdb.getTable("name")` Finds a table and returns a maprdb.Table object. This method will throw an exception according to the underlying Java API.

`maprdb.createTable("name")` Create a table. The callback will be called on success or failure.

`maprdb.delete("name")` Delete a table, the callback will be called on success or contain an error.

`maprdb.exists("name")` Check if table exist, done synchronously to be able to be easily used in application

## maprdb.Table operations
`table.findById( _id, function(err, doc){}  );` Find the specified document, returning all fields.

`table.findById( _id, fields,  function(err,  doc){}  );` Find the specified record (document), possibly returning only a subset of available columns. The return value is a JSON Document (JavaScript Object). The list of fields is a simple JavaScript array `["field1", "field2", "_id"]` 

`table.find(function(err, docs){})` Scan all documents, returning all fields.

`table.find(fields, function(err, docs){})` Scan all documents, returning specified fields. The full result (buffering) set will be passed to the callback "docs" parameter, so this method is not a good idea to use on large collections. (for a size safe version, see the stream method) 

```javascript
table.find(["first_name", "last_name", "age"], function(err, docs){
  for (i in docs) {
    console.log( docs[i] );
  }
}); 
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

```javascript
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


Condition


A condition is a specific object used to send query filter to the find operation, some examples:


table.find( { "country" :"china" } )
table.find( { "country" : "china" } , ["first_name" , "last_name" , "login"] )


table.eachDocument( { "country" :"china" } )
table.eachDocument( { "country" : "china" } , ["first_name" , "last_name" , "login"] )


Sample conditions


Equality with a scalar value can have a short-cut expression:
{ "country" : "China" } // country = "China" (or country[] = "China")


But testing for equality with structures is not allowed:
{ "country" : ["China", "United States"] } 
{ "country" : {"bag": "China"} } 


Instead, do this:
{ "country" : {"$eq": ["China","United States"]} } 


Other tests are also available
{ "age" : { "$gt" : 34 } } // age > 34
{ "age" : { "$gte" : 34 } } // age >= 34
{ "age" : { "$lt" : 34 } } // age < 34
{ "age" : { "$lte" : 34 } } // age <= 34
{ "age" : { "$neq" : 34 } } // age != 34
{ "age" : { "$between" : [30,40] } } // BETWEEN 30 and 40 (inclusive)
{ "age" : { "$in" : [20,25,30] } } // IN [20, 25, 30]
{ "age" : { "$exists" : true} }
{ "age" : { "$exists" : false} }


The complete list of available operators is:




Operator
	Meaning
	$eq, $equal, =
	Is equal to. No implicit conversion of types is done. Note that comparison with null is done as in Java, not as in SQL.  This means that null == null.
	$ne, $neq, !=
	Not equal to. 
	$lt, $less, <
	Less than. Should work for either strings or numbers, but comparing strings to numbers is not defined.
	$lte, $le, <=
	Less than or equal.
	$gt, $greater, >
	Greater than.
	$ge, $gte, >=
	Greater than or equal
	$between
	The value of the field should be a list of two values. {x: {$between:[u,v]}} is equivalent to {x: {$ge:u}, x:{$le:v}}.
	$in
	The value of the field is in a literal list. {x: {$in: [1,2,34]}} is true if x is any of 1, 2 or 34.
	!$in
	Not in.
	$exists
	The field exists or not according to the the value supplied. Note that missing is different from null.
	$like, $matches
	The value of the field matches a regular expression.
	!$like, !$matches
	The value of the field does not match a regular expression.
	





If you want to set a condition on multiple fields, simply include all of the tests in a single object
{ "country" : "China", "age" : 34 } // country = "China" AND age = 34


Note that if you need multiple conditions on a single field, it can appear more than once in a condition expression
{ "country" : "China", "age": {$ge:30}, "age": {$lt:40} } 


In contrast, if you want any of several conditions to be satisfied, simply put all the alternatives in a list.
[ condition1, condition2, ... ] // condition1 OR condition2


Extension of this mechanism to other tests is an area of active discussion.
Mutation
The mutation object is sent to the server and all operations are used on the server side. 


{"field" : { "$set" : "value"}  }
{"age" : { "$set" : 34}  }  // set age to 34
{"age" : { "$set" : 34} , "country" : { "$set": "USA"}  }  // set age to 34 and country to USA
{ "interests" : { "$set" : ["x", "y"] } } // set interests to an array
{ "address" : { "$set" : { "t" : "home"} } } // set address to an Object


{"field" : { "$setOrReplace" : "value"}  }
{"age" : { "$setOrReplace" : 34}  }  // set age to 34
{"age" : { "$setOrReplace" : 34, "country" : { "$setOrReplace" : "USA"}  }  // set age to 34 and country to USA


{ "field" : { "$append" : "value" }}
{ "name" :  { "$append" : "Doe" }} //  append Doe to the string if string or array if array eg: "John" = "JoeDoe" OR ["John"] = ["John" , "Doe"]


{"field" : { "$setOrReplace" : "value"}  }
{"age" : { "$setOrReplace" : 34}  }  // set age to 34
{"age" : { "$setOrReplace" : 34, "country" : { "$setOrReplace" : "USA"}  }  // set age to 34 and country to USA




{"field" : { "$inc" : value } }
{"age" : { "$inc" : 1 } } //  increment one value by a specified amount
