'use strict';
(function (w) {
    'use strict';
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    // 根据前缀判断是否存在requestAnimationFrame方法
    for (var x = 0; x < vendors.length && !w.requestAnimationFrame; ++x) {
        w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];
        // Webkit中此取消方法的名字变了
        w.cancelAnimationFrame = w[vendors[x] + 'CancelAnimationFrame'] || w[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    // 如果没有requestAnimationFrame方法设置setTimeout方法代替
    if (!w.requestAnimationFrame) {
        w.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = w.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    // 如果没有取消requestAnimationFrame方法设置clearTimeout方法代替
    if (!w.cancelAnimationFrame) {
        w.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
})(window);

$(document).on('touchmove', function (e) {
    e.preventDefault();
});

var config = {
    width: 320,
    height: 568,
    fps: 60,
    urlPrefix: document.getElementById('path').value,
    level: 0
}

var windowWidth = $(window).width(),
    windowHeight = $(window).height();

var scale = {
    width: windowWidth / config.width,
    height: windowHeight / config.height
}

var canvas = document.getElementById('canvas');
canvas.width = windowWidth;
canvas.height = windowHeight;
var context = canvas.getContext('2d');

var gameImage = {},
    gameAudio = {};
var timer = null,
    djs = $('.djs'),
    cover = $('.zhe').show(),
    $text = $('.gang_zi').hide(),
    $loading = $('.jindu').show();
$loading.find('.huil').height('1.35rem');

var loadingList = [
    {key: 'break', type: 'audio', ogg: 'break.mp3'},
    {key: 'one', type: 'audio', ogg: 'one.wav'},
    {key: 'two', type: 'audio', ogg: 'two.wav'},
    {key: 'three', type: 'audio', ogg: 'three.wav'},
    {key: 'qiu1', type: 'image', png: 'qiu1.png'},
    {key: 'qiu2', type: 'image', png: 'qiu2.png'},
    {key: 'qiu3', type: 'image', png: 'qiu3.png'},
    {key: 'qiu4', type: 'image', png: 'qiu4.png'},
    {key: 'muban1', type: 'image', png: 'muban1.png'},
    {key: 'muban2', type: 'image', png: 'muban2.png'},
    {key: 'muban3', type: 'image', png: 'muban3.png'},
    {key: 'lanl', type: 'image', png: 'lanl.png'},
    {key: 'lanr', type: 'image', png: 'lanr.png'},
    {key: 'ganl', type: 'image', png: 'ganl.png'},
    {key: 'ganr', type: 'image', png: 'ganr.png'},
    {key: 'ding', type: 'image', png: 'ding.png'},
    {key: 'gangqiu1', type: 'image', png: 'gangqiu1.jpg'}
];
// 加载图片
var loadingLength = loadingList.length,
    loadingIndex = 0;

timer = window.setInterval(function(){
    var p = parseInt(loadingIndex / loadingLength * 6);
    $loading.find('.jin:lt(' + p + ')').show();
    $loading.find('.jin:gt(' + p + ')').hide();
}, 100);

function loadAudio () {
    var key = loadingList[loadingIndex].key,
        audio = new Audio();
    audio.src = config.urlPrefix + 'audio/' + loadingList[loadingIndex].ogg;
    audio.onloadedmetadata = function() {
        gameAudio[key] = audio;
        ++loadingIndex;
        finish();
    };
}

function loadImage() {
    var key = loadingList[loadingIndex].key,
        img = document.createElement('img');
    img.src = config.urlPrefix + 'images/' + loadingList[loadingIndex].png;
    img.onload = function () {
        gameImage[key] = img;
        ++loadingIndex;
        finish();
    };
}

function loading() {
    var type = loadingList[loadingIndex].type;
    if (type === 'audio'){
        loadAudio();
    }
    if(type  === 'image') {
        loadImage();
    }
}
loading();
function finish() {

    if(loadingIndex !== loadingLength) {
        loading();
    } else {
        // alert('finish');
        window.clearInterval(timer);
        $text.show();
        $loading.hide();
        init();
    }
}

var bg = null, rail = null, ball = null, bricks = [], game = null;
function init() {
    bg = new Background();
    rail = new Rail();
    ball = new Ball();
    for (var i = 0; i < 8; i++) {
        var brick = new Brick(i, 'new');
        bricks.push(brick);
    }
    game = new Game();

    function countDown() {
        timer = window.setInterval(function () {
            var txt = djs.text();
            djs.text(txt - 1);
            if (txt === '1') {
                window.clearInterval(timer);
                var boardRandom = parseInt(Math.random() * 10);
                var youtuSrc = '//static.test.soufunimg.com/common_m/m_activity/PaPaPa/images/type' + boardRandom + '.jpg';
                window.location.href = '//' + window.location.hostname + '/activityshow/paPaPa/result.jsp?u=' + youtuSrc + '&boardLevel=' + config.level +'&boardRandom=' + boardRandom;
            }
        }, 1000);
    }

    var cover = document.getElementById('js_cover');
    cover.style.display = 'block';
    var N = 3,
        NA = ['one', 'two', 'three'];
    timer = window.setInterval(function () {
        $text.hide();
        if (N < 3) {
            document.getElementById('js_img' + (N + 1)).style.display = 'none';
        }
        if (N < 1) {
            cover.style.display = 'none';
            window.clearInterval(timer);
            countDown();
            game.start();
            return false;
        }
        gameAudio[NA[N - 1]].play();
        document.getElementById('js_img' + N).style.display = 'block';
        N--;
    }, 1000);
}

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
        imgKey: 'gangqiu1'
    }, {
        x: 0,
        y: 0,
        width: 320,
        height: 99,
        imgKey: 'ding'
    }, {
        x: 0,
        y: 327,
        width: 28,
        height: 242,
        imgKey: 'lanl'
    }, {
        x: (320 - 28),
        y: 327,
        width: 28,
        height: 242,
        imgKey: 'lanr'
    }]
}

Background.prototype.draw = function () {
    var ctx = this.offContext,
        cv = this.offCanvas,
        objects = this.objects;
    var length = objects.length;
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (var i = 0; i < length; i++) {
        var obj = objects[i];
        var image = gameImage[obj.imgKey];
        ctx.drawImage(image, obj.x * scale.width, obj.y*scale.height, obj.width*scale.width, obj.height*scale.height);
    }
}
