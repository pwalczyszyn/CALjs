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
});