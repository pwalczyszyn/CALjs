/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define(['Component', 'text!WeekView.tpl'], function (Component, WeekViewTpl) {

    var WeekView = function (options) {
        // Setting WeekView template as a root element
        options.el = WeekViewTpl;
        // Calling parent constructor
        Component.call(this, options);
    };
    WeekView.prototype = Object.create(Component.prototype);

    WeekView.prototype.render = function () {
        return this;
    };

    return WeekView;
});