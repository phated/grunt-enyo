((() => {
	var ms = Math.round(1000/60);
	var prefix = ["webkit", "moz", "ms", "o", ""];
	var r = "requestAnimationFrame";
	var c = "cancel" + enyo.cap(r);
	// fallback on setTimeout and clearTimeout
	var _requestFrame = inCallback => window.setTimeout(inCallback, ms);
	var _cancelFrame = inId => window.clearTimeout(inId);
	for (var i = 0, pl = prefix.length, p, wc, wr; (p = prefix[i]) || i < pl; i++) {
		// if prefixed, becomes Request and Cancel
		wc = p ? (p + enyo.cap(c)) : c;
		wr = p ? (p + enyo.cap(r)) : r;
		// Test for cancelRequestAnimationFrame, because some browsers (Firefix 4-10) have a request without a cancel
		if (window[wc]) {
			_cancelFrame = window[wc];
			_requestFrame = window[wr];
			if (p == "webkit") {
				/*
					Note: In Chrome, the first return value of webkitRequestAnimationFrame is 0.
					We make 1 bogus call so the first used return value of webkitRequestAnimationFrame is > 0, as the spec requires.
					This makes it so that the requestId is always truthy.
					(we choose to do this rather than wrapping the native function to avoid the overhead)
				*/
				_cancelFrame(_requestFrame(enyo.nop));
			}
			break;
		}
	}
	/**
		Requests an animation callback.

		On compatible browsers, if _inNode_ is defined, the callback will fire only if _inNode_ is visible.

		Returns a request id to be used with [enyo.cancelRequestAnimationFrame](#enyo.cancelRequestAnimationFrame).
	*/
	enyo.requestAnimationFrame = (inCallback, inNode) => _requestFrame(inCallback, inNode);
	/**
		Cancels a requested animation callback with the specified id.
	*/
	enyo.cancelRequestAnimationFrame = inId => _cancelFrame(inId);
}))();

/**
	An assortment of interpolation functions for animations.

	Similar in function to CSS3 transitions.

	Intended for use with [enyo.easedLerp](#enyo.easedLerp)
*/
enyo.easing = {
	cubicIn(n) {
		return n ** 3;
	},
	cubicOut(n) {
		return (n - 1) ** 3 + 1;
	},
	expoOut(n) {
		return (n == 1) ? 1 : (-1 * (2 ** (-10 * n)) + 1);
	},
	quadInOut(n) {
		n = n * 2;
		if (n < 1) {
			return n ** 2 / 2;
		}
		return -1 * ((--n) * (n - 2) - 1) / 2;
	},
	linear(n) {
		return n;
	}
};

/**
	Gives an interpolation of an animated transition's distance from 0 to 1.

	Given a start time (_inT0_) and an animation duration (_inDuration_), applies
	the _inEasing_ function to the percentage of time elapsed / duration, capped
	at 100%.
*/
enyo.easedLerp = (inT0, inDuration, inEasing, reverse) => {
	var lerp = (enyo.now() - inT0) / inDuration;
	if (reverse) {
		return lerp >= 1 ? 0 : (1 - inEasing(1 - lerp));
	} else {
		return lerp >= 1 ? 1 : inEasing(lerp);
	}
};
