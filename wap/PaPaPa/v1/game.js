'use strict';
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
        miu: 0.9 // 摩擦力：暂时可以看成风的阻力
    }
    this.init();
}

Game.prototype.init = function() {
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
}

Game.prototype.drawBackground = function() {
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

Game.prototype.collision = function() {
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
        if(ball.vy > miuF) {
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

Game.prototype.update = function() {
    var that = this,
        cfg = this.config,
        ball = this.ball;
    this.ball.move(cfg);
    this.collision();
}

Game.prototype.draw = function() {
    var that = this,
        brick = this.brick,
        ball = this.ball;

    that.drawBackground();
    ball.draw();
    brick.draw();
}

Game.prototype.run = function() {
    this.update();
    this.draw();
    requestAnimationFrame(this.run.bind(this));
}

var timeStamp = new Date();
var game = new Game(canvas.getContext('2d'));
game.run();
