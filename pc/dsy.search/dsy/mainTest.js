/*
 * @file: main
 * @author: yangfan
 * @Create Time: 2016-05-31 15:30:35
 */
define('dsy/mainTest', [
    'dsy/search/searchTest'
], function (require) {
    'use strict';
    var ie = (function () {
        var userAgent = navigator.userAgent;
        var ua = userAgent.toLowerCase();
        var rMsie = /(msie\s|trident\/7)([\w.]+)/;
        var rTrident = /(trident)\/([\w.]+)/;
        var matchBS = rMsie.exec(ua);
        if (matchBS !== null) {
            var matchBS2 = rTrident.exec(ua);
            if (matchBS2 !== null) {
                switch (matchBS2[2]) {
                    case '4.0':
                        return { browser: 'IE', version: '8' };
                        break;
                    case '5.0':
                        return { browser: 'IE', version: '9' };
                        break;
                    case '6.0':
                        return { browser: 'IE', version: '10' };
                        break;
                    case '7.0':
                        return { browser: 'IE', version: '11' };
                        break;
                    default:
                        return { browser: 'IE', version: 'undefined' };
                }
            } else
                return { browser: 'IE', version: matchBS[2] || '0' };
        }
    })();
    if (ie && ie.version - 0 > 9) {
        var n = document.createElement('style'),
            str = '::-ms-clear, ::-ms-reveal{display: none;}';
        n.type = 'text/css';
        // ie下
        if (n.styleSheet) {
            n.styleSheet.cssText = str;
        } else {
            n.innerHTML = str;
        }
        document.getElementsByTagName('head')[0].appendChild(n);
    } else {
        if (!('placeholder' in document.createElement('input'))) {
            $('input[placeholder]').each(function () {
                var $this = $(this),
                    text = $this.attr('placeholder');
                if ($this.val() === '') {
                    $this.val(text).addClass('placeholder');
                }
                $this.focus(function () {
                    if ($this.val() === text) {
                        $this.val('').removeClass('placeholder');
                    }
                }).blur(function () {
                    if ($this.val() === '') {
                        $this.val(text).addClass('placeholder');
                    }
                });
            });
        }
    }

    var Search = require('dsy/search/searchTest');

    // 大首页大搜索执行初始化
    Search.setRequestParam({
        atype: 4,
        city: escape(window.SFSF.city)
    });
    Search.menu = window.SFSF.menu;
    Search.setMxTimeTag = function () {
        var nextTimeTag = window.mxfTimeTag + 1;
        window.mxfTimeTag = nextTimeTag;
    };
    Search.getMxTimeTag = function () {
        return window.mxfTimeTag;
    };
    Search.inputDom = document.getElementById(Search.inputSelector.substr(1));
    Search.dropdown = function (args) {
        window.SFSF.makeMenu.apply(window.SFSF, args);
        this.wrapper.find('table').width(this.wrapper.find('.paneltable').width());
    };
    Search.setRequestUrl(window.SFSF.info[window.SFSF.city].house.suggest_url + '?t=' + Math.random());
    Search.init();

    // return search;
});
