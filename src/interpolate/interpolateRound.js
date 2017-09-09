/**
 * Create by xiaofu.qin {2017/9/5}
 * 数值线性插值取整
 */
define(function(require) {

    return function(a, b) {
        a = +a;
        b -= a;
        return function(t) {
            return Math.round(a + b * t);
        }
    }

});