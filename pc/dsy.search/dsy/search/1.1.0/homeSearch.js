/*
 * @file: pc 首页搜索功能
 * @author: yangfan
 * @Create Time: 2016-05-19 09:45:38
 */
define('dsy/search/1.1.0/homeSearch', [
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.0/historyUtil',
    'dsy/search/1.1.0/searchNavigate',
    'dsy/search/1.1.0/xfSearch',
    'dsy/search/1.1.0/esfSearch',
    'dsy/search/1.1.0/zfSearch',
    'dsy/search/1.1.0/jiajuSearch',
    'dsy/search/1.1.0/kuaixunSearch',
    'dsy/search/1.1.0/fangjiaSearch',
    'dsy/search/1.1.0/haiwaiSearch'
], function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var vars = seajs.data.vars;

    // vars.searchDefaultText = {
    //     fangjia: '请输入小区名称或地址，给自己的房子估个价',
    //     xf: '请输入关键字（楼盘名/地名/开发商等）',
    //     esf: '请输入关键字（楼盘名或地名）',
    //     zf: '请输入关键字（楼盘名或地名）',
    //     jiaju: '请输入户型/功能间/风格等关键词',
    //     kuaixun: '请输入关键字',
    //     haiwai: '请输入关键字(国家/城市/地区)'
    // };
    vars.searchDefaultText = {
        fangjia: '\u8bf7\u8f93\u5165\u5c0f\u533a\u540d\u79f0\u6216\u5730\u5740\uff0c\u7ed9\u81ea\u5df1\u7684\u623f\u5b50\u4f30\u4e2a\u4ef7',
        xf: '\u8bf7\u8f93\u5165\u5173\u952e\u5b57\uff08\u697c\u76d8\u540d\u002f\u5730\u540d\u002f\u5f00\u53d1\u5546\u7b49\uff09',
        esf: '\u8bf7\u8f93\u5165\u5173\u952e\u5b57\uff08\u697c\u76d8\u540d\u6216\u5730\u540d\uff09',
        zf: '\u8bf7\u8f93\u5165\u5173\u952e\u5b57\uff08\u697c\u76d8\u540d\u6216\u5730\u540d\uff09',
        jiaju: '\u8bf7\u8f93\u5165\u6237\u578b\u002f\u529f\u80fd\u95f4\u002f\u98ce\u683c\u7b49\u5173\u952e\u8bcd',
        kuaixun: '\u8bf7\u8f93\u5165\u5173\u952e\u5b57',
        haiwai: '\u8bf7\u8f93\u5165\u5173\u952e\u5b57\uff08\u56fd\u5bb6\u002f\u57ce\u5e02\u002f\u5730\u533a\uff09'
    };
    vars.searchInput = $('#projnames');
    vars.searchWrapper = $('#SFmenu');
    vars.searchButton = $('.sbuttonstyle');

    var HistoryUtil = require('dsy/util/1.1.0/historyUtil'),
        SearchNavigate = require('dsy/search/1.1.0/searchNavigate'),
        XFSearch = require('dsy/search/1.1.0/xfSearch'),
        ESFSearch = require('dsy/search/1.1.0/esfSearch'),
        ZFSearch = require('dsy/search/1.1.0/zfSearch'),
        JiaJuSearch = require('dsy/search/1.1.0/jiajuSearch'),
        KuaiXunSearch = require('dsy/search/1.1.0/kuaixunSearch'),
        FangJiaSearch = require('dsy/search/1.1.0/fangjiaSearch'),
        HaiWaiSearch = require('dsy/search/1.1.0/haiwaiSearch');

    /**
     * 主页搜索类
     */
    var HomeSearch = function () {
        this.requestText = '';
        this.suggestListSelector = '#suggest_list';
        this.historyListSelector = '#history_list';
        this.backupListSelector = '#backup_list';
    };

    /**
     * 初始化搜索类元素和容器
     */
    HomeSearch.prototype.init = function () {
        this.input = vars.searchInput;
        this.button = vars.searchButton;
        this.wrapper = vars.searchWrapper;
        this.defaultText = vars.searchDefaultText;
        this.suggestList = $('<div id="suggest_list" style="display:none;"></div>').appendTo('body');
        this.historyList = $('<div id="history_list" style="display:none;"></div>').appendTo('body');
        this.html = '<div class="search_select"><table cellspacing="0" border="0"><tbody></tbody></table></div>';
        this.bindButtonEvent();
        this.bindInputEvent();
        this.bindWrapperEvent();
    };

    /**
     * 绑定搜索按钮事件
     * 1、判断是否进行标签滑动
     * 2、判断是否进行广告跳转
     * 3、判断是否为默认值或空值
     * 4、收起搜索列表，输入框失焦
     * 5、进行关键词搜索，记录历史
     */
    HomeSearch.prototype.bindButtonEvent = function () {
        var that = this;
        // getName()
        that.button.on('click', function () {
            clearInterval(that.timer);
            var key = that.input.val();
            // 默认直接点击搜索按钮，没有切换过标签
            if (!vars.searchTag) {
                SearchNavigate.setTag();
            }

            var tag = vars.searchTag,
                url = '';

            // 广告请求成功，没有 hover, focus 直接点击 button，不记录历史记录
            if (tag === 'xf' || tag === 'jiaju') {
                url = vars.getAdvertUrl(key);
                // 新需求，也记录到历史记录中
                // if (url) {
                //     url = url.replace(/\&amp;/g, '&');
                //     vars.aHref.href = url;
                //     vars.aHref.click();
                //     return false;
                // }
            }

            // 等于默认值时候清空
            if (key && key === that.defaultText[tag]) {
                key = '';
            }
            key = $.trim(key.replace(/\ +/g, ' '));
            that.wrapper.hide();
            that.input.blur();
            // 跳转，进行历史记录
            that.searchByKey(key, url);
            return false;
        });
    };

    /**
     * 绑定输入框得焦、失焦事件
     * 1、判断是否进行过标签滑动
     * 2、输入框清空，创建历史记录列表
     * 3、重新绑定 keyup, keydown 事件（如果不重新绑定会每次得焦都会绑定一次键盘事件）
     * 4、得焦：开始输入框值监测
     * 5、失焦：停止输入框值监测，空值置为默认值
     */
    HomeSearch.prototype.bindInputEvent = function () {
        var that = this;
        that.input.on('focus', function () {
            var tag = vars.searchTag;
            // 直接点击输入框，没有切换过标签
            if (!tag) {
                SearchNavigate.setTag();
            }
            // 优化：placeholder，可以显示历史记录或广告？低版本不兼容
            // xf, jiaju 需要替换为广告，其他的可以如果不为空或默认值清空
            // $(this).val('').attr('placeholder', that.defaultText[tag]);
            that.input.val('');
            // 进行默认请求
            // 20160718, 默认新房，家居，不显示历史记录
            tag = vars.searchTag;
            if (tag === 'xf' || tag === 'jiaju') {
                that.createSuggestList('');
            } else {
                that.createHistoryList();
            }

            // bind input Keyup
            that.rebindInputKeyEvent();

            that.watchInput();
            return false;
        });

        that.input.on('blur', function () {
            clearInterval(that.timer);
            if (!that.input.val()) {
                that.input.val(that.defaultText[vars.searchTag]);
            }
        });
    };

    /**
     * 绑定输入框键盘事件，每次输入框得焦要重新绑定
     * 1、上下按键切换搜索列表选中切换，停止输入框值监控
     *     每次切换都会将选择填入输入框，不停止值监控会进行请求，重新刷新搜索列表
     * 2、选择过程中，输入框依旧是得焦状态，输入值后重新开始输入框值监控
     * 3、回车按钮，触发搜索按钮点击事件
     * ps: 可以加入判断鼠标按下键盘时，输入框中的值是否为所有默认值中的一个（无效值），清空
     */
    HomeSearch.prototype.rebindInputKeyEvent = function () {
        var that = this;
        var wrapper = that.wrapper;
        that.input.off('keyup').on('keyup', function (e) {
            var keyCode = e.keyCode;
            // 方向键上或下进行切换列表选择
            if (keyCode === 38 || keyCode === 40) {
                clearInterval(that.timer);
                that.isSelecting = true;
                var tr = wrapper.find('tr'),
                    trSelected = wrapper.find('tr.selected');
                var trIndex = trSelected.index();
                trSelected.removeClass('selected').css('background-color', '#FFFFFF');
                switch (keyCode) {
                    case 38:
                        if (trSelected.length && trIndex) {
                            tr.eq(trIndex - 1).addClass('selected').css('background-color', '#EDEDED');
                        } else {
                            wrapper.find('tr:last').addClass('selected').css('background-color', '#EDEDED');
                        }
                        break;
                    case 40:
                        if (trSelected.length && trIndex !== tr.length - 1) {
                            tr.eq(trIndex + 1).addClass('selected').css('background-color', '#EDEDED');
                        } else {
                            wrapper.find('tr:first').addClass('selected').css('background-color', '#EDEDED');
                        }
                        break;
                }
                var key = wrapper.find('tr.selected').attr('data-key');
                $(this).val(key);
            }
        });
        that.input.off('keydown').on('keydown', function (e) {
            var key = that.input.val(),
                keyCode = e.keyCode;
            if (key && key === that.defaultText[vars.searchTag]) {
                that.input.val('');
            }
            if (that.isSelecting && keyCode !== 38 && keyCode !== 40) {
                that.watchInput();
                that.isSelecting = false;
            }
            // 回车等同点击查询按钮
            if (keyCode === 13) {
                that.button.trigger('click');
            }
        });
    };

    /**
     * 绑定搜索列表点击事件
     * 1、停止输入框值监控
     * 2、进行页面跳转，记录历史记录
     * 3、赋值输入框
     * 4、绑定删除历史记录按钮事件
     * 5、绑定清除全部历史记录按钮事件
     * 6、鼠标移动更改样式代码
     */
    HomeSearch.prototype.bindWrapperEvent = function () {
        var that = this;
        that.wrapper.on('click', 'tr', function () {
            clearInterval(that.timer);
            var key = $(this).attr('data-key'),
                url = $(this).attr('data-url');
            that.searchByKey(key, url);
            that.input.val(key);
            return false;
        });

        that.wrapper.on('click', '.remove_history', function () {
            clearInterval(that.timer);
            var index = $(this).parent().index(),
                historyTag = vars.cityCode + vars.searchTag + 'His';
            var isClear = HistoryUtil.removeHistoryItem(historyTag, index);
            that.wrapper.hide();
            if (isClear) {
                that.input.val(that.defaultText[vars.searchTag]);
            } else {
                var lastHistory = HistoryUtil.getLastHistory(historyTag);
                that.input.val(lastHistory.key);
            }
            that.createHistoryList();
            return false;
        });

        that.wrapper.on('click', '.clear_history', function () {
            clearInterval(that.timer);
            var historyTag = vars.cityCode + vars.searchTag + 'His';
            HistoryUtil.clearHistoryList(historyTag);
            that.wrapper.hide();
            that.input.val(that.defaultText[vars.searchTag]);
            that.createHistoryList();
            return false;
        });

        that.wrapper.on('mouseover', 'tr', function () {
            $(this).css('background-color', '#EDEDED');
        }).on('mouseout', 'tr', function () {
            $(this).css('background-color', '#FFFFFF');
        });

        that.wrapper.on('mouseover', 'td.clear_history, td.remove_history', function () {
            $(this).css('color', '#c00');
        }).on('mouseout', 'td.clear_history, td.remove_history', function () {
            $(this).css('color', '#666');
        });
    };

    /**
     * 输入框值监控 fix bug: jq 'input' 事件不兼容所有 ie
     * 每 1s 判断一次输入框值是否与上一次请求的关键字相同
     * 1、输入框值为空，同时上一次请求不为空
     * 2、输入框值不为空，与上一次请求不动
     */
    HomeSearch.prototype.watchInput = function () {
        var that = this;
        // fixbug: jq input 事件不兼容。每 300 判断是否有值变化
        clearInterval(that.timer);
        that.requestText = that.input.val();
        that.timer = window.setInterval(function () {
            var val = that.input.val(),
                rt = that.requestText;
            // 输入为空，同时上一次请求不为空
            if (!val && val !== rt) {
                that.requestText = '';
                // 进行默认请求
                that.createHistoryList();
                return false;
            }
            // 输入与上一次请求值不同
            if (val !== rt) {
                that.requestText = val;
                // 请求，下拉建议框
                that.createSuggestList(val);
            }
            return false;
        }, 1000);
    };

    /**
     * 判断当前搜索标签，进行对应搜索标签搜索
     * @param  {string} key 搜索关键词
     * @param  {string} url 对应跳转 url（点击搜索按钮情况，除了在 #xinfangList 中可以找到的 url，其余的都为 undefined）
     */
    HomeSearch.prototype.searchByKey = function (key, url) {
        switch (vars.searchTag) {
            case 'fangjia':
                FangJiaSearch.searchByKey(key, url);
                break;
            case 'xf':
                XFSearch.searchByKey(key, url);
                break;
            case 'esf':
                ESFSearch.searchByKey(key, url);
                break;
            case 'zf':
                ZFSearch.searchByKey(key, url);
                break;
            case 'jiaju':
                JiaJuSearch.searchByKey(key, url);
                break;
            case 'kuaixun':
                KuaiXunSearch.searchByKey(key, url);
                break;
            case 'haiwai':
                HaiWaiSearch.searchByKey(key, url);
                break;
        }
    };

    /**
     * 创建历史记录列表。
     * 输入框得焦，输入框值为空、点击删除或清空历史记录按钮时会调用此方法。
     * 有历史记录显示历史记录列表，没有创建空值搜索列表
     */
    HomeSearch.prototype.createHistoryList = function () {
        var that = this;
        var tag = vars.searchTag;
        var historyItems = HistoryUtil.getHistory(vars.cityCode + tag + 'His');
        if (historyItems) {
            var list = that.fillHistoryList(historyItems);
            that.dropdown(list.html());
        } else {
            that.createSuggestList('');
        }
    };

    /**
     * 填充历史记录列表 html
     * @param  {array} items 历史记录 json 数组
     */
    HomeSearch.prototype.fillHistoryList = function (items) {
        var that = this;
        var list = that.historyList;
        list.html(that.html);
        var html = '',
            length = $.isArray(items) ? items.length : 0;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                var key = items[i].key,
                    url = items[i].hrefUrl;
                html += '<tr data-key="' + key + '" data-url="' + url + '" data-history="' + JSON.stringify(items[i]) + '>';
                html += '<th><p>' + key + '</p></th>';
                html += '<td class="remove_history"> X </td>';
                html += '</tr>';
            }
            // html += '<tr><td class="clear_history" colspan="2" style="text-align:center">清除历史记录</td></tr>';
            html += '<tr><td class="clear_history" colspan="2" style="text-align:center">\u6e05\u9664\u5386\u53f2\u8bb0\u5f55</td></tr>';
        }
        list = list.find('tbody').html(html).end();
        return list;
    };

    /**
     * 创建搜索建议列表
     * @param  {string} key 搜索关键词
     * 1、组织请求参数
     * 2、组织对应搜索标签对象
     */
    HomeSearch.prototype.createSuggestList = function (key) {
        var tag = vars.searchTag;
        var vv = {
            fangjia: 'chafangjia',
            xf: 'maixinfang',
            esf: 'maiershoufang',
            zf: 'zhaozufang',
            jiaju: 'zhuangxiujiaju',
            kuaixun: 'fangchankuaixun',
            haiwai: 'haiwaifangchan'
        }[tag];

        var param = {
            q: escape(escape(key)),
            vv: vv,
            city: vars.sfsf.city,
            atype: 4
        };

        var obj = null;
        switch (tag) {
            case 'fangjia':
                obj = FangJiaSearch;
                break;
            case 'xf':
                obj = XFSearch;
                break;
            case 'esf':
                obj = ESFSearch;
                break;
            case 'zf':
                obj = ZFSearch;
                break;
            case 'jiaju':
                obj = JiaJuSearch;
                break;
            case 'kuaixun':
                obj = KuaiXunSearch;
                break;
            case 'haiwai':
                obj = HaiWaiSearch;
                break;
        }
        this.requestSuggest(param, obj);
    };

    /**
     * 创建请求列表
     * @param  {object} param        请求参数
     * @param  {object} searchObject 搜索对象
     * 1、记录请求状态，当前搜索标签，请求标记
     * 2、请求成功调用对应搜索标签的创建搜索列表方法
     */
    HomeSearch.prototype.requestSuggest = function (param, searchObject) {
        var that = this;

        // 如果再次调用时前一个ajax在执行，kill掉
        if (that.ajax) {
            that.ajax.abort();
            that.ajax = 0;
        }
        that.requestTag = vars.searchTag;
        // 请求之前增加一次请求标记。
        vars.setRequestNumber();
        var url = vars.sfsf.url + '&timeFlag=' + vars.getRequestNumber();
        that.ajax = $.post(url, param, function (data) {
            that.ajax = 0;

            // 请求完成后，再次判断请求 searchTag
            if (data && that.requestTag === vars.searchTag) {
                var list = that.suggestList.html(that.html);
                var obj = searchObject.getSuggestList(data);
                if (obj && obj.array.length) {
                    list.find('tbody').html(obj.html);
                    that.dropdown(list.html());
                } else {
                    that.wrapper.hide();
                }
            } else {
                that.wrapper.hide();
            }
        });
    };

    var Search = new HomeSearch();

    SearchNavigate.hoverCallback = function () {
        var param = {
            q: '',
            init: 'true'
        };
        if (vars.searchTag === 'xf') {
            // 设置新房广告
            param.vv = 'maixinfang';
            Search.requestAdvert(param, XFSearch);
        } else if (vars.searchTag === 'jiaju') {
            // 设置家居广告
            param.vv = 'zhuangxiujiaju';
            Search.requestAdvert(param, JiaJuSearch);
        }
    };

    HomeSearch.prototype.requestAdvert = function (param, searchObject) {
        var that = this;

        // hover 先关闭下拉框
        that.wrapper.hide();

        // 如果再次调用时前一个ajax在执行，kill掉
        if (that.ajax) {
            that.ajax.abort();
            that.ajax = 0;
        }
        that.requestTag = vars.searchTag;
        // 请求之前增加一次请求标记。
        vars.setRequestNumber();
        var url = vars.sfsf.url + '&timeFlag=' + vars.getRequestNumber();
        that.ajax = $.post(url, param, function (data) {
            that.ajax = 0;
            // 请求完成后，再次判断请求 searchTag
            if (data && that.requestTag === vars.searchTag) {
                searchObject.setAdvert(data);
            } else {
                SearchNavigate.setSuggestValue(vars.searchTag);
            }
        });
    };

    module.exports = Search;
});
