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
 * Date: 6/6/12
 * Time: 3:44 PM
 */

define('EventDispatcher',[],function () {
        var EventDispatcher = function () {
            this.handlersMap = {};
        };
        EventDispatcher.prototype = Object.create(null, {
            on:{
                value:function on(eventNames, handlerFunction, thisObject) {
                    var events = eventNames.split(' ');
                    events.forEach(function (eventName) {
                        var handlers = this.handlersMap[eventName],
                            isOn = false;
                        if (!handlers) {
                            handlers = this.handlersMap[eventName] = [];
                        } else {
                            isOn = handlers.some(function (ref) {
                                return ref.handlerFunction === handlerFunction;
                            });
                        }
                        if (!isOn) handlers.push({handlerFunction:handlerFunction, thisObject:thisObject});
                    }, this);
                }
            },

            off:{
                value:function off(eventNames, handlerFunction) {
                    if (typeof eventNames === 'undefined') {
                        for (var eventName in this.handlersMap) {
                            delete this.handlersMap[eventName];
                        }
                    } else {
                        var events = eventNames.split(' ');
                        events.forEach(function (eventName) {
                            if (typeof handlerFunction === 'undefined') {
                                delete this.handlersMap[eventName];
                            } else {
                                this.handlersMap[eventName].forEach(function (ref, index, arr) {
                                    if (ref.handlerFunction === handlerFunction) arr.splice(index, 1);
                                }, this);
                            }
                        }, this);
                    }
                }
            },

            trigger:{
                value:function trigger(eventName, args) {
                    if (typeof eventName !== 'undefined') {
                        var handlers = this.handlersMap[eventName];
                        if (handlers) {
                            handlers.forEach(function (ref) {
                                var thisObject = typeof ref.thisObject !== 'undefined' ? ref.thisObject : this;
                                if (!Array.isArray(args)) args = [args];
                                ref.handlerFunction.apply(thisObject, args);
                            }, this);
                        }
                    }
                }
            },

            bind:{
                value:function bind(handler, thisObject) {
                    return function () {
                        handler.apply(thisObject, Array.prototype.slice.call(arguments));
                    }
                }
            }
        });
        return EventDispatcher;
    }
);
/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 3:33 PM
 */

define('Component',['EventDispatcher'], function (EventDispatcher) {

        var Component = function (options) {
            EventDispatcher.call(this);

            this.isTouch = 'ontouchstart' in window;
            this.MOUSE_DOWN_EV = this.isTouch ? 'touchstart' : 'mousedown';
            this.MOUSE_MOVE_EV = this.isTouch ? 'touchmove' : 'mousemove';
            this.MOUSE_UP_EV = this.isTouch ? 'touchend' : 'mouseup';

            this.options = options;
            this.model = options ? options.model : null;
            this.collection = options ? options.collection : null;
            this.setElement(options ? options.el : null);
        };
        Component.prototype = Object.create(EventDispatcher.prototype);

        Component.prototype.setElement = function (el) {
            if (!el) el = '<div/>';
            this.$el = $(el); // el can be either CSS selector or DOM element
            this.el = this.$el[0];
        };

        Component.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };

        Component.prototype.render = function () {
            return this;
        };

        Component.prototype.remove = function remove() {
            this.off();
            this.$el.remove();
        };

        return Component;
    }
);
/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/10/12
 * Time: 4:53 PM
 */

define('EntryBase',['Component'], function (Component) {

    var EntryBase = function (options) {
        Component.call(this, options);

        if (!this.isTouch) {
            this.$el.on('click', this.bind(this._clickHandler, this));
            this.$el.on('contextmenu', this.bind(this._clickHandler, this));
        }

        this.$el.on(this.MOUSE_DOWN_EV, this.bind(this._mouseDownHandler, this));
    };

    EntryBase.prototype = Object.create(Component.prototype, {

        /**
         * Public functions
         */

        select:{
            value:function select() {
                this.$el.addClass('selected');
            }
        },

        unselect:{
            value:function unselect() {
                this.$el.removeClass('selected');
            }
        },

        /**
         * Private functions
         */
        _mouseDownHandler:{
            value:function _mouseDownHandler(event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                // Triggering selected event
                this.trigger('focused', this);

                var that = this,
                // For desktop devices document needs to be a move and up target
                    moveTarget = $(document);

                // Clearing longPress flag
                this._mouseDownHandler.longPress = undefined;

                // Setting new timer to check long press event
                this._mouseDownHandler.longPressTimer = setTimeout(function () {

                    if (that._mouseDownHandler.longPress == undefined) {

                        // Removing move and up listeners
                        moveTarget.off(that.MOUSE_MOVE_EV, that._mouseMoveHandler);
                        moveTarget.off(that.MOUSE_UP_EV, that._mouseUpHandler);

                        that._mouseDownHandler.longPress = true;
                        that.trigger('contextMenu', that);
                    }

                }, 300);

                // Getting touch point with touch coordinates, this depends on the runtime,
                // on devices it's part of touches array
                var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event;

                // Entry element offset
                var elOffset = this.$el.offset();

                // Setting touch point X and Y
                this._mouseDownHandler.touchPoint = {
                    x:touchPoint.pageX,
                    y:touchPoint.pageY,
                    offsetX:touchPoint.pageX - elOffset.left,
                    offsetY:touchPoint.pageY - elOffset.top
                };

                // Adding move and up listeners
                moveTarget.on(this.MOUSE_MOVE_EV, {context:this}, this._mouseMoveHandler);
                moveTarget.on(this.MOUSE_UP_EV, {context:this}, this._mouseUpHandler);
            }
        },

        _mouseMoveHandler:{
            value:function _mouseMoveHandler(event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                var that = event.data.context,
                    dragEvent;

                if (that.dragging) {
                    dragEvent = that._createDragEvent('dragging', event.originalEvent, that);
                    that.trigger(dragEvent.type, dragEvent);
                    return;
                }

                // Getting touch point with touch coordinates, this depends on the runtime,
                // on devices it part of touches array
                var moveTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event;

                // Getting touch point when mouse was down
                var downTouchPoint = that._mouseDownHandler.touchPoint;

                if (that.canDrag && (Math.abs(downTouchPoint.x - moveTouchPoint.pageX) > 20
                    || Math.abs(downTouchPoint.y - moveTouchPoint.pageY) > 20)) {

                    that.dragging = true;
                    that._mouseDownHandler.longPress = false;

                    dragEvent = that._createDragEvent('draggingStart', event.originalEvent, that);
                    that.trigger(dragEvent.type, dragEvent);
                }
            }
        },

        _mouseUpHandler:{
            value:function _mouseUpHandler(event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                var that = event.data.context;
                $(event.currentTarget).off(that.MOUSE_MOVE_EV, that._mouseMoveHandler);
                $(event.currentTarget).off(that.MOUSE_UP_EV, that._mouseUpHandler);

                // Clearing long press timer
                clearTimeout(that._mouseDownHandler.longPressTimer);

                if (that.dragging) {
                    that.dragging = false;
                    var dragEvent = that._createDragEvent('drop', event.originalEvent, that);
                    that.trigger(dragEvent.type, dragEvent);
                }
            }
        },

        _createDragEvent:{
            value:function _createDragEvent(type, originalEvent, target) {
                var touchPoint;
                if (originalEvent.type.indexOf('touch') == 0) {

                    if (originalEvent.touches.length > 0)
                        touchPoint = originalEvent.touches[0];
                    else if (originalEvent.changedTouches.length > 0)
                        touchPoint = originalEvent.changedTouches[0];
                    else
                        throw new Error('Touch point coordinates are not available!');

                } else {
                    touchPoint = originalEvent;
                }

                return {
                    type:type,
                    target:target,
                    clientX:touchPoint.clientX,
                    clientY:touchPoint.clientY,
                    pageX:touchPoint.pageX,
                    pageY:touchPoint.pageY,
                    screenX:touchPoint.screenX,
                    screenY:touchPoint.screenY,
                    offsetX:this._mouseDownHandler.touchPoint.offsetX,
                    offsetY:this._mouseDownHandler.touchPoint.offsetY
                };
            }

        },

        _clickHandler:{
            value:function _clickHandler(event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                // Triggering focused event
                this.trigger('focused', this);

                if (event.button == 2)
                    this.trigger('contextMenu', this);
            }
        }

    });

    return EntryBase;
});
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

    DateHelper.SEC_MS = 1000;

    DateHelper.MINUTE_MS = 60 * DateHelper.SEC_MS;

    DateHelper.HOUR_MS = 60 * DateHelper.MINUTE_MS;

    DateHelper.DAY_MS = 24 * DateHelper.HOUR_MS;

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

define('text!WeekEntry.tpl!strip',[],function () { return '<cj:WeekEntry>\n    <cj:ColorBar></cj:ColorBar>\n    <cj:Content>\n        <cj:Centered>\n            <cj:Label class="week-entry-title"></cj:Label>\n        </cj:Centered>\n    </cj:Content>\n</cj:WeekEntry>\n\n';});

/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/6/12
 * Time: 4:36 PM
 */

define('WeekEntry',['EntryBase', 'utils/DateHelper', 'text!WeekEntry.tpl!strip'],
    function (EntryBase, DateHelper, WeekEntryTemplate) {
        var WeekEntry = function WeekEntry(options) {

            options.el = WeekEntryTemplate;

            EntryBase.call(this, options);

            this.hourHeight = 0;

            this.startDateTime = null;

            this.endDateTime = null;

            this.entryTop = 0;

            this.entryBottom = 0;

            this.$colorBar = this.$('cj\\:ColorBar');

            this.$titleLabel = this.$('cj\\:Content cj\\:Label');

            this.$resizeBarTop = null;

            this.$resizeBarBottom = null;

            this.canDrag = true;

            this.dragging = false;

            // Setting hour height in px
            this.hourHeight = options.hourHeight;

            // Setting entry start date time
            this.startDateTime = options.startDateTime;

            // Setting entry end date time
            this.endDateTime = options.endDateTime;

            // Doing initial measurements
            this.measure();

            // Adding top selection bar if possible
            if (this.startDateTime.getTime() == this.model.get('StartDateTime').getTime()) {
                this.$resizeBarTop = $('<cj:Handle />');
            } else {
                this.canDrag = false;
            }

            // Adding bottom selection bar if possible
            if (this.endDateTime.getTime() == this.model.get('EndDateTime').getTime()) {
                this.$resizeBarBottom = $('<cj:Handle />');
            }

            // Entry render function
            this.renderFn = options.weekEntryRenderFn || this._defaultRender;

            // Model change rerender function
            this.changeFn = options.weekEntryChangeFn || this._defaultRender;

            // Model change handler
            this.model.on('change', this._model_changeHandler, this);
        };

        WeekEntry.prototype = Object.create(EntryBase.prototype, {

            render:{
                value:function render() {
                    return this.renderFn.call(this);
                }
            },

            _defaultRender:{
                value:function _defaultRender() {

                    this.$colorBar.css('background-color', this.model.get('Color'));
                    this.$titleLabel.html(this.model.get('Title'));

                    this.$el.css({top:this.entryTop + 'px', bottom:this.entryBottom + 'px'});

                    if (this.$el.hasClass('selected')) this.select();

                    return this;
                }
            },

            _model_changeHandler:{
                value:function _model_changeHandler() {
                    this.changeFn.call(this);
                }
            },

            measure:{
                value:function measure() {
                    // Calculating duration for a day in ms
                    var duration = this.endDateTime.getTime() - this.startDateTime.getTime();

                    // Calculating millis from beginning of the day
                    var hour = this.startDateTime.getHours() * DateHelper.HOUR_MS +
                        this.startDateTime.getMinutes() * DateHelper.MINUTE_MS +
                        this.startDateTime.getSeconds() * DateHelper.SEC_MS +
                        this.startDateTime.getMilliseconds();

                    // Entry top in px
                    this.entryTop = Math.floor(hour / DateHelper.HOUR_MS * this.hourHeight);

                    // Entry bottom in px
                    this.entryBottom = Math.floor((DateHelper.DAY_MS - (hour + duration)) / DateHelper.HOUR_MS * this.hourHeight);
                }
            },

            _resizeBar_mouseDownHandler:{
                value:function _resizeBar_mouseDownHandler(event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    var that = event.data.context;

                    // Clearing prevPageY
                    that.prevPageY = null;

                    // Clearing prev time change value
                    that.timeChange = null;

                    var moveTarget = $(document);
                    // Adding move and up listeners
                    moveTarget.on(that.MOUSE_MOVE_EV, event.data, that._resizeBar_mouseMoveHandler);
                    moveTarget.on(that.MOUSE_UP_EV, event.data, that._resizeBar_mouseUpHandler);
                }
            },

            _resizeBar_mouseMoveHandler:{
                value:function _resizeBar_mouseMoveHandler(event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    var that = event.data.context,

                    // Checking if this is touch or mouse event
                        touchCoords = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,

                    // Setting yDelta
                        offsetY = that.prevPageY ? touchCoords.pageY - that.prevPageY : 0;

                    that.prevPageY = touchCoords.pageY;

                    // Triggering bar move event
                    that.trigger('barMove', {offsetY:offsetY, bar:event.data.bar, target:that});
                }
            },

            _resizeBar_mouseUpHandler:{
                value:function resizeBar_mouseUpHandler(event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    var that = event.data.context;

                    $(event.currentTarget).off(that.MOUSE_MOVE_EV, that._resizeBar_mouseMoveHandler);
                    $(event.currentTarget).off(that.MOUSE_UP_EV, that._resizeBar_mouseUpHandler);

                    // Triggering bar move end event
                    that.trigger('barMoveEnd', {bar:event.data.bar, target:that});
                }
            },

            select:{
                value:function select() {
                    // Calling super select function
                    EntryBase.prototype.select.call(this);

                    // Adding top selection bar if possible
                    if (this.$resizeBarTop) {
                        this.$resizeBarTop.appendTo(this.$el);
                        this.$resizeBarTop.on(this.MOUSE_DOWN_EV, {context:this, bar:'top'}, this._resizeBar_mouseDownHandler);
                    }

                    // Adding bottom selection bar if possible
                    if (this.$resizeBarBottom) {
                        this.$resizeBarBottom.appendTo(this.$el);
                        this.$resizeBarBottom.on(this.MOUSE_DOWN_EV, {context:this, bar:'bottom'}, this._resizeBar_mouseDownHandler);
                    }
                }
            },

            unselect:{
                value:function unselect() {
                    // Calling super unselect function
                    EntryBase.prototype.unselect.call(this);

                    if (this.$resizeBarTop) {
                        this.$resizeBarTop.detach();
                        this.$resizeBarTop.off(this.MOUSE_DOWN_EV, this._resizeBar_mouseDownHandler);
                    }

                    if (this.$resizeBarBottom) {
                        this.$resizeBarBottom.detach();
                        this.$resizeBarBottom.off(this.MOUSE_DOWN_EV, this._resizeBar_mouseDownHandler);
                    }
                }
            }

        });

        return WeekEntry;
    });
define('text!WeekView.tpl!strip',[],function () { return '<cj:WeekView>\n    <cj:Headers>\n    </cj:Headers>\n    <cj:Scroller>\n        <cj:Container>\n            <cj:LeftHours>\n                <cj:Label class="hour-marker"></cj:Label>\n                <cj:Label class="hour-marker">01 AM</cj:Label>\n                <cj:Label class="hour-marker">02 AM</cj:Label>\n                <cj:Label class="hour-marker">03 AM</cj:Label>\n                <cj:Label class="hour-marker">04 AM</cj:Label>\n                <cj:Label class="hour-marker">05 AM</cj:Label>\n                <cj:Label class="hour-marker">06 AM</cj:Label>\n                <cj:Label class="hour-marker">07 AM</cj:Label>\n                <cj:Label class="hour-marker">08 AM</cj:Label>\n                <cj:Label class="hour-marker">09 AM</cj:Label>\n                <cj:Label class="hour-marker">10 AM</cj:Label>\n                <cj:Label class="hour-marker">11 AM</cj:Label>\n                <cj:Label class="hour-marker">12 PM</cj:Label>\n                <cj:Label class="hour-marker">01 PM</cj:Label>\n                <cj:Label class="hour-marker">02 PM</cj:Label>\n                <cj:Label class="hour-marker">03 PM</cj:Label>\n                <cj:Label class="hour-marker">04 PM</cj:Label>\n                <cj:Label class="hour-marker">05 PM</cj:Label>\n                <cj:Label class="hour-marker">06 PM</cj:Label>\n                <cj:Label class="hour-marker">07 PM</cj:Label>\n                <cj:Label class="hour-marker">08 PM</cj:Label>\n                <cj:Label class="hour-marker">09 PM</cj:Label>\n                <cj:Label class="hour-marker">10 PM</cj:Label>\n                <cj:Label class="hour-marker">11 PM</cj:Label>\n            </cj:LeftHours>\n            <cj:WeekDays>\n            </cj:WeekDays>\n            <cj:RightHours>\n                <cj:Label class="hour-marker"></cj:Label>\n                <cj:Label class="hour-marker">01 AM</cj:Label>\n                <cj:Label class="hour-marker">02 AM</cj:Label>\n                <cj:Label class="hour-marker">03 AM</cj:Label>\n                <cj:Label class="hour-marker">04 AM</cj:Label>\n                <cj:Label class="hour-marker">05 AM</cj:Label>\n                <cj:Label class="hour-marker">06 AM</cj:Label>\n                <cj:Label class="hour-marker">07 AM</cj:Label>\n                <cj:Label class="hour-marker">08 AM</cj:Label>\n                <cj:Label class="hour-marker">09 AM</cj:Label>\n                <cj:Label class="hour-marker">10 AM</cj:Label>\n                <cj:Label class="hour-marker">11 AM</cj:Label>\n                <cj:Label class="hour-marker">12 PM</cj:Label>\n                <cj:Label class="hour-marker">01 PM</cj:Label>\n                <cj:Label class="hour-marker">02 PM</cj:Label>\n                <cj:Label class="hour-marker">03 PM</cj:Label>\n                <cj:Label class="hour-marker">04 PM</cj:Label>\n                <cj:Label class="hour-marker">05 PM</cj:Label>\n                <cj:Label class="hour-marker">06 PM</cj:Label>\n                <cj:Label class="hour-marker">07 PM</cj:Label>\n                <cj:Label class="hour-marker">08 PM</cj:Label>\n                <cj:Label class="hour-marker">09 PM</cj:Label>\n                <cj:Label class="hour-marker">10 PM</cj:Label>\n                <cj:Label class="hour-marker">11 PM</cj:Label>\n            </cj:RightHours>\n        </cj:Container>\n    </cj:Scroller>\n</cj:WeekView>\n\n';});

/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define('WeekView',['Component', 'WeekEntry', 'utils/DateHelper', 'text!WeekView.tpl!strip', 'require'],
    function (Component, WeekEntry, DateHelper, WeekViewTpl, require) {

        var WeekView = function (options) {

            // Setting WeekView template as a root element
            options.el = WeekViewTpl;

            // Initializing model if it's not set
            if (!options.collection) options.collection = [];

            // Calling parent constructor
            Component.call(this, options);

            this.$headers = this.$('cj\\:Headers');

            this.$scroller = this.$('cj\\:Scroller');

            if (this.isTouch) {
                if (typeof iScroll !== 'undefined') {
                    this.scroller = new iScroll(this.$scroller[0], {hScrollbar:false});
                } else {
                    var that = this;
                    require(['iScroll'], function (iScroll) {
                        that.scroller = new iScroll(that.$scroller[0], {hScrollbar:false});
                        that.scroller.scrollTo(0, -(that.currentScrollHour * that.hourHeight), 200);
                    }, function (err) {
                        alert('iScroll not found, please provide it to scroll CalJS week view on devices!');
                    });
                }
            } else {
                this.$headers.addClass('desktop');
                this.$scroller.css('overflow-y', 'scroll');
            }

            this.$container = this.$('cj\\:Container');

            this.$leftHours = this.$('cj\\:LeftHours');

            this.$days = this.$('cj\\:WeekDays');

            this.$rightHours = this.$('cj\\:RightHours');

            this.hourHeight = 0;

            this.currentScrollHour = 7.75;

            this.date = options && options.date ? options.date : new Date;

            this.nonWorkingHidden = options && options.nonWorkingHidden ? options.nonWorkingHidden : false;

            this.nonWorkingDays = options && options.nonWorkingDays ? options.nonWorkingDays : [0, 6];

            this.weekStartDay = options && options.weekStartDay ? options.weekStartDay : 1;

            this.rangeStartDate = null;

            this.rangeEndDate = null;

            this.weekDays = [];

            this.entries = [];

            this.selectedEvent = null;

            this.collection.on('add', this._collection_addHandler, this);
            this.collection.on('remove', this._collection_removeHandler, this);
            this.collection.on('change', this._collection_changeHandler, this);
        };

        WeekView.prototype = Object.create(Component.prototype, {

            _collection_addHandler:{
                value:function _collection_addHandler(calEvent) {
                    this._addCalEvent(calEvent);
                }
            },

            _collection_removeHandler:{
                value:function _collection_removeHandler(calEvent) {
                    this._removeCalEvent(calEvent);
                }
            },

            _collection_changeHandler:{
                value:function _collection_changeHandler(calEvent) {
                    if (calEvent.hasChanged('StartDateTime') || calEvent.hasChanged('EndDateTime'))
                        this._updateCalEvent(calEvent);
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // WeekView navigation functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            showDate:{
                value:function showDate(date) {
                    this.date = date;
                    this.updateView();
                }
            },

            next:{
                value:function next() {
                    this._setCurrentScrollHour();

                    var nextDate = new Date(this.rangeStartDate);
                    nextDate.setDate(nextDate.getDate() + 7);
                    this.showDate(nextDate);

                    this.trigger('rangeChanged');
                }
            },

            prev:{
                value:function prev() {
                    this._setCurrentScrollHour();

                    var prevDate = new Date(this.rangeStartDate);
                    prevDate.setDate(prevDate.getDate() - 7);
                    this.showDate(prevDate);

                    this.trigger('rangeChanged');
                }
            },

            toggleNonWorking:{
                value:function toggleNonWorking() {
                    this._setCurrentScrollHour();

                    this.nonWorkingHidden = !this.nonWorkingHidden;
                    this.updateView();
                }
            },

            _setCurrentScrollHour:{
                value:function () {
                    this.currentScrollHour = -this.$container.position().top / this.hourHeight;
                }
            },

            updateView:{
                value:function updateView() {
                    // Setting week range dates
                    this._setRangeDates();

                    // Setting hour height in px
                    this._measure();

                    // Drawing background grid based on current hour height
                    this._drawCalendarGrid();

                    // Adding weeks entries
                    this._addCalEvents();

                    // Refreshing scroller
                    if (this.scroller) {
                        this.scroller.enable();
                        this.scroller.refresh();
                        this.scroller.scrollTo(0, -(this.currentScrollHour * this.hourHeight), 200);
                    } else {
                        this.$scroller.scrollTop(this.currentScrollHour * this.hourHeight);
                    }
                }
            },

            selectEventEntries:{
                value:function selectEventEntries(calEvent) {
                    this.entries.forEach(function (entry) {

                        if (calEvent == entry.model) entry.select();
                        else if (entry.model == this.selectedEvent) entry.unselect();

                    }, this);

                    this.selectedEvent = calEvent;
                }
            },

            /**
             * Deactivates view
             */
            deactivateView:{
                value:function () {
                    // Measuring current scroll hour before deactivation
                    this._setCurrentScrollHour();
                    // Disabling scroller to preserve resources
                    if (this.scroller) this.scroller.disable();
                }
            },

            _setRangeDates:{
                value:function _setRangeDates() {
                    var weekStartDate = new Date(this.date);
                    weekStartDate.setHours(0, 0, 0, 0);
                    if (weekStartDate.getDay() < this.weekStartDay)
                        weekStartDate.setDate(weekStartDate.getDate() + (this.weekStartDay - weekStartDate.getDay()) - 7);
                    else
                        weekStartDate.setDate(weekStartDate.getDate() + (this.weekStartDay - weekStartDate.getDay()));
                    this.rangeStartDate = weekStartDate;

                    var weekEndDate = new Date(weekStartDate);
                    weekEndDate.setHours(23, 59, 59, 999);
                    weekEndDate.setDate(weekStartDate.getDate() + 6);
                    this.rangeEndDate = weekEndDate;
                }
            },

            _measure:{
                value:function _measure() {
                    var hh = Math.floor(this.$scroller.height() / 9.5),
                        hhMod = hh % 4;
                    this.hourHeight = (hhMod != 0) ? hh + (4 - hhMod) : hh;
                }
            },

            _drawCalendarGrid:{
                value:function _drawCalendarGrid() {
                    var $header,
                        $day,
                    // Number of visible days
                        visibleDaysCount = this.nonWorkingHidden ? 7 - this.nonWorkingDays.length : 7,
                    // Width of a day in %
                        dayWidth = Math.floor(100 / visibleDaysCount),
                    // Width of a last day in %
                        firstDayMargin = (100 - visibleDaysCount * dayWidth) / 2,

                        day = this.rangeStartDate,
                        now = new Date,
                        headers = [],
                        days = [];

                    this.weekDays.length = 0;

                    for (var i = 0; i < 7; i++) {
                        if (this.nonWorkingHidden && this.nonWorkingDays.indexOf(day.getDay()) >= 0)
                            continue;

                        // Creating new day column
                        $header = $('<cj:WeekDayHeader><cj:Label>' + DateHelper.format(day, "d")
                            + '</cj:Label><cj:Label>' + DateHelper.format(day, "ddd") + '</cj:Label></cj:WeekDayHeader>')
                            .css('width', dayWidth + '%');

                        // Creating new day column
                        $day = $('<cj:WeekDay/>').css({
                            'background-size':'100% ' + this.hourHeight + 'px',
                            width:dayWidth + '%',
                            height:this.hourHeight * 24
                        });

                        // Setting margin for first day of a week
                        if (i == 0) {
                            $day.css('margin-left', firstDayMargin + '%');
                            $header.css('margin-left', firstDayMargin + '%');
                        }

                        // Setting today class
                        if (day.getYear() == now.getYear() && day.getMonth() == now.getMonth() && day.getDate() == now.getDate()) {
                            $day.addClass('today');
                            $header.addClass('today');
                        }

                        // Setting non-working class
                        if (this.nonWorkingDays.indexOf(day.getDay()) >= 0) {
                            $day.addClass('non-working');
                            $header.addClass('non-working');
                        }

                        // Adding to local array
                        headers.push($header[0]);

                        // Adding to local array
                        days.push($day[0]);

                        // Pushing day date into the weekDays array
                        this.weekDays.push(day);

                        // Incrementing to next day
                        day = DateHelper.addDays(day, 1);
                    }

                    // Setting days canvas height, this +1 is additional pixel for bottom border
                    this.$container.height(this.hourHeight * 24 + 3);

                    // Removing existing headers
                    if (this.$headers.length > 0)
                        this.$headers.empty();

                    if (headers.length > 0)
                    // Appending day column to the canvas
                        this.$headers.append(headers);

                    // Removing existing days
                    if (this.$days.length > 0)
                        this.$days.empty();

                    if (days.length > 0)
                    // Appending day column to the canvas
                        this.$days.append(days);
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // CalEvent handling functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _addCalEvents:{
                value:function _addCalEvents() {
                    // Removing all previous entries
                    this.entries.forEach(this._removeEntryEventHandlers, this);

                    // Clearing entries array
                    this.entries.length = 0;

                    // Adding model entries
                    this.collection.forEach(this._addCalEvent, this);
                }
            },

            _addCalEvent:{
                value:function _addCalEvent(calEvent) {

                    var weekStartMs = this.rangeStartDate.getTime(),
                        weekEndMs = this.rangeEndDate.getTime();

                    var entryStartTime = new Date(calEvent.get('StartDateTime')),
                        entryStartTimeMs = entryStartTime.getTime(),
                        entryEndTime = new Date(calEvent.get('EndDateTime')),
                        entryEndTimeMs = entryEndTime.getTime();

                    if (entryStartTimeMs >= weekStartMs && entryStartTimeMs <= weekEndMs ||
                        entryEndTimeMs >= weekStartMs && entryEndTimeMs <= weekEndMs) {

                        // Array of entries grouped by day
                        var dayEntries = {};

                        while (entryStartTimeMs <= entryEndTimeMs) {

                            // This day is not the end of the entry, setting end of the day in this case
                            if (!DateHelper.sameDates(entryStartTime, entryEndTime)) {
                                entryEndTime = new Date(entryStartTime);
                                entryEndTime.setHours(23, 59, 59, 999);
                            }

                            // Checking if entry start is in the weeks range, if it is it can be appended
                            if (entryStartTimeMs >= weekStartMs && entryStartTimeMs <= weekEndMs &&
                                !(this.nonWorkingDays.indexOf(entryStartTime.getDay()) >= 0 && this.nonWorkingHidden)) {

                                var entry = new WeekEntry({
                                    model:calEvent,
                                    hourHeight:this.hourHeight,
                                    startDateTime:entryStartTime,
                                    endDateTime:entryEndTime,
                                    weekEntryRenderFn:this.options.weekEntryRenderFn,
                                    weekEntryChangeFn:this.options.weekEntryChangeFn
                                });

                                // Adding event listener for selected event
                                entry.on('focused', this._entry_focusedHandler, this);
                                entry.on('contextMenu', this._entry_contextMenuHandler, this);
                                entry.on('barMove', this._entry_barMoveHandler, this);
                                entry.on('barMoveEnd', this._entry_barMoveEndHandler, this);

                                // Adding event listeners for d&d events
                                entry.on('draggingStart', this._entry_draggingStartHandler, this);
                                entry.on('dragging', this._entry_draggingHandler, this);
                                entry.on('drop', this._entry_dropHandler, this);

                                var entryDay = entryStartTime.getDay();
                                (entryDay == 0) ? entryDay = 6 : entryDay--;

                                // Creating entries group array if necessary
                                if (!dayEntries.hasOwnProperty(entryDay))
                                    dayEntries[entryDay] = [];

                                // adding entry to local associative array
                                dayEntries[entryDay].push(entry.render().el);

                                // Pushing entry component to the array
                                this.entries.push(entry);
                            }

                            // Setting next day startDateTime
                            entryStartTime = new Date(entryStartTime);
                            entryStartTime.setTime(entryStartTime.getTime() + DateHelper.DAY_MS);
                            entryStartTime.setHours(0, 0, 0, 0);
                            entryStartTimeMs = entryStartTime.getTime();

                            entryEndTime = new Date(calEvent.get('EndDateTime'));
                        }

                        // Adding created entries to the DOM
                        for (var day in dayEntries)
                            $(this.$days.children()[day]).append(dayEntries[day]);

                        // Selecting event if it was previously selected
                        if (calEvent == this.selectedEvent)
                            this.selectEventEntries(calEvent);
                    }
                }
            },

            _updateCalEvent:{
                value:function _updateCalEvent(calEvent) {
                    this._removeCalEvent(calEvent);
                    this._addCalEvent(calEvent);
                }
            },

            _removeCalEvent:{
                value:function _removeCalEvent(calEvent) {
                    this.entries = this.entries.filter(function (entry) {
                        var remove = entry.model == calEvent;
                        if (remove)
                            this._removeEntryEventHandlers(entry);
                        return !remove;
                    }, this);
                }
            },

            _removeEntryEventHandlers:{
                value:function _removeEntryEventHandlers(entry) {
                    // Unregistering selected entry handlers
                    entry.off('focused', this._entry_focusedHandler);
                    entry.off('contextMenu', this._entry_contextMenuHandler);
                    entry.off('barMove', this._entry_barMoveHandler);
                    entry.off('barMoveEnd', this._entry_barMoveEndHandler);

                    // Unregistering d&d entry handlers
                    if (!entry.dragging) {
                        entry.off('draggingStart', this._entry_draggingStartHandler);
                        entry.off('dragging', this._entry_draggingHandler);
                        entry.off('drop', this._entry_dropHandler);

                        // Removing component from the DOM
                        entry.remove();
                    }
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Entry drag & drop functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _entry_draggingStartHandler:{
                value:function _entry_draggingStartHandler(event) {

                    var entryModel = event.target.model,
                        height = (entryModel.get('EndDateTime').getTime() - entryModel.get('StartDateTime').getTime()) /
                            DateHelper.HOUR_MS * this.hourHeight;

                    var ghostEntry = this._entry_draggingStartHandler.ghostEntry = event.target.$el.clone();
                    ghostEntry.css({
                        width:$(this.$days.children()[0]).width(),
                        top:'none',
                        bottom:'none',
                        height:height,
                        opacity:0.7
                    });

                    ghostEntry.appendTo(this.$scroller);
                    ghostEntry.offset({left:event.pageX - event.offsetX, top:event.pageY - event.offsetY});

                }
            },

            _entry_draggingHandler:{
                value:function _entry_draggingHandler(event) {
                    // Getting days offset
                    var daysOffset = this.$days.offset(),

                    // Day width, calculated based on first day
                        dayWidth = this.$days.children().width(),

                    // Calculated total days width
                        daysWidth = dayWidth * this.$days.children().length;

                    // Getting left and top based on dragging event params
                    var left = event.pageX - event.offsetX,
                        top = event.pageY - event.offsetY;

                    if (event.pageX >= daysOffset.left && event.pageX <= daysOffset.left + daysWidth) {

                        // Calculating day snapping
                        var // Calculating day num
                            dayNum = Math.floor((event.pageX - daysOffset.left) / dayWidth),

                        // Getting day
                            $day = $(this.$days.children()[dayNum]),

                        // Day offset
                            dayOffset = $day.offset(),

                        // Day mid
                            dayMid = dayOffset.left + (dayWidth / 2),

                        // Touch point deviation from the middle of the entry
                            deviation = (event.pageX - dayMid) / dayWidth;

                        // entry left position
                        left = dayOffset.left + dayWidth * 0.2 * deviation;

                        // Restricting top value
                        if (top < dayOffset.top)
                            top = dayOffset.top;

                        this._drawTimeChangeMarkers({time:this._getNearestTime((top - dayOffset.top))});

                        // Reseting weekChanged flag
                        this._entry_draggingHandler.weekChanged = false;

                    } else {

                        // User has to move back to days in order to make another week change
                        if (!this._entry_draggingHandler.weekChanged) {

                            // TODO: hiding is a hack because on devices removing element from a DOM which originates
                            // the event stops subsequent events from firing
                            event.target.$el.hide();
                            event.target.$el.appendTo(this.$scroller);

                            if (event.pageX < daysOffset.left)
                                this.prev();
                            else
                                this.next();

                            this._entry_draggingHandler.weekChanged = true;
                        }
                    }

                    var ghostEntry = this._entry_draggingStartHandler.ghostEntry;
                    ghostEntry.offset({left:left, top:top});
                }
            },

            _entry_dropHandler:{
                value:function _entry_dropHandler(event) {
                    var ghostEntry = this._entry_draggingStartHandler.ghostEntry;

                    // Removing dragged entry from the DOM
                    ghostEntry.remove();

                    // Clearing dragged entry
                    this._entry_draggingStartHandler.ghostEntry = null;

                    // Clearing markers
                    this._clearTimeChangeMarkers();

                    // Getting days offset
                    var daysOffset = this.$days.offset(),

                    // Day width, calculated based on first day
                        dayWidth = this.$days.children().width(),

                    // Calculated total days width
                        daysWidth = dayWidth * this.$days.children().length;

                    if (event.pageX >= daysOffset.left && event.pageX <= daysOffset.left + daysWidth) {

                        var top = event.pageY - event.offsetY,

                        // Calculating day num
                            dayNum = Math.floor((event.pageX - daysOffset.left) / dayWidth),

                        // Getting day
                            $day = $(this.$days.children()[dayNum]),

                        // Day offset
                            dayOffset = $day.offset(),

                        // Setting day date
                            day = this.weekDays[dayNum];

                        // Restricting top value
                        if (top < dayOffset.top)
                            top = dayOffset.top;

                        var snappedStartTime = this._getNearestTime(top - dayOffset.top);

                        var calEvent = event.target.model,
                        // Entry start date time
                            startDateTime = calEvent.get('StartDateTime'),
                        // Entry end date time
                            endDateTime = calEvent.get('EndDateTime'),
                        // Entry duration
                            duration = endDateTime.getTime() - startDateTime.getTime(),
                        // New entry start and end
                            newStartDateTime, newEndDateTime;

                        newStartDateTime = new Date(day);
                        newStartDateTime.setHours(
                            snappedStartTime.getHours(),
                            snappedStartTime.getMinutes(),
                            snappedStartTime.getSeconds(),
                            snappedStartTime.getMilliseconds()
                        );

                        // Calculating new end date time
                        newEndDateTime = new Date(newStartDateTime.getTime() + duration);

                        // Updating model with new dates
                        calEvent.set({StartDateTime:newStartDateTime, EndDateTime:newEndDateTime});
                    }

                    // Forcing reflow, for some reason on iOS emulator it was required
                    this.$el.width();
                }
            },


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Entries selection functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _entry_focusedHandler:{
                value:function _entry_focusedHandler(entry) {
                    this.selectEventEntries(entry.model);
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Side bars markers
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _drawTimeChangeMarkers:{
                value:function _drawTimeChangeMarkers(changeInfo) {
                    // Restoring previous markers
                    var $markers = arguments.callee.markers;

                    // Clearing previous markers
                    arguments.callee.markers = null;
                    // Setting previous markers font-weight to normal
                    if ($markers && $markers.hasClass('hour-marker'))
                        $markers.css('font-weight', '');
                    // Removing previous minutes markers from DOM
                    else if ($markers && $markers.hasClass('minutes-marker'))
                        $markers.remove();

                    if (changeInfo.time.getMinutes() == 0 || changeInfo.time.getMinutes() == 59) {

                        var labelIndex = changeInfo.time.getMinutes() == 59 ? 24 : changeInfo.time.getHours();
                        if (labelIndex == 0) {
                            // TODO: implement 0:00 label
                        } else if (labelIndex == 24) {
                            // TODO: implement 24:00 label
                        } else {
                            $markers = $(this.$leftHours.children()[labelIndex]);
                            $markers = $markers.add(this.$rightHours.children()[labelIndex]);
                            $markers.css('font-weight', 'bold');
                        }

                    } else {

                        // TODO:
                        // Creating new marker
                        $markers = $('<cj:Label class="minutes-marker"/>');
                        // Cloning marker for the right side and adding it to $markers set
                        $markers = $markers.add($markers.clone());

                        // Appending left marker
                        this.$leftHours.append($markers[0]);
                        // Appending right marker
                        this.$rightHours.append($markers[1]);

                        // TODO: make date format configurable
                        $markers.html(DateHelper.format(changeInfo.time, ':MM'));

                        // Setting markers top position
                        $markers.css('top',
                            (changeInfo.time.getHours() + changeInfo.time.getMinutes() / 60) * this.hourHeight + 'px');
                    }

                    // Caching for next call
                    arguments.callee.markers = $markers;
                }
            },

            _clearTimeChangeMarkers:{
                value:function _clearTimeChangeMarkers() {
                    // Clearing hour:minutes markers
                    var $markers = this._drawTimeChangeMarkers.markers;
                    if ($markers) {
                        // Nulling recent marker
                        this._drawTimeChangeMarkers.markers = null;

                        // Setting markers font-weight to normal
                        if ($markers.hasClass('hour-marker'))
                            $markers.css('font-weight', 'normal');
                        // Removing minutes markers from DOM
                        else if ($markers.hasClass('minutes-marker'))
                            $markers.remove();
                    }
                }
            },


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Entry resize functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _entry_barMoveHandler:{
                value:function _entry_barMoveHandler(event) {
                    var offsetY = event.offsetY,
                        entry = event.target;

                    if (offsetY != 0) {
                        // Calculating new height
                        var newHeight = DateHelper.DAY_MS - (entry.entryTop + entry.entryBottom) + offsetY;

                        // New snapped time
                        var timeChange;

                        if (event.bar == 'bottom') {
                            var newBottom = entry.entryBottom - offsetY;
                            if (newBottom >= 0 && newBottom + (this.hourHeight / 2) <= (24 * this.hourHeight - entry.entryTop)) {
                                entry.entryBottom = newBottom;
                                entry.$el.css({bottom:entry.entryBottom + 'px'});

                                timeChange = this._getSnappedTime(event.bar, entry);
                            }
                        } else {
                            var newTop = entry.entryTop + offsetY;
                            if (newTop >= 0 && newTop + (this.hourHeight / 2) <= (24 * this.hourHeight - entry.entryBottom)) {
                                entry.entryTop = newTop;
                                entry.$el.css({top:entry.entryTop + 'px'});

                                timeChange = this._getSnappedTime(event.bar, entry);
                            }
                        }

                        if (timeChange) {
                            if (!arguments.callee.timeChange || timeChange.getTime() != arguments.callee.timeChange.getTime())
                                this._drawTimeChangeMarkers({time:timeChange, bar:event.bar, target:entry});

                            arguments.callee.timeChange = timeChange;
                        }
                    }
                }
            },

            _entry_barMoveEndHandler:{
                value:function _entry_barMoveEndHandler(event) {
                    console.log('');
                    var entry = event.target;

                    var snappedTime = this._getSnappedTime(event.bar, entry);
                    var modelUpdate;
                    if (event.bar == 'bottom') {
                        entry.endDateTime = snappedTime;
                        modelUpdate = {EndDateTime:snappedTime};
                    } else {
                        entry.startDateTime = snappedTime;
                        modelUpdate = {StartDateTime:snappedTime};
                    }

                    entry.measure();
                    entry.$el.css({top:entry.entryTop + 'px', bottom:entry.entryBottom + 'px'});
                    entry.model.set(modelUpdate);

                    this._clearTimeChangeMarkers();
                }
            },

            _getSnappedTime:{
                value:function _getSnappedTime(bar, entry) {
                    var that = entry;
                    var startingDateTime = bar == 'bottom' ? that.endDateTime : that.startDateTime,
                        startingPosition = bar == 'bottom' ? (24 * that.hourHeight - that.entryBottom) : that.entryTop;

                    var snappedHour = this._getNearestTime(startingPosition),
                        result = new Date(startingDateTime);
                    result.setHours(
                        snappedHour.getHours(),
                        snappedHour.getMinutes(),
                        snappedHour.getSeconds(),
                        snappedHour.getMilliseconds()
                    );

                    return result;
                }
            },

            _getNearestTime:{
                value:function _getNearestTime(from) {
                    var that = this;
                    var hour = from / that.hourHeight * DateHelper.HOUR_MS,
                        modMs = hour % (DateHelper.HOUR_MS * 0.25);

                    if (modMs > 7.5 * DateHelper.MINUTE_MS)
                        hour = hour - modMs + 15 * DateHelper.MINUTE_MS;
                    else
                        hour = hour - modMs;

                    var result = new Date(hour);
                    // Converting to locale aware date
                    result.setHours(result.getUTCHours(),
                        result.getUTCMinutes(),
                        result.getUTCMinutes(),
                        result.getUTCMilliseconds());

                    // If snap is before 0:00 time
                    if (result.getMonth() > 1)
                        result.setTime(0);
                    // If snap is after 23:59:59:999
                    else if (result.getDate() > 1)
                        result.setTime(result.getTime() - 1);

                    return result;
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Context menu functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _entry_contextMenuHandler:{
                value:function _entry_contextMenuHandler(entry) {
                    // Bubbling up
                    this.trigger('contextMenu', entry);
                }
            }
        });

        return WeekView;
    });
define('text!MonthEntry.tpl!strip',[],function () { return '<cj:MonthEntry>\n    <cj:ColorBar/>\n    <cj:Content>\n        <cj:Label class="month-entry-title"></cj:Label>\n        <cj:Label class="month-entry-start-time"></cj:Label>\n    </cj:Content>\n</cj:MonthEntry>\n\n';});

/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 7/3/12
 * Time: 11:49 AM
 */

define('MonthEntry',['EntryBase', 'utils/DateHelper', 'text!MonthEntry.tpl!strip'],
    function (EntryBase, DateHelper, MonthEntryTemplate) {

        var MonthEntry = function MonthEntry(options) {

            options.el = MonthEntryTemplate;

            EntryBase.call(this, options);

            this.$colorBar = this.$('cj\\:ColorBar');

            this.$titleLabel = this.$('cj\\:Label.month-entry-title');

            this.$startTime = this.$('cj\\:Label.month-entry-start-time');

            // Entry render function
            this.renderFn = options.monthEntryRenderFn || this._defaultRender;

            // Model change rerender function
            this.changeFn = options.monthEntryChangeFn || this._defaultRender;

            this.model.on('change', this._model_changeHandler, this);
        }

        MonthEntry.prototype = Object.create(EntryBase.prototype, {
            render:{
                value:function render() {
                    return this.renderFn.call(this);
                }
            },

            _defaultRender:{
                value:function _defaultRender() {
                    this.$colorBar.css('background-color', this.model.get('Color'));
                    this.$titleLabel.html(this.model.get('Title'));
                    this.$startTime.html(DateHelper.format(this.model.get('StartDateTime'), 'HH:MM TT'));
                    return this;
                }
            },

            _model_changeHandler:{
                value:function _model_changeHandler() {
                    this.changeFn.call(this);
                }
            }
        });
        return MonthEntry;
    });
/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define('MonthView',['Component', 'MonthEntry', 'utils/DateHelper'], function (Component, MonthEntry, DateHelper) {

    var MonthView = function (options) {

        // Setting WeekView template as a root element
        options.el = '<cj:MonthView/>';

        // Initializing model if it's not set
        if (!options.collection) options.collection = [];

        // Calling parent constructor
        Component.call(this, options);

        /**
         * A date to be displayed within the month
         */
        this.date = options.date ? options.date : new Date;

        /**
         * Flag indicating to show or hide non-working days
         */
        this.nonWorkingHidden = options.nonWorkingHidden ? options.nonWorkingHidden : false;

        /**
         * Array of non-working days, based on Date.day index
         */
        this.nonWorkingDays = options.nonWorkingDays ? options.nonWorkingDays : [0, 6];

        /**
         * Date.day index of week start
         */
        this.weekStartDay = options.weekStartDay ? options.weekStartDay : 1;

        /**
         * MonthView date range start
         */
        this.rangeStartDate = null;

        /**
         * MonthView date range end
         */
        this.rangeEndDate = null;

        /**
         * Map of $day objects, the key is a beginning of a day (0:00) in ms
         */
        this.days = {}; // <dayMs, $day>

        /**
         * Entries in the current range
         */
        this.entries = [];

        /**
         * Currently selected SFEvent
         */
        this.selectedEvent = null;

        this.collection.on('add', this._collection_addHandler, this);
        this.collection.on('remove', this._collection_removeHandler, this);
        this.collection.on('change', this._collection_changeHandler, this);
    };

    MonthView.prototype = Object.create(Component.prototype, {
        _collection_addHandler:{
            value:function _collection_addHandler(calEvent) {
                this._addCalEvent(calEvent);
            }
        },

        _collection_removeHandler:{
            value:function _collection_removeHandler(calEvent) {
                this._removeCalEvent(calEvent);
            }
        },

        _collection_changeHandler:{
            value:function _collection_changeHandler(calEvent) {
                if (calEvent.hasChanged('StartDateTime') || calEvent.hasChanged('EndDateTime'))
                    this._updateCalEvent(calEvent);
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // MonthView navigation functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        showDate:{
            value:function showDate(date) {
                this.date = date;
                this.updateView();
            }
        },

        next:{
            value:function next() {
                var nextDate = new Date(this.date);
                nextDate.setDate(1);
                nextDate.setMonth(nextDate.getMonth() + 1);
                this.showDate(nextDate);

                this.trigger('rangeChanged');
            }
        },

        prev:{
            value:function prev() {
                var nextDate = new Date(this.date);
                nextDate.setDate(1);
                nextDate.setMonth(nextDate.getMonth() - 1);
                this.showDate(nextDate);

                this.trigger('rangeChanged');
            }
        },

        toggleNonWorking:{
            value:function () {
                this.nonWorkingHidden = !this.nonWorkingHidden;
                this.updateView();
            }
        },

        updateView:{
            value:function updateView() {
                // Setting week range dates
                this._setRangeDates();

                // Drawing background grid based on current hour height
                this._drawCalendarGrid();

                // Adding weeks entries
                this._addCalEvents();
            }
        },

        /**
         * Sets the MonthView start and end dates
         */
        _setRangeDates:{
            value:function _setRangeDates() {
                var monthStartDate = new Date(this.date);
                monthStartDate.setDate(1);
                monthStartDate.setHours(0, 0, 0, 0);

                if (monthStartDate.getDay() < this.weekStartDay)
                    monthStartDate.setDate(monthStartDate.getDate() + (this.weekStartDay - monthStartDate.getDay()) - 7);
                else
                    monthStartDate.setDate(monthStartDate.getDate() + (this.weekStartDay - monthStartDate.getDay()));

                this.rangeStartDate = monthStartDate;

                var monthEndDate = new Date(this.date);
                monthEndDate.setHours(0, 0, 0, 0);
                monthEndDate.setMonth(monthEndDate.getMonth() + 1);
                monthEndDate.setDate(1);
                monthEndDate.setTime(monthEndDate.getTime() - 1);

                // Calculating week day index based on weekStartDay variable
                var weekEndDay = this.weekStartDay == 1 ? 0 : this.weekStartDay - 1;

                if (monthEndDate.getDay() != weekEndDay) {
                    if (weekEndDay == 0)
                        monthEndDate.setDate(monthEndDate.getDate() + (7 - monthEndDate.getDay()));
                    else
                        monthEndDate.setDate(monthEndDate.getDate() + (7 - (monthEndDate.getDay() + (7 - weekEndDay))));
                }

                this.rangeEndDate = monthEndDate;
            }
        },

        _drawCalendarGrid:{
            value:function _drawCalendarGrid() {

                delete this.days;
                this.days = {};

                var cellDate = new Date(this.rangeStartDate),
                    today = new Date,
                    $week,
                    $day,
                    $weeks,
                    columnWidth = this.nonWorkingHidden ? 100 / (7 - this.nonWorkingDays.length) : 100 / 7;

                while (cellDate.getTime() < this.rangeEndDate.getTime()) {

                    if (!this.nonWorkingHidden || (this.nonWorkingHidden
                        && this.nonWorkingDays.indexOf(cellDate.getDay()) == -1)) {

                        if (this.weekStartDay == cellDate.getDay()) {
                            $week = $('<cj:MonthWeek/>');
                            if (!$weeks)
                                $weeks = $week;
                            else
                                $weeks = $weeks.add($week);
                        }

                        var labelFormat = $weeks.length == 1 ? 'ddd. dd' : 'dd',
                            isCurrentMonth = this.date.getMonth() == cellDate.getMonth(),
                            isToday = DateHelper.sameDates(cellDate, today);

                        // Creating new $day element
                        $day = $('<cj:MonthDay/>').attr({
                            style:'width: ' + columnWidth + '%',
                            current:isCurrentMonth,
                            today:isToday
                        });
                        $day.html($('<cj:MonthDayLabel />').html(DateHelper.format(cellDate, labelFormat)));

                        // Adding $day to a $week set
                        $week.append($day);

                        // Assigning $day to its date time
                        this.days[cellDate.getTime()] = $day;

                    }

                    // Incrementing cell date
                    cellDate.setDate(cellDate.getDate() + 1);
                }

                this.$el.empty();
                $weeks.attr('style', 'height: ' + 100 / $weeks.length + '%');
                this.$el.append($weeks.toArray());
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // CalEvent handling functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        _addCalEvents:{
            value:function _addCalEvents() {
                // Removing all previous entries
                this.entries.forEach(this._removeEntryEventHandlers, this);

                // Clearing entries array
                this.entries.length = 0;

                // Adding model entries
                this.collection.forEach(this._addCalEvent, this);
            }
        },

        _addCalEvent:{
            value:function _addCalEvent(calEvent) {

                var rangeStartMs = this.rangeStartDate.getTime(),
                    rangeEndMs = this.rangeEndDate.getTime();

                var entryStartTime = new Date(calEvent.get('StartDateTime')),
                    entryStartTimeMs = entryStartTime.getTime(),
                    entryEndTime = new Date(calEvent.get('EndDateTime')),
                    entryEndTimeMs = entryEndTime.getTime();

                if (entryStartTimeMs >= rangeStartMs && entryStartTimeMs <= rangeEndMs ||
                    entryEndTimeMs >= rangeStartMs && entryEndTimeMs <= rangeEndMs) {

                    // Array of entries grouped by day
                    var dayEntries = {};

                    while (entryStartTimeMs <= entryEndTimeMs) {

                        // Checking if entry start is in the weeks range, if it is it can be appended
                        if (entryStartTimeMs >= rangeStartMs && entryStartTimeMs <= rangeEndMs &&
                            !(this.nonWorkingDays.indexOf(entryStartTime.getDay()) >= 0 && this.nonWorkingHidden)) {

                            // Setting entry date to the beginning of entry start time
                            var entryDate = new Date(entryStartTime);
                            entryDate.setHours(0, 0, 0, 0);

                            // Creating new entry
                            var entry = new MonthEntry({
                                model:calEvent,
                                date:entryDate,
                                monthEntryRenderFn:this.options.monthEntryRenderFn,
                                monthEntryChangeFn:this.options.monthEntryChangeFn
                            });

                            // Adding event listener for selected event
                            entry.on('focused', this._entry_focusedHandler, this);
                            entry.on('contextMenu', this._entry_contextMenuHandler, this);

                            // Creating entries group array if necessary
                            if (!dayEntries.hasOwnProperty(entryDate.getTime()))
                                dayEntries[entryDate.getTime()] = [];

                            // adding entry to local associative array
                            dayEntries[entryDate.getTime()].push(entry.render().el);

                            // Pushing entry component to the array
                            this.entries.push(entry);
                        }

                        // Setting next day startDateTime
                        entryStartTime = new Date(entryStartTime);
                        entryStartTime.setHours(0, 0, 0, 0);
                        entryStartTime.setDate(entryStartTime.getDate() + 1);
                        entryStartTimeMs = entryStartTime.getTime();
                    }

                    // Adding created entries to the DOM
                    for (var day in dayEntries)
                        this.days[day].append(dayEntries[day]);

                    // Selecting event if it was previously selected
                    if (calEvent == this.selectedEvent)
                        this.selectEventEntries(calEvent);

                }
            }
        },

        _updateCalEvent:{
            value:function _updateCalEvent(calEvent) {
                this._removeCalEvent(calEvent);
                this._addCalEvent(calEvent);
            }
        },

        _removeCalEvent:{
            value:function _removeCalEvent(calEvent) {
                this.entries = this.entries.filter(function (entry) {
                    var remove = entry.model == calEvent;
                    if (remove)
                        this._removeEntryEventHandlers(entry);
                    return !remove;
                }, this);
            }
        },

        _removeEntryEventHandlers:{
            value:function _removeEntryEventHandlers(entry) {
                // Unregistering selected entry handlers
                entry.off('focused', this._entry_focusedHandler);
                entry.off('contextMenu', this._entry_contextMenuHandler);

                entry.remove();
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Entries selection functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        _entry_focusedHandler:{
            value:function _entry_focusedHandler(entry) {
                this.selectEventEntries(entry.model);
            }
        },

        selectEventEntries:{
            value:function selectEventEntries(calEvent) {
                this.entries.forEach(function (entry) {

                    if (calEvent == entry.model)
                        entry.select();
                    else if (entry.model == this.selectedEvent)
                        entry.unselect();

                }, this);

                this.selectedEvent = calEvent;
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Context menu functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        _entry_contextMenuHandler:{
            value:function _entry_contextMenuHandler(entry) {
                // Bubbling up
                this.trigger('contextMenu', entry);
            }
        }
    });
    return MonthView;
});
define('text!Calendar.tpl!strip',[],function () { return '<cj:Calendar xmlns:cj="http://caljs.org/1.0">\n    <cj:NavigationBar>\n        <cj:NavigationBarLeft>\n            <cj:Button class="btn-prev up"/>\n            <cj:RangeLabel/>\n        </cj:NavigationBarLeft>\n\n        <cj:NavigationBarRight>\n            <cj:Button class="btn-toggle-non-working txt up">Toggle Sat/Sun</cj:Button>\n            <cj:Button class="btn-week-view down" name="cal-views"/>\n            <cj:Button class="btn-month-view up" name="cal-views"/>\n            <cj:Button class="btn-next up"/>\n        </cj:NavigationBarRight>\n    </cj:NavigationBar>\n</cj:Calendar>';});

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

                $el.addClass('active');

                $(document).on(MOUSE_UP, function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    // Remove MOUSE_UP listener
                    $(document).off(MOUSE_UP, arguments.callee);

                    $el.removeClass('active');

                    var groupName = $el.attr('name'),
                        groupButtons = groupName ? $("cj\\:Button[name='" + groupName + "']") : null;

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

            this.RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize';

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

            // Hold window height to detect if reflow of views is necessary after resizing
            this.windowHeight = null;
        };

        Calendar.RANGE_CHANGED = 'rangeChanged';

        Calendar.CONTEXT_MENU = 'contextMenu';

        Calendar.prototype = Object.create(Component.prototype, {
            /**
             * Overriding render function from Component type.
             *
             * @return {Calendar}
             */
            render:{
                value:function render() {
                    // Creating $calendar DOM
                    this.$calendar = $(CalendarTpl);

                    // Registering $calendar event handlers
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-prev', this.bind(this._prevBtn_clickHandler, this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-next', this.bind(this._nextBtn_clickHandler, this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-week-view', this.bind(this._weekBtn_clickHandler, this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-month-view', this.bind(this._monthBtn_clickHandler, this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-toggle-non-working', this.bind(this._toggleBtn_clickHandler, this));

                    // Creating WeekView as initial current view
                    this.weekView = this.currentView = new WeekView({
                        collection:this.collection,
                        date:this.date,
                        weekEntryRenderFn:this.options.weekEntryRenderFn,
                        weekEntryChangeFn:this.options.weekEntryChangeFn
                    });
                    // Adding range changed handler
                    this.weekView.on(Calendar.RANGE_CHANGED, this._currentView_rangeChangedHandler, this);
                    // Adding context menu handler
                    this.weekView.on(Calendar.CONTEXT_MENU, this._currentView_contextMenuHandler, this);
                    // Adding mouse or touch down event handler
                    this.weekView.$el.on(this.MOUSE_DOWN_EV, this.bind(this._container_mouseDownHandler, this));

                    // Appending current view to the DOM
                    this.$calendar.append(this.currentView.el);
                    // Rendering current view
                    this.currentView.render();

                    // Updating calendar period label
                    this._updateCurrentPeriodLabel();

                    // Adding whole calendar to the DOM
                    this.$el.html(this.$calendar);

                    return this;
                }
            },

            activate:{
                value:function activate() {
                    this.windowHeight = window.innerHeight;
                    $(window).on(this.RESIZE_EV, {context:this}, this._resize);
                    this.currentView.updateView();
                }
            },

            deactivate:{
                value:function deactivate() {
                    $(window).off(this.RESIZE_EV, this._resize);
                    this.currentView.deactivateView();
                }
            },

            _resize:{
                value:function _resize(event) {
                    var that = event.data.context;
                    if (that.windowHeight != window.innerHeight)
                        that.currentView.updateView.call(that.currentView);

                    that.windowHeight = window.innerHeight;
                }
            },

            _weekBtn_clickHandler:{
                value:function _weekBtn_clickHandler() {
                    if (this.currentView != this.weekView) {
                        // Detaching existing view
                        this.currentView.$el.detach();

                        // Changing current view reference
                        this.currentView = this.weekView;

                        // Appending current view to the DOM
                        this.$calendar.append(this.currentView.el);

                        // Updating date to display in current view
                        this.currentView.showDate(this.date);

                        // Dispatching viewChanged event
                        this.trigger('viewChanged', {viewName:'WeekView'});
                    }
                }
            },

            _monthBtn_clickHandler:{
                value:function _monthBtn_clickHandler() {
                    if (this.currentView != this.monthView) {

                        // Doing lazy initialization of the month view
                        if (!this.monthView) {
                            this.monthView = new MonthView({
                                collection:this.collection,
                                date:this.date,
                                monthEntryRenderFn:this.options.monthEntryRenderFn,
                                monthEntryChangeFn:this.options.monthEntryChangeFn
                            });
                            this.monthView.on(Calendar.RANGE_CHANGED, this._currentView_rangeChangedHandler, this);
                            this.monthView.on(Calendar.CONTEXT_MENU, this._currentView_contextMenuHandler, this);
                            // Registering handler for container gesture events
                            this.monthView.$el.on(this.MOUSE_DOWN_EV, {context:this}, this._container_mouseDownHandler);
                            this.monthView.render();
                        }

                        // Detaching existing view
                        this.currentView.$el.detach();

                        // Changing current view reference
                        this.currentView = this.monthView;

                        // Appending current view to the DOM
                        this.$calendar.append(this.currentView.el);

                        // Updating date to display in current view
                        this.currentView.showDate(this.date);

                        // Dispatching viewChanged event
                        this.trigger('viewChanged', {viewName:'MonthView'});
                    }
                }
            },

            _prevBtn_clickHandler:{
                value:function _prevBtn_clickHandler() {
                    this.currentView.prev();
                }
            },

            _nextBtn_clickHandler:{
                value:function _nextBtn_clickHandler() {
                    this.currentView.next();
                }
            },

            _updateCurrentPeriodLabel:{
                value:function _updateCurrentPeriodLabel() {
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
            },

            _showRangeChangeMessage:{
                value:function _showRangeChangeMessage() {
                    // Setting displayed message text
                    var messageText = DateHelper.format(this.currentView.rangeStartDate, "mmm d") + ' - '
                        + DateHelper.format(this.currentView.rangeEndDate, "mmm d");

                    // Creating message div
                    var message = $('<cj:RangeChangeMessage/>').html(messageText).appendTo(this.$calendar);

                    // Positioning message
                    var messagePosition = {
                        top:this.$calendar.height() / 2 - (message.height() / 2),
                        left:this.$calendar.width() / 2 - (message.width() / 2)
                    };

                    // Displaying message with fadeIn/fadeOut effects
                    message.css(messagePosition)
                        .fadeIn(300, function () {
                            $(this)
                                .delay(500)
                                .fadeOut(300, function () {
                                    $(this).remove();
                                });
                        });
                }
            },

            _toggleBtn_clickHandler:{
                value:function _toggleBtn_clickHandler() {
                    this.currentView.toggleNonWorking();
                }
            },

            _currentView_rangeChangedHandler:{
                value:function _currentView_rangeChangedHandler() {
                    this.date = this.currentView.date;
                    this._showRangeChangeMessage();
                    this._updateCurrentPeriodLabel();
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Swipe gesture events and context menu functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _currentView_contextMenuHandler:{
                value:function _currentView_contextMenuHandler(entry) {
                    // Bubbling up
                    this.trigger(Calendar.CONTEXT_MENU, entry);
                }},

            _container_mouseDownHandler:{
                value:function _container_mouseDownHandler(event) {
                    var that = this;

                    // Getting touch point with touch coordinates, this depends on the runtime,
                    // on devices it's part of touches array
                    var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
                        touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;

                    // Setting touch point X and Y
                    this._container_mouseDownHandler.touchPoint = {
                        x:touchPoint.pageX,
                        y:touchPoint.pageY
                    };

                    if (touchesCount == 1) {
                        // For desktop devices document needs to be a move and up target
                        var moveTarget = $(document);

                        // Adding move and up listeners
                        moveTarget.on(that.MOUSE_MOVE_EV, {context:that}, this._container_mouseMoveHandler);
                        moveTarget.on(that.MOUSE_UP_EV, {context:that}, this._container_mouseUpHandler);
                    }
                }
            },

            _container_mouseMoveHandler:{
                value:function _container_mouseMoveHandler(event) {
                    var that = event.data.context,
                        downTouchPoint = that._container_mouseDownHandler.touchPoint;

                    // Getting touch point with touch coordinates, this depends on the runtime,
                    // on devices it part of touches array
                    var moveTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
                        touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;

                    var xDelta = moveTouchPoint.pageX - downTouchPoint.x,
                        yDelta = moveTouchPoint.pageY - downTouchPoint.y;

                    if (Math.abs(xDelta) >= 60 && Math.abs(yDelta) < 10 && touchesCount == 1) {
                        event.preventDefault();
                        event.stopImmediatePropagation();

                        // For desktop devices document needs to be a move and up target
                        var moveTarget = $(document);
                        moveTarget.off(that.MOUSE_UP_EV, that._container_mouseUpHandler);
                        moveTarget.off(that.MOUSE_MOVE_EV, that._container_mouseMoveHandler);

                        if (xDelta > 0)
                            that.currentView.prev();
                        else if (xDelta < 0)
                            that.currentView.next();
                    }
                }
            },

            _container_mouseUpHandler:{
                value:function _container_mouseUpHandler(event) {
                    var that = event.data.context;

                    // For desktop devices document needs to be a move and up target
                    var moveTarget = $(document);
                    moveTarget.off(that.MOUSE_UP_EV, that._container_mouseUpHandler);
                    moveTarget.off(that.MOUSE_MOVE_EV, that._container_mouseMoveHandler);

                    // Getting touch point with touch coordinates, this depends on the runtime,
                    // on devices it's part of changedTouches array for TouchEnd event
                    var upTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.changedTouches[0] : event,
                        downTouchPoint = that._container_mouseDownHandler.touchPoint;

                    // Detecting if this is container click
                    if (Math.abs(upTouchPoint.pageX - downTouchPoint.x) < 5
                        && Math.abs(upTouchPoint.pageY - downTouchPoint.y) < 5) {

                        event.preventDefault();
                        event.stopImmediatePropagation();

                        that.currentView.selectEventEntries(null);

                        // HACK: Forcing reflow, on devices for some reason display doesn'up update
                        that.currentView.$el.width();
                    }
                }
            }
        });

        return Calendar;
    });
    return {
        Calendar : require('Calendar')
    };
}));