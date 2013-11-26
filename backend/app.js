var MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server;

var jwt = require('jwt-simple');
var filters = require('./filters');
var express = require('express');
var tokenRegistry = require('./token-registry').getInstance({});
var util = require('util');
var app = express();

require('./db').db(Server, MongoClient, {
  dbhost: 'localhost',
  dbport: 27017,
  dbname: 'around-me'

}, function (db) {

var sayModel = function (params) {
    var id = generateId('say');

    return {
        id: id,
        _id: id,
        text: params.text,
        username: params.username,
        location: params.location,
        posted: params.posted
    }
}

var userModel = function (params) {
    var id = generateId('user');

    return {
        id: id,
        _id: id,
        username: params.username,
        password: params.password,
        email: params.email
    }
}

function generateId (modelName) {
    return modelName + "-" + guid();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

  var dbCall = function (collectionName, performCommandOn) {
      db.collection(collectionName, function (err, collection) {
        if (err) { throw err; }

        performCommandOn(collection);
      });
    };

  var mongoInsertInto = function (collectionName, object, resolve) {
      dbCall(collectionName, function (collection) {

        collection.insert(object, function (err, inserted) {
          if (err) { throw err; }
          console.log('Succesfully inserted ' + inserted + ' into collection ' + collectionName);

          resolve(inserted);
        });

      });
    };

  var mongoFind = function (collectionName, query, resolve, method) {

    var methodToUse = method || 'find';
    dbCall(collectionName, function (collection) {
      collection[methodToUse](query, function (err, result) {
        if (err) { throw err; }
        if (result && result.each) {
          result.toArray(function (err, docs) {
            console.log('Fetch result: ' + JSON.stringify(docs) + ' for query ' + JSON.stringify(query) + ' on collection ' + collectionName);
            resolve(docs);
          });
        } else {
          console.log('Fetch result: ' + JSON.stringify(result) + ' for query ' + JSON.stringify(query) + ' on collection ' + collectionName);
          resolve(result);
        }
      });
    });
  };
  /*=============================================================
  | API
  |==============================================================*/
  app.post('/register', function (req, res) {

    var user = userModel(req.body);

    mongoInsertInto('users', body, function (inserted) {
      res.send({
        success : true
      });
    });
  });

  app.get('/users', function (req, res) {
    mongoFind('users', {}, function (users) { res.send(users); });
  });

  app.post('/login', function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    mongoFind('users', {'username': username, 'password': password}, function (user) {

      if (user) {
        var token = jwt.encode(user, "secret");
        tokenRegistry.addToken(token);
        res.status(200);
        res.send({
          username: user.username,
          token: token
        });
      } else {
        res.status(401);
        res.send({
          message: "Invalid username/password"
        });
      }
    }, 'findOne');

  });

  app.post('/say', function (req, res) {

    var say = sayModel(
        {
            username: req.body.username,
            text: req.body.text,
            location: req.location,
            posted: req.body.posted
        });

    mongoInsertInto('says', say, function () {
      res.status(200);
      res.send(say);
    });
  });

  app.get('/says/:id', function (req, res) {
    mongoFind('says', { 'id': req.params.id }, function (say) {
        res.send(say);
    }, 'findOne');
  });

  app.get('/says', function (req, res) {

    var queries = {
        'username': function (request) {
            return {
                username : request.param('username')
            }
        },
        'location' : function (request) {
            return {
                    'location' : {              
                        '$near': {
                            '$geometry': request.location, 
                            "$maxDistance" : request.param('distance') || 500 
                        }
                    }
                }
        }
    }

    var queryBy = req.param('queryBy');

    mongoFind('says', queries[queryBy](req), function (result) {
      res.send({says: result});
    });

  });
});

/*===============================================================================
|  SERVER CONFIG
\===============================================================================*/
app.configure(function () {
  app.use('/', express.static("/home/iznenad/dev/around.me/frontend/"));
  app.use(express.bodyParser());
  console.log('registering filters');
  app.use(filters.tokenAuth({ignorePaths: ['/login', '/register']}, tokenRegistry));
  app.use(filters.parseLocationHeaders());
  app.use(app.router);
});

var port = process.env.PORT || 8080;
console.log('Listening for connections on port', port);
app.listen(port);

