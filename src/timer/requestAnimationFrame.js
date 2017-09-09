/**
 * Create by xiaofu.qin {2017/9/7}
 */

define(function (require) {
    /*! animationFrame.h5ive.js | (c) Kyle Simpson | MIT License: http://getify.mit-license.org */

    var RAF = (window.requestAnimationFrame || window.msRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.oRequestAnimationFrame) ||
        function(fn) {
            return window.setTimeout(fn, 17);
        },

        CAF = (window.cancelAnimationFrame ||
            window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
            window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
            window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
            window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame) ||
            window.clearTimeout,

        publicAPI, queueIds = {};

    /**
     * 获取一个queueIds中不存在的键值
     * @returns {number|*}
     */
    function qID() {
        var id;

        id = Math.floor(Math.random() * 1E9);
        while(id in queueIds) {
            id = Math.floor(Math.random() * 1E9);
        }

        return id;
    }

    function queue(callback) {
        var qid = qID();

        queueIds[qid] = RAF(function () {
            delete queueIds[qid];
            callback.apply(publicAPI, arguments);
        });

        return qid;
    }

    function queueRAFAfter(cb) {
        var qid;

        qid = queue(function () {
            // do our own RAF call here because we want to re-use the same `qid` for both frames
            queueIds[qid] = RAF(function () {
                delete queueIds[qid];
                cb.apply(publicAPI, arguments);
            });
        });

        return qid;
    }

    function cancel(qID) {
        if (qID in queueIds) {
            CAF(queueIds[qID]);
            delete queueIds[qID];
        }
        return publicAPI;
    }

    publicAPI = {
        queue: queue,
        queueRAFAfter: queueRAFAfter,
        cancel: cancel
    };

    return publicAPI;

});