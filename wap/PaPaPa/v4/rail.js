'use strict';
/**
 * 小球对象以 iphone 4s 320 * 480 分辨率为基准
 * @param {[type]} options [description]
 */
function Rail(options) {
    this.nick = {
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
    this.originaly = 329;
    this.offCanvas = document.createElement('canvas');
    this.vy = 1;
    this.isMoving = false;
    this.hasMoved = false;
    this.init();
}

Rail.prototype.init = function () {
    var offCanvas = this.offCanvas;
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    this.offContext = offCanvas.getContext('2d');
}

Rail.prototype.draw = function () {
    var image = new Image(),
        ctx = this.offContext,
        cv = this.offCanvas;

    ctx.clearRect(0, 0, cv.width, cv.height);

    var rail = this.nick;
    for (var i = 0; i < 2; i++) {
        image.src = config.url + rail.left.png;
        this.drawImage(ctx, image, rail.left.x, rail.y + i * rail.height, rail.width, rail.height);
        image.src = config.url + rail.right.png;
        this.drawImage(ctx, image, rail.right.x, rail.y + i * rail.height, rail.width, rail.height);
    }

    for (var i = 0; i < bricks.length; i++) {
        var brick = bricks[i];
        if(brick.visible) {
            image.src = config.url + brick.png;
            this.drawImage(ctx, image, brick.x, brick.y, brick.width, brick.height);
        }
    }
}

Rail.prototype.drawImage = function (ctx, img, x, y, width, height) {
    ctx.drawImage(img, x * scale.width, y * scale.height, width * scale.width, height * scale.height);
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
