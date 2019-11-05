(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var meteorInstall = Package['modules-runtime'].meteorInstall;

var require = meteorInstall({"node_modules":{"meteor":{"modules":{"server.js":function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/modules/server.js                                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
require("./install-packages.js");
require("./process.js");
require("./reify.js");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"install-packages.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/modules/install-packages.js                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
function install(name, mainModule) {
  var meteorDir = {};

  // Given a package name <name>, install a stub module in the
  // /node_modules/meteor directory called <name>.js, so that
  // require.resolve("meteor/<name>") will always return
  // /node_modules/meteor/<name>.js instead of something like
  // /node_modules/meteor/<name>/index.js, in the rare but possible event
  // that the package contains a file called index.js (#6590).

  if (typeof mainModule === "string") {
    // Set up an alias from /node_modules/meteor/<package>.js to the main
    // module, e.g. meteor/<package>/index.js.
    meteorDir[name + ".js"] = mainModule;
  } else {
    // back compat with old Meteor packages
    meteorDir[name + ".js"] = function (r, e, module) {
      module.exports = Package[name];
    };
  }

  meteorInstall({
    node_modules: {
      meteor: meteorDir
    }
  });
}

// This file will be modified during computeJsOutputFilesMap to include
// install(<name>) calls for every Meteor package.

install("meteor");
install("meteor-base");
install("mobile-experience");
install("npm-mongo");
install("ecmascript-runtime");
install("modules-runtime");
install("modules", "meteor/modules/server.js");
install("ecmascript-runtime-server", "meteor/ecmascript-runtime-server/runtime.js");
install("babel-compiler");
install("ecmascript");
install("base64");
install("promise", "meteor/promise/server.js");
install("babel-runtime", "meteor/babel-runtime/babel-runtime.js");
install("url", "meteor/url/url_server.js");
install("http", "meteor/http/httpcall_server.js");
install("dynamic-import", "meteor/dynamic-import/server.js");
install("ejson", "meteor/ejson/ejson.js");
install("diff-sequence", "meteor/diff-sequence/diff.js");
install("geojson-utils", "meteor/geojson-utils/main.js");
install("id-map", "meteor/id-map/id-map.js");
install("random");
install("mongo-id");
install("ordered-dict", "meteor/ordered-dict/ordered_dict.js");
install("tracker");
install("minimongo", "meteor/minimongo/minimongo_server.js");
install("check", "meteor/check/match.js");
install("retry", "meteor/retry/retry.js");
install("callback-hook", "meteor/callback-hook/hook.js");
install("ddp-common");
install("reload");
install("socket-stream-client", "meteor/socket-stream-client/node.js");
install("ddp-client", "meteor/ddp-client/server/server.js");
install("underscore");
install("rate-limit", "meteor/rate-limit/rate-limit.js");
install("ddp-rate-limiter");
install("logging");
install("routepolicy");
install("boilerplate-generator", "meteor/boilerplate-generator/generator.js");
install("webapp-hashing");
install("webapp", "meteor/webapp/webapp_server.js");
install("ddp-server");
install("ddp");
install("allow-deny");
install("binary-heap");
install("insecure");
install("mongo");
install("blaze-html-templates");
install("reactive-var");
install("standard-minifier-css");
install("standard-minifier-js");
install("server-render", "meteor/server-render/server.js");
install("shim-common", "meteor/shim-common/server.js");
install("es5-shim", "meteor/es5-shim/server.js");
install("shell-server", "meteor/shell-server/main.js");
install("accounts-base", "meteor/accounts-base/server_main.js");
install("tmeasday:check-npm-versions", "meteor/tmeasday:check-npm-versions/check-npm-versions.js");
install("react-meteor-data", "meteor/react-meteor-data/react-meteor-data.jsx");
install("fourseven:scss");
install("service-configuration");
install("localstorage");
install("oauth");
install("accounts-oauth");
install("oauth2");
install("google-oauth", "meteor/google-oauth/namespace.js");
install("accounts-ui");
install("accounts-google");
install("fortawesome:fontawesome");
install("livedata");
install("hot-code-push");
install("launch-screen");
install("jquery");
install("observe-sequence");
install("deps");
install("htmljs");
install("blaze");
install("ui");
install("spacebars");
install("templating-compiler");
install("templating-runtime");
install("templating");
install("autoupdate");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"process.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/modules/process.js                                                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
if (! global.process) {
  try {
    // The application can run `npm install process` to provide its own
    // process stub; otherwise this module will provide a partial stub.
    global.process = require("process");
  } catch (missing) {
    global.process = {};
  }
}

var proc = global.process;

if (Meteor.isServer) {
  // Make require("process") work on the server in all versions of Node.
  meteorInstall({
    node_modules: {
      "process.js": function (r, e, module) {
        module.exports = proc;
      }
    }
  });
} else {
  proc.platform = "browser";
  proc.nextTick = proc.nextTick || Meteor._setImmediate;
}

if (typeof proc.env !== "object") {
  proc.env = {};
}

var hasOwn = Object.prototype.hasOwnProperty;
for (var key in meteorEnv) {
  if (hasOwn.call(meteorEnv, key)) {
    proc.env[key] = meteorEnv[key];
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reify.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/modules/reify.js                                                                                   //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
var Module = module.constructor;
var Mp = Module.prototype;
require("reify/lib/runtime").enable(Mp);
Mp.importSync = Mp.importSync || Mp.import;
Mp.import = Mp.import || Mp.importSync;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"reify":{"lib":{"runtime":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/meteor/modules/node_modules/reify/lib/runtime/index.js                                         //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";

// This module should be compatible with PhantomJS v1, just like the other files
// in reify/lib/runtime. Node 4+ features like const/let and arrow functions are
// not acceptable here, and importing any npm packages should be contemplated
// with extreme skepticism.

var utils = require("./utils.js");
var Entry = require("./entry.js");

// The exports.enable method can be used to enable the Reify runtime for
// specific module objects, or for Module.prototype (where implemented),
// to make the runtime available throughout the entire module system.
exports.enable = function (mod) {
  if (typeof mod.export !== "function" ||
      typeof mod.importSync !== "function") {
    mod.export = moduleExport;
    mod.exportDefault = moduleExportDefault;
    mod.runSetters = runSetters;
    mod.watch = moduleWatch;

    // Used for copying the properties of a namespace object to
    // mod.exports to implement `export * from "module"` syntax.
    mod.makeNsSetter = moduleMakeNsSetter;

    // To be deprecated:
    mod.runModuleSetters = runSetters;
    mod.importSync = importSync;

    return true;
  }

  return false;
};

function moduleWatch(exported, setters, key) {
  utils.setESModule(this.exports);
  Entry.getOrCreate(this.exports, this);

  if (utils.isObject(setters)) {
    Entry.getOrCreate(exported).addSetters(this, setters, key);
  }
}

// If key is provided, it will be used to identify the given setters so
// that they can be replaced if module.importSync is called again with the
// same key. This avoids potential memory leaks from import declarations
// inside loops. The compiler generates these keys automatically (and
// deterministically) when compiling nested import declarations.
function importSync(id, setters, key) {
  return this.watch(this.require(id), setters, key);
}

// Register getter functions for local variables in the scope of an export
// statement. Pass true as the second argument to indicate that the getter
// functions always return the same values.
function moduleExport(getters, constant) {
  utils.setESModule(this.exports);
  var entry = Entry.getOrCreate(this.exports, this);
  entry.addGetters(getters, constant);
  if (this.loaded) {
    // If the module has already been evaluated, then we need to trigger
    // another round of entry.runSetters calls, which begins by calling
    // entry.runModuleGetters(module).
    entry.runSetters();
  }
}

// Register a getter function that always returns the given value.
function moduleExportDefault(value) {
  return this.export({
    default: function () {
      return value;
    }
  }, true);
}

// Platform-specific code should find a way to call this method whenever
// the module system is about to return module.exports from require. This
// might happen more than once per module, in case of dependency cycles,
// so we want Module.prototype.runSetters to run each time.
function runSetters(valueToPassThrough) {
  var entry = Entry.get(this.exports);
  if (entry !== null) {
    entry.runSetters();
  }

  if (this.loaded) {
    // If this module has finished loading, then we must create an Entry
    // object here, so that we can add this module to entry.ownerModules
    // by passing it as the second argument to Entry.getOrCreate.
    Entry.getOrCreate(this.exports, this);
  }

  // Assignments to exported local variables get wrapped with calls to
  // module.runSetters, so module.runSetters returns the
  // valueToPassThrough parameter to allow the value of the original
  // expression to pass through. For example,
  //
  //   export var a = 1;
  //   console.log(a += 3);
  //
  // becomes
  //
  //   module.export("a", () => a);
  //   var a = 1;
  //   console.log(module.runSetters(a += 3));
  //
  // This ensures module.runSetters runs immediately after the assignment,
  // and does not interfere with the larger computation.
  return valueToPassThrough;
}

// Returns a function that takes a namespace object and copies the
// properties of the namespace to module.exports, excluding any "default"
// property (by default, unless includeDefault is truthy), which is useful
// for implementing `export * from "module"`.
function moduleMakeNsSetter(includeDefault) {
  var module = this;
  // Discussion of why the "default" property is skipped:
  // https://github.com/tc39/ecma262/issues/948
  return function (namespace) {
    Object.keys(namespace).forEach(function (key) {
      if (includeDefault || key !== "default") {
        utils.copyKey(key, module.exports, namespace);
      }
    });
  };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},"googleapis":{"package.json":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/googleapis/package.json                                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
exports.name = "googleapis";
exports.version = "27.0.0";
exports.main = "./build/src/index.js";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"build":{"src":{"index.js":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/googleapis/build/src/index.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var googleapis_1 = require("./lib/googleapis");
exports.GoogleApis = googleapis_1.GoogleApis;
var google = new googleapis_1.GoogleApis();
exports.google = google;
//# sourceMappingURL=index.js.map
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"fibers":{"future.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/fibers/future.js                                                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
"use strict";
var Fiber = require('./fibers');
var util = require('util');
module.exports = Future;
Function.prototype.future = function(detach) {
	var fn = this;
	var ret = function() {
		var future = new FiberFuture(fn, this, arguments);
		if (detach) {
			future.detach();
		}
		return future;
	};
	ret.toString = function() {
		return '<<Future '+ fn+ '.future()>>';
	};
	return ret;
};

function Future() {}

/**
 * Run a function(s) in a future context, and return a future to their return value. This is useful
 * for instances where you want a closure to be able to `.wait()`. This also lets you wait for
 * mulitple parallel opertions to run.
 */
Future.task = function(fn) {
	if (arguments.length === 1) {
		return fn.future()();
	} else {
		var future = new Future, pending = arguments.length, error, values = new Array(arguments.length);
		for (var ii = 0; ii < arguments.length; ++ii) {
			arguments[ii].future()().resolve(function(ii, err, val) {
				if (err) {
					error = err;
				}
				values[ii] = val;
				if (--pending === 0) {
					if (error) {
						future.throw(error);
					} else {
						future.return(values);
					}
				}
			}.bind(null, ii));
		}
		return future;
	}
};

/**
 * Wrap node-style async functions to instead return futures. This assumes that the last parameter
 * of the function is a callback.
 *
 * If a single function is passed a future-returning function is created. If an object is passed a
 * new object is returned with all functions wrapped.
 *
 * The value that is returned from the invocation of the underlying function is assigned to the
 * property `_` on the future. This is useful for functions like `execFile` which take a callback,
 * but also return meaningful information.
 *
 * `multi` indicates that this callback will return more than 1 argument after `err`. For example,
 * `child_process.exec()`
 *
 * `suffix` will append a string to every method that was overridden, if you pass an object to
 * `Future.wrap()`. Default is 'Future'.
 *
 * var readFileFuture = Future.wrap(require('fs').readFile);
 * var fs = Future.wrap(require('fs'));
 * fs.readFileFuture('example.txt').wait();
 */
Future.wrap = function(fnOrObject, multi, suffix, stop) {
	if (typeof fnOrObject === 'object') {
		var wrapped = Object.create(fnOrObject);
		for (var ii in fnOrObject) {
			if (wrapped[ii] instanceof Function) {
				wrapped[suffix === undefined ? ii+ 'Future' : ii+ suffix] = Future.wrap(wrapped[ii], multi, suffix, stop);
			}
		}
		return wrapped;
	} else if (typeof fnOrObject === 'function') {
		var fn = function() {
			var future = new Future;
			var args = Array.prototype.slice.call(arguments);
			if (multi) {
				var cb = future.resolver();
				args.push(function(err) {
					cb(err, Array.prototype.slice.call(arguments, 1));
				});
			} else {
				args.push(future.resolver());
			}
			future._ = fnOrObject.apply(this, args);
			return future;
		}
		// Modules like `request` return a function that has more functions as properties. Handle this
		// in some kind of reasonable way.
		if (!stop) {
			var proto = Object.create(fnOrObject);
			for (var ii in fnOrObject) {
				if (fnOrObject.hasOwnProperty(ii) && fnOrObject[ii] instanceof Function) {
					proto[ii] = proto[ii];
				}
			}
			fn.__proto__ = Future.wrap(proto, multi, suffix, true);
		}
		return fn;
	}
};

/**
 * Wait on a series of futures and then return. If the futures throw an exception this function
 * /won't/ throw it back. You can get the value of the future by calling get() on it directly. If
 * you want to wait on a single future you're better off calling future.wait() on the instance.
 */
Future.wait = function wait(/* ... */) {

	// Normalize arguments + pull out a FiberFuture for reuse if possible
	var futures = [], singleFiberFuture;
	for (var ii = 0; ii < arguments.length; ++ii) {
		var arg = arguments[ii];
		if (arg instanceof Future) {
			// Ignore already resolved fibers
			if (arg.isResolved()) {
				continue;
			}
			// Look for fiber reuse
			if (!singleFiberFuture && arg instanceof FiberFuture && !arg.started) {
				singleFiberFuture = arg;
				continue;
			}
			futures.push(arg);
		} else if (arg instanceof Array) {
			for (var jj = 0; jj < arg.length; ++jj) {
				var aarg = arg[jj];
				if (aarg instanceof Future) {
					// Ignore already resolved fibers
					if (aarg.isResolved()) {
						continue;
					}
					// Look for fiber reuse
					if (!singleFiberFuture && aarg instanceof FiberFuture && !aarg.started) {
						singleFiberFuture = aarg;
						continue;
					}
					futures.push(aarg);
				} else {
					throw new Error(aarg+ ' is not a future');
				}
			}
		} else {
			throw new Error(arg+ ' is not a future');
		}
	}

	// Resumes current fiber
	var fiber = Fiber.current;
	if (!fiber) {
		throw new Error('Can\'t wait without a fiber');
	}

	// Resolve all futures
	var pending = futures.length + (singleFiberFuture ? 1 : 0);
	function cb() {
		if (!--pending) {
			fiber.run();
		}
	}
	for (var ii = 0; ii < futures.length; ++ii) {
		futures[ii].resolve(cb);
	}

	// Reusing a fiber?
	if (singleFiberFuture) {
		singleFiberFuture.started = true;
		try {
			singleFiberFuture.return(
				singleFiberFuture.fn.apply(singleFiberFuture.context, singleFiberFuture.args));
		} catch(e) {
			singleFiberFuture.throw(e);
		}
		--pending;
	}

	// Yield this fiber
	if (pending) {
		Fiber.yield();
	}
};

/**
 * Return a Future that waits on an ES6 Promise.
 */
Future.fromPromise = function(promise) {
	var future = new Future;
	promise.then(function(val) {
		future.return(val);
	}, function(err) {
		future.throw(err);
	});
	return future;
};

Future.prototype = {
	/**
	 * Return the value of this future. If the future hasn't resolved yet this will throw an error.
	 */
	get: function() {
		if (!this.resolved) {
			throw new Error('Future must resolve before value is ready');
		} else if (this.error) {
			// Link the stack traces up
			var error = this.error;
			var localStack = {};
			Error.captureStackTrace(localStack, Future.prototype.get);
			var futureStack = Object.getOwnPropertyDescriptor(error, 'futureStack');
			if (!futureStack) {
				futureStack = Object.getOwnPropertyDescriptor(error, 'stack');
				if (futureStack) {
					Object.defineProperty(error, 'futureStack', futureStack);
				}
			}
			if (futureStack && futureStack.get) {
				Object.defineProperty(error, 'stack', {
					get: function() {
						var stack = futureStack.get.apply(error);
						if (stack) {
							stack = stack.split('\n');
							return [stack[0]]
								.concat(localStack.stack.split('\n').slice(1))
								.concat('    - - - - -')
								.concat(stack.slice(1))
								.join('\n');
						} else {
							return localStack.stack;
						}
					},
					set: function(stack) {
						Object.defineProperty(error, 'stack', {
							value: stack,
							configurable: true,
							enumerable: false,
							writable: true,
						});
					},
					configurable: true,
					enumerable: false,
				});
			}
			throw error;
		} else {
			return this.value;
		}
	},

	/**
	 * Mark this future as returned. All pending callbacks will be invoked immediately.
	 */
	"return": function(value) {
		if (this.resolved) {
			throw new Error('Future resolved more than once');
		}
		this.value = value;
		this.resolved = true;

		var callbacks = this.callbacks;
		if (callbacks) {
			delete this.callbacks;
			for (var ii = 0; ii < callbacks.length; ++ii) {
				try {
					var ref = callbacks[ii];
					if (ref[1]) {
						ref[1](value);
					} else {
						ref[0](undefined, value);
					}
				} catch(ex) {
					// console.log('Resolve cb threw', String(ex.stack || ex.message || ex));
					process.nextTick(function() {
						throw(ex);
					});
				}
			}
		}
	},

	/**
	 * Throw from this future as returned. All pending callbacks will be invoked immediately.
	 */
	"throw": function(error) {
		if (this.resolved) {
			throw new Error('Future resolved more than once');
		} else if (!error) {
			throw new Error('Must throw non-empty error');
		}
		this.error = error;
		this.resolved = true;

		var callbacks = this.callbacks;
		if (callbacks) {
			delete this.callbacks;
			for (var ii = 0; ii < callbacks.length; ++ii) {
				try {
					var ref = callbacks[ii];
					if (ref[1]) {
						ref[0].throw(error);
					} else {
						ref[0](error);
					}
				} catch(ex) {
					// console.log('Resolve cb threw', String(ex.stack || ex.message || ex));
					process.nextTick(function() {
						throw(ex);
					});
				}
			}
		}
	},

	/**
	 * "detach" this future. Basically this is useful if you want to run a task in a future, you
	 * aren't interested in its return value, but if it throws you don't want the exception to be
	 * lost. If this fiber throws, an exception will be thrown to the event loop and node will
	 * probably fall down.
	 */
	detach: function() {
		this.resolve(function(err) {
			if (err) {
				throw err;
			}
		});
	},

	/**
	 * Returns whether or not this future has resolved yet.
	 */
	isResolved: function() {
		return this.resolved === true;
	},

	/**
	 * Returns a node-style function which will mark this future as resolved when called.
	 */
	resolver: function() {
		return function(err, val) {
			if (err) {
				this.throw(err);
			} else {
				this.return(val);
			}
		}.bind(this);
	},

	/**
	 * Waits for this future to resolve and then invokes a callback.
	 *
	 * If two arguments are passed, the first argument is a future which will be thrown to in the case
	 * of error, and the second is a function(val){} callback.
	 *
	 * If only one argument is passed it is a standard function(err, val){} callback.
	 */
	resolve: function(arg1, arg2) {
		if (this.resolved) {
			if (arg2) {
				if (this.error) {
					arg1.throw(this.error);
				} else {
					arg2(this.value);
				}
			} else {
				arg1(this.error, this.value);
			}
		} else {
			(this.callbacks = this.callbacks || []).push([arg1, arg2]);
		}
		return this;
	},

	/**
	 * Resolve only in the case of success
	 */
	resolveSuccess: function(cb) {
		this.resolve(function(err, val) {
			if (err) {
				return;
			}
			cb(val);
		});
		return this;
	},

	/**
	 * Propogate results to another future.
	 */
	proxy: function(future) {
		this.resolve(function(err, val) {
			if (err) {
				future.throw(err);
			} else {
				future.return(val);
			}
		});
	},

	/**
	 * Propogate only errors to an another future or array of futures.
	 */
	proxyErrors: function(futures) {
		this.resolve(function(err) {
			if (!err) {
				return;
			}
			if (futures instanceof Array) {
				for (var ii = 0; ii < futures.length; ++ii) {
					futures[ii].throw(err);
				}
			} else {
				futures.throw(err);
			}
		});
		return this;
	},

	/**
	 * Returns an ES6 Promise
	 */
	promise: function() {
		var that = this;
		return new Promise(function(resolve, reject) {
			that.resolve(function(err, val) {
				if (err) {
					reject(err);
				} else {
					resolve(val);
				}
			});
		});
	},

	/**
	 * Differs from its functional counterpart in that it actually resolves the future. Thus if the
	 * future threw, future.wait() will throw.
	 */
	wait: function() {
		if (this.isResolved()) {
			return this.get();
		}
		Future.wait(this);
		return this.get();
	},
};

/**
 * A function call which loads inside a fiber automatically and returns a future.
 */
function FiberFuture(fn, context, args) {
	this.fn = fn;
	this.context = context;
	this.args = args;
	this.started = false;
	var that = this;
	process.nextTick(function() {
		if (!that.started) {
			that.started = true;
			Fiber(function() {
				try {
					that.return(fn.apply(context, args));
				} catch(e) {
					that.throw(e);
				}
			}).run();
		}
	});
}
util.inherits(FiberFuture, Future);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"package.json":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/fibers/package.json                                                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
exports.name = "fibers";
exports.version = "2.0.2";
exports.main = "fibers";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fibers.js":function(require,exports,module,__filename,__dirname){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/fibers/fibers.js                                                                               //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
if (process.fiberLib) {
	module.exports = process.fiberLib;
} else {
	var fs = require('fs'), path = require('path');

	// Seed random numbers [gh-82]
	Math.random();

	// Look for binary for this platform
	var modPath = path.join(__dirname, 'bin', process.platform+ '-'+ process.arch+ '-'+ process.versions.modules, 'fibers');
	try {
		// Pull in fibers implementation
		process.fiberLib = module.exports = require(modPath).Fiber;
	} catch (ex) {
		// No binary!
		console.error(
			'## There is an issue with `node-fibers` ##\n'+
			'`'+ modPath+ '.node` is missing.\n\n'+
			'Try running this to fix the issue: '+ process.execPath+ ' '+ __dirname.replace(' ', '\\ ')+ '/build'
		);
		console.error(ex.stack || ex.message || ex);
		throw new Error('Missing binary. See message above.');
	}

	setupAsyncHacks(module.exports);
}

function setupAsyncHacks(Fiber) {
	// Older (or newer?) versions of node may not support this API
	try {
		var aw = process.binding('async_wrap');
		var getAsyncIdStackSize;

		if (aw.asyncIdStackSize instanceof Function) {
			getAsyncIdStackSize = aw.asyncIdStackSize;
		} else if (aw.constants.kStackLength !== undefined) {
			getAsyncIdStackSize = function(kStackLength) {
				return function() {
					return aw.async_hook_fields[kStackLength];
				};
			}(aw.constants.kStackLength);
		} else {
			throw new Error('Couldn\'t figure out how to get async stack size');
		}

		if (!aw.popAsyncIds || !aw.pushAsyncIds) {
			throw new Error('Push/pop do not exist');
		}

		var kExecutionAsyncId;
		if (aw.constants.kExecutionAsyncId === undefined) {
			kExecutionAsyncId = aw.constants.kCurrentAsyncId;
		} else {
			kExecutionAsyncId = aw.constants.kExecutionAsyncId;
		}
		var kTriggerAsyncId;
		if (aw.constants.kTriggerAsyncId === undefined) {
			kTriggerAsyncId = aw.constants.kCurrentTriggerId;
		} else {
			kTriggerAsyncId = aw.constants.kTriggerAsyncId;
		}

		var asyncIds = aw.async_id_fields || aw.async_uid_fields;

		function getAndClearStack() {
			var ii = getAsyncIdStackSize();
			var stack = new Array(ii);
			for (; ii > 0; --ii) {
				var asyncId = asyncIds[kExecutionAsyncId];
				stack[ii - 1] = {
					asyncId: asyncId,
					triggerId: asyncIds[kTriggerAsyncId],
				};
				aw.popAsyncIds(asyncId);
			}
			return stack;
		}

		function restoreStack(stack) {
			for (var ii = 0; ii < stack.length; ++ii) {
				aw.pushAsyncIds(stack[ii].asyncId, stack[ii].triggerId);
			}
		}

		function wrapFunction(fn) {
			return function() {
				var stack = getAndClearStack();
				try {
					return fn.apply(this, arguments);
				} finally {
					restoreStack(stack);
				}
			}
		}

		// Monkey patch methods which may long jump
		Fiber.yield = wrapFunction(Fiber.yield);
		Fiber.prototype.run = wrapFunction(Fiber.prototype.run);
		Fiber.prototype.throwInto = wrapFunction(Fiber.prototype.throwInto);

	} catch (err) {
		return;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"@babel":{"runtime":{"package.json":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/@babel/runtime/package.json                                                                    //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = {
  "_from": "@babel/runtime@7.0.0-beta.55",
  "_id": "@babel/runtime@7.0.0-beta.55",
  "_inBundle": false,
  "_integrity": "sha1-C8M6paasCwEvN+JbnmqqLkiakWs=",
  "_location": "/@babel/runtime",
  "_phantomChildren": {},
  "_requested": {
    "type": "version",
    "registry": true,
    "raw": "@babel/runtime@7.0.0-beta.55",
    "name": "@babel/runtime",
    "escapedName": "@babel%2fruntime",
    "scope": "@babel",
    "rawSpec": "7.0.0-beta.55",
    "saveSpec": null,
    "fetchSpec": "7.0.0-beta.55"
  },
  "_requiredBy": [
    "#USER",
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.0.0-beta.55.tgz",
  "_shasum": "0bc33aa5a6ac0b012f37e25b9e6aaa2e489a916b",
  "_spec": "@babel/runtime@7.0.0-beta.55",
  "_where": "/home/ben/code/web/yamp",
  "author": {
    "name": "Sebastian McKenzie",
    "email": "sebmck@gmail.com"
  },
  "bundleDependencies": false,
  "dependencies": {
    "core-js": "^2.5.7",
    "regenerator-runtime": "^0.12.0"
  },
  "deprecated": false,
  "description": "babel selfContained runtime",
  "devDependencies": {
    "@babel/core": "7.0.0-beta.55",
    "@babel/helpers": "7.0.0-beta.55",
    "@babel/plugin-transform-runtime": "7.0.0-beta.55",
    "@babel/preset-env": "7.0.0-beta.55",
    "@babel/types": "7.0.0-beta.55"
  },
  "license": "MIT",
  "name": "@babel/runtime",
  "repository": {
    "type": "git",
    "url": "https://github.com/babel/babel/tree/master/packages/babel-runtime"
  },
  "version": "7.0.0-beta.55"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"regenerator":{"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/@babel/runtime/regenerator/index.js                                                            //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.exports = require("regenerator-runtime");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"helpers":{"builtin":{"extends.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/@babel/runtime/helpers/builtin/extends.js                                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
function _extends() {
  module.exports = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

module.exports = _extends;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},"react":{"package.json":function(require,exports){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/react/package.json                                                                             //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
exports.name = "react";
exports.version = "16.2.0";
exports.main = "index.js";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// node_modules/react/index.js                                                                                 //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
var exports = require("/node_modules/meteor/modules/server.js");

/* Exports */
Package._define("modules", exports, {
  meteorInstall: meteorInstall
});

})();
