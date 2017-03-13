/**
 * Created by css on 2016/4/15.
 */
$(function (){
    'use strict';
    var $kcity = $('#kcity_js');
    var $ksd = $('#ksd_js');
    var $jcity = $('#jcity_js');
    var $jsd = $('#jsd_js');
    var $kUl = $('#k_ul_js');
    var $jUl = $('#j_ul_js');

    var win = $(window);
    var winH = win.height();
    var $htmlBody = $('html,body');
    var phoneTypeStr = navigator.userAgent;
    win.on('resize',function () {
        if (win.height() < winH) {
            phoneTypeStr = phoneTypeStr.toLocaleLowerCase();
            if(phoneTypeStr.indexOf('huaweip6') > 0){
                // 此为华为p6 不做处理
            } else {
                $htmlBody.css({
                    transform: 'translateY(-150px)',
                    transition: '.1s all linear'
                });
            }

        }else {
            $htmlBody.css({
                transform: 'none',
                transition: '.1s all linear'
            });
        }
    });

    // 城市输入信息
    var kjcityVal = '';

    var resHtml='';
    var datalen = 0;
    // 模糊查询城市
    function queryCity(citystr, tUl, tCityPara) {
        citystr = encodeURIComponent(encodeURIComponent(citystr));
        // var url='/activity.d?m=getCityWithCode&cityName=' + citystr;
        var url='http://m.fang.com/activity.d?m=getCityWithCode&cityName=' + citystr;
        $.ajax({
            type: 'GET',
            url: url,
            timeout:2000,
            cache: false,
            dataType : 'json',
            async: false,
            success: function(data){
                resHtml = '';
                datalen =  data.length;
                for(var i = 0;i < datalen; i++) {
                    resHtml+=('<li enName=\''+data[i][1]+'\'>'+data[i][0]+'</li>');
                }
                tUl.html(resHtml);
                tUl.removeClass('none');
                // 城市完全匹配情况下，直接选中
                if(datalen === 1) {
                    tCityPara.val(data[0][1]);
                }
            }
        });
    }

    // 输入选择开始城市
    $kcity.on('input focus', function (){
        kjcityVal = $kcity.val();
        if (kjcityVal.trim()){
            queryCity(kjcityVal.trim(), $kUl, $ksd);
        } else {
            $kcity.val('');
            $ksd.val('');
            $kUl.addClass('none');
        }
    });

    // li上选择开始城市
    $kUl.on('click', 'li', function (){
        $kcity.val($(this).html());
        $ksd.val($(this).attr('enname'));
        $kUl.addClass('none');
    });

// -----------------------------------------------------------------------------
    // 输入选择目的城市
    $jcity.on('input focus', function (){
        kjcityVal = $jcity.val();
        if (kjcityVal.trim()){
            queryCity(kjcityVal.trim(), $jUl, $jsd);
        } else {
            $jcity.val('');
            $jsd.val('');
            $jUl.addClass('none');
        }
    });

    // li上选择目的城市
    $jUl.on('click', 'li', function (){
        $jcity.val($(this).html());
        $jsd.val($(this).attr('enname'));
        $jUl.addClass('none');
    });

    // '开启奇幻之旅' 按钮 点击事件
    $('#go_but_js').on('click', function (){
        var ksEnCity = $ksd.val();
        var jsEnCity = $jsd.val();
        if (ksEnCity && jsEnCity) {
            // window.location.href = 'huodongAC.d?m=goTravel&class=TravelWithHousePriceHc&startEnCity='
            //     + ksEnCity + '&endEnCity=' + jsEnCity;
            window.location.href = 'two.html?startEnCity=' + ksEnCity + '&endEnCity=' + jsEnCity; // 传递的为写死的坐标 隐藏的 input 北京 -> 哈尔宾
        } else {
            alert('请确认正确选择了城市！');
        }
    });

    var eventIdstr = '';
    var eventClastr = '';
    $(document).on('click', function (event){
        eventIdstr = $(event.target).attr('id');
        eventClastr = $(event.target).attr('class');
        setTimeout(function () {
            if(eventIdstr !== 'kcity_js' && eventClastr !== 'select_proj'){
                $kUl.addClass('none');
            }
            if(eventIdstr !== 'jcity_js' && eventClastr !== 'select_proj'){
                $jUl.addClass('none');
            }
        },200);
    });

    $('.z_top,.zo_mid,.s_xinxin').on('click', function (){
        $kUl.addClass('none');
        $jUl.addClass('none');
    });

// ----------------

});
