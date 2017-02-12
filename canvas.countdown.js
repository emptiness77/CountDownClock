/*  步骤：
程序基本构架
绘制数字
倒计时效果
canvas动画和物理实验
彩色小球的绘制
性能优化——限制对内存的占用
屏幕自适应  */


var WINDOW_WIDTH = 1024;
var WINDOW_HEIGHT = 560;

var RADIUS = 8;
//每一个数字距离画布的上边距
var MARGIN_TOP = 60;
//第一个数字距离画布的左边距
var MARGIN_LEFT = 30;

//设定一个截止时间
//月份是从0到11
const endTime = new Date(2017,1,14,0,0,0);
//倒计时总共多少秒
var curShowTimeSeconds = 0;

//弹出的彩色小球部分
var balls = [];
const colors = ["#33B5E5","#0099CC","#AA66CC","#9933CC","#99CC00","#669900","#FFBB33","#FF8800","#FF4444","#CC0000"];

window.onload = function(){
	//屏幕自适应（同时需要body的style里的height为100% canvas的style里的height也是100%）
	WINDOW_WIDTH = document.body.clientWidth;
	WINDOW_HEIGHT = document.body.clientHeight;
	//经测试 document.body.clientHeight未能获取到正常的高度
	//改动如下
	WINDOW_WIDTH = document.documentElement.clientWidth-20;
	WINDOW_HEIGHT = document.documentElement.clientHeight-20;

	MARGIN_LEFT = Math.round(WINDOW_WIDTH/10);
	MARGIN_TOP = Math.round(WINDOW_HEIGHT/8);
	RADIUS = Math.round(WINDOW_WIDTH*4/5/111)-1;

	var canvas = document.getElementById("canvas");
	canvas.width = WINDOW_WIDTH;
	canvas.height = WINDOW_HEIGHT;
	var context = canvas.getContext("2d");

	curShowTimeSeconds = getCurrentShowTimeSeconds();

	//render(context);
	setInterval(
		function(){
			render(context);
			update();
		},
		50
		//经测试，1000也可以
	);
}

//确定时间差
function getCurrentShowTimeSeconds(){
	//创建新的时间对象 括号内不赋值就是获取当前时间
	var curTime = new Date();
	//getTime()函数返回时间对象到1970年1月1日0时0分0秒之间的毫秒数
	var ret = endTime.getTime() - curTime.getTime();
	//Math.round()就是四舍五入 此步骤是将毫秒换算成秒
	ret = Math.round(ret/1000);

	return ret>=0?ret:0;
}

//时间变化函数
function update(){
	//下一次要显示的时间
	var nextShowTimeSeconds = getCurrentShowTimeSeconds();

	var nextHours = parseInt(nextShowTimeSeconds/3600);
	var nextMinutes = parseInt((nextShowTimeSeconds-nextHours*3600)/60);
	var nextSeconds = parseInt(nextShowTimeSeconds%60);

	var curHours = parseInt(curShowTimeSeconds/3600);
	var curMinutes = parseInt((curShowTimeSeconds-curHours*3600)/60);
	var curSeconds = parseInt(curShowTimeSeconds%60);

	//一旦时间发生改变
	if( nextSeconds != curSeconds){
		//改变的时间到底改变了哪几个数字 对六个数字进行判断
		//小时
		if(parseInt(curHours/10) != parseInt(nextHours/10)){
			//addBalls的参数为改变的数字的位置以及数字的值
			addBalls( MARGIN_LEFT+0, MARGIN_TOP, parseInt(curHours/10));
		}
		if(parseInt(curHours%10) != parseInt(nextHours%10)){
			addBalls( MARGIN_LEFT+16*(RADIUS+1), MARGIN_TOP, parseInt(curHours%10));
		}
		//分钟
		if(parseInt(curMinutes/10) != parseInt(nextMinutes/10)){
			//addBalls的参数为改变的数字的位置以及数字的值
			addBalls( MARGIN_LEFT+40*(RADIUS+1), MARGIN_TOP, parseInt(curMinutes/10));
		}
		if(parseInt(curMinutes%10) != parseInt(nextMinutes%10)){
			addBalls( MARGIN_LEFT+56*(RADIUS+1), MARGIN_TOP, parseInt(curMinutes%10));
		}
		//秒钟
		if(parseInt(curSeconds/10) != parseInt(nextSeconds/10)){
			//addBalls的参数为改变的数字的位置以及数字的值
			addBalls( MARGIN_LEFT+80*(RADIUS+1), MARGIN_TOP, parseInt(curSeconds/10));
		}
		if(parseInt(curSeconds%10) != parseInt(nextSeconds%10)){
			addBalls( MARGIN_LEFT+96*(RADIUS+1), MARGIN_TOP, parseInt(curSeconds%10));
		}

		//显示的时间改变
		curShowTimeSeconds = nextShowTimeSeconds;
	}

	//对多个小球进行更新操作
	updateBalls();
	//bug：不停更新小球 但是不消除 就会堆积系统垃圾占用内存
	
	//检测内存占用
	console.log(balls.length);
}

//画弹出的彩色小球
function addBalls(x,y,num){
	//对（x，y）的位置对应的点阵加上彩色的小球
	for(var i=0; i<digit[num].length; i++){
		for(var j=0; j<digit[num][i].length; j++){
			if( digit[num][i][j] == 1){
				//声明一个小球
				var aBall = {
					x:x+j*2*(RADIUS+1)+(RADIUS+1),
					y:y+i*2*(RADIUS+1)+(RADIUS+1),
					g:1.5+Math.random(),//加速度为1.5-2.5之间的随机值 这样会让不同的小球有不同的运动轨迹
					vx:Math.pow(-1, Math.ceil(Math.random()*1000))*4,//-1的“0-1000之间取整”次方 结果为1或者-1
					vy:-5,
					color:colors[Math.floor(Math.random()*colors.length)],//0-1随机×数组长度10 再下取整 实现0-9随机
				}

				//把新建的小球放进balls数组里
				balls.push( aBall);
			}
		}
	}
}

//时间改变 更新小球状态
function updateBalls(){
	//遍历balls数组
	for( var i=0; i<balls.length; i++){
		balls[i].x += balls[i].vx;
		balls[i].y += balls[i].vy;
		balls[i].vy += balls[i].g;

		//地板碰撞检测
		if(balls[i].y >= WINDOW_HEIGHT-RADIUS){
			balls[i].y = WINDOW_HEIGHT-RADIUS;
			balls[i].vy *= -0.75;
		}
	}

	//性能优化
	var cnt = 0;
	for( var i=0; i<balls.length; i++){
		//先做一个判断：小球是否出界
		if(balls[i].x+RADIUS>0 && balls[i].x-RADIUS<WINDOW_WIDTH){  //即向左没出界 而且向右也没出界
			balls[cnt++] = balls[i];  //把合格的小球重新挤进数组里去 且靠前放置
		}
	}
	//在合格数cnt之外的小球都被删除
	/*  while(balls.length > cnt){
		balls.pop(); //pop()函数是删除数组末尾的元素
	}  */
	while(balls.length > Math.min(300,cnt)){  //假设300为内存占用最优的上限
		balls.pop(); //pop()函数是删除数组末尾的元素
	}
}

//画数字
function render(cxt){
	//刷新时将原图像清除 以免动画重叠
	//参数1,2是起始点的横纵坐标 参数3,4是清除的矩形范围
	cxt.clearRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT);

	var hours = parseInt(curShowTimeSeconds/3600);
	var minutes = parseInt((curShowTimeSeconds-hours*3600)/60);
	var seconds = parseInt(curShowTimeSeconds%60);

	//一个数字一个数字地进行绘制
	renderDigit( MARGIN_LEFT, MARGIN_TOP, parseInt(hours/10), cxt);
	renderDigit( MARGIN_LEFT+16*(RADIUS+1), MARGIN_TOP, parseInt(hours%10), cxt);
	renderDigit( MARGIN_LEFT+31*(RADIUS+1), MARGIN_TOP, 10, cxt);
	renderDigit( MARGIN_LEFT+40*(RADIUS+1), MARGIN_TOP, parseInt(minutes/10), cxt);
	renderDigit( MARGIN_LEFT+56*(RADIUS+1), MARGIN_TOP, parseInt(minutes%10), cxt);
	renderDigit( MARGIN_LEFT+71*(RADIUS+1), MARGIN_TOP, 10, cxt);
	renderDigit( MARGIN_LEFT+80*(RADIUS+1), MARGIN_TOP, parseInt(seconds/10), cxt);
	renderDigit( MARGIN_LEFT+96*(RADIUS+1), MARGIN_TOP, parseInt(seconds%10), cxt);

	//彩色小球的绘制
	for( var i=0; i<balls.length; i++){
		cxt.fillStyle = balls[i].color;

		cxt.beginPath();
		cxt.arc(balls[i].x, balls[i].y, RADIUS, 0, 2*Math.PI, true);
		cxt.closePath();

		cxt.fill();
	}
}

//画小圆
function renderDigit(x,y,num,cxt){
	cxt.fillStyle = "rgb(0,102,153)";
	for(var i=0; i<digit[num].length; i++){
		for(var j=0; j<digit[num][i].length; j++){
			if( digit[num][i][j] == 1){
				cxt.beginPath();
				//第(i,j)个圆的圆心位置：设半径为R 单个数字的画布起始点为(x,y)
				//CenterX: x+j*2*(R+1)+(R+1)
				//CenterY: y+i*2*(R+1)+(R+1)
				cxt.arc(x+j*2*(RADIUS+1)+(RADIUS+1),y+i*2*(RADIUS+1)+(RADIUS+1),RADIUS,0,2*Math.PI);
				cxt.closePath();

				cxt.fill();
			}
		}
	}
}