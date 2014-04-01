#Cloudbase
---
##MongoDB BaaS built upon Node.js, Express, Mongo, and Socket.IO
Allows one to quickly and easily add, query, remove and update items in a MongoDB  
database using websockets or REST.

The code is fairly well documented with example _curl_ usage per request and  
an example client utilizing websockets is included in  the _clientExample_ directory.

###Installation:  
Ensure that you have working MongoDB instance and that you have access to it.  
Create a database to hold the created collections. Then:  

__INSTALL__:  

    git clone https://github.com/TheInsomniac/CloudBase
    npm install

__EDIT__: _config.json.dist_ and rename to _config.json_
  - dbUrl : http://hostname[:port]
  - dbName : name of DB created above
  - port : Port to host node app on

__RUN__:  

    npm start

###REST Usage:  
__Add Item:__  

    curl -X POST -H "Content-Type: application/json" -d '{"_id":"test", "username":"me","password":"pass"}' \
    http://localhost:3000/example

__Get Item:__  

    curl -X GET -H "Content-Type: application/json"  http://localhost:3000/example/test

__Find Item ($regex, $lt, $gt, etc):__

    curl -X GET -H "Content-Type: application/json"  -d '{ "_id": { "$regex": "tes", "$options": "i" }}' \
    http://localhost:3000/example

__Update Item:__  

    curl -X PUT -H "Content-Type: application/json" -d '{"username":"em","password":"ssap"}' \
    http://localhost:3000/example/test

__Delete Item:__  

    curl -X DELETE -H "Content-Type: application/json" http://localhost:3000/example/test

__Delete Collection:__  

    curl -X DELETE -H "Content-Type: application/json" -d '{"clearcollection":"true"}' \
    http://localhost:3000/example

__Get Collection:__  

    curl -X GET -H "Content-Type: application/json"  http://localhost:3000/example

####TODO:  
  - MUCH better (rather..ADD SOME) error handling for improperly formated JSON queries..
