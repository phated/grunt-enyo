/**
	_enyo.FloatingLayer_ is a control that provides a layer for controls that
	should be displayed above an application. 
	The FloatingLayer singleton can be set as a control's parent to have the
	control float above an application, e.g.:

		create: function() {
			this.inherited(arguments);
			this.setParent(enyo.floatingLayer);
		}
	
	Note: It's not intended that users create instances of _enyo.FloatingLayer_.
*/
//* @protected
enyo.kind({
	name: "enyo.FloatingLayer",
	//* @protected
	create(...args) {
		this.inherited(args);
		this.setParent(null);
	},
	render(...args) {
		this.parentNode = document.body;
		return this.inherited(args);
	},
	generateInnerHtml() {
		return "";
	},
	beforeChildRender() {
		if (!this.hasNode()) {
			this.render();
		}
	},
	teardownChildren() {
	}
});

enyo.floatingLayer = new enyo.FloatingLayer();