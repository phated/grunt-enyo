enyo.kind({
	name: "AjaxTest",
	kind: enyo.TestSuite,
	testAjax200() {
		new enyo.Ajax({url: "index.html", handleAs: "text"})
			.response(this, function(inSender, inValue){
				this.finish();
			})
			.error(this, function(inSender, inValue) {
				this.finish("bad status: " + inValue);
			})
			.go();
	},
	testAjax404() {
		new enyo.Ajax({url: "noexist.not"})
			.response(this, function(inSender, inValue){
				this.finish("ajax failed to fail");
			})
			.error(this, function(inSender, inValue) {
				this.finish();
			})
			.go();
	},
	testAjaxCustomError() {
		new enyo.Ajax({url: "appinfo.json"})
			.response((inSender, inValue) => {
				inSender.fail("cuz I said so");
			})
			.error(this, function(inSender, inValue) {
				this.finish();
			})
			.go();
	},
	testAjaxSerial() {
		// if the test finishes before ready, it's a failure
		var ready = false;
		//
		// when 'index' request completes, we are 'ready'
		var index = new enyo.Ajax({url: "index.html", handleAs: "text"});
		index.response(() => {
			ready = true;
		});
		//
		// request triggers 'index' request when it completes
		new enyo.Ajax({url: "index.html", handleAs: "text"})
			.response(index) 
			.response(this, function() {
				// finish clean if 'ready'
				this.finish(ready ? "" : "requests failed to complete in order");
			})
			.go();
	}
});