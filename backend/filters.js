module.exports.tokenAuth = function tokenAuth(ignorePaths, tokenRegistry){

	return function(req, res, next) {
		
		for(var index = 0; index < ignorePaths.ignorePaths.length; index++){

			console.log(req.path + ":" + ignorePaths.ignorePaths[index]);
			if(req.path === ignorePaths.ignorePaths[index]) {
				console.log('Token not needed for path: ' + req.path);
				next();
				return;
			}
		}

		console.log('token from header: ' + req.get('auth-token'));

		if(tokenRegistry.checkToken(req.get('auth-token'))){
			next();
			return;
		}

		console.log("Token not found");
		res.status(401);
		res.send({
			success: false,
			message: "Invalid token"
		});	
	};

}

module.exports.parseLocationHeaders = function(){

	return function(req, res, next){
		var location = req.get('location');
		
		if(location){
			console.log(location);

			//very bad but i'm playing around
			var locationObj = JSON.parse(location);

			req.location = {
				type : "Point",
				coordinates : locationObj.coordinates
			};
		}

		next();
	}

}