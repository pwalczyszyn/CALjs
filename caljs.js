//////////////////////////////////////////////////////////////////////////////////////
//
//	Copyright 2012 Piotr Walczyszyn (http://outof.me | @pwalczyszyn)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//
//////////////////////////////////////////////////////////////////////////////////////

// CalJS version 0.0.1

//////////////////////////////////////////////////////////////////////////////////////
//
//	Copyright 2012 Piotr Walczyszyn (http://outof.me | @pwalczyszyn)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//
//////////////////////////////////////////////////////////////////////////////////////

// CalJS version 0.0.1

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        root.CalJS = factory((root.jQuery || root.Zepto || root.ender));
    }
}(this, function ($) {

/**
 * almond 0.1.1 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice,
        main, req;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {},
            nameParts, nameSegment, mapValue, foundMap, i, j, part;

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            return true;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                break;
                            }
                        }
                    }
                }

                foundMap = foundMap || starMap[nameSegment];

                if (foundMap) {
                    nameParts.splice(0, i, foundMap);
                    name = nameParts.join('/');
                    break;
                }
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, ret, map, i;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 3:33 PM
 */

define('Component',[], function () {

        var Component = function (options) {

            this.isTouch = 'ontouchstart' in window;
            this.MOUSE_DOWN_EV = this.isTouch ? 'touchstart' : 'mousedown';
            this.MOUSE_MOVE_EV = this.isTouch ? 'touchmove' : 'mousemove';
            this.MOUSE_UP_EV = this.isTouch ? 'touchend' : 'mouseup';

            this.bindHandler = function bindHandler(handler, thisObject) {
                return function () {
                    handler.apply(thisObject, Array.prototype.slice.call(arguments));
                }
            }

            var handlersMap = {};
            this.on = function on(eventNames, handlerFunction, thisObject) {
                var events = eventNames.split(' ');
                events.forEach(function (eventName) {
                    var handlers = handlersMap[eventName],
                        isOn = false;
                    if (!handlers) {
                        handlers = handlersMap[eventName] = [];
                    } else {
                        isOn = handlers.some(function (ref) {
                            return ref.handlerFunction === handlerFunction;
                        });
                    }
                    if (!isOn) handlers.push({'handlerFunction':handlerFunction, 'thisObject':thisObject});
                }, this);
            }

            this.off = function off(eventNames, handlerFunction) {
                if (typeof eventNames === 'undefined') {
                    for (var eventName in handlersMap) {
                        delete handlersMap[eventName];
                    }
                } else {
                    var events = eventNames.split(' ');
                    events.forEach(function (eventName) {
                        if (typeof handlerFunction === 'undefined') {
                            delete handlersMap[eventName];
                        } else {
                            handlersMap[eventName].forEach(function (ref, index, arr) {
                                if (ref.handlerFunction === handlerFunction) arr.splice(index, 1);
                            }, this);
                        }
                    }, this);
                }
            }

            this.trigger = function trigger(eventName, args) {
                if (typeof eventName !== 'undefined') {
                    var handlers = handlersMap[eventName];
                    if (handlers) {
                        handlers.forEach(function (ref) {
                            var thisObject = typeof ref.thisObject !== 'undefined' ? ref.thisObject : this;
                            if (!Array.isArray(args)) args = [args];
                            ref.handlerFunction.apply(thisObject, args);
                        }, this);
                    }
                }
            }

            this.options = options;
            if (this.options) {
                if (this.options.el) this.setElement(this.options.el);
                if (this.options.model) this.setModel(this.options.model);
            }
        };

        Component.prototype.setElement = function (el) {
            if (!el) el = '<div/>';
            this.$el = $(el); // el can be either CSS selector or DOM element
            this.el = this.$el[0];
        };

        Component.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };

        Component.prototype.setModel = function (model) {
            this.model = model;
        };

        Component.prototype.render = function () {
            return this;
        };

        return Component;
    }
)
;
/**
 * @license RequireJS text 2.0.0 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

define('text',['module'], function (module) {
    

    var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [],
        masterConfig = module.config(),
        text, fs;

    text = {
        version: '2.0.0',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r");
        },

        createXhr: function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i++) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var strip = false, index = name.indexOf("."),
                modName = name.substring(0, index),
                ext = name.substring(index + 1, name.length);

            index = ext.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = ext.substring(index + 1, ext.length);
                strip = strip === "strip";
                ext = ext.substring(0, index);
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var match = text.xdRegExp.exec(url),
                uProtocol, uHostName, uPort;
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName === hostname) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + '.' +
                                     parsed.ext) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (typeof process !== "undefined" &&
             process.versions &&
             !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }
            callback(file);
        };
    } else if (text.createXhr()) {
        text.get = function (url, callback, errback) {
            var xhr = text.createXhr();
            xhr.open('GET', url, true);

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (typeof Packages !== 'undefined') {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                stringBuffer, line,
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                stringBuffer.append(line);

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    }

    return text;
});

define('text!WeekView.tpl!strip',[],function () { return '<cj:WeekView>\n\n</cj:WeekView>\n\n';});

/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define('WeekView',['Component', 'text!WeekView.tpl!strip'], function (Component, WeekViewTpl) {

    var WeekView = function (options) {
        // Setting WeekView template as a root element
        options.el = WeekViewTpl;
        // Calling parent constructor
        Component.call(this, options);

        // Setting current WeekView date
        this.date = options.date;
    };
    WeekView.prototype = Object.create(Component.prototype);

    WeekView.prototype.render = function () {
        return this;
    };

    return WeekView;
});
/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define('MonthView',['Component'], function (Component) {

    var MonthView = function (options) {
        Component.call(this, options);
    };
    MonthView.prototype = Object.create(Component.prototype);

    MonthView.prototype.render = function () {

        return this;
    };

    return MonthView;
});
define('text!Calendar.tpl!strip',[],function () { return '<cj:Calendar xmlns:cj="http://caljs.org/1.0">\n    <cj:NavigationBar>\n\n        <cj:NavigationBarLeft>\n            <cj:Button class="btn-prev up"/>\n            <cj:RangeLabel/>\n        </cj:NavigationBarLeft>\n\n        <cj:NavigationBarRight>\n\n        </cj:NavigationBarRight>\n    </cj:NavigationBar>\n</cj:Calendar>';});

/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 2/22/12
 * Time: 3:50 PM
 */

define('utils/DateHelper',[],function () {

    var DateHelper = function () {
    }

    DateHelper.toISO8601 = function (date) {
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        month = ( month < 10 ) ? '0' + month : month;
        day = ( day < 10 ) ? '0' + day : day;
        hours = ( hours < 10 ) ? '0' + hours : hours;
        minutes = ( minutes < 10 ) ? '0' + minutes : minutes;
        seconds = ( seconds < 10 ) ? '0' + seconds : seconds;

        var tzOffsetSign = "-";
        var tzOffset = date.getTimezoneOffset();
        if (tzOffset < 0) {
            tzOffsetSign = "+";
            tzOffset = -tzOffset;
        }
        var tzOffsetMinutes = tzOffset % 60;
        var tzOffsetHours = (tzOffset - tzOffsetMinutes) / 60;
        var tzOffsetMinutesStr = tzOffsetMinutes < 10 ? "0" + tzOffsetMinutes : "" + tzOffsetMinutes;
        var tzOffsetHoursStr = tzOffsetHours < 10 ? "0" + tzOffsetHours : "" + tzOffsetHours;
        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + ".000" + tzOffsetSign + "" + tzOffsetHoursStr + "" + tzOffsetMinutesStr;

    }

    DateHelper.parseISO8601 = function (string) {
        if ((string == null) || (string == "")) return null;
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2})([0-9]{2})))?)?)?)?";
        var d = string.match(new RegExp(regexp));
        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) {
            date.setMonth(d[3] - 1);
        }
        if (d[5]) {
            date.setDate(d[5]);
        }
        if (d[7]) {
            date.setHours(d[7]);
        }
        if (d[8]) {
            date.setMinutes(d[8]);
        }
        if (d[10]) {
            date.setSeconds(d[10]);
        }
        if (d[12]) {
            date.setMilliseconds(Number("0." + d[12]) * 1000);
        }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset = ((d[15] == '-') ? offset : -offset);
        }
        offset = offset - (date.getTimezoneOffset());
        date.setTime(date.getTime() + offset * 60 * 1000);
        return date;
    }


    var addDays = DateHelper.addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    };

    var firstDayOfWeek = DateHelper.firstDayOfWeek = function (date) {
        var day = date.getDay();
        day = (day == 0) ? -6 : day - 1;
        return addDays(date, -day);
    };

    var hoursInMs = DateHelper.hoursInMs = function (date) {
        return date.getHours() * 60 * 60 * 1000
            + date.getMinutes() * 60 * 1000
            + date.getSeconds() * 1000
            + date.getMilliseconds();
    };

    var sameDates = DateHelper.sameDates = function (date1, date2) {
        return date1.getYear() == date2.getYear() && date1.getMonth() == date2.getMonth()
            && date1.getDate() == date2.getDate();
    };

    var lastDayOfWeek = DateHelper.lastDayOfWeek = function (date) {
        var day = date.getDay();
        (day == 0) || (day = 7 - day);
        return addDays(date, day);
    };

    var nextWeekFirstDay = DateHelper.nextWeekFirstDay = function (date) {
        return addDays(firstDayOfWeek(date), 7);
    };

    var prevWeekFirstDay = DateHelper.prevWeekFirstDay = function (date) {
        return addDays(firstDayOfWeek(date), -7);
    };

    var nextMonthFirstDay = DateHelper.nextMonthFirstDay = function (date) {
        var result = new Date(date);
        result.setMonth(date.getMonth() + 1, 1);
        return result;
    };

    var prevMonthFirstDay = DateHelper.prevMonthFirstDay = function (date) {
        var result = new Date(date);
        result.setMonth(date.getMonth() - 1, 1);
        return result;
    };


    /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */
    var format = DateHelper.format = function () {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = format;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:d,
                    dd:pad(d),
                    ddd:dF.i18n.dayNames[D],
                    dddd:dF.i18n.dayNames[D + 7],
                    m:m + 1,
                    mm:pad(m + 1),
                    mmm:dF.i18n.monthNames[m],
                    mmmm:dF.i18n.monthNames[m + 12],
                    yy:String(y).slice(2),
                    yyyy:y,
                    h:H % 12 || 12,
                    hh:pad(H % 12 || 12),
                    H:H,
                    HH:pad(H),
                    M:M,
                    MM:pad(M),
                    s:s,
                    ss:pad(s),
                    l:pad(L, 3),
                    L:pad(L > 99 ? Math.round(L / 10) : L),
                    t:H < 12 ? "a" : "p",
                    tt:H < 12 ? "am" : "pm",
                    T:H < 12 ? "A" : "P",
                    TT:H < 12 ? "AM" : "PM",
                    Z:utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:(o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings
    format.masks = {
        "default":"ddd mmm dd yyyy HH:MM:ss",
        shortDate:"m/d/yy",
        mediumDate:"mmm d, yyyy",
        longDate:"mmmm d, yyyy",
        fullDate:"dddd, mmmm d, yyyy",
        shortTime:"h:MM TT",
        mediumTime:"h:MM:ss TT",
        longTime:"h:MM:ss TT Z",
        isoDate:"yyyy-mm-dd",
        isoTime:"HH:MM:ss",
        isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    format.i18n = {
        dayNames:[
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames:[
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
            "November", "December"
        ]
    };

    return DateHelper;
});
/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/4/12
 * Time: 4:54 PM
 */

define('utils/TouchButtons',[],function () {

    var isTouch = 'ontouchstart' in window,
        MOUSE_DOWN = isTouch ? 'touchstart' : 'mousedown',
        MOUSE_UP = isTouch ? 'touchend' : 'mouseup';

    $(document).on(MOUSE_DOWN, "cj\\:Button",
        function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var el = this, $el = $(el);

            // Detecting if this is left mouse button
            if ((isTouch && event.originalEvent.touches.length == 1) || (!isTouch && event.which == 1)) {

                $el.removeClass('up down').addClass('active');

                $(document).on(MOUSE_UP, function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    // Remove MOUSE_UP listener
                    $(document).off(MOUSE_UP, arguments.callee);

                    $el.removeClass('active');

                    var groupName = $el.attr('name'),
                        groupButtons = groupName ? $("jc\\:Button[name='" + groupName + "']") : null;

                    if (groupButtons) {

                        if (groupButtons.length > 1) {
                            var wasUp = false;
                            groupButtons.each(function () {
                                if (this == el) {

                                    if ($el.hasClass('up')) {
                                        $el.removeClass('up');
                                        wasUp = true;
                                    }

                                    if (!$el.hasClass('down'))
                                        $el.addClass('down');

                                } else {
                                    var $grpBtn = $(this);
                                    if ($grpBtn.hasClass('down'))
                                        $grpBtn.removeClass('down');

                                    if (!$grpBtn.hasClass('up'))
                                        $grpBtn.addClass('up');
                                }
                            });

                            // tbclick if the button was up
                            if (wasUp) $el.trigger('tbclick');

                        } else {

                            // This is a toggle button
                            if ($el.hasClass('down'))
                                $el.removeClass('down').addClass('up');
                            else
                                $el.removeClass('up').addClass('down');

                            // Toggle button always triggers tbclick no matter what
                            $el.trigger('tbclick');
                        }
                    } else {
                        // Triggering default tbclick event
                        $el.trigger('tbclick');
                    }
                });
            }
        });
});
/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 12:53 PM
 */

define('Calendar',['Component', 'WeekView', 'MonthView', 'text!Calendar.tpl!strip', 'utils/DateHelper', 'utils/TouchButtons'],
    function (Component, WeekView, MonthView, CalendarTpl, DateHelper) {

        var Calendar = function (options) {
            // If el is not specified by the user using div as parent element
            if (!options) options = {el:'<div/>'};

            // Calling base Component type constructor
            Component.call(this, options);

            /**
             * Instance of WeekView
             * @type {WeekView}
             */
            this.weekView = null;

            /**
             * Instance of MonthView
             * @type {MonthView}
             */
            this.monthView = null;

            /**
             * Current visible view
             * @type {MonthView || WeekView}
             */
            this.currentView = null;

            /**
             * Current calendar date
             * @type {Date}
             */
            this.date = options && options.date ? options.date : new Date;

            /**
             * Overriding render function from Component type.
             *
             * @return {Calendar}
             */
            this.render = function render() {
                // Creating $calendar DOM
                this.$calendar = $(CalendarTpl);
                // Registering $calendar event handlers
                this.$calendar.on('tbclick  cj\\:Button.btn-prev', prevBtn_clickHandler);

                // Creating WeekView as initial current view
                this.weekView = this.currentView = new WeekView({model:this.model, date:this.date});
                // Adding range changed handler
                this.weekView.on(Calendar.RANGE_CHANGED, currentView_rangeChangedHandler, this);
                // Adding context menu handler
                this.weekView.on(Calendar.CONTEXT_MENU, currentView_contextMenuHandler, this);
                // Adding mouse or touch down event handler
                this.weekView.$el.on(this.MOUSE_DOWN_EV, this.bindHandler(container_mouseDownHandler, this));

                // Appending current view to the DOM
                this.$calendar.append(this.currentView.el);
                // Rendering current view
                this.currentView.render();

                // Updating calendar period label
                updateCurrentPeriodLabel.call(this);

                // Adding whole calendar to the DOM
                this.$el.html(this.$calendar);

                return this;
            };

            /**
             * Updates RangeLabel content based on currentView.date value.
             *
             * @private
             */
            function updateCurrentPeriodLabel() {
                var label;
                if (this.currentView instanceof WeekView) {
                    var weekStart = DateHelper.firstDayOfWeek(this.currentView.date);
                    var weekEnd = DateHelper.lastDayOfWeek(this.currentView.date);

                    if (weekStart.getMonth() == weekEnd.getMonth())
                        label = DateHelper.format(weekStart, 'mmmm yyyy');
                    else
                        label = DateHelper.format(weekStart, 'mmmm') + ' - '
                            + DateHelper.format(weekEnd, 'mmmm yyyy');

                } else {
                    label = DateHelper.format(this.currentView.date, 'mmmm yyyy');
                }

                this.$calendar.find('cj\\:RangeLabel').html(label);
            }

            /**
             * Displayes popup message when dates range is changed.
             *
             * @private
             */
            function showRangeChangeMessage() {

                // Setting displayed message text
                var messageText = DateHelper.format(this.currentView.rangeStartDate, "mmm d") + ' - '
                    + DateHelper.format(this.currentView.rangeEndDate, "mmm d");

                // Creating message div
                var message = $('<div/>')
                    .html(messageText)
                    .addClass('range-change-message')
                    .appendTo(this.$el);

                // Positioning message
                var messagePosition = {
                    top:this.$el.height() / 2 - (message.height() / 2),
                    left:this.$el.width() / 2 - (message.width() / 2)
                };

                // Displaying message with fadeIn/fadeOut effects
                message
                    .css(messagePosition)
                    .fadeIn(300, function () {
                        $(this)
                            .delay(500)
                            .fadeOut(300, function () {
                                $(this).remove();
                            });
                    });
            }

            function toggleNonWorking() {
                this.currentView.toggleNonWorking();
            }

            function prevBtn_clickHandler(event) {
                console.log('prevBtn clicked!');
            }

            function currentView_rangeChangedHandler() {

            }

            function currentView_contextMenuHandler(entry) {
                this.trigger('contextMenu', entry);
            }

            /**
             * Mouse or touch down handler.
             *
             * @private
             * @param event
             */
            function container_mouseDownHandler(event) {
                alert('mouse down handle');

//            var that = event.data.context;
//
//            // Getting touch point with touch coordinates, this depends on the runtime,
//            // on devices it's part of touches array
//            var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
//                touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;
//
//            // Setting touch point X and Y
//            that.container_mouseDownHandler.touchPoint = {
//                x:touchPoint.pageX,
//                y:touchPoint.pageY
//            };
//
//            if (touchesCount == 1) {
//                // For desktop devices document needs to be a move and up target
//                var moveTarget = $(document);
//
//                // Adding move and up listeners
//                moveTarget.on(that.MOUSE_MOVE_EV, {context:that}, that.container_mouseMoveHandler);
//                moveTarget.on(that.MOUSE_UP_EV, {context:that}, that.container_mouseUpHandler);
//            }
            }


        };
        Calendar.RANGE_CHANGED = 'rangeChanged';
        Calendar.CONTEXT_MENU = 'contextMenu';
        Calendar.prototype = Object.create(Component.prototype);

        return Calendar;
    });
    return {
        Calendar : require('Calendar')
    };
}));