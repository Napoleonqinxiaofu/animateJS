/**
 * Create by xiaofu.qin {2017/9/5}
 */
define(function(require) {

    var interpolateNumber = require('./interpolateNumber');

    function interpolateString(a, b) {
        a += "", b += "";
        var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
            // reA == reB
            reB = new RegExp(reA.source, "g");

        var am, bm, splitStr = [],
            bStrIndex = 0;

        while( (am=reA.exec(a)) && (bm=reB.exec(b)) ) {
            bStrIndex <= bm.index && splitStr.push(b.slice(bStrIndex, bm.index));
            splitStr.push(interpolateNumber(am[0], bm[0]));
            bStrIndex = reB.lastIndex;
        }

        reB.lastIndex < b.length && splitStr.push(b.slice(reB.lastIndex));

        return function get(t) {
            return splitStr.map(function(item) {
                if( typeof item === "function" ) {
                    item = item(t);
                }
                return item;
            }).join("");
        }
    }

    return interpolateString;

});
