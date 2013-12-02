var express = require('express');
var crudmanDButils = require('./crudman-dbutils').dbutils;

exports.crudman = function crudman (modelSpec, dbConfig, before, after, methodConfig) {

	var app = express();
	var dbUtils = crudmanDButils(dbConfig);
	before(app, express);

	var handler = function(spec, requestConfig, responseConfig) {

		var isPlural = requestConfig.isPlural;

		function handleAlternativeSource (req, key, alternativeSourceSpec) {
			if (!alternativeSourceSpec) throw 'You must define the alternative source specification for ' + key;

			var alternativeSourcesMapping = {
				header : function (req, propertyName) {
					req.get(propertyName);
				} 
			};

			var alternativeSourceTypeCoercers = {
				'undefined' : function (value) { return value },
				'string' : function (value) { return value },
				'number' : function (value) { return value * 1 },
				'boolean' : function (value) { return new Boolean(value) },
				'object' : function (value) {
					if (!value) {
						console.log('Value falsy. Returning value.');
						return value;
					}
					return JSON.parse(value) 
				}
			};

			var altSpec = alternativeSourceSpec.source.split(':');

			if (altSpec.length === 2){
				var sourceName = altSpec[0];
				var propertyNameOnSource = altSpec[1];

				var extractedValue = alternativeSourcesMapping[sourceName](req, propertyNameOnSource);

				return alternativeSourceTypeCoercers[alternativeSourceSpec.type](extractedValue);
			}

			if(altSpec.length === 1) {

				var extractedValue = req[altSpec[0]];

				return alternativeSourceTypeCoercers[alternativeSourceSpec.type](extractedValue);
			}
		};

		return function (req, res) {
			console.log('handling');

			console.log('Using configured source ' + requestConfig.source + ' as default');
			var source = req[requestConfig.source];

			console.log('Source on incoming request object ' + JSON.stringify(source));
			var parsedObject = {};

			for (var key in spec.spec) {
				console.log('Parsing object: Current key: ' + key + ' defined in spec as: ' + spec.spec[key]);
				if (typeof spec.spec[key] == 'string') {
					console.log(key + ' definition is a string, parse the value directly from source: ' + source[key]);
					parsedObject[key] = source[key];

					continue;
				}

				if (typeof spec.spec[key] == 'object') {
					parsedObject[key] = handleAlternativeSource(req, key, spec.spec[key]);
				}
			}

			var commandName = requestConfig.dbCommand;
			var dbCallbacks = dbUtils.commandCallbacks(commandName, req, res);

			dbUtils.execDbCommand(modelSpec.name.plural, commandName, parsedObject, dbCallbacks.success, dbCallbacks.failure);
		};
	}

	var nounForms = {

		singular : {
			'post' : handler(modelSpec, {
				source : 'body',
				dbCommand: 'insert'
			}),
			'get' :  handler(modelSpec, {
				source : 'params',
				dbCommand : 'findOne'
			}),
			'put' :  handler(modelSpec, {
				source : 'body',
				dbCommand : 'update'
			}),
			'delete' :  handler(modelSpec, {
				source : 'params',
				dbCommand : 'remove'
			})
		},

		plural: {
			'get' :  handler(modelSpec, {
				source : 'query',
				dbCommand : 'find',
				isPlural: true
			})
		}
	};

	for (var nounForm in nounForms) {
		console.log("Registering API endpoints for " + modelSpec.name[nounForm]);

		for(var method in nounForms[nounForm]) {
			console.log(method + ' for ' + nounForm);
			app[method]("/" + modelSpec.name[nounForm], nounForms[nounForm][method]);
		}
		
	}

	after(app, express);
}

exports.crudman.stop = function (expressApp) {
	expressApp.close();
}

