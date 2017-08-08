/*
 * @file: 搜索请求结果类似 ^^^,^^^ 的数据的通用搜索
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.1/fangjiaSearch', [
    'dsy/search/1.2.1/interfaceSearch'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.1/interfaceSearch');

    function FangJiaSearch() {
        Search.call(this);
        this.tag = 'fangjia';
        this.suffix = '房价';
        this.init();
    }

    FangJiaSearch.prototype = Object.create(Search.prototype);
    FangJiaSearch.prototype.constructor = FangJiaSearch;

    FangJiaSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.fangjia;
        this.historyKey = this.getHistoryKey(this.tag);
    };

    FangJiaSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            key: opts.key || '',
            hrefUrl: opts.hrefUrl || '',
            district: opts.district || '',
            comerce: opts.comerce || '',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 西园^怀柔^怀柔^5402,福成五期^燕郊^燕郊^4995,天洋城^燕郊^燕郊^4762,芳园^丰台^青塔^4363,燕郊天洋城^燕郊^燕郊^4274,林肯公园^大兴^亦庄^4109,永定河孔雀城^北京周边^固安^4047,圆明园西路^海淀^圆明园^3921,北京像素^朝阳^常营^3841,中弘北京像素^朝阳^常营^38
    FangJiaSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var rows = data.split(','),
            html = '';
        var length = rows.length;
        that.hrefCode = '';
        if (length) {
            var row = [];
            for (var i = 0; i < length; i++) {
                row = rows[i].split('^');
                var obj = that.formatSearch({
                    key: row[0],
                    district: row[1],
                    comerce: row[2]
                }),
                tpl = that.tpl;

                tpl = tpl.replace('{{search_key}}', obj.key);
                tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
                tpl = tpl.replace('{{suggest_word}}', obj.key);
                tpl = tpl.replace('{{suggest_district}}', obj.district + ' ' + obj.comerce);

                var suggestCount = row[3];
                if (+suggestCount > 0) {
                    suggestCount = '约' + suggestCount + '条房源样本';
                } else {
                    suggestCount = '';
                }
                tpl = tpl.replace('{{suggest_count}}', suggestCount);
                html += tpl;
            }

            if (length === 1) {
                that.hrefCode = row[4];
            }
        }
        that.suggestHtml = html;
    };

    // 新需求：当搜索结果只有一个小区时，直接跳转小区房价详情页面；地址规则：fangjia.fang.com/process/city/ID.htm
    FangJiaSearch.prototype.searchByKey = function (key, data) {
        var that = this;
        var url = 'http://fangjia.fang.com/pinggu/ajax/searchtransfer.aspx';

        var cityName = vars.cityName;
        if (!cityName || '全国' === cityName) {
            cityName = '北京';
        }

        var cityCode = vars.cityCode;
        if (!cityCode || cityCode === 'quanguo') {
            cityCode = 'bj';
        }

        if (data && data.hrefUrl) {
            url = data.hrefUrl;
        } else if (key && key !== that.defaultText) {
            url = url + '?strcity=' + escape(cityName) + '&projname=' + escape(key);
            if (that.hrefCode) {
                url = 'http://fangjia.fang.com/process/' + cityCode + '/' + that.hrefCode + '.htm';
            }
        } else {
            url = url + '?strcity=' + escape(cityName);
        }

        vars.aHref.href = url;
        vars.aHref.click();

        var so = data;

        // 搜索只剩唯一一个小区
        if (that.hrefCode) {
            so = that.formatSearch({
                key: key,
                hrefUrl: url
            });
        } else if (!data) {
            so = that.formatSearch({
                key: key
            });
        }

        that.setHistory(key, so);
    };

    module.exports = new FangJiaSearch();
});
