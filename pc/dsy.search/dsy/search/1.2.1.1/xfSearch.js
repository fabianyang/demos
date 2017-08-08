/*
 * @file: 新房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.1.1/xfSearch', [
    'dsy/search/1.2.1.1/interfaceSearch'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.1.1/interfaceSearch');

    function XFSearch() {
        Search.call(this);
        this.tag = 'xf';
        this.suffix = '新房';
        this.init();
    }

    XFSearch.prototype = Object.create(Search.prototype);
    XFSearch.prototype.constructor = XFSearch;

    XFSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td>{{suggest_count}}</td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.xf;
        this.defaultHref = vars.searchDefaultHref.xf;
        this.historyKey = this.getHistoryKey(this.tag);
        this.sessionKey = this.getSessionKey(this.tag);
    };

    XFSearch.prototype.formatSearch = function (opts) {
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
            // 物业
            estate: opts.estate || '',
            // 是否跳列表页
            hrefState: opts.hrefState || '',
            store: opts.store || '1',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 广告：4,招商·都会中心^^ ^http://mshow.fang.com/c?z=fang&la=0&si=1&cg=733&c=12784&ci=111332&or=39602&l=168428&bg=168431&b=171079&u=http://duhuizhongxinzs.fang.com/,华润·未来城市^^ ^http://mshow.fang.com/c?z=fang&la=0&si=1&cg=733&c=12786&ci=111332&or=40965&l=168692&bg=168695&b=171248&u=http://weilaichengshi.fang.com
    // "8,首创集团^^42^^2,首开股份^^57^^2,首创·天禧^朝阳^^住宅^2^http://xiruidousc.fang.com/,首创·伊林郡^房山^^住宅^2^http://yilinjunsc.fang.com/,首开璞瑅公馆^丰台^^住宅^2^http://putigongguansk.fang.com/,首开华润城^丰台^^住宅^2^http://huarunchengsk.fang.com/,首开华润家园^丰台^^住宅^2^http://huarunchengsk.fang.com/,首创·禧悦府^密云^^住宅^2^http://xiyuefusc.fang.com/,首开知语家园^朝阳^^住宅^2^http://guofengshangyuesk.fang.com/"
    // 名称^区县^数量^物业类型^状态^url地址
    // 其中状态为1表示是唯一数据，点击搜索框按钮时搜索框内容与该数据一致时可以跳转到该数据的详情页；否则需要跳转到列表页；
    XFSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var rows = data.split(','),
            suggestHtml = '',
            advertHtml = '';

        // data[0] 改为了最后请求标识，防止先请求比后请求的先返回结果，导致查询错误。
        if (rows.length && +rows[0] >= vars.getRequestNumber()) {
            for (var i = 1; i < rows.length; i++) {
                var row = rows[i].split('^'),
                    tpl = that.tpl;
                var key = row[0],
                    url = row[3];
                var isAdvert = /^http:\/\/mshow\.fang\.com.*&u=/.test(url);

                if (!isAdvert && row[3]) {
                    key = key + ' - ' + row[3];
                }
                var obj = that.formatSearch({
                    key: key,
                    district: row[1],
                    estate: isAdvert ? '' : row[3],
                    hrefState: isAdvert ? '1' : row[4],
                    hrefUrl: isAdvert ? row[3] : row[5],
                    store: isAdvert ? '0' : '1',
                    adUrl: isAdvert ? row[3] : ''
                });

                var searchObject = JSON.stringify(obj);
                if (obj.hrefUrl) {
                    that.urlBackup(key, searchObject);
                }

                var isRedBag = obj.key === '买新房 领红包 人人有份',
                    suggestCount = row[2],
                    suggestWord = obj.key,
                    suggestDistrict = obj.district;

                if (isRedBag) {
                    suggestWord = '<font color="red">' + suggestWord + '</font>';
                }

                if (+suggestCount) {
                    if (isRedBag) {
                        suggestCount = '<p>支持' + suggestCount + '个楼盘</p>';
                    } else {
                        suggestCount = '<p>约' + suggestCount + '条</p>';
                    }
                } else {
                    suggestCount = '';
                }

                if (obj.adUrl) {
                    suggestCount = that.advertImage;
                }

                if (suggestDistrict) {
                    suggestDistrict = '[' + suggestDistrict + ']';
                }

                tpl = tpl.replace('{{search_key}}', obj.key);
                tpl = tpl.replace('{{search_object}}', searchObject);
                tpl = tpl.replace('{{suggest_word}}', suggestWord);
                tpl = tpl.replace('{{suggest_district}}', suggestDistrict);
                tpl = tpl.replace('{{suggest_count}}', suggestCount);

                if (obj.adUrl) {
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

    /**
     * 进行跳转操作
     * 1、是否已经获取过该 key 的 url，直接用 url 跳转
     * 2、是否为广告，广告不记录历史（2016.07.13 改为记录历史）
     */
    // window.clickMainxinfang(e, houseUrl);
    XFSearch.prototype.searchByKey = function (pKey, data, trigger) {
        var that = this,
            key = pKey;
        var bu = that.backup[key],
            json = null;

        if (bu) {
            json = JSON.parse(bu);
        } else if (data) {
            json = data;
        }

        // tj 没有 defaultHref / 分割
        var url = json ? json.hrefUrl : '';
        if (url) {
            if (trigger === 'button') {
                if (json.hrefState === '1') {
                    url = url.replace(/\&amp;/g, '&');
                } else {
                    url = that.defaultHref + '/a9' + that.encode(key.split(' - ')[0]) + '/';
                }
            } else {
                url = url.replace(/\&amp;/g, '&');
            }
        } else if (key && key !== that.defaultText) {
            url = that.defaultHref + '/a9' + that.encode(key) + '/';
        } else {
            url = that.defaultHref + '/';
        }

        vars.aHref.href = url;
        vars.aHref.click();

        if (!json) {
            json = that.formatSearch({
                key: key,
                hrefUrl: url
            });
        }

        // 20160803 广告不记录历史记录，为了排重
        if (+json.store) {
            that.setHistory(key, json);
        }
        // 搜索列表 u 参数，后面为真正的跳转地址
        // url = that.replaceUrlArg(url);
    };

    module.exports = new XFSearch();
});
