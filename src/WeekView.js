/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 5/29/12
 * Time: 1:06 PM
 */

define(['Component', 'utils/DateHelper', 'text!WeekView.tpl!strip'],
    function (Component, DateHelper, WeekViewTpl) {

        var WeekView = function (options) {
            // Setting WeekView template as a root element
            options.el = WeekViewTpl;

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

            this.updateView = function updateView() {
                // Setting week range dates
                setRangeDates.call(this);

                // Setting hour height in px
                measure.call(this);

                // Drawing background grid based on current hour height
                drawCalendarGrid.call(this);
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
                var $header,
                    $day,
                    dayWidth,
                    day = this.rangeStartDate,
                    now = new Date,
                    headers = [],
                    days = [];

                this.weekDays.length = 0;

                for (var i = 0; i < 7; i++) {
                    if (this.nonWorkingHidden && this.nonWorkingDays.indexOf(day.getDay()) >= 0)
                        continue;

                    // Pushing day date into the weekDays array
                    this.weekDays.push(day);

                    // Calculating day width
                    if (this.nonWorkingHidden)
                        dayWidth = 100 / (7 - this.nonWorkingDays.length);
                    else
                        dayWidth = 100 / 7;

                    // Creating new day column
                    $header = $('<cj:WeekDayHeader><cj:Label>' + DateHelper.format(day, "d") + '</cj:Label><cj:Label>' +
                        DateHelper.format(day, "ddd") + '</cj:Label></cj:WeekDayHeader>').css('width', dayWidth + '%');

                    // Adding to local array
                    headers.push($header[0]);

                    // Creating new day column
                    $day = $('<cj:WeekDay />').css(
                        {'background-size':'100% ' + this.hourHeight + 'px', 'width':dayWidth + '%', height:this.hourHeight * 24});

                    // Adding to local array
                    days.push($day[0]);

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

        };
        WeekView.prototype = Object.create(Component.prototype);

        return WeekView;
    });