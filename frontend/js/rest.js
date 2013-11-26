window.App.RestApi = Ember.Object.extend({

    apiPath: "http://localhost:8080",

    says: function (id, query) {

        var path = this.apiPath + "/says"
        if(id){
            path += "/" + id;
        }

        var self = this;
        return $.ajax({
            type: "GET",
            dataType: "json",
            url: path,
            data: query,
            beforeSend: function(xhr){
                self.addLocationHeaders(xhr);
                self.addTokenHeader(xhr);
            }
        });
    },
    say: function (say) {
        var path = this.apiPath + "/say";
        console.log(JSON.stringify(say));
        var self = this;

        return $.ajax({
            type: "POST",
            dataType: "json",
            data: say,
            url: path,
            beforeSend: function(xhr){
                self.addTokenHeader(xhr);
                self.addLocationHeaders(xhr);
            }
        });
    },

    login: function (loginParams) {
        console.log("Logging the user: " + JSON.stringify(loginParams));

        var path = this.apiPath + "/login";
        return $.ajax({
            type: "POST",
            dataType: "json",
            data: loginParams,
            url: path
        });
    },

    register: function (registrationData) {
        console.log('Registering user: ' + JSON.stringify(registrationData));

        var path = this.apiPath + "/register";

        return $.ajax({
            type: "POST",
            dataType: "json",
            data: registrationData.get('data'),
            url: path
        });
    },

    addTokenHeader : function(xhr){
        xhr.setRequestHeader('auth-token', localStorage.token);
    },
    addLocationHeaders: function(xhr){
        xhr.setRequestHeader('location', localStorage.location);
    }
});