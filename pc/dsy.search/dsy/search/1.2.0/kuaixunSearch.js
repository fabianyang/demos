/*
 * @file: 搜索请求结果类似 ^^^,^^^ 的数据的通用搜索
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.0/kuaixunSearch', [
    'dsy/search/1.2.0/interfaceSearch'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.0/interfaceSearch');

    function KuaiXunSearch() {
        Search.call(this);
        this.tag = 'kuaixun';
        this.suffix = '快讯';
        this.init();
    }

    KuaiXunSearch.prototype = Object.create(Search.prototype);
    KuaiXunSearch.prototype.constructor = KuaiXunSearch;

    KuaiXunSearch.prototype.init = function () {
        this.defaultText = vars.searchDefaultText.kuaixun;
        this.defaultHref = vars.searchDefaultHref.kuaixun;
        this.historyKey = this.getHistoryKey(this.tag);
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

        vars.aHref.href = url;
        vars.aHref.click();

        that.setHistory(key, {
            key: key,
            hrefUrl: url
        });
    };

    module.exports = new KuaiXunSearch();
});
