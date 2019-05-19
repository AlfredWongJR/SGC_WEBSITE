import numeral from "numeral";

// let's make a custom numeral format. I don't really know how this works.
numeral.register("format", "half", {
    regexps: {
        format: /(1\/2)/,
        unformat: /(1\/2)/
    },
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    format: function (value, format, roundingFunction) {
        const whole = Math.floor(value);
        const remainder = value - whole;
        const fraction = (function () {
            switch (remainder) {
            case 0.25:
                return "¼";
            case 0.5:
                return "½";
            case 0.75:
                return "¾";
            default:
                return "";
            }
        }());
        const stringedWhole = (
            (whole === 0 && remainder)
            ? ""
            : String(whole)
        );
        return stringedWhole + fraction;
    },
    /** @param {string} value */
    unformat: function (value) {
        return Number(value); // doesn't work... todo?
    }
});
