// 实现数值插值
(function(global) {

	var interpolate = function(mode) {
		var obj = {
			// 插值方式，默认为线性插值，其余的可以再effects中进行查找
			_mode : mode || 'linear',
			// 默认采用数值插值的方式("number")，区间("region")、颜色插值("color")
			_type : 'number',
			// 定义域，对于数值插值来说是起始值，对于区间插值来说是需要映射的初始区间
			_domain : null,
			// 值域，对于数值插值就是最终的值，区间则是最终映射到的区间，颜色插值嘛就是最终的颜色了
			_range : null,

			// 值域与定义域的距离
			_distance : null,
			// 起始位置，其实就是_domain的另一个表示
			_start : null,

            /**
			 * 定义起始值（定义域）
             * @returns {obj}
             */
			domain : function() {
				var arg = arguments[0];
				this._domain = arg;
				this._type = "region";
				this._type = typeof arg === 'number' ? "number" : this._type;
				this._type = typeof arg === "string" ? "color" : this._type;

				return this;
			},

            /**
			 * 值域（最终的区间或者值）
             * @returns {obj}
             */
			range : function() {
				this._range = arguments[0];
                var self = this;

				switch(this._type) {
					case "region":
						this._distance = this._range[1] - this._range[0];
						this._start = this._range[0];
						break;
					case "number":
						this._distance = this._range - this._domain;
						this._start = this._domain;
						break;
					case "color":
						// 将颜色转化成数值形式先
						this._range = hexToNumber(this._range);
						this._domain = hexToNumber(this._domain);

						// 分别计算每一个颜色通道的distance和start
						this._start = this._domain;

						this._distance = this._start.map(function (item, index) {
							return self._range[index] - item;
                        });
						break;
				}

				return this;
			},

			getValue : function(t) {
				var result,
					self = this;

				switch(this._type) {
					case "number":
						// 现在的t为一个[0, 1]区间上的值，也就是运动的时候currentTime/totalTime
						result = ease(t, this._start, this._distance, this._mode);
						break;
					case "region":
						// t 为_domain数组区间的一个值,现在将其转变成0-1区间内的值
						t = (t - this._domain[0]) / (this._domain[1] - this._domain[0]);
						result =  ease(t, this._start, this._distance, this._mode);
						break;
					case "color":
						// 这个t应该是[0, 1]区间上的一个值，0表示初始值，1表示最终值。
						result = this._distance.map(function(item, index) {
							return ease(t, self._start[index], self._distance[index], self._mode);
						});
						
						result = RGBToString(result);
						break;
				}

				return result;
			}
		};

		return obj;
	}

    // 定义各种缓动的方式
    var effects = {
        // 线性
        linear : function(t) {
            return t;
        },
        // 平方
        quad : function(t) {
            return t * t;
        },

        //立方
        cubic : function(t) {
            return t * t * t;
        },

        // 四次方
        quart : function(t) {
            return t * t * t * t;
        },

        bounceOut: function(t) {
            if (t < (1 / 2.75)) {
                return 7.5625 * t * t;
            }
            if (t < (2 / 2.75)) {
                return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
            }
            if (t < (2.5 / 2.75)) {
                return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
            }
            return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
        },
        // 还有很多，现在就不添加了
    };

    /**
	 * 这个怎么说呢？就是获取定义域上某一个值在值域上的插值。
     * @param t 当前已经花费的时间elapsedTime/duration的结果
     * @param b 初始值，英文是beforeMove
     * @param c 总的变化量
     * @param type 插值的方式——effects对象的keys中的一个
     * @returns {*}
     */
    function ease(t, b, c, type) {
        t = effects[type](t);
        return c * t + b;
    }

    /**
	 * 将16进制的颜色字符串转化成三个十进制的数值。
     * @param str 颜色字符串
     * @returns {Array} 返回一个包含rbg三个值的数组
     */
    function hexToNumber(str) {
    	var colorMap = {
    		red : "#ff0000",
			blue : "#0000ff",
			black : "#000000",
			green : "#00ff00",
			white : "#ffffff"
		};

    	str = str.toLowerCase();
    	if( str in colorMap ) {
    		str = colorMap[str];
		}

		str = str.replace('#', '');

    	// 如果剩下的字符串不足6位，补零，否则去掉多余的字符
		str = str.length > 6 ? str.substr(0, 6) : str;
		str = str.length < 6 ? (str + "000000").substr(0, 6) : str;

		return new Array(3).join('-').split('-').map(function(item, index) {
			return parseInt(str.substr(index * 2, 2), 16);
		});
	}

    /**
	 * 将包含R、G、B三个值的数值数组转换成rgb颜色字符串。
     * @param rgbArr
     * @returns {string}
     */
	function RGBToString(rgbArr) {
    	if( rgbArr.length !== 3 ) {
    		throw new Error("The parameter should be an array contain R G B channel pixel value.");
		}
		return "#" + rgbArr.map(function(item) {
				var a = parseInt(item, 10).toString(16);
				a = a.length === 2 ? a : a + "0";
				return a;
			}).join("");
	}

	global.interpolate = interpolate;

}(this || window));