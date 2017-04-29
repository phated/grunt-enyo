enyo.kind({
	name: "JsonpTest",
	kind: enyo.TestSuite,
	_testJsonp(inProps, inParams, inAssertFn) {
		return new enyo.JsonpRequest(inProps)
			.response(this, function(inSender, inValue) {
				this.finish(inAssertFn.call(null, inValue) ? "" : "bad response: " + inValue);
			})
			.error(this, function(inSender, inValue) {
				this.finish("bad status: " + inValue);
				console.error(inValue);
			})
			.go(inParams);
	},
	_testResponse(inProps, inAssertFn) {
		this._testJsonp(enyo.mixin({url: "php/test1.php?format=jsonp", callbackName: "callback"}, inProps), 
			null, inAssertFn);
	},
	testJsonResponse() {
		this._testResponse({}, inValue => inValue.response == "hello");
	},
	testCharset() {
		this._testResponse({charset: "utf8"}, inValue => inValue.utf8 == "\u0412\u0438\u0301\u0445\u0440\u0438");
	}
});