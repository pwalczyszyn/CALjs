/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define(['Component', 'WeekEntry', 'utils/DateHelper', 'text!WeekView.tpl!strip'],
    function (Component, WeekEntry, DateHelper, WeekViewTpl) {

        var WeekView = function (options) {
            // Setting WeekView template as a root element
            options.el = WeekViewTpl;

            // Initializing model if it's not set
            if (!options.collection) options.collection = [];

            // Calling parent constructor
            Component.call(this, options);

            this.SEC_MS = 1000;

            this.MINUTE_MS = 60 * 1000;

            this.HOUR_MS = 60 * 60 * 1000;

            this.DAY_MS = 24 * 60 * 60 * 1000;

            this.$headers = this.$('cj\\:Headers');

            this.$scroller = this.$('cj\\:Scroller');

            this.$container = this.$('cj\\:Container');

            this.$leftHours = this.$('cj\\:LeftHours');

            this.$days = this.$('cj\\:WeekDays');

            this.$rightHours = this.$('cj\\:RightHours');

            this.hourHeight = 0;

            this.scroller = null;

            this.currentScrollHour = -7.75;

            // Setting current WeekView date
            this.date = options && options.date ? options.date : new Date;

            this.nonWorkingHidden = options && options.nonWorkingHidden ? options.nonWorkingHidden : false;

            this.nonWorkingDays = options && options.nonWorkingDays ? options.nonWorkingDays : [0, 6];

            this.weekStartDay = options && options.weekStartDay ? options.weekStartDay : 1;

            this.rangeStartDate = null;

            this.rangeEndDate = null;

            this.weekDays = [];

            this.entries = [];

            this.selectedEvent = null;

            // TODO:
//        this.model.on('add', this.model_addHandler, this);
//        this.model.on('remove', this.model_removeHandler, this);
//        this.model.on('change', this.model_changeHandler, this);

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // WeekView navigation functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            this.showDate = function showDate(date) {
                this.date = date;
                this.updateView();
            }

            this.next = function next() {
                this.currentScrollHour = this.$container.position().top / this.hourHeight;

                var nextDate = new Date(this.rangeStartDate);
                nextDate.setDate(nextDate.getDate() + 7);
                this.showDate(nextDate);

                this.trigger('rangeChanged');
            }

            this.prev = function prev() {
                this.currentScrollHour = this.$container.position().top / this.hourHeight;

                var prevDate = new Date(this.rangeStartDate);
                prevDate.setDate(prevDate.getDate() - 7);
                this.showDate(prevDate);

                this.trigger('rangeChanged');
            }

            this.toggleNonWorking = function toggleNonWorking() {
                this.currentScrollHour = this.$container.position().top / this.hourHeight;

                this.nonWorkingHidden = !this.nonWorkingHidden;
                this.updateView();
            }

            this.updateView = function updateView() {
                // Setting week range dates
                setRangeDates.call(this);

                // Setting hour height in px
                measure.call(this);

                // Drawing background grid based on current hour height
                drawCalendarGrid.call(this);

                // Adding weeks entries
                addCalEvents.call(this);

//            // Refreshing scroller
//            this.scroller.enable();
//            this.scroller.refresh();
//            this.scroller.scrollTo(0, this.currentScrollHour * this.hourHeight, 200);
                this.$scroller.scrollTop(Math.abs(this.currentScrollHour) * this.hourHeight);
            }

            function setRangeDates() {
                var weekStartDate = new Date(this.date);
                weekStartDate.setHours(0, 0, 0, 0);
                if (weekStartDate.getDay() < this.weekStartDay)
                    weekStartDate.setDate(weekStartDate.getDate() + (this.weekStartDay - weekStartDate.getDay()) - 7);
                else
                    weekStartDate.setDate(weekStartDate.getDate() + (this.weekStartDay - weekStartDate.getDay()));
                this.rangeStartDate = weekStartDate;

                var weekEndDate = new Date(weekStartDate);
                weekEndDate.setHours(23, 59, 59, 999);
                weekEndDate.setDate(weekStartDate.getDate() + 6);
                this.rangeEndDate = weekEndDate;
            }

            function measure() {
                var hh = Math.floor(this.$scroller.height() / 9.5),
                    hhMod = hh % 4;
                this.hourHeight = (hhMod != 0) ? hh + (4 - hhMod) : hh;
            }

            function drawCalendarGrid() {
//                var $header,
//                    $day,
//                // Number of visible days
//                    visibleDaysCount = this.nonWorkingHidden ? 7 - this.nonWorkingDays.length : 7,
//                // Width of a day in %
//                    dayWidth = Math.floor(100 / visibleDaysCount),
//                // Width of a last day in %
//                    firstDayMargin = (100 - visibleDaysCount * dayWidth) / 2,
//
//                    $daysChildren = this.$days.children(),
//                    $headersChildren = this.$headers.children(),
//                    day = this.rangeStartDate,
//                    now = new Date;
//
//                // Clearing today and non-working classes
//                $daysChildren.removeClass('today non-working');
//                $headersChildren.removeClass('today non-working');
//
//                // Clearing weekDays array
//                this.weekDays.length = 0;
//
//                for (var i = 0; i < 7; i++) {
//                    $day = $($daysChildren.get(i));
//                    $header = $($headersChildren.get(i));
//
//                    if (this.nonWorkingHidden && this.nonWorkingDays.indexOf(day.getDay()) >= 0) {
//                        $day.css({display:'none'});
//                        $header.css({display:'none'});
//                    } else {
//                        $day.css({display:'inline-block'});
//                        $header.css({display:'inline-block'});
//                    }
//
//                    $header.children().get(0).innerText = DateHelper.format(day, "d");
//                    $header.children().get(1).innerText = DateHelper.format(day, "ddd");
//
//                    // Setting today class
//                    if (day.getYear() == now.getYear() && day.getMonth() == now.getMonth() && day.getDate() == now.getDate()) {
//                        $day.addClass('today');
//                        $header.addClass('today');
//                    }
//
//                    // Setting non-working class
//                    if (this.nonWorkingDays.indexOf(day.getDay()) >= 0) {
//                        $day.addClass('non-working');
//                        $header.addClass('non-working');
//                    }
//
//                    // Pushing day date into the weekDays array
//                    this.weekDays.push(day);
//
//                    // Incrementing to next day
//                    day = DateHelper.addDays(day, 1);
//                }
//
//                // Setting days canvas height, this +1 is additional pixel for bottom border
//                this.$container.height(this.hourHeight * 24 + 1);
//
//                $headersChildren.css('width', dayWidth + '%').first().css('margin-left', firstDayMargin + '%');
//                $daysChildren.empty().css({
//                    'background-size':'100% ' + this.hourHeight + 'px',
//                    height:this.hourHeight * 24,
//                    width:dayWidth + '%'
//                }).first().css('margin-left', firstDayMargin + '%');


                var $header,
                    $day,
                // Number of visible days
                    visibleDaysCount = this.nonWorkingHidden ? 7 - this.nonWorkingDays.length : 7,
                // Width of a day in %
                    dayWidth = Math.floor(100 / visibleDaysCount),
                // Width of a last day in %
                    firstDayMargin = (100 - visibleDaysCount * dayWidth) / 2,

                    day = this.rangeStartDate,
                    now = new Date,
                    headers = [],
                    days = [];

                this.weekDays.length = 0;

                for (var i = 0; i < 7; i++) {
                    if (this.nonWorkingHidden && this.nonWorkingDays.indexOf(day.getDay()) >= 0)
                        continue;

                    // Creating new day column
                    $header = $('<cj:WeekDayHeader><cj:Label>' + DateHelper.format(day, "d")
                        + '</cj:Label><cj:Label>' + DateHelper.format(day, "ddd") + '</cj:Label></cj:WeekDayHeader>')
                        .css('width', dayWidth + '%');

                    // Creating new day column
                    $day = $('<cj:WeekDay/>').css({
                        'background-size':'100% ' + this.hourHeight + 'px',
                        width:dayWidth + '%',
                        height:this.hourHeight * 24
                    });

                    // Setting margin for first day of a week
                    if (i == 0) {
                        $day.css('margin-left', firstDayMargin + '%');
                        $header.css('margin-left', firstDayMargin + '%');
                    }

                    // Setting today class
                    if (day.getYear() == now.getYear() && day.getMonth() == now.getMonth() && day.getDate() == now.getDate()) {
                        $day.addClass('today');
                        $header.addClass('today');
                    }

                    // Setting non-working class
                    if (this.nonWorkingDays.indexOf(day.getDay()) >= 0) {
                        $day.addClass('non-working');
                        $header.addClass('non-working');
                    }

                    // Adding to local array
                    headers.push($header[0]);

                    // Adding to local array
                    days.push($day[0]);

                    // Pushing day date into the weekDays array
                    this.weekDays.push(day);

                    // Incrementing to next day
                    day = DateHelper.addDays(day, 1);
                }

                // Setting days canvas height, this +1 is additional pixel for bottom border
                this.$container.height(this.hourHeight * 24 + 1);

                // Removing existing headers
                if (this.$headers.length > 0)
                    this.$headers.empty();

                if (headers.length > 0)
                // Appending day column to the canvas
                    this.$headers.append(headers);

                // Removing existing days
                if (this.$days.length > 0)
                    this.$days.empty();

                if (days.length > 0)
                // Appending day column to the canvas
                    this.$days.append(days);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // CalEvent handling functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function addCalEvents() {
                // Removing all previous entries
                this.entries.forEach(removeEntryEventHandlers, this);

                // Clearing entries array
                this.entries.length = 0;

                // Adding model entries
                this.collection.forEach(addCalEvent, this);
            }

            function addCalEvent(calEvent) {

                var weekStartMs = this.rangeStartDate.getTime(),
                    weekEndMs = this.rangeEndDate.getTime();

                var entryStartTime = new Date(calEvent.get('StartDateTime')),
                    entryStartTimeMs = entryStartTime.getTime(),
                    entryEndTime = new Date(calEvent.get('EndDateTime')),
                    entryEndTimeMs = entryEndTime.getTime();

                if (entryStartTimeMs >= weekStartMs && entryStartTimeMs <= weekEndMs ||
                    entryEndTimeMs >= weekStartMs && entryEndTimeMs <= weekEndMs) {

                    // Array of entries grouped by day
                    var dayEntries = {};

                    while (entryStartTimeMs <= entryEndTimeMs) {

                        // This day is not the end of the entry, setting end of the day in this case
                        if (!DateHelper.sameDates(entryStartTime, entryEndTime)) {
                            entryEndTime = new Date(entryStartTime);
                            entryEndTime.setHours(23, 59, 59, 999);
                        }

                        // Checking if entry start is in the weeks range, if it is it can be appended
                        if (entryStartTimeMs >= weekStartMs && entryStartTimeMs <= weekEndMs &&
                            !(this.nonWorkingDays.indexOf(entryStartTime.getDay()) >= 0 && this.nonWorkingHidden)) {

                            var entry = new WeekEntry(
                                {
                                    model:calEvent,
                                    hourHeight:this.hourHeight,
                                    startDateTime:entryStartTime,
                                    endDateTime:entryEndTime,
                                    el:this.options.entryTemplate
                                });

                            // Adding event listener for selected event
                            entry.on('focused', entry_focusedHandler, this);
                            entry.on('contextMenu', entry_contextMenuHandler, this);
                            entry.on('barMove', entry_barMoveHandler, this);
                            entry.on('barMoveEnd', entry_barMoveEndHandler, this);

                            // Adding event listeners for d&d events
                            entry.on('draggingStart', entry_draggingStartHandler, this);
                            entry.on('dragging', entry_draggingHandler, this);
                            entry.on('drop', entry_dropHandler, this);

                            var entryDay = entryStartTime.getDay();
                            (entryDay == 0) ? entryDay = 6 : entryDay--;

                            // Creating entries group array if necessary
                            if (!dayEntries.hasOwnProperty(entryDay))
                                dayEntries[entryDay] = [];

                            // adding entry to local associative array
                            dayEntries[entryDay].push(entry.render().el);

                            // Pushing entry component to the array
                            this.entries.push(entry);
                        }

                        // Setting next day startDateTime
                        entryStartTime = new Date(entryStartTime);
                        entryStartTime.setTime(entryStartTime.getTime() + this.DAY_MS);
                        entryStartTime.setHours(0, 0, 0, 0);
                        entryStartTimeMs = entryStartTime.getTime();

                        entryEndTime = new Date(calEvent.get('EndDateTime'));
                    }

                    // Adding created entries to the DOM
                    for (var day in dayEntries)
                        $(this.$days.children()[day]).append(dayEntries[day]);

                    // Selecting event if it was previously selected
                    if (calEvent == this.selectedEvent)
                        this.selectEventEntries.call(this, calEvent);
                }
            }

            function updateCalEvent(calEvent) {
                removeCalEvent.call(this, calEvent);
                addCalEvent.call(this, calEvent);
            }

            function removeCalEvent(calEvent) {
                this.entries = this.entries.filter(function (entry) {
                    var remove = entry.model == calEvent;
                    if (remove)
                        removeEntryEventHandlers.call(this, entry);
                    return !remove;
                }, this);
            }

            function removeEntryEventHandlers(entry) {
                // Unregistering selected entry handlers
                entry.off('focused', entry_focusedHandler);
                entry.off('contextMenu', entry_contextMenuHandler);
                entry.off('barMove', entry_barMoveHandler);
                entry.off('barMoveEnd', entry_barMoveEndHandler);

                // Unregistering d&d entry handlers
                if (!entry.dragging) {
                    entry.off('draggingStart', entry_draggingStartHandler);
                    entry.off('dragging', entry_draggingHandler);
                    entry.off('drop', entry_dropHandler);

                    // Removing component from the DOM
                    entry.remove();
                }
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Entry drag & drop functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function entry_draggingStartHandler(event) {

                var entryModel = event.target.model,
                    height = (entryModel.get('EndDateTime').getTime() - entryModel.get('StartDateTime').getTime()) /
                        this.HOUR_MS * this.hourHeight;

                var ghostEntry = entry_draggingStartHandler.ghostEntry = event.target.$el.clone();
                ghostEntry.css({
                    width:$(this.$days.children()[0]).width(),
                    top:'none',
                    bottom:'none',
                    height:height,
                    opacity:0.7
                });

                ghostEntry.appendTo(this.$scroller);
                ghostEntry.offset({left:event.pageX - event.offsetX, top:event.pageY - event.offsetY});

            }

            function entry_draggingHandler(event) {

                // Getting days offset
                var daysOffset = this.$days.offset(),

                // Day width, calculated based on first day
                    dayWidth = this.$days.children().width(),

                // Calculated total days width
                    daysWidth = dayWidth * this.$days.children().length;

                // Getting left and top based on dragging event params
                var left = event.pageX - event.offsetX,
                    top = event.pageY - event.offsetY;

                if (event.pageX >= daysOffset.left && event.pageX <= daysOffset.left + daysWidth) {

                    // Calculating day snapping
                    var // Calculating day num
                        dayNum = Math.floor((event.pageX - daysOffset.left) / dayWidth),

                    // Getting day
                        $day = $(this.$days.children()[dayNum]),

                    // Day offset
                        dayOffset = $day.offset(),

                    // Day mid
                        dayMid = dayOffset.left + (dayWidth / 2),

                    // Touch point deviation from the middle of the entry
                        deviation = (event.pageX - dayMid) / dayWidth;

                    // entry left position
                    left = dayOffset.left + dayWidth * 0.2 * deviation;

                    // Restricting top value
                    if (top < dayOffset.top)
                        top = dayOffset.top;

                    drawTimeChangeMarkers.call(this, {time:getNearestTime.call(this, (top - dayOffset.top))});

                    // Reseting weekChanged flag
                    entry_draggingHandler.weekChanged = false;

                } else {

                    // User has to move back to days in order to make another week change
                    if (!entry_draggingHandler.weekChanged) {

                        // TODO: hiding is a hack because on devices removing element from a DOM which originates
                        // the event stops subsequent events from firing
                        event.target.$el.hide();
                        event.target.$el.appendTo(this.$scroller);

                        if (event.pageX < daysOffset.left)
                            this.prev();
                        else
                            this.next();

                        entry_draggingHandler.weekChanged = true;
                    }
                }

                var ghostEntry = entry_draggingStartHandler.ghostEntry;
                ghostEntry.offset({left:left, top:top});
            }

            function entry_dropHandler(event) {
                var ghostEntry = entry_draggingStartHandler.ghostEntry;

                // Removing dragged entry from the DOM
                ghostEntry.remove();

                // Clearing dragged entry
                entry_draggingStartHandler.ghostEntry = null;

                // Clearing markers
                clearTimeChangeMarkers.call(this);

                // Getting days offset
                var daysOffset = this.$days.offset(),

                // Day width, calculated based on first day
                    dayWidth = this.$days.children().width(),

                // Calculated total days width
                    daysWidth = dayWidth * this.$days.children().length;

                if (event.pageX >= daysOffset.left && event.pageX <= daysOffset.left + daysWidth) {

                    var top = event.pageY - event.offsetY,

                    // Calculating day num
                        dayNum = Math.floor((event.pageX - daysOffset.left) / dayWidth),

                    // Getting day
                        $day = $(this.$days.children()[dayNum]),

                    // Day offset
                        dayOffset = $day.offset(),

                    // Setting day date
                        day = this.weekDays[dayNum];

                    // Restricting top value
                    if (top < dayOffset.top)
                        top = dayOffset.top;

                    var snappedStartTime = getNearestTime.call(this, top - dayOffset.top);

                    var calEvent = event.target.model,
                    // Entry start date time
                        startDateTime = calEvent.get('StartDateTime'),
                    // Entry end date time
                        endDateTime = calEvent.get('EndDateTime'),
                    // Entry duration
                        duration = endDateTime.getTime() - startDateTime.getTime(),
                    // New entry start and end
                        newStartDateTime, newEndDateTime;

                    newStartDateTime = new Date(day);
                    newStartDateTime.setHours(
                        snappedStartTime.getHours(),
                        snappedStartTime.getMinutes(),
                        snappedStartTime.getSeconds(),
                        snappedStartTime.getMilliseconds()
                    );

                    // Calculating new end date time
                    newEndDateTime = new Date(newStartDateTime.getTime() + duration);

                    // Updating model with new dates
                    calEvent.set({StartDateTime:newStartDateTime, EndDateTime:newEndDateTime});
                }

                // Forcing reflow, for some reason on iOS emulator it was required
                this.$el.width();
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Entries selection functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function entry_focusedHandler(entry) {
                this.selectEventEntries.call(this, entry.model);
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Side bars markers
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function drawTimeChangeMarkers(changeInfo) {
                // Restoring previous markers
                var $markers = arguments.callee.markers;

                // Clearing previous markers
                arguments.callee.markers = null;
                // Setting previous markers font-weight to normal
                if ($markers && $markers.hasClass('hour-marker'))
                    $markers.css('font-weight', '');
                // Removing previous minutes markers from DOM
                else if ($markers && $markers.hasClass('minutes-marker'))
                    $markers.remove();

                if (changeInfo.time.getMinutes() == 0 || changeInfo.time.getMinutes() == 59) {

                    var labelIndex = changeInfo.time.getMinutes() == 59 ? 24 : changeInfo.time.getHours();
                    if (labelIndex == 0) {
                        // TODO: implement 0:00 label
                    } else if (labelIndex == 24) {
                        // TODO: implement 24:00 label
                    } else {
                        $markers = $(this.$leftHours.children()[labelIndex]);
                        $markers = $markers.add(this.$rightHours.children()[labelIndex]);
                        $markers.css('font-weight', 'bold');
                    }

                } else {

                    // TODO:
                    // Creating new marker
                    $markers = $('<cj:Label class="minutes-marker"/>');
                    // Cloning marker for the right side and adding it to $markers set
                    $markers = $markers.add($markers.clone());

                    // Appending left marker
                    this.$leftHours.append($markers[0]);
                    // Appending right marker
                    this.$rightHours.append($markers[1]);

                    // TODO: make date format configurable
                    $markers.html(DateHelper.format(changeInfo.time, ':MM'));

                    // Setting markers top position
                    $markers.css('top',
                        (changeInfo.time.getHours() + changeInfo.time.getMinutes() / 60) * this.hourHeight + 'px');
                }

                // Caching for next call
                arguments.callee.markers = $markers;
            }

            function clearTimeChangeMarkers() {
                // Clearing hour:minutes markers
                var $markers = drawTimeChangeMarkers.markers;
                if ($markers) {
                    // Nulling recent marker
                    drawTimeChangeMarkers.markers = null;

                    // Setting markers font-weight to normal
                    if ($markers.hasClass('hour-marker'))
                        $markers.css('font-weight', 'normal');
                    // Removing minutes markers from DOM
                    else if ($markers.hasClass('minutes-marker'))
                        $markers.remove();
                }
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Entry resize functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function entry_barMoveHandler(event) {
                var offsetY = event.offsetY,
                    entry = event.target;

                if (offsetY != 0) {
                    // Calculating new height
                    var newHeight = this.DAY_MS - (entry.entryTop + entry.entryBottom) + offsetY;

                    // New snapped time
                    var timeChange;

                    if (event.bar == 'bottom') {
                        var newBottom = entry.entryBottom - offsetY;
                        if (newBottom >= 0 && newBottom + (this.hourHeight / 2) <= (24 * this.hourHeight - entry.entryTop)) {
                            entry.entryBottom = newBottom;
                            entry.$el.css({bottom:entry.entryBottom + 'px'});

                            timeChange = getSnappedTime.call(this, event.bar, entry);
                        }
                    } else {
                        var newTop = entry.entryTop + offsetY;
                        if (newTop >= 0 && newTop + (this.hourHeight / 2) <= (24 * this.hourHeight - entry.entryBottom)) {
                            entry.entryTop = newTop;
                            entry.$el.css({top:entry.entryTop + 'px'});

                            timeChange = getSnappedTime.call(this, event.bar, entry);
                        }
                    }

                    if (timeChange) {

                        if (!arguments.callee.timeChange || timeChange.getTime() != arguments.callee.timeChange.getTime())
                            drawTimeChangeMarkers.call(this, {time:timeChange, bar:event.bar, target:entry});

                        arguments.callee.timeChange = timeChange;
                    }
                }
            }

            function entry_barMoveEndHandler(event) {
                console.log('');
                var entry = event.target;

                var snappedTime = getSnappedTime.call(this, event.bar, entry);
                var modelUpdate;
                if (event.bar == 'bottom') {
                    entry.endDateTime = snappedTime;
                    modelUpdate = {EndDateTime:snappedTime};
                } else {
                    entry.startDateTime = snappedTime;
                    modelUpdate = {StartDateTime:snappedTime};
                }

                if (entry.model.set(modelUpdate, {silent:true})) {

                    entry.model.change({calChange:true});

                    entry.measure();
                    entry.$el.css({top:entry.entryTop + 'px', bottom:entry.entryBottom + 'px'});

                } else {
                    throw new Error('Error updating CalEvent start or end date!');
                }

                clearTimeChangeMarkers.call(this);
            }

            function getSnappedTime(bar, entry) {
                var that = entry;
                var startingDateTime = bar == 'bottom' ? that.endDateTime : that.startDateTime,
                    startingPosition = bar == 'bottom' ? (24 * that.hourHeight - that.entryBottom) : that.entryTop;

                var snappedHour = getNearestTime.call(this, startingPosition),
                    result = new Date(startingDateTime);
                result.setHours(
                    snappedHour.getHours(),
                    snappedHour.getMinutes(),
                    snappedHour.getSeconds(),
                    snappedHour.getMilliseconds()
                );

                return result;
            }

            function getNearestTime(from) {
                var that = this;
                var hour = from / that.hourHeight * that.HOUR_MS,
                    modMs = hour % (that.HOUR_MS * 0.25);

                if (modMs > 7.5 * that.MINUTE_MS)
                    hour = hour - modMs + 15 * this.MINUTE_MS;
                else
                    hour = hour - modMs;

                var result = new Date(hour);
                // Converting to locale aware date
                result.setHours(result.getUTCHours(),
                    result.getUTCMinutes(),
                    result.getUTCMinutes(),
                    result.getUTCMilliseconds());

                // If snap is before 0:00 time
                if (result.getMonth() > 1)
                    result.setTime(0);
                // If snap is after 23:59:59:999
                else if (result.getDate() > 1)
                    result.setTime(result.getTime() - 1);

                return result;
            }


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Context menu functions
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function entry_contextMenuHandler(entry) {
                // Bubbling up
                this.trigger('contextMenu', entry);
            }
        };
        WeekView.prototype = Object.create(Component.prototype);

        WeekView.prototype.selectEventEntries = function (calEvent) {
            this.entries.forEach(function (entry) {

                if (calEvent == entry.model)
                    entry.select();
                else if (entry.model == this.selectedEvent)
                    entry.unselect();

            }, this);

            this.selectedEvent = calEvent;
        }

        return WeekView;
    });