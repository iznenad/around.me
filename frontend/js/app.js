window.App = Ember.Application.create();

window.App.GeoController = Ember.ArrayController.extend({
	setup: function(){
		self = this;

		navigator.geolocation.getCurrentPosition(function(position){

			console.log(position);
			console.log(position.coords.longitude);
			console.log(position.coords.latitude);
			self.set('location', App.Geolocation.create({
				longitude : position.coords.longitude, 
				latitude: position.coords.latitude
			}));
		});

	}.on('init')	
});

window.App.SaysController = App.GeoController.extend({

});

window.App.SayController = App.GeoController.extend({
	say: "",
	actions:{
		submitSay:function(){

			this.set('errorMessage', undefined);

			if(this.get('say') === "") { 
				this.set('errorMessage', 'Please type something!');
				return;
			}

			var self = this;
			App.RestApi.create().say({
				text: self.say,
				username: 'iznenad',
				location: self.get('location').toGeoJSONPoint()

			}).then(function(result){
				self.set('say', "");
			}, function(error){
				self.transitionToRoute('login');
			});
		}
	}
});

window.App.LoginController = Ember.Controller.extend({
	username: "",
	password: "",
	reset: function (){
		this.setProperties({
			username: "",
			password: "",
			errorMessage: ""
		});
	},
	actions: {
		login: function(){

			var self = this;
			App.RestApi.create().login({
				username: self.get('username'),
				password: self.get('password')
			}).then(
				function(result){
					self.set('token', result.token);
					localStorage.token = result.token;
				}, 
				function(error){
					self.set('errorMessage', "Wrong username/password combination");
				}
			);
		}
	}
});

window.App.RegisterController = Ember.Controller.extend({

	actions:{
		register: function(){
			var data = this.getProperties('username', 'email', 'password', 'repeatPassword');

			var registrationData = classes.RegistrationData.create(data);

			if(!registrationData.get('validate').valid){
				this.set('errorMessage', JSON.stringify(registrationData.get('validate').errors))
				return;
			}

			var self = this;
			App.RestApi.create().register(registrationData).then(
					function(result) {
						self.set('errorMessage', undefined);

						self.transitionToRoute('login');
					},
					function(error) {
						self.set('errorMessage', error.responseText.message);
					}
				);
		}
	}

});


var classes = window.App.Classes = {};

classes.Geolocation = Ember.Object.extend({
	longitude: 0,
	latitude: 0,
	toGeoJSONPoint: function(){

		return {
			"type" : "Point",
			"coordinates": [this.longitude,this.latitude]
		}
	}
});

classes.RegistrationData = Ember.Object.extend({

	username: undefined,
	email: undefined,
	password: undefined,
	repeatPassword: undefined,

	validate: function(){
		var errors = {};
		var validationResult = function(valid, errors){
			return {
				valid: valid,
				errors: errors
			};
		}

		if(!this.username || this.username === "") {
			errors.username = "Please specify a valid username";

			return validationResult(false, errors);
		}

		if(!this.email || this.email === "") {
			errors.email = "Please specify a valid email";

			return validationResult(false, errors);
		}

		if(!this.password || this.password === "") {
			errors.password = "Please specify a valid password";

			return validationResult(false, errors);
		} 

		if(this.password !== this.repeatPassword){
			errors.repeatPassword = "Passwords must match!";

			return validationResult(false, errors);
		}

		return validationResult(true);

	}.property('validate'),

	data: function(){
		return {
			username: this.get('username'),
			email: this.get('email'),
			password: this.get('password')
		}
	}.property('data')

});