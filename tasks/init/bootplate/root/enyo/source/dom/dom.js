//* @public

/**
	Allow bootstrapping in environments that do not have a window object right away.
*/
enyo.requiresWindow = inFunction => {
	inFunction();
};

enyo.dom = {
	/**
		
		Shortcut for _document.getElementById_ if _id_ is a string, otherwise returns _id_. Uses _window.document_ unless a document is specified in the (optional) _doc_ parameter.

			// find 'node' if it's a string id, or return it unchanged if it's already a node reference
			var domNode = enyo.byId(node);
	*/
	byId(id, doc) {
		return (typeof id == "string") ? (doc || document).getElementById(id) : id; 
	},
	/**
		return string with ampersand, less-than, and greater-than characters replaced with HTML entities, 
		e.g. 

			'&lt;code&gt;"This &amp; That"&lt;/code&gt;' 

		becomes 

			'&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;'
	*/
	escape(inText) {
		return inText !== null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	//* @protected
	getComputedStyle(inNode) {
		return window.getComputedStyle && inNode && window.getComputedStyle(inNode, null);
	},
	getComputedStyleValue(inNode, inProperty, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		return s ? s.getPropertyValue(inProperty) : null;
	},
	getFirstElementByTagName(inTagName) {
		var e = document.getElementsByTagName(inTagName);
		return e && e[0];
	},
	applyBodyFit() {
		var h = this.getFirstElementByTagName("html");
		if (h) {
			h.className += " enyo-document-fit";
		}
		var b = this.getFirstElementByTagName("body");
		if (b) {
			b.className += " enyo-body-fit";
		}
		enyo.bodyIsFitting = true;
	},
	getWindowWidth() {
		if (window.innerWidth) {
			return window.innerWidth;
		}
		if (document.body && document.body.offsetWidth) {
			return document.body.offsetWidth;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetWidth ) {
			return document.documentElement.offsetWidth;
		}
		return 320;
	},
	// moved from FittableLayout.js into common protected code
	_ieCssToPixelValue(inNode, inValue) {
		var v = inValue;
		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
		var s = inNode.style;
		// store style and runtime style values
		var l = s.left;
		var rl = inNode.runtimeStyle && inNode.runtimeStyle.left;
		// then put current style in runtime style.
		if (rl) {
			inNode.runtimeStyle.left = inNode.currentStyle.left;
		}
		// apply given value and measure its pixel value
		s.left = v;
		v = s.pixelLeft;
		// finally restore previous state
		s.left = l;
		if (rl) {
			s.runtimeStyle.left = rl;
		}
		return v;
	},
	_pxMatch: /px/i,
	getComputedBoxValue(inNode, inProp, inBoundary, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		if (s) {
			return parseInt(s.getPropertyValue(inProp + "-" + inBoundary), 0);
		} else if (inNode && inNode.currentStyle) {
			var v = inNode.currentStyle[inProp + enyo.cap(inBoundary)];
			if (!v.match(this._pxMatch)) {
				v = this._ieCssToPixelValue(inNode, v);
			}
			return parseInt(v, 0);
		}
		return 0;
	},
	//* @public
	//* Gets the boundaries of a node's margin or padding box.
	calcBoxExtents(inNode, inBox) {
		var s = this.getComputedStyle(inNode);
		return {
			top: this.getComputedBoxValue(inNode, inBox, "top", s),
			right: this.getComputedBoxValue(inNode, inBox, "right", s),
			bottom: this.getComputedBoxValue(inNode, inBox, "bottom", s),
			left: this.getComputedBoxValue(inNode, inBox, "left", s)
		};
	},
	//* Gets the calculated padding of a node.
	calcPaddingExtents(inNode) {
		return this.calcBoxExtents(inNode, "padding");
	},
	//* Gets the calculated margin of a node.
	calcMarginExtents(inNode) {
		return this.calcBoxExtents(inNode, "margin");
	}
};
