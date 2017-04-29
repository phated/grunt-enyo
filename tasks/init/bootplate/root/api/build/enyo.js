
// enyo.js

((() => {
var e = "enyo.js";
enyo = window.enyo || {}, enyo.locateScript = e => {
var t = document.getElementsByTagName("script");
for (var n = t.length - 1, r, i, s = e.length; n >= 0 && (r = t[n]); n--) if (!r.located) {
i = r.getAttribute("src") || "";
if (i.slice(-s) == e) return r.located = !0, {
path: i.slice(0, Math.max(0, i.lastIndexOf("/"))),
node: r
};
}
}, enyo.args = enyo.args || {};
var t = enyo.locateScript(e);
if (t) {
enyo.args.root = (enyo.args.root || t.path).replace("/source", "");
for (var n = 0, r; r = t.node.attributes.item(n); n++) enyo.args[r.nodeName] = r.value;
}
}))();

// ../../loader.js

((() => {
enyo = window.enyo || {}, enyo.path = {
paths: {},
addPath(e, t) {
return this.paths[e] = t;
},
addPaths(e) {
if (e) for (var t in e) this.addPath(t, e[t]);
},
includeTrailingSlash(e) {
return e && e.slice(-1) !== "/" ? e + "/" : e;
},
rewritePattern: /\$([^\/\\]*)(\/)?/g,
rewrite(e) {
  var t;
  var n = this.includeTrailingSlash;
  var r = this.paths;
  var i = (e, i) => (t = !0, n(r[i]) || "");
  var s = e;
  do t = !1, s = s.replace(this.rewritePattern, i); while (t);
  return s;
}
}, enyo.loaderFactory = function(e) {
this.machine = e, this.packages = [], this.modules = [], this.sheets = [], this.stack = [];
}, enyo.loaderFactory.prototype = {
packageName: "",
packageFolder: "",
verbose: !1,
finishCallbacks: {},
loadScript(e) {
this.machine.script(e);
},
loadSheet(e) {
this.machine.sheet(e);
},
loadPackage(e) {
this.machine.script(e);
},
report() {},
load(...args) {
this.more({
index: 0,
depends: args || []
});
},
more(e) {
if (e && this.continueBlock(e)) return;
var t = this.stack.pop();
t ? (this.verbose && console.groupEnd("* finish package (" + (t.packageName || "anon") + ")"), this.packageFolder = t.folder, this.packageName = "", this.more(t)) : this.finish();
},
finish() {
this.packageFolder = "", this.verbose && console.log("-------------- fini");
for (var e in this.finishCallbacks) this.finishCallbacks[e] && (this.finishCallbacks[e](), this.finishCallbacks[e] = null);
},
continueBlock(e) {
while (e.index < e.depends.length) {
var t = e.depends[e.index++];
if (t) if (typeof t == "string") {
if (this.require(t, e)) return !0;
} else enyo.path.addPaths(t);
}
},
require(e, t) {
  var n = enyo.path.rewrite(e);
  var r = this.getPathPrefix(e);
  n = r + n;
  if (n.slice(-4) == ".css" || n.slice(-5) == ".less") this.verbose && console.log("+ stylesheet: [" + r + "][" + e + "]"), this.requireStylesheet(n); else {
  if (n.slice(-3) != ".js" || n.slice(-10) == "package.js") return this.requirePackage(n, t), !0;
  this.verbose && console.log("+ module: [" + r + "][" + e + "]"), this.requireScript(e, n);
  }
},
getPathPrefix(e) {
var t = e.slice(0, 1);
return t != "/" && t != "\\" && t != "$" && e.slice(0, 5) != "http:" ? this.packageFolder : "";
},
requireStylesheet(e) {
this.sheets.push(e), this.loadSheet(e);
},
requireScript(e, t) {
this.modules.push({
packageName: this.packageName,
rawPath: e,
path: t
}), this.loadScript(t);
},
decodePackagePath(e) {
  var t = "";
  var n = "";
  var r = "";
  var i = "package.js";
  var s = e.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/:\//, "://").split("/");
  if (s.length) {
  var o = s.pop() || s.pop() || "";
  o.slice(-i.length) !== i ? s.push(o) : i = o, r = s.join("/"), r = r ? r + "/" : "", i = r + i;
  for (var u = s.length - 1; u >= 0; u--) if (s[u] == "source") {
  s.splice(u, 1);
  break;
  }
  n = s.join("/");
  for (var u = s.length - 1, a; a = s[u]; u--) if (a == "lib" || a == "enyo") {
  s = s.slice(u + 1);
  break;
  }
  for (var u = s.length - 1, a; a = s[u]; u--) (a == ".." || a == ".") && s.splice(u, 1);
  t = s.join("-");
  }
  return {
  alias: t,
  target: n,
  folder: r,
  manifest: i
  };
},
aliasPackage(e) {
var t = this.decodePackagePath(e);
this.manifest = t.manifest, t.alias && (enyo.path.addPath(t.alias, t.target), this.packageName = t.alias, this.packages.push({
name: t.alias,
folder: t.folder
})), this.packageFolder = t.folder;
},
requirePackage(e, t) {
t.folder = this.packageFolder, this.aliasPackage(e), t.packageName = this.packageName, this.stack.push(t), this.report("loading package", this.packageName), this.verbose && console.group("* start package [" + this.packageName + "]"), this.loadPackage(this.manifest);
}
};
}))();

// boot.js

enyo.machine = {
sheet(e) {
  var t = "text/css";
  var n = "stylesheet";
  var r = e.slice(-5) == ".less";
  r && (window.less ? (t = "text/less", n = "stylesheet/less") : e = e.slice(0, e.length - 4) + "css");
  var i;
  enyo.runtimeLoading || r ? (i = document.createElement("link"), i.href = e, i.media = "screen", i.rel = n, i.type = t, document.getElementsByTagName("head")[0].appendChild(i)) : document.write('<link href="' + e + '" media="screen" rel="' + n + '" type="' + t + '" />'), r && window.less && (less.sheets.push(i), enyo.loader.finishCallbacks.lessRefresh || (enyo.loader.finishCallbacks.lessRefresh = () => {
  less.refresh(!0);
  }));
},
script(e, t, n) {
if (!enyo.runtimeLoading) document.write('<script src="' + e + '"' + (t ? ' onload="' + t + '"' : "") + (n ? ' onerror="' + n + '"' : "") + "></scri" + "pt>"); else {
var r = document.createElement("script");
r.src = e, r.onLoad = t, r.onError = n, document.getElementsByTagName("head")[0].appendChild(r);
}
},
inject(e) {
document.write('<script type="text/javascript">' + e + "</script>");
}
}, enyo.loader = new enyo.loaderFactory(enyo.machine), enyo.depends = function(...args) {
var e = enyo.loader;
if (!e.packageFolder) {
var t = enyo.locateScript("package.js");
t && t.path && (e.aliasPackage(t.path), e.packageFolder = t.path + "/");
}
e.load(...args);
}, (() => {
  function n(r) {
  r && r();
  if (t.length) {
    var i = t.shift();
    var s = i[0];
    var o = e.isArray(s) ? s : [ s ];
    var u = i[1];
    e.loader.finishCallbacks.runtimeLoader = () => {
    n(() => {
    u && u(s);
    });
    }, e.loader.packageFolder = "./", e.depends.apply(this, o);
  } else e.runtimeLoading = !1, e.loader.packageFolder = "";
  }
  var e = window.enyo;
  var t = [];
  e.load = function(r, i) {
  t.push(arguments), e.runtimeLoading || (e.runtimeLoading = !0, n());
  };
})(), enyo.path.addPaths({
enyo: enyo.args.root,
lib: "$enyo/../lib"
});

// log.js

enyo.logging = {
level: 99,
levels: {
log: 20,
warn: 10,
error: 0
},
shouldLog(e) {
var t = parseInt(this.levels[e], 0);
return t <= this.level;
},
_log(e, t) {
var n = enyo.isArray(t) ? t : enyo.cloneArray(t);
enyo.dumbConsole && (n = [ n.join(" ") ]);
var r = console[e];
r && r.apply ? r.apply(console, n) : console.log.apply ? console.log(...n) : console.log(n.join(" "));
},
log(e, t) {
window.console && this.shouldLog(e) && this._log(e, t);
}
}, enyo.setLogLevel = e => {
var t = parseInt(e, 0);
isFinite(t) && (enyo.logging.level = t);
}, enyo.log = function(...args) {
enyo.logging.log("log", args);
}, enyo.warn = function(...args) {
enyo.logging.log("warn", args);
}, enyo.error = function(...args) {
enyo.logging.log("error", args);
};

// lang.js

(function() {
enyo.global = this, enyo._getProp = (e, t, n) => {
var r = n || enyo.global;
for (var i = 0, s; r && (s = e[i]); i++) r = s in r ? r[s] : t ? r[s] = {} : undefined;
return r;
}, enyo.setObject = (e, t, n) => {
  var r = e.split(".");
  var i = r.pop();
  var s = enyo._getProp(r, !0, n);
  return s && i ? s[i] = t : undefined;
}, enyo.getObject = (e, t, n) => enyo._getProp(e.split("."), t, n), enyo.irand = e => Math.floor(Math.random() * e), enyo.cap = e => e.slice(0, 1).toUpperCase() + e.slice(1), enyo.uncap = e => e.slice(0, 1).toLowerCase() + e.slice(1), enyo.format = function(e) {
  var t = /\%./g;
  var n = 0;
  var r = e;
  var i = arguments;
  var s = e => i[++n];
  return r.replace(t, s);
};
var e = Object.prototype.toString;
enyo.isString = t => e.call(t) === "[object String]", enyo.isFunction = t => e.call(t) === "[object Function]", enyo.isArray = Array.isArray || (t => e.call(t) === "[object Array]"), enyo.indexOf = (e, t, n) => {
if (t.indexOf) return t.indexOf(e, n);
if (n) {
n < 0 && (n = 0);
if (n > t.length) return -1;
}
for (var r = n || 0, i = t.length, s; (s = t[r]) || r < i; r++) if (s == e) return r;
return -1;
}, enyo.remove = (e, t) => {
var n = enyo.indexOf(e, t);
n >= 0 && t.splice(n, 1);
}, enyo.forEach = function(e, t, n) {
if (e) {
var r = n || this;
if (enyo.isArray(e) && e.forEach) e.forEach(t, r); else {
  var i = Object(e);
  var s = i.length >>> 0;
  for (var o = 0; o < s; o++) o in i && t.call(r, i[o], o, i);
}
}
}, enyo.map = function(e, t, n) {
  var r = n || this;
  if (enyo.isArray(e) && e.map) return e.map(t, r);
  var i = [];

  var s = (e, n, s) => {
  i.push(t.call(r, e, n, s));
  };

  return enyo.forEach(e, s, r), i;
}, enyo.filter = function(e, t, n) {
  var r = n || this;
  if (enyo.isArray(e) && e.filter) return e.filter(t, r);
  var i = [];

  var s = (e, n, s) => {
  var o = e;
  t.call(r, e, n, s) && i.push(o);
  };

  return enyo.forEach(e, s, r), i;
}, enyo.keys = Object.keys || (e => {
  var t = [];
  var n = Object.prototype.hasOwnProperty;
  for (var r in e) n.call(e, r) && t.push(r);
  if (!{
  toString: null
  }.propertyIsEnumerable("toString")) {
  var i = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ];
  for (var s = 0, o; o = i[s]; s++) n.call(e, o) && t.push(o);
  }
  return t;
}), enyo.cloneArray = (e, t, n) => {
var r = n || [];
for (var i = t || 0, s = e.length; i < s; i++) r.push(e[i]);
return r;
}, enyo.toArray = enyo.cloneArray, enyo.clone = e => enyo.isArray(e) ? enyo.cloneArray(e) : enyo.mixin({}, e);
var t = {};
enyo.mixin = (e, n) => {
e = e || {};
if (n) {
  var r;
  var i;
  var s;
  for (r in n) i = n[r], t[r] !== i && (e[r] = i);
}
return e;
}, enyo.bind = function(e, t) {
t || (t = e, e = null), e = e || enyo.global;
if (enyo.isString(t)) {
if (!e[t]) throw [ 'enyo.bind: scope["', t, '"] is null (scope="', e, '")' ].join("");
t = e[t];
}
if (enyo.isFunction(t)) {
var n = enyo.cloneArray(arguments, 2);
return t.bind ? t.bind(...[ e ].concat(n)) : function(...args) {
var r = enyo.cloneArray(args);
return t.apply(e, n.concat(r));
};
}
throw [ 'enyo.bind: scope["', t, '"] is not a function (scope="', e, '")' ].join("");
}, enyo.asyncMethod = function(e, t) {
return setTimeout(enyo.bind(...arguments), 1);
}, enyo.call = function(e, t, n) {
var r = e || this;
if (t) {
var i = r[t] || t;
if (i && i.apply) return i.apply(r, n || []);
}
}, enyo.now = Date.now || (() => (new Date).getTime()), enyo.nop = () => {}, enyo.nob = {}, enyo.nar = [], enyo.instance = () => {}, enyo.setPrototype || (enyo.setPrototype = (e, t) => {
e.prototype = t;
}), enyo.delegate = e => (enyo.setPrototype(enyo.instance, e), new enyo.instance), $L = e => e;
})();

// job.js

enyo.job = (e, t, n) => {
enyo.job.stop(e), enyo.job._jobs[e] = setTimeout(() => {
enyo.job.stop(e), t();
}, n);
}, enyo.job.stop = e => {
enyo.job._jobs[e] && (clearTimeout(enyo.job._jobs[e]), delete enyo.job._jobs[e]);
}, enyo.job._jobs = {};

// macroize.js

enyo.macroize = (e, t, n) => {
  var r;
  var i;
  var s = e;
  var o = n || enyo.macroize.pattern;
  var u = (e, n) => (r = enyo.getObject(n, !1, t), r === undefined || r === null ? "{$" + n + "}" : (i = !0, r));
  var a = 0;
  do {
  i = !1, s = s.replace(o, u);
  if (++a >= 20) throw "enyo.macroize: recursion too deep";
  } while (i);
  return s;
}, enyo.quickMacroize = (e, t, n) => {
  var r;
  var i;
  var s = e;
  var o = n || enyo.macroize.pattern;
  var u = (e, n) => (n in t ? r = t[n] : r = enyo.getObject(n, !1, t), r === undefined || r === null ? "{$" + n + "}" : r);
  return s = s.replace(o, u), s;
}, enyo.macroize.pattern = /\{\$([^{}]*)\}/g;

// Oop.js

enyo.kind = e => {
  enyo._kindCtors = {};
  var t = e.name || "";
  delete e.name;
  var n = "kind" in e;
  var r = e.kind;
  delete e.kind;
  var i = enyo.constructorForKind(r);
  var s = i && i.prototype || null;
  if (n && r === undefined || i === undefined) throw "enyo.kind: Attempt to subclass an undefined kind. Check dependencies for [" + (t || "<unnamed>") + "].";
  var o = enyo.kind.makeCtor();
  return e.hasOwnProperty("constructor") && (e._constructor = e.constructor, delete e.constructor), enyo.setPrototype(o, s ? enyo.delegate(s) : {}), enyo.mixin(o.prototype, e), o.prototype.kindName = t, o.prototype.base = i, o.prototype.ctor = o, enyo.forEach(enyo.kind.features, t => {
  t(o, e);
  }), enyo.setObject(t, o), o;
}, enyo.singleton = (e, t) => {
var n = e.name;
delete e.name;
var r = enyo.kind(e);
enyo.setObject(n, new r, t);
}, enyo.kind.makeCtor = () => function(...args) {
if (!(this instanceof args.callee)) throw "enyo.kind: constructor called directly, not using 'new'";
var e;
this._constructor && (e = this._constructor(...args)), this.constructed && this.constructed(...args);
if (e) return e;
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.features.push((e, t) => {
var n = e.prototype;
n.inherited || (n.inherited = enyo.kind.inherited);
if (n.base) for (var r in t) {
var i = t[r];
enyo.isFunction(i) && (i._inherited = n.base.prototype[r] || enyo.nop, i.nom = n.kindName + "." + r + "()");
}
}), enyo.kind.inherited = function(e, t) {
return e.callee._inherited.apply(this, t || e);
}, enyo.kind.features.push((e, t) => {
enyo.mixin(e, enyo.kind.statics), t.statics && (enyo.mixin(e, t.statics), delete e.prototype.statics);
var n = e.prototype.base;
while (n) n.subclass(e, t), n = n.prototype.base;
}), enyo.kind.statics = {
subclass(e, t) {},
extend(e) {
enyo.mixin(this.prototype, e);
var t = this;
enyo.forEach(enyo.kind.features, n => {
n(t, e);
});
}
}, enyo._kindCtors = {}, enyo.constructorForKind = e => {
if (e === null || enyo.isFunction(e)) return e;
if (e) {
var t = enyo._kindCtors[e];
return t ? t : enyo._kindCtors[e] = enyo.Theme[e] || enyo[e] || enyo.getObject(e, !1, enyo) || window[e] || enyo.getObject(e);
}
return enyo.defaultCtor;
}, enyo.Theme = {}, enyo.registerTheme = e => {
enyo.mixin(enyo.Theme, e);
};

// Object.js

enyo.kind({
name: "enyo.Object",
kind: null,
constructor() {
enyo._objectCount++;
},
setPropertyValue(e, t, n) {
if (this[n]) {
var r = this[e];
this[e] = t, this[n](r);
} else this[e] = t;
},
_setProperty(e, t, n) {
this.setPropertyValue(e, t, this.getProperty(e) !== t && n);
},
destroyObject(e) {
this[e] && this[e].destroy && this[e].destroy(), this[e] = null;
},
getProperty(e) {
var t = "get" + enyo.cap(e);
return this[t] ? this[t]() : this[e];
},
setProperty(e, t) {
var n = "set" + enyo.cap(e);
this[n] ? this[n](t) : this._setProperty(e, t, e + "Changed");
},
log(...args) {
  var e = args.callee.caller;
  var t = ((e ? e.nom : "") || "(instance method)") + ":";
  enyo.logging.log("log", [ t ].concat(enyo.cloneArray(args)));
},
warn(...args) {
this._log("warn", args);
},
error(...args) {
this._log("error", args);
},
_log(e, t) {
if (enyo.logging.shouldLog(e)) try {
throw new Error;
} catch (n) {
enyo.logging._log(e, [ t.callee.caller.nom + ": " ].concat(enyo.cloneArray(t))), console.log(n.stack);
}
}
}), enyo._objectCount = 0, enyo.Object.subclass = function(e, t) {
this.publish(e, t);
}, enyo.Object.publish = (e, t) => {
var n = t.published;
if (n) {
var r = e.prototype;
for (var i in n) enyo.Object.addGetterSetter(i, n[i], r);
}
}, enyo.Object.addGetterSetter = (e, t, n) => {
  var r = e;
  n[r] = t;
  var i = enyo.cap(r);
  var s = "get" + i;
  n[s] || (n[s] = function() {
  return this[r];
  });
  var o = "set" + i;
  var u = r + "Changed";
  n[o] || (n[o] = function(e) {
  this._setProperty(r, e, u);
  });
};

// Component.js

enyo.kind({
name: "enyo.Component",
kind: enyo.Object,
published: {
name: "",
id: "",
owner: null
},
statics: {
_kindPrefixi: {},
_unnamedKindNumber: 0
},
defaultKind: "Component",
handlers: {},
toString() {
return this.kindName;
},
constructor(...args) {
this._componentNameMap = {}, this.$ = {}, this.inherited(args);
},
constructed(e) {
this.importProps(e), this.create();
},
importProps(e) {
if (e) for (var t in e) this[t] = e[t];
this.handlers = enyo.mixin(enyo.clone(this.kindHandlers), this.handlers);
},
create() {
this.ownerChanged(), this.initComponents();
},
initComponents() {
this.createChrome(this.kindComponents), this.createClientComponents(this.components);
},
createChrome(e) {
this.createComponents(e, {
isChrome: !0
});
},
createClientComponents(e) {
this.createComponents(e, {
owner: this.getInstanceOwner()
});
},
getInstanceOwner() {
return !this.owner || this.owner.notInstanceOwner ? this : this.owner;
},
destroy() {
this.destroyComponents(), this.setOwner(null), this.destroyed = !0;
},
destroyComponents() {
enyo.forEach(this.getComponents(), e => {
e.destroyed || e.destroy();
});
},
makeId() {
  var e = "_";
  var t = this.owner && this.owner.getId();
  var n = this.name || "@@" + ++enyo.Component._unnamedKindNumber;
  return (t ? t + e : "") + n;
},
ownerChanged(e) {
e && e.removeComponent(this), this.owner && this.owner.addComponent(this), this.id || (this.id = this.makeId());
},
nameComponent(e) {
  var t = enyo.Component.prefixFromKindName(e.kindName);
  var n;
  var r = this._componentNameMap[t] || 0;
  do n = t + (++r > 1 ? String(r) : ""); while (this.$[n]);
  return this._componentNameMap[t] = Number(r), e.name = n;
},
addComponent(e) {
var t = e.getName();
t || (t = this.nameComponent(e)), this.$[t] && this.warn('Duplicate component name "' + t + '" in owner "' + this.id + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.'), this.$[t] = e;
},
removeComponent(e) {
delete this.$[e.getName()];
},
getComponents() {
var e = [];
for (var t in this.$) e.push(this.$[t]);
return e;
},
adjustComponentProps(e) {
this.defaultProps && enyo.mixin(e, this.defaultProps), e.kind = e.kind || e.isa || this.defaultKind, e.owner = e.owner || this;
},
_createComponent(e, t) {
if (!e.kind && "kind" in e) throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + e.name + "].";
var n = enyo.mixin(enyo.clone(t), e);
return this.adjustComponentProps(n), enyo.Component.create(n);
},
createComponent(e, t) {
return this._createComponent(e, t);
},
createComponents(e, t) {
if (e) {
var n = [];
for (var r = 0, i; i = e[r]; r++) n.push(this._createComponent(i, t));
return n;
}
},
getBubbleTarget() {
return this.owner;
},
bubble(e, t, n) {
var r = t || {};
return "originator" in r || (r.originator = n || this), this.dispatchBubble(e, r, n);
},
bubbleUp(e, t, n) {
var r = this.getBubbleTarget();
return r ? r.dispatchBubble(e, t, this) : !1;
},
dispatchEvent(e, t, n) {
this.decorateEvent(e, t, n);
if (this.handlers[e] && this.dispatch(this.handlers[e], t, n)) return !0;
if (this[e]) return this.bubbleDelegation(this.owner, this[e], e, t, this);
},
dispatchBubble(e, t, n) {
return this.dispatchEvent(e, t, n) ? !0 : this.bubbleUp(e, t, n);
},
decorateEvent(e, t, n) {},
bubbleDelegation(e, t, n, r, i) {
var s = this.getBubbleTarget();
if (s) return s.delegateEvent(e, t, n, r, i);
},
delegateEvent(e, t, n, r, i) {
return this.decorateEvent(n, r, i), e == this ? this.dispatch(t, r, i) : this.bubbleDelegation(e, t, n, r, i);
},
dispatch(e, t, n) {
var r = e && this[e];
if (r) return r.call(this, n || this, t);
},
waterfall(e, t, n) {
if (this.dispatchEvent(e, t, n)) return !0;
this.waterfallDown(e, t, n || this);
},
waterfallDown(e, t, n) {
for (var r in this.$) this.$[r].waterfall(e, t, n);
}
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = e => {
  if (!e.kind && "kind" in e) throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + (e.name || "") + "].";
  var t = e.kind || e.isa || enyo.defaultCtor;
  var n = enyo.constructorForKind(t);
  return n || (console.error('no constructor found for kind "' + t + '"'), n = enyo.Component), new n(e);
}, enyo.Component.subclass = function(e, t) {
var n = e.prototype;
t.components && (n.kindComponents = t.components, delete n.components);
if (t.handlers) {
var r = n.kindHandlers;
n.kindHandlers = enyo.mixin(enyo.clone(r), n.handlers), n.handlers = null;
}
t.events && this.publishEvents(e, t);
}, enyo.Component.publishEvents = function(e, t) {
var n = t.events;
if (n) {
var r = e.prototype;
for (var i in n) this.addEvent(i, n[i], r);
}
}, enyo.Component.addEvent = (e, t, n) => {
  var r;
  var i;
  enyo.isString(t) ? (e.slice(0, 2) != "on" && (console.warn("enyo.Component.addEvent: event names must start with 'on'. " + n.kindName + " event '" + e + "' was auto-corrected to 'on" + e + "'."), e = "on" + e), r = t, i = "do" + enyo.cap(e.slice(2))) : (r = t.value, i = t.caller), n[e] = r, n[i] || (n[i] = function(t) {
  return this.bubble(e, t);
  });
}, enyo.Component.prefixFromKindName = e => {
var t = enyo.Component._kindPrefixi[e];
if (!t) {
var n = e.lastIndexOf(".");
t = n >= 0 ? e.slice(n + 1) : e, t = t.charAt(0).toLowerCase() + t.slice(1), enyo.Component._kindPrefixi[e] = t;
}
return t;
};

// UiComponent.js

enyo.kind({
name: "enyo.UiComponent",
kind: enyo.Component,
published: {
container: null,
parent: null,
controlParentName: "client",
layoutKind: ""
},
handlers: {
onresize: "resizeHandler"
},
addBefore: undefined,
statics: {
_resizeFlags: {
showingOnly: !0
}
},
create(...args) {
this.controls = [], this.children = [], this.containerChanged(), this.inherited(args), this.layoutKindChanged();
},
destroy(...args) {
this.destroyClientControls(), this.setContainer(null), this.inherited(args);
},
importProps(e) {
this.inherited(arguments), this.owner || (this.owner = enyo.master);
},
createComponents(...args) {
var e = this.inherited(args);
return this.discoverControlParent(), e;
},
discoverControlParent() {
this.controlParent = this.$[this.controlParentName] || this.controlParent;
},
adjustComponentProps(e) {
e.container = e.container || this, this.inherited(arguments);
},
containerChanged(e) {
e && e.removeControl(this), this.container && this.container.addControl(this, this.addBefore);
},
parentChanged(e) {
e && e != this.parent && e.removeChild(this);
},
isDescendantOf(e) {
var t = this;
while (t && t != e) t = t.parent;
return e && t == e;
},
getControls() {
return this.controls;
},
getClientControls() {
var e = [];
for (var t = 0, n = this.controls, r; r = n[t]; t++) r.isChrome || e.push(r);
return e;
},
destroyClientControls() {
var e = this.getClientControls();
for (var t = 0, n; n = e[t]; t++) n.destroy();
},
addControl(e, t) {
this.controls.push(e), this.addChild(e, t);
},
removeControl(e) {
return e.setParent(null), enyo.remove(e, this.controls);
},
indexOfControl(e) {
return enyo.indexOf(e, this.controls);
},
indexOfClientControl(e) {
return enyo.indexOf(e, this.getClientControls());
},
indexInContainer() {
return this.container.indexOfControl(this);
},
clientIndexInContainer() {
return this.container.indexOfClientControl(this);
},
controlAtIndex(e) {
return this.controls[e];
},
addChild(e, t) {
if (this.controlParent) this.controlParent.addChild(e); else {
e.setParent(this);
if (t !== undefined) {
var n = t === null ? 0 : this.indexOfChild(t);
this.children.splice(n, 0, e);
} else this.children.push(e);
}
},
removeChild(e) {
return enyo.remove(e, this.children);
},
indexOfChild(e) {
return enyo.indexOf(e, this.children);
},
layoutKindChanged() {
this.layout && this.layout.destroy(), this.layout = enyo.createFromKind(this.layoutKind, this), this.generated && this.render();
},
flow() {
this.layout && this.layout.flow();
},
reflow() {
this.layout && this.layout.reflow();
},
resized() {
this.waterfall("onresize", enyo.UiComponent._resizeFlags), this.waterfall("onpostresize", enyo.UiComponent._resizeFlags);
},
resizeHandler() {
this.reflow();
},
waterfallDown(e, t, n) {
for (var r in this.$) this.$[r] instanceof enyo.UiComponent || this.$[r].waterfall(e, t, n);
for (var i = 0, s = this.children, o; o = s[i]; i++) (o.showing || !t || !t.showingOnly) && o.waterfall(e, t, n);
},
getBubbleTarget() {
return this.parent;
}
}), enyo.createFromKind = (e, t) => {
var n = e && enyo.constructorForKind(e);
if (n) return new n(t);
}, enyo.master = new enyo.Component({
name: "master",
notInstanceOwner: !0,
eventFlags: {
showingOnly: !0
},
getId() {
return "";
},
isDescendantOf: enyo.nop,
bubble(e, t, n) {
e == "onresize" ? (enyo.master.waterfallDown("onresize", this.eventFlags), enyo.master.waterfallDown("onpostresize", this.eventFlags)) : enyo.Signals.send(e, t);
}
});

// Layout.js

enyo.kind({
name: "enyo.Layout",
kind: null,
layoutClass: "",
constructor(e) {
this.container = e, e && e.addClass(this.layoutClass);
},
destroy() {
this.container && this.container.removeClass(this.layoutClass);
},
flow() {},
reflow() {}
});

// Signals.js

enyo.kind({
name: "enyo.Signals",
kind: enyo.Component,
create(...args) {
this.inherited(args), enyo.Signals.addListener(this);
},
destroy(...args) {
enyo.Signals.removeListener(this), this.inherited(args);
},
notify(e, t) {
this.dispatchEvent(e, t);
},
statics: {
listeners: [],
addListener(e) {
this.listeners.push(e);
},
removeListener(e) {
enyo.remove(e, this.listeners);
},
send(e, t) {
enyo.forEach(this.listeners, n => {
n.notify(e, t);
});
}
}
});

// Async.js

enyo.kind({
name: "enyo.Async",
kind: enyo.Object,
published: {
timeout: 0
},
failed: !1,
context: null,
constructor() {
this.responders = [], this.errorHandlers = [];
},
accumulate(e, t) {
var n = t.length < 2 ? t[0] : enyo.bind(t[0], t[1]);
e.push(n);
},
response(...args) {
return this.accumulate(this.responders, args), this;
},
error(...args) {
return this.accumulate(this.errorHandlers, args), this;
},
route(e, t) {
var n = enyo.bind(this, "respond");
e.response((e, t) => {
n(t);
});
var r = enyo.bind(this, "fail");
e.error((e, t) => {
r(t);
}), e.go(t);
},
handle(e, t) {
var n = t.shift();
if (n) if (n instanceof enyo.Async) this.route(n, e); else {
var r = enyo.call(this.context || this, n, [ this, e ]);
r = r !== undefined ? r : e, (this.failed ? this.fail : this.respond).call(this, r);
}
},
startTimer() {
this.startTime = enyo.now(), this.timeout && (this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout));
},
endTimer() {
this.timeoutJob && (this.endTime = enyo.now(), clearTimeout(this.timeoutJob), this.timeoutJob = null, this.latency = this.endTime - this.startTime);
},
timeoutComplete() {
this.timedout = !0, this.fail("timeout");
},
respond(e) {
this.failed = !1, this.endTimer(), this.handle(e, this.responders);
},
fail(e) {
this.failed = !0, this.endTimer(), this.handle(e, this.errorHandlers);
},
recover() {
this.failed = !1;
},
go(e) {
return enyo.asyncMethod(this, function() {
this.respond(e);
}), this;
}
});

// json.js

enyo.json = {
stringify(e, t, n) {
return JSON.stringify(e, t, n);
},
parse(e, t) {
return e ? JSON.parse(e, t) : null;
}
};

// cookie.js

enyo.getCookie = e => {
var t = document.cookie.match(new RegExp("(?:^|; )" + e + "=([^;]*)"));
return t ? decodeURIComponent(t[1]) : undefined;
}, enyo.setCookie = (e, t, n) => {
  var r = e + "=" + encodeURIComponent(t);
  var i = n || {};
  var s = i.expires;
  if (typeof s == "number") {
  var o = new Date;
  o.setTime(o.getTime() + s * 24 * 60 * 60 * 1e3), s = o;
  }
  s && s.toUTCString && (i.expires = s.toUTCString());
  var u;
  var a;
  for (u in i) r += "; " + u, a = i[u], a !== !0 && (r += "=" + a);
  document.cookie = r;
};

// xhr.js

enyo.xhr = {
request(e) {
  var t = this.getXMLHttpRequest(e.url);
  var n = e.method || "GET";
  var r = !e.sync;
  e.username ? t.open(n, enyo.path.rewrite(e.url), r, e.username, e.password) : t.open(n, enyo.path.rewrite(e.url), r), enyo.mixin(t, e.xhrFields), e.callback && this.makeReadyStateHandler(t, e.callback);
  if (e.headers) for (var i in e.headers) t.setRequestHeader(i, e.headers[i]);
  return typeof t.overrideMimeType == "function" && e.mimeType && t.overrideMimeType(e.mimeType), t.send(e.body || null), !r && e.callback && t.onreadystatechange(t), t;
},
cancel(e) {
e.onload && (e.onload = null), e.onreadystatechange && (e.onreadystatechange = null), e.abort && e.abort();
},
makeReadyStateHandler(e, t) {
window.XDomainRequest && e instanceof XDomainRequest && (e.onload = () => {
t(...[ e.responseText, e ]);
}), e.onreadystatechange = () => {
e.readyState == 4 && t(...[ e.responseText, e ]);
};
},
inOrigin(e) {
  var t = document.createElement("a");
  var n = !1;
  t.href = e;
  if (t.protocol === ":" || t.protocol === window.location.protocol && t.hostname === window.location.hostname && t.port === (window.location.port || (window.location.protocol === "https:" ? "443" : "80"))) n = !0;
  return n;
},
getXMLHttpRequest(e) {
try {
if (window.XDomainRequest && !this.inOrigin(e) && !/^file:\/\//.test(window.location.href)) return new XDomainRequest;
} catch (t) {}
try {
return new XMLHttpRequest;
} catch (t) {}
return null;
}
};

// AjaxProperties.js

enyo.AjaxProperties = {
cacheBust: !0,
url: "",
method: "GET",
handleAs: "json",
contentType: "application/x-www-form-urlencoded",
sync: !1,
headers: null,
postBody: "",
username: "",
password: "",
xhrFields: null,
mimeType: null
};

// Ajax.js

enyo.kind({
name: "enyo.Ajax",
kind: enyo.Async,
published: enyo.AjaxProperties,
constructor(e) {
enyo.mixin(this, e), this.inherited(arguments);
},
go(e) {
return this.startTimer(), this.request(e), this;
},
request(e) {
  var t = this.url.split("?");
  var n = t.shift() || "";
  var r = t.length ? t.join("?").split("&") : [];
  var i = enyo.isString(e) ? e : enyo.Ajax.objectToQuery(e);
  this.method == "GET" && (i && (r.push(i), i = null), this.cacheBust && !/^file:/i.test(n) && r.push(Math.random()));
  var s = r.length ? [ n, r.join("&") ].join("?") : n;
  var o = {};
  this.method != "GET" && (o["Content-Type"] = this.contentType), enyo.mixin(o, this.headers);
  try {
  this.xhr = enyo.xhr.request({
  url: s,
  method: this.method,
  callback: enyo.bind(this, "receive"),
  body: this.postBody || i,
  headers: o,
  sync: window.PalmSystem ? !1 : this.sync,
  username: this.username,
  password: this.password,
  xhrFields: this.xhrFields,
  mimeType: this.mimeType
  });
  } catch (u) {
  this.fail(u);
  }
},
receive(e, t) {
!this.failed && !this.destroyed && (this.isFailure(t) ? this.fail(t.status) : this.respond(this.xhrToResponse(t)));
},
fail(e) {
this.xhr && (enyo.xhr.cancel(this.xhr), this.xhr = null), this.inherited(arguments);
},
xhrToResponse(e) {
if (e) return this[(this.handleAs || "text") + "Handler"](e);
},
isFailure(e) {
try {
var t = "";
return typeof e.responseText == "string" && (t = e.responseText), e.status === 0 && t === "" ? !0 : e.status !== 0 && (e.status < 200 || e.status >= 300);
} catch (n) {
return !0;
}
},
xmlHandler(e) {
return e.responseXML;
},
textHandler(e) {
return e.responseText;
},
jsonHandler(e) {
var t = e.responseText;
try {
return t && enyo.json.parse(t);
} catch (n) {
return enyo.warn("Ajax request set to handleAs JSON but data was not in JSON format"), t;
}
},
statics: {
objectToQuery(e) {
  var t = encodeURIComponent;
  var n = [];
  var r = {};
  for (var i in e) {
  var s = e[i];
  if (s != r[i]) {
  var o = t(i) + "=";
  if (enyo.isArray(s)) for (var u = 0; u < s.length; u++) n.push(o + t(s[u])); else n.push(o + t(s));
  }
  }
  return n.join("&");
}
}
});

// Jsonp.js

enyo.kind({
name: "enyo.JsonpRequest",
kind: enyo.Async,
published: {
url: "",
charset: null,
callbackName: "callback",
cacheBust: !0
},
statics: {
nextCallbackID: 0
},
addScriptElement() {
var e = document.createElement("script");
e.src = this.src, e.async = "async", this.charset && (e.charset = this.charset), e.onerror = enyo.bind(this, function() {
this.fail(400);
});
var t = document.getElementsByTagName("script")[0];
t.parentNode.insertBefore(e, t), this.scriptTag = e;
},
removeScriptElement() {
var e = this.scriptTag;
this.scriptTag = null, e.onerror = null, e.parentNode && e.parentNode.removeChild(e);
},
constructor(e) {
enyo.mixin(this, e), this.inherited(arguments);
},
go(e) {
return this.startTimer(), this.jsonp(e), this;
},
jsonp(e) {
var t = "enyo_jsonp_callback_" + enyo.JsonpRequest.nextCallbackID++;
this.src = this.buildUrl(e, t), this.addScriptElement(), window[t] = enyo.bind(this, this.respond);
var n = enyo.bind(this, function() {
this.removeScriptElement(), window[t] = null;
});
this.response(n), this.error(n);
},
buildUrl(e, t) {
  var n = this.url.split("?");
  var r = n.shift() || "";
  var i = n.join("?").split("&");
  var s = this.bodyArgsFromParams(e, t);
  return i.push(s), this.cacheBust && i.push(Math.random()), [ r, i.join("&") ].join("?");
},
bodyArgsFromParams(e, t) {
if (enyo.isString(e)) return e.replace("=?", "=" + t);
var n = enyo.mixin({}, e);
return n[this.callbackName] = t, enyo.Ajax.objectToQuery(n);
}
});

// WebService.js

enyo.kind({
name: "enyo._AjaxComponent",
kind: enyo.Component,
published: enyo.AjaxProperties
}), enyo.kind({
name: "enyo.WebService",
kind: enyo._AjaxComponent,
published: {
jsonp: !1,
callbackName: "callback",
charset: null
},
events: {
onResponse: "",
onError: ""
},
constructor(e) {
this.inherited(arguments);
},
send(e) {
return this.jsonp ? this.sendJsonp(e) : this.sendAjax(e);
},
sendJsonp(e) {
var t = new enyo.JsonpRequest;
for (var n in {
url: 1,
callbackName: 1,
charset: 1
}) t[n] = this[n];
return this.sendAsync(t, e);
},
sendAjax(e) {
var t = new enyo.Ajax;
for (var n in enyo.AjaxProperties) t[n] = this[n];
return this.sendAsync(t, e);
},
sendAsync(e, t) {
return e.go(t).response(this, "response").error(this, "error");
},
response(e, t) {
this.doResponse({
ajax: e,
data: t
});
},
error(e, t) {
this.doError({
ajax: e,
data: t
});
}
});

// dom.js

enyo.requiresWindow = e => {
e();
}, enyo.dom = {
byId(e, t) {
return typeof e == "string" ? (t || document).getElementById(e) : e;
},
escape(e) {
return e !== null ? String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
getComputedStyle(e) {
return window.getComputedStyle && e && window.getComputedStyle(e, null);
},
getComputedStyleValue(e, t, n) {
var r = n || this.getComputedStyle(e);
return r ? r.getPropertyValue(t) : null;
},
getFirstElementByTagName(e) {
var t = document.getElementsByTagName(e);
return t && t[0];
},
applyBodyFit() {
var e = this.getFirstElementByTagName("html");
e && (e.className += " enyo-document-fit");
var t = this.getFirstElementByTagName("body");
t && (t.className += " enyo-body-fit"), enyo.bodyIsFitting = !0;
},
getWindowWidth() {
return window.innerWidth ? window.innerWidth : document.body && document.body.offsetWidth ? document.body.offsetWidth : document.compatMode == "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth ? document.documentElement.offsetWidth : 320;
},
_ieCssToPixelValue(e, t) {
  var n = t;
  var r = e.style;
  var i = r.left;
  var s = e.runtimeStyle && e.runtimeStyle.left;
  return s && (e.runtimeStyle.left = e.currentStyle.left), r.left = n, n = r.pixelLeft, r.left = i, s && (r.runtimeStyle.left = s), n;
},
_pxMatch: /px/i,
getComputedBoxValue(e, t, n, r) {
var i = r || this.getComputedStyle(e);
if (i) return parseInt(i.getPropertyValue(t + "-" + n), 0);
if (e && e.currentStyle) {
var s = e.currentStyle[t + enyo.cap(n)];
return s.match(this._pxMatch) || (s = this._ieCssToPixelValue(e, s)), parseInt(s, 0);
}
return 0;
},
calcBoxExtents(e, t) {
var n = this.getComputedStyle(e);
return {
top: this.getComputedBoxValue(e, t, "top", n),
right: this.getComputedBoxValue(e, t, "right", n),
bottom: this.getComputedBoxValue(e, t, "bottom", n),
left: this.getComputedBoxValue(e, t, "left", n)
};
},
calcPaddingExtents(e) {
return this.calcBoxExtents(e, "padding");
},
calcMarginExtents(e) {
return this.calcBoxExtents(e, "margin");
}
};

// transform.js

((() => {
  enyo.dom.calcCanAccelerate = () => {
  if (enyo.platform.android <= 2) return !1;
  var e = [ "perspective", "WebkitPerspective", "MozPerspective", "msPerspective", "OPerspective" ];
  for (var t = 0, n; n = e[t]; t++) if (typeof document.body.style[n] != "undefined") return !0;
  return !1;
  };
  var e = [ "transform", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform" ];
  var t = [ "transform", "webkitTransform", "MozTransform", "msTransform", "OTransform" ];
  enyo.dom.getCssTransformProp = function() {
  if (this._cssTransformProp) return this._cssTransformProp;
  var n = enyo.indexOf(this.getStyleTransformProp(), t);
  return this._cssTransformProp = e[n];
  }, enyo.dom.getStyleTransformProp = function() {
  if (this._styleTransformProp || !document.body) return this._styleTransformProp;
  for (var e = 0, n; n = t[e]; e++) if (typeof document.body.style[n] != "undefined") return this._styleTransformProp = n;
  }, enyo.dom.domTransformsToCss = e => {
    var t;
    var n;
    var r = "";
    for (t in e) n = e[t], n !== null && n !== undefined && n !== "" && (r += t + "(" + n + ") ");
    return r;
  }, enyo.dom.transformsToDom = function(e) {
    var t = this.domTransformsToCss(e.domTransforms);
    var n = e.hasNode() ? e.node.style : null;
    var r = e.domStyles;
    var i = this.getStyleTransformProp();
    var s = this.getCssTransformProp();
    i && s && (r[s] = t, n ? n[i] = t : e.domStylesChanged());
  }, enyo.dom.canTransform = function() {
  return Boolean(this.getStyleTransformProp());
  }, enyo.dom.canAccelerate = function() {
  return this.accelerando !== undefined ? this.accelerando : document.body && (this.accelerando = this.calcCanAccelerate());
  }, enyo.dom.transform = function(e, t) {
  var n = e.domTransforms = e.domTransforms || {};
  enyo.mixin(n, t), this.transformsToDom(e);
  }, enyo.dom.transformValue = function(e, t, n) {
  var r = e.domTransforms = e.domTransforms || {};
  r[t] = n, this.transformsToDom(e);
  }, enyo.dom.accelerate = function(e, t) {
  var n = t == "auto" ? this.canAccelerate() : t;
  this.transformValue(e, "translateZ", n ? 0 : null);
  };
}))();

// Control.js

enyo.kind({
name: "enyo.Control",
kind: enyo.UiComponent,
published: {
tag: "div",
attributes: null,
classes: "",
style: "",
content: "",
showing: !0,
allowHtml: !1,
src: "",
canGenerate: !0,
fit: !1,
isContainer: !1
},
handlers: {
ontap: "tap"
},
defaultKind: "Control",
controlClasses: "",
node: null,
generated: !1,
create(...args) {
this.initStyles(), this.inherited(args), this.showingChanged(), this.addClass(this.kindClasses), this.addClass(this.classes), this.initProps([ "id", "content", "src" ]);
},
destroy(...args) {
this.removeNodeFromDom(), enyo.Control.unregisterDomEvents(this.id), this.inherited(args);
},
importProps(e) {
this.inherited(arguments), this.attributes = enyo.mixin(enyo.clone(this.kindAttributes), this.attributes);
},
initProps(e) {
for (var t = 0, n, r; n = e[t]; t++) this[n] && (r = n + "Changed", this[r] && this[r]());
},
classesChanged(e) {
this.removeClass(e), this.addClass(this.classes);
},
addChild(e) {
e.addClass(this.controlClasses), this.inherited(arguments);
},
removeChild(e) {
this.inherited(arguments), e.removeClass(this.controlClasses);
},
strictlyInternalEvents: {
onenter: 1,
onleave: 1
},
dispatchEvent(e, t, n) {
return this.strictlyInternalEvents[e] && this.isInternalEvent(t) ? !0 : this.inherited(arguments);
},
isInternalEvent(e) {
var t = enyo.dispatcher.findDispatchTarget(e.relatedTarget);
return t && t.isDescendantOf(this);
},
hasNode() {
return this.generated && (this.node || this.findNodeById());
},
addContent(e) {
this.setContent(this.content + e);
},
getAttribute(e) {
return this.hasNode() ? this.node.getAttribute(e) : this.attributes[e];
},
setAttribute(e, t) {
this.attributes[e] = t, this.hasNode() && this.attributeToNode(e, t), this.invalidateTags();
},
getNodeProperty(e, t) {
return this.hasNode() ? this.node[e] : t;
},
setNodeProperty(e, t) {
this.hasNode() && (this.node[e] = t);
},
setClassAttribute(e) {
this.setAttribute("class", e);
},
getClassAttribute() {
return this.attributes["class"] || "";
},
hasClass(e) {
return e && (" " + this.getClassAttribute() + " ").indexOf(" " + e + " ") >= 0;
},
addClass(e) {
if (e && !this.hasClass(e)) {
var t = this.getClassAttribute();
this.setClassAttribute(t + (t ? " " : "") + e);
}
},
removeClass(e) {
if (e && this.hasClass(e)) {
var t = this.getClassAttribute();
t = (" " + t + " ").replace(" " + e + " ", " ").slice(1, -1), this.setClassAttribute(t);
}
},
addRemoveClass(e, t) {
this[t ? "addClass" : "removeClass"](e);
},
initStyles() {
this.domStyles = this.domStyles || {}, enyo.Control.cssTextToDomStyles(this.kindStyle, this.domStyles), this.domCssText = enyo.Control.domStylesToCssText(this.domStyles);
},
styleChanged() {
this.invalidateTags(), this.renderStyles();
},
applyStyle(e, t) {
this.domStyles[e] = t, this.domStylesChanged();
},
addStyles(e) {
enyo.Control.cssTextToDomStyles(e, this.domStyles), this.domStylesChanged();
},
getComputedStyleValue(e, t) {
return this.hasNode() ? enyo.dom.getComputedStyleValue(this.node, e) : t;
},
domStylesChanged() {
this.domCssText = enyo.Control.domStylesToCssText(this.domStyles), this.invalidateTags(), this.renderStyles();
},
stylesToNode() {
this.node.style.cssText = this.style + (this.style[this.style.length - 1] == ";" ? " " : "; ") + this.domCssText;
},
setupBodyFitting() {
enyo.dom.applyBodyFit(), this.addClass("enyo-fit enyo-clip");
},
setupOverflowScrolling() {
if (enyo.platform.android || enyo.platform.androidChrome) return;
document.getElementsByTagName("body")[0].className += " webkitOverflowScrolling";
},
render() {
if (this.parent) {
this.parent.beforeChildRender(this);
if (!this.parent.generated) return this;
}
return this.hasNode() || this.renderNode(), this.hasNode() && (this.renderDom(), this.rendered()), this;
},
renderInto(e) {
this.teardownRender();
var t = enyo.dom.byId(e);
return t == document.body ? this.setupBodyFitting() : this.fit && this.addClass("enyo-fit enyo-clip"), this.setupOverflowScrolling(), t.innerHTML = this.generateHtml(), this.rendered(), this;
},
write() {
return this.fit && this.setupBodyFitting(), this.setupOverflowScrolling(), document.write(this.generateHtml()), this.rendered(), this;
},
rendered() {
this.reflow();
for (var e = 0, t; t = this.children[e]; e++) t.rendered();
},
show() {
this.setShowing(!0);
},
hide() {
this.setShowing(!1);
},
getBounds() {
var e = this.node || this.hasNode() || 0;
return {
left: e.offsetLeft,
top: e.offsetTop,
width: e.offsetWidth,
height: e.offsetHeight
};
},
setBounds(e, t) {
  var n = this.domStyles;
  var r = t || "px";
  var i = [ "width", "height", "left", "top", "right", "bottom" ];
  for (var s = 0, o, u; u = i[s]; s++) {
  o = e[u];
  if (o || o === 0) n[u] = o + (enyo.isString(o) ? "" : r);
  }
  this.domStylesChanged();
},
findNodeById() {
return this.id && (this.node = enyo.dom.byId(this.id));
},
idChanged(e) {
e && enyo.Control.unregisterDomEvents(e), this.setAttribute("id", this.id), this.id && enyo.Control.registerDomEvents(this.id, this);
},
contentChanged() {
this.hasNode() && this.renderContent();
},
getSrc() {
return this.getAttribute("src");
},
srcChanged() {
this.setAttribute("src", enyo.path.rewrite(this.src));
},
attributesChanged() {
this.invalidateTags(), this.renderAttributes();
},
generateHtml() {
  if (this.canGenerate === !1) return "";
  var e = this.generateInnerHtml();
  var t = this.generateOuterHtml(e);
  return this.generated = !0, t;
},
generateInnerHtml() {
return this.flow(), this.children.length ? this.generateChildHtml() : this.allowHtml ? this.content : enyo.Control.escapeHtml(this.content);
},
generateChildHtml() {
var e = "";
for (var t = 0, n; n = this.children[t]; t++) {
var r = n.generateHtml();
e += r;
}
return e;
},
generateOuterHtml(e) {
return this.tag ? (this.tagsValid || this.prepareTags(), this._openTag + e + this._closeTag) : e;
},
invalidateTags() {
this.tagsValid = !1;
},
prepareTags() {
var e = this.domCssText + this.style;
this._openTag = "<" + this.tag + (e ? ' style="' + e + '"' : "") + enyo.Control.attributesToHtml(this.attributes), enyo.Control.selfClosing[this.tag] ? (this._openTag += "/>", this._closeTag = "") : (this._openTag += ">", this._closeTag = "</" + this.tag + ">"), this.tagsValid = !0;
},
attributeToNode(e, t) {
t === null || t === !1 || t === "" ? this.node.removeAttribute(e) : this.node.setAttribute(e, t);
},
attributesToNode() {
for (var e in this.attributes) this.attributeToNode(e, this.attributes[e]);
},
getParentNode() {
return this.parentNode || this.parent && (this.parent.hasNode() || this.parent.getParentNode());
},
addNodeToParent() {
if (this.node) {
var e = this.getParentNode();
e && (this.addBefore !== undefined ? this.insertNodeInParent(e, this.addBefore && this.addBefore.hasNode()) : this.appendNodeToParent(e));
}
},
appendNodeToParent(e) {
e.appendChild(this.node);
},
insertNodeInParent(e, t) {
e.insertBefore(this.node, t || e.firstChild);
},
removeNodeFromDom() {
this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
},
teardownRender() {
this.generated && this.teardownChildren(), this.node = null, this.generated = !1;
},
teardownChildren() {
for (var e = 0, t; t = this.children[e]; e++) t.teardownRender();
},
renderNode() {
this.teardownRender(), this.node = document.createElement(this.tag), this.addNodeToParent(), this.generated = !0;
},
renderDom() {
this.renderAttributes(), this.renderStyles(), this.renderContent();
},
renderContent() {
this.generated && this.teardownChildren(), this.node.innerHTML = this.generateInnerHtml();
},
renderStyles() {
this.hasNode() && this.stylesToNode();
},
renderAttributes() {
this.hasNode() && this.attributesToNode();
},
beforeChildRender() {
this.generated && this.flow();
},
syncDisplayToShowing() {
var e = this.domStyles;
this.showing ? e.display == "none" && this.applyStyle("display", this._displayStyle || "") : (this._displayStyle = e.display == "none" ? "" : e.display, this.applyStyle("display", "none"));
},
showingChanged() {
this.syncDisplayToShowing();
},
getShowing() {
return this.showing = this.domStyles.display != "none";
},
fitChanged(e) {
this.parent.reflow();
},
statics: {
escapeHtml(e) {
return e != null ? String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
registerDomEvents(e, t) {
enyo.$[e] = t;
},
unregisterDomEvents(e) {
enyo.$[e] = null;
},
selfClosing: {
img: 1,
hr: 1,
br: 1,
area: 1,
base: 1,
basefont: 1,
input: 1,
link: 1,
meta: 1,
command: 1,
embed: 1,
keygen: 1,
wbr: 1,
param: 1,
source: 1,
track: 1,
col: 1
},
cssTextToDomStyles(e, t) {
if (e) {
var n = e.replace(/; /g, ";").split(";");
for (var r = 0, i, s, o, u; u = n[r]; r++) i = u.split(":"), s = i.shift(), o = i.join(":"), t[s] = o;
}
},
domStylesToCssText(e) {
  var t;
  var n;
  var r = "";
  for (t in e) n = e[t], n !== null && n !== undefined && n !== "" && (r += t + ":" + n + ";");
  return r;
},
stylesToHtml(e) {
var t = enyo.Control.domStylesToCssText(e);
return t ? ' style="' + t + '"' : "";
},
escapeAttribute(e) {
return enyo.isString(e) ? String(e).replace(/&/g, "&amp;").replace(/\"/g, "&quot;") : e;
},
attributesToHtml(e) {
  var t;
  var n;
  var r = "";
  for (t in e) n = e[t], n !== null && n !== !1 && n !== "" && (r += " " + t + '="' + enyo.Control.escapeAttribute(n) + '"');
  return r;
}
}
}), enyo.defaultCtor = enyo.Control, enyo.Control.subclass = (e, t) => {
var n = e.prototype;
if (n.classes) {
var r = n.kindClasses;
n.kindClasses = (r ? r + " " : "") + n.classes, n.classes = "";
}
if (n.style) {
var i = n.kindStyle;
n.kindStyle = (i ? i + ";" : "") + n.style, n.style = "";
}
if (t.attributes) {
var s = n.kindAttributes;
n.kindAttributes = enyo.mixin(enyo.clone(s), n.attributes), n.attributes = null;
}
};

// platform.js

enyo.platform = {
touch: Boolean("ontouchstart" in window || window.navigator.msPointerEnabled),
gesture: Boolean("ongesturestart" in window || window.navigator.msPointerEnabled)
}, (() => {
  var e = navigator.userAgent;
  var t = enyo.platform;

  var n = [ {
  platform: "androidChrome",
  regex: /Android .* Chrome\/(\d+)[.\d]+/
  }, {
  platform: "android",
  regex: /Android (\d+)/
  }, {
  platform: "android",
  regex: /Silk\/1./,
  forceVersion: 2
  }, {
  platform: "android",
  regex: /Silk\/2./,
  forceVersion: 4
  }, {
  platform: "ie",
  regex: /MSIE (\d+)/
  }, {
  platform: "ios",
  regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/
  }, {
  platform: "webos",
  regex: /(?:web|hpw)OS\/(\d+)/
  }, {
  platform: "safari",
  regex: /Version\/(\d+)[.\d]+\s+Safari/
  }, {
  platform: "chrome",
  regex: /Chrome\/(\d+)[.\d]+/
  }, {
  platform: "androidFirefox",
  regex: /Android;.*Firefox\/(\d+)/
  }, {
  platform: "firefox",
  regex: /Firefox\/(\d+)/
  } ];

  for (var r = 0, i, s, o; i = n[r]; r++) {
  s = i.regex.exec(e);
  if (s) {
  i.forceVersion ? o = i.forceVersion : o = Number(s[1]), t[i.platform] = o;
  break;
  }
  }
  enyo.dumbConsole = Boolean(t.android || t.ios || t.webos);
})();

// animation.js

((() => {
  var e = Math.round(1e3 / 60);
  var t = [ "webkit", "moz", "ms", "o", "" ];
  var n = "requestAnimationFrame";
  var r = "cancel" + enyo.cap(n);
  var i = t => window.setTimeout(t, e);
  var s = e => window.clearTimeout(e);
  for (var o = 0, u = t.length, a, f, l; (a = t[o]) || o < u; o++) {
  if (enyo.platform.ios >= 6) break;
  f = a ? a + enyo.cap(r) : r, l = a ? a + enyo.cap(n) : n;
  if (window[f]) {
  s = window[f], i = window[l], a == "webkit" && s(i(enyo.nop));
  break;
  }
  }
  enyo.requestAnimationFrame = (e, t) => i(e, t), enyo.cancelRequestAnimationFrame = e => s(e);
}))(), enyo.easing = {
cubicIn(e) {
return e ** 3;
},
cubicOut(e) {
return (e - 1) ** 3 + 1;
},
expoOut(e) {
return e == 1 ? 1 : -1 * (2 ** (-10 * e)) + 1;
},
quadInOut(e) {
return e *= 2, e < 1 ? e ** 2 / 2 : -1 * (--e * (e - 2) - 1) / 2;
},
linear(e) {
return e;
}
}, enyo.easedLerp = (e, t, n, r) => {
var i = (enyo.now() - e) / t;
return r ? i >= 1 ? 0 : 1 - n(1 - i) : i >= 1 ? 1 : n(i);
};

// phonegap.js

((() => {
if (window.cordova || window.PhoneGap) {
var e = [ "deviceready", "pause", "resume", "online", "offline", "backbutton", "batterycritical", "batterylow", "batterystatus", "menubutton", "searchbutton", "startcallbutton", "endcallbutton", "volumedownbutton", "volumeupbutton" ];
for (var t = 0, n; n = e[t]; t++) document.addEventListener(n, enyo.bind(enyo.Signals, "send", "on" + n), !1);
}
}))();

// dispatcher.js

enyo.$ = {}, enyo.dispatcher = {
events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input" ],
windowEvents: [ "resize", "load", "unload", "message" ],
features: [],
connect() {
  var e = enyo.dispatcher;
  var t;
  var n;
  for (t = 0; n = e.events[t]; t++) e.listen(document, n);
  for (t = 0; n = e.windowEvents[t]; t++) {
  if (n === "unload" && typeof window.chrome == "object" && window.chrome.app) continue;
  e.listen(window, n);
  }
},
listen(e, t, n) {
var r = enyo.dispatch;
e.addEventListener ? this.listen = (e, t, n) => {
e.addEventListener(t, n || r, !1);
} : this.listen = (e, t, n) => {
e.attachEvent("on" + t, e => (e.target = e.srcElement, e.preventDefault || (e.preventDefault = enyo.iePreventDefault), (n || r)(e)));
}, this.listen(e, t, n);
},
dispatch(e) {
var t = this.findDispatchTarget(e.target) || this.findDefaultTarget(e);
e.dispatchTarget = t;
for (var n = 0, r; r = this.features[n]; n++) if (r.call(this, e) === !0) return;
t && !e.preventDispatch && this.dispatchBubble(e, t);
},
findDispatchTarget(e) {
  var t;
  var n = e;
  try {
  while (n) {
  if (t = enyo.$[n.id]) {
  t.eventNode = n;
  break;
  }
  n = n.parentNode;
  }
  } catch (r) {
  console.log(r, n);
  }
  return t;
},
findDefaultTarget(e) {
return enyo.master;
},
dispatchBubble(e, t) {
return t.bubble("on" + e.type, e, t);
}
}, enyo.iePreventDefault = function() {
this.returnValue = !1;
}, enyo.dispatch = e => enyo.dispatcher.dispatch(e), enyo.bubble = e => {
var t = e || window.event;
t && (t.target || (t.target = t.srcElement), enyo.dispatch(t));
}, enyo.bubbler = "enyo.bubble(arguments[0])", (() => {
var e = function(...args) {
enyo.bubble(args[0]);
};
enyo.makeBubble = function(...args) {
  var t = Array.prototype.slice.call(args, 0);
  var n = t.shift();
  typeof n == "object" && typeof n.hasNode == "function" && enyo.forEach(t, function(t) {
  this.hasNode() && enyo.dispatcher.listen(this.node, t, e);
  }, n);
};
})(), enyo.requiresWindow(enyo.dispatcher.connect);

// preview.js

((() => {
  var e = "previewDomEvent";

  var t = {
  feature(e) {
  t.dispatch(e, e.dispatchTarget);
  },
  dispatch(t, n) {
  var r = this.buildLineage(n);
  for (var i = 0, s; s = r[i]; i++) if (s[e] && s[e](t) === !0) {
  t.preventDispatch = !0;
  return;
  }
  },
  buildLineage(e) {
  var t = [], n = e;
  while (n) t.unshift(n), n = n.parent;
  return t;
  }
  };

  enyo.dispatcher.features.push(t.feature);
}))();

// modal.js

enyo.dispatcher.features.push(function(e) {
  var t = e.dispatchTarget;
  var n = this.captureTarget && !this.noCaptureEvents[e.type];
  var r = n && !(t && t.isDescendantOf && t.isDescendantOf(this.captureTarget));
  if (r) {
    var i = e.captureTarget = this.captureTarget;
    var s = this.autoForwardEvents[e.type] || this.forwardEvents;
    this.dispatchBubble(e, i), s || (e.preventDispatch = !0);
  }
}), enyo.mixin(enyo.dispatcher, {
noCaptureEvents: {
load: 1,
unload: 1,
error: 1
},
autoForwardEvents: {
leave: 1,
resize: 1
},
captures: [],
capture(e, t) {
var n = {
target: e,
forward: t
};
this.captures.push(n), this.setCaptureInfo(n);
},
release() {
this.captures.pop(), this.setCaptureInfo(this.captures[this.captures.length - 1]);
},
setCaptureInfo(e) {
this.captureTarget = e && e.target, this.forwardEvents = e && e.forward;
}
});

// gesture.js

enyo.gesture = {
eventProps: [ "target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey", "detail", "identifier", "dispatchTarget", "which", "srcEvent" ],
makeEvent(e, t) {
var n = {
type: e
};
for (var r = 0, i; i = this.eventProps[r]; r++) n[i] = t[i];
n.srcEvent = n.srcEvent || t, n.preventDefault = this.preventDefault, n.disablePrevention = this.disablePrevention;
if (enyo.platform.ie) {
enyo.platform.ie == 8 && n.target && (n.pageX = n.clientX + n.target.scrollLeft, n.pageY = n.clientY + n.target.scrollTop);
var s = window.event && window.event.button;
n.which = s & 1 ? 1 : s & 2 ? 2 : s & 4 ? 3 : 0;
} else (enyo.platform.webos || window.PalmSystem) && n.which === 0 && (n.which = 1);
return n;
},
down(e) {
var t = this.makeEvent("down", e);
enyo.dispatch(t), this.downEvent = t;
},
move(e) {
var t = this.makeEvent("move", e);
t.dx = t.dy = t.horizontal = t.vertical = 0, t.which && this.downEvent && (t.dx = e.clientX - this.downEvent.clientX, t.dy = e.clientY - this.downEvent.clientY, t.horizontal = Math.abs(t.dx) > Math.abs(t.dy), t.vertical = !t.horizontal), enyo.dispatch(t);
},
up(e) {
  var t = this.makeEvent("up", e);
  var n = !1;
  t.preventTap = () => {
  n = !0;
  }, enyo.dispatch(t), !n && this.downEvent && this.downEvent.which == 1 && this.sendTap(t), this.downEvent = null;
},
over(e) {
enyo.dispatch(this.makeEvent("enter", e));
},
out(e) {
enyo.dispatch(this.makeEvent("leave", e));
},
sendTap(e) {
var t = this.findCommonAncestor(this.downEvent.target, e.target);
if (t) {
var n = this.makeEvent("tap", e);
n.target = t, enyo.dispatch(n);
}
},
findCommonAncestor(e, t) {
var n = t;
while (n) {
if (this.isTargetDescendantOf(e, n)) return n;
n = n.parentNode;
}
},
isTargetDescendantOf(e, t) {
var n = e;
while (n) {
if (n == t) return !0;
n = n.parentNode;
}
}
}, enyo.gesture.preventDefault = function() {
this.srcEvent && this.srcEvent.preventDefault();
}, enyo.gesture.disablePrevention = function() {
this.preventDefault = enyo.nop, this.srcEvent && (this.srcEvent.preventDefault = enyo.nop);
}, enyo.dispatcher.features.push(e => {
if (enyo.gesture.events[e.type]) return enyo.gesture.events[e.type](e);
}), enyo.gesture.events = {
mousedown(e) {
enyo.gesture.down(e);
},
mouseup(e) {
enyo.gesture.up(e);
},
mousemove(e) {
enyo.gesture.move(e);
},
mouseover(e) {
enyo.gesture.over(e);
},
mouseout(e) {
enyo.gesture.out(e);
}
}, enyo.requiresWindow(() => {
document.addEventListener && document.addEventListener("DOMMouseScroll", e => {
var t = enyo.clone(e);
t.preventDefault = () => {
e.preventDefault();
}, t.type = "mousewheel";
var n = t.VERTICAL_AXIS == t.axis ? "wheelDeltaY" : "wheelDeltaX";
t[n] = t.detail * -12, enyo.dispatch(t);
}, !1);
});

// drag.js

enyo.dispatcher.features.push(e => {
if (enyo.gesture.drag[e.type]) return enyo.gesture.drag[e.type](e);
}), enyo.gesture.drag = {
hysteresisSquared: 16,
holdPulseDelay: 200,
trackCount: 5,
minFlick: .1,
minTrack: 8,
down(e) {
this.stopDragging(e), this.cancelHold(), this.target = e.target, this.startTracking(e), this.beginHold(e);
},
move(e) {
if (this.tracking) {
this.track(e);
if (!e.which) {
this.stopDragging(e), this.cancelHold(), this.tracking = !1;
return;
}
this.dragEvent ? this.sendDrag(e) : this.dy * this.dy + this.dx * this.dx >= this.hysteresisSquared && (this.sendDragStart(e), this.cancelHold());
}
},
up(e) {
this.endTracking(e), this.stopDragging(e), this.cancelHold();
},
leave(e) {
this.dragEvent && this.sendDragOut(e);
},
stopDragging(e) {
if (this.dragEvent) {
this.sendDrop(e);
var t = this.sendDragFinish(e);
return this.dragEvent = null, t;
}
},
makeDragEvent(e, t, n, r) {
  var i = Math.abs(this.dx);
  var s = Math.abs(this.dy);
  var o = i > s;
  var u = (o ? s / i : i / s) < .414;

  var a = {
  type: e,
  dx: this.dx,
  dy: this.dy,
  ddx: this.dx - this.lastDx,
  ddy: this.dy - this.lastDy,
  xDirection: this.xDirection,
  yDirection: this.yDirection,
  pageX: n.pageX,
  pageY: n.pageY,
  clientX: n.clientX,
  clientY: n.clientY,
  horizontal: o,
  vertical: !o,
  lockable: u,
  target: t,
  dragInfo: r,
  ctrlKey: n.ctrlKey,
  altKey: n.altKey,
  metaKey: n.metaKey,
  shiftKey: n.shiftKey,
  srcEvent: n.srcEvent
  };

  return enyo.platform.ie == 8 && a.target && (a.pageX = a.clientX + a.target.scrollLeft, a.pageY = a.clientY + a.target.scrollTop), a.preventDefault = enyo.gesture.preventDefault, a.disablePrevention = enyo.gesture.disablePrevention, a;
},
sendDragStart(e) {
this.dragEvent = this.makeDragEvent("dragstart", this.target, e), enyo.dispatch(this.dragEvent);
},
sendDrag(e) {
var t = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
enyo.dispatch(t), t.type = "drag", t.target = this.dragEvent.target, enyo.dispatch(t);
},
sendDragFinish(e) {
var t = this.makeDragEvent("dragfinish", this.dragEvent.target, e, this.dragEvent.dragInfo);
t.preventTap = () => {
e.preventTap && e.preventTap();
}, enyo.dispatch(t);
},
sendDragOut(e) {
var t = this.makeDragEvent("dragout", e.target, e, this.dragEvent.dragInfo);
enyo.dispatch(t);
},
sendDrop(e) {
var t = this.makeDragEvent("drop", e.target, e, this.dragEvent.dragInfo);
t.preventTap = () => {
e.preventTap && e.preventTap();
}, enyo.dispatch(t);
},
startTracking(e) {
this.tracking = !0, this.px0 = e.clientX, this.py0 = e.clientY, this.flickInfo = {
startEvent: e,
moves: []
}, this.track(e);
},
track(e) {
this.lastDx = this.dx, this.lastDy = this.dy, this.dx = e.clientX - this.px0, this.dy = e.clientY - this.py0, this.xDirection = this.calcDirection(this.dx - this.lastDx, 0), this.yDirection = this.calcDirection(this.dy - this.lastDy, 0);
var t = this.flickInfo;
t.moves.push({
x: e.clientX,
y: e.clientY,
t: enyo.now()
}), t.moves.length > this.trackCount && t.moves.shift();
},
endTracking(e) {
  this.tracking = !1;
  var t = this.flickInfo;
  var n = t && t.moves;
  if (n && n.length > 1) {
    var r = n[n.length - 1];
    var i = enyo.now();
    for (var s = n.length - 2, o = 0, u = 0, a = 0, f = 0, l = 0, c = 0, h = 0, p; p = n[s]; s--) {
    o = i - p.t, u = (r.x - p.x) / o, a = (r.y - p.y) / o, c = c || (u < 0 ? -1 : u > 0 ? 1 : 0), h = h || (a < 0 ? -1 : a > 0 ? 1 : 0);
    if (u * c > f * c || a * h > l * h) f = u, l = a;
    }
    var d = Math.sqrt(f * f + l * l);
    d > this.minFlick && this.sendFlick(t.startEvent, f, l, d);
  }
  this.flickInfo = null;
},
calcDirection(e, t) {
return e > 0 ? 1 : e < 0 ? -1 : t;
},
beginHold(e) {
this.holdStart = enyo.now(), this.holdJob = setInterval(enyo.bind(this, "sendHoldPulse", e), this.holdPulseDelay);
},
cancelHold() {
clearInterval(this.holdJob), this.holdJob = null, this.sentHold && (this.sentHold = !1, this.sendRelease(this.holdEvent));
},
sendHoldPulse(e) {
this.sentHold || (this.sentHold = !0, this.sendHold(e));
var t = enyo.gesture.makeEvent("holdpulse", e);
t.holdTime = enyo.now() - this.holdStart, enyo.dispatch(t);
},
sendHold(e) {
this.holdEvent = e;
var t = enyo.gesture.makeEvent("hold", e);
enyo.dispatch(t);
},
sendRelease(e) {
var t = enyo.gesture.makeEvent("release", e);
enyo.dispatch(t);
},
sendFlick(e, t, n, r) {
var i = enyo.gesture.makeEvent("flick", e);
i.xVelocity = t, i.yVelocity = n, i.velocity = r, enyo.dispatch(i);
}
};

// touch.js

enyo.requiresWindow(() => {
  var e = enyo.gesture;
  var t = e.events;
  e.events.touchstart = t => {
  e.events = n, e.events.touchstart(t);
  };
  var n = {
  _touchCount: 0,
  touchstart(t) {
  enyo.job.stop("resetGestureEvents"), this._touchCount += t.changedTouches.length, this.excludedTarget = null;
  var n = this.makeEvent(t);
  e.down(n), n = this.makeEvent(t), this.overEvent = n, e.over(n);
  },
  touchmove(t) {
  enyo.job.stop("resetGestureEvents");
  var n = e.drag.dragEvent;
  this.excludedTarget = n && n.dragInfo && n.dragInfo.node;
  var r = this.makeEvent(t);
  e.move(r), enyo.bodyIsFitting && t.preventDefault(), this.overEvent && this.overEvent.target != r.target && (this.overEvent.relatedTarget = r.target, r.relatedTarget = this.overEvent.target, e.out(this.overEvent), e.over(r)), this.overEvent = r;
  },
  touchend(n) {
  e.up(this.makeEvent(n)), e.out(this.overEvent), this._touchCount -= n.changedTouches.length, enyo.platform.chrome && this._touchCount === 0 && enyo.job("resetGestureEvents", () => {
  e.events = t;
  }, 10);
  },
  makeEvent(e) {
  var t = enyo.clone(e.changedTouches[0]);
  return t.srcEvent = e, t.target = this.findTarget(t), t.which = 1, t;
  },
  calcNodeOffset(e) {
  if (e.getBoundingClientRect) {
  var t = e.getBoundingClientRect();
  return {
  left: t.left,
  top: t.top,
  width: t.width,
  height: t.height
  };
  }
  },
  findTarget(e) {
  return document.elementFromPoint(e.clientX, e.clientY);
  },
  findTargetTraverse(e, t, n) {
    var r = e || document.body;
    var i = this.calcNodeOffset(r);
    if (i && r != this.excludedTarget) {
      var s = t - i.left;
      var o = n - i.top;
      if (s > 0 && o > 0 && s <= i.width && o <= i.height) {
      var u;
      for (var a = r.childNodes, f = a.length - 1, l; l = a[f]; f--) {
      u = this.findTargetTraverse(l, t, n);
      if (u) return u;
      }
      return r;
      }
    }
  },
  connect() {
  enyo.forEach([ "ontouchstart", "ontouchmove", "ontouchend", "ongesturestart", "ongesturechange", "ongestureend" ], e => {
  document[e] = enyo.dispatch;
  }), enyo.platform.androidChrome <= 18 ? this.findTarget = e => document.elementFromPoint(e.screenX, e.screenY) : document.elementFromPoint || (this.findTarget = function(e) {
  return this.findTargetTraverse(null, e.clientX, e.clientY);
  });
  }
  };
  n.connect();
});

// msevents.js

((() => {
  if (window.navigator.msPointerEnabled) {
  var e = [ "MSPointerDown", "MSPointerUp", "MSPointerMove", "MSPointerOver", "MSPointerOut", "MSPointerCancel", "MSGestureTap", "MSGestureDoubleTap", "MSGestureHold", "MSGestureStart", "MSGestureChange", "MSGestureEnd" ];
  enyo.forEach(e, e => {
  enyo.dispatcher.listen(document, e);
  }), enyo.dispatcher.features.push(e => {
  n[e.type] && n[e.type](e);
  });
  }

  var t = (e, t) => {
  var n = enyo.clone(t);
  return enyo.mixin(n, {
  pageX: t.translationX || 0,
  pageY: t.translationY || 0,
  rotation: t.rotation * (180 / Math.PI) || 0,
  type: e,
  srcEvent: t,
  preventDefault: enyo.gesture.preventDefault,
  disablePrevention: enyo.gesture.disablePrevention
  });
  };

  var n = {
  MSGestureStart(e) {
  enyo.dispatch(t("gesturestart", e));
  },
  MSGestureChange(e) {
  enyo.dispatch(t("gesturechange", e));
  },
  MSGestureEnd(e) {
  enyo.dispatch(t("gestureend", e));
  }
  };
}))();

// gesture.js

((() => {
  !enyo.platform.gesture && enyo.platform.touch && enyo.dispatcher.features.push(n => {
  e[n.type] && t[n.type](n);
  });

  var e = {
  touchstart: !0,
  touchmove: !0,
  touchend: !0
  };

  var t = {
  orderedTouches: [],
  gesture: null,
  touchstart(e) {
  enyo.forEach(e.changedTouches, function(e) {
  var t = e.identifier;
  enyo.indexOf(t, this.orderedTouches) < 0 && this.orderedTouches.push(t);
  }, this);
  if (e.touches.length >= 2 && !this.gesture) {
  var t = this.gesturePositions(e);
  this.gesture = this.gestureVector(t), this.gesture.angle = this.gestureAngle(t), this.gesture.scale = 1, this.gesture.rotation = 0;
  var n = this.makeGesture("gesturestart", e, {
  vector: this.gesture,
  scale: 1,
  rotation: 0
  });
  enyo.dispatch(n);
  }
  },
  touchend(e) {
  enyo.forEach(e.changedTouches, function(e) {
  enyo.remove(e.identifier, this.orderedTouches);
  }, this);
  if (e.touches.length <= 1 && this.gesture) {
  var t = e.touches[0] || e.changedTouches[e.changedTouches.length - 1];
  enyo.dispatch(this.makeGesture("gestureend", e, {
  vector: {
  xcenter: t.pageX,
  ycenter: t.pageY
  },
  scale: this.gesture.scale,
  rotation: this.gesture.rotation
  })), this.gesture = null;
  }
  },
  touchmove(e) {
  if (this.gesture) {
  var t = this.makeGesture("gesturechange", e);
  this.gesture.scale = t.scale, this.gesture.rotation = t.rotation, enyo.dispatch(t);
  }
  },
  findIdentifiedTouch(e, t) {
  for (var n = 0, r; r = e[n]; n++) if (r.identifier === t) return r;
  },
  gesturePositions(e) {
  var t = this.findIdentifiedTouch(e.touches, this.orderedTouches[0]), n = this.findIdentifiedTouch(e.touches, this.orderedTouches[this.orderedTouches.length - 1]), r = t.pageX, i = n.pageX, s = t.pageY, o = n.pageY, u = i - r, a = o - s, f = Math.sqrt(u * u + a * a);
  return {
  x: u,
  y: a,
  h: f,
  fx: r,
  lx: i,
  fy: s,
  ly: o
  };
  },
  gestureAngle(e) {
  var t = e, n = Math.asin(t.y / t.h) * (180 / Math.PI);
  return t.x < 0 && (n = 180 - n), t.x > 0 && t.y < 0 && (n += 360), n;
  },
  gestureVector(e) {
  var t = e;
  return {
  magnitude: t.h,
  xcenter: Math.abs(Math.round(t.fx + t.x / 2)),
  ycenter: Math.abs(Math.round(t.fy + t.y / 2))
  };
  },
  makeGesture(e, t, n) {
  var r, i, s;
  if (n) r = n.vector, i = n.scale, s = n.rotation; else {
  var o = this.gesturePositions(t);
  r = this.gestureVector(o), i = r.magnitude / this.gesture.magnitude, s = (360 + this.gestureAngle(o) - this.gesture.angle) % 360;
  }
  var u = enyo.clone(t);
  return enyo.mixin(u, {
  type: e,
  scale: i,
  pageX: r.xcenter,
  pageY: r.ycenter,
  rotation: s
  });
  }
  };
}))();

// ScrollMath.js

enyo.kind({
name: "enyo.ScrollMath",
kind: enyo.Component,
published: {
vertical: !0,
horizontal: !0
},
events: {
onScrollStart: "",
onScroll: "",
onScrollStop: ""
},
kSpringDamping: .93,
kDragDamping: .5,
kFrictionDamping: .97,
kSnapFriction: .9,
kFlickScalar: 15,
kMaxFlick: enyo.platform.android > 2 ? 2 : 1e9,
kFrictionEpsilon: .01,
topBoundary: 0,
rightBoundary: 0,
bottomBoundary: 0,
leftBoundary: 0,
interval: 20,
fixedTime: !0,
x0: 0,
x: 0,
y0: 0,
y: 0,
destroy(...args) {
this.stop(), this.inherited(args);
},
verlet(e) {
var t = this.x;
this.x += t - this.x0, this.x0 = t;
var n = this.y;
this.y += n - this.y0, this.y0 = n;
},
damping(e, t, n, r) {
  var i = .5;
  var s = e - t;
  return Math.abs(s) < i ? t : e * r > t * r ? n * s + t : e;
},
boundaryDamping(e, t, n, r) {
return this.damping(this.damping(e, t, r, 1), n, r, -1);
},
constrain() {
var e = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
e != this.y && (this.y0 = e - (this.y - this.y0) * this.kSnapFriction, this.y = e);
var t = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
t != this.x && (this.x0 = t - (this.x - this.x0) * this.kSnapFriction, this.x = t);
},
friction(e, t, n) {
  var r = this[e] - this[t];
  var i = Math.abs(r) > this.kFrictionEpsilon ? n : 0;
  this[e] = this[t] + i * r;
},
frame: 10,
simulate(e) {
while (e >= this.frame) e -= this.frame, this.dragging || this.constrain(), this.verlet(), this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
return e;
},
animate() {
  this.stop();
  var e = enyo.now();
  var t = 0;
  var n;
  var r;

  var i = enyo.bind(this, function() {
  var s = enyo.now();
  this.job = enyo.requestAnimationFrame(i);
  var o = s - e;
  e = s, this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux), t += Math.max(16, o), this.fixedTime && !this.isInOverScroll() && (t = this.interval), t = this.simulate(t), r != this.y || n != this.x ? this.scroll() : this.dragging || (this.stop(!0), this.scroll()), r = this.y, n = this.x;
  });

  this.job = enyo.requestAnimationFrame(i);
},
start() {
this.job || (this.animate(), this.doScrollStart());
},
stop(e) {
this.job = enyo.cancelRequestAnimationFrame(this.job), e && this.doScrollStop();
},
stabilize() {
  this.start();
  var e = Math.min(this.topBoundary, Math.max(this.bottomBoundary, this.y));
  var t = Math.min(this.leftBoundary, Math.max(this.rightBoundary, this.x));
  this.y = this.y0 = e, this.x = this.x0 = t, this.scroll(), this.stop(!0);
},
startDrag(e) {
this.dragging = !0, this.my = e.pageY, this.py = this.uy = this.y, this.mx = e.pageX, this.px = this.ux = this.x;
},
drag(e) {
if (this.dragging) {
var t = this.vertical ? e.pageY - this.my : 0;
this.uy = t + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
var n = this.horizontal ? e.pageX - this.mx : 0;
return this.ux = n + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), this.start(), !0;
}
},
dragDrop(e) {
if (this.dragging && !window.PalmSystem) {
var t = .5;
this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * t, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * t;
}
this.dragFinish();
},
dragFinish() {
this.dragging = !1;
},
flick(e) {
var t;
this.vertical && (t = e.yVelocity > 0 ? Math.min(this.kMaxFlick, e.yVelocity) : Math.max(-this.kMaxFlick, e.yVelocity), this.y = this.y0 + t * this.kFlickScalar), this.horizontal && (t = e.xVelocity > 0 ? Math.min(this.kMaxFlick, e.xVelocity) : Math.max(-this.kMaxFlick, e.xVelocity), this.x = this.x0 + t * this.kFlickScalar), this.start();
},
mousewheel(e) {
var t = this.vertical ? e.wheelDeltaY || e.wheelDelta : 0;
if (t > 0 && this.y < this.topBoundary || t < 0 && this.y > this.bottomBoundary) return this.stop(!0), this.y = this.y0 = this.y0 + t, this.start(), !0;
},
scroll() {
this.doScroll();
},
scrollTo(e, t) {
e !== null && (this.y = this.y0 - (e + this.y0) * (1 - this.kFrictionDamping)), t !== null && (this.x = this.x0 - (t + this.x0) * (1 - this.kFrictionDamping)), this.start();
},
setScrollX(e) {
this.x = this.x0 = e;
},
setScrollY(e) {
this.y = this.y0 = e;
},
setScrollPosition(e) {
this.setScrollY(e);
},
isScrolling() {
return Boolean(this.job);
},
isInOverScroll() {
return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary || this.y > this.topBoundary || this.y < this.bottomBoundary);
}
});

// ScrollStrategy.js

enyo.kind({
name: "enyo.ScrollStrategy",
tag: null,
published: {
vertical: "default",
horizontal: "default",
scrollLeft: 0,
scrollTop: 0,
maxHeight: null
},
handlers: {
ondragstart: "dragstart",
ondragfinish: "dragfinish",
ondown: "down",
onmove: "move"
},
create(...args) {
this.inherited(args), this.horizontalChanged(), this.verticalChanged(), this.maxHeightChanged();
},
rendered(...args) {
this.inherited(args), enyo.makeBubble(this.container, "scroll"), this.scrollNode = this.calcScrollNode();
},
teardownRender(...args) {
this.inherited(args), this.scrollNode = null;
},
calcScrollNode() {
return this.container.hasNode();
},
horizontalChanged() {
this.container.applyStyle("overflow-x", this.horizontal == "default" ? "auto" : this.horizontal);
},
verticalChanged() {
this.container.applyStyle("overflow-y", this.vertical == "default" ? "auto" : this.vertical);
},
maxHeightChanged() {
this.container.applyStyle("max-height", this.maxHeight);
},
scrollTo(e, t) {
this.scrollNode && (this.setScrollLeft(e), this.setScrollTop(t));
},
scrollToNode(e, t) {
if (this.scrollNode) {
  var n = this.getScrollBounds();
  var r = e;

  var i = {
  height: r.offsetHeight,
  width: r.offsetWidth,
  top: 0,
  left: 0
  };

  while (r && r.parentNode && r.id != this.scrollNode.id) i.top += r.offsetTop, i.left += r.offsetLeft, r = r.parentNode;
  this.setScrollTop(Math.min(n.maxTop, t === !1 ? i.top - n.clientHeight + i.height : i.top)), this.setScrollLeft(Math.min(n.maxLeft, t === !1 ? i.left - n.clientWidth + i.width : i.left));
}
},
scrollIntoView(e, t) {
e.hasNode() && e.node.scrollIntoView(t);
},
isInView(e) {
  var t = this.getScrollBounds();
  var n = e.offsetTop;
  var r = e.offsetHeight;
  var i = e.offsetLeft;
  var s = e.offsetWidth;
  return n >= t.top && n + r <= t.top + t.clientHeight && i >= t.left && i + s <= t.left + t.clientWidth;
},
setScrollTop(e) {
this.scrollTop = e, this.scrollNode && (this.scrollNode.scrollTop = this.scrollTop);
},
setScrollLeft(e) {
this.scrollLeft = e, this.scrollNode && (this.scrollNode.scrollLeft = this.scrollLeft);
},
getScrollLeft() {
return this.scrollNode ? this.scrollNode.scrollLeft : this.scrollLeft;
},
getScrollTop() {
return this.scrollNode ? this.scrollNode.scrollTop : this.scrollTop;
},
_getScrollBounds() {
  var e = this.getScrollSize();
  var t = this.container.hasNode();

  var n = {
  left: this.getScrollLeft(),
  top: this.getScrollTop(),
  clientHeight: t ? t.clientHeight : 0,
  clientWidth: t ? t.clientWidth : 0,
  height: e.height,
  width: e.width
  };

  return n.maxLeft = Math.max(0, n.width - n.clientWidth), n.maxTop = Math.max(0, n.height - n.clientHeight), n;
},
getScrollSize() {
var e = this.scrollNode;
return {
width: e ? e.scrollWidth : 0,
height: e ? e.scrollHeight : 0
};
},
getScrollBounds() {
return this._getScrollBounds();
},
calcStartInfo() {
  var e = this.getScrollBounds();
  var t = this.getScrollTop();
  var n = this.getScrollLeft();
  this.canVertical = e.maxTop > 0 && this.vertical != "hidden", this.canHorizontal = e.maxLeft > 0 && this.horizontal != "hidden", this.startEdges = {
  top: t === 0,
  bottom: t === e.maxTop,
  left: n === 0,
  right: n === e.maxLeft
  };
},
shouldDrag(e) {
var t = e.vertical;
return t && this.canVertical || !t && this.canHorizontal;
},
dragstart(e, t) {
this.dragging = this.shouldDrag(t);
if (this.dragging) return this.preventDragPropagation;
},
dragfinish(e, t) {
this.dragging && (this.dragging = !1, t.preventTap());
},
down(e, t) {
this.calcStartInfo();
},
move(e, t) {
t.which && (this.canVertical && t.vertical || this.canHorizontal && t.horizontal) && t.disablePrevention();
}
});

// Thumb.js

enyo.kind({
name: "enyo.ScrollThumb",
axis: "v",
minSize: 4,
cornerSize: 6,
classes: "enyo-thumb",
create(...args) {
this.inherited(args);
var e = this.axis == "v";
this.dimension = e ? "height" : "width", this.offset = e ? "top" : "left", this.translation = e ? "translateY" : "translateX", this.positionMethod = e ? "getScrollTop" : "getScrollLeft", this.sizeDimension = e ? "clientHeight" : "clientWidth", this.addClass("enyo-" + this.axis + "thumb"), this.transform = enyo.dom.canTransform(), enyo.dom.canAccelerate() && enyo.dom.transformValue(this, "translateZ", 0);
},
sync(e) {
this.scrollBounds = e._getScrollBounds(), this.update(e);
},
update(e) {
if (this.showing) {
  var t = this.dimension;
  var n = this.offset;
  var r = this.scrollBounds[this.sizeDimension];
  var i = this.scrollBounds[t];
  var s = 0;
  var o = 0;
  var u = 0;
  if (r >= i) {
  this.hide();
  return;
  }
  e.isOverscrolling() && (u = e.getOverScrollBounds()["over" + n], s = Math.abs(u), o = Math.max(u, 0));
  var a = e[this.positionMethod]() - u;
  var f = r - this.cornerSize;
  var l = Math.floor(r * r / i - s);
  l = Math.max(this.minSize, l);
  var c = Math.floor(f * a / i + o);
  c = Math.max(0, Math.min(f - this.minSize, c)), this.needed = l < r, this.needed && this.hasNode() ? (this._pos !== c && (this._pos = c, this.transform ? enyo.dom.transformValue(this, this.translation, c + "px") : this.axis == "v" ? this.setBounds({
  top: c + "px"
  }) : this.setBounds({
  left: c + "px"
  })), this._size !== l && (this._size = l, this.node.style[t] = this.domStyles[t] = l + "px")) : this.hide();
}
},
setShowing(e) {
if (e && e != this.showing && this.scrollBounds[this.sizeDimension] >= this.scrollBounds[this.dimension]) return;
this.hasNode() && this.cancelDelayHide();
if (e != this.showing) {
var t = this.showing;
this.showing = e, this.showingChanged(t);
}
},
delayHide(e) {
this.showing && enyo.job(this.id + "hide", enyo.bind(this, "hide"), e || 0);
},
cancelDelayHide() {
enyo.job.stop(this.id + "hide");
}
});

// TouchScrollStrategy.js

enyo.kind({
name: "enyo.TouchScrollStrategy",
kind: "ScrollStrategy",
overscroll: !0,
preventDragPropagation: !0,
published: {
vertical: "default",
horizontal: "default",
thumb: !0,
scrim: !1,
dragDuringGesture: !0
},
events: {
onShouldDrag: ""
},
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
tools: [ {
kind: "ScrollMath",
onScrollStart: "scrollMathStart",
onScroll: "scrollMathScroll",
onScrollStop: "scrollMathStop"
}, {
name: "vthumb",
kind: "ScrollThumb",
axis: "v",
showing: !1
}, {
name: "hthumb",
kind: "ScrollThumb",
axis: "h",
showing: !1
} ],
scrimTools: [ {
name: "scrim",
classes: "enyo-fit",
style: "z-index: 1;",
showing: !1
} ],
components: [ {
name: "client",
classes: "enyo-touch-scroller"
} ],
create(...args) {
this.inherited(args), this.transform = enyo.dom.canTransform(), this.transform || this.overscroll && this.$.client.applyStyle("position", "relative"), this.accel = enyo.dom.canAccelerate();
var e = "enyo-touch-strategy-container";
enyo.platform.ios && this.accel && (e += " enyo-composite"), this.scrimChanged(), this.container.addClass(e), this.translation = this.accel ? "translate3d" : "translate";
},
initComponents(...args) {
this.createChrome(this.tools), this.inherited(args);
},
destroy(...args) {
this.container.removeClass("enyo-touch-strategy-container"), this.inherited(args);
},
rendered(...args) {
this.inherited(args), enyo.makeBubble(this.$.client, "scroll"), this.calcBoundaries(), this.syncScrollMath(), this.thumb && this.alertThumbs();
},
scrimChanged() {
this.scrim && !this.$.scrim && this.makeScrim(), !this.scrim && this.$.scrim && this.$.scrim.destroy();
},
makeScrim() {
var e = this.controlParent;
this.controlParent = null, this.createChrome(this.scrimTools), this.controlParent = e;
var t = this.container.hasNode();
t && (this.$.scrim.parentNode = t, this.$.scrim.render());
},
isScrolling() {
return this.$.scrollMath.isScrolling();
},
isOverscrolling() {
return this.overscroll ? this.$.scrollMath.isInOverScroll() : !1;
},
domScroll() {
this.isScrolling() || (this.calcBoundaries(), this.syncScrollMath(), this.thumb && this.alertThumbs());
},
horizontalChanged() {
this.$.scrollMath.horizontal = this.horizontal != "hidden";
},
verticalChanged() {
this.$.scrollMath.vertical = this.vertical != "hidden";
},
maxHeightChanged() {
this.$.client.applyStyle("max-height", this.maxHeight), this.$.client.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
},
thumbChanged() {
this.hideThumbs();
},
stop() {
this.isScrolling() && this.$.scrollMath.stop(!0);
},
stabilize() {
this.$.scrollMath.stabilize();
},
scrollTo(e, t) {
this.stop(), this.$.scrollMath.scrollTo(t || t === 0 ? t : null, e);
},
scrollIntoView(...args) {
this.stop(), this.inherited(args);
},
setScrollLeft(...args) {
this.stop(), this.inherited(args);
},
setScrollTop(...args) {
this.stop(), this.inherited(args);
},
getScrollLeft(...args) {
return this.isScrolling() ? this.scrollLeft : this.inherited(args);
},
getScrollTop(...args) {
return this.isScrolling() ? this.scrollTop : this.inherited(args);
},
calcScrollNode() {
return this.$.client.hasNode();
},
calcAutoScrolling() {
  var e = this.vertical == "auto";
  var t = this.horizontal == "auto" || this.horizontal == "default";
  if ((e || t) && this.scrollNode) {
  var n = this.getScrollBounds();
  e && (this.$.scrollMath.vertical = n.height > n.clientHeight), t && (this.$.scrollMath.horizontal = n.width > n.clientWidth);
  }
},
shouldDrag(e, t) {
  this.calcAutoScrolling();
  var n = t.vertical;
  var r = this.$.scrollMath.horizontal && !n;
  var i = this.$.scrollMath.vertical && n;
  var s = t.dy < 0;
  var o = t.dx < 0;
  var u = !s && this.startEdges.top || s && this.startEdges.bottom;
  var a = !o && this.startEdges.left || o && this.startEdges.right;
  !t.boundaryDragger && (r || i) && (t.boundaryDragger = this);
  if (!u && i || !a && r) return t.dragger = this, !0;
},
flick(e, t) {
var n = Math.abs(t.xVelocity) > Math.abs(t.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
if (n && this.dragging) return this.$.scrollMath.flick(t), this.preventDragPropagation;
},
hold(e, t) {
if (this.isScrolling() && !this.isOverscrolling()) return this.$.scrollMath.stop(t), !0;
},
move(e, t) {},
dragstart(e, t) {
if (!this.dragDuringGesture && t.srcEvent.touches && t.srcEvent.touches.length > 1) return !0;
this.doShouldDrag(t), this.dragging = t.dragger == this || !t.dragger && t.boundaryDragger == this;
if (this.dragging) {
t.preventDefault(), this.syncScrollMath(), this.$.scrollMath.startDrag(t);
if (this.preventDragPropagation) return !0;
}
},
drag(e, t) {
this.dragging && (t.preventDefault(), this.$.scrollMath.drag(t), this.scrim && this.$.scrim.show());
},
dragfinish(e, t) {
this.dragging && (t.preventTap(), this.$.scrollMath.dragFinish(), this.dragging = !1, this.scrim && this.$.scrim.hide());
},
mousewheel(e, t) {
if (!this.dragging) {
this.calcBoundaries(), this.syncScrollMath();
if (this.$.scrollMath.mousewheel(t)) return t.preventDefault(), !0;
}
},
scrollMathStart(e) {
this.scrollNode && (this.calcBoundaries(), this.thumb && this.showThumbs());
},
scrollMathScroll(e) {
this.overscroll ? this.effectScroll(-e.x, -e.y) : this.effectScroll(-Math.min(e.leftBoundary, Math.max(e.rightBoundary, e.x)), -Math.min(e.topBoundary, Math.max(e.bottomBoundary, e.y))), this.thumb && this.updateThumbs();
},
scrollMathStop(e) {
this.effectScrollStop(), this.thumb && this.delayHideThumbs(100);
},
calcBoundaries() {
  var e = this.$.scrollMath;
  var t = this._getScrollBounds();
  e.bottomBoundary = t.clientHeight - t.height, e.rightBoundary = t.clientWidth - t.width;
},
syncScrollMath() {
var e = this.$.scrollMath;
e.setScrollX(-this.getScrollLeft()), e.setScrollY(-this.getScrollTop());
},
effectScroll(e, t) {
this.scrollNode && (this.scrollLeft = this.scrollNode.scrollLeft = e, this.scrollTop = this.scrollNode.scrollTop = t, this.effectOverscroll(Math.round(e), Math.round(t)));
},
effectScrollStop() {
this.effectOverscroll(null, null);
},
effectOverscroll(e, t) {
  var n = this.scrollNode;
  var r = "0";
  var i = "0";
  var s = this.accel ? ",0" : "";
  t !== null && Math.abs(t - n.scrollTop) > 1 && (i = n.scrollTop - t), e !== null && Math.abs(e - n.scrollLeft) > 1 && (r = n.scrollLeft - e), this.transform ? enyo.dom.transformValue(this.$.client, this.translation, r + "px, " + i + "px" + s) : this.$.client.setBounds({
  left: r + "px",
  top: i + "px"
  });
},
getOverScrollBounds() {
var e = this.$.scrollMath;
return {
overleft: Math.min(e.leftBoundary - e.x, 0) || Math.max(e.rightBoundary - e.x, 0),
overtop: Math.min(e.topBoundary - e.y, 0) || Math.max(e.bottomBoundary - e.y, 0)
};
},
_getScrollBounds(...args) {
var e = this.inherited(args);
return enyo.mixin(e, this.getOverScrollBounds()), e;
},
getScrollBounds(...args) {
return this.stop(), this.inherited(args);
},
alertThumbs() {
this.showThumbs(), this.delayHideThumbs(500);
},
syncThumbs() {
this.$.vthumb.sync(this), this.$.hthumb.sync(this);
},
updateThumbs() {
this.$.vthumb.update(this), this.$.hthumb.update(this);
},
showThumbs() {
this.syncThumbs(), this.$.vthumb.show(), this.$.hthumb.show();
},
hideThumbs() {
this.$.vthumb.hide(), this.$.hthumb.hide();
},
delayHideThumbs(e) {
this.$.vthumb.delayHide(e), this.$.hthumb.delayHide(e);
}
});

// TranslateScrollStrategy.js

enyo.kind({
name: "enyo.TranslateScrollStrategy",
kind: "TouchScrollStrategy",
translateOptimized: !1,
components: [ {
name: "clientContainer",
classes: "enyo-touch-scroller",
components: [ {
name: "client"
} ]
} ],
rendered(...args) {
this.inherited(args), enyo.makeBubble(this.$.clientContainer, "scroll");
},
getScrollSize() {
var e = this.$.client.hasNode();
return {
width: e ? e.scrollWidth : 0,
height: e ? e.scrollHeight : 0
};
},
create(...args) {
this.inherited(args), enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
},
calcScrollNode() {
return this.$.clientContainer.hasNode();
},
maxHeightChanged() {
this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%"), this.$.client.applyStyle("max-height", this.maxHeight), this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
},
shouldDrag(e, t) {
return this.stop(), this.calcStartInfo(), this.inherited(arguments);
},
syncScrollMath(...args) {
this.translateOptimized || this.inherited(args);
},
setScrollLeft(e) {
this.stop();
if (this.translateOptimized) {
var t = this.$.scrollMath;
t.setScrollX(-e), t.stabilize();
} else this.inherited(arguments);
},
setScrollTop(e) {
this.stop();
if (this.translateOptimized) {
var t = this.$.scrollMath;
t.setScrollY(-e), t.stabilize();
} else this.inherited(arguments);
},
getScrollLeft(...args) {
return this.translateOptimized ? this.scrollLeft : this.inherited(args);
},
getScrollTop(...args) {
return this.translateOptimized ? this.scrollTop : this.inherited(args);
},
scrollMathStart(e) {
this.inherited(arguments), this.scrollStarting = !0, this.startX = 0, this.startY = 0, !this.translateOptimized && this.scrollNode && (this.startX = this.getScrollLeft(), this.startY = this.getScrollTop());
},
scrollMathScroll(e) {
this.overscroll ? (this.scrollLeft = -e.x, this.scrollTop = -e.y) : (this.scrollLeft = -Math.min(e.leftBoundary, Math.max(e.rightBoundary, e.x)), this.scrollTop = -Math.min(e.topBoundary, Math.max(e.bottomBoundary, e.y))), this.isScrolling() && (this.$.scrollMath.isScrolling() && this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop), this.thumb && this.updateThumbs());
},
effectScroll(e, t) {
var n = e + "px, " + t + "px" + (this.accel ? ",0" : "");
enyo.dom.transformValue(this.$.client, this.translation, n);
},
effectScrollStop() {
if (!this.translateOptimized) {
  var e = "0,0" + (this.accel ? ",0" : "");
  var t = this.$.scrollMath;
  var n = this._getScrollBounds();
  var r = Boolean(n.maxTop + t.bottomBoundary || n.maxLeft + t.rightBoundary);
  enyo.dom.transformValue(this.$.client, this.translation, r ? null : e), this.setScrollLeft(this.scrollLeft), this.setScrollTop(this.scrollTop), r && enyo.dom.transformValue(this.$.client, this.translation, e);
}
},
twiddle() {
this.translateOptimized && this.scrollNode && (this.scrollNode.scrollTop = 1, this.scrollNode.scrollTop = 0);
},
down: enyo.nop
});

// Scroller.js

enyo.kind({
name: "enyo.Scroller",
published: {
horizontal: "default",
vertical: "default",
scrollTop: 0,
scrollLeft: 0,
maxHeight: null,
touch: !1,
strategyKind: "ScrollStrategy",
thumb: !0
},
events: {
onScrollStart: "",
onScroll: "",
onScrollStop: ""
},
handlers: {
onscroll: "domScroll",
onScrollStart: "scrollStart",
onScroll: "scroll",
onScrollStop: "scrollStop"
},
classes: "enyo-scroller",
touchOverscroll: !0,
preventDragPropagation: !0,
preventScrollPropagation: !0,
statics: {
osInfo: [ {
os: "android",
version: 3
}, {
os: "androidChrome",
version: 18
}, {
os: "androidFirefox",
version: 16
}, {
os: "ios",
version: 5
}, {
os: "webos",
version: 1e9
} ],
hasTouchScrolling() {
for (var e = 0, t, n; t = this.osInfo[e]; e++) if (enyo.platform[t.os]) return !0;
},
hasNativeScrolling() {
for (var e = 0, t, n; t = this.osInfo[e]; e++) if (enyo.platform[t.os] < t.version) return !1;
return !0;
},
getTouchStrategy() {
return enyo.platform.android >= 3 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
}
},
controlParentName: "strategy",
create(...args) {
this.inherited(args), this.horizontalChanged(), this.verticalChanged();
},
importProps(e) {
this.inherited(arguments), e && e.strategyKind === undefined && (enyo.Scroller.touchScrolling || this.touch) && (this.strategyKind = enyo.Scroller.getTouchStrategy());
},
initComponents(...args) {
this.strategyKindChanged(), this.inherited(args);
},
teardownChildren(...args) {
this.cacheScrollPosition(), this.inherited(args);
},
rendered(...args) {
this.inherited(args), this.restoreScrollPosition();
},
strategyKindChanged() {
this.$.strategy && (this.$.strategy.destroy(), this.controlParent = null), this.createStrategy(), this.hasNode() && this.render();
},
createStrategy() {
this.createComponents([ {
name: "strategy",
maxHeight: this.maxHeight,
kind: this.strategyKind,
thumb: this.thumb,
preventDragPropagation: this.preventDragPropagation,
overscroll: this.touchOverscroll,
isChrome: !0
} ]);
},
getStrategy() {
return this.$.strategy;
},
maxHeightChanged() {
this.$.strategy.setMaxHeight(this.maxHeight);
},
showingChanged(...args) {
this.showing || (this.cacheScrollPosition(), this.setScrollLeft(0), this.setScrollTop(0)), this.inherited(args), this.showing && this.restoreScrollPosition();
},
thumbChanged() {
this.$.strategy.setThumb(this.thumb);
},
cacheScrollPosition() {
this.cachedPosition = {
left: this.getScrollLeft(),
top: this.getScrollTop()
};
},
restoreScrollPosition() {
this.cachedPosition && (this.setScrollLeft(this.cachedPosition.left), this.setScrollTop(this.cachedPosition.top), this.cachedPosition = null);
},
horizontalChanged() {
this.$.strategy.setHorizontal(this.horizontal);
},
verticalChanged() {
this.$.strategy.setVertical(this.vertical);
},
setScrollLeft(e) {
this.scrollLeft = e, this.$.strategy.setScrollLeft(this.scrollLeft);
},
setScrollTop(e) {
this.scrollTop = e, this.$.strategy.setScrollTop(e);
},
getScrollLeft() {
return this.$.strategy.getScrollLeft();
},
getScrollTop() {
return this.$.strategy.getScrollTop();
},
getScrollBounds() {
return this.$.strategy.getScrollBounds();
},
scrollIntoView(e, t) {
this.$.strategy.scrollIntoView(e, t);
},
scrollTo(e, t) {
this.$.strategy.scrollTo(e, t);
},
scrollToControl(e, t) {
this.scrollToNode(e.hasNode(), t);
},
scrollToNode(e, t) {
this.$.strategy.scrollToNode(e, t);
},
domScroll(e, t) {
return this.$.strategy.domScroll && t.originator == this && this.$.strategy.scroll(e, t), this.doScroll(t), !0;
},
shouldStopScrollEvent(e) {
return this.preventScrollPropagation && e.originator.owner != this.$.strategy;
},
scrollStart(e, t) {
return this.shouldStopScrollEvent(t);
},
scroll(e, t) {
return t.dispatchTarget ? this.preventScrollPropagation && t.originator != this && t.originator.owner != this.$.strategy : this.shouldStopScrollEvent(t);
},
scrollStop(e, t) {
return this.shouldStopScrollEvent(t);
},
scrollToTop() {
this.setScrollTop(0);
},
scrollToBottom() {
this.setScrollTop(this.getScrollBounds().maxTop);
},
scrollToRight() {
this.setScrollTop(this.getScrollBounds().maxLeft);
},
scrollToLeft() {
this.setScrollLeft(0);
},
stabilize() {
var e = this.getStrategy();
e.stabilize && e.stabilize();
}
}), enyo.Scroller.hasTouchScrolling() && (enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy());

// Animator.js

enyo.kind({
name: "enyo.Animator",
kind: "Component",
published: {
duration: 350,
startValue: 0,
endValue: 1,
node: null,
easingFunction: enyo.easing.cubicOut
},
events: {
onStep: "",
onEnd: "",
onStop: ""
},
constructed(...args) {
this.inherited(args), this._next = enyo.bind(this, "next");
},
destroy(...args) {
this.stop(), this.inherited(args);
},
play(e) {
return this.stop(), this.reversed = !1, e && enyo.mixin(this, e), this.t0 = this.t1 = enyo.now(), this.value = this.startValue, this.job = !0, this.next(), this;
},
stop() {
if (this.isAnimating()) return this.cancel(), this.fire("onStop"), this;
},
reverse() {
if (this.isAnimating()) {
  this.reversed = !this.reversed;
  var e = this.t1 = enyo.now();
  var t = e - this.t0;
  this.t0 = e + t - this.duration;
  var n = this.startValue;
  return this.startValue = this.endValue, this.endValue = n, this;
}
},
isAnimating() {
return Boolean(this.job);
},
requestNext() {
this.job = enyo.requestAnimationFrame(this._next, this.node);
},
cancel() {
enyo.cancelRequestAnimationFrame(this.job), this.node = null, this.job = null;
},
shouldEnd() {
return this.dt >= this.duration;
},
next() {
this.t1 = enyo.now(), this.dt = this.t1 - this.t0;
var e = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction, this.reversed);
this.value = this.startValue + e * (this.endValue - this.startValue), e >= 1 || this.shouldEnd() ? (this.value = this.endValue, this.fraction = 1, this.fire("onStep"), this.fire("onEnd"), this.cancel()) : (this.fire("onStep"), this.requestNext());
},
fire(e) {
var t = this[e];
enyo.isString(t) ? this.bubble(e) : t && t.call(this.context || window, this);
}
});

// BaseLayout.js

enyo.kind({
name: "enyo.BaseLayout",
kind: enyo.Layout,
layoutClass: "enyo-positioned",
reflow() {
enyo.forEach(this.container.children, e => {
e.fit !== null && e.addRemoveClass("enyo-fit", e.fit);
}, this);
}
});

// Image.js

enyo.kind({
name: "enyo.Image",
noEvents: !1,
tag: "img",
attributes: {
draggable: "false"
},
create(...args) {
this.noEvents && (delete this.attributes.onload, delete this.attributes.onerror), this.inherited(args);
},
rendered(...args) {
this.inherited(args), enyo.makeBubble(this, "load", "error");
}
});

// Input.js

enyo.kind({
name: "enyo.Input",
published: {
value: "",
placeholder: "",
type: "",
disabled: !1,
selectOnFocus: !1
},
events: {
onDisabledChange: ""
},
defaultFocus: !1,
tag: "input",
classes: "enyo-input",
handlers: {
onfocus: "focused",
oninput: "input",
onclear: "clear",
ondragstart: "dragstart"
},
create(...args) {
enyo.platform.ie && (this.handlers.onkeyup = "iekeyup"), this.inherited(args), this.placeholderChanged(), this.type && this.typeChanged(), this.valueChanged();
},
rendered(...args) {
this.inherited(args), enyo.makeBubble(this, "focus", "blur"), this.disabledChanged(), this.defaultFocus && this.focus();
},
typeChanged() {
this.setAttribute("type", this.type);
},
placeholderChanged() {
this.setAttribute("placeholder", this.placeholder);
},
disabledChanged() {
this.setAttribute("disabled", this.disabled), this.bubble("onDisabledChange");
},
getValue() {
return this.getNodeProperty("value", this.value);
},
valueChanged() {
this.setAttribute("value", this.value), this.setNodeProperty("value", this.value);
},
iekeyup(e, t) {
  var n = enyo.platform.ie;
  var r = t.keyCode;
  (n <= 8 || n == 9 && (r == 8 || r == 46)) && this.bubble("oninput", t);
},
clear() {
this.setValue("");
},
focus() {
this.hasNode() && this.node.focus();
},
dragstart() {
return !0;
},
focused() {
this.selectOnFocus && enyo.asyncMethod(this, "selectContents");
},
selectContents() {
var e = this.hasNode();
if (e && e.setSelectionRange) e.setSelectionRange(0, e.value.length); else if (e && e.createTextRange) {
var t = e.createTextRange();
t.expand("textedit"), t.select();
}
}
});

// RichText.js

enyo.kind({
name: "enyo.RichText",
classes: "enyo-richtext enyo-selectable",
published: {
allowHtml: !0,
disabled: !1,
value: ""
},
defaultFocus: !1,
statics: {
osInfo: [ {
os: "android",
version: 3
}, {
os: "ios",
version: 5
} ],
hasContentEditable() {
for (var e = 0, t, n; t = enyo.RichText.osInfo[e]; e++) if (enyo.platform[t.os] < t.version) return !1;
return !0;
}
},
kind: enyo.Input,
attributes: {
contenteditable: !0
},
handlers: {
onfocus: "focusHandler",
onblur: "blurHandler"
},
create(...args) {
this.setTag(enyo.RichText.hasContentEditable() ? "div" : "textarea"), this.inherited(args);
},
focusHandler() {
this._value = this.getValue();
},
blurHandler() {
this._value !== this.getValue() && this.bubble("onchange");
},
valueChanged() {
this.hasFocus() ? (this.selectAll(), this.insertAtCursor(this.value)) : this.setPropertyValue("content", this.value, "contentChanged");
},
getValue() {
if (this.hasNode()) return this.node.innerHTML;
},
hasFocus() {
if (this.hasNode()) return document.activeElement === this.node;
},
getSelection() {
if (this.hasFocus()) return window.getSelection();
},
removeSelection(e) {
var t = this.getSelection();
t && t[e ? "collapseToStart" : "collapseToEnd"]();
},
modifySelection(e, t, n) {
var r = this.getSelection();
r && r.modify(e || "move", t, n);
},
moveCursor(e, t) {
this.modifySelection("move", e, t);
},
moveCursorToEnd() {
this.moveCursor("forward", "documentboundary");
},
moveCursorToStart() {
this.moveCursor("backward", "documentboundary");
},
selectAll() {
this.hasFocus() && document.execCommand("selectAll");
},
insertAtCursor(e) {
if (this.hasFocus()) {
var t = this.allowHtml ? e : enyo.Control.escapeHtml(e).replace(/\n/g, "<br/>");
document.execCommand("insertHTML", !1, t);
}
}
});

// TextArea.js

enyo.kind({
name: "enyo.TextArea",
kind: enyo.Input,
tag: "textarea",
classes: "enyo-textarea",
rendered(...args) {
this.inherited(args), this.valueChanged();
}
});

// Select.js

enyo.kind({
name: "enyo.Select",
published: {
selected: 0
},
handlers: {
onchange: "change"
},
tag: "select",
defaultKind: "enyo.Option",
rendered(...args) {
this.inherited(args), this.selectedChanged();
},
getSelected() {
return Number(this.getNodeProperty("selectedIndex", this.selected));
},
setSelected(e) {
this.setPropertyValue("selected", Number(e), "selectedChanged");
},
selectedChanged() {
this.setNodeProperty("selectedIndex", this.selected);
},
change() {
this.selected = this.getSelected();
},
render(...args) {
enyo.platform.ie ? this.parent.render() : this.inherited(args);
},
getValue() {
if (this.hasNode()) return this.node.value;
}
}), enyo.kind({
name: "enyo.Option",
published: {
value: ""
},
tag: "option",
create(...args) {
this.inherited(args), this.valueChanged();
},
valueChanged() {
this.setAttribute("value", this.value);
}
}), enyo.kind({
name: "enyo.OptionGroup",
published: {
label: ""
},
tag: "optgroup",
defaultKind: "enyo.Option",
create(...args) {
this.inherited(args), this.labelChanged();
},
labelChanged() {
this.setAttribute("label", this.label);
}
});

// Group.js

enyo.kind({
name: "enyo.Group",
published: {
highlander: !0,
active: null
},
handlers: {
onActivate: "activate"
},
activate(e, t) {
this.highlander && (t.originator.active ? this.setActive(t.originator) : t.originator == this.active && this.active.setActive(!0));
},
activeChanged(e) {
e && (e.setActive(!1), e.removeClass("active")), this.active && this.active.addClass("active");
}
});

// GroupItem.js

enyo.kind({
name: "enyo.GroupItem",
published: {
active: !1
},
rendered(...args) {
this.inherited(args), this.activeChanged();
},
activeChanged() {
this.bubble("onActivate");
}
});

// ToolDecorator.js

enyo.kind({
name: "enyo.ToolDecorator",
kind: enyo.GroupItem,
classes: "enyo-tool-decorator"
});

// Button.js

enyo.kind({
name: "enyo.Button",
kind: enyo.ToolDecorator,
tag: "button",
published: {
disabled: !1
},
create(...args) {
this.inherited(args), this.disabledChanged();
},
disabledChanged() {
this.setAttribute("disabled", this.disabled);
},
tap() {
if (this.disabled) return !0;
this.setActive(!0);
}
});

// Checkbox.js

enyo.kind({
name: "enyo.Checkbox",
kind: enyo.Input,
classes: "enyo-checkbox",
events: {
onActivate: ""
},
published: {
checked: !1,
active: !1,
type: "checkbox"
},
kindClasses: "",
handlers: {
onchange: "change",
onclick: "click"
},
create(...args) {
this.inherited(args);
},
rendered(...args) {
this.inherited(args), this.active && this.activeChanged(), this.checkedChanged();
},
getChecked() {
return Boolean(this.getNodeProperty("checked", this.checked));
},
checkedChanged() {
this.setNodeProperty("checked", this.checked), this.setAttribute("checked", this.checked ? "checked" : ""), this.setActive(this.checked);
},
activeChanged() {
this.active = Boolean(this.active), this.setChecked(this.active), this.bubble("onActivate");
},
setValue(e) {
this.setChecked(Boolean(e));
},
getValue() {
return this.getChecked();
},
valueChanged() {},
change() {
this.setActive(this.getChecked());
},
click(e, t) {
enyo.platform.ie <= 8 && this.bubble("onchange", t);
}
});

// Repeater.js

enyo.kind({
name: "enyo.Repeater",
published: {
count: 0
},
events: {
onSetupItem: ""
},
create(...args) {
this.inherited(args), this.countChanged();
},
initComponents(...args) {
this.itemComponents = this.components || this.kindComponents, this.components = this.kindComponents = null, this.inherited(args);
},
setCount(e) {
this.setPropertyValue("count", e, "countChanged");
},
countChanged() {
this.build();
},
itemAtIndex(e) {
return this.controlAtIndex(e);
},
build() {
this.destroyClientControls();
for (var e = 0, t; e < this.count; e++) t = this.createComponent({
kind: "enyo.OwnerProxy",
index: e
}), t.createComponents(this.itemComponents), this.doSetupItem({
index: e,
item: t
});
this.render();
},
renderRow(e) {
var t = this.itemAtIndex(e);
this.doSetupItem({
index: e,
item: t
});
}
}), enyo.kind({
name: "enyo.OwnerProxy",
tag: null,
decorateEvent(e, t, n) {
t && (t.index = this.index), this.inherited(arguments);
},
delegateEvent(e, t, n, r, i) {
return e == this && (e = this.owner.owner), this.inherited(arguments, [ e, t, n, r, i ]);
}
});

// DragAvatar.js

enyo.kind({
name: "enyo._DragAvatar",
style: "position: absolute; z-index: 10; pointer-events: none; cursor: move;",
showing: !1,
showingChanged(...args) {
this.inherited(args), document.body.style.cursor = this.showing ? "move" : null;
}
}), enyo.kind({
name: "enyo.DragAvatar",
kind: enyo.Component,
published: {
showing: !1,
offsetX: 20,
offsetY: 30
},
initComponents(...args) {
this.avatarComponents = this.components, this.components = null, this.inherited(args);
},
requireAvatar() {
this.avatar || (this.avatar = this.createComponent({
kind: enyo._DragAvatar,
parentNode: document.body,
showing: !1,
components: this.avatarComponents
}).render());
},
showingChanged() {
this.avatar.setShowing(this.showing), document.body.style.cursor = this.showing ? "move" : null;
},
drag(e) {
this.requireAvatar(), this.avatar.setBounds({
top: e.pageY - this.offsetY,
left: e.pageX + this.offsetX
}), this.show();
},
show() {
this.setShowing(!0);
},
hide() {
this.setShowing(!1);
}
});

// FloatingLayer.js

enyo.kind({
name: "enyo.FloatingLayer",
create(...args) {
this.inherited(args), this.setParent(null);
},
render(...args) {
return this.parentNode = document.body, this.inherited(args);
},
generateInnerHtml() {
return "";
},
beforeChildRender() {
this.hasNode() || this.render();
},
teardownChildren() {}
}), enyo.floatingLayer = new enyo.FloatingLayer;

// Popup.js

enyo.kind({
name: "enyo.Popup",
classes: "enyo-popup",
published: {
modal: !1,
autoDismiss: !0,
floating: !1,
centered: !1
},
showing: !1,
handlers: {
ondown: "down",
onkeydown: "keydown",
ondragstart: "dragstart",
onfocus: "focus",
onblur: "blur",
onRequestShow: "requestShow",
onRequestHide: "requestHide"
},
captureEvents: !0,
events: {
onShow: "",
onHide: ""
},
tools: [ {
kind: "Signals",
onKeydown: "keydown"
} ],
create(...args) {
this.inherited(args), this.canGenerate = !this.floating;
},
render(...args) {
this.floating && (enyo.floatingLayer.hasNode() || enyo.floatingLayer.render(), this.parentNode = enyo.floatingLayer.hasNode()), this.inherited(args);
},
destroy(...args) {
this.showing && this.release(), this.inherited(args);
},
reflow(...args) {
this.updatePosition(), this.inherited(args);
},
calcViewportSize() {
if (window.innerWidth) return {
width: window.innerWidth,
height: window.innerHeight
};
var e = document.documentElement;
return {
width: e.offsetWidth,
height: e.offsetHeight
};
},
updatePosition() {
if (this.centered) {
  var e = this.calcViewportSize();
  var t = this.getBounds();
  this.addStyles("top: " + Math.max((e.height - t.height) / 2, 0) + "px; left: " + Math.max((e.width - t.width) / 2, 0) + "px;");
}
},
showingChanged(...args) {
this.floating && this.showing && !this.hasNode() && this.render(), this.centered && this.applyStyle("visibility", "hidden"), this.inherited(args), this.showing ? (this.resized(), this.captureEvents && this.capture()) : this.captureEvents && this.release(), this.centered && this.applyStyle("visibility", null), this.hasNode() && this[this.showing ? "doShow" : "doHide"]();
},
capture() {
enyo.dispatcher.capture(this, !this.modal);
},
release() {
enyo.dispatcher.release();
},
down(e, t) {
this.downEvent = t, this.modal && !t.dispatchTarget.isDescendantOf(this) && t.preventDefault();
},
tap(e, t) {
if (this.autoDismiss && !t.dispatchTarget.isDescendantOf(this) && this.downEvent && !this.downEvent.dispatchTarget.isDescendantOf(this)) return this.downEvent = null, this.hide(), !0;
},
dragstart(e, t) {
var n = t.dispatchTarget === this || t.dispatchTarget.isDescendantOf(this);
return e.autoDismiss && !n && e.setShowing(!1), !0;
},
keydown(e, t) {
this.showing && this.autoDismiss && t.keyCode == 27 && this.hide();
},
blur(e, t) {
t.dispatchTarget.isDescendantOf(this) && (this.lastFocus = t.originator);
},
focus(e, t) {
var n = t.dispatchTarget;
if (this.modal && !n.isDescendantOf(this)) {
n.hasNode() && n.node.blur();
var r = this.lastFocus && this.lastFocus.hasNode() || this.hasNode();
r && r.focus();
}
},
requestShow(e, t) {
return this.show(), !0;
},
requestHide(e, t) {
return this.hide(), !0;
}
});

// Selection.js

enyo.kind({
name: "enyo.Selection",
kind: enyo.Component,
published: {
multi: !1
},
events: {
onSelect: "",
onDeselect: "",
onChange: ""
},
create(...args) {
this.clear(), this.inherited(args);
},
multiChanged() {
this.multi || this.clear(), this.doChange();
},
highlander(e) {
this.multi || this.deselect(this.lastSelected);
},
clear() {
this.selected = {};
},
isSelected(e) {
return this.selected[e];
},
setByKey(e, t, n) {
if (t) this.selected[e] = n || !0, this.lastSelected = e, this.doSelect({
key: e,
data: this.selected[e]
}); else {
var r = this.isSelected(e);
delete this.selected[e], this.doDeselect({
key: e,
data: r
});
}
this.doChange();
},
deselect(e) {
this.isSelected(e) && this.setByKey(e, !1);
},
select(e, t) {
this.multi ? this.setByKey(e, !this.isSelected(e), t) : this.isSelected(e) || (this.highlander(), this.setByKey(e, !0, t));
},
toggle(e, t) {
!this.multi && this.lastSelected != e && this.deselect(this.lastSelected), this.setByKey(e, !this.isSelected(e), t);
},
getSelected() {
return this.selected;
},
remove(e) {
var t = {};
for (var n in this.selected) n < e ? t[n] = this.selected[n] : n > e && (t[n - 1] = this.selected[n]);
this.selected = t;
}
});
