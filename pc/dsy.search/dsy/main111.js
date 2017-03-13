/*
 * @file: main
 * @author: yangfan
 * @Create Time: 2016-05-31 15:30:35
 */
define('dsy/main111', [
    'jquery',
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.1/historyUtil',
    'dsy/search/1.1.1/interfaceSearch',
    'dsy/search/1.1.1/searchNavigate',
    'dsy/search/1.1.1/xfSearch',
    'dsy/search/1.1.1/esfSearch',
    'dsy/search/1.1.1/zfSearch',
    'dsy/search/1.1.1/jiajuSearch',
    'dsy/search/1.1.1/kuaixunSearch',
    'dsy/search/1.1.1/fangjiaSearch',
    'dsy/search/1.1.1/haiwaiSearch',
    'dsy/search/1.1.1/homeSearch'
], function (require) {
    'use strict';
    var cityName = $('#dsy_D01_17 .s4Box a').text();
    var seajs = window.seajs;
    seajs.data.vars = {
        requestNumber: window.mxfTimeTag,
        cityCode: window.cityCode,
        cityName: cityName,
        sfsf: {
            city: escape(window.SFSF.city),
            url: window.SFSF.info[window.SFSF.city].house.suggest_url + '?t=' + Math.random()
        },
        aHref: document.getElementById('pinggu'),
        getRequestNumber: function () {
            return window.mxfTimeTag;
        },
        setRequestNumber: function () {
            var nextTimeTag = window.mxfTimeTag + 1;
            window.mxfTimeTag = nextTimeTag;
        },
        getAdvertUrl: function (key) {
            return $('#xinfangList li[id="' + key + '"]').html();
        }
    };

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
        if (n.styleSheet) {
            n.styleSheet.cssText = str;
        } else {
            n.innerHTML = str;
        }
        document.getElementsByTagName('head')[0].appendChild(n);
    }

    seajs.data.vars.vwg = 'dsy_D02_02';
    var Search = require('dsy/search/1.1.1/homeSearch');
    Search.dropdown = function (html) {
        window.SFSF.makeMenu.apply(window.SFSF, [document.getElementById('projnames'), window.SFSF.menu, html]);
        $('#SFmenu').find('table').width($('#SFmenu').find('.paneltable').width());
    };
    Search.init();

    _ub.city = cityName;
    _ub.request('vwg.business', function () {
        _ub.load(2);
        var vwg = _ub['vwg.business'];
        console.log(vwg);
        if (vwg) {
            vwg = {
                N: 'dsy_D02_02',
                E: 'dsy_D02_03',
                Z: 'dsy_D02_04',
                H: 'dsy_D02_05',
                I: 'dsy_D02_06',
                W: 'dsy_D02_20',
                V: 'dsy_D02_19'
            }[vwg];
        } else {
            vwg = 'dsy_D02_19';
        }
        // 初始化 searchTag
        Search.initTag(vwg);
    });


});
