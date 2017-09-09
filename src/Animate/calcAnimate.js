/**
 * Create by xiaofu.qin {2017/9/9}
 * 上一次写Animate.js的时候不太成熟，想重新写一下，这一次准备使用d3-timer这个辅助的小组件。
 * 现在去掉DOM的逻辑，如果想在外面使用DOM来作为运动，那么需要再写一些东西。
 */
define(function (require) {

    var interpolate = require("../interpolate/interpolate");
    var timer = require("../timer/d3-timer");
    var ease = require("../common/ease");
    var util = require("../common/util");

    function Animate(props, duration, delay, mode) {
        if( this instanceof Animate ) {
            this.initSetVariable();

            this._props = util.normalizeProps(props);
            this._duration = duration == null ? this._duration: +duration;
            this._delay = delay == null ? 0: +delay;
            this._mode = mode in ease ? mode: 'linear';

            return this;
        }else {
            return new Animate(props, duration, delay, mode);
        }
    }

    Animate.prototype = {
        /**
         * 开始的时候设置一些初始值
         */
        initSetVariable: function() {
            // 动画总的执行时间（ms）
            this._duration = 1000;

            // 元素需要改变的属性和值，这是目标值，由用户传递进来
            this._props = null;

            // 用来保存暂停的时候的props
            this._pauseProps = null;

            // 回调函数
            this._callbacks = [];

            // 延迟时间，默认为0
            this._delay = 0;

            // 定时器句柄
            this._timer = null;

            // 动画开始的时间
            this._isStart= false;

            // 插值的方式,默认为线性插值，其余的请查看ease.js
            this._ease = 'linear';

            // 暂停时需要记录动画已经执行的时间长度
            this._startTime = 0;
            this._elapsedTime = 0;

            // 对每一帧的回调函数数组
            this._eachFrameCallbacks = [];

            return this;
        },
        /**
         * 设置延迟时间，但是必须在start函数调用之前。
         * @param daley
         * @returns
         */
        delay: function(daley) {
            if( this._isAnimating() ) {
                return this;
            }
            this._delay = daley;
            return this;
        },

        /**
         * 设置动画执行时间，必须在start函数调用之前进行调用，否则无效。
         * @param totalTime
         * @returns {obj}
         */
        duration: function(totalTime) {
            // 正在进行动画，不接受任何的参数
            if( this._isAnimating() ) {
                return this;
            }
            this._duration = totalTime;
            return this;
        },

        /**
         * 设置动画的方式，具体动画的方式请查看interpolate.js，
         * 该函数也是必须要在start函数之前进行调用才会生效。
         * @param mode
         * @returns {obj}
         */
        ease: function(mode) {
            if ( this._isAnimating() ) {
                return this;
            }

            this._ease = mode in ease ? mode: 'linear';

            return this;
        },

        /**
         * 暂停动画
         * @returns {obj}
         */
        pause: function() {
            if( !this._isAnimating() ) {
                return this;
            }
            this._isStart = false;
            this._timer.stop();
            this._elapsedTime += timer.now() - this._startTime;

            return this;
        },

        /**
         * 暂停动画之后继续执行动画
         * @returns {obj}
         */
        play: function() {
            if( this._isAnimating() ) {
                return this;
            }

            this._isStart = true;
            this._startTime = timer.now();
            this._timer = timer.timer(this._animationStart.bind(this));

            return this;
        },

        /**
         * 开始执行动画
         * @returns {obj}
         */
        start: function() {
            if( this._isAnimating() ) {
                return this;
            }

            var keys =  Object.keys(this._props);

            if(keys.length === 0 ) {
                return this;
            }

            // 记录初始
            this._isStart = true;

            // 开启定时器
            this._timer = timer.timer(this._animationStart.bind(this), this._delay);

            return this;
        },

        /**
         * 停止动画，并将元素的状态跳转到最后的状态。
         * @returns {obj}
         */
        stop: function() {
            this._timer.stop();
            
            this._isStart = false;
            
            // 执行一下最后帧的时候的回调
            this._executeEachFrameCallbacks(1);

            // 执行callbacks的函数,这是complete函数传递进来的一些回调函数
            var i = this._callbacks.length - 1;
            for( ; i >= 0; i-- ) {
                this._callbacks[i] && this._callbacks[i]();
            }

            // 顺便destroy当前动画产生的一些额外数据、属性
            this.destroy();
        },

        /**
         * 每一帧执行完成之后回调
         * @param func 需要进行回调的函数或者函数数组
         */
        eachFrame: function(func) {
            var len;
            if ( util.isArray(func) ) {
                len = func.length-1;
                for( ; len >= 0; len--) {
                    typeof func[len] === 'function' &&
                    this._eachFrameCallbacks.push(func[len]);
                }
            }
            else if( typeof func === 'function' ) {
                this._eachFrameCallbacks.push(func);
            }

            return this;
        },

        /**
         * 动画完成之后可以执行用户的一些自定义函数，由该函数来传递。
         * @param callback
         * @returns {obj}
         */
        complete: function(callback) {
            // 将callback推进数组里吧
            this._callbacks.unshift(callback);
            return this;
        },

        /**
         * 销毁一些属性，省得页面中动画过多而产生一些性能问题。
         */
        destroy: function() {
            // 销毁，节省内存
            for( var key in this ) {
                if( this.hasOwnProperty(key) ) {
                    delete this[key];
                }
            }
        },

        /**
         * 判断当前是否在运动之中。
         * @returns {boolean}
         * @private
         */
        _isAnimating: function() {
            return this._isStart;
        },

        /**
         * 对每一个_props的属性添加一个插值器，就放在每一个key里面
         * @private
         */
        _buildEveryKeyInterpolator: function() {
            // 对每一个_props里面的值生成插值器
            var keys = Object.keys(this._props),
                i = keys.length - 1,
                domain,
                range;

            for( ; i >= 0; i-- ) {
                domain = this._props[keys[i]].start;
                range = this._props[keys[i]].end;

                this._props[keys[i]].interpolator = interpolate(domain, range);
            }
        },

        /**
         * 开始进行动画
         * @param elapsed {已经过去的时间}
         * @private
         */
        _animationStart: function(elapsed) {
            // 还有为每一个属性生成插值器
            var keys = Object.keys(this._props);
            !this._props[keys[0]].interpolator && this._buildEveryKeyInterpolator();
            this._startTime = this._startTime || timer.now();

            elapsed += this._elapsedTime;
            var ratio = elapsed / this._duration;
            ratio = ratio > 1 ? 1: ratio;

            // 完成DOM设置之后执行每一帧之后的回调函数，
            //参数是每一个值的当前插值
            this._executeEachFrameCallbacks(ratio);

            elapsed > this._duration && this.stop();
            return this;
        },

        /**
         * 执行每一帧的回调函数
         * @param ratio [0, 1]之间的一个值，
         * 计算方式为(Date.now() - this._startTime) / this._duration
         */
        _executeEachFrameCallbacks: function(ratio) {
            // 先计算当前需要进行动画的属性插值
            var obj = {},
                keys = Object.keys(this._props),
                i = keys.length - 1;

            ratio = ease[this._ease](ratio);

            for( ; i >= 0; i-- ) {
                obj[keys[i]] = this._props[keys[i]].interpolator(ratio);
            }

            i = this._eachFrameCallbacks.length - 1;
            for( ; i >= 0; i-- ) {
                this._eachFrameCallbacks[i](obj);
            }
        }
    };

    return Animate;

});
