$(function () {
    'use strict';
    var freezePage = false;

    var isLogin = $('#isLogin'),
        surplusPlayCount = $('#surplusPlayCount'),
        noWinReason = $('#noWinReason');

    var surplusTimes = $('.surplus-times'),
        pop = $('.pop');

    var ruleBox = pop.eq(1),
        noChargeCount = pop.eq(0),
        noPlayCount = pop.eq(2);

    var fflUrl = 'http://' + window.location.hostname + '/huodongAC.d?class=FanfanleHc&m=getLotteryInfo&lotteryId=' + $.trim($('#lotteryId').val());
    var loginUrl = 'https://passporttest.fang.com/passport/login.aspx?burl=' + encodeURIComponent(fflUrl);

    if ($.trim(isLogin.val()) === '0') {
        surplusTimes.html('<a href="' + loginUrl + '">登录查看抽奖机会</a>');
    } else if ($.trim(isLogin.val()) === '1') {
        surplusTimes.html('你有<strong>' + $.trim(surplusPlayCount.val()) + '</strong>次抽奖机会');
    }

    $('#choujiang').on('click', function () {
        if ($.trim(isLogin.val()) === '0') {
            window.location.href = loginUrl;
            return false;
        }

        // 没有充值次数，显示 0 次逻辑，弹出提示框
        if (noWinReason.val() === 'noChargeCount') {
            noChargeCount.show();
            freezePage = true;
            return false;
        }

        if (noWinReason.val() === 'noPlayCount') {
            noPlayCount.show();
            freezePage = true;
            return false;
        }

        window.location.href = fflUrl;
        return false;
    });

    $('.rules').on('click', function () {
        ruleBox.show();
        freezePage = true;
    });

    $('.close').click(function () {
        $(this).parents('.pop').hide();
        freezePage = false;
    });

    $(document).on('touchmove', function (e) {
        if (freezePage) {
            e.preventDefault();
        }
    });
});
