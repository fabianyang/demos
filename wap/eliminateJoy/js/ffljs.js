/**
 * 未实现保存功能
 */

$(function() {
    'use strict';

    // FastClick.attach(document.body);

    var Config = {
        cardClass: 'js_card',
        frontAnimateClass: 'flipFront',
        backAnimateClass: 'flipBack',
        fadeOutAnimateClass: 'fadeOut',
        frontClassArray: ['lu', 'shu', 'ren', 'hezi', 'wazi', 'ling'],
        backClass: 'fan',
        timeClass: 'time',
        roundClass: 'round',
        roundLevel: [4 * 4, 4 * 5, 4 * 6],
        timeLevel: [20, 30, 40]
    }

    var Util = {
        random: function(pMax, pMin) {
            var min = pMin || 0,
                // max = pMax || Config.frontClassArray.length - 1;  // 错误默认值，有可能 pMax 传的就是 0
                max = pMax || 0;
            // console.log(Math.random() * (max - min + 1));
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
            $jq.addClass(animateCalss).on('animationend', function(e) {
                $(this).removeClass(animateCalss);
                length--;
                if (!length) {
                    callback && callback(e);
                }
            });
        },
        writeToStorage: function(data) {
            window.localStorage.setItem('memory', JSON.stringify(data));
        },
        readFromStorage: function() {
            var data = window.localStorage.getItem('memory');
            return JSON.parse(data);
        }
    }

    function Card(opts) {
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
                // 翻开即锁定，这时即使动画完成也不解锁，等到下一个配对判断完成，回调 close 解锁
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
                // 重置
                that.isOpen = false;
                that.isLock = false;
            });
        });
    }

    Card.prototype.doOut = function(callback) {
        var that = this;
        that.isOut = true;
        that.jq.fadeOut(500, function(){
            $(this).removeClass(that.className).addClass(Config.backClass);
            callback && callback();
        });
    }

    function Game() {
        this.cardClassNameArray = Config.frontClassArray;
        this.jqCards = $('.' + Config.cardClass);
        this.canPlay = false;
        this.round = 0;
        // 记录每个正面图片个数，或生成卡片，牌的顺序 length 4*4, 4*5, 4*6
        // Card 对象数组
        this.cardArray = [];
        this.cardOpened = null;
        this.score = 0;

        // 确保只有单例
        if (Game.unique !== undefined) {
            return Game.unique;
        }
        Game.unique = this;
        this.init();
    }

    Game.prototype.levelUp = function() {
        // 先记录成绩

        this.canPlay = false;
        this.cardArray = [];
        this.cardOpened = null;
        this.round = this.round + 1;

        var levelClass = 'level' + this.round;
        $('.' + levelClass).removeClass(levelClass).find('.' + Config.backClass).addClass(Config.cardClass);
        this.jqCards = $('.' + Config.cardClass).show();

        this.init();
        this.start();
    }

    Game.prototype.init = function() {
        this.cardCount = Config.roundLevel[this.round];
        // this.initCard();
        this.initCard2();
        this.bindEvent();
    }


    Game.prototype.initCard = function() {
        var that = this;

        that.initCardClassNameArray();
        // that.initCardClassNameArray2();

        // 界面生成对应卡片，这里将card Count 复制了一份
        var jqCardsCopy = Array.prototype.slice.call(that.jqCards),
            cardClassNameArray = that.cardArray.concat();

        var randomArray = Util.getNumberArray(jqCardsCopy.length);

        that.cardClassNameArray.map(function(val, idx) {
            var count = cardClassNameArray[idx];
            if (!count) {
                count = 2;
            }

            for (var i = 0; i < count; i++) {
                var rdm = Util.random(randomArray.length - 1);

                that.cardArray[randomArray[rdm]] = new Card({
                    dom: jqCardsCopy[randomArray[rdm]],
                    className: val,
                    index: randomArray[rdm]
                });

                // console.log(randomArray, rdm);
                randomArray.splice(rdm, 1);
            }
        });

        console.log(that.cardArray);
    }

    // 最初思路：总共 6 种图片，都会用到，(16 - 6 * 2) 还剩 4 个空位，再随机两种
    Game.prototype.initCardClassNameArray = function() {
        // 每种图片至少出现一次，剩下的为多出现的次数
        var randomCount = (this.cardCount - this.cardClassNameArray.length * 2) / 2;

        // 随机出剩余的图片
        var randomArray = Util.getNumberArray(this.cardClassNameArray.length);
        for (var i = 0; i < randomCount; i++) {
            var rdm = Util.random(randomArray.length - 1);
            this.cardArray[randomArray[rdm]] = 4;

            // console.log(randomArray, rdm);
            randomArray.splice(rdm, 1);
        }
    }

    // 阶梯思路：每个等级选择图片种类也变化，4*4 是 4 种图片，每种出现 4 次， 4 * 5 是 5 种图片
    Game.prototype.initCardClassNameArray2 = function() {
        var appearCount = 4;
        // 三种取图片的方式，以 4*4 为例
        // 1. slice(0, 4)
        // 2. slice(random[0~2], random[0+4~2+4])
        // 3. 随机 4 次，每次 slice(radom, 1) 后，再随机。
        var cardKindCount = this.cardCount / appearCount;
        this.cardClassNameArray = Config.frontClassArray.slice(0, cardKindCount);

        // 由于每种图片肯定出现 4 次，更简单。循环每种 4 次
        for (var i = 0; i < cardKindCount; i++){
            this.cardArray.push(appearCount);
        }
    }

    // 阶梯思路简化版：不需要先初始化 cardClassArray
    Game.prototype.initCard2 = function() {
        var that = this,
            appearCount = 4;
        var cardKindCount = that.cardCount / appearCount;
        var cardClassNameArray = Config.frontClassArray.slice(0, cardKindCount);

        var jqCardsCopy = Array.prototype.slice.call(that.jqCards);
        var randomArray = Util.getNumberArray(jqCardsCopy.length);

        cardClassNameArray.map(function(val, idx) {
            for (var i = 0; i < appearCount; i++) {
                var rdm = Util.random(randomArray.length - 1);

                that.cardArray[randomArray[rdm]] = new Card({
                    dom: jqCardsCopy[randomArray[rdm]],
                    className: val,
                    index: randomArray[rdm]
                });

                randomArray.splice(rdm, 1);
            }
        });

    }
    Game.prototype.bindEvent = function() {
        var that = this;
        this.jqCards.on('click', function(e) {
            if (!that.canPlay) {
                return false;
            }
            var clickIndex = $(this).parent().index();
            var current = that.cardArray[clickIndex];
            if (current.isOut || current.isLock ) {
                console.log('current is out or is Locked!', current.className, current.index);
                return false;
            }
            var opened = that.cardOpened;
            if (opened) {
                // 这里不用判断已经打开的是否锁定，已经打开的一定是锁定状态。

                // 当前点击的和上次点击的是同一张牌，点击无效
                if(current.index == opened.index) {
                    console.log('the same card!', current.index, opened.index);
                    return false;
                }

                // 配对成功，标记 out，计分；失败，关闭牌面
                if (opened.className === current.className) {
                    console.log("that's right card", current.index, current.className, opened.index, opened.className);
                    current.doOpen(function() {
                        current.doOut(function(){
                            that.save();
                        });
                        opened.doOut(function(){
                            that.save();
                        });
                    });
                } else {
                    console.log("that's not right card", current.index, current.className, opened.index, opened.className);
                    current.doOpen(function(){
                        // openend 已经完全翻开
                        opened.doClose();
                        current.doClose();
                    });
                }

                // 配对一次后，重置已打开的牌
                that.cardOpened = null;
            } else {
                // 打开一张牌
                console.log("the card do open!", current.index, current.className);
                current.doOpen();
                that.cardOpened = current;
            }
        });
    }

    Game.prototype.save = function() {
        var that = this;
        // 进行成功判断，计分
        that.cardCount--;
        if (!that.cardCount) {
            // 计算剩余时间

            that.levelUp();
        }
        // 游戏存档 双数时存档
        // if (!(that.cardCount%2)) {}
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
                        });
                    });
                    clearTimeout(timer);
                }, 1000);
            });
        });
    }

    var game = new Game();
    game.start();

    window.game = game;


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
    };

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
            console.log('keyboard open!')
        } else {
            input.trigger('blur.keyboard');
        }
    });

})
