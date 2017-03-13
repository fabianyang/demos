'use strict';
/**
 * 小球对象
 * @param {[type]} context [description]
 * @param {[type]} options [description]
 */
function Ball(context, options) {
    this.context = context;
    this.radius = options.radius;
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.init();
}

Ball.prototype.randomVelocity = function(datum) {
    return (Math.random() * datum + datum) * Math.pow(-1, Math.floor(Math.random() * 100));
}

Ball.prototype.randomCoordinate = function(datum) {
    return Math.random() * (datum - 2 * this.radius) + this.radius;
}

Ball.prototype.randomRGB = function(datum) {
    return ~~(Math.random() * 255);
}

Ball.prototype.init = function() {
    var R = this.randomRGB(),
        G = this.randomRGB(),
        B = this.randomRGB();
    var cv = this.context.canvas;
    var cvw = cv.width,
        cvh = cv.height;
    this.radius = this.radius || Math.random() * 50 + canvas.width / 20;
    this.color = this.color || 'rgb(' + R + ',' + G + ',' + B + ')';
    this.x = this.x || this.randomCoordinate(cvw);
    this.y = this.y || this.randomCoordinate(cvh);
    this.vy = this.vy || this.randomVelocity(5);
    this.vx = this.vx || this.randomVelocity(5);
    this.ay = this.ay || 9.8;
    this.ax = this.ax || 0;
    this.px2m = cvh / 10;
    this.t0 = Date.now();
}

Ball.prototype.draw = function() {
    var ctx = this.context;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.abs(this.radius - 50), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fill();
    ctx.restore();
};

Ball.prototype.move = function(cfg) {
    var cv = this.context.canvas;
    var cvw = cv.width,
        cvh = cv.height;
    this.lastX = this.x;
    this.lastY = this.y;

    // 速度变化
    // this.vx += this.vx > 0 ? -config.miu * config.t : config.miu * config.t;
    // 重力
    this.vy = this.vy + this.ay * 16/1000;
    // 位置变化
    // this.x += cfg.t * this.vx * this.px2m;
    this.y += 16/1000 * this.vy * this.px2m;

    // 是否到达页面底部
    // if (this.y > cvh - this.radius || this.y < this.radius) {
    //     this.y = this.y < this.radius ? this.radius : (cvh - this.radius);
    //     this.vy = -this.vy * cfg.k
    // }
    // 是否到达页面左面或右面
    // if (this.x > cvw - this.radius || this.x < this.radius) {
    //     this.x = this.x < this.radius ? this.radius : (cvw - this.radius);
    //     this.derectionX = !this.derectionX;
    //     this.vx = -this.vx * config.k;
    // }
}
