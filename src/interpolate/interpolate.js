/**
 * Create by xiaofu.qin {2017/9/6}
 */
define(function (require) {

    var number = require("./interpolateNumber");
    var string = require("./interpolateString");
    var round = require("./interpolateRound");
    var date = require("./interpolateDate");
    var color = require("./interpolateColor");
    var constant = require("./constant");

    function interpolate(a, b) {
        var type = typeof b;
        var inter;

        switch(type) {
            case "number":
                inter = a === b ? constant(a, b) : number(a, b);
                break;
            case "string":
                inter = b.charAt(0) === "#" ? color(a, b) : string(a, b);
                break;
            default:
                inter = b instanceof Date ? date(a, b) : constant(a, b);
                break;
        }

        return inter;
    }

    return interpolate;

});