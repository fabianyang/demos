/*
 * @file: 搜索请求结果类似 ^^^,^^^ 的数据的通用搜索
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.1.1/fangjiaSearch', [
    'dsy/search/1.1.1/interfaceSearch'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.1.1/interfaceSearch');

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
        if (rows.length) {
            for (var i = 0; i < rows.length; i++) {
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
                html += tpl;
            }
        }
        that.suggestHtml = html;
    };

    // window.PingGus(e)
    FangJiaSearch.prototype.searchByKey = function (key) {
        var that = this;
        var url = 'http://fangjia.fang.com/pinggu/ajax/searchtransfer.aspx';

        var cityName = vars.cityName;
        if (!cityName && '全国' === cityName) {
            cityName = '北京';
        }

        if (key && key !== that.defaultText) {
            url = url + '?strcity=' + escape(cityName) + '&projname=' + escape(key);
        } else {
            url = url + '?strcity=' + escape(cityName);
        }

        var so = that.formatSearch({
            key: key,
            hrefUrl: url
        });

        vars.aHref.href = url;
        vars.aHref.click();

        that.setHistory(key, so);
    };

    module.exports = new FangJiaSearch();
});
