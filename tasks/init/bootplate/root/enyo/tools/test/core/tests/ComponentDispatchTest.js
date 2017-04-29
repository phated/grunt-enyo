enyo.kind({
	name: "ComponentDispatchTest",
	kind: enyo.TestSuite,
	testDispatchEvent2NullArgs() {
		var test = this;
		var c = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok(inSender, inEvent) {
				test.finish((inSender != c && "bad inSender") || (arguments.length !== 2 && "bad arguments"));
			}
		});
		c.dispatchEvent("onOk");
	},
	testDispatchEvent2OneArg() {
		var test = this;
		var c = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok(inSender, inEvent) {
				test.finish((inSender != c && "bad inSender") || (inEvent.value !== 42 && "bad inValue"));
			}
		});
		c.dispatchEvent("onOk", {value: 42});
	},
	testDispatchEvent2Owner() {
		var test = this;
		var c = new enyo.Component({
			components: [{
				name: "child",
				onOk: "ok"
			}],
			ok(inSender, inEvent) {
				test.finish((inSender != this.$.child && "bad inSender") || (inEvent.value !== 42 && "bad inValue"));
			}
		});
		c.$.child.dispatchEvent("onOk", {value: 42});
	},
	testBubble() {
		var test = this;
		var c = new enyo.Component({
			components: [{
				name: "child"
			}],
			handlers: {
				onOk: "ok"
			},
			ok(inSender, inEvent) {
				test.finish((inSender != c.$.child && "bad inSender") || (inEvent.value !== 42 && "bad inValue"));
			}
		});
		c.$.child.bubble("onOk", {value: 42});
	},
	testDoubleBubble() {
		var test = this;
		var owner = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok(inSender, inEvent) {
				test.finish((inSender != child && "bad inSender") || (inEvent.value !== 42 && "bad inValue"));
			}
		});
		var child = new enyo.Component({
			owner
		});
		var grandchild = new enyo.Component({
			owner: child
		});
		grandchild.bubble("onOk", {value: 42});
	}
});