/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/10/12
 * Time: 4:53 PM
 */

define(['Component'], function (Component) {

    var EntryBase = function (options) {
        Component.call(this, options);

        if (!this.isTouch) {
            this.$el.on('click', this_clickHandler.bind(this));
            this.$el.on('contextmenu', this_clickHandler.bind(this));
        }

        this.$el.on(this.MOUSE_DOWN_EV, this_mouseDownHandler.bind(this));

        function this_mouseDownHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            // Triggering selected event
            this.trigger('focused', this);

            var that = this,
            // For desktop devices document needs to be a move and up target
                moveTarget = $(document);

            // Clearing longPress flag
            this_mouseDownHandler.longPress = undefined;

            // Setting new timer to check long press event
            this_mouseDownHandler.longPressTimer = setTimeout(function () {

                if (this_mouseDownHandler.longPress == undefined) {

                    // Adding move and up listeners
                    moveTarget.off(that.MOUSE_MOVE_EV, this_mouseMoveHandler);
                    moveTarget.off(that.MOUSE_UP_EV, this_mouseUpHandler);

                    this_mouseDownHandler.longPress = true;
                    that.trigger('contextMenu', that);
                }

            }, 300);

            // Getting touch point with touch coordinates, this depends on the runtime,
            // on devices it's part of touches array
            var touchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event;

            // Entry element offset
            var elOffset = this.$el.offset();

            // Setting touch point X and Y
            this_mouseDownHandler.touchPoint = {
                x:touchPoint.pageX,
                y:touchPoint.pageY,
                offsetX:touchPoint.pageX - elOffset.left,
                offsetY:touchPoint.pageY - elOffset.top
            };

            // Adding move and up listeners
            moveTarget.on(this.MOUSE_MOVE_EV, {context:this}, this_mouseMoveHandler);
            moveTarget.on(this.MOUSE_UP_EV, {context:this}, this_mouseUpHandler);
        }

        function this_mouseMoveHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var that = event.data.context,
                dragEvent;

            if (that.dragging) {
                dragEvent = createDragEvent('dragging', event.originalEvent, that);
                that.trigger(dragEvent.type, dragEvent);
                return;
            }

            // Getting touch point with touch coordinates, this depends on the runtime,
            // on devices it part of touches array
            var moveTouchPoint = (event.type.indexOf('touch') == 0) ? event.originalEvent.touches[0] : event;

            // Getting touch point when mouse was down
            var downTouchPoint = this_mouseDownHandler.touchPoint;

            if (that.canDrag && (Math.abs(downTouchPoint.x - moveTouchPoint.pageX) > 20
                || Math.abs(downTouchPoint.y - moveTouchPoint.pageY) > 20)) {

                that.dragging = true;
                this_mouseDownHandler.longPress = false;

                dragEvent = createDragEvent('draggingStart', event.originalEvent, that);
                that.trigger(dragEvent.type, dragEvent);
            }
        }

        function this_mouseUpHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var that = event.data.context;
            $(event.currentTarget).off(that.MOUSE_MOVE_EV, this_mouseMoveHandler);
            $(event.currentTarget).off(that.MOUSE_UP_EV, this_mouseUpHandler);

            // Clearing long press timer
            clearTimeout(this_mouseDownHandler.longPressTimer);

            if (that.dragging) {
                that.dragging = false;
                var dragEvent = createDragEvent('drop', event.originalEvent, that);
                that.trigger(dragEvent.type, dragEvent);
            }
        }

        function createDragEvent(type, originalEvent, target) {
            var touchPoint;
            if (originalEvent.type.indexOf('touch') == 0) {

                if (originalEvent.touches.length > 0)
                    touchPoint = originalEvent.touches[0];
                else if (originalEvent.changedTouches.length > 0)
                    touchPoint = originalEvent.changedTouches[0];
                else
                    throw new Error('Touch point coordinates are not available!');

            } else {
                touchPoint = originalEvent;
            }

            return {
                type:type,
                target:target,
                clientX:touchPoint.clientX,
                clientY:touchPoint.clientY,
                pageX:touchPoint.pageX,
                pageY:touchPoint.pageY,
                screenX:touchPoint.screenX,
                screenY:touchPoint.screenY,
                offsetX:this_mouseDownHandler.touchPoint.offsetX,
                offsetY:this_mouseDownHandler.touchPoint.offsetY
            };
        }

        function this_clickHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            // Triggering focused event
            this.trigger('focused', this);

            if (event.button == 2)
                this.trigger('contextMenu', this);
        }

    };
    EntryBase.prototype = Object.create(Component.prototype);

    EntryBase.prototype.select = function select() {
        this.$el.addClass('selected');
    };

    EntryBase.prototype.unselect = function unselect() {
        this.$el.removeClass('selected');
    };

    return EntryBase;
});