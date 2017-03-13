'use strict';
/**
 * 小球对象以 iphone 4s 320 * 480 分辨率为基准
 * @param {[type]} options [description]
 */
function Rail(options) {
    this.rail = {
        left: {
            png: 'ganl.png',
            x: 26 - 16.5,
        },
        right: {
            png: 'ganr.png',
            x: 320 - 26,
        },
        y: 329,
        width: 16.5,
        height: 240
    };
    this.brick = {
        new: {
            png: 'muban3.png',
            height: 20,
        },
        crack: {
            png: 'muban1.png',
            height: 20,
        },
        break: {
            png: 'muban2.png',
            height: 60
        },
        x: 10,
        y: 16,
        width: 300,
        gap: 60
    };
    // this.spirit = document.createElement('canvas');
    this.offCanvas = document.createElement('canvas');
    this.spirit = document.getElementById('spirit');
    this.vy = 1;
    this.isMoving = false;
    this.hasMoved = false;
    // this.init();
}

Rail.prototype.drawImage = function (ctx, img, x, y, width, height) {
    ctx.drawImage(img, x * scale.width, y * scale.height, width * scale.width, height * scale.height);
}

Rail.prototype.drawSpirit = function () {
    var spirit = this.spirit;
    spirit.width = canvas.width;
    spirit.height = canvas.height;
    var ctx = spirit.getContext('2d');

    var image = new Image();
    var rail = this.rail;
    image.src = config.url + rail.left.png;
    this.drawImage(ctx, image, rail.left.x, 0, rail.width, rail.height);
    image.src = config.url + rail.right.png;
    this.drawImage(ctx, image, rail.right.x, 0, rail.width, rail.height);

    var brick = this.brick;
    var png = brick.new.png;
    image.src = config.url + brick.crack.png;
    this.drawImage(ctx, image, brick.x, brick.y + 60, brick.width, brick.crack.height);
    image.src = config.url + brick.break.png;
    this.drawImage(ctx, image, brick.x, brick.y + 120, brick.width, brick.break.height);
    image.src = config.url + brick.new.png;
    this.drawImage(ctx, image, brick.x, brick.y + 180, brick.width, brick.new.height);

};

Rail.prototype.draw = function(ctx) {
    var image = this.spirit,
        brick = this.brick;
    // ctx.drawImage(image, 0, 0, canvas.width, brick.y, 0, 329 * scale.height, canvas.width, brick.y);
    ctx.drawImage(image, 0, 180, canvas.width, 60, 0, (329 + brick.y) * scale.height, canvas.width, 60);
    ctx.drawImage(image, 0, brick.y + 180, canvas.width, 60, 0, ((329 + brick.y) + 60) * scale.height, canvas.width, 60);
    ctx.drawImage(image, 0, brick.y + 180, canvas.width, 60, 0, ((329 + brick.y) + 120) * scale.height, canvas.width, 60);
    ctx.drawImage(image, 0, brick.y + 180, canvas.width, 60, 0, ((329 + brick.y) + 180) * scale.height, canvas.width, 60);
    // for (var i=0; i< 7; i++) {
    // }
}

Rail.prototype.init = function() {

    this.creatSpirit();
}


Rail.prototype.move = function () {
    var vy = this.vy;

    var rail = this.nick;
    rail.y = rail.y - vy;

    var length = bricks.length;
    for (var i = 0; i < length; i++) {
        var brick = bricks[i];
        brick.y = brick.y - vy;
        if (brick.name === 'break') {
            if (brick.y < brick.originaly - 50) {
                brick.visible = false;
            }
        } else {
            if (brick.y < brick.originaly) {
                // brick.y = brick.originaly + (i + 1 - breakCount) * brick.gap;
                this.isMoving = false;
                this.hasMoved = true;
                this.refresh();
                break;
            }
        }
    }

    // if (brick.nick !== 'break' && brick.y < bricks.originaly) {
    //     this.refresh(brick);
    //     this.moving = false;
    //     break;
    // } else {
    //     brick.y = brick.y - vy;
    // }
}

Rail.prototype.refresh = function (brick) {
    var rail = this.nick;
    rail.y = this.originaly;

    // var bricksCopy = bricks.concat();
    var newBricks = [];
    var length = bricks.length;
    var newLength = 0;
    for (var i = 0; i< length; i++) {
        var brick = bricks[i];
        newLength = newBricks.length;
        if (brick.name !== 'break') {
            brick.init(newLength);
            newBricks.push(brick);
        }
    }

    for(var i = newLength + 1; i<8; i++) {
        newBricks.push(new Brick(newLength, 'new'))
    }
    bricks = newBricks;

    ball.breakIndex = 0;
}
