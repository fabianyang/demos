/*
 * @file: pc 首页搜索功能
 * @author: yangfan
 * @Create Time: 2016-05-19 09:45:38
 */
define('dsy/search/1.1.1/homeSearch', [
    'jquery',
    'dsy/search/1.1.1/searchNavigate',
    'dsy/search/1.1.1/xfSearch',
    'dsy/search/1.1.1/esfSearch',
    'dsy/search/1.1.1/zfSearch',
    'dsy/search/1.1.1/jiajuSearch',
    'dsy/search/1.1.1/kuaixunSearch',
    'dsy/search/1.1.1/fangjiaSearch',
    'dsy/search/1.1.1/haiwaiSearch'
], function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var vars = seajs.data.vars;

    vars.searchDefaultText = {
        fangjia: '请输入小区名称或地址，给自己的房子估个价',
        xf: '请输入关键字（楼盘名/地名/开发商等）',
        esf: '请输入关键字（楼盘名或地名）',
        zf: '请输入关键字（楼盘名或地名）',
        jiaju: '请输入户型/功能间/风格等关键词',
        kuaixun: '请输入关键字',
        haiwai: '请输入关键字(国家/城市/地区)'
    };

    vars.searchInput = $('#projnames');
    vars.searchWrapper = $('#SFmenu');
    vars.searchButton = $('.sbuttonstyle');
    // 20160708 新需求：添加广告标签
    vars.searchInputAdvertImage = $('#projad');

    var SearchNavigate = require('dsy/search/1.1.1/searchNavigate');

    var allSearch = {
        fangjia: require('dsy/search/1.1.1/fangjiaSearch'),
        xf: require('dsy/search/1.1.1/xfSearch'),
        esf: require('dsy/search/1.1.1/esfSearch'),
        zf: require('dsy/search/1.1.1/zfSearch'),
        jiaju: require('dsy/search/1.1.1/jiajuSearch'),
        kuaixun: require('dsy/search/1.1.1/kuaixunSearch'),
        haiwai: require('dsy/search/1.1.1/haiwaiSearch')
    };

    /**
     * 主页搜索类
     */
    var HomeSearch = function () {
        this.requestText = '';
        this.suggestListSelector = '#suggest_list';
        this.historyListSelector = '#history_list';
    };

    /**
     * 初始化搜索类元素和容器
     */
    HomeSearch.prototype.init = function () {
        this.input = vars.searchInput;
        this.adImg = vars.searchInputAdvertImage;
        this.button = vars.searchButton;
        this.wrapper = vars.searchWrapper;
        this.defaultText = vars.searchDefaultText;
        this.suggestList = $('<div id="suggest_list" style="display:none;"></div>').appendTo('body');
        this.historyList = $('<div id="history_list" style="display:none;"></div>').appendTo('body');
        this.boxHtml = '<div class="search_select"><table cellspacing="0" border="0"><tbody></tbody></table></div>';
        this.initTag();
        this.bindButtonEvent();
        this.bindInputEvent();
        this.bindWrapperEvent();
    };

    HomeSearch.prototype.initTag = function (pvwg) {
        this.adImg.hide();
        var vwg = pvwg ? pvwg : vars.vwg;
        var index = SearchNavigate.navigate.index($('#' + vwg));
        SearchNavigate.clearClass();
        SearchNavigate.changeClass(index);
        SearchNavigate.setTag();
        allSearch[vars.searchTag].setInputValue();
        this.hoverCallAdvert();
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
            // 正在请求过程不能跳转
            if (that.ajax) {
                return false;
            }
            var key = that.input.val();
            // 默认直接点击搜索按钮，没有切换过标签
            if (!vars.searchTag) {
                SearchNavigate.setTag();
            }

            var tag = vars.searchTag;
            // 等于默认值时候清空
            if (key && key === that.defaultText[tag]) {
                key = '';
            }
            key = $.trim(key.replace(/\ +/g, ' '));
            that.wrapper.hide();
            that.input.blur();

            // 跳转，进行历史记录
            allSearch[tag].searchByKey(key);
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
            that.isFocus = true;
            var tag = vars.searchTag;
            // 直接点击输入框，没有切换过标签
            if (!tag) {
                SearchNavigate.setTag();
            }
            // 此处可以优化：placeholder，可以显示历史记录或广告？低版本不兼容
            // xf, jiaju 需要替换为广告，其他的标签可以为默认值
            // $(this).val('').attr('placeholder', that.defaultText[tag]);
            that.input.val('');
            that.adImg.hide();

            // 进行默认请求，新房或家居请求一次广告，更新 advertHtml
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
            that.isFocus = false;
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
            // 回车等同点击查询按钮，判断 ajax 防止过快点击
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
                so = $(this).attr('data-search') || $(this).attr('data-history');
            var json = JSON.parse(so);
            allSearch[vars.searchTag].searchByKey(key, json);
            that.input.val(key);
            if (json.adUrl) {
                that.adImg.show();
            }
            return false;
        });

        that.wrapper.on('click', '.remove_history', function () {
            clearInterval(that.timer);
            var index = $(this).parent().index(),
                tag = vars.searchTag;
            allSearch[tag].removeHistoryItem(index);
            that.wrapper.hide();
            that.createHistoryList();
            return false;
        });

        that.wrapper.on('click', '.clear_history', function () {
            clearInterval(that.timer);
            allSearch[vars.searchTag].clearHistory();
            that.wrapper.hide();
            that.createSuggestList('');
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
     * 2、输入框值不为空，与上一次请求不同
     */
    HomeSearch.prototype.watchInput = function () {
        var that = this;
        // fixbug: jq input 事件不兼容。每 300 判断是否有值变化
        clearInterval(that.timer);
        that.requestText = that.input.val();
        that.timer = window.setInterval(function () {
            // 去除多余空格，多次空格只认为是一个空格
            var val = that.input.val(),
                text = that.requestText;
            if (val !== text) {
                // 输入为空，同时上一次请求不为空
                if (!val) {
                    that.requestText = '';
                    // 进行默认请求
                    that.createHistoryList();

                    // 输入与上一次请求值不同
                } else {
                    that.requestText = val;
                    // 如果和广告关键字一致显示广告标签功能，去掉
                    // allSearch[vars.searchTag].toggleAdvertImage(val);
                    // 请求，下拉建议框
                    that.createSuggestList(val);
                }
            }
        }, 1000);
    };

    /**
     * 创建历史记录列表。
     * 输入框得焦，输入框值为空、点击删除或清空历史记录按钮时会调用此方法。
     * 有历史记录显示历史记录列表，没有创建空值搜索列表
     * 20160729 新需求，历史记录只显示3条并要有广告
     */
    HomeSearch.prototype.createHistoryList = function () {
        var that = this,
            tag = vars.searchTag,
            html = '';
        var as = allSearch[tag];

        // 新需求：新房或家居（有广告时）保留三条历史记录
        // 家居（无广告）显示历史记录
        var advertHtml = as.advertHtml,
            historyHtml = as.getHistoryHtml(3);
        if (historyHtml) {
            if (tag === 'xf' ||　tag === 'jiaju') {
                if (advertHtml) {
                    html = historyHtml + advertHtml;
                } else {
                    html = as.getHistoryHtml();
                }
            } else {
                html = as.getHistoryHtml();
            }
        }

        if (html) {
            that.wrapperShow(html, true);
        } else {
            that.createSuggestList('');
        }
    };

    /**
     * 创建搜索建议列表
     * @param  {string} key 搜索关键词
     * 0、快讯不再进行请求
     * 1、组织请求参数
     * 2、组织对应搜索标签对象
     */
    HomeSearch.prototype.createSuggestList = function (key) {
        var tag = vars.searchTag;
        if (tag !== 'kuaixun') {
            var vv = {
                fangjia: 'chafangjia',
                xf: 'maixinfang',
                esf: 'maiershoufang',
                zf: 'zhaozufang',
                jiaju: 'zhuangxiujiaju',
                haiwai: 'haiwaifangchan'
            }[tag];

            var param = {
                q: escape(escape(key)),
                vv: vv,
                city: vars.sfsf.city,
                atype: 4
            };

            this.requestSuggest(param);
        }
    };

    /**
     * 创建请求列表
     * @param  {object} param        请求参数
     * @param  {object} searchObject 搜索对象
     * 1、记录请求状态，当前搜索标签，请求标记
     * 2、请求成功调用对应搜索标签的创建搜索列表方法
     * 未输入关键词，显示历史记录；输入关键词，有联想显示联想，没有则不显示
     */
    HomeSearch.prototype.requestSuggest = function (param) {
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
            if (that.requestTag !== vars.searchTag) {
                return false;
            }

            var tag = vars.searchTag,
                html = '';
            var as = allSearch[tag];
            if (data && data !== 'error') {
                as.getSuggestHtml(data);

                // 新需求：新房或家居（有广告时）保留三条历史记录
                // 家居（无广告）显示历史记录
                // param.q 判断是否为 focus 首次请求
                var suggestHtml = as.suggestHtml,
                    advertHtml = as.advertHtml,
                    historyHtml = as.getHistoryHtml(3);

                if (tag === 'xf') {
                    if (suggestHtml) {
                        html = suggestHtml;
                    } else if (advertHtml) {
                        html = historyHtml + advertHtml;
                    }
                } else if (tag === 'jiaju') {
                    if (param.q) {
                        html = suggestHtml;
                    } else if (historyHtml) {
                        if (advertHtml) {
                            html = historyHtml + advertHtml;
                        } else {
                            html = as.getHistoryHtml();
                        }
                    } else {
                        html = advertHtml + suggestHtml;
                    }
                } else {
                    html = suggestHtml;
                }

                if (html) {
                    that.wrapperShow(html, false);
                } else {
                    that.wrapper.hide();
                }
            } else if (param.q) {
                that.wrapper.hide();
            } else if (as.getHistoryHtml(1)) {
                that.createHistoryList();
            }
        });
    };

    HomeSearch.prototype.wrapperShow = function (html, isHis) {
        var thatList = isHis ? this.historyList : this.suggestList;
        var list = thatList.html(this.boxHtml);
        list.find('tbody').html(html);
        this.dropdown(list.html());
    };

    /**
     * 标签导航滑动回调
     * 如果是新房，家居请求广告。
     */
    HomeSearch.prototype.hoverCallAdvert = function () {
        var that = this;
        var param = {
            q: '',
            init: 'true'
        };
        if (vars.searchTag === 'xf') {
            // 设置新房广告
            param.vv = 'maixinfang';
            that.requestAdvert(param);
        } else if (vars.searchTag === 'jiaju') {
            // 设置家居广告
            param.vv = 'zhuangxiujiaju';
            that.requestAdvert(param);
        }
    };


    HomeSearch.prototype.requestAdvert = function (param) {
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
            // 判断 input 是否已经是 focus 状态，防止请求慢，清空输入框失效
            if (!that.isFocus) {
                if (data && that.requestTag === vars.searchTag) {
                    allSearch[vars.searchTag].setAdvert(data);
                } else {
                    allSearch[vars.searchTag].setInputValue();
                }
            }
        });
    };

    var Search = new HomeSearch();

    SearchNavigate.hoverCallback = function () {
        allSearch[vars.searchTag].setInputValue();
        Search.hoverCallAdvert();
    };

    module.exports = Search;
});
