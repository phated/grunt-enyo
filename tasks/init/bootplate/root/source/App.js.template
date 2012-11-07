enyo.kind({
	name: "{%= name %}",
	fit: true,
	components:[
		{name: "hello", content: "Hello World", allowHtml: true, ontap: "helloWorldTap"}
	],
	helloWorldTap: function(inSender, inEvent) {
		this.$.hello.addContent("<br/><b>hello</b> control was tapped");
	}
});
