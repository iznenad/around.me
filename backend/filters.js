module.exports.tokenAuth = function tokenAuth(ignorePaths, tokenRegistry){

	return function(req, res, next) {
		
		ignorePaths.ignorePaths.forEach(function(path){
			if(req.path === path) {
				console.log('Token not needed for path: ' + req.path);
				next();
				return;
			}
		});

		var body = req.body;
		tokenRegistry.tokens.forEach(function(token){
			if(token === body.token) {
				next();
				return;
			}
		}); 

		res.status(401);
		res.send({
			success: false,
			message: "Invalid token"
		});	
	};

}