module.exports.getInstance = function(configuration){

	this.tokenRegistryTokens = {tokens : []};

	var db = configuration.db || this.tokenRegistryTokens;
	var collectionName = configuration.collectionName || "tokens";

	var timeToLive = configuration.ttl || "infinite";

	return {
		checkToken: function(tokenToCheck){

			console.log(tokenToCheck);
			console.log(JSON.stringify(db));

			for(var index = 0; index < db.tokens.length; index++){
				console.log("Checking token : " + tokenToCheck + ":" + db.tokens[index] === tokenToCheck);
				if(db.tokens[index] === tokenToCheck){
					return true;
				}
			}
			return false;
		},

		addToken: function(tokenToAdd){
			console.log('Adding token: ' + tokenToAdd);

			if(!tokenToAdd) {
				console.log('Won\'t add empty token.');	
				return;
			}
			db.tokens.push(tokenToAdd);
		}
	}
}