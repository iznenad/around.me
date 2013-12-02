var MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server;

exports.dbutils = function (dbConfig) {
	var mongoClient = new MongoClient(new Server(dbConfig.dbhost, dbConfig.dbport));

	var db;
	mongoClient.open(function(err, mongoClient) {
    	db = mongoClient.db(dbConfig.dbname);

    	console.log("Database connection established");
	});

	function commonCallbacks (res, errorStatusCode) {
		return {
			success : function (result) {
		
				res.send({
					success : true,
					result : result
				});
			},
			failure : function (error) {
			
				res.status(errorStatusCode);
				res.send({
					success : false,
					error : error
				});
			}
		}
	}

	return {
		commandCallbacks : function (commandName, req, res, callbackOverrides) {
			var config =  {
				'insert' : {
					success : commonCallbacks(res).success,
					failure : commonCallbacks(res, 501).failure
				},
				'remove' : {
					success : commonCallbacks(res).success,
					failure : commonCallbacks(res, 404).failure,
				},
				'update' : {
					success : commonCallbacks(res).success,
					failure : commonCallbacks(res, 404).failure,
				},
				'find' : {
					success : commonCallbacks(res).success,
					failure : commonCallbacks(res, 404).failure,
				},
				'findOne' : {
					success : commonCallbacks(res).success,
					failure : commonCallbacks(res, 501).failure
				}
			}

			if (callbackOverrides && callbackOverrides[commandName]) {
				return callbackOverrides[commandName];
			}
			return config[commandName];
		},

		execDbCommand : function (collectionName, commandName, inputData, success, failure) {
					
			db.collection(collectionName, function (err, collection) {
				if(err) {
					console.log('An error occured when trying to get collection with name: ' + collectionName);
					throw err;
				}

				collection[commandName](inputData, function (err, result) {
					if(err) {
						failure(err);
						return;
					}

					success(result);
				});
			});
		}
	};
};