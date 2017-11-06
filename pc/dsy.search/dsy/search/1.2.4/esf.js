/*
 * @file: 二手房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.4/esf', [
    'jquery',
    'dsy/search/1.2.4/interface'
], function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.4/interface');

    function ESFSearch() {
        Search.call(this);
        this.tag = 'esf';
        this.suffix = '二手房';
        this.init();
    }


    $.extend(ESFSearch.prototype, new Search());
    // ESFSearch.prototype = Object.create(Search.prototype);
    // ESFSearch.prototype.constructor = ESFSearch;

    ESFSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.esf;
        this.defaultHref = vars.searchDefaultHref.esf;
        this.historyKey = this.getHistoryKey(this.tag);
    };

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

    ESFSearch.prototype.replaceTpl = function (obj) {
        var tpl = this.tpl;
        tpl = tpl.replace('{{search_key}}', obj.key);
        tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
        tpl = tpl.replace('{{suggest_word}}', obj.key);

        var district = obj.district + ' ' + obj.comerce;
        if (obj.purpose === '社区') {
            this.urlBackup(obj.key, JSON.stringify(obj));
            district = '社区';
        }

        tpl = tpl.replace('{{suggest_district}}', district);
        tpl = tpl.replace('{{suggest_count}}', obj.count ? '约' + obj.count + '条房源' : '');
        return tpl;
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
    ESFSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var json = JSON.parse(data);
        var rows = json.hit,
            html = '';

        if (rows.length) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var suggestCount = row.esfcount;
                if (suggestCount === '0') {
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

                if (+row.category !== 3) {
                    obj.count = suggestCount;
                }
                html += that.replaceTpl(obj);
            }
        }
        that.suggestHtml = html;
    };

    // window.clickZhaozufang(e);
    ESFSearch.prototype.searchByKey = function (pKey, data) {
        var that = this,
            key = pKey;
        var bu = that.backup[key],
            json = null;

        if (bu) {
            json = JSON.parse(bu);
        } else if (data) {
            json = data;
        }

        var url = that.defaultHref,
            cityCode = vars.cityCode;
        if (json && json.purpose === '社区') {
            url = 'http://esfbj1.test.fang.com/house/c7' + json.id + '-kw' + that.encode(key) + '/';
        } else {
            if (key && key !== that.defaultText) {
                if ('bt' === cityCode || 'hd' === cityCode || 'jining' === cityCode || 'lc' === cityCode || 'linyi' === cityCode || 'zb' === cityCode || 'hengyang' === cityCode || 'wuhu' === cityCode || 'ganzhou' === cityCode || 'yancheng' === cityCode || 'zhenjiang' === cityCode || 'st' === cityCode || 'leshan' === cityCode || 'lyg' === cityCode || 'xiangyang' === cityCode || 'mas' === cityCode || 'zhuzhou' === cityCode || 'bengbu' === cityCode || 'bh' === cityCode || 'sx' === cityCode || 'liuzhou' === cityCode || 'yueyang' === cityCode || 'huzhou' === cityCode || 'zhoushan' === cityCode) {
                    url = url + '/esfhouse/kw' + that.encode(key) + '/';
                } else {
                    url = url + '/house/c61-kw' + that.encode(key) + '/';
                }
            }
        }

        this.openUrl(key, url);

        var so = that.formatSearch({
            key: key,
            hrefUrl: url
        });

        that.setHistory(key, so);
    };

    module.exports = new ESFSearch();
});
