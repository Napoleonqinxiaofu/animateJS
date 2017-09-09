/**
 * Create by xiaofu.qin {2017/8/22}
 */
define(['util'], function(util) {

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
                        this._range = util.hexToNumber(this._range);
                        this._domain = util.hexToNumber(this._domain);

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
                        result = util.ease(t, this._start, this._distance, this._mode);
                        break;
                    case "region":
                        // t 为_domain数组区间的一个值,现在将其转变成0-1区间内的值
                        t = (t - this._domain[0]) / (this._domain[1] - this._domain[0]);
                        result =  util.ease(t, this._start, this._distance, this._mode);
                        break;
                    case "color":
                        // 这个t应该是[0, 1]区间上的一个值，0表示初始值，1表示最终值。
                        result = this._distance.map(function(item, index) {
                            return util.ease(t, self._start[index], self._distance[index], self._mode);
                        });

                        result = util.RGBToString(result);
                        break;
                }

                return result;
            }
        };

        return obj;
    }

    return interpolate;

});