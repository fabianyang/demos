/*
 * @file: SearchNavigate
 * @author: yangfan
 * @Create Time: 2016-06-02 09:25:46
 */

define('dsy/search/1.1.1/searchNavigate', [
    'jquery',
    'dsy/util/1.1.1/historyUtil'
], function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var HistoryUtil = require('dsy/util/1.1.1/historyUtil');
    var vars = seajs.data.vars;

    var defaultText = vars.searchDefaultText,
        input = vars.searchInput,
        adImg = vars.searchInputAdvertImage,
        wrapper = vars.searchWrapper;

    var tagMap = {
        ' dsy_D02_19 ': 'fangjia',
        ' dsy_D02_02 ': 'xf',
        ' dsy_D02_03 ': 'esf',
        ' dsy_D02_04 ': 'zf',
        ' dsy_D02_05 ': 'jiaju',
        ' dsy_D02_06 ': 'kuaixun',
        ' dsy_D02_20 ': 'haiwai'
    };

    var SearchNavigate = function () {
        this.activeClass = 'cur';
        this.selector = '#dsy_D02_19, #dsy_D02_02, #dsy_D02_03, #dsy_D02_04, #dsy_D02_05, #dsy_D02_06, #dsy_D02_20';
        this.arrowSelector = '.searchjt';
        this.init();
    };

    SearchNavigate.prototype.clearClass = function () {
        this.arrow.hide();
        this.navigate.removeClass(this.activeClass);
    };

    SearchNavigate.prototype.changeClass = function (index) {
        this.arrow.eq(index).show();
        this.navigate.eq(index).addClass(this.activeClass);
    };

    SearchNavigate.prototype.setTag = function () {
        var id = this.navigate.filter('.' + this.activeClass).attr('id');
        var tag = tagMap[' ' + id + ' '];
        vars.searchTag = tag;
    };

    SearchNavigate.prototype.bindEvent = function () {
        var that = this;
        that.navigate.on('mouseover', function () {
            this.focus();
            // clear data-*
            wrapper.empty().hide();
            adImg.hide();
            that.clearClass();
            that.changeClass($(this).index());
            that.setTag();
            that.hoverCallback();
        });
    };

    SearchNavigate.prototype.setDefaultHref = function () {
        var that = this;
        var defaultHref = {};
        that.navigate.each(function (idx, elem) {
            var tag = tagMap[' ' + elem.id + ' '];
            // 这三个选项卡跳转时候没有城市参数
            if (tag === 'xf' || tag === 'esf' || tag === 'zf' || tag === 'kuaixun') {
                defaultHref[tag] = elem.href.replace(/\/$/, '');
            }
        });
        vars.searchDefaultHref = defaultHref;
    };

    SearchNavigate.prototype.init = function () {
        this.arrow = $(this.arrowSelector);
        this.navigate = $(this.selector);
        this.bindEvent();
        this.setDefaultHref();
    };

    module.exports = new SearchNavigate();
});
