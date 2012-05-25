/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 12:53 PM
 */

define(['text!Calendar.tpl'], function (CalendarTemplate) {

    var Calendar = function (options) {
        if (options) {

            this.setElement(options.el);
            this.setModel(options.model);
        }
    };

    Calendar.prototype.setElement = function (el) {
        if (el) {
            this.$el = $(el); // el can be either CSS selector or DOM element
            this.el = this.$el[0];
        }
        return this;
    };

    Calendar.prototype.setModel = function (model) {
        if (model) this.model = model;
        return this;
    };

    Calendar.prototype.render = function () {

        // Creating new div container if necessary
        if (!this.$el) this.setElement('<div/>');

        this.$el.html(CalendarTemplate);

        return this;
    };

    return Calendar;
});