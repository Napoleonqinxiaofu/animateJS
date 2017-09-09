/**
 * Create by xiaofu.qin {2017/9/5}
 */
define(function() {

    function number(a, b) {
        a = +a;
        b = +b;
        b -= a;
        return function(t) {
            return a + b * t;
        };
    }

    return number;
});
