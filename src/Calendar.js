/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 12:53 PM
 */

define(['Component', 'WeekView', 'MonthView', 'text!Calendar.tpl!strip', 'utils/DateHelper', 'utils/TouchButtons'],
    function (Component, WeekView, MonthView, CalendarTpl, DateHelper) {

        var Calendar = function (options) {
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

            /**
             * Overriding render function from Component type.
             *
             * @return {Calendar}
             */
            this.render = function render() {
                // Creating $calendar DOM
                this.$calendar = $(CalendarTpl);
                // Registering $calendar event handlers
                this.$calendar.on('tbclick  cj\\:Button.btn-prev', prevBtn_clickHandler);

                // Creating WeekView as initial current view
                this.weekView = this.currentView = new WeekView({model:this.model, date:this.date});
                // Adding range changed handler
                this.weekView.on(Calendar.RANGE_CHANGED, currentView_rangeChangedHandler, this);
                // Adding context menu handler
                this.weekView.on(Calendar.CONTEXT_MENU, currentView_contextMenuHandler, this);
                // Adding mouse or touch down event handler
                this.weekView.$el.on(this.MOUSE_DOWN_EV, this.bindHandler(container_mouseDownHandler, this));

                // Appending current view to the DOM
                this.$calendar.append(this.currentView.el);
                // Rendering current view
                this.currentView.render();

                // Updating calendar period label
                updateCurrentPeriodLabel.call(this);

                // Adding whole calendar to the DOM
                this.$el.html(this.$calendar);

                return this;
            };

            /**
             * Updates RangeLabel content based on currentView.date value.
             *
             * @private
             */
            function updateCurrentPeriodLabel() {
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

            /**
             * Displayes popup message when dates range is changed.
             *
             * @private
             */
            function showRangeChangeMessage() {

                // Setting displayed message text
                var messageText = DateHelper.format(this.currentView.rangeStartDate, "mmm d") + ' - '
                    + DateHelper.format(this.currentView.rangeEndDate, "mmm d");

                // Creating message div
                var message = $('<div/>')
                    .html(messageText)
                    .addClass('range-change-message')
                    .appendTo(this.$el);

                // Positioning message
                var messagePosition = {
                    top:this.$el.height() / 2 - (message.height() / 2),
                    left:this.$el.width() / 2 - (message.width() / 2)
                };

                // Displaying message with fadeIn/fadeOut effects
                message
                    .css(messagePosition)
                    .fadeIn(300, function () {
                        $(this)
                            .delay(500)
                            .fadeOut(300, function () {
                                $(this).remove();
                            });
                    });
            }

            function toggleNonWorking() {
                this.currentView.toggleNonWorking();
            }

            function prevBtn_clickHandler(event) {
                console.log('prevBtn clicked!');
            }

            function currentView_rangeChangedHandler() {

            }

            function currentView_contextMenuHandler(entry) {
                this.trigger('contextMenu', entry);
            }

            /**
             * Mouse or touch down handler.
             *
             * @private
             * @param event
             */
            function container_mouseDownHandler(event) {
                alert('mouse down handle');

//            var that = event.data.context;
//
//            // Getting touch point with touch coordinates, this depends on the runtime,
//            // on devices it's part of touches array
//            var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
//                touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;
//
//            // Setting touch point X and Y
//            that.container_mouseDownHandler.touchPoint = {
//                x:touchPoint.pageX,
//                y:touchPoint.pageY
//            };
//
//            if (touchesCount == 1) {
//                // For desktop devices document needs to be a move and up target
//                var moveTarget = $(document);
//
//                // Adding move and up listeners
//                moveTarget.on(that.MOUSE_MOVE_EV, {context:that}, that.container_mouseMoveHandler);
//                moveTarget.on(that.MOUSE_UP_EV, {context:that}, that.container_mouseUpHandler);
//            }
            }


        };
        Calendar.RANGE_CHANGED = 'rangeChanged';
        Calendar.CONTEXT_MENU = 'contextMenu';
        Calendar.prototype = Object.create(Component.prototype);

        return Calendar;
    });