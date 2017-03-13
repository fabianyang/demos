$(function(){

    var jqFloat = $('.float');

    var Config = {
        page: {
            login: jqFloat.eq(0),
            ruler: jqFloat.eq(1),
            isOther: jqFloat.eq(2),
            notOther: jqFloat.eq(3),
            suprise: jqFloat.eq(4),
            disappoint: jqFloat.eq(5)
        },
        class: {
            EggCracked: 'lie',
            EggBroken: 'sui'
        },
        button: {
            close: $('.close'),
            verificationCode: $('.btnYzm'),
            login: $('.btnLogin'),
            myPrize: $('.myPri, .see'),
            ruler: $('.gameRule'),
            replay: $('.again')
        },
        hammerTopList: [-1.5, -1.5 + 4.5 + 0.3, -1.5 + 4.5 * 2 + 0.3 * 2], // width + margin
        hammerLeftList: [3.5, 3.5 + 4.25 + 0.54 * 2, (4.25 + 0.54 * 2) * 3 - 3.5 - 3.1], // 2
        hammer: $('.hammer'),
        eggs: $('.main li'),
        playing: false
    }

    Config.eggs.on('click', function(e){
        e.stopPropagation();
        if (Config.playing) {
            return false;
        }
        Config.playing = true;
        var index = $(this).index();
        var css = {},
            cls = 'swinging_left';

        if (index < 3) {
            css.top = Config.hammerTopList[0] + 'rem';
            css.left = Config.hammerLeftList[index] + 'rem';
        } else if(index < 6){
            css.top = Config.hammerTopList[1] + 'rem';
            css.left = Config.hammerLeftList[index - 3] + 'rem';
        } else if(index < 9){
            css.top = Config.hammerTopList[2] + 'rem';
            css.left = Config.hammerLeftList[index - 6] + 'rem';
        }

        if (index === 2 || index === 5 || index === 8) {
            cls = 'swinging_right'
            css.transform = 'rotateY(180deg)';
        } else {
            css.transform = 'initial';
        }

        Config.hammer.css(css).fadeIn(100, function(){
            $(this).addClass(cls);
        });

        var jqThis = $(this);
        var timer = setTimeout(function(){
            jqThis.addClass('lie').find('> div').addClass('crack').on('animationend', function() {
                var jqThat = $(this);
                // timer = setTimeout(function(){
                    jqThat.removeClass('crack');
                    jqThis.fadeOut(10, function(){
                        $(this).removeClass('lie').addClass('sui').fadeIn(10, function(){
                            Config.page.suprise.fadeIn(1000, function() {
                                Config.playing = false;
                            });
                        });
                    });
                //     clearTimeout(timer);
                // }, 1000)
            });
        }, 1200)
        // setTimeout(function(){
        //     Config.hammer.removeClass('za2');
        // }, 0)
        // .on('animationend', function() {
        //     $(this).hide();
        // });


    })


    Config.hammer.on('animationend', function() {
        $(this).removeClass('swinging_left swinging_right').fadeOut(100);
    })

    Config.button['close'].on('click', function(e) {
        e.stopPropagation();
        jqFloat.hide();
        Config.eggs.removeClass(Config.class.EggBroken);
    })

    Config.button['ruler'].on('click', function(e) {
        e.stopPropagation();
        if (Config.playing) {
            return false;
        }
        Config.page['ruler'].show();
    })

    jqFloat.on('click', function(e){
        e.stopPropagation();
        if (Config.playing) {
            return false;
        }
        $(this).hide();
        Config.eggs.removeClass(Config.class.EggBroken);
    })
})
