//* @protected

enyo.logging = {
	// log levels are integers from 0-99
	// 99 is maximum logging
	level: 99,
	// set level to -1 to disable all logging
	levels: {log: 20, warn: 10, error: 0},
	// return true if logging level is lower than the current log level
	shouldLog(inMethod) {
		var ll = parseInt(this.levels[inMethod], 0);
		return (ll <= this.level);
	},
	/*
	formatArgs: function(inMethod, inArgs) {
		var a$ = [];
		for (var i=0, l=inArgs.length, a; (a=inArgs[i]) || i<l; i++) {
			if (String(a) == "[object Object]") {
				a = enyo.json.stringify(a);
			}
			a$.push(a);
		}
		return a$;
	},
	*/
	_log(inMethod, inArgs) {
		//var a$ = enyo.logging.formatArgs(inMethod, inArgs);
		var a$ = enyo.isArray(inArgs) ? inArgs : enyo.cloneArray(inArgs);
		if (enyo.dumbConsole) {
			// at least in early versions of webos, console.* only accept a single argument
			a$ = [a$.join(" ")];
		}
		var fn = console[inMethod];
		if (fn && fn.apply) {
			// some consoles support 'warn', 'info', and so on
			fn.apply(console, a$);
		} else if (console.log.apply) {
			// some consoles support console.log.apply
			console.log(...a$);
		} else {
			// otherwise, do our own formatting
			console.log(a$.join(" "));
		}
	},
	log(inMethod, inArgs) {
		if (window.console) {
			if (this.shouldLog(inMethod)) {
				this._log(inMethod, inArgs);
			}
		}
	}
};

//* @public

/**
	Sets the log level for this window if the input is a real number.

	The log level is used as a watermark to control the amount of logging.

	Setting the log level lower will prevent logging functions with a higher level from being executed.
*/
enyo.setLogLevel = inLevel => {
	var ll = parseInt(inLevel, 0);
	if (isFinite(ll)) {
		enyo.logging.level = ll;
	}
};

/**
	Sends a log message to the console, if the current log level allows for it.

	Objects are converted to JSON automatically.

	Multiple arguments are coerced to String and joined with spaces.
*/
enyo.log = function(...args) {
	enyo.logging.log("log", args);
};

//* Same as _log_, except uses the console's warn method (if it exists).
enyo.warn = function(...args) {
	enyo.logging.log("warn", args);
};

//* Same as _log_, except uses the console's error method (if it exists).
enyo.error = function(...args) {
	enyo.logging.log("error", args);
};
