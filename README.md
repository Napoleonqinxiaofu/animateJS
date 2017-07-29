# animateJS 一个JS动画小脚本

animateJS是模仿很多的js库缓动效果的一个小脚本，可以实现delay（延迟）、pause（暂停）、继续播放（play），动画完成回调（complate）、stop（中断动画）的功能。

## Usage

在页面中引入interpolate.js和animate.js，为了能使用这两个文件定义的方法，首先你得等待这两个文件加载成功，我想这一定是大部分人的选择。

```Javascript
<div style="position: absolute;left:0;top:0;border:1px solid gray;height:100px;display:inline-block;width:100px;opacity: 1;background: white;"></div>
<script src="interpolate.js"></script>
<script src="animate.js"></script>
<script>
	// 获取页面中的div元素
	var oDiv = document.querySelector('div');
	// 接下来的代码都会放置在这里
	// coding……
</script>
```

#### 设置需要进行动画的元素与属性、动画时间周期、动画方式

使用animate全局的函数来初始化动画。

```Javascript
// animate(dom, props, [duration, [easeMode]])
var animateHandle = animate(
		oDiv,
		// 需要进行动画css属性
		{
			left : "400px",
			top : "200px",
			opacity : 0.4,

			// 还可以设置颜色的动画, 不过颜色值应该写成十六进制的形式
			"background-color" : "#ff0000"
		},

		// duration 可选，默认为1000ms，也可以一会儿再调用duration函数进行设置
		3000,
		// easeMode 可选，默认为linear，缓动的方式，
		//linear、quad、cubic、bounceOut……
		"bounceOut"
	);

	// 执行动画
	animateHandle.start();
```

设置动画时间

```Javascript
// 设置动画时间可以在animate函数中，也可以使用duration函数，
// 不过必须在start函数调用之前，否则设置无效
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 执行动画
		.start();
```

设置缓动方式，缓动的方式有：linear、easeInQuad、easeOutQuad、easeInOutQuad、easeInCubic、easeOutCubic、easeInOutCubic、easeInQuart、easeOutQuart、easeInOutQuart、easeInQuint、easeOutQuint、easeInOutQuint、easeInSine、easeOutSine、easeInOutSine、easeInExpo、easeOutExpo、easeInOutExpo、easeInCirc、easeOutCirc、easeInOutCirc、easeInElastic、easeOutElastic、easeInOutElastic、easeInBack、easeOutBack、easeInOutBack、easeInBounce、easeOutBounce、easeInOutBounce。

```Javascript
// 类似于duration，可以在animate函数中设置缓动方式（easeMode）
// 也可以使用ease方法进行设置，同样类似于duration函数，
// 必须在start函数调用之前
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 设置缓动方式为bounceOut
		.ease('bounceOut')
		// 执行动画
		.start();
```

设置延迟时间

```Javascript
// 设置延迟时间是表示时隔多少时间之后再执行动画
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 设置缓动方式为bounceOut
		.ease('bounceOut')
		//设置延迟时间为1秒
		.delay(1000)
		// 执行动画
		.start();
```

设置动画结束的回调

```Javascript
// 设置回调不需要再start调用之前
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 设置缓动方式为bounceOut
		.ease('bounceOut')
		//设置延迟时间为1秒
		.delay(1000)
		// 执行动画
		.start()
		.complete(function() {
			console.log("Animation is done");
		});
```

中断动画，直接跳到最终的动画状态

```Javascript
// 中断动画之后会直接跳转到动画的最终状态
animateHandle.stop();
```

暂停动画，不过这得等到delay的延迟时间过去了才能调用

```Javascript
animationHandle.pause();
```

继续动画，只有在暂停动画之后调用才有效

```Javascript
animationHandle.play();
```

设置每一帧动画结束的回调函数，每一帧动画结束之后会调用这些函数，参数是当前帧的数值。

```Javascript
// 可以传递一个函数，也可以传递一个包含多个函数的数组
animateHandle.eachFrame(function(currentParam) {
	console.log(currentParam);
});

// 传递数组
animateHandle.eachFrame([
	function a(obj) {console.log(obj);},
	function b(obj) {console.log("Another function will be called after each step of animation.");}
]);

```

### 我不想使用DOM来运动怎么办？

假设你不想在页面中使用DOM来进行运动，而只是想模拟一个动画的效果，并获取每一帧动画的值，那也是可以的，在调用animate函数的时候，设置第一个参数不是DOM节点即可，可以传递字符串、数组、数值……，甚至是null、undefined，但是由于不再是DOM节点，程序无法预料初始值和最终的目标值，这些都需要我们手动设置，如下：

```Javascript
var handle = animate(null,
		{
			paramOne : {
				start : "400px",
				end : "9px",
			},
			paramTwo : {
				start : 90,
				end :-9
			},
			paramThree : {
				// 颜色值必须是以#开头的十六进制字符串，不足6位则补零
				start : "#ff00",
				end : "#45ff44"
			}

		}
	)
	.duration(2000)
	.ease('cubic')
	.start();
```

没有DOM元素的时候我们需要手动每一个需要缓动的属性的start和end。怎么获取每一帧的时候的插值？使用eachFrame函数，其余的都与有DOM的时候一致。

### 插值器——interpolate.js

插值是什么意思？就是一种预测的方式，如同在二维空间中给我们两个非重复点的坐标，我们得到一条直线，这样就可以这条直线上的其他的点的值了，这就是简单的插值。同样对于DOM动画来说，我们需要知道动画的初始值和结束值，这样我们就可以对这两个值之间的值进行预测。animateJS的插值依赖于interpolate.js，所以你也可以单独使用interpolate.js来作为你的插值器，下面我们对此进行介绍。

interpolate.js提供全局函数interpolate，能提供十六进制颜色值、数值的插值，并且对外提供三个API。首先我们来看一下数值的插值。

```Javascript
// interpolate函数可以传递一个参数，作为缓动的方式，
// 缓动的种类与上述的easeMode一致。
var handle = interpolate("bounceOut")
			// 设置起始值
			.domain(400)
			// 设置最终值
			.range(-100);

// 现在我们可以使用getValue来获取400到-100之间的任意值，
// 传递一个0到1之间的数值进去即可取到
var step = handle.getValue(0.5); // 获取中间的值
console.log(step);
```

有人会问，我怎么知道我要取多少，这就问对了，这就是动画的基础，动画的时候我们使从0到1逐渐取值，如果你说我就要取200这个数值，这样的话我们为什么需要插值呢？直接设置200不就可以了是不？如果你取0则会得到起始点，取1会得到最终值。

interpolate.js 同样可以对十六进制的颜色进行插值，你可以在调用domain和range函数的时候传递进去一个十六进制的颜色值。