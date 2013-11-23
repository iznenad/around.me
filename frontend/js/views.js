window.App.TextField = Ember.ContainerView.extend({
    tagName: '',
    type: 'text',
    label: null,
    value: null,
    valueSize: '30px',

    childViews: ['labelView', 'inputView'],

    labelView: Ember.View.extend({
        tagName: 'label',
        attributeBindings: ['for'],

        forBinding: 'parentView.inputView.elementId',

        init: function () {
            this.set('defaultTemplate', Ember.Handlebars.compile(this.getPath('parentView.label')));
            this._super();
        }
    }),

    inputView: Ember.TextField.extend({
        typeBinding: 'parentView.type',
        sizeBinding: 'parentView.valueSize',
        valueBinding: 'parentView.value'
    })
});