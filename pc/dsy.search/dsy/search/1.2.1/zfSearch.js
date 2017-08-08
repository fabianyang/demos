/*
 * @file: 新房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.1/zfSearch', [
    'dsy/search/1.2.1/interfaceSearch'
], function (require, exports, module) {
    'use strict';

    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.1/interfaceSearch');

    function ZFSearch() {
        Search.call(this);
        this.tag = 'zf';
        this.suffix = '租房';
        this.init();
    }

    ZFSearch.prototype = Object.create(Search.prototype);
    ZFSearch.prototype.constructor = ZFSearch;

    ZFSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.zf;
        this.defaultHref = vars.searchDefaultHref.zf;
        this.historyKey = this.getHistoryKey(this.tag);
    };

    ZFSearch.prototype.formatSearch = function (opts) {
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

    ZFSearch.prototype.replaceTpl = function (obj) {
        var tpl = this.tpl;
        tpl = tpl.replace('{{search_key}}', obj.key);
        tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
        tpl = tpl.replace('{{suggest_word}}', obj.key);
        tpl = tpl.replace('{{suggest_district}}', obj.district + ' ' + obj.comerce);
        tpl = tpl.replace('{{suggest_count}}', '约' + obj.count + '条房源');
        return tpl;
    };

    ZFSearch.prototype.getOneRowSuggest = function (row) {
        var that = this;
        var word = ['', '-一居', '-二居', '-三居', '-四居'],
            html = '';

        for (var i = 0; i < 5; i++) {
            var suggestCount = row['rentcount' + (i ? i : '')];
            if (suggestCount === '0') {
                continue;
            }

            var obj = that.formatSearch({
                key: row.projname + word[i],
                district: row.district,
                category: row.category,
                id: row.id,
                comerce: row.comerce,
                purpose: row.purpose
            });

            obj.count = suggestCount;

            html += that.replaceTpl(obj);
        }

        return html;
    };

    ZFSearch.prototype.getAllRowSuggest = function (rows) {
        var that = this;
        var html = '';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var suggestCount = row.esfcount;
            if (suggestCount === '0') {
                continue;
            }
            var category = row.category;
            var obj = that.formatSearch({
                key: category === '6' || category === '7' ? row.projname + '租房' : row.projname,
                district: row.district,
                category: category,
                id: row.id,
                comerce: row.comerce,
                purpose: row.purpose
            });

            obj.count = suggestCount;
            html += that.replaceTpl(obj);
        }
        return html;
    };

    // {"hit":[{"category":"6","id":"1","projname":"朝阳","district":"朝阳","comerce":"","purpose":"住宅,别墅,商铺,写字楼,用户词","countinfo":"260639","esfcount":"260639","rentcount":"112731","rentcount1":"107265","rentcount2":"2509","rentcount3":"2957","rentcount4":"50285"
    // },{"category":"7","id":"53","projname":"朝阳公园","district":"朝阳","comerce":"朝阳公园","purpose":"住宅,别墅,商铺,写字楼,用户词","countinfo":"9160","esfcount":"9160","rentcount":"5678","rentcount1":"5606","rentcount2":"64","rentcount3":"8","rentcount4":"79"
    // },{"category":"7","id":"12016","projname":"朝阳门内","district":"东城","comerce":"朝阳门内","purpose":"住宅,别墅,商铺,写字楼,用户词","countinfo":"1382","esfcount":"1382","rentcount":"1750","rentcount1":"1673","rentcount2":"0","rentcount3":"77","rentcount4":"889"
    // },{"category":"7","id":"2650","projname":"朝阳门","district":"朝阳","comerce":"朝阳门","purpose":"住宅,别墅,商铺,写字楼,用户词","countinfo":"2934","esfcount":"2934","rentcount":"1613","rentcount1":"1589","rentcount2":"0","rentcount3":"24","rentcount4":"1950"
    // },{"category":"1","id":"1010819777","projname":"朝阳合生财富广场","district":"朝阳","comerce":"大望路","purpose":"写字楼","countinfo":"0","esfcount":"0","rentcount":"470","rentcount1":"9","rentcount2":"0","rentcount3":"0","rentcount4":"0"
    // },{"category":"1","id":"1010645153","projname":"朝阳门内大街","district":"东城","comerce":"朝阳门内","purpose":"住宅","countinfo":"312","esfcount":"312","rentcount":"450","rentcount1":"98","rentcount2":"268","rentcount3":"67","rentcount4":"13"
    // },{"category":"1","id":"1010340625","projname":"朝阳门北小街","district":"东城","comerce":"朝阳门内","purpose":"住宅","countinfo":"136","esfcount":"136","rentcount":"271","rentcount1":"84","rentcount2":"145","rentcount3":"20","rentcount4":"19"
    // },{"category":"1","id":"1010544503","projname":"朝阳首府","district":"东城","comerce":"朝阳门内","purpose":"住宅","countinfo":"88","esfcount":"88","rentcount":"177","rentcount1":"22","rentcount2":"101","rentcount3":"53","rentcount4":"1"
    // },{"category":"1","id":"1010035998","projname":"朝阳新城","district":"朝阳","comerce":"东坝","purpose":"住宅","countinfo":"952","esfcount":"952","rentcount":"133","rentcount1":"16","rentcount2":"66","rentcount3":"38","rentcount4":"0"
    // },{"category":"1","id":"1010198395","projname":"朝阳公园西里","district":"朝阳","comerce":"朝阳公园","purpose":"住宅","countinfo":"70","esfcount":"70","rentcount":"118","rentcount1":"19","rentcount2":"45","rentcount3":"43","rentcount4":"8"}]}
    ZFSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var json = JSON.parse(data);
        var rows = json.hit,
            html = '';

        if (rows.length) {
            // 返回数据为一条，或者返回数据第一条与输入的文字正好匹配

            if (rows.length === 1) {
                // 展开分居室展开
                html = that.getOneRowSuggest(rows[0]);
            } else if (rows[0].category === '1' && rows[0].projname === vars.searchInput.val()) {
                html = that.getOneRowSuggest(rows[0]);
            } else {
                html = that.getAllRowSuggest(rows);
            }
        }
        that.suggestHtml = html;
    };

    // window.clickMaiershoufang(e);
    ZFSearch.prototype.searchByKey = function (key, data) {
        var that = this;
        var url = that.defaultHref,
            cityCode = vars.cityCode;
        if (key && key !== that.defaultText) {
            if ('bt' === cityCode || 'hd' === cityCode || 'jining' === cityCode || 'lc' === cityCode || 'linyi' === cityCode || 'zb' === cityCode) {
                url = url + '/renthouse/s31-kw' + that.encode(key);
            } else if ('hengyang' === cityCode || 'wuhu' === cityCode || 'ganzhou' === cityCode || 'yancheng' === cityCode || 'zhenjiang' === cityCode || 'st' === cityCode || 'leshan' === cityCode || 'lyg' === cityCode || 'xiangyang' === cityCode || 'mas' === cityCode || 'zhuzhou' === cityCode || 'bengbu' === cityCode || 'bh' === cityCode || 'sx' === cityCode || 'liuzhou' === cityCode || 'yueyang' === cityCode || 'huzhou' === cityCode || 'zhoushan' === cityCode) {
                url = url + '/renthouse/kw' + that.encode(key) + '/';
            } else {
                url = url + '/house/s31-kw' + that.encode(key) + '/';
            }
        }

        vars.aHref.href = url;
        vars.aHref.click();

        // 特价房搜索过来的不添加历史记录
        if (+data.store) {
            var so = that.formatSearch({
                key: key,
                hrefUrl: url
            });

            that.setHistory(key, so);
        }
    };

    module.exports = new ZFSearch();
});
