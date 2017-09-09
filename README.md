# animateJS 一个JS动画小脚本

animateJS是模仿很多的js库缓动效果的一个小脚本，可以实现delay（延迟）、pause（暂停）、继续播放（play），动画完成回调（complate）、stop（中断动画）、执行每一帧的回调eachFrame的功能。

## Usage

因为源码还没有打包到一个文件之中，所以我们暂时需要引入很多的文件，而且必须使用AMD的引入方式，如下：

```Javascript
<script>
requirejs.config({
	baseUrl: "../src/"
});

require(["Animate/animate"], function(Animate) {

	// doSomthing...

});
</script>
```

引入文件之后，我们可以对元素进行动画了。

```Javascript
<div style="position: absolute;left:0;top:0;border:1px solid gray;height:100px;display:inline-block;width:100px;opacity: 1;background: white;"></div>
<script src="interpolate.js"></script>
<script src="animate.js"></script>
<script>
requirejs.config({
	baseUrl: "../src/"
});

require(["Animate/animate"], function(animate) {

	// 获取页面中的div元素
	var oDiv = document.querySelector('div');
	// 接下来的代码都会放置在这里
	// coding……

});
	
</script>
```

#### 设置需要进行动画的元素与属性、动画时间周期、动画方式

```Javascript
// animate(dom, props, [duration, [easeMode]])
var animateHandle = animate(
		oDiv,
		// 需要进行动画css属性
		{
			// 可以传递字符串的方式，但是字符串中必须要有数值
			left : "400px",
			top : "200px",
			// 可以传递数值的方式
			opacity : 0.4,

			// 还可以设置颜色的动画，支持十六进制#xxxxxx，也支持rgb(x, x, x)
			// 还支持rgba(x, x, x, x)这样的方式
			"background-color" : "#ff0000"
		},

		// duration 可选，默认为1000ms，也可以一会儿再调用duration函数进行设置
		3000,
		// easeMode 可选，默认为linear，缓动的方式，在common/ease.js查看更多的缓动方式
		//linear、easeInOutBounce……
		"easeInOutBounce"
	);

	// 执行动画
	animateHandle.start();
```

#### 设置动画时间

```Javascript
// 设置动画时间可以在animate函数中，也可以使用duration函数，
// 不过必须在start函数调用之前，否则设置无效
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 执行动画
		.start();
```

#### 设置缓动方式

缓动的方式有：linear、easeInQuad、easeOutQuad、easeInOutQuad、easeInCubic、easeOutCubic、easeInOutCubic、easeInQuart、easeOutQuart、easeInOutQuart、easeInQuint、easeOutQuint、easeInOutQuint、easeInSine、easeOutSine、easeInOutSine、easeInExpo、easeOutExpo、easeInOutExpo、easeInCirc、easeOutCirc、easeInOutCirc、easeInElastic、easeOutElastic、easeInOutElastic、easeInBack、easeOutBack、easeInOutBack、easeInBounce、easeOutBounce、easeInOutBounce。

```Javascript
// 类似于duration，可以在animate函数中设置缓动方式（easeMode）
// 也可以使用ease方法进行设置，同样类似于duration函数，
// 必须在start函数调用之前
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 设置缓动方式为easeOutQuad
		.ease('easeOutQuad')
		// 执行动画
		.start();
```

#### 设置延迟时间

```Javascript
// 设置延迟时间是表示时隔多少时间之后再执行动画
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 设置缓动方式为easeOutQuad
		.ease('easeOutQuad')
		//设置延迟时间为1秒
		.delay(1000)
		// 执行动画
		.start();
```

#### 设置动画结束的回调

```Javascript
// 设置回调不需要再start调用之前
var animateHandle = animate(oDiv, props)
		// 设置动画时间为3秒
		.duration(3000)
		// 设置缓动方式为easeOutQuad
		.ease('easeOutQuad')
		//设置延迟时间为1秒
		.delay(1000)
		// 执行动画
		.start()
		.complete(function() {
			console.log("Animation is done");
		});
```

#### 中断动画，直接跳到最终的动画状态

```Javascript
// 中断动画之后会直接跳转到动画的最终状态
animateHandle.stop();
```

#### 暂停动画，不过这得等到delay的延迟时间过去了才能调用

```Javascript
animationHandle.pause();
```

#### 继续动画，只有在暂停动画之后调用才有效

```Javascript
animationHandle.play();
```

#### 设置每一帧动画结束的回调函数，每一帧动画结束之后会调用这些函数，参数是当前帧的数值。

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

假设你不想在页面中使用DOM来进行运动，而只是想模拟一个动画的效果，并获取每一帧动画的值，那也是可以的，在调用animate函数的时候，设置第一个参数不是DOM节点即可，可以传递字符串、数组、数值……，甚至是null、undefined，但是由于不再是DOM节点，程序无法预料初始值和最终的目标值，这些都需要我们手动设置。现在需要引入calcAnimate.js

```Javascript
<script>
require(['../src/Animate/calcAnimate'], function(Animate) {
	var handle = Animate({
			paramOne : {
				start: "400px",
				end: "9px",
			},
			paramTwo : {
				start: 90,
				end: -9
			},
			paramThree : {
				start: "#ff00",
				end: "#45ff44"
			}

	})
	.duration(2000)
	.eachFrame(function(obj) {
		console.log(obj);
	})
	.start();
})	
</script>
```

没有DOM元素的时候我们需要手动每一个需要缓动的属性的start和end。怎么获取每一帧的时候的插值？使用eachFrame函数，其余的都与有DOM的时候一致。

