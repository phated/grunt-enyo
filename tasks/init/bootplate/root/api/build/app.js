
// minifier: path aliases

enyo.path.addPaths({layout: "/home/reviewdaemon/hudson/trunk/agent/workspace/Enyo-github-build/api-tool/enyo/tools/../../lib/layout/"});

// FittableLayout.js

enyo.kind({
name: "enyo.FittableLayout",
kind: "Layout",
calcFitIndex() {
for (var e = 0, t = this.container.children, n; n = t[e]; e++) if (n.fit && n.showing) return e;
},
getFitControl() {
  var e = this.container.children;
  var t = e[this.fitIndex];
  return t && t.fit && t.showing || (this.fitIndex = this.calcFitIndex(), t = e[this.fitIndex]), t;
},
getLastControl() {
  var e = this.container.children;
  var t = e.length - 1;
  var n = e[t];
  while ((n = e[t]) && !n.showing) t--;
  return n;
},
_reflow(e, t, n, r) {
  this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
  var i = this.getFitControl();
  if (!i) return;
  var s = 0;
  var o = 0;
  var u = 0;
  var a;
  var f = this.container.hasNode();
  f && (a = enyo.dom.calcPaddingExtents(f), s = f[t] - (a[n] + a[r]));
  var l = i.getBounds();
  o = l[n] - (a && a[n] || 0);
  var c = this.getLastControl();
  if (c) {
  var h = enyo.dom.getComputedBoxValue(c.hasNode(), "margin", r) || 0;
  if (c != i) {
    var p = c.getBounds();
    var d = l[n] + l[e];
    var v = p[n] + p[e] + h;
    u = v - d;
  } else u = h;
  }
  var m = s - (o + u);
  i.applyStyle(e, m + "px");
},
reflow() {
this.orient == "h" ? this._reflow("width", "clientWidth", "left", "right") : this._reflow("height", "clientHeight", "top", "bottom");
}
}), enyo.kind({
name: "enyo.FittableColumnsLayout",
kind: "FittableLayout",
orient: "h",
layoutClass: "enyo-fittable-columns-layout"
}), enyo.kind({
name: "enyo.FittableRowsLayout",
kind: "FittableLayout",
layoutClass: "enyo-fittable-rows-layout",
orient: "v"
});

// FittableRows.js

enyo.kind({
name: "enyo.FittableRows",
layoutKind: "FittableRowsLayout",
noStretch: !1
});

// FittableColumns.js

enyo.kind({
name: "enyo.FittableColumns",
layoutKind: "FittableColumnsLayout",
noStretch: !1
});

// FlyweightRepeater.js

enyo.kind({
name: "enyo.FlyweightRepeater",
published: {
count: 0,
noSelect: !1,
multiSelect: !1,
toggleSelected: !1,
clientClasses: "",
clientStyle: ""
},
events: {
onSetupItem: ""
},
bottomUp: !1,
components: [ {
kind: "Selection",
onSelect: "selectDeselect",
onDeselect: "selectDeselect"
}, {
name: "client"
} ],
rowOffset: 0,
create(...args) {
this.inherited(args), this.noSelectChanged(), this.multiSelectChanged(), this.clientClassesChanged(), this.clientStyleChanged();
},
noSelectChanged() {
this.noSelect && this.$.selection.clear();
},
multiSelectChanged() {
this.$.selection.setMulti(this.multiSelect);
},
clientClassesChanged() {
this.$.client.setClasses(this.clientClasses);
},
clientStyleChanged() {
this.$.client.setStyle(this.clientStyle);
},
setupItem(e) {
this.doSetupItem({
index: e,
selected: this.isSelected(e)
});
},
generateChildHtml(...args) {
var e = "";
this.index = null;
for (var t = 0, n = 0; t < this.count; t++) n = this.rowOffset + (this.bottomUp ? this.count - t - 1 : t), this.setupItem(n), this.$.client.setAttribute("data-enyo-index", n), e += this.inherited(args), this.$.client.teardownRender();
return e;
},
previewDomEvent(e) {
var t = this.index = this.rowForEvent(e);
e.rowIndex = e.index = t, e.flyweight = this;
},
decorateEvent(e, t, n) {
var r = t && t.index != null ? t.index : this.index;
t && r != null && (t.index = r, t.flyweight = this), this.inherited(arguments);
},
tap(e, t) {
if (this.noSelect) return;
this.toggleSelected ? this.$.selection.toggle(t.index) : this.$.selection.select(t.index);
},
selectDeselect(e, t) {
this.renderRow(t.key);
},
getSelection() {
return this.$.selection;
},
isSelected(e) {
return this.getSelection().isSelected(e);
},
renderRow(e) {
var t = this.fetchRowNode(e);
t && (this.setupItem(e), t.innerHTML = this.$.client.generateChildHtml(), this.$.client.teardownChildren());
},
fetchRowNode(e) {
if (this.hasNode()) {
var t = this.node.querySelectorAll('[data-enyo-index="' + e + '"]');
return t && t[0];
}
},
rowForEvent(e) {
  var t = e.target;
  var n = this.hasNode().id;
  while (t && t.parentNode && t.id != n) {
  var r = t.getAttribute && t.getAttribute("data-enyo-index");
  if (r !== null) return Number(r);
  t = t.parentNode;
  }
  return -1;
},
prepareRow(e) {
var t = this.fetchRowNode(e);
enyo.FlyweightRepeater.claimNode(this.$.client, t);
},
lockRow() {
this.$.client.teardownChildren();
},
performOnRow(e, t, n) {
t && (this.prepareRow(e), enyo.call(n || null, t), this.lockRow());
},
statics: {
claimNode(e, t) {
var n = t && t.querySelectorAll("#" + e.id);
n = n && n[0], e.generated = Boolean(n || !e.tag), e.node = n, e.node && e.rendered();
for (var r = 0, i = e.children, s; s = i[r]; r++) this.claimNode(s, t);
}
}
});

// List.js

enyo.kind({
name: "enyo.List",
kind: "Scroller",
classes: "enyo-list",
published: {
count: 0,
rowsPerPage: 50,
bottomUp: !1,
noSelect: !1,
multiSelect: !1,
toggleSelected: !1,
fixedHeight: !1
},
events: {
onSetupItem: ""
},
handlers: {
onAnimateFinish: "animateFinish"
},
rowHeight: 0,
listTools: [ {
name: "port",
classes: "enyo-list-port enyo-border-box",
components: [ {
name: "generator",
kind: "FlyweightRepeater",
canGenerate: !1,
components: [ {
tag: null,
name: "client"
} ]
}, {
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
} ]
} ],
create(...args) {
this.pageHeights = [], this.inherited(args), this.getStrategy().translateOptimized = !0, this.bottomUpChanged(), this.noSelectChanged(), this.multiSelectChanged(), this.toggleSelectedChanged();
},
createStrategy(...args) {
this.controlParentName = "strategy", this.inherited(args), this.createChrome(this.listTools), this.controlParentName = "client", this.discoverControlParent();
},
rendered(...args) {
this.inherited(args), this.$.generator.node = this.$.port.hasNode(), this.$.generator.generated = !0, this.reset();
},
resizeHandler(...args) {
this.inherited(args), this.refresh();
},
bottomUpChanged() {
this.$.generator.bottomUp = this.bottomUp, this.$.page0.applyStyle(this.pageBound, null), this.$.page1.applyStyle(this.pageBound, null), this.pageBound = this.bottomUp ? "bottom" : "top", this.hasNode() && this.reset();
},
noSelectChanged() {
this.$.generator.setNoSelect(this.noSelect);
},
multiSelectChanged() {
this.$.generator.setMultiSelect(this.multiSelect);
},
toggleSelectedChanged() {
this.$.generator.setToggleSelected(this.toggleSelected);
},
countChanged() {
this.hasNode() && this.updateMetrics();
},
updateMetrics() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.portSize = 0;
for (var e = 0; e < this.pageCount; e++) this.portSize += this.getPageHeight(e);
this.adjustPortSize();
},
generatePage(e, t) {
  this.page = e;
  var n = this.$.generator.rowOffset = this.rowsPerPage * this.page;
  var r = this.$.generator.count = Math.min(this.count - n, this.rowsPerPage);
  var i = this.$.generator.generateChildHtml();
  t.setContent(i);
  var s = t.getBounds().height;
  !this.rowHeight && s > 0 && (this.rowHeight = Math.floor(s / r), this.updateMetrics());
  if (!this.fixedHeight) {
  var o = this.getPageHeight(e);
  o != s && s > 0 && (this.pageHeights[e] = s, this.portSize += s - o);
  }
},
update(e) {
  var t = !1;
  var n = this.positionToPageInfo(e);
  var r = n.pos + this.scrollerHeight / 2;
  var i = Math.floor(r / Math.max(n.height, this.scrollerHeight) + .5) + n.no;
  var s = i % 2 === 0 ? i : i - 1;
  this.p0 != s && this.isPageInRange(s) && (this.generatePage(s, this.$.page0), this.positionPage(s, this.$.page0), this.p0 = s, t = !0), s = i % 2 === 0 ? Math.max(1, i - 1) : i, this.p1 != s && this.isPageInRange(s) && (this.generatePage(s, this.$.page1), this.positionPage(s, this.$.page1), this.p1 = s, t = !0), t && !this.fixedHeight && (this.adjustBottomPage(), this.adjustPortSize());
},
updateForPosition(e) {
this.update(this.calcPos(e));
},
calcPos(e) {
return this.bottomUp ? this.portSize - this.scrollerHeight - e : e;
},
adjustBottomPage() {
var e = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
this.positionPage(e.pageNo, e);
},
adjustPortSize() {
this.scrollerHeight = this.getBounds().height;
var e = Math.max(this.scrollerHeight, this.portSize);
this.$.port.applyStyle("height", e + "px");
},
positionPage(e, t) {
t.pageNo = e;
var n = this.pageToPosition(e);
t.applyStyle(this.pageBound, n + "px");
},
pageToPosition(e) {
  var t = 0;
  var n = e;
  while (n > 0) n--, t += this.getPageHeight(n);
  return t;
},
positionToPageInfo(e) {
  var t = -1;
  var n = this.calcPos(e);
  var r = this.defaultPageHeight;
  while (n >= 0) t++, r = this.getPageHeight(t), n -= r;
  return {
  no: t,
  height: r,
  pos: n + r
  };
},
isPageInRange(e) {
return e == Math.max(0, Math.min(this.pageCount - 1, e));
},
getPageHeight(e) {
return this.pageHeights[e] || this.defaultPageHeight;
},
invalidatePages() {
this.p0 = this.p1 = null, this.$.page0.setContent(""), this.$.page1.setContent("");
},
invalidateMetrics() {
this.pageHeights = [], this.rowHeight = 0, this.updateMetrics();
},
scroll(e, t) {
var n = this.inherited(arguments);
return this.update(this.getScrollTop()), n;
},
scrollToBottom(...args) {
this.update(this.getScrollBounds().maxTop), this.inherited(args);
},
setScrollTop(e) {
this.update(e), this.inherited(arguments), this.twiddle();
},
getScrollPosition() {
return this.calcPos(this.getScrollTop());
},
setScrollPosition(e) {
this.setScrollTop(this.calcPos(e));
},
scrollToRow(e) {
  var t = Math.floor(e / this.rowsPerPage);
  var n = e % this.rowsPerPage;
  var r = this.pageToPosition(t);
  this.updateForPosition(r), r = this.pageToPosition(t), this.setScrollPosition(r);
  if (t == this.p0 || t == this.p1) {
  var i = this.$.generator.fetchRowNode(e);
  if (i) {
  var s = i.offsetTop;
  this.bottomUp && (s = this.getPageHeight(t) - i.offsetHeight - s);
  var o = this.getScrollPosition() + s;
  this.setScrollPosition(o);
  }
  }
},
scrollToStart() {
this[this.bottomUp ? "scrollToBottom" : "scrollToTop"]();
},
scrollToEnd() {
this[this.bottomUp ? "scrollToTop" : "scrollToBottom"]();
},
refresh() {
this.invalidatePages(), this.update(this.getScrollTop()), this.stabilize(), enyo.platform.android === 4 && this.twiddle();
},
reset() {
this.getSelection().clear(), this.invalidateMetrics(), this.invalidatePages(), this.stabilize(), this.scrollToStart();
},
getSelection() {
return this.$.generator.getSelection();
},
select(e, t) {
return this.getSelection().select(e, t);
},
deselect(e) {
return this.getSelection().deselect(e);
},
isSelected(e) {
return this.$.generator.isSelected(e);
},
renderRow(e) {
this.$.generator.renderRow(e);
},
prepareRow(e) {
this.$.generator.prepareRow(e);
},
lockRow() {
this.$.generator.lockRow();
},
performOnRow(e, t, n) {
this.$.generator.performOnRow(e, t, n);
},
animateFinish(e) {
return this.twiddle(), !0;
},
twiddle() {
var e = this.getStrategy();
enyo.call(e, "twiddle");
}
});

// PulldownList.js

enyo.kind({
name: "enyo.PulldownList",
kind: "List",
touch: !0,
pully: null,
pulldownTools: [ {
name: "pulldown",
classes: "enyo-list-pulldown",
components: [ {
name: "puller",
kind: "Puller"
} ]
} ],
events: {
onPullStart: "",
onPullCancel: "",
onPull: "",
onPullRelease: "",
onPullComplete: ""
},
handlers: {
onScrollStart: "scrollStartHandler",
onScrollStop: "scrollStopHandler",
ondragfinish: "dragfinish"
},
pullingMessage: "Pull down to refresh...",
pulledMessage: "Release to refresh...",
loadingMessage: "Loading...",
pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
loadingIconClass: "",
create(...args) {
var e = {
kind: "Puller",
showing: !1,
text: this.loadingMessage,
iconClass: this.loadingIconClass,
onCreate: "setPully"
};
this.listTools.splice(0, 0, e), this.inherited(args), this.setPulling();
},
initComponents(...args) {
this.createChrome(this.pulldownTools), this.accel = enyo.dom.canAccelerate(), this.translation = this.accel ? "translate3d" : "translate", this.inherited(args);
},
setPully(e, t) {
this.pully = t.originator;
},
scrollStartHandler() {
this.firedPullStart = !1, this.firedPull = !1, this.firedPullCancel = !1;
},
scroll(e, t) {
  var n = this.inherited(arguments);
  this.completingPull && this.pully.setShowing(!1);
  var r = this.getStrategy().$.scrollMath;
  var i = r.y;
  return r.isInOverScroll() && i > 0 && (enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + i + "px" + (this.accel ? ",0" : "")), this.firedPullStart || (this.firedPullStart = !0, this.pullStart(), this.pullHeight = this.$.pulldown.getBounds().height), i > this.pullHeight && !this.firedPull && (this.firedPull = !0, this.firedPullCancel = !1, this.pull()), this.firedPull && !this.firedPullCancel && i < this.pullHeight && (this.firedPullCancel = !0, this.firedPull = !1, this.pullCancel())), n;
},
scrollStopHandler() {
this.completingPull && (this.completingPull = !1, this.doPullComplete());
},
dragfinish() {
if (this.firedPull) {
var e = this.getStrategy().$.scrollMath;
e.setScrollY(e.y - this.pullHeight), this.pullRelease();
}
},
completePull() {
this.completingPull = !0, this.$.strategy.$.scrollMath.setScrollY(this.pullHeight), this.$.strategy.$.scrollMath.start();
},
pullStart() {
this.setPulling(), this.pully.setShowing(!1), this.$.puller.setShowing(!0), this.doPullStart();
},
pull() {
this.setPulled(), this.doPull();
},
pullCancel() {
this.setPulling(), this.doPullCancel();
},
pullRelease() {
this.$.puller.setShowing(!1), this.pully.setShowing(!0), this.doPullRelease();
},
setPulling() {
this.$.puller.setText(this.pullingMessage), this.$.puller.setIconClass(this.pullingIconClass);
},
setPulled() {
this.$.puller.setText(this.pulledMessage), this.$.puller.setIconClass(this.pulledIconClass);
}
}), enyo.kind({
name: "enyo.Puller",
classes: "enyo-puller",
published: {
text: "",
iconClass: ""
},
events: {
onCreate: ""
},
components: [ {
name: "icon"
}, {
name: "text",
tag: "span",
classes: "enyo-puller-text"
} ],
create(...args) {
this.inherited(args), this.doCreate(), this.textChanged(), this.iconClassChanged();
},
textChanged() {
this.$.text.setContent(this.text);
},
iconClassChanged() {
this.$.icon.setClasses(this.iconClass);
}
});

// AroundList.js

enyo.kind({
name: "enyo.AroundList",
kind: "enyo.List",
listTools: [ {
name: "port",
classes: "enyo-list-port enyo-border-box",
components: [ {
name: "aboveClient"
}, {
name: "generator",
kind: "enyo.FlyweightRepeater",
canGenerate: !1,
components: [ {
tag: null,
name: "client"
} ]
}, {
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "belowClient"
} ]
} ],
aboveComponents: null,
initComponents(...args) {
this.inherited(args), this.aboveComponents && this.$.aboveClient.createComponents(this.aboveComponents, {
owner: this.owner
}), this.belowComponents && this.$.belowClient.createComponents(this.belowComponents, {
owner: this.owner
});
},
updateMetrics() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.aboveHeight = this.$.aboveClient.getBounds().height, this.belowHeight = this.$.belowClient.getBounds().height, this.portSize = this.aboveHeight + this.belowHeight;
for (var e = 0; e < this.pageCount; e++) this.portSize += this.getPageHeight(e);
this.adjustPortSize();
},
positionPage(e, t) {
  t.pageNo = e;
  var n = this.pageToPosition(e);
  var r = this.bottomUp ? this.belowHeight : this.aboveHeight;
  n += r, t.applyStyle(this.pageBound, n + "px");
},
scrollToContentStart() {
var e = this.bottomUp ? this.belowHeight : this.aboveHeight;
this.setScrollPosition(e);
}
});

// Slideable.js

enyo.kind({
name: "enyo.Slideable",
kind: "Control",
published: {
axis: "h",
value: 0,
unit: "px",
min: 0,
max: 0,
accelerated: "auto",
overMoving: !0,
draggable: !0
},
events: {
onAnimateFinish: "",
onChange: ""
},
preventDragPropagation: !1,
tools: [ {
kind: "Animator",
onStep: "animatorStep",
onEnd: "animatorComplete"
} ],
handlers: {
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish"
},
kDragScalar: 1,
dragEventProp: "dx",
unitModifier: !1,
canTransform: !1,
create(...args) {
this.inherited(args), this.acceleratedChanged(), this.transformChanged(), this.axisChanged(), this.valueChanged(), this.addClass("enyo-slideable");
},
initComponents(...args) {
this.createComponents(this.tools), this.inherited(args);
},
rendered(...args) {
this.inherited(args), this.canModifyUnit(), this.updateDragScalar();
},
resizeHandler(...args) {
this.inherited(args), this.updateDragScalar();
},
canModifyUnit() {
if (!this.canTransform) {
var e = this.getInitialStyleValue(this.hasNode(), this.boundary);
e.match(/px/i) && this.unit === "%" && (this.unitModifier = this.getBounds()[this.dimension]);
}
},
getInitialStyleValue(e, t) {
var n = enyo.dom.getComputedStyle(e);
return n ? n.getPropertyValue(t) : e && e.currentStyle ? e.currentStyle[t] : "0";
},
updateBounds(e, t) {
var n = {};
n[this.boundary] = e, this.setBounds(n, this.unit), this.setInlineStyles(e, t);
},
updateDragScalar() {
if (this.unit == "%") {
var e = this.getBounds()[this.dimension];
this.kDragScalar = e ? 100 / e : 1, this.canTransform || this.updateBounds(this.value, 100);
}
},
transformChanged() {
this.canTransform = enyo.dom.canTransform();
},
acceleratedChanged() {
enyo.platform.android > 2 || enyo.dom.accelerate(this, this.accelerated);
},
axisChanged() {
var e = this.axis == "h";
this.dragMoveProp = e ? "dx" : "dy", this.shouldDragProp = e ? "horizontal" : "vertical", this.transform = e ? "translateX" : "translateY", this.dimension = e ? "width" : "height", this.boundary = e ? "left" : "top";
},
setInlineStyles(e, t) {
var n = {};
this.unitModifier ? (n[this.boundary] = this.percentToPixels(e, this.unitModifier), n[this.dimension] = this.unitModifier, this.setBounds(n)) : (t ? n[this.dimension] = t : n[this.boundary] = e, this.setBounds(n, this.unit));
},
valueChanged(e) {
var t = this.value;
this.isOob(t) && !this.isAnimating() && (this.value = this.overMoving ? this.dampValue(t) : this.clampValue(t)), enyo.platform.android > 2 && (this.value ? (e === 0 || e === undefined) && enyo.dom.accelerate(this, this.accelerated) : enyo.dom.accelerate(this, !1)), this.canTransform ? enyo.dom.transformValue(this, this.transform, this.value + this.unit) : this.setInlineStyles(this.value, !1), this.doChange();
},
getAnimator() {
return this.$.animator;
},
isAtMin() {
return this.value <= this.calcMin();
},
isAtMax() {
return this.value >= this.calcMax();
},
calcMin() {
return this.min;
},
calcMax() {
return this.max;
},
clampValue(e) {
  var t = this.calcMin();
  var n = this.calcMax();
  return Math.max(t, Math.min(e, n));
},
dampValue(e) {
return this.dampBound(this.dampBound(e, this.min, 1), this.max, -1);
},
dampBound(e, t, n) {
var r = e;
return r * n < t * n && (r = t + (r - t) / 4), r;
},
percentToPixels(e, t) {
return Math.floor(t / 100 * e);
},
pixelsToPercent(e) {
var t = this.unitModifier ? this.getBounds()[this.dimension] : this.container.getBounds()[this.dimension];
return e / t * 100;
},
shouldDrag(e) {
return this.draggable && e[this.shouldDragProp];
},
isOob(e) {
return e > this.calcMax() || e < this.calcMin();
},
dragstart(e, t) {
if (this.shouldDrag(t)) return t.preventDefault(), this.$.animator.stop(), t.dragInfo = {}, this.dragging = !0, this.drag0 = this.value, this.dragd0 = 0, this.preventDragPropagation;
},
drag(e, t) {
if (this.dragging) {
  t.preventDefault();
  var n = this.canTransform ? t[this.dragMoveProp] * this.kDragScalar : this.pixelsToPercent(t[this.dragMoveProp]);
  var r = this.drag0 + n;
  var i = n - this.dragd0;
  return this.dragd0 = n, i && (t.dragInfo.minimizing = i < 0), this.setValue(r), this.preventDragPropagation;
}
},
dragfinish(e, t) {
if (this.dragging) return this.dragging = !1, this.completeDrag(t), t.preventTap(), this.preventDragPropagation;
},
completeDrag(e) {
this.value !== this.calcMax() && this.value != this.calcMin() && this.animateToMinMax(e.dragInfo.minimizing);
},
isAnimating() {
return this.$.animator.isAnimating();
},
play(e, t) {
this.$.animator.play({
startValue: e,
endValue: t,
node: this.hasNode()
});
},
animateTo(e) {
this.play(this.value, e);
},
animateToMin() {
this.animateTo(this.calcMin());
},
animateToMax() {
this.animateTo(this.calcMax());
},
animateToMinMax(e) {
e ? this.animateToMin() : this.animateToMax();
},
animatorStep(e) {
return this.setValue(e.value), !0;
},
animatorComplete(e) {
return this.doAnimateFinish(e), !0;
},
toggleMinMax() {
this.animateToMinMax(!this.isAtMin());
}
});

// Arranger.js

enyo.kind({
name: "enyo.Arranger",
kind: "Layout",
layoutClass: "enyo-arranger",
accelerated: "auto",
dragProp: "ddx",
dragDirectionProp: "xDirection",
canDragProp: "horizontal",
incrementalPoints: !1,
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n._arranger = null;
this.inherited(args);
},
arrange(e, t) {},
size() {},
start() {
  var e = this.container.fromIndex;
  var t = this.container.toIndex;
  var n = this.container.transitionPoints = [ e ];
  if (this.incrementalPoints) {
    var r = Math.abs(t - e) - 2;
    var i = e;
    while (r >= 0) i += t < e ? -1 : 1, n.push(i), r--;
  }
  n.push(this.container.toIndex);
},
finish() {},
calcArrangementDifference(e, t, n, r) {},
canDragEvent(e) {
return e[this.canDragProp];
},
calcDragDirection(e) {
return e[this.dragDirectionProp];
},
calcDrag(e) {
return e[this.dragProp];
},
drag(e, t, n, r, i) {
var s = this.measureArrangementDelta(-e, t, n, r, i);
return s;
},
measureArrangementDelta(e, t, n, r, i) {
  var s = this.calcArrangementDifference(t, n, r, i);
  var o = s ? e / Math.abs(s) : 0;
  return o *= this.container.fromIndex > this.container.toIndex ? -1 : 1, o;
},
_arrange(e) {
this.containerBounds || this.reflow();
var t = this.getOrderedControls(e);
this.arrange(t, e);
},
arrangeControl(e, t) {
e._arranger = enyo.mixin(e._arranger || {}, t);
},
flow() {
this.c$ = [].concat(this.container.getPanels()), this.controlsIndex = 0;
for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) {
enyo.dom.accelerate(n, this.accelerated);
if (enyo.platform.safari) {
var r = n.children;
for (var i = 0, s; s = r[i]; i++) enyo.dom.accelerate(s, this.accelerated);
}
}
},
reflow() {
var e = this.container.hasNode();
this.containerBounds = e ? {
width: e.clientWidth,
height: e.clientHeight
} : {}, this.size();
},
flowArrangement() {
var e = this.container.arrangement;
if (e) for (var t = 0, n = this.container.getPanels(), r; r = n[t]; t++) this.flowControl(r, e[t]);
},
flowControl(e, t) {
enyo.Arranger.positionControl(e, t);
var n = t.opacity;
n != null && enyo.Arranger.opacifyControl(e, n);
},
getOrderedControls(e) {
  var t = Math.floor(e);
  var n = t - this.controlsIndex;
  var r = n > 0;
  var i = this.c$ || [];
  for (var s = 0; s < Math.abs(n); s++) r ? i.push(i.shift()) : i.unshift(i.pop());
  return this.controlsIndex = t, i;
},
statics: {
positionControl(e, t, n) {
var r = n || "px";
if (!this.updating) if (enyo.dom.canTransform() && !enyo.platform.android) {
  var i = t.left;
  var s = t.top;
  i = enyo.isString(i) ? i : i && i + r, s = enyo.isString(s) ? s : s && s + r, enyo.dom.transform(e, {
  translateX: i || null,
  translateY: s || null
  });
} else e.setBounds(t, n);
},
opacifyControl(e, t) {
var n = t;
n = n > .99 ? 1 : n < .01 ? 0 : n, enyo.platform.ie < 9 ? e.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + n * 100 + ")") : e.applyStyle("opacity", n);
}
}
});

// CardArranger.js

enyo.kind({
name: "enyo.CardArranger",
kind: "Arranger",
layoutClass: "enyo-arranger enyo-arranger-fit",
calcArrangementDifference(e, t, n, r) {
return this.containerBounds.width;
},
arrange(e, t) {
for (var n = 0, r, i, s; r = e[n]; n++) s = n === 0 ? 1 : 0, this.arrangeControl(r, {
opacity: s
});
},
start(...args) {
this.inherited(args);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) {
var r = n.showing;
n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
}
},
finish(...args) {
this.inherited(args);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.setShowing(t == this.container.toIndex);
},
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.opacifyControl(n, 1), n.showing || n.setShowing(!0);
this.inherited(args);
}
});

// CardSlideInArranger.js

enyo.kind({
name: "enyo.CardSlideInArranger",
kind: "CardArranger",
start() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) {
var r = n.showing;
n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
}
var i = this.container.fromIndex;
t = this.container.toIndex, this.container.transitionPoints = [ t + "." + i + ".s", t + "." + i + ".f" ];
},
finish(...args) {
this.inherited(args);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.setShowing(t == this.container.toIndex);
},
arrange(e, t) {
  var n = t.split(".");
  var r = n[0];
  var i = n[1];
  var s = n[2] == "s";
  var o = this.containerBounds.width;
  for (var u = 0, a = this.container.getPanels(), f, l; f = a[u]; u++) l = o, i == u && (l = s ? 0 : -o), r == u && (l = s ? o : 0), i == u && i == r && (l = 0), this.arrangeControl(f, {
  left: l
  });
},
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null
});
this.inherited(args);
}
});

// CarouselArranger.js

enyo.kind({
name: "enyo.CarouselArranger",
kind: "Arranger",
size() {
  var e = this.container.getPanels();
  var t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {};
  var n = this.containerBounds;
  var r;
  var i;
  var s;
  var o;
  var u;
  n.height -= t.top + t.bottom, n.width -= t.left + t.right;
  var a;
  for (r = 0, s = 0; u = e[r]; r++) o = enyo.dom.calcMarginExtents(u.hasNode()), u.width = u.getBounds().width, u.marginWidth = o.right + o.left, s += (u.fit ? 0 : u.width) + u.marginWidth, u.fit && (a = u);
  if (a) {
  var f = n.width - s;
  a.width = f >= 0 ? f : a.width;
  }
  for (r = 0, i = t.left; u = e[r]; r++) u.setBounds({
  top: t.top,
  bottom: t.bottom,
  width: u.fit ? u.width : null
  });
},
arrange(e, t) {
this.container.wrap ? this.arrangeWrap(e, t) : this.arrangeNoWrap(e, t);
},
arrangeNoWrap(e, t) {
  var n;
  var r;
  var i;
  var s;
  var o = this.container.getPanels();
  var u = this.container.clamp(t);
  var a = this.containerBounds.width;
  for (n = u, i = 0; s = o[n]; n++) {
  i += s.width + s.marginWidth;
  if (i > a) break;
  }
  var f = a - i;
  var l = 0;
  if (f > 0) {
  var c = u;
  for (n = u - 1, r = 0; s = o[n]; n--) {
  r += s.width + s.marginWidth;
  if (f - r <= 0) {
  l = f - r, u = n;
  break;
  }
  }
  }
  var h;
  var p;
  for (n = 0, p = this.containerPadding.left + l; s = o[n]; n++) h = s.width + s.marginWidth, n < u ? this.arrangeControl(s, {
  left: -h
  }) : (this.arrangeControl(s, {
  left: Math.floor(p)
  }), p += h);
},
arrangeWrap(e, t) {
for (var n = 0, r = this.containerPadding.left, i, s; s = e[n]; n++) this.arrangeControl(s, {
left: r
}), r += s.width + s.marginWidth;
},
calcArrangementDifference(e, t, n, r) {
var i = Math.abs(e % this.c$.length);
return t[i].left - r[i].left;
},
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
this.inherited(args);
}
});

// CollapsingArranger.js

enyo.kind({
name: "enyo.CollapsingArranger",
kind: "CarouselArranger",
size(...args) {
this.clearLastSize(), this.inherited(args);
},
clearLastSize() {
for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) n._fit && e != t.length - 1 && (n.applyStyle("width", null), n._fit = null);
},
arrange(e, t) {
var n = this.container.getPanels();
for (var r = 0, i = this.containerPadding.left, s, o; o = n[r]; r++) this.arrangeControl(o, {
left: i
}), r >= t && (i += o.width + o.marginWidth), r == n.length - 1 && t < 0 && this.arrangeControl(o, {
left: i - t
});
},
calcArrangementDifference(e, t, n, r) {
var i = this.container.getPanels().length - 1;
return Math.abs(r[i].left - t[i].left);
},
flowControl(e, t) {
this.inherited(arguments);
if (this.container.realtimeFit) {
  var n = this.container.getPanels();
  var r = n.length - 1;
  var i = n[r];
  e == i && this.fitControl(e, t.left);
}
},
finish(...args) {
this.inherited(args);
if (!this.container.realtimeFit && this.containerBounds) {
  var e = this.container.getPanels();
  var t = this.container.arrangement;
  var n = e.length - 1;
  var r = e[n];
  this.fitControl(r, t[n].left);
}
},
fitControl(e, t) {
e._fit = !0, e.applyStyle("width", this.containerBounds.width - t + "px"), e.resized();
}
});

// OtherArrangers.js

enyo.kind({
name: "enyo.LeftRightArranger",
kind: "Arranger",
margin: 40,
axisSize: "width",
offAxisSize: "height",
axisPosition: "left",
constructor(...args) {
this.inherited(args), this.margin = this.container.margin != null ? this.container.margin : this.margin;
},
size() {
  var e = this.container.getPanels();
  var t = this.containerBounds[this.axisSize];
  var n = t - this.margin - this.margin;
  for (var r = 0, i, s; s = e[r]; r++) i = {}, i[this.axisSize] = n, i[this.offAxisSize] = "100%", s.setBounds(i);
},
start(...args) {
  this.inherited(args);
  var e = this.container.fromIndex;
  var t = this.container.toIndex;
  var n = this.getOrderedControls(t);
  var r = Math.floor(n.length / 2);
  for (var i = 0, s; s = n[i]; i++) e > t ? i == n.length - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1) : i == n.length - 1 - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1);
},
arrange(e, t) {
  var n;
  var r;
  var i;
  var s;
  if (this.container.getPanels().length == 1) {
  s = {}, s[this.axisPosition] = this.margin, this.arrangeControl(this.container.getPanels()[0], s);
  return;
  }
  var o = Math.floor(this.container.getPanels().length / 2);
  var u = this.getOrderedControls(Math.floor(t) - o);
  var a = this.containerBounds[this.axisSize] - this.margin - this.margin;
  var f = this.margin - a * o;
  for (n = 0; r = u[n]; n++) s = {}, s[this.axisPosition] = f, this.arrangeControl(r, s), f += a;
},
calcArrangementDifference(e, t, n, r) {
if (this.container.getPanels().length == 1) return 0;
var i = Math.abs(e % this.c$.length);
return t[i][this.axisPosition] - r[i][this.axisPosition];
},
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), enyo.Arranger.opacifyControl(n, 1), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(args);
}
}), enyo.kind({
name: "enyo.TopBottomArranger",
kind: "LeftRightArranger",
dragProp: "ddy",
dragDirectionProp: "yDirection",
canDragProp: "vertical",
axisSize: "height",
offAxisSize: "width",
axisPosition: "top"
}), enyo.kind({
name: "enyo.SpiralArranger",
kind: "Arranger",
incrementalPoints: !0,
inc: 20,
size() {
  var e = this.container.getPanels();
  var t = this.containerBounds;
  var n = this.controlWidth = t.width / 3;
  var r = this.controlHeight = t.height / 3;
  for (var i = 0, s; s = e[i]; i++) s.setBounds({
  width: n,
  height: r
  });
},
arrange(e, t) {
var n = this.inc;
for (var r = 0, i = e.length, s; s = e[r]; r++) {
  var o = Math.cos(r / i * 2 * Math.PI) * r * n + this.controlWidth;
  var u = Math.sin(r / i * 2 * Math.PI) * r * n + this.controlHeight;
  this.arrangeControl(s, {
  left: o,
  top: u
  });
}
},
start(...args) {
this.inherited(args);
var e = this.getOrderedControls(this.container.toIndex);
for (var t = 0, n; n = e[t]; t++) n.applyStyle("z-index", e.length - t);
},
calcArrangementDifference(e, t, n, r) {
return this.controlWidth;
},
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.applyStyle("z-index", null), enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(args);
}
}), enyo.kind({
name: "enyo.GridArranger",
kind: "Arranger",
incrementalPoints: !0,
colWidth: 100,
colHeight: 100,
size() {
  var e = this.container.getPanels();
  var t = this.colWidth;
  var n = this.colHeight;
  for (var r = 0, i; i = e[r]; r++) i.setBounds({
  width: t,
  height: n
  });
},
arrange(e, t) {
  var n = this.colWidth;
  var r = this.colHeight;
  var i = Math.max(1, Math.floor(this.containerBounds.width / n));
  var s;
  for (var o = 0, u = 0; u < e.length; o++) for (var a = 0; a < i && (s = e[u]); a++, u++) this.arrangeControl(s, {
  left: n * a,
  top: r * o
  });
},
flowControl(e, t) {
this.inherited(arguments), enyo.Arranger.opacifyControl(e, t.top % this.colHeight !== 0 ? .25 : 1);
},
calcArrangementDifference(e, t, n, r) {
return this.colWidth;
},
destroy(...args) {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(args);
}
});

// Panels.js

enyo.kind({
name: "enyo.Panels",
classes: "enyo-panels",
published: {
index: 0,
draggable: !0,
animate: !0,
wrap: !1,
arrangerKind: "CardArranger",
narrowFit: !0
},
events: {
onTransitionStart: "",
onTransitionFinish: ""
},
handlers: {
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish",
onscroll: "domScroll"
},
tools: [ {
kind: "Animator",
onStep: "step",
onEnd: "completed"
} ],
fraction: 0,
create(...args) {
this.transitionPoints = [], this.inherited(args), this.arrangerKindChanged(), this.narrowFitChanged(), this.indexChanged(), this.setAttribute("onscroll", enyo.bubbler);
},
domScroll(e, t) {
this.hasNode() && this.node.scrollLeft > 0 && (this.node.scrollLeft = 0);
},
initComponents(...args) {
this.createChrome(this.tools), this.inherited(args);
},
arrangerKindChanged() {
this.setLayoutKind(this.arrangerKind);
},
narrowFitChanged() {
this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit);
},
removeControl(e) {
this.inherited(arguments), this.controls.length > 0 && this.isPanel(e) && (this.setIndex(Math.max(this.index - 1, 0)), this.flow(), this.reflow());
},
isPanel() {
return !0;
},
flow(...args) {
this.arrangements = [], this.inherited(args);
},
reflow(...args) {
this.arrangements = [], this.inherited(args), this.refresh();
},
getPanels() {
var e = this.controlParent || this;
return e.children;
},
getActive() {
  var e = this.getPanels();
  var t = this.index % e.length;
  return t < 0 ? t += e.length : enyo.nop, e[t];
},
getAnimator() {
return this.$.animator;
},
setIndex(e) {
this.setPropertyValue("index", e, "indexChanged");
},
setIndexDirect(e) {
this.setIndex(e), this.completed();
},
previous() {
this.setIndex(this.index - 1);
},
next() {
this.setIndex(this.index + 1);
},
clamp(e) {
var t = this.getPanels().length - 1;
return this.wrap ? e : Math.max(0, Math.min(e, t));
},
indexChanged(e) {
this.lastIndex = e, this.index = this.clamp(this.index), !this.dragging && this.$.animator && (this.$.animator.isAnimating() && this.completed(), this.$.animator.stop(), this.hasNode() && (this.animate ? (this.startTransition(), this.$.animator.play({
startValue: this.fraction
})) : this.refresh()));
},
step(e) {
this.fraction = e.value, this.stepTransition();
},
completed() {
this.$.animator.isAnimating() && this.$.animator.stop(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
dragstart(e, t) {
if (this.draggable && this.layout && this.layout.canDragEvent(t)) return t.preventDefault(), this.dragstartTransition(t), this.dragging = !0, this.$.animator.stop(), !0;
},
drag(e, t) {
this.dragging && (t.preventDefault(), this.dragTransition(t));
},
dragfinish(e, t) {
this.dragging && (this.dragging = !1, t.preventTap(), this.dragfinishTransition(t));
},
dragstartTransition(e) {
if (!this.$.animator.isAnimating()) {
var t = this.fromIndex = this.index;
this.toIndex = t - (this.layout ? this.layout.calcDragDirection(e) : 0);
} else this.verifyDragTransition(e);
this.fromIndex = this.clamp(this.fromIndex), this.toIndex = this.clamp(this.toIndex), this.fireTransitionStart(), this.layout && this.layout.start();
},
dragTransition(e) {
  var t = this.layout ? this.layout.calcDrag(e) : 0;
  var n = this.transitionPoints;
  var r = n[0];
  var i = n[n.length - 1];
  var s = this.fetchArrangement(r);
  var o = this.fetchArrangement(i);
  var u = this.layout ? this.layout.drag(t, r, s, i, o) : 0;
  var a = t && !u;
  a, this.fraction += u;
  var f = this.fraction;
  if (f > 1 || f < 0 || a) (f > 0 || a) && this.dragfinishTransition(e), this.dragstartTransition(e), this.fraction = 0;
  this.stepTransition();
},
dragfinishTransition(e) {
this.verifyDragTransition(e), this.setIndex(this.toIndex), this.dragging && this.fireTransitionFinish();
},
verifyDragTransition(e) {
  var t = this.layout ? this.layout.calcDragDirection(e) : 0;
  var n = Math.min(this.fromIndex, this.toIndex);
  var r = Math.max(this.fromIndex, this.toIndex);
  if (t > 0) {
  var i = n;
  n = r, r = i;
  }
  n != this.fromIndex && (this.fraction = 1 - this.fraction), this.fromIndex = n, this.toIndex = r;
},
refresh() {
this.$.animator && this.$.animator.isAnimating() && this.$.animator.stop(), this.startTransition(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
startTransition() {
this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0, this.toIndex = this.toIndex != null ? this.toIndex : this.index, this.layout && this.layout.start(), this.fireTransitionStart();
},
finishTransition() {
this.layout && this.layout.finish(), this.transitionPoints = [], this.fraction = 0, this.fromIndex = this.toIndex = null, this.fireTransitionFinish();
},
fireTransitionStart() {
var e = this.startTransitionInfo;
this.hasNode() && (!e || e.fromIndex != this.fromIndex || e.toIndex != this.toIndex) && (this.startTransitionInfo = {
fromIndex: this.fromIndex,
toIndex: this.toIndex
}, this.doTransitionStart(enyo.clone(this.startTransitionInfo)));
},
fireTransitionFinish() {
var e = this.finishTransitionInfo;
this.hasNode() && (!e || e.fromIndex != this.lastIndex || e.toIndex != this.index) && (this.finishTransitionInfo = {
fromIndex: this.lastIndex,
toIndex: this.index
}, this.doTransitionFinish(enyo.clone(this.finishTransitionInfo))), this.lastIndex = this.index;
},
stepTransition() {
if (this.hasNode()) {
  var e = this.transitionPoints;
  var t = (this.fraction || 0) * (e.length - 1);
  var n = Math.floor(t);
  t -= n;
  var r = e[n];
  var i = e[n + 1];
  var s = this.fetchArrangement(r);
  var o = this.fetchArrangement(i);
  this.arrangement = s && o ? enyo.Panels.lerp(s, o, t) : s || o, this.arrangement && this.layout && this.layout.flowArrangement();
}
},
fetchArrangement(e) {
return e != null && !this.arrangements[e] && this.layout && (this.layout._arrange(e), this.arrangements[e] = this.readArrangement(this.getPanels())), this.arrangements[e];
},
readArrangement(e) {
var t = [];
for (var n = 0, r = e, i; i = r[n]; n++) t.push(enyo.clone(i._arranger));
return t;
},
statics: {
isScreenNarrow() {
return enyo.dom.getWindowWidth() <= 800;
},
lerp(e, t, n) {
var r = [];
for (var i = 0, s = enyo.keys(e), o; o = s[i]; i++) r.push(this.lerpObject(e[o], t[o], n));
return r;
},
lerpObject(e, t, n) {
  var r = enyo.clone(e);
  var i;
  var s;
  if (t) for (var o in e) i = e[o], s = t[o], i != s && (r[o] = i - (i - s) * n);
  return r;
}
}
});

// Node.js

enyo.kind({
name: "enyo.Node",
published: {
expandable: !1,
expanded: !1,
icon: "",
onlyIconExpands: !1,
selected: !1
},
style: "padding: 0 0 0 16px;",
content: "Node",
defaultKind: "Node",
classes: "enyo-node",
components: [ {
name: "icon",
kind: "Image",
showing: !1
}, {
kind: "Control",
name: "caption",
Xtag: "span",
style: "display: inline-block; padding: 4px;",
allowHtml: !0
}, {
kind: "Control",
name: "extra",
tag: "span",
allowHtml: !0
} ],
childClient: [ {
kind: "Control",
name: "box",
classes: "enyo-node-box",
Xstyle: "border: 1px solid orange;",
components: [ {
kind: "Control",
name: "client",
classes: "enyo-node-client",
Xstyle: "border: 1px solid lightblue;"
} ]
} ],
handlers: {
ondblclick: "dblclick"
},
events: {
onNodeTap: "nodeTap",
onNodeDblClick: "nodeDblClick",
onExpand: "nodeExpand",
onDestroyed: "nodeDestroyed"
},
create(...args) {
this.inherited(args), this.selectedChanged(), this.iconChanged();
},
destroy(...args) {
this.doDestroyed(), this.inherited(args);
},
initComponents(...args) {
this.expandable && (this.kindComponents = this.kindComponents.concat(this.childClient)), this.inherited(args);
},
contentChanged() {
this.$.caption.setContent(this.content);
},
iconChanged() {
this.$.icon.setSrc(this.icon), this.$.icon.setShowing(Boolean(this.icon));
},
selectedChanged() {
this.addRemoveClass("enyo-selected", this.selected);
},
rendered(...args) {
this.inherited(args), this.expandable && !this.expanded && this.quickCollapse();
},
addNodes(e) {
this.destroyClientControls();
for (var t = 0, n; n = e[t]; t++) this.createComponent(n);
this.$.client.render();
},
addTextNodes(e) {
this.destroyClientControls();
for (var t = 0, n; n = e[t]; t++) this.createComponent({
content: n
});
this.$.client.render();
},
tap(e, t) {
return this.onlyIconExpands ? t.target == this.$.icon.hasNode() ? this.toggleExpanded() : this.doNodeTap() : (this.toggleExpanded(), this.doNodeTap()), !0;
},
dblclick(e, t) {
return this.doNodeDblClick(), !0;
},
toggleExpanded() {
this.setExpanded(!this.expanded);
},
quickCollapse() {
this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "0");
var e = this.$.client.getBounds().height;
this.$.client.setBounds({
top: -e
});
},
_expand() {
this.addClass("enyo-animate");
var e = this.$.client.getBounds().height;
this.$.box.setBounds({
height: e
}), this.$.client.setBounds({
top: 0
}), setTimeout(enyo.bind(this, function() {
this.expanded && (this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "auto"));
}), 225);
},
_collapse() {
this.removeClass("enyo-animate");
var e = this.$.client.getBounds().height;
this.$.box.setBounds({
height: e
}), setTimeout(enyo.bind(this, function() {
this.addClass("enyo-animate"), this.$.box.applyStyle("height", "0"), this.$.client.setBounds({
top: -e
});
}), 25);
},
expandedChanged(e) {
if (!this.expandable) this.expanded = !1; else {
var t = {
expanded: this.expanded
};
this.doExpand(t), t.wait || this.effectExpanded();
}
},
effectExpanded() {
this.$.client && (this.expanded ? this._expand() : this._collapse());
}
});

// ImageView.js

enyo.kind({
name: "enyo.ImageView",
kind: enyo.Scroller,
touchOverscroll: !1,
thumb: !1,
animate: !0,
verticalDragPropagation: !0,
horizontalDragPropagation: !0,
published: {
scale: "auto",
disableZoom: !1,
src: undefined
},
events: {
onZoom: ""
},
touch: !0,
preventDragPropagation: !1,
handlers: {
ondragstart: "dragPropagation"
},
components: [ {
name: "animator",
kind: "Animator",
onStep: "zoomAnimationStep",
onEnd: "zoomAnimationEnd"
}, {
name: "viewport",
style: "overflow:hidden;min-height:100%;min-width:100%;",
classes: "enyo-fit",
ongesturechange: "gestureTransform",
ongestureend: "saveState",
ontap: "singleTap",
ondblclick: "doubleClick",
onmousewheel: "mousewheel",
components: [ {
kind: "Image",
ondown: "down"
} ]
} ],
create(...args) {
this.inherited(args), this.canTransform = enyo.dom.canTransform(), this.canTransform || this.$.image.applyStyle("position", "relative"), this.canAccelerate = enyo.dom.canAccelerate(), this.bufferImage = new Image, this.bufferImage.onload = enyo.bind(this, "imageLoaded"), this.bufferImage.onerror = enyo.bind(this, "imageError"), this.srcChanged(), this.getStrategy().setDragDuringGesture(!1);
},
down(e, t) {
t.preventDefault();
},
dragPropagation(e, t) {
  var n = this.getStrategy().getScrollBounds();
  var r = n.top === 0 && t.dy > 0 || n.top >= n.maxTop - 2 && t.dy < 0;
  var i = n.left === 0 && t.dx > 0 || n.left >= n.maxLeft - 2 && t.dx < 0;
  return !(r && this.verticalDragPropagation || i && this.horizontalDragPropagation);
},
mousewheel(e, t) {
  t.pageX |= t.clientX + t.target.scrollLeft, t.pageY |= t.clientY + t.target.scrollTop;
  var n = (this.maxScale - this.minScale) / 10;
  var r = this.scale;
  if (t.wheelDelta > 0 || t.detail < 0) this.scale = this.limitScale(this.scale + n); else if (t.wheelDelta < 0 || t.detail > 0) this.scale = this.limitScale(this.scale - n);
  return this.eventPt = this.calcEventLocation(t), this.transformImage(this.scale), r != this.scale && this.doZoom({
  scale: this.scale
  }), this.ratioX = this.ratioY = null, t.preventDefault(), !0;
},
srcChanged() {
this.src && this.src.length > 0 && this.bufferImage && this.src != this.bufferImage.src && (this.bufferImage.src = this.src);
},
imageLoaded(e) {
this.originalWidth = this.bufferImage.width, this.originalHeight = this.bufferImage.height, this.scaleChanged(), this.$.image.setSrc(this.bufferImage.src), enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0");
},
resizeHandler(...args) {
this.inherited(args), this.$.image.src && this.scaleChanged();
},
scaleChanged() {
var e = this.hasNode();
if (e) {
  this.containerWidth = e.clientWidth, this.containerHeight = e.clientHeight;
  var t = this.containerWidth / this.originalWidth;
  var n = this.containerHeight / this.originalHeight;
  this.minScale = Math.min(t, n), this.maxScale = this.minScale * 3 < 1 ? 1 : this.minScale * 3, this.scale == "auto" ? this.scale = this.minScale : this.scale == "width" ? this.scale = t : this.scale == "height" ? this.scale = n : (this.maxScale = Math.max(this.maxScale, this.scale), this.scale = this.limitScale(this.scale));
}
this.eventPt = this.calcEventLocation(), this.transformImage(this.scale);
},
imageError(e) {
enyo.error("Error loading image: " + this.src), this.bubble("onerror", e);
},
gestureTransform(e, t) {
this.eventPt = this.calcEventLocation(t), this.transformImage(this.limitScale(this.scale * t.scale));
},
calcEventLocation(e) {
var t = {
x: 0,
y: 0
};
if (e && this.hasNode()) {
var n = this.node.getBoundingClientRect();
t.x = Math.round(e.pageX - n.left - this.imageBounds.x), t.x = Math.max(0, Math.min(this.imageBounds.width, t.x)), t.y = Math.round(e.pageY - n.top - this.imageBounds.y), t.y = Math.max(0, Math.min(this.imageBounds.height, t.y));
}
return t;
},
transformImage(e) {
  this.tapped = !1;
  var t = this.imageBounds || this.innerImageBounds(e);
  this.imageBounds = this.innerImageBounds(e), this.scale > this.minScale ? this.$.viewport.applyStyle("cursor", "move") : this.$.viewport.applyStyle("cursor", null), this.$.viewport.setBounds({
  width: this.imageBounds.width + "px",
  height: this.imageBounds.height + "px"
  }), this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / t.width, this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / t.height;
  var n;
  var r;
  this.$.animator.ratioLock ? (n = this.$.animator.ratioLock.x * this.imageBounds.width - this.containerWidth / 2, r = this.$.animator.ratioLock.y * this.imageBounds.height - this.containerHeight / 2) : (n = this.ratioX * this.imageBounds.width - this.eventPt.x, r = this.ratioY * this.imageBounds.height - this.eventPt.y), n = Math.max(0, Math.min(this.imageBounds.width - this.containerWidth, n)), r = Math.max(0, Math.min(this.imageBounds.height - this.containerHeight, r));
  if (this.canTransform) {
  var i = {
  scale: e
  };
  this.canAccelerate ? i = enyo.mixin({
  translate3d: Math.round(this.imageBounds.left) + "px, " + Math.round(this.imageBounds.top) + "px, 0px"
  }, i) : i = enyo.mixin({
  translate: this.imageBounds.left + "px, " + this.imageBounds.top + "px"
  }, i), enyo.dom.transform(this.$.image, i);
  } else this.$.image.setBounds({
  width: this.imageBounds.width + "px",
  height: this.imageBounds.height + "px",
  left: this.imageBounds.left + "px",
  top: this.imageBounds.top + "px"
  });
  this.setScrollLeft(n), this.setScrollTop(r);
},
limitScale(e) {
return this.disableZoom ? e = this.scale : e > this.maxScale ? e = this.maxScale : e < this.minScale && (e = this.minScale), e;
},
innerImageBounds(e) {
  var t = this.originalWidth * e;
  var n = this.originalHeight * e;

  var r = {
  x: 0,
  y: 0,
  transX: 0,
  transY: 0
  };

  return t < this.containerWidth && (r.x += (this.containerWidth - t) / 2), n < this.containerHeight && (r.y += (this.containerHeight - n) / 2), this.canTransform && (r.transX -= (this.originalWidth - t) / 2, r.transY -= (this.originalHeight - n) / 2), {
  left: r.x + r.transX,
  top: r.y + r.transY,
  width: t,
  height: n,
  x: r.x,
  y: r.y
  };
},
saveState(e, t) {
var n = this.scale;
this.scale *= t.scale, this.scale = this.limitScale(this.scale), n != this.scale && this.doZoom({
scale: this.scale
}), this.ratioX = this.ratioY = null;
},
doubleClick(e, t) {
enyo.platform.ie == 8 && (this.tapped = !0, t.pageX = t.clientX + t.target.scrollLeft, t.pageY = t.clientY + t.target.scrollTop, this.singleTap(e, t), t.preventDefault());
},
singleTap(e, t) {
setTimeout(enyo.bind(this, function() {
this.tapped = !1;
}), 300), this.tapped ? (this.tapped = !1, this.smartZoom(e, t)) : this.tapped = !0;
},
smartZoom(e, t) {
  var n = this.hasNode();
  var r = this.$.image.hasNode();
  if (n && r && this.hasNode() && !this.disableZoom) {
  var i = this.scale;
  this.scale != this.minScale ? this.scale = this.minScale : this.scale = this.maxScale, this.eventPt = this.calcEventLocation(t);
  if (this.animate) {
  var s = {
  x: (this.eventPt.x + this.getScrollLeft()) / this.imageBounds.width,
  y: (this.eventPt.y + this.getScrollTop()) / this.imageBounds.height
  };
  this.$.animator.play({
  duration: 350,
  ratioLock: s,
  baseScale: i,
  deltaScale: this.scale - i
  });
  } else this.transformImage(this.scale), this.doZoom({
  scale: this.scale
  });
  }
},
zoomAnimationStep(e, t) {
var n = this.$.animator.baseScale + this.$.animator.deltaScale * this.$.animator.value;
this.transformImage(n);
},
zoomAnimationEnd(e, t) {
this.doZoom({
scale: this.scale
}), this.$.animator.ratioLock = undefined;
}
});

// ImageCarousel.js

enyo.kind({
name: "enyo.ImageCarousel",
kind: enyo.Panels,
arrangerKind: "enyo.CarouselArranger",
defaultScale: "auto",
disableZoom: !1,
lowMemory: !1,
published: {
images: []
},
handlers: {
onTransitionStart: "transitionStart",
onTransitionFinish: "transitionFinish"
},
create(...args) {
this.inherited(args), this.imageCount = this.images.length, this.images.length > 0 && (this.initContainers(), this.loadNearby());
},
initContainers() {
for (var e = 0; e < this.images.length; e++) this.$["container" + e] || (this.createComponent({
name: "container" + e,
style: "height:100%; width:100%;"
}), this.$["container" + e].render());
for (e = this.images.length; e < this.imageCount; e++) this.$["image" + e] && this.$["image" + e].destroy(), this.$["container" + e].destroy();
this.imageCount = this.images.length;
},
loadNearby() {
this.images.length > 0 && (this.loadImageView(this.index - 1), this.loadImageView(this.index), this.loadImageView(this.index + 1));
},
loadImageView(e) {
return this.wrap && (e = (e % this.images.length + this.images.length) % this.images.length), e >= 0 && e <= this.images.length - 1 && (this.$["image" + e] ? (this.$["image" + e].src != this.images[e] && this.$["image" + e].setSrc(this.images[e]), this.$["image" + e].setScale(this.defaultScale), this.$["image" + e].setDisableZoom(this.disableZoom)) : (this.$["container" + e].createComponent({
name: "image" + e,
kind: "ImageView",
scale: this.defaultScale,
disableZoom: this.disableZoom,
src: this.images[e],
verticalDragPropagation: !1,
style: "height:100%; width:100%;"
}, {
owner: this
}), this.$["image" + e].render())), this.$["image" + e];
},
setImages(e) {
this.setPropertyValue("images", e, "imagesChanged");
},
imagesChanged() {
this.initContainers(), this.loadNearby();
},
indexChanged(...args) {
this.loadNearby(), this.lowMemory && this.cleanupMemory(), this.inherited(args);
},
transitionStart(e, t) {
if (t.fromIndex == t.toIndex) return !0;
},
transitionFinish(e, t) {
this.loadImageView(this.index - 1), this.loadImageView(this.index + 1), this.lowMemory && this.cleanupMemory();
},
getActiveImage() {
return this.getImageByIndex(this.index);
},
getImageByIndex(e) {
return this.$["image" + e] || this.loadImageView(e);
},
cleanupMemory() {
for (var e = 0; e < this.images.length; e++) (e < this.index - 1 || e > this.index + 1) && this.$["image" + e] && this.$["image" + e].destroy();
}
});

// runtime-machine.js

runtimeMachine = {
_head(e, t, n) {
this._inflight = !0;
var r = document.createElement(e);
for (var i in t) r.setAttribute(i, t[i]);
return n && (r.innerText = n), this._headElt || (this._headElt = document.getElementsByTagName("head")[0]), this._headElt.appendChild(r), r;
},
sheet(e) {
this._head("link", {
type: "text/css",
media: "screen",
rel: "stylesheet",
href: e
});
},
inject(e) {
this._head("script", {
type: "text/javascript"
}, e);
},
_scripts: [],
script(e) {
this._inflight ? this._scripts.push(e) : this._script(e);
},
_require(e) {},
_script(e) {
  this._inflight = !0;

  var t = this._head("script", {
  type: "text/javascript",
  src: e
  });

  var n = this;
  enyo.platform.ie && enyo.platform.ie <= 8 ? t.onreadystatechange = () => {
  if (t.readyState === "complete" || t.readyState === "loaded") t.onreadystatechange = "", n._loaded(e);
  } : (t.onload = () => {
  n._loaded(e);
  }, t.onerror = () => {
  n._error(e);
  });
},
_continue() {
this._inflight = !1;
var e = this._scripts.pop();
e && this._script(e);
},
_loaded(e) {
this._continue();
},
_error(e) {
this._continue();
}
};

// AnalyzerDebug.js

enyo.kind({
name: "AnalyzerDebug",
kind: null,
debug: !1,
_level: 0,
methodName(e) {
var t = this.getStackInfo(3 + (e || 0));
return t = t.replace(/ .http:.*$/g, ""), t = t.replace(/^.*.enyo.kind/g, this.kindName), t += "                                                                    ", t.substr(0, 30);
},
getCurrentStackInfo(e) {
return " current: " + this.getStackInfo(3 + (e || 0));
},
getPreviousStackInfo(e) {
return " previous: " + this.getStackInfo(4 + (e || 0));
},
getStackInfo(e) {
try {
throw new Error;
} catch (t) {
var n = t.stack;
if (n) {
var r = n.split("\n");
return r[e];
}
return "(stack trace not available)";
}
},
showLevel() {
return "#####################################".substr(0, this._level) + " ";
},
incremLevel() {
return this._level++, this.showLevel() + " --> ";
},
decremLevel() {
var e = this.showLevel() + " <-- ";
return this._level--, e;
},
showIterator(e) {
return e ? "[" + e.ID + "/" + e.i + "] " : "";
},
logMethodEntry(e, t) {
t = t || "", enyo.log(this.methodName(1) + this.incremLevel() + this.showIterator(e) + t + this.getPreviousStackInfo(1));
},
logMethodExit(e, t) {
t = t || "", enyo.log(this.methodName(1) + this.decremLevel() + this.showIterator(e) + t + this.getCurrentStackInfo(1));
},
logProcessing(e, t) {
enyo.log(this.methodName(1) + this.showLevel() + this.showIterator(e) + "PROCESSING kind: " + t.kind + " >>" + t.token + "<< line: " + t.line + this.getCurrentStackInfo(1));
},
logIterMsg(e, t) {
enyo.log(this.methodName(1) + this.showLevel() + this.showIterator(e) + t + this.getPreviousStackInfo(1));
},
logMsg(e) {
enyo.log(this.methodName(1) + this.showLevel() + e + this.getPreviousStackInfo(1));
},
statics: {
_debugEnabled: !1
}
});

// Walker.js

enyo.kind({
name: "Walker",
kind: enyo.Component,
published: {
verbose: !1
},
events: {
onProgress: "",
onFinish: ""
},
walk(e) {
this.loader = new enyo.loaderFactory(runtimeMachine), this.loader.loadScript = () => {}, this.loader.loadSheet = () => {}, this.loader.verbose = this.verbose, this.loader.report = enyo.bind(this, "walkReport"), this.loader.finish = enyo.bind(this, "walkFinish"), enyo.loader = this.loader;
var t = enyo.path.rewrite(e);
return enyo.asyncMethod(enyo.loader, "load", t), this.async = new enyo.Async;
},
walkReport(e, t) {
this.doProgress({
action: e,
name: t
});
},
walkFinish() {
this.modules = this.loader.modules, this.async.respond({
modules: this.modules
}), this.doFinish({
modules: this.modules
});
}
});

// Reader.js

enyo.kind({
name: "Reader",
kind: enyo.Async,
go(e) {
return this.modules = e.modules, this.moduleIndex = 0, enyo.asyncMethod(this, "nextModule"), this;
},
nextModule() {
var e = this.modules[this.moduleIndex++];
e ? this.loadModule(e) : this.modulesFinished();
},
loadModule(e) {
enyo.xhr.request({
url: e.path,
callback: enyo.bind(this, "moduleLoaded", e)
});
},
moduleLoaded(e, t) {
this.addModule(e, t), this.nextModule();
},
addModule(e, t) {
t && t.length && (e.code = t);
},
modulesFinished() {
this.respond({
modules: this.modules
});
}
});

// Iterator.js

enyo.kind({
name: "Iterator",
kind: null,
i: -1,
nodes: null,
constructor(e) {
this.ID = Iterator._objectCount++, this.stream = e;
},
statics: {
_objectCount: 0
},
next() {
return this.i++, this._read();
},
prev() {
return this.i--, this._read();
},
_read(e) {
return this.past = this.stream[this.i - 1], this.value = this.stream[this.i], this.future = this.stream[this.i + 1], this.value;
}
});

// Lexer.js

enyo.kind({
name: "AbstractLexer",
kind: null,
constructor(e) {
if (e) return this.start(e), this.finish(), this.r;
},
p0: 0,
p: 0,
start(e) {
this.s = e, this.l = this.s.length, this.r = [], this.d = "", this.p0 = 0, this.p = 0, this.n = 0, this.analyze();
},
search(e) {
var t = e.global ? e : new RegExp(e.source, "g");
return t.lastIndex = this.p, this.m = t.exec(this.s), this.p = this.m ? this.m.index : -1, t.lastIndex != this.p0 && (this.d = this.s.charAt(this.p));
},
lookahead(e) {
return this.s.charAt(this.p + e);
},
getToken() {
return this.s.slice(this.p0, this.p);
},
tokenize(e) {
this.p += e || 0;
},
pushToken(e, t, n) {
  this.tokenize(t);
  var r = this.getToken();
  if (!r && !n) return {};
  var i = (r.match(/\n/g) || []).length;

  var s = {
  kind: e,
  token: r,
  start: this.p0,
  end: this.p,
  line: this.n,
  height: i
  };

  return this.r.push(s), this.n += i, this.p0 = this.p, s;
},
tossToken(e) {
this.tokenize(e), this.p0 = this.p;
},
finish() {
this.pushToken("gah");
}
}), enyo.kind({
name: "Lexer",
kind: AbstractLexer,
symbols: "(){}[];,:<>+-=*/&",
operators: [ "++", "--", "+=", "-=", "==", "!=", "<=", ">=", "===", "&&", "||", '"', "'" ],
keywords: [ "function", "new", "return", "if", "else", "while", "do", "break", "continue", "switch", "case", "var" ],
constructor(e) {
return this.buildPattern(), this.inherited(arguments);
},
buildPattern() {
  var e = '"(?:\\\\"|[^"])*?"';
  var t = "'(?:\\\\'|[^'])*?'";
  var n = e + "|" + t;
  var r = "\\b(?:" + this.keywords.join("|") + ")\\b";
  var i = "[\\" + this.symbols.split("").join("\\") + "]";
  var s = [];
  for (var o = 0, u; u = this.operators[o]; o++) s.push("\\" + u.split("").join("\\"));
  s = s.join("|"), i = s + "|" + i;
  var a = [ '\\\\"|\\\\/', n, r, "\\/\\/", "\\/\\*", i, "\\s" ];
  this.matchers = [ "doSymbol", "doString", "doKeyword", "doLineComment", "doCComment", "doSymbol", "doWhitespace" ], this.pattern = "(" + a.join(")|(") + ")";
},
analyze() {
var e = new RegExp(this.pattern, "gi");
while (this.search(e)) this.pushToken("identifier"), this.process(this.matchers), this.pushToken("identifier");
},
process(e) {
for (var t = 0, n; n = e[t]; t++) if (this.m[t + 1] && this[n]) {
this[n].apply(this);
return;
}
this.doSymbol();
},
doWhitespace() {
this.tokenize(1), this.search(/\S/g), this.pushToken("ws"), this.r.pop();
},
doEscape() {
this.tokenize(2);
},
doLiteral() {
  this.tossToken(1);
  var e = this.d;
  var t = new RegExp("\\" + e + "|\\\\", "g");
  while (this.search(t)) switch (this.d) {
  case "\\":
  this.doEscape();
  break;
  default:
  this.pushToken("literal", 0, !0).delimiter = e, this.tossToken(1);
  return;
  }
},
doSymbol() {
this.pushToken(this.d == ";" || this.d == "," ? "terminal" : "symbol", this.m[0].length);
},
doKeyword() {
this.pushToken("keyword", this.m[0].length);
},
doLineComment() {
this.tokenize(2), this.search(/[\r\n]/g) && this.tokenize(0), this.pushToken("comment");
},
doCComment() {
this.tokenize(2);
var e = 1;
while (e && this.search(/\/\*|\*\//g)) e += this.d == "/" ? 1 : this.d == "*" ? -1 : 0, this.tokenize(2);
this.pushToken("comment");
},
doString() {
this.pushToken("string", this.m[0].length);
}
});

// Parser.js

enyo.kind({
name: "Parser",
kind: "AnalyzerDebug",
constructor(e) {
return this.debug = AnalyzerDebug._debugEnabled, this.parse(e);
},
parse(e) {
  var t = [];
  var n = new Iterator(e);
  while (n.next()) n.value.kind !== "ws" && t.push(n.value);
  var n = new Iterator(t);
  return this.walk(n);
},
combine(e) {
var t = "";
for (var n = 0, r; r = e[n]; n++) t += r.token;
return t;
},
walk(e, t) {
  this.debug && this.logMethodEntry(e, "inState " + t + " >>" + JSON.stringify(e.value) + "<<");
  var n = [];
  var r;
  try {
  while (e.next()) {
  r = e.value, this.debug && this.logProcessing(e, r);
  if (r.kind == "ws") continue;
  if (r.kind == "comment") r.kind = "comment"; else if (t == "array") {
  if (r.kind == "terminal") continue;
  e.prev();
  var i = e.value;
  r = {
  kind: "element",
  token: "expr",
  children: this.walk(e, "expression")
  };
  if (e.value && e.value.token == "]" || e.value && e.value === i) return r.children.length && n.push(r), this.debug && this.logMethodExit(e), n;
  } else if (r.token == "[") r.kind = "array", r.children = this.walk(e, r.kind), e.value ? r.end = e.value.end : this.debug && this.logIterMsg(e, "No end token for array?"); else {
  if (t == "expression" && r.token == "]") return this.debug && this.logMethodExit(e), n;
  if (r.token == "var") r.kind = "var", r.children = this.walk(e, "expression"); else {
  if (r.kind == "terminal" && (t == "expression" || t == "var")) return this.debug && this.logMethodExit(e), n;
  if (r.kind == "terminal") continue;
  if (r.token == "{") {
  r.kind = "block", this.debug && this.logIterMsg(e, "PROCESS BLOCK - START"), r.children = this.walk(e, r.kind), this.debug && this.logIterMsg(e, "PROCESS BLOCK - END"), e.value ? r.end = e.value.end : this.debug && this.logIterMsg(e, "No end token for block?"), r.commaTerminated = this.isCommaTerminated(e);
  if (t == "expression" || t == "function") return n.push(r), this.debug && this.logMethodExit(e), n;
  } else {
  if (t == "expression" && (r.token == "}" || r.token == ")")) return e.prev(), this.debug && this.logMethodExit(e), n;
  if (t == "block" && r.token == "}") return this.debug && this.logMethodExit(e), n;
  if (r.token == "=" || r.token == ":" && t != "expression") {
  var s = n.pop();
  s.kind == "identifier" ? (s.op = r.token, s.kind = "assignment", s.children = this.walk(e, "expression"), e.value && e.value.kind == "terminal" && (s.commaTerminated = e.value.token === ",", e.prev()), r = s) : n.push(s);
  } else if (r.token == "(") r.kind = "association", r.children = this.walk(e, r.kind); else {
  if (t == "association" && r.token == ")") return this.debug && this.logMethodExit(e), n;
  if (r.token == "function") {
  r.kind = "function", this.debug && this.logIterMsg(e, "PROCESS FUNCTION - START"), r.children = this.walk(e, r.kind), this.debug && this.logIterMsg(e, "PROCESS FUNCTION - END"), (!e.value || e.value.kind !== "symbol" || e.value.token !== "}") && this.debug && this.logIterMsg(e, "No end token for function?");
  if (t !== "expression" && r.children && r.children.length && r.children[0].kind == "identifier") {
  this.debug && this.logIterMsg(e, "C-Style function"), r.name = r.children[0].token, r.children.shift();
  var o = {
  kind: "assignment",
  token: r.name,
  children: [ r ]
  };
  r = o;
  }
  if (t == "expression" || t == "function") return r.commaTerminated = this.isCommaTerminated(e), n.push(r), this.debug && this.logMethodExit(e), n;
  }
  }
  }
  }
  }
  this.debug && this.logIterMsg(e, "PUSH NODE"), n.push(r);
  }
  } catch (u) {
  console.error(u);
  }
  return this.debug && this.logMethodExit(e), n;
},
isCommaTerminated(e) {
commaPresent = !1;
var t = e.next();
return t && (commaPresent = t.kind === "terminal" && t.token === ","), e.prev(), commaPresent;
}
});

// Documentor.js

enyo.kind({
name: "Documentor",
kind: "AnalyzerDebug",
group: "public",
constructor(e) {
return this.comment = [], this.debug = AnalyzerDebug._debugEnabled, this.parse(e);
},
parse(e) {
var t = new Iterator(e);
return this.walk(t);
},
walk(e, t) {
  var n = [];
  var r;
  var i;
  this.debug && this.logMethodEntry(e, "inState " + t + " >>" + JSON.stringify(e.value) + "<<");
  while (e.next()) {
  r = e.value, this.debug && this.logProcessing(e, r);
  if (r.kind == "comment") this.cook_comment(r.token); else if (r.token == "enyo.kind" && e.future.kind == "association") i = this.cook_kind(e); else if (r.kind == "assignment") i = this.cook_assignment(e); else if (r.kind == "association" && r.children && r.children.length == 1 && r.children[0].kind == "function") {
  var s = r.children[0];
  if (s.children && s.children.length == 2) {
    var o = s.children[1];
    var u = this.walk(new Iterator(o.children));
    n = n.concat(u);
  }
  e.next();
  }
  i && (n.push(i), i = null);
  }
  return this.debug && this.logMethodExit(e), n;
},
cook_kind(e) {
  this.debug && this.logMethodEntry(e, ">>" + JSON.stringify(e.value) + "<<");

  var t = (e, t) => {
  var n = Documentor.indexByName(e, t), r;
  return n >= 0 && (r = e[n], e.splice(r, 1)), r && r.value && r.value.length && r.value[0].token;
  };

  var n = this.make("kind", e.value);
  e.next();
  var r = e.value.children;
  return r && r[0] && r[0].kind == "block" && (n.properties = this.cook_block(r[0].children), n.name = Documentor.stripQuotes(t(n.properties, "name") || ""), n.superkind = Documentor.stripQuotes(t(n.properties, "kind") || "enyo.Control"), n.superkind == "null" && (n.superkind = null), n.block = {
  start: r[0].start,
  end: r[0].end
  }), this.debug && this.logMethodExit(e), n;
},
cook_block(e) {
this.debug && this.logMethodEntry();
var t = [];
for (var n = 0, r; r = e[n]; n++) {
this.debug && this.logProcessing(null, r);
if (r.kind == "comment") this.cook_comment(r.token); else if (r.kind == "assignment") {
var i = this.make("property", r);
r.children && (i.value = [ this.walkValue(new Iterator(r.children)) ], r.commaTerminated === undefined ? (i.commaTerminated = r.children[0].commaTerminated || !1, r.children[0].commaTerminated === undefined && this.debug && this.logMsg("NO COMMA TERMINATED INFO")) : i.commaTerminated = r.commaTerminated), t.push(i);
}
}
return this.debug && this.logMethodExit(), t;
},
walkValue(e, t) {
this.debug && this.logMethodEntry(e, "inState: " + t + " >>" + JSON.stringify(e.value) + "<<");
while (e.next()) {
  var n = e.value;
  var r;
  this.debug && this.logProcessing(e, n);
  if (n.kind != "comment") {
  if (n.kind == "block") return r = this.make("block", n), r.properties = this.cook_block(n.children), this.debug && this.logMethodExit(e, "inState: " + t + " >>" + JSON.stringify(e.value) + "<<"), r;
  if (n.kind == "array") return r = this.cook_array(e), this.debug && this.logMethodExit(e), r;
  if (n.kind == "function") return r = this.cook_function(e), this.debug && this.logMethodExit(e, "inState: " + t + " >>" + JSON.stringify(e.value) + "<<"), r;
  r = this.make("expression", n);
  var i = n.token;
  while (e.next()) i += e.value.token;
  return r.token = i, this.debug && this.logMethodExit(e), r;
  }
  this.cook_comment(n.token);
}
this.debug && this.logMethodExit(e);
},
cook_function(e) {
  this.debug && this.logMethodEntry(e, ">>" + JSON.stringify(e.value) + "<<");
  var t = e.value;
  var n = this.make("expression", t);
  return n.commaTerminated = t.commaTerminated, n.arguments = enyo.map(t.children[0].children, e => e.token), this.debug && this.logMethodExit(e), n;
},
cook_array(e) {
  this.debug && this.logMethodEntry(e, ">>" + JSON.stringify(e.value) + "<<");
  var t = e.value;
  var n = this.make("array", t);
  var r = t.children;
  if (r) {
  var i = [];
  for (var s = 0, o, u; o = r[s]; s++) o.children && (u = this.walkValue(new Iterator(o.children)), u && i.push(u));
  n.properties = i;
  }
  return this.debug && this.logMethodExit(e), n;
},
cook_assignment(e) {
  this.debug && this.logMethodEntry(e, ">>" + JSON.stringify(e.value) + "<<");
  var t = e.value;
  var n = this.make("global", t);
  return t.children && (t.children[0] && t.children[0].token == "function" && (n.type = "function"), n.value = [ this.walkValue(new Iterator(t.children)) ]), this.debug && this.logMethodExit(), n;
},
make(e, t) {
return {
line: t.line,
start: t.start,
end: t.end,
height: t.height,
token: t.token,
name: t.token,
type: e,
group: this.group,
comment: this.consumeComment()
};
},
commentRx: /\/\*\*([\s\S]*)\*\/|\/\/\*(.*)/m,
cook_comment(e) {
this.debug && this.logMethodEntry();
var t = e.match(this.commentRx);
if (t) {
t = t[1] ? t[1] : t[2];
var n = this.extractPragmas(t);
this.honorPragmas(n);
}
this.debug && this.logMethodExit();
},
extractPragmas(e) {
  var t = /^[*\s]*@[\S\s]*/g;
  var n = [];
  var r = e;
  return r.length && (r = e.replace(t, e => {
  var t = e.slice(2);
  return n.push(t), "";
  }), r.length && this.comment.push(r)), n;
},
honorPragmas(e) {
var t = {
"protected": 1,
"public": 1
};
for (var n = 0, r; r = e[n]; n++) t[r] && (this.group = r);
},
consumeComment() {
var e = this.comment.join(" ");
this.comment = [];
var t = Documentor.removeIndent(e);
return t;
},
statics: {
indexByProperty(e, t, n) {
for (var r = 0, i; i = e[r]; r++) if (i[t] == n) return r;
return -1;
},
findByProperty(e, t, n) {
return e[this.indexByProperty(e, t, n)];
},
indexByName(e, t) {
return this.indexByProperty(e, "name", t);
},
findByName(e, t) {
return e[this.indexByName(e, t)];
},
stripQuotes(e) {
  var t = e.charAt(0);
  var n = t == '"' || t == "'" ? 1 : 0;
  var r = e.charAt(e.length - 1);
  var i = r == '"' || r == "'" ? -1 : 0;
  return n || i ? e.slice(n, i) : e;
},
removeIndent(e) {
  var t = 0;
  var n = e.split(/\r?\n/);
  var r;
  var i;
  for (r = 0; (i = n[r]) != null; r++) if (i.length > 0) {
  t = i.search(/\S/), t < 0 && (t = i.length);
  break;
  }
  if (t) for (r = 0; (i = n[r]) != null; r++) n[r] = i.slice(t);
  return n.join("\n");
}
}
});

// Indexer.js

enyo.kind({
name: "Indexer",
kind: null,
group: "public",
constructor() {
this.objects = [];
},
debug: !1,
findByName(e) {
return Documentor.findByProperty(this.objects, "name", e);
},
findByTopic(e) {
return Documentor.findByProperty(this.objects, "topic", e);
},
getKindList(e, t) {
this.debug && enyo.log("getEnyoKindList --> result - regexp: " + e + " group: " + t);
var n = [];
for (var r = 0, i; i = this.objects[r]; r++) i.type === "kind" && i.token === "enyo.kind" && i.group === t && e.test(i.name) && (this.debug && enyo.log("getEnyoKindList --> this.objects[" + r + "]: type: " + i.type + " token: " + i.token + " group: " + i.group + " name: " + i.name), n.push(i.name));
return n;
},
getFunctionList(e, t) {
var n = [];
for (var r = 0, i; i = this.objects[r]; r++) i.type === "function" && i.group === t && e.test(i.name) && n.push(i.name);
return n;
},
addModules(e) {
enyo.forEach(e, this.addModule, this), this.objects.sort(Indexer.nameCompare);
},
addModule(e) {
this.indexModule(e), this.mergeModule(e);
},
mergeModule(e) {
this.objects.push(e), this.objects = this.objects.concat(e.objects), enyo.forEach(e.objects, this.mergeProperties, this);
},
mergeProperties(e) {
e.properties ? this.objects = this.objects.concat(e.properties) : e.value && e.value[0] && e.value[0].properties && (this.objects = this.objects.concat(e.value[0].properties));
},
indexModule(e) {
e.type = "module", e.name = e.path ? e.path.replace("lib/", "") : e.label + "/" + e.rawPath, e.objects = new Documentor(new Parser(new Lexer(e.code))), this.indexObjects(e);
},
indexObjects(e) {
enyo.forEach(e.objects, function(t) {
t.module = e, this.indexObject(t);
}, this);
},
indexObject(e) {
switch (e.type) {
case "kind":
this.indexKind(e);
}
this.indexProperties(e);
},
indexProperties(e) {
var t = e.properties || e.value && e.value[0] && e.value[0].properties;
enyo.forEach(t, t => {
t.object = e, t.topic = t.object.name ? t.object.name + "::" + t.name : t.name;
}, this);
},
indexKind(e) {
this.listComponents(e), this.indexInheritance(e);
},
indexInheritance(e) {
e.superkinds = this.listSuperkinds(e), e.allProperties = this.listInheritedProperties(e);
},
listSuperkinds(e) {
  var t = [];
  var n;
  while (e && e.superkind) n = e.superkind, e = this.findByName(n), e || (e = this.findByName("enyo." + n), e && (n = "enyo." + n)), t.push(n);
  return t;
},
listInheritedProperties(e) {
  var t = [];
  var n = {};
  for (var r = e.superkinds.length - 1, i; i = e.superkinds[r]; r--) {
  var s = this.findByName(i);
  s && this.mergeInheritedProperties(s.properties, n, t);
  }
  return this.mergeInheritedProperties(e.properties, n, t), t.sort(Indexer.nameCompare), t;
},
mergeInheritedProperties(e, t, n) {
for (var r = 0, i; i = e[r]; r++) {
var s = t.hasOwnProperty(i.name) && t[i.name];
s ? (i.overrides = s, n[enyo.indexOf(s, n)] = i) : n.push(i), t[i.name] = i;
}
},
listComponents(e) {
e.components = this._listComponents(e, [], {});
var t = Documentor.findByName(e.properties, "components");
t && t.value && (e.componentsBlockStart = t.value[0].start, e.componentsBlockEnd = t.value[0].end);
},
_listComponents(e, t, n) {
var r = Documentor.findByName(e.properties, "components");
if (r && r.value && r.value.length) {
var i = r.value[0].properties;
for (var s = 0, o; o = i[s]; s++) {
var u = Documentor.findByName(o.properties, "name");
u && (u = Documentor.stripQuotes(u.value[0].token || ""));
var a = Documentor.findByName(o.properties, "kind");
a = Documentor.stripQuotes(a && a.value[0].token || "Control");
if (!u) {
var f = a.split(".").pop();
u = enyo.uncap(f), n[u] ? u += ++n[u] : n[u] = 1;
}
o.kind = a, o.name = u, t.push(o), this._listComponents(o, t, n);
}
}
return t;
},
statics: {
nameCompare(e, t) {
  var n = e.name.toLowerCase();
  var r = t.name.toLowerCase();
  return n < r ? -1 : n > r ? 1 : 0;
}
}
});

// Analyzer.js

enyo.kind({
name: "Analyzer",
kind: "Component",
events: {
onIndexReady: ""
},
create(...args) {
this.index = new Indexer, this.inherited(args);
},
analyze(e) {
this.walk(e);
},
walk(e) {
  var t = [];
  var n;

  var r = function(i, s) {
  if (s) {
  for (var o = 0; o < s.modules.length; ++o) s.modules[o].label = n;
  t = t.concat(s.modules);
  }
  var u = e.shift(), a = "";
  u ? (enyo.isString(u) || (n = u.label, u = u.path), (new Walker).walk(u).response(this, r)) : this.walkFinished(t);
  };

  r.call(this);
},
walkFinished(e) {
this.read(e);
},
read(e) {
(new Reader).go({
modules: e
}).response(this, function(e, t) {
this.indexModules(t.modules);
});
},
indexModules(e) {
this.index.addModules(e), this.doIndexReady();
}
});

// foss/showdown-v0.9/compressed/showdown.js

var Showdown = {};

Showdown.converter = function() {
  var e;
  var t;
  var n;
  var r = 0;
  this.makeHtml = r => (e = new Array, t = new Array, n = new Array, r = r.replace(/~/g, "~T"), r = r.replace(/\$/g, "~D"), r = r.replace(/\r\n/g, "\n"), r = r.replace(/\r/g, "\n"), r = "\n\n" + r + "\n\n", r = O(r), r = r.replace(/^[ \t]+$/mg, ""), r = s(r), r = i(r), r = u(r), r = L(r), r = r.replace(/~D/g, "$$"), r = r.replace(/~T/g, "~"), r);

  var i = n => {
  var n = n.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm, (n, r, i, s, o) => (r = r.toLowerCase(), e[r] = T(i), s ? s + o : (o && (t[r] = o.replace(/"/g, "&quot;")), "")));
  return n;
  };

  var s = e => {
  e = e.replace(/\n/g, "\n\n");
  var t = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del", n = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";
  return e = e.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, o), e = e.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, o), e = e.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, o), e = e.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, o), e = e.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, o), e = e.replace(/\n\n/g, "\n"), e;
  };

  var o = (e, t) => {
  var r = t;
  return r = r.replace(/\n\n/g, "\n"), r = r.replace(/^\n/, ""), r = r.replace(/\n+$/g, ""), r = "\n\n~K" + (n.push(r) - 1) + "K\n\n", r;
  };

  var u = e => {
  e = d(e);
  var t = y("<hr />");
  return e = e.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, t), e = e.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, t), e = e.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, t), e = m(e), e = g(e), e = S(e), e = s(e), e = x(e), e;
  };

  var a = e => (e = b(e), e = f(e), e = N(e), e = h(e), e = l(e), e = C(e), e = T(e), e = E(e), e = e.replace(/  +\n/g, " <br />\n"), e);

  var f = e => {
  var t = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;
  return e = e.replace(t, e => {
  var t = e.replace(/(.)<\/?code>(?=.)/g, "$1`");
  return t = M(t, "\\`*_"), t;
  }), e;
  };

  var l = e => (e = e.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, c), e = e.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, c), e = e.replace(/(\[([^\[\]]+)\])()()()()()/g, c), e);

  var c = (n, r, i, s, o, u, a, f) => {
  f == undefined && (f = "");
  var l = r, c = i, h = s.toLowerCase(), p = o, d = f;
  if (p == "") {
  h == "" && (h = c.toLowerCase().replace(/ ?\n/g, " ")), p = "#" + h;
  if (e[h] != undefined) p = e[h], t[h] != undefined && (d = t[h]); else {
  if (!(l.search(/\(\s*\)$/m) > -1)) return l;
  p = "";
  }
  }
  p = M(p, "*_");
  var v = '<a href="' + p + '"';
  return d != "" && (d = d.replace(/"/g, "&quot;"), d = M(d, "*_"), v += ' title="' + d + '"'), v += ">" + c + "</a>", v;
  };

  var h = e => (e = e.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, p), e = e.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, p), e);

  var p = (n, r, i, s, o, u, a, f) => {
  var l = r, c = i, h = s.toLowerCase(), p = o, d = f;
  d || (d = "");
  if (p == "") {
  h == "" && (h = c.toLowerCase().replace(/ ?\n/g, " ")), p = "#" + h;
  if (e[h] == undefined) return l;
  p = e[h], t[h] != undefined && (d = t[h]);
  }
  c = c.replace(/"/g, "&quot;"), p = M(p, "*_");
  var v = '<img src="' + p + '" alt="' + c + '"';
  return d = d.replace(/"/g, "&quot;"), d = M(d, "*_"), v += ' title="' + d + '"', v += " />", v;
  };

  var d = e => (e = e.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm, (e, t) => y("<h1>" + a(t) + "</h1>")), e = e.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm, (e, t) => y("<h2>" + a(t) + "</h2>")), e = e.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, (e, t, n) => {
  var r = t.length;
  return y("<h" + r + ">" + a(n) + "</h" + r + ">");
  }), e);

  var v;

  var m = e => {
  e += "~0";
  var t = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
  return r ? e = e.replace(t, (e, t, n) => {
  var r = t, i = n.search(/[*+-]/g) > -1 ? "ul" : "ol";
  r = r.replace(/\n{2,}/g, "\n\n\n");
  var s = v(r);
  return s = s.replace(/\s+$/, ""), s = "<" + i + ">" + s + "</" + i + ">\n", s;
  }) : (t = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g, e = e.replace(t, (e, t, n, r) => {
  var i = t, s = n, o = r.search(/[*+-]/g) > -1 ? "ul" : "ol", s = s.replace(/\n{2,}/g, "\n\n\n"), u = v(s);
  return u = i + "<" + o + ">\n" + u + "</" + o + ">\n", u;
  })), e = e.replace(/~0/, ""), e;
  };

  v = e => (r++, e = e.replace(/\n{2,}$/, "\n"), e += "~0", e = e.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm, (e, t, n, r, i) => {
    var s = i;
    var o = t;
    var f = n;
    return o || s.search(/\n{2,}/) > -1 ? s = u(A(s)) : (s = m(A(s)), s = s.replace(/\n$/, ""), s = a(s)), "<li>" + s + "</li>\n";
  }), e = e.replace(/~0/g, ""), r--, e);

  var g = e => (e += "~0", e = e.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, (e, t, n) => {
  var r = t, i = n;
  return r = w(A(r)), r = O(r), r = r.replace(/^\n+/g, ""), r = r.replace(/\n+$/g, ""), r = "<pre><code>" + r + "\n</code></pre>", y(r) + i;
  }), e = e.replace(/~0/, ""), e);

  var y = e => (e = e.replace(/(^\n+|\n+$)/g, ""), "\n\n~K" + (n.push(e) - 1) + "K\n\n");

  var b = e => (e = e.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, (e, t, n, r, i) => {
  var s = r;
  return s = s.replace(/^([ \t]*)/g, ""), s = s.replace(/[ \t]*$/g, ""), s = w(s), t + "<code>" + s + "</code>";
  }), e);

  var w = e => (e = e.replace(/&/g, "&amp;"), e = e.replace(/</g, "&lt;"), e = e.replace(/>/g, "&gt;"), e = M(e, "*_{}[]\\", !1), e);
  var E = e => (e = e.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, "<strong>$2</strong>"), e = e.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, "<em>$2</em>"), e);

  var S = e => (e = e.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm, (e, t) => {
  var n = t;
  return n = n.replace(/^[ \t]*>[ \t]?/gm, "~0"), n = n.replace(/~0/g, ""), n = n.replace(/^[ \t]+$/gm, ""), n = u(n), n = n.replace(/(^|\n)/g, "$1  "), n = n.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, (e, t) => {
  var n = t;
  return n = n.replace(/^  /mg, "~0"), n = n.replace(/~0/g, ""), n;
  }), y("<blockquote>\n" + n + "\n</blockquote>");
  }), e);

  var x = e => {
  e = e.replace(/^\n+/g, ""), e = e.replace(/\n+$/g, "");
  var t = e.split(/\n{2,}/g), r = new Array, i = t.length;
  for (var s = 0; s < i; s++) {
  var o = t[s];
  o.search(/~K(\d+)K/g) >= 0 ? r.push(o) : o.search(/\S/) >= 0 && (o = a(o), o = o.replace(/^([ \t]*)/g, "<p>"), o += "</p>", r.push(o));
  }
  i = r.length;
  for (var s = 0; s < i; s++) while (r[s].search(/~K(\d+)K/) >= 0) {
  var u = n[RegExp.$1];
  u = u.replace(/\$/g, "$$$$"), r[s] = r[s].replace(/~K\d+K/, u);
  }
  return r.join("\n\n");
  };

  var T = e => (e = e.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;"), e = e.replace(/<(?![a-z\/?\$!])/gi, "&lt;"), e);
  var N = e => (e = e.replace(/\\(\\)/g, _), e = e.replace(/\\([`*_{}\[\]()>#+-.!])/g, _), e);
  var C = e => (e = e.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, '<a href="$1">$1</a>'), e = e.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, (e, t) => k(L(t))), e);

  var k = e => {
  function t(e) {
  var t = "0123456789ABCDEF", n = e.charCodeAt(0);
  return t.charAt(n >> 4) + t.charAt(n & 15);
  }
  var n = [ e => "&#" + e.charCodeAt(0) + ";", e => "&#x" + t(e) + ";", e => e ];
  return e = "mailto:" + e, e = e.replace(/./g, e => {
  if (e == "@") e = n[Math.floor(Math.random() * 2)](e); else if (e != ":") {
  var t = Math.random();
  e = t > .9 ? n[2](e) : t > .45 ? n[1](e) : n[0](e);
  }
  return e;
  }), e = '<a href="' + e + '">' + e + "</a>", e = e.replace(/">.+:/g, '">'), e;
  };

  var L = e => (e = e.replace(/~E(\d+)E/g, (e, t) => {
  var n = parseInt(t);
  return String.fromCharCode(n);
  }), e);

  var A = e => (e = e.replace(/^(\t|[ ]{1,4})/gm, "~0"), e = e.replace(/~0/g, ""), e);

  var O = e => (e = e.replace(/\t(?=\t)/g, "    "), e = e.replace(/\t/g, "~A~B"), e = e.replace(/~B(.+?)~A/g, (e, t, n) => {
  var r = t, i = 4 - r.length % 4;
  for (var s = 0; s < i; s++) r += " ";
  return r;
  }), e = e.replace(/~A/g, "    "), e = e.replace(/~B/g, ""), e);

  var M = (e, t, n) => {
  var r = "([" + t.replace(/([\[\]\\])/g, "\\$1") + "])";
  n && (r = "\\\\" + r);
  var i = new RegExp(r, "g");
  return e = e.replace(i, _), e;
  };

  var _ = (e, t) => {
  var n = t.charCodeAt(0);
  return "~E" + n + "E";
  };
};

// foss/syntaxhighlighter_3.0.83_fork/sh-min.js

var XRegExp;

if (XRegExp) throw Error("can't load XRegExp twice in the same frame");

((() => {
  function e(e, n) {
  if (!XRegExp.isRegExp(e)) throw TypeError("type RegExp expected");
  var r = e._xregexp;
  return e = XRegExp(e.source, t(e) + (n || "")), r && (e._xregexp = {
  source: r.source,
  captureNames: r.captureNames ? r.captureNames.slice(0) : null
  }), e;
  }
  function t(e) {
  return (e.global ? "g" : "") + (e.ignoreCase ? "i" : "") + (e.multiline ? "m" : "") + (e.extended ? "x" : "") + (e.sticky ? "y" : "");
  }
  function n(e, t, n, r) {
    var i = a.length;
    var s;
    var o;
    var f;
    u = !0;
    try {
    while (i--) {
    f = a[i];
    if (n & f.scope && (!f.trigger || f.trigger.call(r))) {
    f.pattern.lastIndex = t, o = f.pattern.exec(e);
    if (o && o.index === t) {
    s = {
    output: f.handler.call(r, o, n),
    match: o
    };
    break;
    }
    }
    }
    } catch (l) {
    throw l;
    } finally {
    u = !1;
    }
    return s;
  }
  function r(e, t, n) {
  if (Array.prototype.indexOf) return e.indexOf(t, n);
  for (var r = n || 0; r < e.length; r++) if (e[r] === t) return r;
  return -1;
  }
  XRegExp = (t, r) => {
    var i = [];
    var o = XRegExp.OUTSIDE_CLASS;
    var a = 0;
    var l;
    var c;
    var h;
    var p;
    var v;
    if (XRegExp.isRegExp(t)) {
    if (r !== undefined) throw TypeError("can't supply flags when constructing one RegExp from another");
    return e(t);
    }
    if (u) throw Error("can't call the XRegExp constructor within token definition functions");
    r = r || "", l = {
    hasNamedCapture: !1,
    captureNames: [],
    hasFlag(e) {
    return r.indexOf(e) > -1;
    },
    setFlag(e) {
    r += e;
    }
    };
    while (a < t.length) c = n(t, a, o, l), c ? (i.push(c.output), a += c.match[0].length || 1) : (h = f.exec.call(d[o], t.slice(a))) ? (i.push(h[0]), a += h[0].length) : (p = t.charAt(a), p === "[" ? o = XRegExp.INSIDE_CLASS : p === "]" && (o = XRegExp.OUTSIDE_CLASS), i.push(p), a++);
    return v = RegExp(i.join(""), f.replace.call(r, s, "")), v._xregexp = {
    source: t,
    captureNames: l.hasNamedCapture ? l.captureNames : null
    }, v;
  }, XRegExp.version = "1.5.0", XRegExp.INSIDE_CLASS = 1, XRegExp.OUTSIDE_CLASS = 2;
  var i = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g;
  var s = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g;
  var o = /^(?:[?*+]|{\d+(?:,\d*)?})\??/;
  var u = !1;
  var a = [];

  var f = {
  exec: RegExp.prototype.exec,
  test: RegExp.prototype.test,
  match: String.prototype.match,
  replace: String.prototype.replace,
  split: String.prototype.split
  };

  var l = f.exec.call(/()??/, "")[1] === undefined;

  var c = (() => {
  var e = /^/g;
  return f.test.call(e, ""), !e.lastIndex;
  })();

  var h = (() => {
  var e = /x/g;
  return f.replace.call("x", e, ""), !e.lastIndex;
  })();

  var p = RegExp.prototype.sticky !== undefined;
  var d = {};
  d[XRegExp.INSIDE_CLASS] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/, d[XRegExp.OUTSIDE_CLASS] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/, XRegExp.addToken = (t, n, r, i) => {
  a.push({
  pattern: e(t, "g" + (p ? "y" : "")),
  handler: n,
  scope: r || XRegExp.OUTSIDE_CLASS,
  trigger: i || null
  });
  }, XRegExp.cache = (e, t) => {
  var n = e + "/" + (t || "");
  return XRegExp.cache[n] || (XRegExp.cache[n] = XRegExp(e, t));
  }, XRegExp.copyAsGlobal = t => e(t, "g"), XRegExp.escape = e => e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), XRegExp.execAt = (t, n, r, i) => {
  n = e(n, "g" + (i && p ? "y" : "")), n.lastIndex = r = r || 0;
  var s = n.exec(t);
  return i ? s && s.index === r ? s : null : s;
  }, XRegExp.freezeTokens = () => {
  XRegExp.addToken = () => {
  throw Error("can't run addToken after freezeTokens");
  };
  }, XRegExp.isRegExp = e => Object.prototype.toString.call(e) === "[object RegExp]", XRegExp.iterate = (t, n, r, i) => {
    var s = e(n, "g");
    var o = -1;
    var u;
    while (u = s.exec(t)) r.call(i, u, ++o, t, s), s.lastIndex === u.index && s.lastIndex++;
    n.global && (n.lastIndex = 0);
  }, XRegExp.matchChain = (t, n) => function r(t, i) {
    var s = n[i].regex ? n[i] : {
    regex: n[i]
    };

    var o = e(s.regex, "g");
    var u = [];
    var a;
    for (a = 0; a < t.length; a++) XRegExp.iterate(t[a], o, e => {
    u.push(s.backref ? e[s.backref] || "" : e[0]);
    });
    return i === n.length - 1 || !u.length ? u : r(u, i + 1);
  }([ t ], 0), RegExp.prototype.apply = function(e, t) {
  return this.exec(t[0]);
  }, RegExp.prototype.call = function(e, t) {
  return this.exec(t);
  }, RegExp.prototype.exec = function(e) {
    var n = f.exec.apply(this, arguments);
    var i;
    var s;
    if (n) {
    !l && n.length > 1 && r(n, "") > -1 && (s = RegExp(this.source, f.replace.call(t(this), "g", "")), f.replace.call(e.slice(n.index), s, function(...args) {
    for (var e = 1; e < args.length - 2; e++) args[e] === undefined && (n[e] = undefined);
    }));
    if (this._xregexp && this._xregexp.captureNames) for (var o = 1; o < n.length; o++) i = this._xregexp.captureNames[o - 1], i && (n[i] = n[o]);
    !c && this.global && !n[0].length && this.lastIndex > n.index && this.lastIndex--;
    }
    return n;
  }, c || (RegExp.prototype.test = function(e) {
  var t = f.exec.call(this, e);
  return t && this.global && !t[0].length && this.lastIndex > t.index && this.lastIndex--, !!t;
  }), String.prototype.match = function(e) {
  XRegExp.isRegExp(e) || (e = RegExp(e));
  if (e.global) {
  var t = f.match.apply(this, arguments);
  return e.lastIndex = 0, t;
  }
  return e.exec(this);
  }, String.prototype.replace = function(e, t) {
    var n = XRegExp.isRegExp(e);
    var s;
    var o;
    var u;
    return n && typeof t.valueOf() == "string" && t.indexOf("${") === -1 && h ? f.replace.apply(this, arguments) : (n ? e._xregexp && (s = e._xregexp.captureNames) : e += "", typeof t == "function" ? o = f.replace.call(this, e, function(...args) {
    if (s) {
    args[0] = new String(args[0]);
    for (var r = 0; r < s.length; r++) s[r] && (args[0][s[r]] = args[r + 1]);
    }
    return n && e.global && (e.lastIndex = args[args.length - 2] + args[0].length), t(...args);
    }) : (u = this + "", o = f.replace.call(u, e, function(...args) {
    var e = args;
    return f.replace.call(t, i, (t, n, i) => {
    if (!n) {
    var o = +i;
    return o <= e.length - 3 ? e[o] : (o = s ? r(s, i) : -1, o > -1 ? e[o + 1] : t);
    }
    switch (n) {
    case "$":
    return "$";
    case "&":
    return e[0];
    case "`":
    return e[e.length - 1].slice(0, e[e.length - 2]);
    case "'":
    return e[e.length - 1].slice(e[e.length - 2] + e[0].length);
    default:
    var u = "";
    n = +n;
    if (!n) return t;
    while (n > e.length - 3) u = String.prototype.slice.call(n, -1) + u, n = Math.floor(n / 10);
    return (n ? e[n] || "" : "$") + u;
    }
    });
    })), n && e.global && (e.lastIndex = 0), o);
  }, String.prototype.split = function(e, t) {
    if (!XRegExp.isRegExp(e)) return f.split.apply(this, arguments);
    var n = this + "";
    var r = [];
    var i = 0;
    var s;
    var o;
    if (t === undefined || +t < 0) t = Infinity; else {
    t = Math.floor(+t);
    if (!t) return [];
    }
    e = XRegExp.copyAsGlobal(e);
    while (s = e.exec(n)) {
    if (e.lastIndex > i) {
    r.push(n.slice(i, s.index)), s.length > 1 && s.index < n.length && Array.prototype.push.apply(r, s.slice(1)), o = s[0].length, i = e.lastIndex;
    if (r.length >= t) break;
    }
    e.lastIndex === s.index && e.lastIndex++;
    }
    return i === n.length ? (!f.test.call(e, "") || o) && r.push("") : r.push(n.slice(i)), r.length > t ? r.slice(0, t) : r;
  }, XRegExp.addToken(/\(\?#[^)]*\)/, e => f.test.call(o, e.input.slice(e.index + e[0].length)) ? "" : "(?:)"), XRegExp.addToken(/\((?!\?)/, function() {
  return this.captureNames.push(null), "(";
  }), XRegExp.addToken(/\(\?<([$\w]+)>/, function(e) {
  return this.captureNames.push(e[1]), this.hasNamedCapture = !0, "(";
  }), XRegExp.addToken(/\\k<([\w$]+)>/, function(e) {
  var t = r(this.captureNames, e[1]);
  return t > -1 ? "\\" + (t + 1) + (isNaN(e.input.charAt(e.index + e[0].length)) ? "" : "(?:)") : e[0];
  }), XRegExp.addToken(/\[\^?]/, e => e[0] === "[]" ? "\\b\\B" : "[\\s\\S]"), XRegExp.addToken(/^\(\?([imsx]+)\)/, function(e) {
  return this.setFlag(e[1]), "";
  }), XRegExp.addToken(/(?:\s+|#.*)+/, e => f.test.call(o, e.input.slice(e.index + e[0].length)) ? "" : "(?:)", XRegExp.OUTSIDE_CLASS, function() {
  return this.hasFlag("x");
  }), XRegExp.addToken(/\./, () => "[\\s\\S]", XRegExp.OUTSIDE_CLASS, function() {
  return this.hasFlag("s");
  });
}))();

var SyntaxHighlighter = (() => {
function e(e) {
return e.split("\n");
}
function t(e, t, n) {
n = Math.max(n || 0, 0);
for (var r = n; r < e.length; r++) if (e[r] == t) return r;
return -1;
}
function n(e, t) {
  var n = {};
  var r;
  for (r in e) n[r] = e[r];
  for (r in t) n[r] = t[r];
  return n;
}
function r(e) {
var t = {
"true": !0,
"false": !1
}[e];
return t == null ? e : t;
}
function i(t, n) {
var r = e(t);
for (var i = 0; i < r.length; i++) r[i] = n(r[i], i);
return r.join("\n");
}
function s(e) {
return e.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g, "");
}
function o(e, t) {
return e == null || e.length == 0 || e == "\n" ? e : (e = e.replace(/</g, "&lt;"), e = e.replace(/ {2,}/g, e => {
var t = "";
for (var n = 0; n < e.length - 1; n++) t += m.config.space;
return t + " ";
}), t != null && (e = i(e, e => {
if (e.length == 0) return "";
var n = "";
return e = e.replace(/^(&nbsp;| )+/, e => (n = e, "")), e.length == 0 ? n : n + '<code class="' + t + '">' + e + "</code>";
})), e);
}
function u(e, t) {
var n = e.toString();
while (n.length < t) n = "0" + n;
return n;
}
function a(e, t) {
var n = "";
for (var r = 0; r < t; r++) n += " ";
return e.replace(/\t/g, n);
}
function f(t, n) {
  function r(e, t, n) {
  return e.substr(0, t) + u.substr(0, n) + e.substr(t + 1, e.length);
  }
  var s = e(t);
  var o = "	";
  var u = "";
  for (var a = 0; a < 50; a++) u += "                    ";
  return t = i(t, e => {
  if (e.indexOf(o) == -1) return e;
  var t = 0;
  while ((t = e.indexOf(o)) != -1) {
  var i = n - t % n;
  e = r(e, t, i);
  }
  return e;
  }), t;
}
function l(e) {
var t = /<br\s*\/?>|&lt;br\s*\/?&gt;/gi;
return e = e.replace(t, "\n"), m.config.stripBrs == 1 && (e = e.replace(t, "")), e;
}
function c(e) {
return e.replace(/^\s+|\s+$/g, "");
}
function h(t) {
  var n = e(l(t));
  var r = new Array;
  var i = /^\s*/;
  var s = 1e3;
  for (var o = 0; o < n.length && s > 0; o++) {
  var u = n[o];
  if (c(u).length == 0) continue;
  var a = i.exec(u);
  if (a == null) return t;
  s = Math.min(a[0].length, s);
  }
  if (s > 0) for (var o = 0; o < n.length; o++) n[o] = n[o].substr(s);
  return n.join("\n");
}
function p(e, t) {
return e.index < t.index ? -1 : e.index > t.index ? 1 : e.length < t.length ? -1 : e.length > t.length ? 1 : 0;
}
function d(e, t) {
  function n(e, t) {
  return e[0];
  }
  var r = 0;
  var i = null;
  var s = [];
  var o = t.func ? t.func : n;
  while ((i = t.regex.exec(e)) != null) {
  var u = o(i, t);
  typeof u == "string" && (u = [ new m.Match(u, i.index, t.css) ]), s = s.concat(u);
  }
  return s;
}
function v(e) {
var t = /(.*)((&gt;|&lt;).*)/;
return e.replace(m.regexLib.url, e => {
  var n = "";
  var r = null;
  if (r = t.exec(e)) e = r[1], n = r[2];
  return '<a href="' + e + '">' + e + "</a>" + n;
});
}
var m = {
defaults: {
"class-name": "",
"first-line": 1,
"pad-line-numbers": !1,
highlight: null,
"smart-tabs": !0,
"tab-size": 4,
gutter: !0,
"auto-links": !0
},
config: {
space: "&nbsp;",
stripBrs: !1,
strings: {
alert: "SyntaxHighlighter\n\n",
noBrush: "Can't find brush for: ",
brushNotHtmlScript: "Brush wasn't configured for html-script option: "
}
},
brushes: {},
regexLib: {
multiLineCComments: /\/\*[\s\S]*?\*\//gm,
singleLineCComments: /\/\/.*$/gm,
singleLinePerlComments: /#.*$/gm,
doubleQuotedString: /"([^\\"\n]|\\.)*"/g,
singleQuotedString: /'([^\\'\n]|\\.)*'/g,
multiLineDoubleQuotedString: new XRegExp('"([^\\\\"]|\\\\.)*"', "gs"),
multiLineSingleQuotedString: new XRegExp("'([^\\\\']|\\\\.)*'", "gs"),
xmlComments: /(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm,
url: /\w+:\/\/[\w-.\/?%&=:@;]*/g,
phpScriptTags: {
left: /(&lt;|<)\?=?/g,
right: /\?(&gt;|>)/g
},
aspScriptTags: {
left: /(&lt;|<)%=?/g,
right: /%(&gt;|>)/g
},
scriptScriptTags: {
left: /(&lt;|<)\s*script.*?(&gt;|>)/gi,
right: /(&lt;|<)\/\s*script\s*(&gt;|>)/gi
}
}
};
return m.Match = function(e, t, n) {
this.value = e, this.index = t, this.length = e.length, this.css = n, this.brushName = null;
}, m.Match.prototype.toString = function() {
return this.value;
}, m.Highlighter = () => {}, m.Highlighter.prototype = {
getParam(e, t) {
var n = this.params[e];
return r(n == null ? t : n);
},
create(e) {
return document.createElement(e);
},
findMatches(e, t) {
var n = [];
if (e != null) for (var r = 0; r < e.length; r++) typeof e[r] == "object" && (n = n.concat(d(t, e[r])));
return this.removeNestedMatches(n.sort(p));
},
removeNestedMatches(e) {
for (var t = 0; t < e.length; t++) {
  if (e[t] === null) continue;
  var n = e[t];
  var r = n.index + n.length;
  for (var i = t + 1; i < e.length && e[t] !== null; i++) {
  var s = e[i];
  if (s === null) continue;
  if (s.index > r) break;
  s.index == n.index && s.length > n.length ? e[t] = null : s.index >= n.index && s.index < r && (e[i] = null);
  }
}
return e;
},
figureOutLineNumbers(e) {
  var t = [];
  var n = parseInt(this.getParam("first-line"));
  return i(e, (e, r) => {
  t.push(r + n);
  }), t;
},
isLineHighlighted(e) {
var n = this.getParam("highlight", []);
return typeof n != "object" && n.push == null && (n = [ n ]), t(n, e.toString()) != -1;
},
getLineHtml(e, t, n) {
var r = [ "line", "number" + t, "index" + e, "alt" + (t % 2 == 0 ? 1 : 2).toString() ];
return this.isLineHighlighted(t) && r.push("highlighted"), t == 0 && r.push("break"), '<div class="' + r.join(" ") + '">' + n + "</div>";
},
getLineNumbersHtml(t, n) {
  var r = "";
  var i = e(t).length;
  var s = parseInt(this.getParam("first-line"));
  var o = this.getParam("pad-line-numbers");
  o == 1 ? o = (s + i - 1).toString().length : isNaN(o) == 1 && (o = 0);
  for (var a = 0; a < i; a++) {
    var f = n ? n[a] : s + a;
    var t = f == 0 ? m.config.space : u(f, o);
    r += this.getLineHtml(a, f, t);
  }
  return r;
},
getCodeLinesHtml(t, n) {
  t = c(t);
  var r = e(t);
  var i = this.getParam("pad-line-numbers");
  var s = parseInt(this.getParam("first-line"));
  var t = "";
  var o = this.getParam("brush");
  for (var u = 0; u < r.length; u++) {
    var a = r[u];
    var f = /^(&nbsp;|\s)+/.exec(a);
    var l = null;
    var h = n ? n[u] : s + u;
    f != null && (l = f[0].toString(), a = a.substr(l.length), l = l.replace(" ", m.config.space)), a = c(a), a.length == 0 && (a = m.config.space), t += this.getLineHtml(u, h, (l != null ? '<code class="' + o + ' spaces">' + l + "</code>" : "") + a);
  }
  return t;
},
getMatchesHtml(e, t) {
  function n(e) {
  var t = e ? e.brushName || s : s;
  return t ? t + " " : "";
  }
  var r = 0;
  var i = "";
  var s = this.getParam("brush", "");
  for (var u = 0; u < t.length; u++) {
    var a = t[u];
    var f;
    if (a === null || a.length === 0) continue;
    f = n(a), i += o(e.substr(r, a.index - r), f + "plain") + o(a.value, f + a.css), r = a.index + a.length + (a.offset || 0);
  }
  return i += o(e.substr(r), n() + "plain"), i;
},
getHtml(e) {
  var t = "";
  var n = [ "syntaxhighlighter" ];
  var r;
  var i;
  var o;
  return className = "syntaxhighlighter", (gutter = this.getParam("gutter")) == 0 && n.push("nogutter"), n.push(this.getParam("class-name")), n.push(this.getParam("brush")), e = s(e).replace(/\r/g, " "), r = this.getParam("tab-size"), e = this.getParam("smart-tabs") == 1 ? f(e, r) : a(e, r), e = h(e), gutter && (o = this.figureOutLineNumbers(e)), i = this.findMatches(this.regexList, e), t = this.getMatchesHtml(e, i), t = this.getCodeLinesHtml(t, o), this.getParam("auto-links") && (t = v(t)), typeof navigator != "undefined" && navigator.userAgent && navigator.userAgent.match(/MSIE/) && n.push("ie"), t = '<div class="' + n.join(" ") + '">' + '<table border="0" cellpadding="0" cellspacing="0">' + "<tbody>" + "<tr>" + (gutter ? '<td class="gutter">' + this.getLineNumbersHtml(e) + "</td>" : "") + '<td class="code">' + '<div class="container">' + t + "</div>" + "</td>" + "</tr>" + "</tbody>" + "</table>" + "</div>", t;
},
init(e) {
this.params = n(m.defaults, e || {});
},
getKeywords(e) {
return e = e.replace(/^\s+|\s+$/g, "").replace(/\s+/g, "|"), "\\b(?:" + e + ")\\b";
}
}, m;
})();

((() => {
function e() {
  var e = "break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with";
  var t = SyntaxHighlighter.regexLib;
  this.regexList = [ {
  regex: t.multiLineDoubleQuotedString,
  css: "string"
  }, {
  regex: t.multiLineSingleQuotedString,
  css: "string"
  }, {
  regex: t.singleLineCComments,
  css: "comments"
  }, {
  regex: t.multiLineCComments,
  css: "comments"
  }, {
  regex: /\s*#.*/gm,
  css: "preprocessor"
  }, {
  regex: new RegExp(this.getKeywords(e), "gm"),
  css: "keyword"
  } ];
}
e.prototype = new SyntaxHighlighter.Highlighter, e.aliases = [ "js", "jscript", "javascript" ], SyntaxHighlighter.brushes.JScript = e;
}))(), (() => {
var e = new SyntaxHighlighter.brushes.JScript;
e.init({}), syntaxHighlight = t => e.getHtml(t);
})();

// Presentor.js

enyo.kind({
name: "Presentor",
kind: null,
showInherited: !1,
showProtected: !1,
getByType(e, t) {
var n = [];
for (var r = 0, i; i = e[r]; r++) i.type == t && n.push(i);
return n;
},
presentObject(e) {
switch (e.type) {
case "module":
return this.presentObjects(e.objects);
case "kind":
return this.presentKind(e);
case "function":
case "global":
return this.presentProperty(e);
}
},
presentObjects(e) {
  var t = this.groupFilter(e);
  var n = "";
  var r;
  var i;
  var s = !1;
  var o = this.getByType(t, "kind");
  if (o.length) {
  n += "<h3>Kinds</h3>";
  for (r = 0; i = o[r]; r++) n += "<kind>" + i.name + "</kind><br/>", n += this.presentComment(i.comment);
  s = !0;
  }
  o = this.getByType(t, "function");
  if (o.length) {
  n += "<h3>Functions</h3>";
  for (r = 0; i = o[r]; r++) i.group && (n += "<" + i.group + ">" + i.group + "</" + i.group + ">"), n += "<label>" + i.name + "</label>: function(<arguments>" + i.value[0].arguments.join(", ") + "</arguments>)</label><br/>", n += this.presentComment(i.comment);
  s = !0;
  }
  o = this.getByType(t, "global");
  if (o.length) {
  n += "<h3>Variables</h3>";
  for (r = 0; i = o[r]; r++) n += this.presentComment(i.comment), i.group && (n += "<" + i.group + ">" + i.group + "</" + i.group + ">"), n += "<label>" + i.name + "</label> = ", n += this.presentExpression(i.value[0]), n += "<br/>";
  s = !0;
  }
  return s || (n += "<h3>This module has no public properties or functions to display.</h3>"), n;
},
presentComment(e) {
return e ? "<comment>" + this.markupToHtml(e) + "</comment>" : "";
},
presentKind(e) {
return this.presentKindHeader(e) + this.presentKindSummary(e) + this.presentKindProperties(e);
},
presentKindHeader(e) {
var t = "";
return e.module && e.module.label && (t += "<package>" + e.module.label + "</package>"), t += "<kind>" + e.name + "</kind>", e.superkinds.length && (t += '<div style="padding: 4px 0px;">', t += e.name, enyo.forEach(e.superkinds, e => {
t += " :: <a href=#" + e + ">" + e + "</a>";
}), t += "</div>"), t;
},
presentKindSummary(e) {
var t = "";
return e.comment && (t += "<h3>Summary</h3>" + this.presentComment(e.comment)), t;
},
presentKindProperties(e) {
return this.presentProperties(this.showInherited ? e.allProperties : e.properties, e);
},
groupFilter(e) {
return enyo.filter(e, function(e) {
return e.name[0] !== "_" && (e.group == "public" || this.showProtected && e.group == "protected");
}, this);
},
presentProperties(e, t) {
  var n = this.groupFilter(e);
  var r = "";
  for (var i = 0, s; s = n[i]; i++) r += this.presentProperty(s, t);
  return r;
},
presentProperty(e, t) {
  var n = "";
  var r = e;
  n += '<a name="' + r.name + '"></a>', r.group && (n += "<" + r.group + ">" + r.group + "</" + r.group + ">");
  var i = r.name.replace(".prototype", "");
  return r.object && t && t != r.object && (i = "<prototype>" + r.object.name + "::</prototype>" + i), n += "<label>" + i + "</label>: ", r.value && r.value[0] && r.value[0].token == "function" ? n += "function(<arguments>" + r.value[0].arguments.join(", ") + "</arguments>)<br/>" : n += this.presentValue(r), n += this.presentComment(r.comment), n += "<hr/>", n;
},
presentValue(e) {
  var t;
  var n = e.value;
  return !n || !n[0] ? t = e.token : t = this.presentExpression(n[0]), t += "</br>", t;
},
presentExpression(e) {
var t = e;
return t.comment ? this.presentComment(t.comment) : t.type == "block" ? "{<blockquote><br/>" + this.presentBlock(t) + "</blockquote>}" : t.type == "array" ? "[<blockquote>" + this.presentArray(t) + "</blockquote>]" : t.token;
},
presentBlock(e) {
return this.presentProperties(e.properties);
},
presentArray(e) {
  var t = "";
  var n = e.properties;
  for (var r = 0, i; i = n[r]; r++) t += "<i>" + r + "</i>: " + this.presentExpression(i);
  return t;
},
presentColumns(e, t, n) {
  var r = this.groupFilter(e);
  var i = "";
  t && (i = t.name + "::");
  var s = n || 4;
  var o = [];
  var u = "";
  for (var a = 0, f = 0, l = 0; p = r[a]; a++) u += '<a href="#' + i + p.name + '">' + p.name + "</a><br/>", ++l == s && (o.push(u), u = "", l = 0);
  return u && o.push(u), u = o.length ? "<column>" + o.join("</column><column>") + "</column>" : "", u;
},
markupToHtml(e) {
var t = Presentor.showdown.makeHtml(e || "");
return t = t.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gm, (e, t) => "<pre>" + syntaxHighlight(t) + "</pre>"), t;
},
inlineProperties(e, t) {
  var n = [];

  var r = e => {
  e.parentHash = s.name;
  };

  for (var i = 0, s; s = e[i]; i++) t[s.name] ? s.value && s.value[0] && s.value[0].properties && (enyo.forEach(s.value[0].properties, r), n = n.concat(s.value[0].properties)) : n.push(s);
  return n;
},
statics: {
showdown: new Showdown.converter
}
});

// PackagesEditor.js

enyo.kind({
name: "PackagesEditor",
kind: "Popup",
classes: "packages-editor",
events: {
onSave: ""
},
components: [ {
kind: "Repeater",
onSetupItem: "setupItem",
components: [ {
components: [ {
name: "name",
kind: "Input"
}, {
name: "path",
kind: "Input"
}, {
kind: "Button",
content: "Delete",
ontap: "deletePkg"
} ]
} ]
}, {
kind: "Button",
content: "New...",
ontap: "newPkg"
}, {
tag: "hr"
}, {
kind: "Button",
content: "Cancel",
ontap: "hide"
}, {
kind: "Button",
content: "Save",
ontap: "save"
} ],
openWithPackages(e) {
this.show(), this.pkgs = e, this.load();
},
load() {
this.$.repeater.setCount(this.pkgs.length);
},
setupItem(e, t) {
var n = this.pkgs[t.index];
return t.item.$.name.setValue(n.name), t.item.$.path.setValue(n.path), !0;
},
newPkg() {
this.pkgs.push({
name: "",
path: ""
}), this.load();
},
deletePkg(e, t) {
this.pkgs.splice(t.index, 1), this.load();
},
save() {
var e = [];
for (var t = 0, n; n = this.$.repeater.getClientControls()[t]; t++) {
  var r = n.$.name.getValue();
  var i = n.$.path.getValue();
  r && i && e.push({
  name: r,
  path: i
  });
}
this.doSave({
pkgs: e
}), this.hide();
}
});

// PackageList.js

enyo.kind({
name: "PackageList",
components: [ {
kind: "Repeater",
components: [ {
components: [ {
kind: "Checkbox",
onchange: "cbChange"
} ]
} ]
}, {
name: "version",
style: "padding-top: 20px"
}, {
kind: "PackagesEditor",
modal: !0,
centered: !0,
floating: !0,
onSave: "savePackages"
} ],
published: {
version: ""
},
events: {
onPackagesChange: "",
onLoaded: ""
},
handlers: {
onSetupItem: "setupItem"
},
create(...args) {
this.inherited(args), this.versionChanged();
},
versionChanged() {
this.$.version.setContent("Content Version: " + this.version);
},
fetchPackageData() {
(new enyo.Ajax({
url: "assets/manifest.json"
})).response(this, function(e, t) {
this.setVersion(t.version), this.gotPackageData(t.packages);
}).go();
},
gotPackageData(e) {
this.pkgs = e, this.$.repeater.setCount(this.pkgs.length), this.doLoaded({
packages: this.pkgs,
version: this.version
});
},
loadPackageData() {
this.pkgs ? this.gotPackageData(this.pkgs) : this.fetchPackageData();
},
savePackageData() {},
setupItem(e, t) {
  var n = this.pkgs[t.index];
  var r = t.item.$.checkbox;
  r.setContent(n.name), r.setChecked(!n.disabled);
},
cbChange(e, t) {
  var n = t.index;
  var r = this.pkgs[n];
  r && (r.disabled = !e.getChecked(), this.savePackageData()), this.doPackagesChange({
  pkg: r
  });
}
});

// TabPanels.js

enyo.kind({
name: "TabPanels",
kind: "FittableRows",
components: [ {
name: "tabs",
kind: "Group",
defaultKind: "Button",
controlClasses: "tab"
}, {
name: "client",
style: "position: relative;",
fit: !0
} ],
create(...args) {
this.inherited(args), this.selectTab(0);
},
addControl(e) {
e.isChrome || (e.addClass("enyo-fit"), e.showing = !1, this.$.tabs.createComponent({
content: e.tabName || e.name,
ontap: "tabTap",
owner: this
})), this.inherited(arguments);
},
selectTab(e) {
this.$.tabs.getControls()[e].setActive(!0);
for (var t = 0, n = this.getClientControls(), r; r = n[t]; t++) r.setShowing(t == e);
},
tabTap(e) {
this.selectTab(e.indexInContainer());
}
});

// SearchBar.js

enyo.kind({
name: "SearchBar",
events: {
onSearch: ""
},
handlers: {
onkeyup: "search",
onchange: "search"
},
components: [ {
xkind: "InputDecorator",
classes: "enyo-tool-decorator input-decorator",
style: "display: block;",
components: [ {
kind: "Input",
style: "width: 90%;"
}, {
kind: "Image",
src: "assets/search-input-search.png"
} ]
} ],
getValue() {
if (this.$.input.hasNode()) return this.$.input.node.value;
},
search() {
this.doSearch({
searchString: this.getValue()
});
}
});

// App.js

enyo.kind({
name: "App",
fit: !0,
kind: "FittableColumns",
components: [ {
kind: "Analyzer",
onIndexReady: "indexReady"
}, {
name: "left",
kind: "TabPanels",
classes: "enyo-unselectable",
components: [ {
kind: "Scroller",
tabName: "Kinds",
components: [ {
name: "kinds",
allowHtml: !0
} ]
}, {
kind: "Scroller",
tabName: "Modules",
components: [ {
name: "modules",
allowHtml: !0
} ]
}, {
kind: "Scroller",
tabName: "Index",
components: [ {
kind: "SearchBar",
onSearch: "search"
}, {
name: "index",
allowHtml: !0
} ]
}, {
name: "packages",
tabName: "Packages",
kind: "PackageList",
onPackagesChange: "loadPackages",
onLoaded: "packagesLoaded"
} ]
}, {
name: "doc",
kind: "FittableRows",
fit: !0,
components: [ {
name: "scope",
components: [ {
name: "inheritedCb",
kind: "Checkbox",
content: "show inherited",
onchange: "scopeChange"
}, {
name: "accessCb",
kind: "Checkbox",
content: "show protected",
style: "margin-left: 20px;",
onchange: "accessChange"
} ]
}, {
name: "header",
allowHtml: !0
}, {
name: "tocFrame",
kind: "Scroller",
components: [ {
name: "toc",
allowHtml: !0
} ]
}, {
name: "bodyFrame",
kind: "Scroller",
fit: !0,
classes: "enyo-selectable",
components: [ {
name: "indexBusy",
kind: "Image",
src: "assets/busy.gif",
style: "padding-left: 8px;",
showing: !1
}, {
name: "body",
allowHtml: !0
} ]
} ]
} ],
create(...args) {
this.inherited(args), window.onhashchange = enyo.bind(this, "hashChange"), this.presentor = new Presentor, this.loadPackages();
},
loadPackages() {
this.index = this.$.analyzer.index = new Indexer, this.$.packages.loadPackageData();
},
packagesLoaded(e, t) {
document.title = "Enyo API Viewer (" + t.version + ")";
var n = [];
return enyo.forEach(t.packages, e => {
e.disabled || n.push({
path: e.path,
label: e.name
});
}), this.walk(n), !0;
},
walk(e) {
this.walking = !0, this.$.indexBusy.show(), this.$.analyzer.walk(e);
},
indexReady() {
this.presentKinds(), this.presentModules(), this.presentIndex(), this.$.indexBusy.hide(), this.walking = !1, this.hashChange();
},
indexalize(e, t, n) {
  var r = e ? enyo.filter(this.index.objects, e, this) : this.index.objects;
  e(r[0]) && r.sort(this.moduleCompare), r = this.nameFilter(r);
  var i = "";
  var s;
  for (var o = 0, u; u = r[o]; o++) {
  var a = n(u).divider;
  a && s != a && (s = a, i += "<divider>" + a + "</divider>"), i += enyo.macroize(t, n(u));
  }
  return i;
},
moduleCompare(e, t) {
  var n;
  var r;
  try {
  n = e.name.match("[^/]*.js$")[0], r = t.name.match("[^/]*.js$")[0];
  } catch (i) {
  n = e.name, r = t.name;
  }
  return n.toUpperCase() < r.toUpperCase() ? -1 : n.toUpperCase() > r.toUpperCase() ? 1 : 0;
},
nameFilter(e) {
return enyo.filter(e, e => e.name && e.name[0] !== "_");
},
presentFilteredIndex(e) {
  var t = '<a href="#{$link}"><prototype>{$object}</prototype><topic>{$topic}</topic>{$module}</a><br/>';

  var n = e => ({
    link: e.topic || e.name,
    topic: e.name.replace(".prototype", ""),
    divider: e.name[0].toUpperCase(),
    object: e.object && e.object.name ? e.object.name + "::" : "",
    module: !e.object && e.module && e.module.name ? " [" + e.module.name.match("[^/]*.js$") + "]" : ""
  });

  this.$.index.setContent(this.indexalize(e, t, n));
},
presentIndex() {
var e = e => e.name !== "published" && (e.group == "public" || e.group == "published");
this.presentFilteredIndex(e);
},
presentModules() {
  var e = e => e.type == "module";
  var t = '<a href="#{$link}"><topic>{$topic}</topic></a><br/>';

  var n = e => ({
    link: e.topic || e.name,
    topic: e.name.match("[^/]*.js$"),
    divider: e.name.match("[^/]*.js$")[0][0].toUpperCase()
  });

  this.$.modules.setContent(this.indexalize(e, t, n));
},
presentKinds() {
  var e = e => e.type == "kind" && e.group == "public";
  var t = '<a href="#{$link}"><topic>{$topic}</topic></a><br/>';

  var n = e => ({
    link: e.topic || e.name,
    topic: e.name,
    divider: e.name.split(".")[0]
  });

  this.$.kinds.setContent(this.indexalize(e, t, n));
},
presentObject(e) {
if (!e || !e.type) return;
if (e.type === "kind") {
this.$.header.show(), this.presentKind(e);
return;
}
e.type === "module" ? (this.$.header.show(), this.$.header.setContent("<moduleName>" + e.name + "</moduleName>")) : (this.$.header.hide(), this.$.header.setContent("")), this.$.toc.setContent(""), this.$.doc.reflow();
var t = "";
e && (t = this.presentor.presentObject(e)), this.$.body.setContent(t);
},
presentKind(e) {
  this.$.header.setContent(this.presentor.presentKindHeader(e));
  var t = this.presentor.showInherited ? e.allProperties : e.properties;
  t = this.presentor.inlineProperties(t, {
  published: 1,
  statics: 1,
  events: 1
  }), t.sort(Indexer.nameCompare);
  var n = this.presentor.presentColumns(t, e);
  this.$.toc.setContent(n);
  var r = this.presentor.presentKindSummary(e);
  var i = this.presentor.presentKindProperties(e);
  i && (r += "<h3>Properties</h3>" + i), this.$.body.setContent(r), this.$.doc.reflow();
},
presentModule(e) {
this.presentObject(e);
},
moduleTap(e) {
this.presentModule(e.object);
},
objectTap(e) {
this.presentObject(e.object);
},
hashChange(e) {
this.selectTopic(this.getHashTopic());
},
getHashTopic() {
return window.location.hash.slice(1);
},
selectTopic(e) {
  this.topic = e;
  var t = e.split("::");
  var n = t.shift();
  var r = t.shift();
  var i = this.index.findByName(n) || this.index.findByName("enyo." + n);
  this.topicObject != i && (this.presentObject(i), this.topicObject = i, this.$.body.container.setScrollTop(0));
  if (r) {
  var s = document.getElementsByName(r)[0];
  s && s.scrollIntoView(!0);
  }
},
scopeChange() {
this.presentor.showInherited = this.$.inheritedCb.getValue(), this.topicObject = null, this.selectTopic(this.topic);
},
accessChange() {
this.presentor.showProtected = this.$.accessCb.getValue(), this.topicObject = null, this.selectTopic(this.topic);
},
search(e, t) {
this.setSearchString(t.searchString.toLowerCase());
},
setSearchString(e) {
var t = t => t.name !== "published" && (t.group == "public" || t.group == "published") && t.name.toLowerCase().indexOf(e) >= 0;
this.presentFilteredIndex(t);
}
});
