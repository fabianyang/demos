(function () {
    'use strict';
    function getId(id) {
        return document.getElementById(id);
    }

    // 设置html根的font-size,rem布局 640页面设计初始宽度,对应字体20px
    var width = document.documentElement.clientWidth;
    var fontSize = Math.ceil(width / 640 * 20);
    getId('root').style.fontSize = fontSize + 'px';

    // 初始化方块的行数(方块的高度9rem)
    var gameNum = Math.ceil(window.innerHeight / (fontSize * 9));
    var topVal = window.innerHeight - gameNum * fontSize * 9;
    getId('gameZone').style.height = window.innerHeight + 'px';
    getId('gameZone').style.top = topVal + 'px';
    // 注册音乐id
    // createjs.Sound.registerSound({src: 'bgm/no.mp3', id: 'err'});
    // createjs.Sound.registerSound({src: 'bgm/yes.mp3', id: 'tap'});
    // 第一页
    var enter = getId('enter');
    var wrapper = getId('wrapper');
    var floatDiv = getId('float');
    var mainBody = getId('mainBody');
    enter.onclick = function () {
        wrapper.style.display = 'none';
        floatDiv.style.display = 'block';
        mainBody.style.display = 'block';
    };
    // 第二页
    var gameBegin = getId('gameBegin');
    gameBegin.onclick = function () {
        setTimeout(function () {
            floatDiv.style.display = 'none';
        },500);
    };
    // 第三页
    var gameTimer;
    // 游戏时间20s
    var gameTime = 2000;
    var timerDiv = getId('timer');
    var gameZone = getId('gameZone');
    // 其实分数0
    var score = 0;
    var end = false;
    var begin = false;
    // 禁止事件默认行为
    function preventDefault(e) {
        e.preventDefault();
    }

    document.addEventListener('touchmove', preventDefault);
    // 获取可点击行
    function clickable() {
        var lines = document.querySelectorAll('.line');
        return lines[gameNum - 1];
    }
    function clickable2() {
        var lines = document.querySelectorAll('.line');
        return lines[gameNum - 2];
    }

    // 初始化
    function init() {
        var gameZone = getId('gameZone');
        for (var i = 0; i < gameNum; i++) {
            var line = cline();
            var first = gameZone.firstChild;
            if (first === null) {
                var lastLine = cline('last');
                gameZone.appendChild(lastLine);
            } else {
                gameZone.insertBefore(line, first);
            }
        }
        // 每个方块的点击事件
        $('#gameZone').on('click touchstart','.sin', function (ev) {
            ev.preventDefault();
            var classes = ev.target.className;
            var divList = $(this).parent().next().find('div');
            var inx = $(this).index();
            // 第一个方块
            if (ev.target.parentNode.id === 'last') {
                if (classes.indexOf('mark') === -1) {
                    return;
                }
                begin = true;
                gameTimer = setInterval(timer, 10);
                move(ev);
                var t = topVal - 100;
                gameZone.style.top = t + 'px';
            }else if (begin && !end) {
                if (ev.target.parentNode === clickable()) {
                    if (classes.indexOf('mark') === -1) {
                        // 停止页面
                        gameOver(ev);
                    } else {
                        move(ev);
                    }
                }else if (ev.target.parentNode === clickable2() && divList[inx].className.indexOf('mark') !== -1) {
                    move(divList[inx]);
                }
            }
        });
    }

// 点击后方块下移,播放音效
    function move(ev) {
        // createjs.Sound.play('tap');
        if (ev.target) {
            ev.target.removeAttribute('class');
            ev.target.className = 'sin success';
        }else{
            ev.removeAttribute('class');
            ev.className = 'sin success';
        }
        var line = cline();
        gameZone.insertBefore(line, gameZone.firstChild);
        score++;
    }
// 倒计时时间规范
    function format(time) {
        var str = '000' + time;
        return str.substr(-4, 2) + "'" + str.substr(-2) + "''";
    }
// 倒计时函数
    function timer() {
        if (gameTime <= 0) {
            gameOver();
        } else {
            gameTime--;
            timerDiv.innerHTML = format(gameTime);
        }
    }
// 游戏结束
    function gameOver(ev) {
        end = true;
        // 清除倒计时,展示结果特效和结果
        clearInterval(gameTimer);
        setTimeout(function () {
            showResult();
        }, 700);
        // 时间到结束
        if (gameTime <= 0) {
            var timeOver = getId('timeOver');
            timeOver.style.display = 'block';
            setTimeout(function () {
                timeOver.style.display = 'none';
            }, 100);
            setTimeout(function () {
                timeOver.style.display = 'block';
            }, 200);
            setTimeout(function () {
                timeOver.style.display = 'none';
            }, 300);
            setTimeout(function () {
                timeOver.style.display = 'block';
            }, 400);
            setTimeout(function () {
                timeOver.style.display = 'none';
            }, 500);
        } else {
            // 失败结束
            // createjs.Sound.play('err');
            ev.target.className = 'sin red';
            setTimeout(function () {
                ev.target.className = 'sin';
            }, 100);
            setTimeout(function () {
                ev.target.className = 'sin red';
            }, 200);
            setTimeout(function () {
                ev.target.className = 'sin';
            }, 300);
            setTimeout(function () {
                ev.target.className = 'sin red';
            }, 400);
            setTimeout(function () {
                ev.target.className = 'sin';
            }, 500);
        }
    }
// 结果
    function showResult() {
        document.removeEventListener('touchmove', preventDefault);
        var result = getId('result');
        var ua = navigator.userAgent.toLowerCase();
        mainBody.style.display = 'none';
        result.style.display = 'block';
        textAlt(score);
        bestScore();
        setWinMsg(score);
        getId('onceMore').onclick = function () {
            // 安卓微信浏览器读取缓存 刷新页面
            var link = window.location.href.split('?')[0] + '?' + Math.random();
            window.location.href = ua.match(/MicroMessenger/i) == 'micromessenger' ? link : window.location.href;
        };

        // 浏览器中分享功能(分微信端和浏览器)
        $('.share').click(function () {
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                var shareFloat = getId('shareFloat');
                shareFloat.style.display = 'block';
                shareFloat.onclick = function () {
                    shareFloat.style.display = 'none';
                };
            } else {
                var title = '采砖大盗';
                var summary = score ? '我20秒抢到' + score + '平米的房，你呢？' : '20秒，看你能住多大的房';
                var PicUrl = '../images/share.jpg';
                var titlesina = '采砖大盗';
                myShare(this, {title: title, summary: summary, PicUrl: PicUrl, titlesina: titlesina});
            }
        });
    }
// 从localStorage获取历史最佳成绩
    function bestScore() {
        var thisTime = getId('thisTime');
        thisTime.innerText = score;
        var lS = window.localStorage;
        var bestDiv = getId('best');
        if (lS) {
            var scoreH = lS.getItem('scoreBest');
            var best;
            if (scoreH && score <= scoreH) {
                best = scoreH;
            } else {
                best = score;
            }
            bestDiv.innerText = best;
            lS.setItem('scoreBest', best);
        } else {
            bestDiv.innerHtml = '\u65e0';
        }
    }
// 结果页文本提示
    function textAlt(score) {
        var textAlt = '';
        if (score <= 30) {
            textAlt = '手残党慎入！你告诉我这' + score + '平米够干什么的？！';
        } else if (score <= 50) {
            textAlt = score + '平的单身公寓是你的标配，想住大房要努力哦';
        } else if (score <= 65) {
            textAlt = '苦哈哈才抢到' + score + '平，房子是小了点，且行且珍惜';
        } else if (score <= 90) {
            textAlt = '哎呦不错哦！抢到' + score + '平，这小日子过得倍儿滋润';
        } else if (score <= 130) {
            textAlt = score + '平，帅呆了！开启幸福二胎时代呀，巴扎嘿！';
        } else if (score <= 150) {
            textAlt = '眼疾手快！' + score + '平大四居，三代同堂幸福感爆棚';
        } else if (score <= 180) {
            textAlt = '哇哦，' + score + '平的大洋房在向你招手！你值得拥有';
        } else {
            textAlt = '抢到' + score + '平的大别墅，此刻的你站在人生的顶点';
        }
        getId('textAlt').innerText = textAlt;
    }
// 随机快
    function color() {
        var color = ['sin', 'sin', 'sin', 'sin'];
        var inx = Math.floor(Math.random() * 4);
        var imgInx = Math.floor(Math.random() * 5);
        color[inx] = color[inx] + ' mark' + imgInx;
        return color;
    }
// 创建div
    function cdiv(className, id) {
        var div = document.createElement('div');
        div.className = className;
        id && (div.id = id);
        return div;
    }
// 创建行
    function cline(id) {
        var line = id ? cdiv('line', id) : cdiv('line');
        var colorArray = color();
        colorArray.forEach(function (val) {
            line.appendChild(cdiv(val));
        });
        return line;
    }
// 初始化
    init();
})();
