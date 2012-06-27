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

            this.windowHeight = null;
        };

        Calendar.RANGE_CHANGED = 'rangeChanged';

        Calendar.CONTEXT_MENU = 'contextMenu';

        Calendar.prototype = Object.create(Component.prototype, {
            /**
             * Overriding render function from Component type.
             *
             * @return {Calendar}
             */
            render:{
                value:function render() {
                    // Creating $calendar DOM
                    this.$calendar = $(CalendarTpl);
                    // Registering $calendar event handlers
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-prev', this._prevBtn_clickHandler.bind(this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-next', this._nextBtn_clickHandler.bind(this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-week-view', this._weekBtn_clickHandler.bind(this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-month-view', this._monthBtn_clickHandler.bind(this));
                    this.$calendar.on('tbclick', 'cj\\:Button.btn-toggle-non-working', this._toggleBtn_clickHandler.bind(this));

                    // Creating WeekView as initial current view
                    this.weekView = this.currentView = new WeekView({
                        collection:this.collection,
                        date:this.date,
                        entryTemplate:this.options.weekEntryTemplate
                    });
                    // Adding range changed handler
                    this.weekView.on(Calendar.RANGE_CHANGED, this._currentView_rangeChangedHandler, this);
                    // Adding context menu handler
                    this.weekView.on(Calendar.CONTEXT_MENU, this._currentView_contextMenuHandler, this);
                    // Adding mouse or touch down event handler
                    this.weekView.$el.on(this.MOUSE_DOWN_EV, this._container_mouseDownHandler.bind(this));

                    // Appending current view to the DOM
                    this.$calendar.append(this.currentView.el);
                    // Rendering current view
                    this.currentView.render();

                    // Updating calendar period label
                    this._updateCurrentPeriodLabel();

                    // Adding whole calendar to the DOM
                    this.$el.html(this.$calendar);

                    return this;
                }
            },

            _resize:{
                value:function _resize(event) {
                    var that = event.data.context;
                    if (that.windowHeight != window.innerHeight)
                        that.currentView.updateView.call(that.currentView);

                    that.windowHeight = window.innerHeight;
                }
            },

            activate:{
                value:function activate() {
                    this.windowHeight = window.innerHeight;
                    $(window).on(this.RESIZE_EV, {context:this}, this._resize);
                    this.currentView.updateView();
                }
            },

            deactivate:{
                value:function deactivate() {
                    $(window).off(this.RESIZE_EV, this._resize);
                    this.currentView.deactivateView();
                }
            },

            _weekBtn_clickHandler:{
                value:function _weekBtn_clickHandler() {
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
            },

            _monthBtn_clickHandler:{
                value:function _monthBtn_clickHandler() {
                    if (this.currentView != this.monthView) {

                        // Doing lazy initialization of the month view
                        if (!this.monthView) {
                            this.monthView = new MonthView({collection:this.collection, date:this.date});
                            this.monthView.on(Calendar.RANGE_CHANGED, this._currentView_rangeChangedHandler, this);
                            this.monthView.on(Calendar.CONTEXT_MENU, this._currentView_contextMenuHandler, this);
                            // Registering handler for container gesture events
                            this.monthView.$el.on(this.MOUSE_DOWN_EV, {context:this}, this._container_mouseDownHandler);
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
            },

            _prevBtn_clickHandler:{
                value:function _prevBtn_clickHandler() {
                    this.currentView.prev();
                }
            },

            _nextBtn_clickHandler:{
                value:function _nextBtn_clickHandler() {
                    this.currentView.next();
                }
            },

            /**
             * Updates RangeLabel content based on currentView.date value.
             *
             * @private
             */
            _updateCurrentPeriodLabel:{
                value:function _updateCurrentPeriodLabel() {
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
            },

            /**
             * Displays popup message when dates range is changed.
             *
             * @private
             */
            _showRangeChangeMessage:{
                value:function _showRangeChangeMessage() {
                    // Setting displayed message text
                    var messageText = DateHelper.format(this.currentView.rangeStartDate, "mmm d") + ' - '
                        + DateHelper.format(this.currentView.rangeEndDate, "mmm d");

                    // Creating message div
                    var message = $('<cj:RangeChangeMessage/>').html(messageText).appendTo(this.$calendar);

                    // Positioning message
                    var messagePosition = {
                        top:this.$calendar.height() / 2 - (message.height() / 2),
                        left:this.$calendar.width() / 2 - (message.width() / 2)
                    };

                    // Displaying message with fadeIn/fadeOut effects
                    message.css(messagePosition)
                        .fadeIn(300, function () {
                            $(this)
                                .delay(500)
                                .fadeOut(300, function () {
                                    $(this).remove();
                                });
                        });
                }
            },

            _toggleBtn_clickHandler:{
                value:function _toggleBtn_clickHandler() {
                    this.currentView.toggleNonWorking();
                }
            },

            _currentView_rangeChangedHandler:{
                value:function _currentView_rangeChangedHandler() {
                    this.date = this.currentView.date;
                    this._showRangeChangeMessage();
                    this._updateCurrentPeriodLabel();
                }
            },

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Swipe gesture events and context menu functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            _currentView_contextMenuHandler:{
                value:function _currentView_contextMenuHandler(entry) {
                    // Bubbling up
                    this.trigger(Calendar.CONTEXT_MENU, entry);
                }},

            _container_mouseDownHandler:{
                value:function _container_mouseDownHandler(event) {
                    var that = this;

                    // Getting touch point with touch coordinates, this depends on the runtime,
                    // on devices it's part of touches array
                    var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,
                        touchesCount = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches.length : 1;

                    // Setting touch point X and Y
                    this._container_mouseDownHandler.touchPoint = {
                        x:touchPoint.pageX,
                        y:touchPoint.pageY
                    };

                    if (touchesCount == 1) {
                        // For desktop devices document needs to be a move and up target
                        var moveTarget = $(document);

                        // Adding move and up listeners
                        moveTarget.on(that.MOUSE_MOVE_EV, {context:that}, this._container_mouseMoveHandler);
                        moveTarget.on(that.MOUSE_UP_EV, {context:that}, this._container_mouseUpHandler);
                    }
                }
            },

            _container_mouseMoveHandler:{
                value:function _container_mouseMoveHandler(event) {
                    var that = event.data.context,
                        downTouchPoint = that._container_mouseDownHandler.touchPoint;

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
                        moveTarget.off(that.MOUSE_UP_EV, that._container_mouseUpHandler);
                        moveTarget.off(that.MOUSE_MOVE_EV, that._container_mouseMoveHandler);

                        if (xDelta > 0)
                            that.currentView.prev();
                        else if (xDelta < 0)
                            that.currentView.next();
                    }
                }
            },

            _container_mouseUpHandler:{
                value:function _container_mouseUpHandler(event) {
                    var that = event.data.context;

                    // For desktop devices document needs to be a move and up target
                    var moveTarget = $(document);
                    moveTarget.off(that.MOUSE_UP_EV, that._container_mouseUpHandler);
                    moveTarget.off(that.MOUSE_MOVE_EV, that._container_mouseMoveHandler);

                    // Getting touch point with touch coordinates, this depends on the runtime,
                    // on devices it's part of changedTouches array for TouchEnd event
                    var upTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.changedTouches[0] : event,
                        downTouchPoint = that._container_mouseDownHandler.touchPoint;

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
            }
        });

        return Calendar;
    });