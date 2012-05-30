/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 12:53 PM
 */

define(['Component', 'WeekView', 'MonthView', 'text!Calendar.tpl'],
    function (Component, WeekView, MonthView, CalendarTpl) {

        var Calendar = function (options) {
            // Calling base Component type constructor
            Component.call(this, options);

            /**
             * Instance of WeekView
             * @type {WeekView}
             */
            this.weekView = new WeekView({model:this.model, date:this.date});

            /**
             * Instance of MonthView
             * @type {MonthView}
             */
            this.monthView = null;

            /**
             * Current visible view
             * @type {MonthView || WeekView}
             */
            this.currentView = this.weekView;

            /**
             * Instance of NavigationBar
             * @type {NavigationBar}
             */
            this.navigationBar = null;

            /**
             * Current calendar date
             * @type {Date}
             */
            this.date = options && options.date ? options.date : new Date;
        };

        Calendar.prototype = Object.create(Component.prototype);

        Calendar.prototype.render = function () {

            // Applying default calendar template
            this.$el.html(CalendarTpl);

            this.$el.append(this.currentView.el);
            this.currentView.render();

            return this;
        };

        return Calendar;
    });