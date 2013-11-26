window.App = Ember.Application.create({
});

window.App.ApplicationController = Ember.ArrayController.extend({

	needs: ['login'],
	location : localStorage.location,
	username: "iznenad",

	updateLocation: function(){
		var self = this;
		setInterval(function(){
			navigator.geolocation.getCurrentPosition(function(position){

				var geolocation = classes.Geolocation.create({
					longitude: position.coords.longitude,
					latitude: position.coords.latitude
				});

				localStorage.location = JSON.stringify(geolocation.toGeoJSONPoint());
				self.set('location', geolocation.toGeoJSONPoint());
			});
		}, 10000);
	}.on('init'),

	actions: {
		logout: function(){
			var loginController = this.get('controllers.login');

			loginController.set('token', null);
			this.set('username', undefined);
			console.log('Logging the user out');

			this.transitionToRoute('login');
		}
	}
});

window.App.UserController = App.ApplicationController.extend({
	
});

window.App.SaysController = App.ApplicationController.extend({
	actions: {
		clicked: function () {
			alert('Radi!');
		}
	}
});

window.App.SaysNewController = App.ApplicationController.extend({
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
				location: self.get('location'),
				posted: $.now()

			}).then(function(result){
				self.set('say', "");
			}, function(error){
				self.transitionToRoute('login');
			});
		}
	}
});

window.App.LoginController = Ember.Controller.extend({
	needs: ['application'],
	username: "",
	password: "",

	token: localStorage.token,

	tokenChanged: function(){

		var token = this.get('token');
		if(token == undefined || token == null){
			localStorage.removeItem('token');
			return;
		}

		localStorage.token = token;

	}.observes('token'),

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
					self.get('controllers.application').set('username', result.username);

					var attemptedTransition = self.get('attemptedTransition');
					if(attemptedTransition) {
						attemptedTransition.retry();
						self.set('attemptedTransition', undefined);
					} else{
						self.transitionToRoute('says');
					}
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
			type : "Point",
			coordinates: [this.longitude,this.latitude]
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