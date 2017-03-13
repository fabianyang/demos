/*
 * @file: 二手房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.1.0/esfSearch', [
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.0/historyUtil'
], function (require, exports, module) {
    'use strict';

    var util = require('dsy/util/1.1.0/util');
    var HistoryUtil = require('dsy/util/1.1.0/historyUtil');
    var vars = seajs.data.vars;

    function ESFSearch() {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.input = vars.searchInput;
        this.defaultText = vars.searchDefaultText.esf;
        this.defaultHref = vars.searchDefaultHref.esf;
        this.tag = 'esf';
        this.suffix = '二手房';
        this.historyKey = vars.cityCode + this.tag + 'His';
    }

    ESFSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            key: opts.key || '',
            hrefUrl: opts.hrefUrl || '',
            district: opts.district || '',
            tag: that.tag,
            suffix: that.suffix,
            category: opts.category || '',
            id: opts.id || '',
            comerce: opts.comerce || '',
            purpose: opts.purpose || ''
        };
    };

    // {"hit":[
    // {"category":"6","id":"1","projname":"朝阳二手房","district":"朝阳","comerce":"","purpose":"住宅,别墅,用户词,学校","countinfo":"260639","esfcount":"260639","rentcount":"112731"
    // },{"category":"6","id":"0","projname":"海淀二手房","district":"海淀","comerce":"","purpose":"住宅,别墅,用户词,学校","countinfo":"120634","esfcount":"120634","rentcount":"63839"
    // },{"category":"6","id":"12","projname":"昌平二手房","district":"昌平","comerce":"","purpose":"住宅,别墅,用户词,学校","countinfo":"76954","esfcount":"76954","rentcount":"20731"
    // }],"history":""}
    // {"hit":[{"category":"1","id":"1010083960","projname":"朝阳旺角","district":"朝阳","comerce":"双桥","purpose":"住宅","countinfo":"192","esfcount":"192","rentcount":"28"
    // },{"category":"1","id":"1010083960","projname":"朝阳旺角-一居","district":"朝阳","comerce":"双桥","purpose":"住宅","countinfo":"192","esfcount":"29","rentcount":"4"
    // },{"category":"1","id":"1010083960","projname":"朝阳旺角-二居","district":"朝阳","comerce":"双桥","purpose":"住宅","countinfo":"192","esfcount":"89","rentcount":"1"
    // },{"category":"1","id":"1010083960","projname":"朝阳旺角-三居","district":"朝阳","comerce":"双桥","purpose":"住宅","countinfo":"192","esfcount":"75","rentcount":"13"
    // },{"category":"1","id":"1010083960","projname":"朝阳旺角-四居","district":"朝阳","comerce":"双桥","purpose":"住宅","countinfo":"192","esfcount":"0","rentcount":"2"
    // }],"history":""}
    ESFSearch.prototype.getSuggestList = function (data) {
        var that = this;
        var json = JSON.parse(data);
        var rows = json.hit;

        if (!rows.length) {
            return false;
        }

        var array = [],
            html = '';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i],
                tpl = that.tpl;
            if (row.esfcount === '0') {
                continue;
            }
            var obj = that.formatSearch({
                key: row.projname,
                district: row.district,
                category: row.category,
                id: row.id,
                comerce: row.comerce,
                purpose: row.purpose
            });

            tpl = tpl.replace('{{search_key}}', obj.key);
            tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
            tpl = tpl.replace('{{suggest_word}}', obj.key);
            tpl = tpl.replace('{{suggest_district}}', obj.district + ' ' + obj.comerce);

            var suggestCount = rows[i].esfcount;
            if (suggestCount !== '0' || suggestCount !== '-1') {
                suggestCount = '约' + suggestCount + '条房源';
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

    // window.clickZhaozufang(e);
    ESFSearch.prototype.searchByKey = function (key) {
        var that = this;
        var url = that.defaultHref,
            cityCode = vars.cityCode;
        if (key && key !== that.defaultText) {
            if ('bt' === cityCode || 'hd' === cityCode || 'jining' === cityCode || 'lc' === cityCode || 'linyi' === cityCode || 'zb' === cityCode || 'hengyang' === cityCode || 'wuhu' === cityCode || 'ganzhou' === cityCode || 'yancheng' === cityCode || 'zhenjiang' === cityCode || 'st' === cityCode || 'leshan' === cityCode || 'lyg' === cityCode || 'xiangyang' === cityCode || 'mas' === cityCode || 'zhuzhou' === cityCode || 'bengbu' === cityCode || 'bh' === cityCode || 'sx' === cityCode || 'liuzhou' === cityCode || 'yueyang' === cityCode || 'huzhou' === cityCode || 'zhoushan' === cityCode) {
                url = url + '/esfhouse/kw' + util.encode(key) + '/';
            } else {
                url = url + '/house/c61-kw' + util.encode(key) + '/';
            }
        }

        that.setHistory(key, url);

        vars.aHref.href = url;
        vars.aHref.click();
    };

    ESFSearch.prototype.setHistory = function (key, url) {
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

    module.exports = new ESFSearch();
});
