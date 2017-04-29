/**
	Implements an HTML &lt;input&gt; element with cross-platform support for
	change events.

	You can listen for _oninput_ and _onchange_ DOM events from this control
	to know when the text inside has been modified. _oninput_ fires immediately
	while _onchange_ fires when the text has changed and the input loses focus.
*/
enyo.kind({
	name: "enyo.Input",
	published: {
		/**
			Value of the input.  Use this property only to initialize the value.
			Use _getValue()_ and _setValue()_ to manipulate the value at runtime.
		*/
		value: "",
		//* Text to display when the input is empty
		placeholder: "",
		/**
			Type of input, if not specified, it's treated as "text".  It can
			be anything specified for the _type_ attribute in the HTML
			specification, including "url", "email", "search", or "number".
		*/
		type: "",
		/**
			When true, prevent input into the control. This maps to the 
			_disabled_ DOM attribute.
		*/
		disabled: false
	},
	events: {
		//* Sent when the input is disabled or enabled.
		onDisabledChange: ""
	},
	//* Set to true to focus this control when it is rendered.
	defaultFocus: false,
	//* @protected
	tag: "input",
	classes: "enyo-input",
	attributes: {
		onfocus: enyo.bubbler,
		onblur: enyo.bubbler
	},
	handlers: {
		oninput: "input",
		onclear: "clear",
		ondragstart: "dragstart"
	},
	create(...args) {
		if (enyo.platform.ie) {
			this.handlers.onkeyup = "iekeyup";
		}
		this.inherited(args);
		this.placeholderChanged();
		// prevent overriding a custom attribute with null
		if (this.type) {
			this.typeChanged();
		}
		this.valueChanged();
	},
	rendered(...args) {
		this.inherited(args);
		this.disabledChanged();
		if (this.defaultFocus) {
			this.focus();
		}
	},
	typeChanged() {
		this.setAttribute("type", this.type);
	},
	placeholderChanged() {
		this.setAttribute("placeholder", this.placeholder);
	},
	disabledChanged() {
		this.setAttribute("disabled", this.disabled);
		this.bubble("onDisabledChange");
	},
	getValue() {
		return this.getNodeProperty("value", this.value);
	},
	valueChanged() {
		this.setAttribute("value", this.value);
		this.setNodeProperty("value", this.value);
	},
	iekeyup(inSender, inEvent) {
        var ie = enyo.platform.ie;
        var kc = inEvent.keyCode;
        // input event missing on ie 8, fails to fire on backspace and delete keys in ie 9
        if (ie <= 8 || (ie == 9 && (kc == 8 || kc == 46))) {
			this.bubble("oninput", inEvent);
		}
    },
	clear() {
		this.setValue("");
	},
	focus() {
		if (this.hasNode()) {
			this.node.focus();
		}
	},
	// note: we disallow dragging of an input to allow text selection on all platforms
	dragstart() {
		return true;
	}
});
