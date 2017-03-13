function Background(options) {
    this.offCanvas = document.createElement('canvas');
    this.init();
}

Background.prototype.init = function() {
    this.offContext = this.offCanvas.getContext('2d');
    this.offCanvas.width = canvas.width;
    this.offCanvas.height = canvas.height;
    this.objects = [{
        x: 0,
        y: 0,
        width: 320,
        height: 568,
        src: 'gangqiu1.jpg'
    }, {
        x: 0,
        y: 0,
        width: 320,
        height: 99,
        src: 'ding.png'
    }, {
        x: 0,
        y: 327,
        width: 28,
        height: 242,
        src: 'lanl.png'
    }, {
        x: (320 - 28),
        y: 327,
        width: 28,
        height: 242,
        src: 'lanr.png'
    }]
}

Background.prototype.draw = function () {
    var ctx = this.offContext,
        cv = this.offCanvas,
        objects = this.objects;
    var image = new Image(),
        length = objects.length;
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < length; i++) {
        var obj = objects[i];
        image.src = config.url + obj.src;
        ctx.drawImage(image, obj.x * scale.width, obj.y*scale.height, obj.width*scale.width, obj.height*scale.height);
    }
}
