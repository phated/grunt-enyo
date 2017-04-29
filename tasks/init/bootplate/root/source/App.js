enyo.kind({
	name: "App",
	fit: true,
	components:[
		{name: "hello", content: "Hello World", allowHtml: true, ontap: "helloWorldTap"}
	],
	helloWorldTap(inSender, inEvent) {
		this.$.hello.addContent("<br/><b>hello</b> control was tapped");
	}
});
