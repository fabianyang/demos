/**
 * 未实现保存功能
 */

$(function() {
    'use strict';
    var jqUserPhone = $('#userPhone'),
        jqHistoryBack = $('#historyBack'),
        imgPath = $('#imgPath').val();

    if ( jqHistoryBack.val() ){
        window.location.reload();
    };

    (function() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        // 根据前缀判断是否存在requestAnimationFrame方法
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
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

    var box = $('.js_box'),
        page = $('.page'),
        pageNameList = [],
        htmlFontSize = parseInt(document.documentElement.style.fontSize);

    var Config = {
        page: {
            loading: page.eq(0),
            begin: page.eq(1),
            game: page.eq(2),
            form: page.eq(3),
            ruler: page.eq(4)
        },
        box: {
            submit: box.eq(0),
            share: box.eq(1),
            ruler: box.eq(2),
            rank: box.eq(3)
        },
        button: {
            begin: $('.js_btnBegin'),
            rank: $('.js_btnRank'),
            ruler: $('.js_btnRuler'),
            share: $('.js_btnShare'),
            submit: $('.js_btnSubmit'),
            close: $('a.close'),
            music: $('.music')
        },
        text: {
            score: $('.js_textScore'),
            best: $('.js_textBest'),
            rank: $('.js_textRank')
        },
        shareMask: $('.js_shareMask'),
        rankList: $('.js_listRank > li:gt(0)'),
        loadingBar: $('.js_barLoading'),
        cardClass: 'js_card',
        levelClass: 'level',
        frontAnimateClass: 'flipFront',
        backAnimateClass: 'flipBack',
        fadeOutAnimateClass: 'fadeOut',
        backClass: 'fan',
        outClass: 'kong',
        timeClass: 'time',
        roundClass: 'round',
        time: [30 * 1000, 40 * 1000, 50 * 1000],
        cardClassNameArray: [
            ['wazi', 'ling', 'ren', 'hezi', 'ren', 'ling', 'wazi', 'ling', 'hezi', 'wazi', 'ren', 'hezi', 'ling', 'ren', 'hezi', 'wazi'],
            ['wazi', 'ling', 'hezi', 'hezi', 'lu', 'wazi', 'ren', 'lu', 'ren', 'ling', 'lu', 'hezi', 'hezi', 'wazi', 'ren', 'ling', 'ling', 'ren', 'lu', 'wazi'],
            ['ren', 'lu', 'hezi', 'lu', 'hezi', 'wazi', 'ling', 'ren', 'ling', 'ren', 'wazi', 'hezi', 'lu', 'hezi', 'ling', 'shu', 'wazi', 'lu', 'ren', 'shu', 'shu', 'ling', 'shu', 'wazi'],
        ],
        failUrl: [
            'http://m.fang.com/zhishi/esf/201612/fanfanle01.html',
            'http://m.fang.com/zhishi/esf/201612/fanfanle02.html',
            'http://m.fang.com/zhishi/esf/201612/fanfanle03.html'
        ],
        windowHeight: $(window).height(),
        mainHeightRemArray: [15.2, 22.8, 30.4], // rem
        windowHeightRem: $(window).height() / htmlFontSize, // rem
        mainTopRem: 6.2,
        delayStartTime: 5 * 1000
    };

    var isEnd = $('#canPlay').val();
    if (isEnd === 'end') {
        page.hide();
        Config.page['ruler'].show();
        Config.box['rank'].show();
        Config.button['rank'].addClass('cur');
        Config.button['begin'].remove();
        Config.button['close'].remove();
        $('.music').remove();
        return;
    }

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
        ss: function(str){
            var e = 'EDCBAJIHGF';
            return str.split('').map(function(x, i, a){
                if (x !== '.') {
                    return e[x];
                } else {
                    return x;
                }
            }).join('');
        }
    };

    var Flow = {
        hidePage: function() {
            var that = $(this);
            if (that.parents('.js_box').length) {
                that.parents('.js_box').hide();
            }
            that.parents('.page').hide();
        },
        fadeOutPage: function(callback) {
            var that = $(this);
            if (that.parents('.js_box').length) {
                that.parents('.js_box').hide();
            }
            that.parents('.page').fadeOut(500, function() {
                callback && callback();
            })
        },
        pushPageName: function(name) {
            pageNameList.push(name);
            // console.log(pageNameList);
        },
        pullPageName: function() {
            var length = pageNameList.length;
            var name = pageNameList[length - 2];
            pageNameList.length = length - 1;
            // console.log(pageNameList);
            return name;
        },
        closePage: function(key) {
            if (key.indexOf(',') > -1) {
                var keys = key.split(',');
                Config.page[keys[0]].show();
                Config.box[keys[1]].show();
            } else {
                Config.page[key].show();
            }
        },
        updateTime: function (time) {
            var s = (100 + Math.floor(time / 1000)).toString().substr(1),
                ms = (1000 + (time % 1000)).toString().substr(1);
            $('.' + Config.timeClass).text(s + '"' + ms);
        },
        lastScore: 0,
        musicIsPlay: false,
        freezePage: false
    };

    var Net = {
        uploadScore: function(score, userPhone, userName, callback) {
            var ss = (score / 1000).toFixed(3);
            var data = {
               score: Util.ss( ss ),
               name: window.encodeURIComponent(userName) || '',
               phone: userPhone || ''
            };

            Flow.lastScore = score;
            // console.log(data);

            var url = window.location.protocol + '//' + window.location.host + '/huodongAC.d?m=returnScore&class=EliminateJoyHc'
            $.get(url, data, function(data) {
                var json = JSON.parse(data).root;
                Config.text.score.text('您的成绩为：' + json.score + '秒');
                Config.text.best.text('最佳成绩为：' + json.bestwintimes + '秒');
                if (json.rank <= 6) {
                    Config.text.rank.html('当前排名：<span>NO.' + json.rank + '</span>');
                } else {
                    Config.text.rank.text('当前排名：暂未上榜');
                }

                // console.log(json.score, json.bestwintimes, json.rank);
                var listRank = JSON.parse(window.decodeURIComponent(json.listRank));
                // console.log(listRank);
                for (var i = 0; i < listRank.length; i++ ) {
                    var span = Config.rankList.eq(i).find('span');
                    span.eq(1).text(listRank[i].phone);
                    span.eq(2).text(listRank[i].wintimes + 's');
                }

                Config.page['game'].fadeOut(500, function(){
                    Config.page.form.fadeIn(500);
                    callback && callback();
                });

                if (!userPhone && json.rank <= 6) {
                    Flow.pushPageName('form,submit');
                    Config.box['submit'].show();
                } else {
                    Flow.pushPageName('form,share');
                    Config.box['share'].show();
                }
            })
        }
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

        that.jq.parent().fadeOut(that.fadeOutTime - 10, function(){
            $(this).addClass(Config.outClass).show();
        });

        that.jq.fadeOut(that.fadeOutTime, function(){
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
        this.canPlay = false;
        this.cardOpened = null;
        this.round = 0;
        this.score = 0;

        this.roundTitle = $('.' + Config.roundClass);
        this.jqCards = $('.' + Config.cardClass);
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
            Net.uploadScore(that.score, jqUserPhone.val(), null, function(){
                that.restore();
            });
            return;
        }

        that.canPlay = false;
        that.cardOpened = null;
        that.round = that.round + 1;

        // 标题：第二关
        that.roundTitle.removeClass(Config.roundClass + that.round).addClass(Config.roundClass + (that.round + 1));

        Flow.updateTime(Config.time[this.round]);

        // 重置已 out 的牌
        $('.' + Config.outClass).removeClass(Config.outClass);

        // 将隐藏的牌变为可玩的牌
        $('.' + Config.levelClass + that.round).show().find('.' + Config.backClass).addClass(Config.cardClass);

        // 只要定好牌的资源，用牌背盖住
        that.jqCards = $('.' + Config.cardClass).addClass(Config.backClass);

        that.init();
        that.start();
    }

    Game.prototype.restore = function() {
        // 重置 第几关标题
        this.roundTitle.removeClass(Config.roundClass + (this.round + 1));

        this.canPlay = false;
        this.cardOpened = null;
        this.round = 0;
        this.score = 0;

        this.roundTitle.addClass(Config.roundClass + (this.round + 1));

        Flow.updateTime(Config.time[this.round]);

        $('.' + Config.outClass).removeClass(Config.outClass).show();

        // 将等级牌隐藏
        $('.' + Config.levelClass + '1,.' + Config.levelClass + '2').hide().find('.' + Config.cardClass).removeClass(Config.cardClass).addClass(Config.backClass);

        this.jqCards = $('.' + Config.cardClass).addClass(Config.backClass);

        this.init();
    }

    // rem
    Game.prototype.setBoard2Center = function() {
        var top = Config.windowHeightRem / 2  - Config.mainHeightRemArray[this.round] / 2;
        if (top < Config.mainTopRem) {
            top = Config.mainTopRem
        }
        // console.log(Config.mainTopRem, Config.windowHeightRem / 2  - Config.mainHeightRemArray[this.round] / 2);
        $('.main').css( 'top', top + 'rem' );
    }

    Game.prototype.init = function() {
        // 记录每个正面图片个数，或生成卡片，牌的顺序 length 4*4, 4*5, 4*6
        // Card 对象数组
        var cardClassNameArray = Config.cardClassNameArray[this.round];
        this.cardArray = cardClassNameArray.concat();
        this.cardCount = cardClassNameArray.length;

        // 毫秒
        this.time = Config.time[this.round];

        this.setBoard2Center();

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
        this.jqCards.on('click', function(e) {
            // 页面一进入展示牌面时不能点击
            if (!that.canPlay) {
                return false;
            }

            var clickIndex = $(this).parent().index();
            var current = that.cardArray[clickIndex];
            // 当前点击牌面已经消失，或在动画过程中，不能点击
            if (current.isOut || current.isLock ) {
                // console.log('current is out or is Locked!', current.className, current.index);
                return false;
            }
            var opened = that.cardOpened;
            if (opened) {
                // 当前点击的和上次点击的是同一张牌，点击无效
                if(current.index == opened.index) {
                    // console.log('the same card!', current.index, opened.index);
                    return false;
                }

                // 点击的配对牌，计分
                if (opened.className === current.className) {
                    // console.log("that's right card", current.index, current.className, opened.index, opened.className);
                    current.doOpen(function() {
                        current.doOut(function(){
                            that.cardCount--;
                        });
                        opened.doOut(function(){
                            that.cardCount--;
                        });
                    });
                }
                // 点击到非配对卡片。
                else {
                    // console.log("that's not right card", current.index, current.className, opened.index, opened.className);
                    current.doOpen(function(){
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

    Game.prototype.countDown = function() {
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

                            that.countDown();
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
        var list = ['bg.jpg','logo.png','music_bg.png','music.png','time_round.png','round1.png','round2.png','round3.png','zheng.png','kong.png','img01.png','img02.png','img03.png','img04.png','img05.png','img06.png','fan.png','bg_b.jpg','head.png','old.png','bottom.png','btn_begin.png','yx_rule.png','congrats.png','rule2.png','rank2.png','rule.png','rank.png','btn_begin2.png']
        var index = 0;

        for (var i = 0; i < list.length; i++) {
            var img = new Image() || document.createElement('img');
            img.src = imgPath + 'images/' + list[i];
            img.onload = function () {
                index++;
                isFinish();
            };
        }

        function isFinish() {
            if(index === list.length) {
                Config.page['loading'].fadeOut(500, function(){
                    Flow.pushPageName('begin');
                    Config.page['begin'].fadeIn(500);
                });
            } else {
                Config.loadingBar.css('width', index / list.length * 100 + '%');
            }
        }




        // var width = 0;
        // var timer = window.setInterval(function(){
        //     if (width <= 100) {
        //         width = width + 10;
        //     }
        //     Config.loadingBar.css('width', width + '%');
        //     if (width == 100 && !game.canPlay) {
        //         Config.page['loading'].fadeOut(500, function(){
        //             Flow.pushPageName('begin');
        //             Config.page['begin'].fadeIn(500);
        //         });
        //         window.clearInterval(timer);
        //     }
        // }, 100)
    })()

    // 不记录页面跳转
    Config.button['begin'].on('click', function(e) {
        e.stopPropagation();
        Flow.fadeOutPage.call(this, function(){

            // Config.page.form.fadeIn(500);
            // Flow.pushPageName('form,submit');
            // Config.box['submit'].show();
            Config.page['game'].fadeIn(500, function(){
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
        msgBoxTimer = setTimeout(function () {
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
        Net.uploadScore(Flow.lastScore, userPhone, userName);
        showMsg('成绩提交成功！');

        // 手动关闭，只需要从历史页面清除当前页面即可
        Flow.hidePage.call(this);
        Flow.pullPageName();
    })

    Config.button['share'].on('click', function(e) {
        e.stopPropagation();
        Config.shareMask.show();
    })

    Config.shareMask.on('click', function(e){
        e.stopPropagation();
        $(this).hide();
    })

    Config.button['ruler'].on('click', function(e) {
        e.stopPropagation();
        Flow.hidePage.call(this);
        if (!$(this).parent('li').length) {
            Flow.pushPageName('ruler');
        }
        Config.page['ruler'].show();

        Config.box['ruler'].show();
        Config.button['ruler'].addClass('cur')

        Config.box['rank'].hide();
        Config.button['rank'].removeClass('cur');
    })

    Config.button['rank'].on('click', function(e) {
        e.stopPropagation();
        Flow.hidePage.call(this);
        // 不是 tab 中的切换
        if (!$(this).parent('li').length) {
            Flow.pushPageName('rank');
        }
        Config.page['ruler'].show();

        Config.box['rank'].show();
        Config.button['rank'].addClass('cur');

        Config.box['ruler'].hide();
        Config.button['ruler'].removeClass('cur');
    })

    Config.button['close'].on('click', function(e) {
        e.stopPropagation();
        Flow.hidePage.call(this);
        var key = Flow.pullPageName();
        Flow.closePage(key);
    })

    var shareTile = '圣诞fang翻乐',
        // shareDescription = '听说，圣诞节要来了？听说，你连个苹果都没收到？没关系，我们来给你送礼！别着急，先闯关再说......',
        shareDescription = '翻牌拼手速 闯关赢大礼',
        shareImageUrl = document.getElementById('share').src;
    // 微信、QQ分享
    new Weixin({
        // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        debug: false,
        shareTitle: shareTile,
        descContent: shareDescription,
        swapTitle: true,
        lineLink: window.location.href,
        imgUrl: shareImageUrl
    });

    // APP分享
    var dataForWeixin = {
        title: shareTile,
        desc: shareDescription,
        url: window.location.href,
        TLImg: shareImageUrl
    };
    $('#soufunclient').html('1$' + dataForWeixin.desc + '$' + dataForWeixin.url + '$' + dataForWeixin.TLImg);

    // 音乐
    var bgm = document.createElement('audio');
    bgm.src = imgPath + 'audio/music.mp3';
    bgm.loop = true;
    bgm.play();
    Config.button['music'].on('click',function (ev) {
        ev.stopPropagation();
        var a = $(this).find('a');
        if (a.hasClass('circle')) {
            bgm.pause();
            a.removeClass('circle');
        } else {
            bgm.play();
            a.addClass('circle');
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


    // $(document).on('touchstart.reload', function (ev) {
    //     if (jqHistoryBack.val()) {
    //         window.location.reload();
    //         $(document).off('touchstart.reload');
    //     }
    // });

    /**
     * 根据冻结页面标识，判断页面是否可以滑动
     */
    $(document).on('touchmove', function (e) {
        e.stopPropagation();
        if (Flow.freezePage || (pageNameList.length === 1 && !game.canPlay)) {
            e.preventDefault();
        }
    });

    var input = $('input');
    input.on('focus.keyboard', function(){
        $(this).parents('.page').css({
            'position': 'absolute',
            'top': '-7rem'
        })
    });

    input.on('blur.keyboard', function(){
        $(this).parents('.page').css({
            'position': 'relative',
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
