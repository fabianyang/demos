'use strict';
/**
 * 小球对象以 iphone 4s 320 * 480 分辨率为基准
 * @param {[type]} options [description]
 */
function Ball(options) {
    this.name2image = {
        top: 'qiu1.png',
        down: 'qiu2.png',
        up: 'qiu3.png',
        bottom: 'qiu4.png'
    }
    this.x = options.x * scale.width;
    this.y = options.y * scale.height;
    this.width = options.width * scale.width;
    this.height = options.height * scale.height;
    this.state = options.state;
    this.init();
}

Ball.prototype.init = function () {
    this.src = this.name2image[this.state];
    this.top = 99 / 2 * scale.height;
    this.bottom = (344 - 27) * scale.height;
}

Ball.prototype.draw = function (ctx) {
    var image = new Image(),
        src = this.name2image[this.state];
    image.src = config.url + src;
    ctx.drawImage(image, this.x, this.y, this.width, this.height);
}

Ball.prototype.move = function () {
    // 速度变化
    // this.vx += this.vx > 0 ? -config.miu * config.t : config.miu * config.t;
    // 重力
    this.vy = this.vy + this.ay * 16 / 1000;
    // 位置变化
    // this.x += cfg.t * this.vx * this.px2m;
    this.y += 16 / 1000 * this.vy;

    // 是否到达页面底部
    if (this.y > this.bottom) {
        // 触发木板碰撞
        brick.crack(this.vy);

        if (brick.hasBreak) {
            this.y = this.bottom;
            this.state = 'bottom';

            // 能量损失更改速度和加速度和方向
            this.vy = -this.vy;
            this.ay = -this.ay;
        }

    } else if (this.y < this.top) {
        this.state = 'top';
        this.y = this.top;
        this.vy = -this.vy;
        this.ay = -this.ay;
    } else if (this.ay > 0) {
        this.state = 'down';
    } else if (this.ay < 0) {
        this.state = 'up'
    }



    // 是否到达页面左面或右面
    // if (this.x > cvw - this.radius || this.x < this.radius) {
    //     this.x = this.x < this.radius ? this.radius : (cvw - this.radius);
    //     this.derectionX = !this.derectionX;
    //     this.vx = -this.vx * config.k;
    // }
}

Ball.prototype.updateBottom = function (count) {
    this.bottom = (344 + brick.gap * count - 27) * scale.height;
}
