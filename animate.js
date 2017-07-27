// 模拟vancahrts的动画，只针对DOM元素可行
(function(global) {
	var requestAnimationFrame = window.requestAnimationFrame || 
				window.mozRequestAnimationFrame  ||
				window.webkitRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(fn) {
					setTimeout(fn, 16);
				},
		cancelAnimationFrame = window.cancelAnimationFrame || 
				window.mozCancelAnimationFrame || 
				window.msCancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.clearTimeout;


	var obj = {
        /**
		 * 开始的时候设置一些初始值
         */
		initSetVariable : function() {
            // 动画总的执行时间（ms）
            this._duration = 1000;
			// 元素需要改变的属性和值，这是目标值，由用户传递进来
			this._props = {};
            // 回调函数
            this._callbacks = [];
			// 需要动画的元素
			this._element = null;
			// 延迟时间，默认为0
			this._delay = 0;

			// 定时器句柄
			this._timer = null;
			// 动画开始的时间
			this._startTime= null;

			// 插值的方式,默认为线性插值，其余的请查看interpolate.js
			this._ease = 'linear';

			// 初始状态的时候_element的各种需要进行动画的属性的值
			this._startStateProps = {};

            // 暂停时需要记录动画已经执行的时间长度
            this._elapsedTime = null;
		},
        /**
		 * 设置延迟时间，但是必须在start函数调用之前。
         * @param daley
         * @returns {obj}
         */
		delay : function(daley) {
			if( this._isAnimating() ) {
				return;
			}
			this._delay = daley;
			return this;
		},

        /**
		 * 设置动画执行时间，必须在start函数调用之前进行调用，否则无效。
         * @param totalTime
         * @returns {obj}
         */
		duration : function(totalTime) {
			// 正在进行动画，不接受任何的参数
			if( this._isAnimating() ) {
				return;
			}
			this._duration = totalTime;
			return this;
		},

        /**
		 * 设置动画的方式，具体动画的方式请查看interpolate.js，该函数也是必须要在start函数之前进行调用才会生效。
         * @param mode
         * @returns {obj}
         */
		ease : function(mode) {
			if ( this._isAnimating() ) {
				return this;
			}

			this._ease = mode;

			return this;
		},

        /**
		 * 暂停动画
         * @returns {obj}
         */
		pause : function() {
			// 保存下动画已经执行的时间
			this._elapsedTime = Date.now() - this._startTime;
			this._startTime = null;

			// 关闭定时器
			cancelAnimationFrame(this._timer);
			return this;
		},

        /**
		 * 暂停动画之后继续执行动画
         * @returns {obj}
         */
		play : function() {
			// 开始播放动画，将_startTime设置为当前时间 - this._elapsedTime的时间
			this._startTime = Date.now() - this._elapsedTime;
			
			// 开启定时器
			this._timer = requestAnimationFrame(this._animationStart.bind(this));

			return this;
		},

        /**
		 * 开始执行动画
         * @returns {obj}
         */
		start : function() {
			if( this._isAnimating() ) {
				return this;
			}
			if( Object.keys(this._props).length === 0 ) {
				return this;
			}

            // 缓存下this             
            var self = this;
			
			// 执行delay毫秒之后再执行动画这个逻辑
			if( this._delay > 0 ) {
				window.setTimeout(function() {
					self.start();
					// 设置delay的值为0，下次调用start的时候就不会执行这里了
					self._delay = 0;
				}, self._delay);

				// 别执行下面的代码了
				return this;
			}

			// 记录初始时间
			this._startTime = Date.now();

			// 获取DOM元素的初始值（一定是跟数值有关）
			this._calcInitState();

			// 对每一个_props的值进行插值计算
			this._generateInterpolator();

			// console.log(this._startStateProps, this._props);

			// 开启定时器
			this._timer = requestAnimationFrame(this._animationStart.bind(this));

			return this;
		},

        /**
		 * 停止动画，并将元素的状态跳转到最后的状态。
         * @returns {obj}
         */
		stop : function() {
			this._startTime = null;

			// 设置中间状态为1的时候的状态，就是最终状态了。
			this._setMiddleState(1);

			cancelAnimationFrame(this._timer);

			//执行callbacks的函数
			var i = this._callbacks.length - 1;
			for( ; i >= 0; i-- ) {
				this._callbacks[i] && this._callbacks[i]();
			}

			// 顺便destroy当前动画产生的一些额外数据、属性
			this.destroy();

			return this;
		},

        /**
		 * 动画完成之后可以执行用户的一些自定义函数，由该函数来传递。
         * @param callback
         * @returns {obj}
         */
		complete : function(callback) {
			// 将callback推进数组里吧
			this._callbacks.push(callback);
			return this;
		},

        /**
		 * 销毁一些属性，省得页面中动画过多而产生一些性能问题。
         */
		destroy : function() {
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
		_isAnimating : function() {
			return !!this._startTime;
		},

        /**
		 * 在start函数执行的时候要计算需要进行动画的元素属性的初始值，
		 * 包括计算数值大小、获得该属性的单位（比如px或者其他）、
		 * 为每一个属性生成一个数值插值器。
         * @private
         */
		_calcInitState : function() {
			var keys = Object.keys(this._props),
				i = keys.length - 1,
				value;

			for (; i>=0; i--) {
				// 获取计算属性值
				value = computedStyle(this._element, keys[i]);
				// 如果value是有关颜色的字符串的时候，有可能是rgb(...)或者rgba(...)
				// 也有可能是#ffasd十六进制的字符串，这样最好，不用转换了。
                value = RGBToHex(value);


				// 将初始值和最终的值转化成可以进行插值的数值，顺便保留单位之类的信息
				this._startStateProps[keys[i]] = {
					// 如果value不可以转化成数值的形式，那么就使用原来的值，可能是颜色值。
					value : Number.isNaN(window.parseFloat(value)) ? value : window.parseFloat(value),

					// 单位
					unit : (function(str) {
						var re = /^(\d+)(\D+)$/g,
							matches = re.exec(str) || [];

						return matches[2] || '';
					}(value))
				};

				this._props[keys[i]] = {
					value : isNaN(window.parseFloat(this._props[keys[i]])) ?
                        	this._props[keys[i]] : window.parseFloat(this._props[keys[i]]),
                    unit : this._startStateProps[keys[i]].unit
				}
			}
		},

        /**
		 * 对每一个_props的属性添加一个插值器，就放在每一个key里面
         * @private
         */
		_generateInterpolator : function() {
			// 对每一个_props里面的值生成插值器
			var keys = Object.keys(this._props),
				i = keys.length - 1,
				domain,
				range;

			for( ; i >= 0; i-- ) {
				domain = this._startStateProps[keys[i]].value;
				range = this._props[keys[i]].value;

				this._props[keys[i]].interpolator = interpolate(this._ease)
					.domain(domain)
					.range(range);
			}
		},

        /**
		 *  开始进行动画
         * @private
         */
		_animationStart : function() {
			var now = Date.now(),
				elapsedTime = now - this._startTime,
				ratio = elapsedTime / this._duration;

			if ( elapsedTime > this._duration ) {
				// 停止动画
				this.stop();
				return;
			}

			this._setMiddleState(ratio);

			this._timer = requestAnimationFrame(this._animationStart.bind(this));
		},

        /**
		 * 设置动画中某一帧的状态
         * @param ratio [0, 1]之间的一个值，计算方式为(Date.now() - this._startTime) / this._duration
         * @private
         */
		_setMiddleState : function(ratio) {
			// 开始设置各种prop
			var keys = Object.keys(this._props),
				i = keys.length - 1,
				cssText = ";";

			for( ; i >= 0; i-- ) {
				cssText +=  keys[i] + ":" +
							this._props[keys[i]].interpolator.getValue(ratio) + 
							this._props[keys[i]].unit + ";";
			}

			// 为元素更改属性
			style(this._element, cssText);
		}
	}

    /**
	 * 对外的接口
     * @param element 需要运动的元素
     * @param props 需要运动的属性
     * @param duration 运动周期，默认为1000ms
     * @param mode 插值方式，默认为linear线性
     * @returns
     */
	function Animate(element, props, duration, mode) {
		if ( this instanceof Animate ) {
			this.initSetVariable();
            this._element = element;
            this._props = props || this._props;
            this._duration = duration || this._duration;
            this._ease = mode || 'linear';
            return this;
		}else {
			return new Animate(element, props, duration, mode);
		}
	}

	Animate.prototype = Object.create(obj);

    // 暴露出Animate函数
    global.animate = Animate;


    /**
	 * 获取某一个元素下浏览器的计算属性值，也就是最终渲染出来的某一个属性的值。
     * @param element
     * @param attr
     * @returns {*}
     */
	function computedStyle(element, attr) {
		var style = element.currentStyle ? element.currentStyle : 
					window.getComputedStyle(element, null);
		return style[attr];
	}

    /**
	 * 为某一个元素设置属性值，单指style样式属性。如果值传递两个参数，则表示第二个参数为cssText。
	 * 如果传递了是三个参数，那么第二个参数为属性名称，第三个参数为属性值。
     * @param element
     * @param attr
     * @param value
     */
	function style(element, attr, value) {
		var obj = {
				attrValue : function(element, attr, value) {
					element.style.cssText += ";" + attr + ":" + value;
				},
				value : function(element, cssText) {
					element.style.cssText += cssText;
				}
			},
			len = arguments.length;

		switch(len) {
			case 2:
				obj.value.apply(null, arguments);
				break;

			case 3:
				obj.attrValue.apply(null, arguments);
				break;
		}
	}

    /**
	 * 将rgb(...)转化成#......十六进制的值
     * @param str
     * @returns {*}
     */
	function RGBToHex(str) {
		var temp = str + "";
		// 不是颜色值的情况
		if ( !/#|rgb/ig.test(temp) ) {
			return str;
		}

		//rgb() 或者 rgba() 的情况，提取每一个通道的值
		str = str.replace(/\s*/g, '');
		var re = /\d+,\d+,\d+/i,
			matches = str.match(re)[0] || "0,0,0";

		return "#" + matches.split(',').map(function(item) {
			return parseInt(item, 10).toString(16);
		}).join("");
	}

} (this || window));