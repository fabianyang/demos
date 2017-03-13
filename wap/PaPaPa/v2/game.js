'use strict';
(function (w) {
    'use strict';
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    // 根据前缀判断是否存在requestAnimationFrame方法
    for (var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
        w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];
        // Webkit中此取消方法的名字变了
        w.cancelAnimationFrame = w[vendors[x] + 'CancelAnimationFrame'] || w[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    // 如果没有requestAnimationFrame方法设置setTimeout方法代替
    if (!w.requestAnimationFrame) {
        w.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = w.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    // 如果没有取消requestAnimationFrame方法设置clearTimeout方法代替
    if (!w.cancelAnimationFrame) {
        w.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
})(window);

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;;

var radius = Math.random() * 50 + canvas.width / 20;
var x = canvas.width / 2,
    y = radius;


function Game(context) {
    this.context = context;
    this.config = {
        t: 16 / 1000, // requestAnimationFrame 刷新频率大约为1秒16次
        g: 9.8, // 重力
        k: 0.5, // 弹力   越大越像皮球
        miu: 0.9, // 摩擦力：暂时可以看成风的阻力,
        fps: 60
    }
    this.init();
}

Game.prototype.init = function () {
    var ctx = this.context
    var cv = ctx.canvas;
    var cvw = cv.width,
        cvh = cv.height;
    this.config.px2m = cvh / 10 // px/m

    this.ball = new Ball(ctx, {
        x: x,
        y: y,
        radius: radius,
        color: 'blue',
        vx: 0,
        vy: 0
    });

    this.brick = new Brick(ctx, {
        x: 0,
        y: cvh / 2,
        color: 'red',
        width: cvw,
        height: 50
    });
    this.t0 = Date.now();
    this.bindEvent();
}

Game.prototype.bindEvent = function () {
    var that = this;
    if (window.DeviceMotionEvent) {
        // Mobile browser support motion sensing events
        window.addEventListener('devicemotion', deviceMotionHandler, false);
    } else {
        // Mobile browser does not support the motion sensing events
        alert('not support!');
    }

    var SHAKE_THRESHOLD = 300,
        t0 = that.t0,
        ball = that.ball,
        ay = 0, last_ay = 0;

    function deviceMotionHandler(e) {
        var aig = e.acceleration;
        var t1 = Date.now();

        var t = t1 - t0;
        if ((t1 - t0) > 500) { //多次移动事件中取两个点的事件间隔
        document.title = aig.y;
        //     ball.vy = ball.vy * aig.y * t ;
            ay = aig.y;
            // that.update();
            // that.draw();
            if(ay - last_ay > 0) {
                ball.ay = 9.8 + ay - last_ay;
            } else {
                ball.ay = -9.8 + ay - last_ay;
            }
            t0 = t1;
            last_ay = ay;
        }
    }

}

Game.prototype.drawBackground = function () {
    var ctx = this.context;
    var cv = ctx.canvas;
    var cvw = cv.width,
        cvh = cv.height;

    ctx.clearRect(0, 0, cvw, cvh);

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(0, 0, cvw, cvh);
    ctx.restore();
}

Game.prototype.collision = function () {
    var cfg = this.config;
    var ball = this.ball,
        brick = this.brick;

    // 撞击到模版
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * cfg.k;
    }

    var miuF = brick.getMiuF(cfg);

    // 撞击到木板
    if (ball.y > brick.y - ball.radius) {
        // 判断是否能够击穿木板
        if (ball.vy > miuF) {
            ball.vy = ball.vy - miuF;
            brick.levelUp();
        } else {
            ball.y = brick.y - ball.radius
            ball.vy = -ball.vy * cfg.k;
        }
    } else if (ball.y > this.context.canvas.height - ball.radius) {
        ball.y = this.context.canvas.height - ball.radius
        ball.vy = -ball.vy * cfg.k;
    }
}

Game.prototype.update = function () {
    var that = this,
        ball = this.ball;
    ball.move();
    console.log(~~(ball.vy));
    that.collision();
}

Game.prototype.draw = function () {
    var that = this,
        brick = this.brick,
        ball = this.ball;
    that.drawBackground();
    ball.draw();
    brick.draw();
}

Game.prototype.run = function () {
    var t1 = Date.now(),
        t0 = this.t0;
    var t = t1 - t0,
        s2fps = 1000 / this.config.fps;　　
    if (t > s2fps) {
        // 这里不能简单then=now，否则还会出现上边简单做法的细微时间差问题。例如fps=10，每帧100ms，而现在每16ms（60fps）执行一次draw。16*7=112>100，需要7次才实际绘制一次。这个情况下，实际10帧需要112*10=1120ms>1000ms才绘制完成。
        this.update();
        this.draw();
        t0 = t1 - (t % s2fps);
    }
    requestAnimationFrame(this.run.bind(this));
}

var timeStamp = new Date();
var game = new Game(canvas.getContext('2d'));
game.run();
