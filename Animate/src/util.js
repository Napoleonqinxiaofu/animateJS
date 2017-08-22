/**
 * Create by xiaofu.qin {2017/8/22}
 */
define(['ease'], function(effects) {


    /**
     * 这个怎么说呢？就是获取定义域上某一个值在值域上的插值。
     * @param t 当前已经花费的时间elapsedTime/duration的结果
     * @param b 初始值，英文是beforeMove
     * @param c 总的变化量
     * @param type 插值的方式——effects对象的keys中的一个
     * @returns {*}
     */
    function ease(t, b, c, type) {
        type = effects[type] ? type : 'linear';
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
                    element.style.cssText += ";" + cssText;
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
        if ( !/rgb/ig.test(temp) ) {
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

    function isArray(arr) {
        return /array\]$/i.test(Object.prototype.toString.call(arr));
    }

    return {
        ease: ease,
        RGBToString: RGBToString,
        hexToNumber: hexToNumber,
        computedStyle: computedStyle,
        style: style,
        RGBToHex: RGBToHex,
        isArray: isArray
    };

});