/**
	_enyo.Signals_ components are used to listen to global messages.

	An object with a Signals component can listen to messages sent from anywhere
	by declaring handlers for them.

	DOM events that have no node targets are broadcast as signals. These events
	include Window events, like _onload_ and _onbeforeunload_, and events that
	occur directly on _document_, like _onkeypress_ if _document_ has the focus.

	For more information, see the
	<a href="https://github.com/enyojs/enyo/wiki/Signals">Signals documentation</a>
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Signals",
	kind: enyo.Component,
	//* @protected
	create(...args) {
		this.inherited(args);
		enyo.Signals.addListener(this);
	},
	destroy(...args) {
		enyo.Signals.removeListener(this);
		this.inherited(args);
	},
	notify(inMsg, inPayload) {
		this.dispatchEvent(inMsg, inPayload);
	},
	statics: {
		listeners: [],
		addListener(inListener) {
			this.listeners.push(inListener);
		},
		removeListener(inListener) {
			enyo.remove(inListener, this.listeners);
		},
		send(inMsg, inPayload) {
			enyo.forEach(this.listeners, l => {
				l.notify(inMsg, inPayload);
			});
		}
	}
});
