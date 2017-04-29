/**
	A popup is used to display certain content on top of other content.

	Popups are initially hidden on creation; they can be shown by calling the
	_show_ method and re-hidden by calling _hide_.  Popups may be centered using
	the	_centered_ property; if not centered, they should be given a specific
	position.

	A popup may be optionally floated above all application content by setting
	its _floating_ property to true.  This has the advantage of guaranteeing
	that the popup will be displayed on top of other content.  This usage is
	appropriate when the popup does not need to scroll with other content.

	The _autoDismiss_ property controls how a popup may be dismissed.  If true
	(the default), then tapping outside the popup or pressing the ESC key will
	dismiss the popup.

	The _modal_ property may be set to true to prevent any controls outside the
	popup from responding to events while the popup is showing:

		{kind: "enyo.Popup", centered: true, modal: true, floating: true, components: [
			{content: "Here's some information..."}
		]}
 */
enyo.kind({
	name: "enyo.Popup",
	classes: "enyo-popup",
	published: {
		//* Set to true to prevent controls outside the popup from receiving
		//* events while the popup is showing.
		modal: false,
		//* By default, the popup will hide when the user taps outside it or
		//* presses ESC.  Set to false to prevent this behavior.
		autoDismiss: true,
		//* Set to true to render the popup in a floating layer outside of other
		//* controls.  This can be used to guarantee that the popup will be
		//* shown on top of other controls.
		floating: false,
		//* Set to true to automatically center the popup in the middle of the viewport.
		centered: false
	},
	//* @protected
	showing: false,
	handlers: {
		ondown: "down",
		onkeydown: "keydown",
		onfocus: "focus",
		onblur: "blur",
		onRequestShow: "requestShow",
		onRequestHide: "requestHide"
	},
	captureEvents: true,
	//* @public
	events: {
		//* Event that fires after the popup is shown
		onShow: "",
		//* Event that fires after the popup is hidden
		onHide: ""
	},
	//* @protected
	tools: [
		{kind: "Signals", onKeydown: "keydown"}
	],
	create(...args) {
		this.inherited(args);
		/*if (this.floating) {
			this.setParent(enyo.floatingLayer);
		}*/
		this.canGenerate = !this.floating;
	},
	render(...args) {
		if (this.floating) {
			if (!enyo.floatingLayer.hasNode()) {
				enyo.floatingLayer.render();
			}
			this.parentNode = enyo.floatingLayer.hasNode();
		}
		this.inherited(args);
	},
	destroy(...args) {
		if (this.showing) {
			this.release();
		}
		this.inherited(args);
	},

	reflow(...args) {
		this.updatePosition();
		this.inherited(args);
	},
	calcViewportSize() {
		if (window.innerWidth) {
			return {
				width: window.innerWidth,
				height: window.innerHeight
			};
		} else {
			var e = document.documentElement;
			return {
				width: e.offsetWidth,
				height: e.offsetHeight
			};
		}
	},
	updatePosition() {
		if( this.centered ) {
			var d = this.calcViewportSize();
			var b = this.getBounds();

			this.addStyles( "top: " + Math.max( ( ( d.height - b.height ) / 2 ), 0 ) + "px; left: " + Math.max( ( ( d.width - b.width ) / 2 ), 0 ) + "px;" );
		}
	},
	showingChanged(...args) {
		// auto render when shown.
		if (this.floating && this.showing && !this.hasNode()) {
			this.render();
		}
		// hide while sizing
		if (this.centered) {
			this.applyStyle("visibility", "hidden");
		}
		this.inherited(args);
		if (this.showing) {
			this.resized();
			if (this.captureEvents) {
				this.capture();
			}
		} else {
			if (this.captureEvents) {
				this.release();
			}
		}
		// show after sizing
		if (this.centered) {
			this.applyStyle("visibility", null);
		}
		// events desired due to programmatic show/hide
		if (this.hasNode()) {
			this[this.showing ? "doShow" : "doHide"]();
		}
	},
	capture() {
		enyo.dispatcher.capture(this, !this.modal);
	},
	release() {
		enyo.dispatcher.release();
	},
	down(inSender, inEvent) {
		// prevent focus from shifting outside the popup when modal.
		if (this.modal && !inEvent.dispatchTarget.isDescendantOf(this)) {
			inEvent.preventDefault();
		}
	},
	tap(inSender, inEvent) {
		// dismiss on tap if property is set and click was outside the popup
		if (this.autoDismiss && (!inEvent.dispatchTarget.isDescendantOf(this))) {
			this.hide();
			return true;
		}
	},
	keydown(inSender, inEvent) {
		if (this.showing && this.autoDismiss && inEvent.keyCode == 27 /* escape */) {
			this.hide();
		}
	},
	// If something inside the popup blurred, keep track of it
	blur(inSender, inEvent) {
		if (inEvent.dispatchTarget.isDescendantOf(this)) {
			this.lastFocus = inEvent.originator;
		}
	},
	// When something outside the popup focuses (e.g., due to tab key), focus our last focused control.
	focus(inSender, inEvent) {
		var dt = inEvent.dispatchTarget;
		if (this.modal && !dt.isDescendantOf(this)) {
			if (dt.hasNode()) {
				dt.node.blur();
			}
			var n = (this.lastFocus && this.lastFocus.hasNode()) || this.hasNode();
			if (n) {
				n.focus();
			}
		}
	},
	requestShow(inSender, inEvent) {
		this.show();
		return true;
	},
	requestHide(inSender, inEvent) {
		this.hide();
		return true;
	}
});
