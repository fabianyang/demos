/*
 * @file: 新房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.1.0/jiajuSearch', [
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.0/historyUtil'
], function (require, exports, module) {
    'use strict';
    var util = require('dsy/util/1.1.0/util');
    var HistoryUtil = require('dsy/util/1.1.0/historyUtil');
    var vars = seajs.data.vars;

    function JiaJuSearch() {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-url="{{search_url}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}</p></th>',
            '<td></td>',
            '</tr>'
        ].join('');
        this.input = vars.searchInput;
        this.defaultText = vars.searchDefaultText.jiaju;
        this.backup = {};
        this.tag = 'jiaju';
        this.suffix = '家居';
        this.historyKey = vars.cityCode + this.tag + 'His';
    }

    JiaJuSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            // 搜索词
            key: opts.key || '',
            // 广告跳转 url
            adUrl: opts.adUrl || '',
            // 搜索跳转 url
            hrefUrl: opts.hrefUrl || '',
            // 地区
            district: opts.district || '',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 铝镁合金开关^http://mshow.fang.com/c?z=fang&la=0&si=206&cg=2557&c=102046&ci=111955&or=2532&l=58284&bg=58287&b=54038&u=http://home.sh.fang.com/news/2016-07-01/21823684.htm,1
    JiaJuSearch.prototype.setAdvert = function (data) {
        var that = this;
        var rows = data.split(','),
            input = that.input;
        var length = rows.length;
        if (!length) {
            input.val(that.defaultText);
            return false;
        }
        var row = rows[parseInt(Math.random() * (length - 1))].split('^');
        // var obj = that.formatSearch({
        //     key: row[0],
        //     adUrl: row[3]
        // });
        // input.attr('data-search', obj).val(obj.key);
        that.urlBackup(row[0], row[1], 'ad');
        input.val(row[0]);
        return true;
    };

    // '西式古典^http://home.fang.com/zhuangxiu/case___________%ce%f7%ca%bd%b9%c5%b5%e4/#sortCom?utm_source=sousuokuang ,混搭风格^http://home.fang.com/zhuangxiu/case___________%bb%ec%b4%ee%b7%e7%b8%f1/#sortCom?utm_source=sousuokuang ,户型图^http://home.fang.com/zhuangxiu/case___________%bb%a7%d0%cd%cd%bc/#sortCom?utm_source=sousuokuang ,衣帽间^http://home.fang.com/zhuangxiu/case___________%d2%c2%c3%b1%bc%e4/#sortCom?utm_source=sousuokuang ,简欧风格^http://home.fang.com/zhuangxiu/case___________%bc%f2%c5%b7%b7%e7%b8%f1/#sortCom?utm_source=sousuokuang ,儿童房^http://home.fang.com/zhuangxiu/case___________%b6%f9%cd%af%b7%bf/#sortCom?utm_source=sousuokuang ,客厅^http://home.fang.com/zhuangxiu/case___________%bf%cd%cc%fc/#sortCom?utm_source=sousuokuang ,一居室^http://home.fang.com/zhuangxiu/case___________%d2%bb%be%d3%ca%d2/#sortCom?utm_source=sousuokuang ,卧室^http://home.fang.com/zhuangxiu/case___________%ce%d4%ca%d2/#sortCom?utm_source=sousuokuang ,餐厅^http://home.fang.com/zhuangxiu/case___________%b2%cd%cc%fc/#sortCom?utm_source=sousuokuang '
    JiaJuSearch.prototype.getSuggestList = function (data) {
        var that = this;
        var rows = data.split(',');
        if (!rows.length) {
            return false;
        }

        var array = [],
            html = '';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i].split('^'),
                tpl = that.tpl;
            that.urlBackup(row[0], row[1]);
            var obj = that.formatSearch({
                key: row[0],
                hrefUrl: row[1]
            });

            tpl = tpl.replace('{{search_key}}', obj.key);
            tpl = tpl.replace('{{search_url}}', obj.hrefUrl);
            tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
            tpl = tpl.replace('{{suggest_word}}', obj.key);

            array.push(obj);
            html += tpl;
        }

        return {
            html: html,
            array: array
        };
    };

    JiaJuSearch.prototype.urlBackup = function (key, url, prop) {
        var that = this;
        if (url && !that.backup[key]) {
            that.backup[key] = {
                url: url,
                prop: prop
            };
        }
    };

    // window.clickZhuangxiu(e, jiaUrl)
    JiaJuSearch.prototype.searchByKey = function (pKey, pUrl) {
        var that = this;
        var key = pKey,
            url = pUrl,
            prop = '';
        var bu = that.backup[key];
        if (bu) {
            url = bu.url;
            prop = bu.prop;
        }
        if (url) {
            url = url.replace(/\&amp;/g, '&');
        } else if (key && key !== that.defaultText) {
            url = 'http://home.fang.com/album/search/?page=1&sortid=11&keyword=' + util.encode(key);
        } else {
            url = 'http://home.fang.com/album/search/?page=1&sortid=11';
        }

        vars.aHref.href = url;
        vars.aHref.click();

        // 手动搜索 u 参数，后面为真正的跳转地址
        url = that.replaceUrlArg(url);
        that.setHistory(key, url);
    };

    JiaJuSearch.prototype.setHistory = function (key, url) {
        var that = this;
        // 一般不会传入 void key, 以防万一
        if (key && key !== that.defaultText) {
            HistoryUtil.setHistory(that.historyKey, {
                key: key,
                hrefUrl: url,
                tag: that.tag,
                suffix: that.suffix
            });
        }
    };

    JiaJuSearch.prototype.replaceUrlArg = function (pUrl) {
        var url = $.trim(pUrl);
        var pattern = 'u=http:([^&]*)';
        if (url.match(pattern)) {
            url = 'http:' + url.match(pattern)[1].trim();
        }
        return url;
    };

    module.exports = new JiaJuSearch();
});
