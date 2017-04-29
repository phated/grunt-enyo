//* @protected
((() => {
	if (window.navigator.msPointerEnabled) {
		var msEvents = [
			"MSPointerDown",
			"MSPointerUp",
			"MSPointerMove",
			"MSPointerOver",
			"MSPointerOut",
			"MSPointerCancel",
			"MSGestureTap",
			"MSGestureDoubleTap",
			"MSGestureHold",
			"MSGestureStart",
			"MSGestureChange",
			"MSGestureEnd"
		];
		enyo.forEach(msEvents, e => {
			enyo.dispatcher.listen(document, e);
		});
		// MSPointer events natively send mouse events as well
		// MSGesture events need to be normalized to gesture events
		enyo.dispatcher.features.push(e => {
			if (handlers[e.type]) {
				handlers[e.type](e);
			}
		});
	}
	var gestureNormalize = (inType, inEvent) => {
		var e = enyo.clone(inEvent);
		return enyo.mixin(e, {
			pageX: inEvent.translationX || 0,
			pageY: inEvent.translationY || 0,
			// rad -> deg
			rotation: (inEvent.rotation * (180 / Math.PI)) || 0,
			type: inType,
			srcEvent: inEvent,
			preventDefault: enyo.gesture.preventDefault,
			disablePrevention: enyo.gesture.disablePrevention
		});
	};
	var handlers = {
		MSGestureStart(inEvent) {
			enyo.dispatch(gestureNormalize("gesturestart", inEvent));
		},
		MSGestureChange(inEvent) {
			enyo.dispatch(gestureNormalize("gesturechange", inEvent));
		},
		MSGestureEnd(inEvent) {
			enyo.dispatch(gestureNormalize("gestureend", inEvent));
		}
	};
}))();
