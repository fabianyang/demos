/*
 * @file: 二手房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.0/haiwaiSearch', [
    'dsy/search/1.2.0/interfaceSearch'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.0/interfaceSearch');

    function HaiWaiSearch() {
        Search.call(this);
        this.tag = 'haiwai';
        this.suffix = '海外';
        this.init();
    }

    HaiWaiSearch.prototype = Object.create(Search.prototype);
    HaiWaiSearch.prototype.constructor = HaiWaiSearch;

    HaiWaiSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td></td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.haiwai;
        this.historyKey = this.getHistoryKey(this.tag);
    };

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
    HaiWaiSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var rows = data.split(','),
            html = '';

        if (rows.length) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i].split('^'),
                    tpl = that.tpl;

                var key = row[0],
                    url = row[3];

                var obj = that.formatSearch({
                    key: key,
                    district: row[1],
                    hrefUrl: url
                });

                var searchObject = JSON.stringify(obj);
                if (url) {
                    that.urlBackup(key, searchObject);
                }

                tpl = tpl.replace('{{search_key}}', obj.key);
                tpl = tpl.replace('{{search_object}}', searchObject);
                tpl = tpl.replace('{{suggest_word}}', obj.key);
                tpl = tpl.replace('{{suggest_district}}', obj.district);

                html += tpl;
            }
        }
        that.suggestHtml = html;
    };

    // window.clickHaiwaifangchan(e)
    HaiWaiSearch.prototype.searchByKey = function (pKey, data) {
        var that = this,
            key = pKey;
        var bu = that.backup[key],
            so = null;

        if (bu) {
            so = JSON.parse(bu);
        } else if (data) {
            so = data;
        } else {
            so = {
                new: true,
                key: key,
                hrefUrl: ''
            };
        }

        var url = so.hrefUrl;
        if (url) {
            url = 'http://world.fang.com/' + url;
        } else if (key && key !== that.defaultText) {
            url = 'http://world.fang.com/house/kw' + key;
        } else {
            url = 'http://world.fang.com/';
        }

        vars.aHref.href = url;
        vars.aHref.click();

        if (so.new) {
            so.hrefUrl = url;
        }
        that.setHistory(key, so);
    };

    module.exports = new HaiWaiSearch();
});
