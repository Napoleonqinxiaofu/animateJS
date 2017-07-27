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

		// easeMode 可选，默认为linear，缓动的方式，
		//linear、quad、cubic、bounceOut……，
		// 请查看interpolate.js里面的effects对象
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

设置缓动方式

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
setTimeout(function() {
	animateHandle.stop();
}, 2000);

```