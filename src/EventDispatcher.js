/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/6/12
 * Time: 3:44 PM
 */

define(function () {

        var EventDispatcher = function () {
            this.handlersMap = {};
        };

        EventDispatcher.prototype.on = function on(eventNames, handlerFunction, thisObject) {
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
                if (!isOn) handlers.push({'handlerFunction':handlerFunction, 'thisObject':thisObject});
            }, this);
        };

        EventDispatcher.prototype.off = function off(eventNames, handlerFunction) {
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
        };

        EventDispatcher.prototype.trigger = function trigger(eventName, args) {
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
        };

        EventDispatcher.prototype.bindHandler = function bindHandler(handler, thisObject) {
            return function () {
                handler.apply(thisObject, Array.prototype.slice.call(arguments));
            }
        };

        return EventDispatcher;
    }
);