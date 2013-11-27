window.App.Router.map(function () {

    
    this.resource('says', function () {
        this.resource('say', { path: '/:say_id' });
        this.resource('says.user', { path: '/:username' });
        this.resource('says.new', { path: '/new' });
    });
    this.route('map');
    this.route('login');
    this.route('register');

    this.resource('users', function () {
        this.resource('user', { path: '/:username' });
    });
});

window.App.NeedsAuthentication = Ember.Route.extend({
    beforeModel: function(controller, transition){

        console.log('Checking authentication token: ' + JSON.stringify(localStorage.token));
        
        if(!localStorage.token){
            this.redirectToLogin(transition);
        }
    },
    redirectToLogin: function(transition){
        var loginController = this.controllerFor('login');

        loginController.set('attemptedTransition', transition);
        this.transitionTo('login');
    },
    actions:{
        error: function(reason, transition){
            if(reason.status == 401){
                this.redirectToLogin(transition);
            } else {
                consle.log(JSON.stringify(reason));         
            }
        }
    }

});

window.App.UserRoute = window.App.NeedsAuthentication.extend({
    model: function (params) {
        return params.username;
    },
    serialize: function (username) {
        return {username: username};
    }
});

window.App.ApplicationRoute = Ember.Route.extend({
    beforeModel: function(controller, transition){

        var self = this;
        return Ember.RSVP.Promise(function(resolve){
            
            navigator.geolocation.getCurrentPosition(function(position){
                resolve(position);
            });

        }).then(function(location){
            var appController = self.controllerFor('application');

            appController.set('location', location);
        });
    }
});

window.App.LoginRoute = Ember.Route.extend({
    setupController: function(controller, context) {
        controller.reset();
    }
});

window.App.SaysUserRoute = window.App.NeedsAuthentication.extend({
    model: function (){
        var appController = this.controllerFor('application');

        return window.App.RestApi.create().says(null, { queryBy: 'username', username: appController.get('username') });
    },
    setupController: function(controller, model){
        controller.set('model', model.says);
    }
});

window.App.SaysRoute = window.App.NeedsAuthentication.extend({

    model: function() {  
        return App.RestApi.create().says(null, {queryBy: 'location'});
    },

    setupController: function(controller, model){
        controller.set('model', model.says);
    }
});

window.App.SayRoute = window.App.NeedsAuthentication.extend({
    model: function (params) {
            return App.RestApi.create().says(params.say_id);
        },
    setupController: function (controller, model) {
        controller.set('model', model);
    }
});

window.App.IndexRoute = Ember.Route.extend({
    beforeModel: function() {

        this.transitionTo('says');
    },

});

