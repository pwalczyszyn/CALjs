/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 6/4/12
 * Time: 4:54 PM
 */

define(function () {

    var isTouch = 'ontouchstart' in window,
        MOUSE_DOWN = isTouch ? 'touchstart' : 'mousedown',
        MOUSE_UP = isTouch ? 'touchend' : 'mouseup';

    $(document).on(MOUSE_DOWN, "cj\\:Button",
        function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            var el = this, $el = $(el);

            // Detecting if this is left mouse button
            if ((isTouch && event.originalEvent.touches.length == 1) || (!isTouch && event.which == 1)) {

                $el.removeClass('up down').addClass('active');

                $(document).on(MOUSE_UP, function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    // Remove MOUSE_UP listener
                    $(document).off(MOUSE_UP, arguments.callee);

                    $el.removeClass('active');

                    var groupName = $el.attr('name'),
                        groupButtons = groupName ? $("jc\\:Button[name='" + groupName + "']") : null;

                    if (groupButtons) {

                        if (groupButtons.length > 1) {
                            var wasUp = false;
                            groupButtons.each(function () {
                                if (this == el) {

                                    if ($el.hasClass('up')) {
                                        $el.removeClass('up');
                                        wasUp = true;
                                    }

                                    if (!$el.hasClass('down'))
                                        $el.addClass('down');

                                } else {
                                    var $grpBtn = $(this);
                                    if ($grpBtn.hasClass('down'))
                                        $grpBtn.removeClass('down');

                                    if (!$grpBtn.hasClass('up'))
                                        $grpBtn.addClass('up');
                                }
                            });

                            // tbclick if the button was up
                            if (wasUp) $el.trigger('tbclick');

                        } else {

                            // This is a toggle button
                            if ($el.hasClass('down'))
                                $el.removeClass('down').addClass('up');
                            else
                                $el.removeClass('up').addClass('down');

                            // Toggle button always triggers tbclick no matter what
                            $el.trigger('tbclick');
                        }
                    } else {
                        // Triggering default tbclick event
                        $el.trigger('tbclick');
                    }
                });
            }
        });
});