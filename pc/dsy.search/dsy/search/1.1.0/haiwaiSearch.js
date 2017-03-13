/*
 * @file: 二手房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.1.0/haiwaiSearch', [
    'dsy/util/1.1.0/historyUtil'
], function (require, exports, module) {
    'use strict';
    var HistoryUtil = require('dsy/util/1.1.0/historyUtil');
    var vars = seajs.data.vars;

    function HaiWaiSearch() {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-url="{{search_url}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td></td>',
            '</tr>'
        ].join('');
        this.input = vars.searchInput;
        this.defaultText = vars.searchDefaultText.haiwai;
        this.backup = {};
        this.tag = 'haiwai';
        this.suffix = '海外';
        this.historyKey = vars.cityCode + this.tag + 'His';
    }

    HaiWaiSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            // 搜索词
            key: opts.key || '',
            // 搜索跳转 url
            hrefUrl: opts.hrefUrl || '',
            // 地区
            district: opts.district || '',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 美国 Montana^other county^866^us-Montana-other,美国 阿肯色州 墨尔本^Melbourne^583^AR-Melbourne,美国 肯塔基州 墨尔本^Melbourne^583^KY-Melbourne,澳大利亚 维多利亚州 墨尔本市^Melbourne^583^Australia_Victoria_Melbourne,美国 佛罗里达州 墨尔本^Melbourne^569^FL-Melbourne_City
    HaiWaiSearch.prototype.getSuggestList = function (data) {
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
            that.urlBackup(row[0], row[3]);
            var obj = that.formatSearch({
                key: row[0],
                district: row[1],
                hrefUrl: row[3]
            });

            tpl = tpl.replace('{{search_key}}', obj.key);
            tpl = tpl.replace('{{search_url}}', obj.hrefUrl);
            tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
            tpl = tpl.replace('{{suggest_word}}', obj.key);
            tpl = tpl.replace('{{suggest_district}}', obj.district);

            array.push(obj);
            html += tpl;
        }

        return {
            html: html,
            array: array
        };
    };

    HaiWaiSearch.prototype.urlBackup = function (key, url) {
        var that = this;
        if (url && !that.backup[key]) {
            that.backup[key] = url;
        }
    };

    // window.clickHaiwaifangchan(e)
    HaiWaiSearch.prototype.searchByKey = function (pKey, pUrl) {
        var that = this;
        var key = pKey,
            url = pUrl;
        url = that.backup[key];
        if (url) {
            url = 'http://world.fang.com/' + url;
        } else if (key && key !== that.defaultText) {
            url = 'http://world.fang.com/house/kw' + key;
        } else {
            url = 'http://world.fang.com/';
        }
        that.setHistory(key, url);

        vars.aHref.href = url;
        vars.aHref.click();
    };

    HaiWaiSearch.prototype.setHistory = function (key, url) {
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

    module.exports = new HaiWaiSearch();
});
