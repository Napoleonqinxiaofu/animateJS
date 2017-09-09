/**
 * Create by xiaofu.qin {2017/9/6}
 * 简化一下d3-scale的interpolateColor的逻辑，它们的太麻烦了，也许还用不到
 */
define(function(require) {

    var Rgb = require('../common/Rgb');
    var interpolateNumber = require('./interpolateNumber');

    function interpolateColor(start, end) {
        start = Rgb(start);
        end = Rgb(end);

        var r = interpolateNumber(start.r, end.r),
            g = interpolateNumber(start.g, end.g),
            b = interpolateNumber(start.b, end.b),
            opacity = interpolateNumber(end.opacity == null ? 1 : start.opacity,
                end.opacity == null ? 1 : end.opacity);

        return function(t) {
            return "rgba(" + r(t) + ","
                    + g(t) + ","
                    + b(t) + ","
                    + opacity(t) + ")";
        };
    }

    return interpolateColor;

});