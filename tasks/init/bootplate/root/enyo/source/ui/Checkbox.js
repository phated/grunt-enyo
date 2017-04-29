/**
	_enyo.Checkbox_ implements an HTML checkbox input, with support for grouping.
*/
enyo.kind({
	name: "enyo.Checkbox",
	kind: enyo.Input,
	classes: "enyo-checkbox",
	events: {
		//* Fires when checkbox is tapped.
		onActivate: ""
	},
	published: {
		//* Value of checkbox; true if checked 
		checked: false,
		//* Group API requirement for determining selected item
		active: false,
		//* @protected
		type: "checkbox"
	},
	//* @protected
	// disable classes inherited from enyo.Input
	kindClasses: "",
	handlers: {
		onchange: "change",
		onclick: "click"
	},
	create(...args) {
		this.inherited(args);
	},
	rendered(...args) {
		this.inherited(args);
		if (this.active) {
			this.activeChanged();
		}
		this.checkedChanged();
	},
	// instance 'checked' property is linked to DOM 'checked' property
	getChecked() {
		return Boolean(this.getNodeProperty("checked", this.checked));
	},
	checkedChanged() {
		this.setNodeProperty("checked", this.checked);
		this.setAttribute("checked", this.checked ? "checked" : "");
		this.setActive(this.checked);
	},
	// active property, and onActivate event, are part of "GroupItem" interface
	// that we support in this object
	activeChanged() {
		this.active = Boolean(this.active);
		this.setChecked(this.active);
		this.bubble("onActivate");
	},
	// all input type controls support 'value' property
	setValue(inValue) {
		this.setChecked(Boolean(inValue));
	},
	getValue() {
		return this.getChecked();
	},
	valueChanged() {
		// inherited behavior is to set "value" attribute and node-property
		// which does not apply to checkbox (uses "checked") so 
		// we squelch the inherited method
	},
	change() {
		this.setActive(this.getChecked());
	},
	click(inSender, inEvent) {
		// Various versions of IE (notably IE8) do not fire 'onchange' for 
		// checkboxes, so we discern change via 'click'.
		// Note: keyboard interaction (e.g. pressing space when focused) fires
		// a click event.
		if (enyo.platform.ie <= 8) {
			this.bubble("onchange", inEvent);
		}
	}
});
