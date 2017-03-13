'use strict';
/**
 * 木板对象
 * @param {[type]} options [description]
 */
function Brick(options) {
    this.brick = {
        new: {
            state: 'new',
            png: 'muban3.png',
            height: 20 * scale.height,
        },
        crack: {
            state: 'crack',
            png: 'muban1.png',
            height: 20 * scale.height,
        },
        break: {
            state: 'break',
            png: 'muban2.png',
            height: 60 * scale.height
        },
        width: 300 * scale.width,
        x: 10,
        y: 344
    },
    this.rail = {
        left: {
            png: 'ganl.png',
            x: (26 - 16.5) * scale.width ,
        },
        right: {
            png: 'ganr.png',
            x: (320 - 26) * scale.width,
        },
        y: 329 * scale.height,
        width: 16.5 * scale.width,
        height: 240 * scale.height
    },
    this.gap = 60
    this.offCanvas = document.createElement('canvas');
    this.count = 8;
    this.bricks = [];
    // this.x = options.x;
    // this.y = options.y;
    // this.width = options.width * scale.width;
    // this.height = options.height * scale.height;
    this.init();
}

Brick.prototype.init = function () {
    var offCanvas = this.offCanvas;
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    this.offContext = offCanvas.getContext('2d');

    var brick = this.brick;
    for (var i=0; i< this.count; i++) {
        this.bricks.push({
            state: 'new',
            png: brick.new.png,
            width: brick.width,
            height: brick.new.height,
            x: brick.x * scale.width,
            y: (brick.y + i * this.gap) * scale.height
        });
    }
}

Brick.prototype.format = function (newBrick, oldBrick) {
    return {
        state: newBrick.state || oldBrick.state,
        png: newBrick.png || oldBrick.png,
        width: newBrick.width || oldBrick.width,
        height: newBrick.height || oldBrick.height,
        x: newBrick.x || oldBrick.x,
        y: newBrick.x || oldBrick.y
    }
}

Brick.prototype.draw = function () {
    var image = new Image(),
        ctx = this.offContext,
        cv = this.offCanvas,
        bricks = this.bricks;

    ctx.clearRect(0, 0, cv.width, cv.height);

    var rail = this.rail;
    for (var i = 0; i < this.count/4; i++) {
        image.src = config.url + rail.left.png;
        ctx.drawImage(image, rail.left.x, rail.y + i * rail.height, rail.width, rail.height);
        image.src = config.url + rail.right.png;
        ctx.drawImage(image, rail.right.x, rail.y + i * rail.height, rail.width, rail.height);
    }

    for (var i = 0; i < bricks.length; i++) {
        var brick = bricks[i];
        image.src = config.url + brick.png;
        ctx.drawImage(image, brick.x, brick.y, brick.width, brick.height);
    }
}

Brick.prototype.crack = function (power) {
    var bricks = this.bricks;
    // 击穿 2 块木板
    if (power > 15) {
        bricks[0] = this.format(this.brick['break'], bricks[0]);
        bricks[1] = this.format(this.brick['crack'], bricks[1]);
        this.hasBreak = true;
        ball.bottom = (344 + brick.gap * 1 - 27) * scale.height;
        // this.updateBricks();
        return true;
    } else {
        return false;
    }
}

Brick.prototype.update = function() {
    this.bricks = [];
    var brick = this.brick;
    for (var i=0; i< this.count; i++) {
        this.bricks.push({
            state: 'new',
            png: brick.new.png,
            width: brick.width,
            height: brick.new.height,
            x: brick.x * scale.width,
            y: (brick.y + i * this.gap) * scale.height
        });
    }

};

Brick.prototype.move = function() {
    var vy = 5 * scale.height;
    this.rail.y = this.rail.y - vy;
    var bricks = this.bricks;
    for (var i=0; i< this.count; i++) {
        var brick = bricks[i];
        brick.y = brick.y - vy;

        // if(brick.state != 'break') {

        // }
    }
}



// Brick.prototype.randomRGB = function(datum) {
//     return ~~(Math.random() * 255);
// }


// Brick.prototype.draw = function() {
//     var ctx = this.context,
//         y = this.y,
//         height = this.height;
//     ctx.save();
//     ctx.fillStyle = this.color;
//     while(y < ctx.canvas.height) {
//         ctx.fillRect(this.x, y, this.width, height);
//         y = y + height + this.gap;
//         height = height * this.harder;
//     }
//     ctx.restore();
// };

// Brick.prototype.getMiuF = function(cfg) {
//     return cfg.miu * this.px2m;
// }

// Brick.prototype.levelUp = function() {
//     this.y = this.y + this.height + this.gap;
//     this.height = this.height * this.harder;
// }
