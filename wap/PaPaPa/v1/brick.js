'use strict';
/**
 * 小球对象
 * @param {[type]} context [description]
 * @param {[type]} options [description]
 */
function Brick(context, options) {
    this.context = context;
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.init();
}

Brick.prototype.randomRGB = function(datum) {
    return ~~(Math.random() * 255);
}

Brick.prototype.init = function() {
    var R = this.randomRGB(),
        G = this.randomRGB(),
        B = this.randomRGB();
    this.color = this.color || 'rgb(' + R + ',' + G + ',' + B + ')';
    this.px2m = this.height / 5;
    this.gap = 50;
    this.harder = 1.5;
}

Brick.prototype.draw = function() {
    var ctx = this.context,
        y = this.y,
        height = this.height;
    ctx.save();
    ctx.fillStyle = this.color;
    while(y < ctx.canvas.height) {
        ctx.fillRect(this.x, y, this.width, height);
        y = y + height + this.gap;
        height = height * this.harder;
    }
    ctx.restore();
};

Brick.prototype.getMiuF = function(cfg) {
    return cfg.miu * this.px2m;
}

Brick.prototype.levelUp = function() {
    this.y = this.y + this.height + this.gap;
    this.height = this.height * this.harder;
}
