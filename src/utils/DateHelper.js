/**
 * Created by Piotr Walczyszyn (outof.me | @pwalczyszyn)
 *
 * User: pwalczys
 * Date: 2/22/12
 * Time: 3:50 PM
 */

define(function () {

    var DateHelper = function () {
    }

    DateHelper.SEC_MS = 1000;

    DateHelper.MINUTE_MS = 60 * DateHelper.SEC_MS;

    DateHelper.HOUR_MS = 60 * DateHelper.MINUTE_MS;

    DateHelper.DAY_MS = 24 * DateHelper.HOUR_MS;

    DateHelper.toISO8601 = function (date) {
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        month = ( month < 10 ) ? '0' + month : month;
        day = ( day < 10 ) ? '0' + day : day;
        hours = ( hours < 10 ) ? '0' + hours : hours;
        minutes = ( minutes < 10 ) ? '0' + minutes : minutes;
        seconds = ( seconds < 10 ) ? '0' + seconds : seconds;

        var tzOffsetSign = "-";
        var tzOffset = date.getTimezoneOffset();
        if (tzOffset < 0) {
            tzOffsetSign = "+";
            tzOffset = -tzOffset;
        }
        var tzOffsetMinutes = tzOffset % 60;
        var tzOffsetHours = (tzOffset - tzOffsetMinutes) / 60;
        var tzOffsetMinutesStr = tzOffsetMinutes < 10 ? "0" + tzOffsetMinutes : "" + tzOffsetMinutes;
        var tzOffsetHoursStr = tzOffsetHours < 10 ? "0" + tzOffsetHours : "" + tzOffsetHours;
        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + ".000" + tzOffsetSign + "" + tzOffsetHoursStr + "" + tzOffsetMinutesStr;

    }

    DateHelper.parseISO8601 = function (string) {
        if ((string == null) || (string == "")) return null;
        var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
            "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
            "(Z|(([-+])([0-9]{2})([0-9]{2})))?)?)?)?";
        var d = string.match(new RegExp(regexp));
        var offset = 0;
        var date = new Date(d[1], 0, 1);

        if (d[3]) {
            date.setMonth(d[3] - 1);
        }
        if (d[5]) {
            date.setDate(d[5]);
        }
        if (d[7]) {
            date.setHours(d[7]);
        }
        if (d[8]) {
            date.setMinutes(d[8]);
        }
        if (d[10]) {
            date.setSeconds(d[10]);
        }
        if (d[12]) {
            date.setMilliseconds(Number("0." + d[12]) * 1000);
        }
        if (d[14]) {
            offset = (Number(d[16]) * 60) + Number(d[17]);
            offset = ((d[15] == '-') ? offset : -offset);
        }
        offset = offset - (date.getTimezoneOffset());
        date.setTime(date.getTime() + offset * 60 * 1000);
        return date;
    }


    var addDays = DateHelper.addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    };

    var firstDayOfWeek = DateHelper.firstDayOfWeek = function (date) {
        var day = date.getDay();
        day = (day == 0) ? -6 : day - 1;
        return addDays(date, -day);
    };

    var hoursInMs = DateHelper.hoursInMs = function (date) {
        return date.getHours() * 60 * 60 * 1000
            + date.getMinutes() * 60 * 1000
            + date.getSeconds() * 1000
            + date.getMilliseconds();
    };

    var sameDates = DateHelper.sameDates = function (date1, date2) {
        return date1.getYear() == date2.getYear() && date1.getMonth() == date2.getMonth()
            && date1.getDate() == date2.getDate();
    };

    var lastDayOfWeek = DateHelper.lastDayOfWeek = function (date) {
        var day = date.getDay();
        (day == 0) || (day = 7 - day);
        return addDays(date, day);
    };

    var nextWeekFirstDay = DateHelper.nextWeekFirstDay = function (date) {
        return addDays(firstDayOfWeek(date), 7);
    };

    var prevWeekFirstDay = DateHelper.prevWeekFirstDay = function (date) {
        return addDays(firstDayOfWeek(date), -7);
    };

    var nextMonthFirstDay = DateHelper.nextMonthFirstDay = function (date) {
        var result = new Date(date);
        result.setMonth(date.getMonth() + 1, 1);
        return result;
    };

    var prevMonthFirstDay = DateHelper.prevMonthFirstDay = function (date) {
        var result = new Date(date);
        result.setMonth(date.getMonth() - 1, 1);
        return result;
    };


    /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */
    var format = DateHelper.format = function () {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = format;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:d,
                    dd:pad(d),
                    ddd:dF.i18n.dayNames[D],
                    dddd:dF.i18n.dayNames[D + 7],
                    m:m + 1,
                    mm:pad(m + 1),
                    mmm:dF.i18n.monthNames[m],
                    mmmm:dF.i18n.monthNames[m + 12],
                    yy:String(y).slice(2),
                    yyyy:y,
                    h:H % 12 || 12,
                    hh:pad(H % 12 || 12),
                    H:H,
                    HH:pad(H),
                    M:M,
                    MM:pad(M),
                    s:s,
                    ss:pad(s),
                    l:pad(L, 3),
                    L:pad(L > 99 ? Math.round(L / 10) : L),
                    t:H < 12 ? "a" : "p",
                    tt:H < 12 ? "am" : "pm",
                    T:H < 12 ? "A" : "P",
                    TT:H < 12 ? "AM" : "PM",
                    Z:utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:(o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings
    format.masks = {
        "default":"ddd mmm dd yyyy HH:MM:ss",
        shortDate:"m/d/yy",
        mediumDate:"mmm d, yyyy",
        longDate:"mmmm d, yyyy",
        fullDate:"dddd, mmmm d, yyyy",
        shortTime:"h:MM TT",
        mediumTime:"h:MM:ss TT",
        longTime:"h:MM:ss TT Z",
        isoDate:"yyyy-mm-dd",
        isoTime:"HH:MM:ss",
        isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    format.i18n = {
        dayNames:[
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames:[
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
            "November", "December"
        ]
    };

    return DateHelper;
});