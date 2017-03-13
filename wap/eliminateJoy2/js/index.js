/**
 * 未实现保存功能
 */

$(function() {
    'use strict';
    var jqUserPhone = $('#userPhone'),
        jqHistoryBack = $('#historyBack'),
        imgPath = $('#imgPath').val();

    if (jqHistoryBack.val()) {
        window.location.reload();
    };

    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        // 根据前缀判断是否存在requestAnimationFrame方法
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        // 如果没有requestAnimationFrame方法设置setTimeout方法代替
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        // 如果没有取消requestAnimationFrame方法设置clearTimeout方法代替
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                window.clearTimeout(id);
            };
        }
    })()

    var main = $('.main'),
        page = $('.page'),
        pageNameList = [],
        htmlFontSize = parseInt(document.documentElement.style.fontSize);

    var Config = {
        page: {
            loading: main.eq(0),
            begin: main.eq(1),
            game: main.eq(2),
            ruler: page.eq(0),
            rank: page.eq(1),
            form: page.eq(2),
            share: page.eq(3),
        },
        button: {
            begin: $('.js_btnBegin'),
            rank: $('.js_btnRank'),
            ruler: $('.js_btnRuler'),
            share: $('.js_btnShare'),
            submit: $('a.submit'),
            close: $('a.close'),
            music: $('.music')
        },
        text: {
            score: $('.js_txtScore'),
            best: $('.js_txtBest'),
            rank: $('.js_txtRank')
        },
        loading: {
            bar: $('.js_loadingBar'),
            text: $('.js_loadingText')
        },
        roundTitle: $('.round'),
        gameBox: $('.gameBox'),
        rankList: $('ul.rankList > li'),
        frontAnimateClass: 'flipFront',
        backAnimateClass: 'flipBack',
        fadeOutAnimateClass: 'fadeOut',
        backClass: 'fan',
        outClass: 'kong',
        timeClass: 'time',
        time: [30 * 1000, 40 * 1000, 50 * 1000],
        round: ['one', 'two', 'three'],
        cardClassNameArray: [
            ['dl', 'fa', 'fu', 'ji', 'fu', 'fa', 'ji', 'dl', 'fa', 'dl', 'fu', 'ji', 'ji', 'fu', 'dl', 'fa'],
            ['yb', 'fu', 'ji', 'yb', 'fa', 'dl', 'fu', 'ji', 'yb', 'fa', 'dl', 'fu', 'ji', 'dl', 'ji', 'fu', 'fa', 'yb', 'dl', 'fa'],
            ['fu', 'fa', 'yb', 'ji', 'hb', 'yb', 'dl', 'fa', 'ji', 'fu', 'fa', 'hb', 'fu', 'dl', 'hb', 'ji', 'hb', 'fa', 'fu', 'yb', 'dl', 'ji', 'yb', 'dl']
        ],
        failUrl: [
            'http://m.fang.com/zhishi/esf/201701/xcyxgl1.html',
            'http://m.fang.com/zhishi/esf/201701/xcyxgl2.html',
            'http://m.fang.com/zhishi/esf/201701/xcyxgl.html'
        ],
        shareMask: $('.js_shareMask'),
        delayStartTime: 5 * 1000,
        backShare: false,
        windowHeight: $(window).height(),
        freezePage: false
    };

    var Util = {
        random: function(pMax, pMin) {
            var min = pMin || 0,
                max = pMax || 0;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getNumberArray: function(pMax, pMin) {
            var array = [],
                min = pMin || 0,
                max = pMax || 0;
            for (var i = min; array.push(i++) < max;);
            return array;
        },
        animateEnd: function($jq, animateCalss, callback) {
            var length = $jq.length;
            $jq.addClass(animateCalss).on('animationend webkitAnimationEnd', function(e) {
                $(this).removeClass(animateCalss);
                length--;
                if (!length) {
                    callback && callback(e);
                }
            });
        },
        ss: function(str) {
            var e = 'EDCBAJIHGF';
            return str.split('').map(function(x, i, a) {
                if (x !== '.') {
                    return e[x];
                } else {
                    return x;
                }
            }).join('');
        }
    };

    var Flow = {
        updateTime: function(time) {
            var s = (100 + Math.floor(time / 1000)).toString().substr(1),
                ms = (1000 + (time % 1000)).toString().substr(1);
            $('.' + Config.timeClass).text('时间：' + s + '"' + ms);
        },
        updateRound: function(round) {
            var roundCls = Config.round[round],
                removeCls = Config.round.join(' ');
            Config.gameBox.removeClass(removeCls).addClass(roundCls);
            Config.roundTitle.removeClass(removeCls).addClass(roundCls);
            return roundCls;
        },
        pageShow: function(key) {
            page.hide();
            Config.page[key].show();
            Config.freezePage = true;
        },
        lastScore: 0,
        musicIsPlay: false
    };

    var isEnd = $('#canPlay').val();
    if (isEnd === 'end') {
        Flow.pageShow('rank');
        Config.button['begin'].remove();
        Config.button['close'].remove();
        $('.music').remove();
        return;
    }

    var uploadScore = function(score, userPhone, userName, callback) {
        var ss = (score / 1000).toFixed(3);
        var data = {
            score: Util.ss(ss),
            name: window.encodeURIComponent(userName) || '',
            phone: userPhone || ''
        };

        Flow.lastScore = score;
        // console.log(data);

        var url = window.location.protocol + '//' + window.location.host + '/huodongAC.d?m=returnScore&class=EliminateJoyTwoHc'
        $.get(url, data, function(data) {
            var json = JSON.parse(data).root;
            Config.text.score.text(json.score + '秒');
            Config.text.best.text(json.bestwintimes + '秒');
            // Config.text.score.text('您的成绩为：' + json.score + '秒');
            // Config.text.best.text('最佳成绩为：' + json.bestwintimes + '秒');
            if (json.rank <= 6) {
                // Config.text.rank.html('当前排名：<span>NO.' + json.rank + '</span>');
                Config.text.rank.html('NO.' + json.rank);
            } else {
                Config.text.rank.text('暂未上榜');
                // Config.text.rank.text('当前排名：暂未上榜');
            }

            // console.log(json.score, json.bestwintimes, json.rank);
            var listRank = JSON.parse(window.decodeURIComponent(json.listRank));
            // console.log(listRank);
            for (var i = 0; i < listRank.length; i++) {
                var span = Config.rankList.eq(i).find('span');
                span.eq(1).text(listRank[i].phone);
                span.eq(2).text(listRank[i].wintimes + 's');
            }

            Config.page['game'].fadeOut(500, function() {
                var key = 'share';
                if (!userPhone && json.rank <= 6) {
                    key = 'form';
                    Config.backShare = true;
                }
                Config.page['begin'].show();
                Flow.pageShow(key);
                callback && callback();
            });

        })
    };

    function Card(opts) {
        this.fadeOutTime = 300;
        this.isOut = false;
        this.isOpen = false;
        this.isLock = false;
        this.index = opts.index;
        this.className = opts.className;
        this.dom = opts.dom;
        this.init();
    }

    Card.prototype.init = function() {
        this.jq = $(this.dom).addClass(this.className);
    };

    Card.prototype.doOpen = function(callback) {
        var that = this;
        if (that.isLock) {
            return false;
        }
        that.isLock = true;
        Util.animateEnd(that.jq, Config.backAnimateClass, function(e) {
            that.jq.removeClass(Config.backClass);
            Util.animateEnd(that.jq, Config.frontAnimateClass, function(e) {
                that.isOpen = true;
                callback && callback();
            });
        });
    }

    Card.prototype.doClose = function() {
        var that = this;
        that.isLock = true;
        Util.animateEnd(that.jq, Config.backAnimateClass, function(e) {
            that.jq.addClass(Config.backClass);
            Util.animateEnd(that.jq, Config.frontAnimateClass, function(e) {
                that.isOpen = false;
                that.isLock = false;
            });
        });
    }

    Card.prototype.doOut = function(callback) {
        var that = this;
        that.isOut = true;

        that.jq.parent().fadeOut(that.fadeOutTime - 10, function() {
            $(this).addClass(Config.outClass).show();
        });

        that.jq.fadeOut(that.fadeOutTime, function() {
            $(this).removeClass(that.className + ' ' + Config.backClass).show();
            callback && callback();
        });


        // that.jq.fadeOut(500, function(){
        //     var jqThis = $(this);
        //     jqThis.removeClass(that.className + ' ' + Config.backClass).show();
        //     jqThis.parent().addClass(Config.outClass).show();
        //     callback && callback();
        // });

        // that.jq.parent().fadeOut(500, function(){
        //     that.jq.removeClass(that.className + ' ' + Config.backClass);
        //     $(this).addClass(Config.outClass).fadeIn(500);
        //     callback && callback();
        // });
    }

    function Game() {
        this.round = 0;
        this.score = 0;

        // 确保只有单例
        if (Game.unique !== undefined) {
            return Game.unique;
        }
        Game.unique = this;
        this.init();
    }

    Game.prototype.levelUp = function() {
        var that = this;
        // 先记录成绩，花费时间
        that.score = that.score + Config.time[this.round] - that.time;

        if (that.round === Config.time.length - 1) {
            // if (!that.round) {
            uploadScore(that.score, jqUserPhone.val(), null, function() {
                that.restore();
            });
            return;
        }

        that.round = that.round + 1;

        // 重置已 out 的牌
        $('.' + Config.outClass).removeClass(Config.outClass).addClass(Config.round[that.round]);

        that.init();
        that.start();
    }

    Game.prototype.restore = function() {
        // this.jqCards.removeClass(Config.backClass);
        this.round = 0;
        this.score = 0;

        $('.' + Config.outClass).removeClass(Config.outClass).show();

        this.init();
    }

    Game.prototype.init = function() {
        this.canPlay = false;
        this.cardOpened = null;

        var roundClass = Flow.updateRound(this.round);
        // 只要定好牌的资源，用牌背盖住
        this.jqCards = $('.' + roundClass + '> a').addClass(Config.backClass);
        Flow.updateTime(Config.time[this.round]);

        // 记录每个正面图片个数，或生成卡片，牌的顺序 length 4*4, 4*5, 4*6
        // Card 对象数组
        var cardClassNameArray = Config.cardClassNameArray[this.round];
        this.cardArray = cardClassNameArray.concat();
        this.cardCount = cardClassNameArray.length;

        // 毫秒
        this.time = Config.time[this.round];

        this.initCard();
        this.bindEvent();
    }

    Game.prototype.initCard = function() {
        var that = this;
        var jqCardsCopy = Array.prototype.slice.call(that.jqCards);

        // console.log(this.cardArray);
        this.cardArray.map(function(val, idx) {
            var card = new Card({
                dom: jqCardsCopy[idx],
                className: val,
                index: idx
            })
            that.cardArray[idx] = card;
        });
    }
    Game.prototype.bindEvent = function() {
        var that = this;
        this.jqCards.off('touchstart.game').on('touchstart.game', function(e) {
            // 页面一进入展示牌面时不能点击
            if (!that.canPlay) {
                return false;
            }

            var clickIndex = $(this).parent().index();
            var current = that.cardArray[clickIndex];
            // 当前点击牌面已经消失，或在动画过程中，不能点击
            if (current.isOut || current.isLock) {
                // console.log('current is out or is Locked!', current.className, current.index);
                return false;
            }
            var opened = that.cardOpened;
            if (opened) {
                // 当前点击的和上次点击的是同一张牌，点击无效
                if (current.index == opened.index) {
                    // console.log('the same card!', current.index, opened.index);
                    return false;
                }

                // 点击的配对牌，计分
                if (opened.className === current.className) {
                    // console.log("that's right card", current.index, current.className, opened.index, opened.className);
                    current.doOpen(function() {
                        current.doOut(function() {
                            that.cardCount--;
                        });
                        opened.doOut(function() {
                            that.cardCount--;
                        });
                    });
                }
                // 点击到非配对卡片。
                else {
                    // console.log("that's not right card", current.index, current.className, opened.index, opened.className);
                    current.doOpen(function() {
                        // openend 已经完全翻开
                        opened.doClose();
                        current.doClose();
                    });
                }

                that.cardOpened = null;

            } else {
                // console.log("the card do open!", current.index, current.className);
                current.doOpen();
                that.cardOpened = current;
            }
        });
    }

    Game.prototype.countdown = function() {
        var that = this;
        var lastTime = new Date().getTime();
        var _run = function() {
            var time = new Date().getTime();
            var diff = time - lastTime;
            lastTime = time;
            that.time = that.time - diff;
            if (!that.cardCount) {
                cancelAnimationFrame(_run);
                that.levelUp();
            } else if (that.time > 0) {
                Flow.updateTime(that.time);
                requestAnimationFrame(_run);
            } else {
                Flow.updateTime(0);
                cancelAnimationFrame(_run);
                that.fail();
            }
        };
        _run();
    }


    Game.prototype.fail = function() {
        var url = Config.failUrl[this.round];
        jqHistoryBack.val(url);
        window.location = url;
    }

    Game.prototype.start = function() {
        var that = this;
        Util.animateEnd(that.jqCards, Config.backAnimateClass, function() {
            that.jqCards.removeClass(Config.backClass);
            Util.animateEnd(that.jqCards, Config.frontAnimateClass, function() {
                var timer = setTimeout(function() {
                    Util.animateEnd(that.jqCards, Config.backAnimateClass, function() {
                        that.jqCards.addClass(Config.backClass);
                        Util.animateEnd(that.jqCards, Config.frontAnimateClass, function() {
                            that.canPlay = true;

                            that.countdown();
                        });
                    });
                    clearTimeout(timer);
                }, Config.delayStartTime);
            });
        });
    }

    var game = new Game();

    // loading
    (function() {
        var list = ['bg.jpg', 'close_icon.png', 'music_on.png', 'music_off.png', 'round1.png', 'round2.png', 'round3.png', 'kong.png', 'img1.png', 'img2.png', 'img3.png', 'img4.png', 'img5.png', 'img6.png', 'fanm.png', 'begin.png', 'btn_begin.png', 'btn_begin2.png', 'btn_rule.png', 'btn_yq.png', 'btn_again.png', 'hf.png', 'rank.png', 'rank_btn.png', 'rank2.png', 'rankBox.png', 'rule_word.png', 'rule-b.png', 'rule-b2.png', 'rw_bg.png', 'share.png', 'submit.png', 'tit_phb.png', 'tit_yxgz.png', 'tj_bg.png', 'tzcg_bg.png', 'time_bg.png', 'pmw_bg.png', 'pmw_bg2.png']
        var index = 0;

        for (var i = 0; i < list.length; i++) {
            var img = new Image() || document.createElement('img');
            img.src = imgPath + 'images/' + list[i];
            img.onload = function() {
                index++;
                isFinish();
            };
        }

        function isFinish() {
            if (index === list.length) {
                Config.page['loading'].fadeOut(500, function() {
                    $('body').removeClass('loadBg');
                    Config.page['begin'].show();
                });
            } else {
                var str = (index / list.length * 100).toFixed(0) + '%';
                Config.loading.bar.css('width', str);
                Config.loading.text.text(str);
            }
        }
    })()

    // 不记录页面跳转
    Config.button['begin'].on('click', function(e) {
        e.stopPropagation();
        page.hide();
        Config.page['begin'].fadeOut(500, function() {
            Config.page['game'].fadeIn(500, function() {
                game.start();
            });
        });
    })

    // 信息提示弹框相关
    var msgBox = $('.msg'),
        msgBoxTimer = null;

    function showMsg(pText, pTime, callback) {
        var text = pText || '信息有误！',
            time = pTime || 1500;
        msgBox.show().css({
            position: 'absolute',
            top: $(document).scrollTop() + $(document).height() / 4
        }).find('p').html(text);
        clearTimeout(msgBoxTimer);
        msgBoxTimer = setTimeout(function() {
            msgBox.hide();
            callback && callback();
        }, time);
    }

    var phoneRegEx = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/i;
    Config.button['submit'].on('click', function(e) {
        e.stopPropagation();
        var userName = $('input[name="userName"]').val(),
            userPhone = $('input[name="userPhone"]').val();

        if (!userName) {
            showMsg('姓名不能为空');
            return false;
        }

        if (!userPhone) {
            showMsg('手机号不能为空');
            return false;
        }

        if (!phoneRegEx.test(userPhone)) {
            showMsg('手机号格式不正确');
            return false;
        }

        jqUserPhone.val(userPhone);
        uploadScore(Flow.lastScore, userPhone, userName);
        showMsg('成绩提交成功！');

        Flow.pageShow('share');
    })

    Config.button['ruler'].on('click', function(e) {
        e.stopPropagation();
        Flow.pageShow('ruler');
    })

    Config.button['rank'].on('click', function(e) {
        e.stopPropagation();
        Flow.pageShow('rank');
        // 退回分享页
        if ($(this).hasClass('rank')) {
            Config.backShare = true;
        }
    })

    Config.button['close'].on('click', function(e) {
        e.stopPropagation();
        page.hide();
        Config.freezePage = false;

        if (Config.backShare) {
            Config.backShare = false;
            Flow.pageShow('share');
        }
    })

    /**
     * 页面功能部分
     */

    // var shareTile = '新春全民翻翻乐',
    //     shareDescription = '别说我没提醒你：翻牌也能赢大奖！',
    //     shareImageUrl = document.getElementById('share').src;
    // // 微信、QQ分享
    // new Weixin({
    //     // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    //     debug: false,
    //     shareTitle: shareTile,
    //     descContent: shareDescription,
    //     swapTitle: true,
    //     lineLink: window.location.href,
    //     imgUrl: 'http://static.test.soufunimg.com/common_m/m_activity/eliminateJoy2/images/share.jpg'
    // });

    // // APP分享
    // var dataForWeixin = {
    //     title: shareTile,
    //     desc: shareDescription,
    //     url: window.location.href,
    //     TLImg: shareImageUrl
    // };
    // $('#soufunclient').html('1$' + dataForWeixin.desc + '$' + dataForWeixin.url + '$' + dataForWeixin.TLImg);

    Config.button['share'].on('click', function(e) {
        e.stopPropagation();
        Config.shareMask.show();
    })

    Config.shareMask.on('click', function(e){
        e.stopPropagation();
        $(this).hide();
    })

    // 音乐
    var bgm = document.createElement('audio');
    bgm.src = imgPath + 'audio/music.mp3';
    bgm.loop = true;
    bgm.play();

    Config.button['music'].on('click', function(ev) {
        ev.stopPropagation();
        var a = $(this).find('a');
        if (a.hasClass('cls')) {
            bgm.play();
            Config.button['music'].find('a').removeClass('cls');
        } else {
            bgm.pause();
            Config.button['music'].find('a').addClass('cls');
        }
    });

    var hasPlay = false;
    $(document).on('touchstart.bgm', function (ev) {
        ev.stopPropagation();
        if (!hasPlay) {
            hasPlay = true;
            bgm.play();
        }
        $(document).off('touchstart.bgm');
    });

    // /**
    //  * 根据冻结页面标识，判断页面是否可以滑动
    //  */
    $(document).on('touchmove.freeze', function(e) {
        if (Config.freezePage) {
            e.preventDefault();
        }
    });

    $('.inover-box').on('touchmove.freeze', function(e) {
        console.log($(this).height(), this.scrollHeight, this.scrollTop);
        e.stopPropagation();
    })


    var input = $('input');
    input.on('focus.keyboard', function(){
        // Config.page['form'].css({
        //     // 'position': 'absolute',
        //     'top': '-3rem'
        // })
        $('.congrats').css({
            'top': '-5rem'
        })
    });

    input.on('blur.keyboard', function(){
        // Config.page['form'].css({
        //     // 'position': '',
        //     'top': ''
        // })
        $('.congrats').css({
            'top': ''
        })
    });

    $(window).on('resize.keyboard', function () {
        var thisHeight = $(this).height()
        if (thisHeight < Config.windowHeight) {
            // console.log('keyboard open!')
        } else {
            input.trigger('blur.keyboard');
        }
    });
})

// window.onload = function() {
//     var listener = function (event) {
//         var timer = window.setTimeout(function(){
//             document.getElementById('music').play();
//             document.title = document.getElementById('music').src;
//             window.clearTimeout(timer);
//         }, 0);
//         document.removeEventListener('touchstart', listener);
//     };
//     document.addEventListener('touchstart', listener, false);
// }
