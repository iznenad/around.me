App.Router.map(function() {

	this.route('say');
	this.route('says');
	this.route('isaid');
	this.route('login');
	this.route('register');
});

window.App.LoginRoute = Ember.Route.extend({
	setupController: function(controller, context) {
		controller.reset();
	}
});

window.App.IsaidRoute = Ember.Route.extend({
	model: function (){
		return $.ajax({
    	dataType: "json",
    	url: "http://localhost:8080/whatsup",

    	success: function(data, status, xhr){
    		console.log(data.says);
    		return data.says;
    	},
    	beforeSend: function(xhr){
   			xhr.setRequestHeader('latitude', 51.206579899999994);
			xhr.setRequestHeader('longitude', 6.7659199);
    	}
		}).then(function(data){
			return data.says;
		});
	}
});

window.App.SaysRoute = Ember.Route.extend({

  	model: function() {

  	var controller = this.controllerFor('says');
  
	return Ember.RSVP.Promise(function(resolve){
		
		navigator.geolocation.getCurrentPosition(function(position){
			resolve(position);
		});

	}).then(function(location){
		return App.RestApi.create().whatsup(location);
	});

  },

  setupController: function(controller, model){
  	controller.set('model', model.says);
  }
});

window.App.IndexRoute = Ember.Route.extend({
	beforeModel: function() {

    	this.transitionTo('says');
  	},

});
