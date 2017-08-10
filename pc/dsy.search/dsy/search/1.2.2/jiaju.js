/*
 * @file: 新房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.2/jiaju', [
    'dsy/search/1.2.2/interface'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.2/interface');

    function JiaJuSearch() {
        Search.call(this);
        this.tag = 'jiaju';
        this.suffix = '家居';
        this.init();
    }

    JiaJuSearch.prototype = Object.create(Search.prototype);
    JiaJuSearch.prototype.constructor = JiaJuSearch;

    JiaJuSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}</p></th>',
            '<td>{{adImg}}</td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.jiaju;
        this.historyKey = this.getHistoryKey(this.tag);
    };

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
            store: opts.store || '1',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 广告：铝镁合金开关^http://mshow.fang.com/c?z=fang&la=0&si=206&cg=2557&c=102046&ci=111955&or=2532&l=58284&bg=58287&b=54038&u=http://home.sh.fang.com/news/2016-07-01/21823684.htm,1
    // '西式古典^http://home.fang.com/zhuangxiu/case___________%ce%f7%ca%bd%b9%c5%b5%e4/#sortCom?utm_source=sousuokuang ,混搭风格^http://home.fang.com/zhuangxiu/case___________%bb%ec%b4%ee%b7%e7%b8%f1/#sortCom?utm_source=sousuokuang ,户型图^http://home.fang.com/zhuangxiu/case___________%bb%a7%d0%cd%cd%bc/#sortCom?utm_source=sousuokuang ,衣帽间^http://home.fang.com/zhuangxiu/case___________%d2%c2%c3%b1%bc%e4/#sortCom?utm_source=sousuokuang ,简欧风格^http://home.fang.com/zhuangxiu/case___________%bc%f2%c5%b7%b7%e7%b8%f1/#sortCom?utm_source=sousuokuang ,儿童房^http://home.fang.com/zhuangxiu/case___________%b6%f9%cd%af%b7%bf/#sortCom?utm_source=sousuokuang ,客厅^http://home.fang.com/zhuangxiu/case___________%bf%cd%cc%fc/#sortCom?utm_source=sousuokuang ,一居室^http://home.fang.com/zhuangxiu/case___________%d2%bb%be%d3%ca%d2/#sortCom?utm_source=sousuokuang ,卧室^http://home.fang.com/zhuangxiu/case___________%ce%d4%ca%d2/#sortCom?utm_source=sousuokuang ,餐厅^http://home.fang.com/zhuangxiu/case___________%b2%cd%cc%fc/#sortCom?utm_source=sousuokuang '
    JiaJuSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var rows = data.split(','),
            suggestHtml = '',
            advertHtml = '';
        if (rows.length) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i].split('^'),
                    tpl = that.tpl;
                var key = row[0],
                    url = row[1];

                var adUrl = /^http:\/\/mshow\.fang\.com.*&u=/.test(url) ? that.replaceUrlArg(url) : '';
                var obj = that.formatSearch({
                    key: key,
                    hrefUrl: url,
                    adUrl: adUrl,
                    store: adUrl ? '0' : '1'
                });

                var searchObject = JSON.stringify(obj);
                if (url) {
                    that.urlBackup(key, searchObject);
                }

                tpl = tpl.replace('{{search_key}}', obj.key);
                tpl = tpl.replace('{{search_object}}', searchObject);
                tpl = tpl.replace('{{suggest_word}}', obj.key);
                tpl = tpl.replace('{{adImg}}', adUrl ? that.advertImage : '');

                if (adUrl) {
                    advertHtml += tpl;
                } else {
                    suggestHtml += tpl;
                }
            }
        }
        if (advertHtml) {
            that.advertHtml = advertHtml;
        }
        that.suggestHtml = suggestHtml;
    };

    // window.clickZhuangxiu(e, jiaUrl)
    JiaJuSearch.prototype.searchByKey = function (pKey, data) {
        var that = this,
            key = pKey;
        var bu = that.backup[key],
            json = null;

        if (bu) {
            json = JSON.parse(bu);
        } else if (data) {
            json = data;
        }

        var url = json ? json.hrefUrl : '';
        if (url) {
            url = url.replace(/\&amp;/g, '&');
        } else if (key && key !== that.defaultText) {
            url = 'http://home.fang.com/album/search/?page=1&sortid=11&keyword=' + that.encode(key);
        } else {
            url = 'http://home.fang.com/album/search/?page=1&sortid=11';
        }

        this.openUrl(key, url);

        if (!json) {
            json = that.formatSearch({
                key: key,
                hrefUrl: url
            });
        }

        // 20160803 广告不记录历史记录，为了排重
        // 暂时有链接的也不记录广告
        if (+json.store) {
            that.setHistory(key, json);
        }

        // 手动搜索 u 参数，后面为真正的跳转地址
        // url = that.replaceUrlArg(url);
    };

    module.exports = new JiaJuSearch();
});
