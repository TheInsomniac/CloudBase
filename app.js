// TODO: MUCH better (rather..ADD SOME) error handling for improperly formated JSON queries..

/* Load values from config file for below variables */
var config = require('./config.json');
/* URL to MongoDB store */
var dbUrl = config.dbUrl;
/* MongoDB Database name */
var dbName = config.dbName;
/* HTTP Port for server */
var port = config.port;

/* Init Monk */
var Datastore = require('monk')(dbUrl + '/' + dbName);

var express = require('express'),
  app = new express(),
  /* Express 4.x body-parse for urlencode and json */
  bodyParser = require('body-parser'),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

/* Reduce Socket.IO Logging */
io.set('log level', 1);

/* Express 4.x body-parser for urlencode and json */
app.use(bodyParser());

app.use(function(err, req, res, next) {
  'use strict';
  res.json(500, {
    Error: 'Improperly Formatted Request/JSON'
  });
});

// app.use(express.favicon(__dirname + '/favicon.ico', {
//   maxAge: 6000000
// }));

/* For example.html usage. Comment out in production and remove "clientExample" dir */
app.use(express.static(__dirname + '/clientExample', {
  maxAge: 6000000
}));

/* Get item in form of collectionName/item/[key] */
/* curl -X GET -H "Content-Type: application/json"  http://localhost:3000/example/test */

// TODO: use pattern matching to allow further refinement of returned data...
// app.get(/^\/((?:[^\/]+\/?)+)\/?/, function (req, res, next) {
//   'use strict';
//   var parm = req.params[0].split('/');
//   if (parm.length === 1) next();
//   else {
//     if (parm[parm.length - 1] === '') parm.pop();
//     var db = parm[0];
//     var item = parm[1];
//     var key = parm[2];
//     itemGet(db, item, function() {
//       if (this.length && !key) res.json(this[0]);
//       else if (this.length && key) {
//         //this[0][key] instanceof Array
//         res.json(this[0][key]);
//       }
//       else res.json({Error:'Item does not exist'});
//     });
//   }
// });

app.get('/:db/:item/:key?', function(req, res) {
  'use strict';
  var db = req.params.db;
  var item = req.params.item;
  if (req.params.key) var key = req.params.key;
  itemGet(db, item, function() {
    if (this.length && !key) res.json(this[0]);
    else if (this.length && key) {
      res.json(this[0][key]);
    } else res.json({
      Error: 'Item does not exist'
    });
  });
});

/* Display all items in given collection */
/* curl -X GET -H "Content-Type: application/json"  http://localhost:3000/example */
app.get('/:db', function(req, res, next) {
  'use strict';
  if (Object.keys(req.body).length) {
    next();
  } else {
    var db = req.params.db;
    collectionGet(db, function() {
      if (!Object.keys(this[Object.keys(this)[0]]).length) {
        res.json({
          Error: 'Database empty or does not exist'
        });
      } else {
        res.json(this);
      }
    });
  }
});

/* Find item using query (such as regex example below) in collection */
/* curl -X GET -H "Content-Type: application/json"  -d '{ "_id": { "$regex": "tes", "$options": "i" }}' \
http://localhost:3000/example */
app.get('/:db', function(req, res) {
  'use strict';
  var db = req.params.db;
  var query = req.body;
  collectionFind(db, query, function() {
    if (!Object.keys(this[Object.keys(this)[0]]).length) {
      res.json({
        Error: 'No matches found'
      });
    } else {
      res.json(this);
    }
  });
});

/* Add new item to given collection */
/* curl -X POST -H "Content-Type: application/json" -d '{"_id":"test", "username":"me","password":"pass"}' \
http://localhost:3000/example */
app.post('/:db', function(req, res) {
  'use strict';
  var db = req.params.db;
  var data = req.body;
  itemAdd(db, data, function() {
    if (this) res.json(201, this);
    else if (!this) res.json({
        Error: 'Item already exists. Use PUT method to update item'
      });
  });
});

/* Update existing item in form /collection/item */
/* curl -X PUT -H "Content-Type: application/json" -d '{"username":"em","password":"ssap"}' \
http://localhost:3000/example/test */
app.put('/:db/:item', function(req, res) {
  'use strict';
  var db = req.params.db;
  var item = req.params.item;
  var data = req.body;
  itemUpdate(db, item, data, function() {
    if (this) res.json(this);
    else if (!this) res.json({
        Error: 'Item not found'
      });
  });
});

/* Delete item in form /collection/item */
/* curl -X DELETE -H "Content-Type: application/json" http://localhost:3000/example/test */
/* OR */
/* Clear collection in form /collection */
/* curl -X DELETE -H "Content-Type: application/json" -d '{"clearcollection":"true"}' \
http://localhost:3000/example */
app.delete('/:db/:item?', function(req, res) {
  'use strict';
  var db = req.params.db;
  var item;
  if (req.params.item) item = req.params.item;
  var itemData = req.body;
  if (itemData.hasOwnProperty('clearcollection')) {
    if (itemData.clearcollection === 'true') {
      collectionClear(db, function() {
        res.json({
          Collection: 'Emptied'
        });
      });
    } else {
      res.json({
        Warning: "Set 'clearcollection':'true' if you want to clear the collection"
      });
    }
  } else if (item) {
    itemRemove(db, item, function() {
      var data = {};
      data['Removed'] = item;
      if (this) res.json(data);
      else res.json({
          Error: 'Item does not exist'
        });
    });
  } else {
    res.json({
      Error: 'No item specified for deletion'
    });
  }
});

/* Catchall */
app.get('/*', function(req, res) {
  'use strict';
  res.json({
    Error: 'No database specified or invalid command'
  });
});

/* --- Helper functions --- */

/* Validate JSON to ensure it's properly formatted */
function validateJSON(json) {
  'use strict';
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

/* Get list of items in collection */
function collectionGet(db, cb) {
  'use strict';
  var collection = Datastore.get(db);
  var output = {};
  output[db] = {};
  collection.find({}, {
    stream: true
  })
    .each(function(doc) {
      output[db][doc._id] = doc;
    })
    .error(function(err) {
      console.error(err);
    })
    .success(function() {
      if (cb) cb.call(output);
    });
}

function collectionFind(db, query, cb) {
  'use strict';
  var collection = Datastore.get(db);
  var output = {};
  output[db] = {};
  collection.find(query, {
    stream: true
  })
    .each(function(doc) {
      output[db][doc._id] = doc;
    })
    .error(function(err) {
      console.error(err);
    })
    .success(function() {
      if (cb) cb.call(output);
    });
}

/* Clear all entries in collection and emit clear page */
function collectionClear(db, cb) {
  'use strict';
  var collection = Datastore.get(db);
  collection.remove(function(err) {
    if (err) console.error(err);
    io.sockets.in(db).emit('clear');
    if (cb) cb.call();
  });
}

/* Add new items to database and emit new item */
function itemAdd(db, data, cb) {
  'use strict';
  var collection = Datastore.get(db);
  collection.insert(data, function(err, doc) {
    if (err && err.code === 11000) {
      if (cb) cb.call(false);
    } else {
      io.sockets.in(db).emit('added', {
        added: data
      });
      if (cb) cb.call(doc);
    }
  });
}

/* Fetch specific item */
function itemGet(db, item, cb) {
  'use strict';
  var collection = Datastore.get(db);
  collection.find({
    _id: item
  }, function(err, doc) {
    if (cb) cb.call(doc);
  });
}

/* Edit items in Database and emit change */
function itemUpdate(db, item, data, cb) {
  'use strict';
  var collection = Datastore.get(db);
  var update = {};
  update['$set'] = data;
  collection.findAndModify({
    _id: item
  }, update, function(err, doc) {
    if (err) console.error(err);
    if (doc) {
      io.sockets.in(db).emit('updated', {
        updated: item
      });
      if (cb) cb.call(doc);
    } else {
      if (cb) cb.call(false);
    }
  });
}

/* Remove item from database and emit remove item */
function itemRemove(db, item, cb) {
  'use strict';
  var collection = Datastore.get(db);
  collection.remove({
    _id: item
  }, function(err, doc) {
    if (err) console.error(err);
    if (doc === 0) {
      if (cb) cb.call(false);
    } else {
      io.sockets.in(db).emit('removed', {
        removed: item
      });
      if (cb) cb.call(true);
    }
  });
}

/* --- Socket.IO Functions --- */

io.sockets.on('connection', function(socket) {
  'use strict';
  //on connect send a welcome message
  socket.emit('message', {
    text: 'Connected...'
  });

  //on subscription request joins specified room
  //later messages are broadcasted on the rooms
  socket.on('subscribe', function(data) {
    var channel = data.channel;
    socket.join(channel);
  });

  socket.on('collection', function(data) {
    var channel = data.channel;
    collectionGet(channel, function() {
      io.sockets.in(channel).emit('collection', this);
    });
  });

  socket.on('item', function(data) {
    var channel = data.channel;
    var item = data.item;
    itemGet(channel, item, function() {
      io.sockets.in(channel).emit('item', this[0]);
    });
  });

  socket.on('remove', function(data) {
    var channel = data.channel;
    var item = data.item;
    itemRemove(channel, item);
  });

  socket.on('clear', function(data) {
    var channel = data.channel;
    collectionClear(channel);
  });

  socket.on('add', function(data) {
    var channel = data.channel;
    var item = data.item;
    //var key = Object.keys(data.item)[0];
    itemAdd(channel, item, function() {
      if (!this) io.sockets.in(channel).emit('added', {
          exists: 'Exists'
        });
    });
  });

  socket.on('update', function(data) {
    var channel = data.channel;
    var item = data.item[Object.keys(data.item)[0]];
    var key = Object.keys(data.item)[0];
    itemUpdate(channel, key, item, function() {
      if (!this) io.sockets.in(channel).emit('updated', {
          missing: 'Missing'
        });
    });
  });

});

/* Start server on port 3000 */
server.listen(port);
