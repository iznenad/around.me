window.App.SayView = Ember.ContainerView.extend({
    elementName: "div",
    classNames: ['panel', 'panel-default'],
    init: function () {
        this._super();
        this.pushObject(Ember.View.extend({
            tagName: 'div',
            classNames: ['panel-heading'],
            template: Ember.Handlebars.compile("{{model.text}}")
        }).create());

        this.pushObject(App.MapView.create());
    }
});

window.App.MapView = Ember.View.extend({
    tagName: 'div',
    classNames: ['panel-body'],
    template: Ember.Handlebars.compile('<div id=\"map-canvas\" class="google-map-canvas"></div>'),

    model: function () {
        var controller = this.get('controller');
        return controller.get('model');
    }.property('controller.model'),

    location: function () {
        var model = this.get('model');
        return new google.maps.LatLng(model.location.coordinates[1], model.location.coordinates[0]);
    }.property('model'),

    didInsertElement: function() {
        console.log('okinut did insert');

        var mapOptions = {
          center: this.get('location'),
          zoom: 15
        };


        var map = new google.maps.Map($('#map-canvas')[0], mapOptions);
        this.set('map', map);
        this.modelChanged();
    },

    modelChanged: function () {
        console.log('okinut model changed');
        var oldMarker = this.get('marker');
        if(oldMarker) {
            oldMarker.setMap(null);
            this.set('marker', null);
        }
        
        var map = this.get('map');
        var marker = new google.maps.Marker({
            position: this.get('location'),
            map: map,
            title: this.get('model').text
        });
        map.panTo(marker.getPosition())
        this.set('marker', marker);
      }.observes('model')
});

Ember.Handlebars.helper('by', function (username) {
    return "by " + username;
})

Ember.Handlebars.helper('nice-time', function (timeInMilis) {

    if(!timeInMilis) return "No idea when";

    var now = $.now();

    var seconds = (now - timeInMilis) / 1000;

    if (seconds < 60) {
        return "Less a minute ago";
    }

    if (seconds < 300) {
        return "Less then 5 minutes ago";
    }

    var minutes = seconds / 60;

    if(minutes < 60){
        return Math.round(minutes) + " minutes ago";
    }
    var hours = Math.round(minutes / 60);

    return "Around " + hours + " hour ago";
});
/*window.App.SaysView = Ember.View.extend({

});*/