/*
 * @file: index
 * @author: yangfan
 * @Create Time: 2016-06-03 10:31:17
 */
$(function () {
    'use strict';
    var coupon = $('.js_coupon').data({
        nick: 'voucher',
        src2: 'images/get01.png',
        src1: 'images/get02.png'
    });
    var gift = $('.js_gift').data({
        nick: 'homeVoucher',
        src2: 'images/get03.png',
        src1: 'images/get04.png'
    });
    var cover = $('.shade'),
        freezePage = false,
        loginBox = $('.opencon'),
        promptBox = $('.tsBox');

    var voucher = $('#voucher'),
        homeVoucher = $('#homeVoucher'),
        status = $('#status'),
        mFtpPath = $('#mFtpPath');

    if (status.val() && !isNaN(+status.val())) {
        window.location.reload();
        return false;
    }

    function init() {
        coupon.find('img').attr('src', mFtpPath.val() + coupon.data()['src' + voucher.val()]);
        gift.find('img').attr('src', mFtpPath.val() + gift.data()['src' + homeVoucher.val()]);
        coverHide();
    }
    init();

    coupon.on('click', function () {
        receiveAward($(this));
    });

    gift.on('click', function () {
        receiveAward($(this));
    });

    function receiveAward($obj) {
        var nick = $obj.data().nick;
        cover.data('nick', nick);
        if (status.val() === 'off') {
            coverShow(loginBox);
            return false;
        }
        if ($('#' + nick).val() === '1') {
            var str = '您已经领取过了！';
            if (nick === 'homeVoucher') {
                str = '您已经领取过了，登陆房天下账户即可查看！';
            }
            showMsg(str);
            // coverShow(
            //     promptBox.css({
            //         position: 'absolute',
            //         height: $(document).height() * 3 / 4 - $(window).scrollTop(),
            //         marginTop: '-115px'
            //     })
            // );
            return false;
        }
        requestAjax();
        return false;
    }

    function requestAjax() {
        var nick = cover.data().nick;
        var url = 'http://' + window.location.hostname + '/huodongAC.d?m=getVoucher&class=CarvinalHc&type=' + nick;
        $.get(url, function (data) {
            console.log(data);
            var dataRoot = JSON.parse(data).root;
            if (dataRoot.code === '0') {
                updatePageStatus(nick, '1');
            } else if (dataRoot.code === '1') {
                updatePageStatus(nick, '1');
                var str = '您已经领取过了！';
                if (nick === 'homeVoucher') {
                    str = '您已经领取过了，登陆房天下账户即可查看！';
                }
                showMsg(str);
            } else {
                showMsg('优惠券确认没领过吗？那您的网络不太给力哦！');
            }
            init();
        });
    }

    function updatePageStatus(nick, code) {
        if (nick === 'voucher') {
            voucher.val(code);
            coupon.find('img').attr('src', mFtpPath.val() + coupon.data()['src' + voucher.val()]);
        }
        if (nick === 'homeVoucher') {
            homeVoucher.val(code);
            gift.find('img').attr('src', mFtpPath.val() + gift.data()['src' + homeVoucher.val()]);
            showMsg('领取成功，登陆房天下账户即可查看！');
        }
    }

    cover.on('click', function (e) {
        var $target = $('.js_login, .js_sms_phone, .js_sms_code, .js_sms_btn');
        if ($target.is(e.target) || $target.has(e.target).length) {
            return false;
        }
        coverHide();
        return false;
    });

    /**
     * 显示浮层
     */
    function coverShow(box) {
        var htmlHeight = $(document).height();
        cover.css('position', 'absolute').height(htmlHeight).show();
        box.css('top', $(window).scrollTop() + htmlHeight / 4).show();
        freezePage = true;
    }

    /**
     * 关闭对话框
     */
    function coverHide() {
        cover.hide().find('>div').hide();
        freezePage = false;
    }

    /**
     * 根据冻结页面标识，判断页面是否可以滑动
     */
    $(document).on('touchmove', function (e) {
        if (freezePage) {
            e.preventDefault();
        }
    });

    /**
     *  发送验证码部分
        phoneRegEx 电话号码正则,
        allowGet 可以请求短信验证码标识,
        smsLogin 短信验证码 js 对象,
        smsTimer 请求 timer ,
        smsDelay 请求间隔,
        smsPhone 电话号码输入框 jq 对象,
        smsBtn 发送验证码 jq 对象,
        smsPhoneValue 电话号码值,
        smsCode 验证码输入框 jq 对象,
        smsCodeValue 验证码值,
        loginBtn 登录按钮 jq 对象;
     */
    var phoneRegEx = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/i,
        allowGet = true,
        smsLogin = window.smsLogin,
        smsTimer = null,
        smsDelay = 60,
        smsPhone = $('.js_sms_phone'),
        smsBtn = $('.js_sms_btn'),
        smsPhoneValue = '',
        smsCode = $('.js_sms_code'),
        smsCodeValue = '',
        loginBtn = $('.js_login');

    /**
     * 更新验证码倒计时时间
     * 1、更改是否可以请求验证码标识
     * 2、更改倒计时时间
     * 3、重置时间、状态等
     */
    function updateSmsDelay() {
        allowGet = false;
        smsBtn.html(getDelayText(smsDelay));
        clearInterval(smsTimer);
        smsTimer = setInterval(function () {
            smsDelay--;
            smsBtn.html(getDelayText(smsDelay));
            if (smsDelay < 0) {
                clearInterval(smsTimer);
                smsBtn.html('发送验证码');
                smsDelay = 60;
                allowGet = true;
            }
        }, 1000);

        function getDelayText(second) {
            return '重新发送(' + (100 + second + '').substr(1) + ')';
        }
    }

    /**
     * 点击请求验证码按钮，根据状态给予相应提示
     * 最后发送验证码，成功，防止恶意请求，延迟一分钟倒计时。失败，提示。
     */
    smsBtn.on('click', function () {
        if (!allowGet) {
            showMsg('请一分钟以后再试');
            return false;
        }
        smsPhoneValue = smsPhone.val().trim();

        if (!smsPhoneValue) {
            showMsg('手机号不能为空');
            return false;
        }

        if (!phoneRegEx.test(smsPhoneValue)) {
            showMsg('手机号格式不正确');
            return false;
        }

        smsLogin.send(smsPhoneValue, function () {
            showMsg('验证码已发送,请注意查收');
            updateSmsDelay();
        }, function (err) {
            showMsg(err);
        });
        return false;
    });

    /**
     * 点击登录按钮，根据状态给予提示
     * 最后检查验证码，登录成功，跳转，或提示错误信息。
     */
    loginBtn.on('click', function () {
        smsPhoneValue = smsPhone.val().trim();
        if (!smsPhoneValue || !phoneRegEx.test(smsPhoneValue)) {
            showMsg('手机号为空或格式不正确');
            return false;
        }
        smsCodeValue = smsCode.val().trim();
        if (!smsCodeValue || smsCodeValue.length < 4) {
            showMsg('验证码为空或格式不正确');
            return false;
        }
        smsLogin.check(smsPhoneValue, smsCodeValue, function () {
            // 登录成功，状态设置为数字1
            status.val(1);
            showMsg('登录成功', requestAjax());
        }, function (err) {
            showMsg(err);
        });
        return false;
    });

    /**
     * 进行跳转，避免读取缓存。
     */
    function urlReload(url) {
        window.location.href = window.location.protocol + '//' + window.location.hostname + url + '&r=' + Math.random();
    }

    /**
     * 信息弹层
     * @param text 文本内容
     * @param time 显示时间
     * @param callback 回调函数
     */
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
});
