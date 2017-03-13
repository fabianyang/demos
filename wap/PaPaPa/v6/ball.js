'use strict';
/**
 * 小球对象以 iphone 4s 320 * 480 分辨率为基准
 * @param {[type]} options [description]
 */
function Ball() {
    this.name2image = {
        top: {
            img: 'qiu1',
            width: 35,
            height: 36.5
        },
        down: {
            img: 'qiu2',
            width: 45.5,
            height: 96
        },
        up: {
            img: 'qiu3',
            width: 40.5,
            height: 75
        },
        bottom: {
            img: 'qiu4',
            width: 35,
            height: 37
        }
    }
    // this.x = (320 - 35) / 2;
    this.miu = 0.5;
    this.top = 99 / 2;
    this.state = 'top';
    this.init();
}

Ball.prototype.init = function () {
    this.y = this.top;
    this.power = 0;
    this.vy = 0;
    this.ay = 0;
    this.breakIndex = 0;
}

Ball.prototype.draw = function (ctx) {
    var n2i = this.name2image,
        state = this.state,
        y = this.y;
    var image = gameImage[n2i[state].img],
        width = n2i[state].width,
        height = n2i[state].height,
        x = (config.width - n2i[state].width) / 2;
    ctx.drawImage(image, x * scale.width, y * scale.height, width * scale.width, height * scale.height);
}

Ball.prototype.move = function () {
    // this.vy = this.vy + this.ay * 16 / 1000;
    this.vy = this.ay;
    // 位置变化
    this.y += this.vy;

    var brick = bricks[this.breakIndex];
    var height = this.name2image[this.state].height;
    // 是否到达页面底部
    if (this.state === 'down' && this.y + height > brick.y + 27) {
        // 触发木板碰撞
        if(ball.breakIndex < 4) {
            brick.crack(this.power);
        }

        if (ball.breakIndex === 4 || brick.name !== 'break') {
            this.y = brick.y - 27;
            this.state = 'bottom';

            // 能量损失更改速度和加速度和方向
            this.vy = -this.vy;
            this.ay = -this.ay;
        }
    } else if (this.state === 'up' && this.y < this.top) {
        this.state = 'top';
        this.y = this.top;
        this.vy = -this.vy;
        this.ay = -this.ay;

        game.refresh();
    } else if (this.vy > 0) {
        this.state = 'down';
    } else if (this.vy < 0) {
        this.state = 'up'
    }




    // 是否到达页面左面或右面
    // if (this.x > cvw - this.radius || this.x < this.radius) {
    //     this.x = this.x < this.radius ? this.radius : (cvw - this.radius);
    //     this.derectionX = !this.derectionX;
    //     this.vx = -this.vx * config.k;
    // }
}

