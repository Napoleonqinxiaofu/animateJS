/**
 * Create by xiaofu.qin {2017/8/22}
 */
define(function(require) {

    function splitWords(words) {
        words = words.trim ? words.trim() : words.replace(/^\s*|\s*$/g, "");
        return words.split(/\s+/).filter(function(str) {
            return str.length > 0;
        })
    }

    function getComputedStyle(element, attr, accessor) {
        if( element.nodeType !== 1 ) {
            throw new Error("element is not a DOM element.");
        }

        if( typeof accessor !== 'function' ) {
            accessor = function(x) {
                return x;
            }
        }

        var computedStyle = element.currentStyle ? element.currentStyle
            : window.getComputedStyle(element, null),

            attributes = splitWords(attr),
            obj = {};

        attributes.forEach(function(attr) {
            obj[attr] = accessor(computedStyle[attr]);
        });

        return obj;
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

    function isArray(arr) {
        return /array\]$/i.test(Object.prototype.toString.call(arr));
    }

    function isObject(prop) {
        return !!Object.prototype.toString.call(prop).match(/object\]$/i);
    }

    /**
     * 在这里对Animate函数的props进行一下规范化，否则Animate调用会出错的
     * @param props
     * @returns {{}}
     */
    function normalizeProps(props) {
        if( !isObject(props) ) {
            throw new TypeError("props is required to be an object variable.");
        }
        var keys = Object.keys(props),
            newProps = {};

        keys.forEach(function (key) {
            newProps[key] = {
                start: props[key].start || props[key].end || 100,
                end: props[key].end || props[key].start || 100
            };
        });

        return newProps;
    }

    return {
        getComputedStyle: getComputedStyle,
        style: style,
        isArray: isArray,
        isObject: isObject,
        normalizeProps: normalizeProps
    };

});