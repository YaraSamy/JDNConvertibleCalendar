export module JDNConvertibleCalendar {

    /**
     * Contains methods for conversions from calendar dates to JDN and vice versa.
     *
     * All members are static, no instantiation required.
     */
    export class JDNCalendarConversion {

        static readonly GREGORIAN_EPOCH = 1721425.5;
        static readonly JULIAN_EPOCH = 1721423.5;
        static readonly HEBREW_EPOCH = 347995.5;
        static readonly FRENCH_REVOLUTIONARY_EPOCH = 2375839.5;

        constructor() {
            // no instantiation required
        }

        static leapGregorian(year: number) {
            let yearInt = Math.floor(year);
            return ((yearInt % 4) == 0) && (!(((yearInt % 100) == 0) && ((yearInt % 400) != 0)));
        }

        static mod(a, b) {
            return a - (b * Math.floor(a / b));
        }

        /**
         * Converts a Gregorian calendar date to a JDN.
         *
         * @param {JDNConvertibleCalendar.CalendarDate} calendarDate
         * @returns {number}
         */
        public static gregorianToJDN(calendarDate: CalendarDate): number {

            const yearInt = Math.floor(calendarDate.year);
            const monthInt = Math.floor(calendarDate.month);
            const dayInt = Math.floor(calendarDate.day);

            const jdn = (JDNCalendarConversion.GREGORIAN_EPOCH - 1) +
                (365 * (yearInt - 1)) +
                Math.floor((yearInt - 1) / 4) +
                (-Math.floor((yearInt - 1) / 100)) +
                Math.floor((yearInt - 1) / 400) +
                Math.floor((((367 * monthInt) - 362) / 12) +
                    ((monthInt <= 2) ? 0 : (JDNCalendarConversion.leapGregorian(yearInt) ? -1 : -2)) + dayInt);

            // convert JDC to JDN (ignore fraction)
            return Math.round(jdn);
        };

        /**
         * Converts a JDN to a Gregorian Calendar date.
         *
         * @param {number} jdn
         * @returns {JDNConvertibleCalendar.CalendarDate}
         */
        public static JDNToGregorian(jdn: number): CalendarDate {

            // if a Julian Day has a fraction of 0.5 or higher, it refers to midnight (0h) or later
            // if it is has a fraction below 0.5, it refers to a time before midnight which is the day before
            // 2457498.5 -> 2016-04-20 0h
            // 2457498.4 -> 2016-04-19
            const wjd = Math.floor(jdn - 0.5) + 0.5;
            const depoch = wjd - JDNCalendarConversion.GREGORIAN_EPOCH;
            const quadricent = Math.floor(depoch / 146097);
            const dqc = JDNCalendarConversion.mod(depoch, 146097);
            const cent = Math.floor(dqc / 36524);
            const dcent = JDNCalendarConversion.mod(dqc, 36524);
            const quad = Math.floor(dcent / 1461);
            const dquad = JDNCalendarConversion.mod(dcent, 1461);
            const yindex = Math.floor(dquad / 365);

            let year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;

            if (!((cent == 4) || (yindex == 4))) {
                year++;
            }

            const yearday = wjd - JDNCalendarConversion.gregorianToJDN(new CalendarDate(year, 1, 1));
            const leapadj = ((wjd < JDNCalendarConversion.gregorianToJDN(new CalendarDate(year, 3, 1))) ? 0 : (JDNCalendarConversion.leapGregorian(year) ? 1 : 2));
            const month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);

            const day = (wjd - JDNCalendarConversion.gregorianToJDN(new CalendarDate(year, month, 1))) + 1;

            // if (year <= 0) year--; // correction for PHPvar JULIAN_EPOCH = 1721423.5;

            return new CalendarDate(Math.round(year), Math.round(month), Math.round(day));
        };

        /**
         * Converts a Julian calendar date to a JDN.
         *
         * @param {JDNConvertibleCalendar.CalendarDate} calendarDate
         * @returns {number}
         */
        public static julianToJDN(calendarDate: CalendarDate) {
            let yearInt = Math.floor(calendarDate.year);
            let monthInt = Math.floor(calendarDate.month);
            const dayInt = Math.floor(calendarDate.day);

            /* Adjust negative common era years to the zero-based notation we use.  */

            if (yearInt < 1) {
                yearInt++;
            }

            /* Algorithm as given in Meeus, Astronomical Algorithms, Chapter 7, page 61 */

            if (monthInt <= 2) {
                yearInt--;
                monthInt += 12;
            }

            const jdn: number = ((Math.floor((365.25 * (yearInt + 4716))) +
                Math.floor((30.6001 * (monthInt + 1))) +
                dayInt) - 1524.5);

            return Math.floor(jdn);
        }

        /**
         * Converts a JDN to a Julian Calendar date.
         *
         * @param {number} jdn
         * @returns {JDNConvertibleCalendar.CalendarDate}
         */
        public static JDNToJulian(jdn: number): CalendarDate {
            let jdc = Math.floor(jdn) + 0.5;

            const z = Math.floor(jdc);

            const a = z;
            const b = a + 1524;
            const c = Math.floor((b - 122.1) / 365.25);
            const d = Math.floor(365.25 * c);
            const e = Math.floor((b - d) / 30.6001);

            const month = Math.floor((e < 14) ? (e - 1) : (e - 13));
            let year = Math.floor((month > 2) ? (c - 4716) : (c - 4715));
            const day = b - d - Math.floor(30.6001 * e);

            /*  If year is less than 1, subtract one to convert from
                        a zero based date system to the common era system in
                        which the year -1 (1 B.C.E) is followed by year 1 (1 C.E.).  */

            if (year < 1) {
                year--;
            }

            return new CalendarDate(Math.round(year), Math.round(month), Math.round(day));
        }

    }

    /**
     * Represents a calendar date (format agnostic).
     */
    export class CalendarDate {

        constructor(readonly year: number, readonly month: number, readonly day: number) {

        }

    }

    /**
     * Represents a period as two JDNs.
     */
    class JDNPeriod {

        constructor(readonly jdnStart: number, readonly jdnEnd: number) {

        }
    }

    /**
     * Abstract class representing any calendar format
     * that can be converted from and to a Julian Day Number (JDN).
     */
    export abstract class JDNConvertibleCalendar {

        // calendar format name constants (shared among all instances)
        static readonly gregorian = 'Gregorian';
        static readonly julian = 'Julian';

        // supported calendar formats (to be extended when new subclasses are implemented)
        static readonly supportedCalendars = [JDNConvertibleCalendar.gregorian, JDNConvertibleCalendar.julian];

        // calendar format of an instance of JDNConvertibleCalendar
        readonly calendarFormat: string;

        // start of a given date
        protected startDate: CalendarDate;

        // end of a given date
        protected endDate: CalendarDate;

        /**
         * Converts an instance of JDNConvertibleCalendar to a JDNPeriod.
         *
         * @returns {JDNConvertibleCalendar.JDNPeriod}
         */
        abstract toJDN(): JDNPeriod;

        /**
         * Converts from one calendar format into another.
         *
         * @param {"Gregorian" | "Julian"} toCalendarType
         * @returns {JDNConvertibleCalendar}
         */
        convertCalendar(toCalendarType: 'Gregorian' | 'Julian'): JDNConvertibleCalendar {

            if (JDNConvertibleCalendar.supportedCalendars.indexOf(toCalendarType) == -1) {
                console.log("Target calendar format not supported: " + toCalendarType);
                return this;
            }

            if (this.calendarFormat == toCalendarType) return this; // no conversion needed

            const jdnPeriod: JDNPeriod = this.toJDN();

            switch (toCalendarType) {
                case JDNConvertibleCalendar.gregorian:
                    return new GregorianCalendar(jdnPeriod);

                case JDNConvertibleCalendar.julian:
                    return new JulianCalendar(jdnPeriod);
            }

        }

    }

    export class GregorianCalendar extends JDNConvertibleCalendar {

        readonly calendarFormat = JDNConvertibleCalendar.gregorian;

        constructor(jdnPeriod: JDNPeriod) {
            super();

            // create a Gregorian calendar date from jdnPeriod

            this.startDate = JDNCalendarConversion.JDNToGregorian(jdnPeriod.jdnStart);
            this.endDate = JDNCalendarConversion.JDNToGregorian(jdnPeriod.jdnEnd);

        }

        toJDN() {

            const startJDN = JDNCalendarConversion.gregorianToJDN(this.startDate);
            const endJDN = JDNCalendarConversion.gregorianToJDN(this.endDate);

            return new JDNPeriod(startJDN, endJDN);
        }

    }

    export class JulianCalendar extends JDNConvertibleCalendar {

        readonly calendarFormat = JDNConvertibleCalendar.julian;

        constructor(jdnPeriod: JDNPeriod) {
            super();

            // create a Gregorian calendar date from jdn

        }

        toJDN() {
            return new JDNPeriod(0, 0);
        }

    }

}