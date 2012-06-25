/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 3:33 PM
 */

define(['EventDispatcher'], function (EventDispatcher) {

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