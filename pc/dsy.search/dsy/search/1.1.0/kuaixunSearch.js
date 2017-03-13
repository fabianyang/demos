/*
 * @file: 搜索请求结果类似 ^^^,^^^ 的数据的通用搜索
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.1.0/kuaixunSearch', [
    'dsy/util/1.1.0/historyUtil'
], function (require, exports, module) {
    'use strict';

    var HistoryUtil = require('dsy/util/1.1.0/historyUtil');
    var vars = seajs.data.vars;

    function KuaiXunSearch() {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.input = vars.searchInput;
        this.defaultText = vars.searchDefaultText.kuaixun;
        this.defaultHref = vars.searchDefaultHref.kuaixun;
        this.tag = 'kuaixun';
        this.suffix = '快讯';
        this.historyKey = vars.cityCode + this.tag + 'His';
    }

    KuaiXunSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            key: opts.key || '',
            district: opts.district || '',
            comerce: opts.comerce || '',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    KuaiXunSearch.prototype.getSuggestList = function (data) {
        var that = this;
        var rows = data.split(',');

        if (!rows.length) {
            return false;
        }

        var array = [],
            html = '';
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i].split('^'),
                tpl = that.tpl;
            var obj = that.formatSearch({
                key: row[0],
                district: row[1],
                comerce: row[2]
            });

            tpl = tpl.replace('{{search_key}}', obj.key);
            tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
            tpl = tpl.replace('{{suggest_word}}', obj.key);
            tpl = tpl.replace('{{suggest_district}}', obj.district + ' ' + obj.comerce);

            var suggestCount = row[3];
            if (+suggestCount) {
                suggestCount = '约' + suggestCount + '条房源样本';
            }
            tpl = tpl.replace('{{suggest_count}}', suggestCount);

            array.push(obj);
            html += tpl;
        }

        return {
            html: html,
            array: array
        };
    };

    // window.clickFangchankuaixun(e)
    KuaiXunSearch.prototype.searchByKey = function (key) {
        var that = this;
        var url = that.defaultHref;
        var cityName = vars.cityName,
            type = encodeURI(encodeURI('资讯')),
            fld = encodeURI(encodeURI('全文')),
            time = encodeURI(encodeURI('不限时间')),
            sort = encodeURI(encodeURI('相关度'));

        if (!cityName && '全国' === cityName) {
            cityName = '北京';
        }

        if (key && key !== that.defaultText) {
            url = 'http://news.fang.com/s/zx_' + encodeURI(encodeURI(key)) + '_' + type + '_' + fld + '_' + time + '_' + sort + '_' + encodeURI(encodeURI(cityName)) + '_1.html';
        }

        that.setHistory(key, url);

        vars.aHref.href = url;
        vars.aHref.click();
    };

    KuaiXunSearch.prototype.setHistory = function (key, url) {
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

    module.exports = new KuaiXunSearch();
});
