'use strict';
/**
 * 木板对象
 * @param {[type]} options [description]
 */
function Brick(number, name) {
    this.nick = {
        new: {
            png: 'muban3.png',
            width: 300,
            height: 20,
        },
        crack: {
            png: 'muban1.png',
            width: 300,
            height: 20,
        },
        break: {
            png: 'muban2.png',
            width: 300,
            height: 60
        }
    };
    this.originalx = 10;
    this.originaly = 344;
    this.gap = 60;
    this.originalPower = 150;
    this.levelPower = 50;
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
    var name = this.name;
    this.width = this.nick[name].width;
    this.height = this.nick[name].height;
    this.png = this.nick[name].png;
}

Brick.prototype.crack = function (power) {
    // 击穿 2 块木板
    if (power > this.power) {
        this.setNick('break');
        ball.breakIndex++;
        config.level++;
    } else {
        this.setNick('crack');
        rail.hasMoved = false;
    }
}
