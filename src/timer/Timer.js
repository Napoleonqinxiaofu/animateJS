/**
 * Create by xiaofu.qin {2017/9/7}
 */
define(function(require) {

    var animationFrame = require("./requestAnimationFrame");

    var clock = typeof performance === 'object' && performance.now ? performance : Date;

    // 当前时间
    var clockNow;

    // 队列头部和尾部
    var queueHead, queueTail;

    // 当前执行帧
    var frame = 0;

    function now() {
        // 暂时不加上什么clockSkew这样的东西了，看不懂
        return clockNow || (animationFrame.queue(clearNow), clockNow = clock.now());
    }

    // 清除掉clockNow变量，使之变成0
    function clearNow() {
        clockNow = 0;
    }

    function Timer(callback, delay, callTime) {
        if( this instanceof Timer ) {
            this._time = this._next = this._call = null;
            this.restart(callback, delay, callTime);
            return this;
        }else {
            return new Timer(callback, delay, callTime);
        }
    }

    Timer.prototype = {
        constructor: Timer,
        restart: function(callback, delay, callTime) {
            if( typeof callback !== "function" ) {
                throw new Error("timer require a function as it's first params");
            }

            this._call = callback;
            this._time = (callTime == null ? now() : +callTime ) + (delay == null ? 0 : +delay);

            // 第一次初始化，没有_next、下一帧的执行函数
            if( !this._next && queueTail !== this ) {
                queueTail && (queueTail._next = this);
                // 第一次执行的话只能把执行函数给队列前的变量咯
                !queueTail && (queueHead = this);
                queueTail = this;
            }

            // 调用等待的方法来等待下一帧的到来并执行
            wait();
        }
    };

    function wait(time) {
        if( frame ) return;
        frame = 1;
        animationFrame.queue(wake);
    }

    return {
        now: now,
        timer: Timer
    };

});