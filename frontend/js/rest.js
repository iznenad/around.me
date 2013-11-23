window.App.RestApi = Ember.Object.extend({

    apiPath: "http://localhost:8080",

	whatsup:function(location){
        var self = this;
        var path = this.apiPath + "/whatsup";
		return $.ajax({
    		dataType: "json",
    		url: path,

    		success: function(data, status, xhr){
    			return data.says;
    		},
    		beforeSend: function(xhr){
   				self.addLocationHeaders(xhr, location);
    		}
		});
	},

    say: function(say) {
        var path = this.apiPath + "/say";
        console.log(JSON.stringify(say));
        return $.ajax({
            type: "POST",
            dataType: "json",
            data: say,
            url: path
        });
    },

    login: function(loginParams){
        console.log("Logging the user: " + JSON.stringify(loginParams));

        var path = this.apiPath + "/login";
        return $.ajax({
            type: "POST",
            dataType: "json",
            data: loginParams,
            url: path
        });
    },

    register: function(registrationData) {
        console.log('Registering user: ' + JSON.stringify(registrationData));

        var path = this.apiPath + "/register";

        return $.ajax({
            type: "POST",
            dataType: "json",
            data: registrationData.get('data'),
            url: path
        });
    },

    addLocationHeaders: function(xhr, location){
        xhr.setRequestHeader('latitude', location.coords.latitude);
        xhr.setRequestHeader('longitude', location.coords.longitude);
    }
});