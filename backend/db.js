module.exports.db = function(Server, MongoClient, configuration, after) {
	
	var db;

    var dbhost = configuration.dbhost || 'localhost';
    var dbport = configuration.dbport || 27017;
    var dbname = configuration.dbname

    var mongoClient = new MongoClient(new Server(dbhost, dbport));

	mongoClient.open(function(err, mongoClient) {
    	db = mongoClient.db(dbname);

    	console.log("Database connection established");

    	after(db);
	});

}