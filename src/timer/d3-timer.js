/**
 * Create by xiaofu.qin {2017/9/9}
 */

define(function (require) {
    var animationFrame = require("./requestAnimationFrame");

    var frame = 0, // is an animation frame pending?
        timeout = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = animationFrame.queue;

    function now() {
        return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
        clockNow = 0;
    }

    function Timer() {
        this._call =
            this._time =
                this._next = null;
    }

    Timer.prototype = timer.prototype = {
        constructor: Timer,
        restart: function (callback, delay, time) {
            if (typeof callback !== "function") throw new TypeError("callback is not a function");
            time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
            if (!this._next && taskTail !== this) {
                if (taskTail) taskTail._next = this;
                else taskHead = this;
                taskTail = this;
            }
            this._call = callback;
            this._time = time;
            sleep();
        },
        stop: function () {
            if (this._call) {
                this._call = null;
                this._time = Infinity;
                sleep();
            }
        }
    };

    function wake() {
        clockNow = (clockLast = clock.now()) + clockSkew;
        frame = timeout = 0;
        try {
            timerFlush();
        } finally {
            frame = 0;
            nap();
            clockNow = 0;
        }
    }

    function poke() {
        var now = clock.now(), delay = now - clockLast;
        if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
        var t0, t1 = taskHead, t2, time = Infinity;
        while (t1) {
            if (t1._call) {
                if (time > t1._time) time = t1._time;
                t0 = t1, t1 = t1._next;
            } else {
                t2 = t1._next, t1._next = null;
                t1 = t0 ? t0._next = t2 : taskHead = t2;
            }
        }
        taskTail = t0;
        sleep(time);
    }

    function sleep(time) {
        if (frame) return; // Soonest alarm already set, or will be.
        if (timeout) timeout = clearTimeout(timeout);
        var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
        if (delay > 24) {
            if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
            if (interval) interval = clearInterval(interval);
        } else {
            if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
            frame = 1, setFrame(wake);
        }
    }

    function timer(callback, delay, time) {
        var t = new Timer;
        t.restart(callback, delay, time);
        return t;
    }

    function timerFlush() {
        now(); // Get the current time, if not already set.
        ++frame; // Pretend we’ve set an alarm, if we haven’t already.
        var t = taskHead, e;
        while (t) {
            if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
            t = t._next;
        }
        --frame;
    }

    // setTimeout
    function d3SetTimeout(callback, delay, time) {
        var t = new Timer;
        delay = delay == null ? 0 : +delay;
        t.restart(function (elapsed) {
            t.stop();
            callback(elapsed + delay);
        }, delay, time);
        return t;
    }

    // setInterval
    function d3SetInterval(callback, delay, time) {
        var t = new Timer, total = delay;
        if (delay == null) return t.restart(callback, delay, time), t;
        delay = +delay, time = time == null ? now() : +time;
        t.restart(function tick(elapsed) {
            elapsed += total;
            t.restart(tick, total += delay, time);
            callback(elapsed);
        }, delay, time);
        return t;
    }


    return {
        now: now,
        timer: timer,
        timerFlush: timerFlush,
        setTimeout: d3SetTimeout,
        setInterval: d3SetInterval
    }

})