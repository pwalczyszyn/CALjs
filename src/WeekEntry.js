/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/6/12
 * Time: 4:36 PM
 */

define(['EntryBase', 'text!WeekEntry.tpl!strip'],
    function (EntryBase, WeekEntryTemplate) {
        var WeekEntry = function (options) {

            if (!options.el) options.el = WeekEntryTemplate;

            EntryBase.call(this, options);

            this.SEC_MS = 1000;

            this.MINUTE_MS = 60 * 1000;

            this.HOUR_MS = 60 * 60 * 1000;

            this.DAY_MS = 24 * 60 * 60 * 1000;

            this.hourHeight = 0;

            this.startDateTime = null;

            this.endDateTime = null;

            this.entryTop = 0;

            this.entryBottom = 0;

            this.$titleLabel = this.$('cj\\:Content cj\\:Label');

            this.$colorBar = this.$('cj\\:ColorBar');

            this.$resizeBarTop = null;

            this.$resizeBarBottom = null;

            this.canDrag = true;

            this.dragging = false;

            // Setting hour height in px
            this.hourHeight = options.hourHeight;

            // Setting entry start date time
            this.startDateTime = options.startDateTime;

            // Setting entry end date time
            this.endDateTime = options.endDateTime;

            // Doing initial measurements
            this.measure();

            // Adding top selection bar if possible
            if (this.startDateTime.getTime() == this.model.get('StartDateTime').getTime()) {
                this.$resizeBarTop = $('<cj:Handle />');
            } else {
                // TODO: implement dragging from spanning days
                this.canDrag = false;
            }

            // Adding bottom selection bar if possible
            if (this.endDateTime.getTime() == this.model.get('EndDateTime').getTime()) {
                this.$resizeBarBottom = $('<cj:Handle />');
            }

            // TODO: externalize it
//            this.model.on('change:AccountName', this.model_changeHandler, this);
//            this.model.on('change:Subject', this.model_changeHandler, this);
//            this.model.on('change:ActivityType', this.model_changeHandler, this);

        };
        WeekEntry.prototype = Object.create(EntryBase.prototype);

        WeekEntry.prototype.render = function render() {

            this.$colorBar.css('background-color', this.model.get('Color'));
            this.$titleLabel.html(this.model.get('Title'));

            this.$el.css({top:this.entryTop + 'px', bottom:this.entryBottom + 'px'});

            if (this.$el.hasClass('selected'))
                this.select();

            return this;
        }

        WeekEntry.prototype.measure = function measure() {
            // Calculating duration for a day in ms
            var duration = this.endDateTime.getTime() - this.startDateTime.getTime();

            // Calculating millis from beginning of the day
            var hour = this.startDateTime.getHours() * this.HOUR_MS +
                this.startDateTime.getMinutes() * this.MINUTE_MS +
                this.startDateTime.getSeconds() * this.SEC_MS +
                this.startDateTime.getMilliseconds();

            // Entry top in px
            this.entryTop = Math.floor(hour / this.HOUR_MS * this.hourHeight);

            // Entry bottom in px
            this.entryBottom = Math.floor((this.DAY_MS - (hour + duration)) / this.HOUR_MS * this.hourHeight);
        }

        WeekEntry.prototype.resizeBar_mouseDownHandler = function resizeBar_mouseDownHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var that = event.data.context;

            // Clearing prevPageY
            that.prevPageY = null;

            // Clearing prev time change value
            that.timeChange = null;

            var moveTarget = $(document);
            // Adding move and up listeners
            moveTarget.on(that.MOUSE_MOVE_EV, event.data, that.resizeBar_mouseMoveHandler);
            moveTarget.on(that.MOUSE_UP_EV, event.data, that.resizeBar_mouseUpHandler);
        }

        WeekEntry.prototype.resizeBar_mouseMoveHandler = function resizeBar_mouseMoveHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var that = event.data.context,

            // Checking if this is touch or mouse event
                touchCoords = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event,

            // Setting yDelta
                offsetY = that.prevPageY ? touchCoords.pageY - that.prevPageY : 0;

            that.prevPageY = touchCoords.pageY;

            // Triggering bar move event
            that.trigger('barMove', {offsetY:offsetY, bar:event.data.bar, target:that});
        }

        WeekEntry.prototype.resizeBar_mouseUpHandler = function resizeBar_mouseUpHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var that = event.data.context;

            $(event.currentTarget).off(that.MOUSE_MOVE_EV, that.resizeBar_mouseMoveHandler);
            $(event.currentTarget).off(that.MOUSE_UP_EV, that.resizeBar_mouseUpHandler);

            // Triggering bar move end event
            that.trigger('barMoveEnd', {bar:event.data.bar, target:that});
        }

        WeekEntry.prototype.select = function () {
            // Calling super select function
            EntryBase.prototype.select.call(this);

            // Adding top selection bar if possible
            if (this.$resizeBarTop) {
                this.$resizeBarTop.appendTo(this.$el);
                this.$resizeBarTop.on(this.MOUSE_DOWN_EV, {context:this, bar:'top'}, this.resizeBar_mouseDownHandler);
            }

            // Adding bottom selection bar if possible
            if (this.$resizeBarBottom) {
                this.$resizeBarBottom.appendTo(this.$el);
                this.$resizeBarBottom.on(this.MOUSE_DOWN_EV, {context:this, bar:'bottom'}, this.resizeBar_mouseDownHandler);
            }
        }

        WeekEntry.prototype.unselect = function () {
            // Calling super unselect function
            EntryBase.prototype.unselect.call(this);

            if (this.$resizeBarTop) {
                this.$resizeBarTop.detach();
                this.$resizeBarTop.off(this.MOUSE_DOWN_EV, this.resizeBar_mouseDownHandler);
            }

            if (this.$resizeBarBottom) {
                this.$resizeBarBottom.detach();
                this.$resizeBarBottom.off(this.MOUSE_DOWN_EV, this.resizeBar_mouseDownHandler);
            }
        }

        return WeekEntry;
    });