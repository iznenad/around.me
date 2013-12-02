var should = require('should');
var request = require('request');

var crudman = require('../crudman').crudman;
var port = 3000;
describe('crudman', function () {

	var app;

	var testCase = {
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
					source : 'header:location'
				}
			}
		}

	before(function (done) {

		console.log(typeof crudman);

		crudman(testCase, {}, function (expressApp) {
			app = expressApp;

			expressApp.listen(port, function(err, result) {
				if(err) {
					done(err);
				} else {
					done();
				}
			});
		});
	});

	after(function (spec) {
		crudman.stop(app);
	});


	it('should exist', function (done) {
		should.exist(app);
		done();
	});

	it('should handle POST', function (done) {
		var options = defaultOptions("POST", "/" + testCase.name);

		request(options, function (error, res, body) {

			console.log(error);
			console.log(res);
			console.log(body);
			res.success.should.eql(true);
			done();	
		});
		
	});
	it('should handle GET', function (done) {
		done();
	});
	it('should handle PUT', function (done) {
		done();
	});
	it('should handle DELETE', function (done) {
		done();
	});
});

function defaultOptions(path, method, headers) {
  var options = {
    "uri": "http://localhost:" + port + "/" + path,
    "method": method,
    "headers" : headers
  };

  return options;
}