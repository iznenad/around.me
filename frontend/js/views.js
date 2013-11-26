window.App.MapView = Ember.View.extend({
    tagName: 'div',
    attributeBindings: ['id'],
    id: 'map-canvas',
    template: Ember.Handlebars.compile('<div id=\'map-canvas\'>I am the template</div>')
});

Ember.Handlebars.helper('by', function (username) {
    return "by " + username;
})

Ember.Handlebars.helper('nice-time', function (timeInMilis) {

    if(!timeInMilis) return "No idea when";

    var now = $.now();
    console.log(now + ":" + timeInMilis);
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
    console.log(minutes);
    var hours = Math.round(minutes / 60);

    return "Around " + hours + " hour ago";
});
/*window.App.SaysView = Ember.View.extend({

});*/