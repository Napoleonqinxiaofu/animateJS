/**
 * Create by xiaofu.qin {2017/8/22}
 */
define(function(require) {

    var animateFrame = require("./calcAnimate");
    var util = require("../common/util");

    var slice = [].slice;

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
            if( element.nodeType !== 1 ) throw new TypeError("element is required to be a DOM element.");
            if( !util.isObject(props) ) throw new TypeError("props is required to be an object variable");

            Object.keys(props).forEach(function(key) {
                props[key] = {
                    start: util.getComputedStyle(element, key)[key],
                    end: props[key]
                }
            });

            this.animateHandle = new animateFrame(props, duration, mode);

            this.eachFrame(function(obj) {
                var cssText = (function(attrAndValues) {

                    var str = "";
                    Object.keys(attrAndValues).forEach(function(attr) {
                        str += attr + ":" + attrAndValues[attr];
                    });

                    return str;

                }(obj));

                util.style(element, cssText);
            });

            var self = this;

            this.animateHandle.complete(function() {
                self.animateHandle = null;
            });

            return this;
        }else {
            return new Animate(element, props, duration, mode);
        }
    }

    Animate.prototype = {
        start: function() {
            this.animateHandle.start();
            return this;
        },
        stop: function() {
            this.destroy();
        },
        pause: function() {
            if( !this.animateHandle ) {
                return this;
            }
            this.animateHandle.pause();
            return this;
        },
        play: function() {
            if( !this.animateHandle ) {
                return this;
            }
            this.animateHandle.play();
            return this;
        },
        complete: function() {
            this.animateHandle.complete.apply(this.animateHandle, slice.call(arguments));
            return this;
        },
        eachFrame: function() {
            this.animateHandle.eachFrame.apply(this.animateHandle, slice.call(arguments));
            return this;
        },
        ease: function(mode) {
            this.animateHandle.ease(mode);
            return this;
        },
        duration: function(duration) {
            this.animateHandle.duration(duration);
            return this;
        },
        delay: function(delay) {
            this.animateHandle.delay(delay);
            return this;
        },
        destroy: function() {
            this.animateHandle.stop
            && (this.animateHandle.stop(), this.animateHandle.destroy(), this.animateHandle = null);
        }
    };

    return Animate;

});