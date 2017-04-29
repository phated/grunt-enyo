enyo.kind({
	name: "AjaxTest",
	kind: enyo.TestSuite,
	timeout: 10000,
	_testAjax(inProps, inParams, inAssertFn) {
		return new enyo.Ajax(inProps)
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
		this._testAjax(enyo.mixin({url: "php/test1.php?format=" + inProps.handleAs}, inProps), null, inAssertFn);
	},
	testJsonResponse() {
		this._testResponse({handleAs: "json"}, inValue => inValue.response == "hello");
	},
	testTextResponse() {
		this._testResponse({handleAs: "text"}, inValue => inValue == "hello");
	},
	testXmlResponse() {
		this._testResponse({handleAs: "xml"}, inValue => {
			var r = inValue.getElementsByTagName("response")[0].childNodes[0].nodeValue;
			return r == "hello";
		});
	},
	testSyncTextResponse() {
		this._testResponse({handleAs: "text", sync: true}, inValue => inValue == "hello");
	},
	testPostRequest() {
		this._testAjax({url: "php/test2.php", method: "POST"}, {query: "enyo"}, inValue => inValue.response == "enyo");
	},
	testPutRequest() {
		this._testAjax({url: "php/test2.php", method: "PUT"}, null, inValue => inValue.status == "put");
	},
	testDeleteRequest() {
		this._testAjax({url: "php/test2.php", method: "DELETE"}, null, inValue => inValue.status == "delete");
	},
	testHeader() {
		this._testAjax({url: "php/test2.php", method: "POST", headers: {"X-Requested-With": "XMLHttpRequest"}}, {query: "enyo"}, inValue => inValue.isAjax);
	},
	testPostBody() {
		this._testAjax({url: "php/test2.php", method: "POST", postBody: "This is a test."}, null, inValue => inValue.response == "This is a test.");
	},
	testContentType() {
		var contentType = "text/plain";
		this._testAjax({url: "php/test2.php", method: "PUT", contentType}, null, inValue => inValue.ctype == contentType);
	},
	testXhrStatus() {
		var ajax = this._testAjax({url: "php/test2.php"}, null, inValue => ajax.xhr.status == 200);
	},
	testXhrFields() {
		var ajax = this._testAjax({url: "php/test2.php", xhrFields: {withCredentials: true}}, null, inValue => ajax.xhr.withCredentials);
	},
	// test CORS (Cross-Origin Resource Sharing) by testing against youtube api
	testCORS() {
		this._testAjax({url: "http://query.yahooapis.com/v1/public/yql/jonathan/weather/"}, {q:'select * from weather.forecast where location=94025', format: "json"}, inValue => inValue && inValue.query && inValue.query.results && inValue.query.count > 0);
	},
	// test CORS failure
	testCORSFailure() {
		new enyo.Ajax({url: "https://dev.virtualearth.net/REST/v1/Locations/47.64054,-122.12934"})
			.response(this, function(inSender, inValue) {
				this.finish("CORS failure flagged as success");
			})
			.error(this, function(inSender, inValue) {
				this.finish("");
			})
			.go();
	},
	// server is set to respond after 3 seconds, so make sure timeout fires first
	testAjaxTimeout() {
		new enyo.Ajax({url: "php/test3.php", timeout: 500})
			.response(this, function(inSender, inValue) {
				this.finish("did not timeout");
			})
			.error(this, function(inSender, inValue) {
				enyo.job("timeouttest", enyo.bind(this, function() {this.finish("");}), 4000);
			})
			.go();
	}
});