var jwt = reqire('jwt-simple')
var filters = require('./filters');
var express = require('express');
var app = express();

app.configure(function(){
  app.use('/', express.static("/home/iznenad/dev/around.me/frontend/"));

});

app.use(express.bodyParser());
app.use(filters.tokenAuth({ignorePaths: ['/login', '/register']}, {tokens: ["mockToken"]}));

app.post('/register', function(req, res){

	var body = req.body;

	db.collection('users', function(err, collection){
		if(err) throw err;

		console.log("Registered user: " + JSON.stringify(body));
		collection.insert(body);

		res.send({
			success: true
		});
	});
});

app.get('/users', function(req, res){
	res.send(users);
});

app.post('/login', function(req, res){

	var username = req.body["username"];
	var password = req.body["password"];

	if(users[username]!=undefined && users[username].password == password){
		res.status(200);
		res.send(users[username]);
		return;
	}

	res.status(401);
	res.send("Unauthorized");
});

app.post('/say', function(req, res){

	var say = req.body;

	if(!say.text === "" || !say.username || !say.location) {
		res.status(400);
		res.send({errors: "Say wrongly formated!"});
	}

	var latitude = say.location.coordinates[0]*1;
	var longitude = say.location.coordinates[1]*1;
	say.location.coordinates = [latitude, longitude];

	console.log(JSON.stringify(say));

	db.collection('says', function(err, collection){
		if(err) throw err;
		collection.insert(say, {safe : true}, function(err, result) { console.log('Inserted a new say ' + result)} );
	});

	res.status(200);
	res.send(say);
});

app.get('/whatsup', function(req, res){

	var username = req.param('username');
	var distance = req.get('maxdistance');
	var latitude = req.get('latitude') * 1;
	var longitude = req.get('longitude') * 1;

	db.collection('says', function(err, collection){
		var usernameQuery = {'username' : username};
		var query = username ? usernameQuery : {'location':{'$near': {'$geometry': {'type': "Point", coordinates : [longitude,latitude]}, "$maxDistance" : distance || 500 }}};

		collection.find(query).toArray(function(err, items){

			res.send({says: items});		
		});
	});

});

var port = process.env.PORT || 8080;
console.log('Listening for connections on port', port);
app.listen(port);


var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    db;

var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("around-me");
    console.log("Database connection established");
});

var says = {};

says.generateId = function(){
	return Object.keys(this).length + 1;
};

var locline = {};

var users = {};