/**
_enyo.TouchScrollStrategy_, a helper kind for implementing a touch-based
scroller, integrates the scrolling simulation provided by
<a href="#enyo.ScrollMath">enyo.ScrollMath</a> into an
<a href="#enyo.Scroller">enyo.Scroller</a>.

_enyo.TouchScrollStrategy_ is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TouchScrollStrategy",
	kind: "ScrollStrategy",
	/**
		If true (the default), the scroller will overscroll and bounce back at the edges
	*/
	overscroll: true,
	/**
		If true (the default), the scroller will not propagate _dragstart_
		events that cause it to start scrolling
	*/
	preventDragPropagation: true,
	published: {
		/**
			Specifies how to vertically scroll.  Acceptable values are:
			
			* "scroll": Always scroll.
			* "auto": Scroll only if the content overflows the scroller.
			* "hidden": Never scroll.
			* "default": In touch environments, the default vertical scrolling
				behavior is to always scroll. If the content does not overflow
				the scroller, the scroller will overscroll and snap back.
		*/
		vertical: "default",
		/**
			Specifies how to horizontally scroll.  Acceptable values are:

			* "scroll": Always scroll.
			* "auto":  Scroll only if the content overflows the scroller.
			* "hidden": Never scroll.
			* "default": Same as "auto".
		*/
		horizontal: "default",
		//* Set to true to display a scroll thumb
		thumb: true,
		/**
			Set to true to display a transparent overlay while scrolling. This
			can help improve performance of complex, large scroll regions on
			some platforms (e.g., Android).
		*/
		scrim: false
	},
	events: {
		onShouldDrag: ""
	},
	//* @protected
	handlers: {
		onscroll: "domScroll",
		onflick: "flick",
		onhold: "hold",
		ondragstart: "dragstart",
		onShouldDrag: "shouldDrag",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		onmousewheel: "mousewheel"
	},
	tools: [
		{kind: "ScrollMath", onScrollStart: "scrollMathStart", onScroll: "scrollMathScroll", onScrollStop: "scrollMathStop"},
		{name: "vthumb", kind: "ScrollThumb", axis: "v", showing: false},
		{name: "hthumb", kind: "ScrollThumb", axis: "h", showing: false}
	],
	scrimTools: [{name: "scrim", classes: "enyo-fit", style: "z-index: 1;", showing: false}],
	components: [
		{name: "client", attributes: {"onscroll": enyo.bubbler}, classes: "enyo-touch-scroller"}
	],
	create(...args) {
		this.inherited(args);
		this.transform = enyo.dom.canTransform();
		if(!this.transform) {
			if(this.overscroll) {
				//so we can adjust top/left if browser can't handle translations
				this.$.client.applyStyle("position", "relative");
			}
		}
		this.accel = enyo.dom.canAccelerate();
		var containerClasses = "enyo-touch-strategy-container";
		// note: needed for ios to avoid incorrect clipping of thumb
		// and need to avoid on Android as it causes problems hiding the thumb
		if (enyo.platform.ios && this.accel) {
			containerClasses += " enyo-composite";
		}
		this.scrimChanged();
		this.container.addClass(containerClasses);
		this.translation = this.accel ? "translate3d" : "translate";
	},
	initComponents(...args) {
		this.createChrome(this.tools);
		this.inherited(args);
	},
	destroy(...args) {
		this.container.removeClass("enyo-touch-strategy-container");
		this.inherited(args);
	},
	rendered(...args) {
		this.inherited(args);
		this.calcBoundaries();
		this.syncScrollMath();
		if (this.thumb) {
			this.alertThumbs();
		}
	},
	scrimChanged() {
		if (this.scrim && !this.$.scrim) {
			this.makeScrim();
		}
		if (!this.scrim && this.$.scrim) {
			this.$.scrim.destroy();
		}
	},
	makeScrim() {
		// reset control parent so scrim doesn't go into client.
		var cp = this.controlParent;
		this.controlParent = null;
		this.createChrome(this.scrimTools);
		this.controlParent = cp;
		var cn = this.container.hasNode();
		// render scrim in container, strategy has no dom.
		if (cn) {
			this.$.scrim.parentNode = cn;
			this.$.scrim.render();
		}
	},
	//* Whether or not the scroller is actively moving
	isScrolling() {
		return this.$.scrollMath.isScrolling();
	},
	//* Whether or not the scroller is in overscrolling
	isOverscrolling() {
		return (this.overscroll) ? this.$.scrollMath.isInOverScroll() : false;
	},
	domScroll() {
		if (!this.isScrolling()) {
			this.calcBoundaries();
			this.syncScrollMath();
			if (this.thumb) {
				this.alertThumbs();
			}
		}
	},
	horizontalChanged() {
		this.$.scrollMath.horizontal = (this.horizontal != "hidden");
	},
	verticalChanged() {
		this.$.scrollMath.vertical = (this.vertical != "hidden");
	},
	maxHeightChanged() {
		this.$.client.applyStyle("max-height", this.maxHeight);
		// note: previously used enyo-fit here but IE would reset scroll position when the scroll thumb
		// was hidden; in general IE resets scrollTop when there are 2 abs position siblings, one has
		// scrollTop and the other is hidden.
		this.$.client.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
	},
	thumbChanged() {
		this.hideThumbs();
	},
	stop() {
		if (this.isScrolling()) {
			this.$.scrollMath.stop(true);
		}
	},
	stabilize() {
		this.$.scrollMath.stabilize();
	},
	//* Scrolls to specific x/y positions within the scroll area.
	scrollTo(inX, inY) {
		this.stop();
		this.$.scrollMath.scrollTo(inY || inY === 0 ? inY : null, inX);
	},
	scrollIntoView(...args) {
		this.stop();
		this.inherited(args);
	},
	//* Sets the left scroll position within the scroller.
	setScrollLeft(...args) {
		this.stop();
		this.inherited(args);
	},
	//* Sets the top scroll position within the scroller.
	setScrollTop(...args) {
		this.stop();
		this.inherited(args);
	},
	//* Gets the left scroll position within the scroller.
	getScrollLeft(...args) {
		return this.isScrolling() ? this.scrollLeft : this.inherited(args);
	},
	//* Gets the top scroll position within the scroller.
	getScrollTop(...args) {
		return this.isScrolling() ? this.scrollTop : this.inherited(args);
	},
	calcScrollNode() {
		return this.$.client.hasNode();
	},
	calcAutoScrolling() {
		var v = (this.vertical == "auto");
		var h = (this.horizontal == "auto") || (this.horizontal == "default");
		if ((v || h) && this.scrollNode) {
			var b = this.getScrollBounds();
			if (v) {
				this.$.scrollMath.vertical = b.height > b.clientHeight;
			}
			if (h) {
				this.$.scrollMath.horizontal = b.width > b.clientWidth;
			}
		}
	},
	shouldDrag(inSender, e) {
        this.calcAutoScrolling();
        var requestV = e.vertical;
        var canH = this.$.scrollMath.horizontal && !requestV;
        var canV = this.$.scrollMath.vertical && requestV;
        var down = e.dy < 0;
        var right = e.dx < 0;
        var oobV = (!down && this.startEdges.top || down && this.startEdges.bottom);
        var oobH = (!right && this.startEdges.left || right && this.startEdges.right);
        // we would scroll if not at a boundary
        if (!e.boundaryDragger && (canH || canV)) {
			e.boundaryDragger = this;
		}
        // include boundary exclusion
        if ((!oobV && canV) || (!oobH && canH)) {
			e.dragger = this;
			return true;
		}
    },
	flick(inSender, e) {
		var onAxis = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
		if (onAxis && this.dragging) {
			this.$.scrollMath.flick(e);
			return this.preventDragPropagation;
		}
	},
	hold(inSender, e) {
		if (this.isScrolling() && !this.isOverscrolling()) {
			this.$.scrollMath.stop(e);
			return true;
		}
	},
	move(inSender, inEvent) {
	},
	// Special synthetic DOM events served up by the Gesture system
	dragstart(inSender, inEvent) {
		// note: allow drags to propagate to parent scrollers via data returned in the shouldDrag event.
		this.doShouldDrag(inEvent);
		this.dragging = (inEvent.dragger == this || (!inEvent.dragger && inEvent.boundaryDragger == this));
		if (this.dragging) {
			inEvent.preventDefault();
			// note: needed because show/hide changes
			// the position so sync'ing is required when 
			// dragging begins (needed because show/hide does not trigger onscroll)
			this.syncScrollMath();
			this.$.scrollMath.startDrag(inEvent);
			if (this.preventDragPropagation) {
				return true;
			}
		}
	},
	drag(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			this.$.scrollMath.drag(inEvent);
			if (this.scrim) {
				this.$.scrim.show();
			}
		}
	},
	dragfinish(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventTap();
			this.$.scrollMath.dragFinish();
			this.dragging = false;
			if (this.scrim) {
				this.$.scrim.hide();
			}
		}
	},
	mousewheel(inSender, e) {
		if (!this.dragging && this.$.scrollMath.mousewheel(e)) {
			e.preventDefault();
			return true;
		}
	},
	scrollMathStart(inSender) {
		if (this.scrollNode) {
			this.calcBoundaries();
			if (this.thumb) {
				this.showThumbs();
			}
		}
	},
	scrollMathScroll(inSender) {
		if(!this.overscroll) {
			//don't overscroll past edges
			this.effectScroll(-Math.min(inSender.leftBoundary, Math.max(inSender.rightBoundary, inSender.x)),
					-Math.min(inSender.topBoundary, Math.max(inSender.bottomBoundary, inSender.y)));
		} else {
			this.effectScroll(-inSender.x, -inSender.y);
		}
		if (this.thumb) {
			this.updateThumbs();
		}
	},
	scrollMathStop(inSender) {
		this.effectScrollStop();
		if (this.thumb) {
			this.delayHideThumbs(100);
		}
	},
	calcBoundaries() {
        var s = this.$.scrollMath;
        var b = this._getScrollBounds();
        s.bottomBoundary = b.clientHeight - b.height;
        s.rightBoundary = b.clientWidth - b.width;
    },
	syncScrollMath() {
		var m = this.$.scrollMath;
		m.setScrollX(-this.getScrollLeft());
		m.setScrollY(-this.getScrollTop());
	},
	effectScroll(inX, inY) {
		if (this.scrollNode) {
			this.scrollLeft = this.scrollNode.scrollLeft = inX;
			this.scrollTop = this.scrollNode.scrollTop = inY;
			this.effectOverscroll(Math.round(inX), Math.round(inY));
		}
	},
	effectScrollStop() {
		this.effectOverscroll(null, null);
	},
	effectOverscroll(inX, inY) {
        var n = this.scrollNode;
        var x = "0";
        var y = "0";
        var z = this.accel ? ",0" : "";
        if (inY !== null && Math.abs(inY - n.scrollTop) > 1) {
			y = (n.scrollTop - inY);
		}
        if (inX !== null && Math.abs(inX - n.scrollLeft) > 1) {
			x = (n.scrollLeft - inX);
		}
        if(!this.transform) {
			//adjust top/left if browser can't handle translations
			this.$.client.setBounds({left:x + "px", top:y + "px"});
		} else {
			enyo.dom.transformValue(this.$.client, this.translation, x + "px, " + y + "px" + z);
		}
    },
	//* Returns the values of _overleft_ and _overtop_, if any.
	getOverScrollBounds() {
		var m = this.$.scrollMath;
		return {
			overleft: Math.min(m.leftBoundary - m.x, 0) || Math.max(m.rightBoundary - m.x, 0),
			overtop: Math.min(m.topBoundary - m.y, 0) || Math.max(m.bottomBoundary - m.y, 0)
		};
	},
	_getScrollBounds(...args) {
		var r = this.inherited(args);
		enyo.mixin(r, this.getOverScrollBounds());
		return r;
	},
	getScrollBounds(...args) {
		this.stop();
		return this.inherited(args);
	},
	// Thumb processing
	alertThumbs() {
		this.showThumbs();
		this.delayHideThumbs(500);
	},
	//* Syncs the vertical and horizontal scroll indicators.
	syncThumbs() {
		this.$.vthumb.sync(this);
		this.$.hthumb.sync(this);
	},
	updateThumbs() {
		this.$.vthumb.update(this);
		this.$.hthumb.update(this);
	},
	//* Syncs and shows both the vertical and horizontal scroll indicators.
	showThumbs() {
		this.syncThumbs();
		this.$.vthumb.show();
		this.$.hthumb.show();
	},
	//* Hides the vertical and horizontal scroll indicators.
	hideThumbs() {
		this.$.vthumb.hide();
		this.$.hthumb.hide();
	},
	//* Hides the vertical and horizontal scroll indicators asynchronously.
	delayHideThumbs(inDelay) {
		this.$.vthumb.delayHide(inDelay);
		this.$.hthumb.delayHide(inDelay);
	}
});
