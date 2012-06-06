/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 3:33 PM
 */

define([], function () {

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
            this.setElement(options ? options.el : null);
            this.setModel(options ? options.model : null);
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