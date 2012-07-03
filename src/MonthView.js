/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define(['Component', 'MonthEntry', 'utils/DateHelper'], function (Component, MonthEntry, DateHelper) {

    var MonthView = function (options) {

        // Setting WeekView template as a root element
        options.el = '<cj:MonthView/>';

        // Initializing model if it's not set
        if (!options.collection) options.collection = [];

        // Calling parent constructor
        Component.call(this, options);

        /**
         * A date to be displayed within the month
         */
        this.date = options.date ? options.date : new Date;

        /**
         * Flag indicating to show or hide non-working days
         */
        this.nonWorkingHidden = options.nonWorkingHidden ? options.nonWorkingHidden : false;

        /**
         * Array of non-working days, based on Date.day index
         */
        this.nonWorkingDays = options.nonWorkingDays ? options.nonWorkingDays : [0, 6];

        /**
         * Date.day index of week start
         */
        this.weekStartDay = options.weekStartDay ? options.weekStartDay : 1;

        /**
         * MonthView date range start
         */
        this.rangeStartDate = null;

        /**
         * MonthView date range end
         */
        this.rangeEndDate = null;

        /**
         * Map of $day objects, the key is a beginning of a day (0:00) in ms
         */
        this.days = {}; // <dayMs, $day>

        /**
         * Entries in the current range
         */
        this.entries = [];

        /**
         * Currently selected SFEvent
         */
        this.selectedEvent = null;

        this.collection.on('add', this._collection_addHandler, this);
        this.collection.on('remove', this._collection_removeHandler, this);
        this.collection.on('change', this._collection_changeHandler, this);
    };

    MonthView.prototype = Object.create(Component.prototype, {
        _collection_addHandler:{
            value:function _collection_addHandler(calEvent) {
                this._addCalEvent(calEvent);
            }
        },

        _collection_removeHandler:{
            value:function _collection_removeHandler(calEvent) {
                this._removeCalEvent(calEvent);
            }
        },

        _collection_changeHandler:{
            value:function _collection_changeHandler(calEvent) {
                if (calEvent.hasChanged('StartDateTime') || calEvent.hasChanged('EndDateTime'))
                    this._updateCalEvent(calEvent);
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // MonthView navigation functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        showDate:{
            value:function showDate(date) {
                this.date = date;
                this.updateView();
            }
        },

        next:{
            value:function next() {
                var nextDate = new Date(this.date);
                nextDate.setDate(1);
                nextDate.setMonth(nextDate.getMonth() + 1);
                this.showDate(nextDate);

                this.trigger('rangeChanged');
            }
        },

        prev:{
            value:function prev() {
                var nextDate = new Date(this.date);
                nextDate.setDate(1);
                nextDate.setMonth(nextDate.getMonth() - 1);
                this.showDate(nextDate);

                this.trigger('rangeChanged');
            }
        },

        toggleNonWorking:{
            value:function () {
                this.nonWorkingHidden = !this.nonWorkingHidden;
                this.updateView();
            }
        },

        updateView:{
            value:function updateView() {
                // Setting week range dates
                this._setRangeDates();

                // Drawing background grid based on current hour height
                this._drawCalendarGrid();

                // Adding weeks entries
                this._addCalEvents();
            }
        },

        /**
         * Sets the MonthView start and end dates
         */
        _setRangeDates:{
            value:function _setRangeDates() {
                var monthStartDate = new Date(this.date);
                monthStartDate.setDate(1);
                monthStartDate.setHours(0, 0, 0, 0);

                if (monthStartDate.getDay() < this.weekStartDay)
                    monthStartDate.setDate(monthStartDate.getDate() + (this.weekStartDay - monthStartDate.getDay()) - 7);
                else
                    monthStartDate.setDate(monthStartDate.getDate() + (this.weekStartDay - monthStartDate.getDay()));

                this.rangeStartDate = monthStartDate;

                var monthEndDate = new Date(this.date);
                monthEndDate.setHours(0, 0, 0, 0);
                monthEndDate.setMonth(monthEndDate.getMonth() + 1);
                monthEndDate.setDate(1);
                monthEndDate.setTime(monthEndDate.getTime() - 1);

                // Calculating week day index based on weekStartDay variable
                var weekEndDay = this.weekStartDay == 1 ? 0 : this.weekStartDay - 1;

                if (monthEndDate.getDay() != weekEndDay) {
                    if (weekEndDay == 0)
                        monthEndDate.setDate(monthEndDate.getDate() + (7 - monthEndDate.getDay()));
                    else
                        monthEndDate.setDate(monthEndDate.getDate() + (7 - (monthEndDate.getDay() + (7 - weekEndDay))));
                }

                this.rangeEndDate = monthEndDate;
            }
        },

        _drawCalendarGrid:{
            value:function _drawCalendarGrid() {

                delete this.days;
                this.days = {};

                var cellDate = new Date(this.rangeStartDate),
                    today = new Date,
                    $week,
                    $day,
                    $weeks,
                    columnWidth = this.nonWorkingHidden ? 100 / (7 - this.nonWorkingDays.length) : 100 / 7;

                while (cellDate.getTime() < this.rangeEndDate.getTime()) {

                    if (!this.nonWorkingHidden || (this.nonWorkingHidden
                        && this.nonWorkingDays.indexOf(cellDate.getDay()) == -1)) {

                        if (this.weekStartDay == cellDate.getDay()) {
                            $week = $('<cj:MonthWeek/>');
                            if (!$weeks)
                                $weeks = $week;
                            else
                                $weeks = $weeks.add($week);
                        }

                        var labelFormat = $weeks.length == 1 ? 'ddd. dd' : 'dd',
                            isCurrentMonth = this.date.getMonth() == cellDate.getMonth(),
                            isToday = DateHelper.sameDates(cellDate, today);

                        // Creating new $day element
                        $day = $('<cj:MonthDay/>').attr({
                            style:'width: ' + columnWidth + '%',
                            current:isCurrentMonth,
                            today:isToday
                        });
                        $day.html($('<cj:MonthDayLabel />').html(DateHelper.format(cellDate, labelFormat)));

                        // Adding $day to a $week set
                        $week.append($day);

                        // Assigning $day to its date time
                        this.days[cellDate.getTime()] = $day;

                    }

                    // Incrementing cell date
                    cellDate.setDate(cellDate.getDate() + 1);
                }

                this.$el.empty();
                $weeks.attr('style', 'height: ' + 100 / $weeks.length + '%');
                this.$el.append($weeks.toArray());
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // CalEvent handling functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        _addCalEvents:{
            value:function _addCalEvents() {
                // Removing all previous entries
                this.entries.forEach(this._removeEntryEventHandlers, this);

                // Clearing entries array
                this.entries.length = 0;

                // Adding model entries
                this.collection.forEach(this._addCalEvent, this);
            }
        },

        _addCalEvent:{
            value:function _addCalEvent(calEvent) {

                var rangeStartMs = this.rangeStartDate.getTime(),
                    rangeEndMs = this.rangeEndDate.getTime();

                var entryStartTime = new Date(calEvent.get('StartDateTime')),
                    entryStartTimeMs = entryStartTime.getTime(),
                    entryEndTime = new Date(calEvent.get('EndDateTime')),
                    entryEndTimeMs = entryEndTime.getTime();

                if (entryStartTimeMs >= rangeStartMs && entryStartTimeMs <= rangeEndMs ||
                    entryEndTimeMs >= rangeStartMs && entryEndTimeMs <= rangeEndMs) {

                    // Array of entries grouped by day
                    var dayEntries = {};

                    while (entryStartTimeMs <= entryEndTimeMs) {

                        // Checking if entry start is in the weeks range, if it is it can be appended
                        if (entryStartTimeMs >= rangeStartMs && entryStartTimeMs <= rangeEndMs &&
                            !(this.nonWorkingDays.indexOf(entryStartTime.getDay()) >= 0 && this.nonWorkingHidden)) {

                            // Setting entry date to the beginning of entry start time
                            var entryDate = new Date(entryStartTime);
                            entryDate.setHours(0, 0, 0, 0);

                            // Creating new entry
                            var entry = new MonthEntry({
                                model:calEvent,
                                date:entryDate,
                                monthEntryRenderFn:this.options.monthEntryRenderFn,
                                monthEntryChangeFn:this.options.monthEntryChangeFn
                            });

                            // Adding event listener for selected event
                            entry.on('focused', this._entry_focusedHandler, this);
                            entry.on('contextMenu', this._entry_contextMenuHandler, this);

                            // Creating entries group array if necessary
                            if (!dayEntries.hasOwnProperty(entryDate.getTime()))
                                dayEntries[entryDate.getTime()] = [];

                            // adding entry to local associative array
                            dayEntries[entryDate.getTime()].push(entry.render().el);

                            // Pushing entry component to the array
                            this.entries.push(entry);
                        }

                        // Setting next day startDateTime
                        entryStartTime = new Date(entryStartTime);
                        entryStartTime.setHours(0, 0, 0, 0);
                        entryStartTime.setDate(entryStartTime.getDate() + 1);
                        entryStartTimeMs = entryStartTime.getTime();
                    }

                    // Adding created entries to the DOM
                    for (var day in dayEntries)
                        this.days[day].append(dayEntries[day]);

                    // Selecting event if it was previously selected
                    if (calEvent == this.selectedEvent)
                        this.selectEventEntries(calEvent);

                }
            }
        },

        _updateCalEvent:{
            value:function _updateCalEvent(calEvent) {
                this._removeCalEvent(calEvent);
                this._addCalEvent(calEvent);
            }
        },

        _removeCalEvent:{
            value:function _removeCalEvent(calEvent) {
                this.entries = this.entries.filter(function (entry) {
                    var remove = entry.model == calEvent;
                    if (remove)
                        this._removeEntryEventHandlers(entry);
                    return !remove;
                }, this);
            }
        },

        _removeEntryEventHandlers:{
            value:function _removeEntryEventHandlers(entry) {
                // Unregistering selected entry handlers
                entry.off('focused', this._entry_focusedHandler);
                entry.off('contextMenu', this._entry_contextMenuHandler);

                entry.remove();
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Entries selection functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        _entry_focusedHandler:{
            value:function _entry_focusedHandler(entry) {
                this.selectEventEntries(entry.model);
            }
        },

        selectEventEntries:{
            value:function selectEventEntries(calEvent) {
                this.entries.forEach(function (entry) {

                    if (calEvent == entry.model)
                        entry.select();
                    else if (entry.model == this.selectedEvent)
                        entry.unselect();

                }, this);

                this.selectedEvent = calEvent;
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Context menu functions
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////

        _entry_contextMenuHandler:{
            value:function _entry_contextMenuHandler(entry) {
                // Bubbling up
                this.trigger('contextMenu', entry);
            }
        }
    });
    return MonthView;
});