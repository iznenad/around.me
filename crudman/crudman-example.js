var crudman = require('./crudman').crudman;

	var saySpec = {
			name : { 
				singular: 'say', 
				plural: 'says' 
			},
			spec : {
				id: 'string',
				text : 'string',
				username : 'string',
				posted : 'number',
				location : {
					type : 'object',
					source : 'location'
			}
		}
	}

crudman(saySpec, {
  		dbhost: 'localhost',
 		dbport: 27017,
  		dbname: 'around-me'
	}, 
function (expressApp, expressObject) {

	expressApp.configure(function () {
		expressApp.use(expressObject.bodyParser());
	});
},
function (expressApp, expressObject) {
	expressApp.listen(3000);
});