// The channel name must match the Cloudbase collection name that you're utilizing..
var channel = 'example';
// URL of Socket.IO Server
var socketURL = 'http://localhost:3000';

// Initialize socket.io
var socket = io.connect(socketURL);

//on connection, updates connection state and sends subscribe request
socket.on('connect', function() {
  'use strict';
  socket.emit('subscribe', {
    channel: channel
  });
  // request complete collection
  emit.collection();
});

//when reconnection is attempted, updates status
socket.on('reconnecting', function() {
  'use strict';
  // request complete collection in case the current data is stale
  emit.collection();
});

// Get messages and log to console
socket.on('message', function(data) {
  'use strict';
  console.log(data.text);
});

// Get entire collection
/* socket.emit('collection', {channel:channel}); */
socket.on('collection', function(data) {
  'use strict';
  if (typeof treeView === 'function') treeView(data);
  console.log(JSON.stringify(data));
});

/* socket.emit('item', {channel:channel, item:"test"}); */
socket.on('item', function(data) {
  'use strict';
  console.log(JSON.stringify(data));
});

/* socket.emit('add', {channel:channel, item:{_id:"test", data0:"0", data1:"1"}}); */
socket.on('added', function(data) {
  'use strict';
  console.log(JSON.stringify(data));
  if (data.exists) {
    alert('Item already exists. Did you mean to update or delete?');
  }
  emit.collection();
});

/* socket.emit('update', {channel:channel, item:{"test": {data0:"0",data1:"1", data2:"2"}}}); */
socket.on('updated', function(data) {
  'use strict';
  console.log(JSON.stringify(data));
  if (data.missing) {
    alert('Item does not exist. Did you mean to add?');
  }
  emit.collection();
});

/* socket.emit('remove', {channel:channel, item:"test"}); */
socket.on('removed', function(data) {
  'use strict';
  console.log(JSON.stringify(data));
  socket.emit('collection', {
    channel: channel
  });
});


/* emit helper function */
var emit = {
  collection: function() {
    'use strict';
    // Usage: emit.collection();
    socket.emit('collection', {
      channel: channel
    });
  },
  item: function(item) {
    'use strict';
    // Usage: emit.item("ID");
    socket.emit('item', {
      channel:channel,
      item:item
    });
  },
  add: function(item) {
    'use strict';
    // Usage: emit.add({_id:"test", data0:"0", data1:"1"});
    socket.emit('add', {
      channel:channel,
      item:item
    });
  },
  update: function(item) {
    'use strict';
    // Usage: emit.update({"ID": {data0:"0",data1:"1", data2:"2"}});
    socket.emit('update', {
      channel:channel,
      item:item
    });
  },
  remove: function(item) {
    'use strict';
    // Usage: emit.remove("ID");
    socket.emit('remove', {
      channel:channel,
      item:item
    });
  }
};
