enyo.kind({
	name: "WebServiceTest",
	kind: enyo.TestSuite,
	_testWebService(inProps, inParams, inAssertFn) {
		var ws = this.createComponent({kind: enyo.WebService, onResponse: "_response", onError: "_error", assertFn: inAssertFn}, inProps);
		return ws.send(inParams);
	},
	_response(inSender, inValue) {
		this.finish(inSender.assertFn(inValue.data) ? "" : "bad response: " + inValue.data);
	},
	_error(inSender, inValue) {
		this.finish("bad status: " + inValue.data);
	},
	_testResponse(inProps, inAssertFn) {
		this._testWebService(enyo.mixin({url: "php/test1.php?format=" + (inProps.format || inProps.handleAs)}, inProps), null, inAssertFn);
	},
	testJsonResponse() {
		this._testResponse({handleAs: "json"}, 
			inValue => inValue.response == "hello"
		);
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
	testPostRequest() {
		this._testWebService({url: "php/test2.php", method: "POST"}, {query: "enyo"}, inValue => inValue.response == "enyo");
	},
	testPutRequest() {
		this._testWebService({url: "php/test2.php", method: "PUT"}, null, inValue => inValue.status == "put");
	},
	testDeleteRequest() {
		this._testWebService({url: "php/test2.php", method: "DELETE"}, null, inValue => inValue.status == "delete");
	},
	testHeader() {
		this._testWebService({url: "php/test2.php", method: "POST", headers: {"X-Requested-With": "XMLHttpRequest"}}, {query: "enyo"}, inValue => inValue.isAjax);
	},
	testPostBody() {
		this._testWebService({url: "php/test2.php", method: "POST", postBody: "This is a test."}, null, inValue => inValue.response == "This is a test.");
	},
	testContentType() {
		var contentType = "text/plain"
		this._testWebService({url: "php/test2.php", method: "PUT", contentType}, null, inValue => inValue.ctype == contentType);
	},
	testXhrStatus() {
		var ajax = this._testWebService({url: "php/test2.php"}, null, inValue => ajax.xhr.status == 200);
	},
	testXhrFields() {
		var ajax = this._testWebService({url: "php/test2.php", xhrFields: {withCredentials: true}}, null, inValue => ajax.xhr.withCredentials);
	},
	// test CORS (Cross-Origin Resource Sharing) by testing against youtube api
	testCORS() {
		this._testWebService({url: "http://query.yahooapis.com/v1/public/yql/jonathan/weather/"}, {q: 'select * from weather.forecast where location=94025', format: "json"}, inValue => {console.log(inValue)
			return inValue && inValue.query && inValue.query.results && inValue.query.count > 0;
		});
	},
	testJsonp() {
		this._testResponse({jsonp: true, format: "jsonp"}, inValue => inValue.response == "hello");
	}/*,
	testCharset: function() {
		this._testResponse({charset: "utf8"}, function(inValue) {
			return inValue.utf8 == "\u0412\u0438\u0301\u0445\u0440\u0438";
		});
	}
	*/
});