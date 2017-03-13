'use strict';
/**
 * 木板对象
 * @param {[type]} options [description]
 */
function Brick(number, name) {
    this.nick = {
        new: {
            img: 'muban3',
            width: 300,
            height: 20,
        },
        crack: {
            img: 'muban1',
            width: 300,
            height: 20,
        },
        break: {
            img: 'muban2',
            width: 300,
            height: 60
        }
    };
    this.originalx = 10;
    this.originaly = 344;
    this.gap = 60;
    this.vy = 1;
    this.originalPower = 100;
    this.levelPower = 100;
    this.visible = true;
    this.init(number);
    this.setNick(name);
}

Brick.prototype.init = function (number) {
    this.x = this.originalx;
    this.y = this.originaly + number * this.gap;
    this.power = this.originalPower + (number + config.level) * this.levelPower;
}

Brick.prototype.setNick = function (name) {
    this.name = name;
    var name = this.name,
        nick = this.nick;
    this.width = nick[name].width;
    this.height = nick[name].height;
    this.img = nick[name].img;
}

Brick.prototype.crack = function (power) {
    // 击穿 2 块木板
    if (power > this.power) {
        gameAudio.break.play();
        this.setNick('break');
        ball.breakIndex++;
        ball.power -= this.power;
        config.level++;
    } else {
        this.setNick('crack');
    }
}

Brick.prototype.draw = function(ctx) {
    if (this.visible) {
        ctx.drawImage(gameImage[this.img], this.x * scale.width, this.y * scale.height, this.width * scale.width, this.height * scale.height);
    }
}

Brick.prototype.move = function() {
    this.y = this.y - this.vy;
}
