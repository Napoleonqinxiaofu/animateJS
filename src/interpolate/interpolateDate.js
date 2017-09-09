/**
 * Create by xiaofu.qin {2017/9/5}
 */
define(function() {

    return function (a, b) {
        var d = new Date;
        return a = +a, b -= a, function (t) {
            d.setTime(a + b * t);
            return d;
        };
    }

});
