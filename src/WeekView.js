/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define(['Component', 'text!WeekView.tpl!strip'], function (Component, WeekViewTpl) {

    var WeekView = function (options) {
        // Setting WeekView template as a root element
        options.el = WeekViewTpl;
        // Calling parent constructor
        Component.call(this, options);

        // Setting current WeekView date
        this.date = options.date;

        this.render = function render() {
            return this;
        };

        this.updateView = function updateView() {
//            // Setting week range dates
//            this.setRangeDates();
//
//            // Setting hour height in px
//            this.measure();
//
//            // Drawing background grid based on current hour height
//            this.drawCalendarGrid();
//
//            // Positioning hour labels based on current hour height
//            this.positionHourLabels();
//
//            // Adding weeks entries
//            this.addCalEvents();
//
//            // Refreshing scroller
//            this.scroller.enable();
//            this.scroller.refresh();
//            this.scroller.scrollTo(0, this.currentScrollHour * this.hourHeight, 200);
        }


    };
    WeekView.prototype = Object.create(Component.prototype);

    return WeekView;
});