/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/25/12
 * Time: 12:53 PM
 */

define(['Component', 'WeekView', 'MonthView', 'text!Calendar.tpl!strip', 'utils/DateHelper',
        'utils/TouchButtons'],
    function (Component, WeekView, MonthView, CalendarTpl, DateHelper) {

        var Calendar = function (options) {

            this.RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize';

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
                this.$calendar.on('tbclick cj\\:Button.btn-prev', this.bindHandler(prevBtn_clickHandler, this));
                this.$calendar.on('tbclick cj\\:Button.btn-next', this.bindHandler(nextBtn_clickHandler, this));
                this.$calendar.on('tbclick cj\\:Button.btn-week-view', this.bindHandler(weekBtn_clickHandler, this));
                this.$calendar.on('tbclick cj\\:Button.btn-month-view', this.bindHandler(monthBtn_clickHandler, this));
                this.$calendar.on('tbclick cj\\:Button.btn-toggle-non-working', this.bindHandler(toggleBtn_clickHandler, this));

                // Creating WeekView as initial current view
                this.weekView = this.currentView = new WeekView({model:this.model, date:this.date,
                    entryTemplate:this.options.weekEntryTemplate});
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

            var windowHeight = null;

            function resize(event) {
                var that = event.data.context;
                if (that.windowHeight != window.innerHeight)
                    that.currentView.updateView.call(that.currentView);

                that.windowHeight = window.innerHeight;
            }

            this.activate = function activate() {
                this.windowHeight = window.innerHeight;
                $(window).on(this.RESIZE_EV, {context:this}, this.resize);
                this.currentView.updateView();
            }

            this.deactivate = function deactivate() {
                $(window).off(this.RESIZE_EV, this.resize);
                this.currentView.deactivateView();
            }

            function weekBtn_clickHandler() {
                console.log('showWeekView called');
                if (this.currentView != this.weekView) {

                    // Detaching existing view
                    this.currentView.$el.detach();

                    // Changing current view reference
                    this.currentView = this.weekView;
                    // Appending current view to the DOM
                    this.$el.append(this.currentView.el);
                    // Updating date to display in current view
                    this.currentView.showDate(this.date);

                    // Dispatching viewChanged event
                    this.trigger('viewChanged', {viewName:'WeekView'});
                }
            }

            function monthBtn_clickHandler() {
                console.log('showMonthView called');
                if (this.currentView != this.monthView) {

                    // Doing lazy initialization of the month view
                    if (!this.monthView) {
                        this.monthView = new MonthView({model:this.model, date:this.date});
                        this.monthView.on('rangeChanged', this.currentView_rangeChangedHandler, this);
                        this.monthView.on('contextMenu', this.currentView_contextMenuHandler, this);
                        // Registering handler for container gesture events
                        this.monthView.$el.on(this.MOUSE_DOWN_EV, {context:this}, this.container_mouseDownHandler);
                        this.monthView.render();
                    }

                    // Detaching existing view
                    this.currentView.$el.detach();

                    // Changing current view reference
                    this.currentView = this.monthView;
                    // Appending current view to the DOM
                    this.$el.append(this.currentView.el);
                    // Updating date to display in current view
                    this.currentView.showDate(this.date);

                    // Dispatching viewChanged event
                    this.trigger('viewChanged', {viewName:'MonthView'});
                }
            }

            function nextBtn_clickHandler() {
                this.currentView.next();
            }

            function prevBtn_clickHandler() {
                this.currentView.prev();
            }

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
             * Displays popup message when dates range is changed.
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

            function toggleBtn_clickHandler() {
                this.currentView.toggleNonWorking();
            }

            function currentView_rangeChangedHandler() {
                this.date = this.currentView.date;
                showRangeChangeMessage.call(this);
                updateCurrentPeriodLabel.call(this);
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
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Swipe gesture events and context menu functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function currentView_contextMenuHandler(entry) {
                // Bubbling up
                this.trigger('contextMenu', entry);
            }

            function container_mouseDownHandler(event) {
                var that = this;

                // Getting touch point with touch coordinates, this depends on the runtime,
                // on devices it's part of touches array
                var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
                    touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;

                // Setting touch point X and Y
                container_mouseDownHandler.touchPoint = {
                    x:touchPoint.pageX,
                    y:touchPoint.pageY
                };

                if (touchesCount == 1) {
                    // For desktop devices document needs to be a move and up target
                    var moveTarget = $(document);

                    // Adding move and up listeners
                    moveTarget.on(that.MOUSE_MOVE_EV, {context:that}, container_mouseMoveHandler);
                    moveTarget.on(that.MOUSE_UP_EV, {context:that}, container_mouseUpHandler);
                }
            }

            function container_mouseMoveHandler(event) {
                var that = event.data.context,
                    downTouchPoint = container_mouseDownHandler.touchPoint;

                // Getting touch point with touch coordinates, this depends on the runtime,
                // on devices it part of touches array
                var moveTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
                    touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;

                var xDelta = moveTouchPoint.pageX - downTouchPoint.x,
                    yDelta = moveTouchPoint.pageY - downTouchPoint.y;

                if (Math.abs(xDelta) >= 60 && Math.abs(yDelta) < 10 && touchesCount == 1) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    // For desktop devices document needs to be a move and up target
                    var moveTarget = $(document);
                    moveTarget.off(that.MOUSE_UP_EV, container_mouseUpHandler);
                    moveTarget.off(that.MOUSE_MOVE_EV, container_mouseMoveHandler);

                    if (xDelta > 0)
                        that.currentView.prev();
                    else if (xDelta < 0)
                        that.currentView.next();
                }
            }

            function container_mouseUpHandler(event) {
                var that = event.data.context;

                // For desktop devices document needs to be a move and up target
                var moveTarget = $(document);
                moveTarget.off(that.MOUSE_UP_EV, container_mouseUpHandler);
                moveTarget.off(that.MOUSE_MOVE_EV, container_mouseMoveHandler);

                // Getting touch point with touch coordinates, this depends on the runtime,
                // on devices it's part of changedTouches array for TouchEnd event
                var upTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.changedTouches[0] : event,
                    downTouchPoint = container_mouseDownHandler.touchPoint;

                // Detecting if this is container click
                if (Math.abs(upTouchPoint.pageX - downTouchPoint.x) < 5
                    && Math.abs(upTouchPoint.pageY - downTouchPoint.y) < 5) {

                    event.preventDefault();
                    event.stopImmediatePropagation();

                    that.currentView.selectEventEntries(null);

                    // HACK: Forcing reflow, on devices for some reason display doesn'up update
                    that.currentView.$el.width();
                }
            }
        };
        Calendar.RANGE_CHANGED = 'rangeChanged';
        Calendar.CONTEXT_MENU = 'contextMenu';
        Calendar.prototype = Object.create(Component.prototype);

        return Calendar;
    });