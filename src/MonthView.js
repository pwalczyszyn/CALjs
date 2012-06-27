/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define(['Component'], function (Component) {
    var MonthView = function (options) {
        options.el = '<cj:WeekView/>';
        Component.call(this, options);

    };
    MonthView.prototype = Object.create(Component.prototype, {
        render:{
            value:function render() {
                return this;
            }
        }
    });
    return MonthView;
});