/**
 * Create by xiaofu.qin {2017/9/9}
 */
var d3_timer_queueHead, d3_timer_queueTail,
    d3_timer_interval, d3_timer_timeout,
    d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function (callback) {
        setTimeout(callback, 17);
    };

// 主函数
d3.timer = function () {
    d3_timer.apply(this, arguments);
};

function d3_timer(callback, delay, then) {
    var n = arguments.length;
    if (n < 2) delay = 0;
    if (n < 3) then = Date.now();
    // time 表示总时间
    var time = then + delay, timer = {
        c: callback,
        t: time,
        n: null
    };
    if (d3_timer_queueTail) {
        d3_timer_queueTail.n = timer;
    }
    else {
        d3_timer_queueHead = timer;
    }

    d3_timer_queueTail = timer;
    if (!d3_timer_interval) {
        // 清除定时器句柄
        d3_timer_timeout = clearTimeout(d3_timer_timeout);
        d3_timer_interval = 1;
        d3_timer_frame(d3_timer_step);
    }
    return timer;
}

function d3_timer_step() {
    var now = d3_timer_mark(),
        delay = d3_timer_sweep() - now;

    if (delay > 24) {
        if (isFinite(delay)) {
            clearTimeout(d3_timer_timeout);
            d3_timer_timeout = setTimeout(d3_timer_step, delay);
        }
        d3_timer_interval = 0;
    } else {
        d3_timer_interval = 1;
        d3_timer_frame(d3_timer_step);
    }
}

// 立即执行时间队列，然后清洗掉已经结束的事件。
d3.timer.flush = function () {
    d3_timer_mark();
    d3_timer_sweep();
};

// 遍历时间队列，如果回调函数返回真，则将该事件的回调赋值为空，然后继续检查下一个，最后返回当前时间。
function d3_timer_mark() {
    var now = Date.now(), timer = d3_timer_queueHead;
    while (timer) {
        if (now >= timer.t && timer.c(now - timer.t)) {
            timer.c = null;
        }
        // 第一次执行timer.n还是null值呢！*
        timer = timer.n;
    }
    return now;
}

// 时间事件队列的清洗，循环遍历队列中的时间对象，
// 如果回调函数为空，去掉，否则检测下一个，最后返回最近要执行的事件时间点。
function d3_timer_sweep() {
    var t0, t1 = d3_timer_queueHead, time = Infinity;
    while (t1) {
        if (t1.c) {
            if (t1.t < time) time = t1.t;
            t1 = (t0 = t1).n;
        } else {
            t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
        }
    }
    // 将Head转给Tail
    d3_timer_queueTail = t0;
    // 现在返回的time是当前timer的
    return time;
}