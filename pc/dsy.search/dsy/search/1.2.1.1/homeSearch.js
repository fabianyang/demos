/*
 * @file: pc 首页搜索功能
 * @author: yangfan
 * @Create Time: 2016-05-19 09:45:38
 */
define('dsy/search/1.2.1.1/homeSearch', [
    'jquery',
    'dsy/search/1.2.1.1/tejiaSearch',
    'dsy/search/1.2.1.1/xfSearch',
    'dsy/search/1.2.1.1/esfSearch',
    'dsy/search/1.2.1.1/zfSearch',
    'dsy/search/1.2.1.1/jiajuSearch',
    'dsy/search/1.2.1.1/kuaixunSearch',
    'dsy/search/1.2.1.1/fangjiaSearch',
    'dsy/search/1.2.1.1/haiwaiSearch'
], function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var vars = seajs.data.vars;

    var tagList = ['tejia', 'fangjia', 'xf', 'esf', 'zf', 'jiaju', 'kuaixun', 'haiwai'];

    switch(vars.searchNavigate.length) {
        case 7:
            tagList = ['fangjia', 'xf', 'esf', 'zf', 'jiaju', 'kuaixun', 'haiwai'];
            break;
        case 6:
            tagList = ['xf', 'esf', 'zf', 'jiaju', 'kuaixun', 'haiwai'];
            break;
    }
    // tagList = tagList.splice(tagList.length - vars.searchNavigate.length, 7);


    /**
     * [setDefaultHref description]
     */
    (function() {
        var defaultHref = {};
        vars.searchNavigate.each(function(idx, elem) {
            var tag = tagList[idx];
            if (tag === 'xf' || tag === 'esf' || tag === 'zf' || tag === 'kuaixun' || tag === 'tejia') {
                defaultHref[tag] = elem.href.replace(/\/$/, '');
            }
        });
        vars.searchDefaultHref = defaultHref;
    })();

    vars.searchDefaultText = {
        tejia: '请输入关键字（楼盘名）',
        fangjia: '请输入小区名称或地址，给自己的房子估个价',
        xf: '请输入关键字（楼盘名/地名/开发商等）',
        esf: '请输入关键字（楼盘名或地名）',
        zf: '请输入关键字（楼盘名或地名）',
        jiaju: '请输入户型/功能间/风格等关键词',
        kuaixun: '请输入关键字',
        haiwai: '请输入关键字(国家/城市/地区)'
    }

    var allSearch = {
        tejia: require('dsy/search/1.2.1.1/tejiaSearch'),
        fangjia: require('dsy/search/1.2.1.1/fangjiaSearch'),
        xf: require('dsy/search/1.2.1.1/xfSearch'),
        esf: require('dsy/search/1.2.1.1/esfSearch'),
        zf: require('dsy/search/1.2.1.1/zfSearch'),
        jiaju: require('dsy/search/1.2.1.1/jiajuSearch'),
        kuaixun: require('dsy/search/1.2.1.1/kuaixunSearch'),
        haiwai: require('dsy/search/1.2.1.1/haiwaiSearch')
    };

    vars.tejiaCommonSearch = {
        xf: allSearch.xf,
        esf: allSearch.esf,
        zf: allSearch.zf
    }


    /**
     * 主页搜索类
     */
    var HomeSearch = function() {
        this.navigateArrowSelector = '.searchjt';
        this.navigateActiveClass = 'cur';
        this.inputCache = {
            tag: '',
            key: ''
        };
        this.navigateTag = '';
        this.requestText = '';
        this.suggestListSelector = '#suggest_list';
        this.historyListSelector = '#history_list';
    };

    var Prototype = HomeSearch.prototype;

    /**
     * 初始化搜索类元素和容器
     */
    Prototype.init = function() {
        this.input = vars.searchInput;
        this.adImg = vars.searchInputAdvertImage;
        this.button = vars.searchButton;
        this.wrapper = vars.searchWrapper;
        this.navigate = vars.searchNavigate;
        this.navigateArrow = $(this.navigateArrowSelector);
        this.defaultText = vars.searchDefaultText;
        this.suggestList = $('<div id="suggest_list" style="display:none;"></div>').appendTo('body');
        this.historyList = $('<div id="history_list" style="display:none;"></div>').appendTo('body');
        this.boxHtml = '<div class="search_select"><table cellspacing="0" border="0"><tbody></tbody></table></div>';
        // 有些火狐或搜狗浏览器无法调用 'vwg.business' 的回调方法，所以需要先自动调用一次。
        this.vwgCallback();
        this.bindNavigateEvent();
        this.bindButtonEvent();
        this.bindInputEvent();
        this.bindWrapperEvent();
    };

    Prototype.clearClass = function() {
        this.navigateArrow.hide();
        this.navigate.removeClass(this.navigateActiveClass);
    };

    Prototype.changeClass = function(index) {
        this.navigateArrow.eq(index).show();
        this.navigate.eq(index).addClass(this.navigateActiveClass);
    };

    Prototype.setNavigateTag = function() {
        var idx = this.navigate.filter('.' + this.navigateActiveClass).index();
        var tag = tagList[idx];
        this.navigateTag = tag;
    };

    Prototype.setInputCache = function() {
        var that = this;
        var cache = that.inputCache,
            tag = that.navigateTag,
            key = that.input.val();
        var inputIsHistory = allSearch[tag].inputIsHistory(key),
            inputIsAdvert = allSearch[tag].inputIsAdvert(key);

        var defaultText = that.defaultText[tag]
        if (key && key !== defaultText && !inputIsAdvert && !inputIsHistory) {
            if (cache.tag === tag && cache.key !== key || !cache.key) {
                that.inputCache = {
                    tag: tag,
                    key: key
                };
            }
        }
    };

    Prototype.clearInputCache = function() {
        this.inputCache = {
            tag: '',
            key: ''
        };
    };

    /**
     * 有些火狐不进入大数据回调方法，就无法 init ，需要请求两次
     * @param  {[type]} pvwg [description]
     * @return {[type]}      [description]
     */
    Prototype.vwgCallback = function(pvwg) {
        var that = this;
        that.adImg.hide();
        var vwg = pvwg ? pvwg : vars.vwg;
        var index = $('#' + vwg).index();
        that.clearClass();
        that.changeClass(index);
        that.setNavigateTag();
        var tag = that.navigateTag;
        allSearch[tag].setInputValue();
        that.hoverCallAdvert();
    };

    Prototype.bindNavigateEvent = function() {
        var that = this;
        that.navigate.on('mouseover', function() {
            // this.focus();
            that.input.blur();
            // clear data-*
            that.wrapper.empty().hide();
            that.adImg.hide();
            that.clearClass();
            that.changeClass($(this).index());
            that.setNavigateTag();
            var cache = that.inputCache,
                tag = that.navigateTag;
            if (cache.tag === tag && cache.key) {
                that.input.css('color', '#333').val(cache.key);
            } else {
                allSearch[tag].setInputValue();
                that.hoverCallAdvert();
            }
        });
    };

    /**
     * 绑定搜索按钮事件
     * 1、判断是否进行标签滑动
     * 2、判断是否进行广告跳转
     * 3、判断是否为默认值或空值
     * 4、收起搜索列表，输入框失焦
     * 5、进行关键词搜索，记录历史
     */
    Prototype.bindButtonEvent = function() {
        var that = this;
        // getName()
        that.button.on('click', function() {
            clearInterval(that.timer);

            // 正在请求过程不能跳转
            if (that.ajax) {
                return false;
            }
            var input = that.input;
            that.wrapper.empty().hide();
            that.input.blur();
            that.clearInputCache();

            var key = input.val();
            // 默认直接点击搜索按钮，没有切换过标签
            if (!that.navigateTag) {
                that.setNavigateTag();
            }

            var tag = that.navigateTag;
            // 等于默认值时候清空
            if (key && key === that.defaultText[tag]) {
                key = '';
            }
            key = $.trim(key.replace(/\ +/g, ' '));

            // 跳转，进行历史记录
            allSearch[tag].searchByKey(key, 'button');
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
    Prototype.bindInputEvent = function() {
        var that = this;
        that.input.on('focus', function() {
            var tag = that.navigateTag;
            // 直接点击输入框，没有切换过标签
            if (!tag) {
                that.setNavigateTag();
                tag = that.navigateTag;
            }
            that.adImg.hide();
            // 新需求：判断是否有没点击搜索以缓存的输入内容
            var cache = that.inputCache,
                input = that.input.css('color', '#333');
            if (cache.tag === tag && cache.key) {
                input.val(cache.key);
                input.setCursorPosition();
            } else {
                input.val('');
                that.clearInputCache();
            }

            var key = input.val();
            if (key) {
                that.createSuggestList(key);
                // 进行默认请求，新房或家居请求一次广告，更新 advertHtml
            } else if (tag === 'xf' || tag === 'jiaju') {
                that.createSuggestList('');
            } else {
                that.createHistoryList();
            }

            if (!key && tag === 'xf') {
                allSearch[tag].setSessionAdvert({
                    hasVoidSearch: 1
                })
            }

            // bind input Keyup
            that.rebindInputKeyEvent();

            that.watchInput();
            return false;
        });

        /**
         * 清除定时器
         * 记录搜索关键字
         */
        that.input.on('blur', function() {
            clearInterval(that.timer);
            that.setInputCache();
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
    Prototype.rebindInputKeyEvent = function() {
        var that = this;
        var wrapper = that.wrapper;
        that.input.off('keyup').on('keyup', function(e) {
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
        that.input.off('keydown').on('keydown', function(e) {
            var key = that.input.val(),
                keyCode = e.keyCode;
            if (key && key === that.defaultText[that.navigateTag]) {
                that.input.val('');
            }
            if (that.isSelecting && keyCode !== 38 && keyCode !== 40) {
                that.watchInput();
                that.isSelecting = false;
            }
            // 回车等同点击查询按钮，判断 ajax 防止过快点击
            if (keyCode === 13) {
                var trSelected = wrapper.find('tr.selected');
                var tdClearHistory = trSelected.find('td.clear_history')
                if (tdClearHistory.length) {
                    tdClearHistory.trigger('click');
                } else {
                    that.button.trigger('click');
                }
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
    Prototype.bindWrapperEvent = function() {
        var that = this;
        that.wrapper.on('click', 'tr', function() {
            clearInterval(that.timer);
            var key = $(this).attr('data-key'),
                so = $(this).attr('data-search') || $(this).attr('data-history');
            var json = JSON.parse(so);
            allSearch[that.navigateTag].searchByKey(key, json, 'list');
            that.input.val(key);
            that.clearInputCache();
            if (json.adUrl) {
                that.adImg.show();
            }
            return false;
        });

        that.wrapper.on('click', '.remove_history', function() {
            clearInterval(that.timer);
            var index = $(this).parent().index(),
                tag = that.navigateTag;
            allSearch[tag].removeHistoryItem(index);
            that.wrapper.hide();
            that.createHistoryList();
            return false;
        });

        that.wrapper.on('click', '.clear_history', function() {
            clearInterval(that.timer);
            var tag = that.navigateTag;
            allSearch[tag].clearHistory();
            that.input.css('color', '#888').val(that.defaultText[tag]).blur();
            that.wrapper.hide();
            that.createSuggestList('');
            return false;
        });

        that.wrapper.on('mouseover', 'tr', function() {
            $(this).css('background-color', '#EDEDED');
        }).on('mouseout', 'tr', function() {
            $(this).css('background-color', '#FFFFFF');
        });

        that.wrapper.on('mouseover', 'td.clear_history, td.remove_history', function() {
            $(this).css('color', '#c00');
        }).on('mouseout', 'td.clear_history, td.remove_history', function() {
            $(this).css('color', '#666');
        });
    };

    /**
     * 输入框值监控 fix bug: jq 'input' 事件不兼容所有 ie
     * 每 1s 判断一次输入框值是否与上一次请求的关键字相同
     * 1、输入框值为空，同时上一次请求不为空
     * 2、输入框值不为空，与上一次请求不同
     */
    Prototype.watchInput = function() {
        var that = this;
        // fixbug: jq input 事件不兼容。每 300 判断是否有值变化
        clearInterval(that.timer);
        that.requestText = that.input.val();
        that.timer = window.setInterval(function() {
            // 去除多余空格，多次空格只认为是一个空格
            var val = that.input.val(),
                text = that.requestText;
            if (val !== text) {
                // 输入为空，同时上一次请求不为空
                if (!val) {
                    that.requestText = '';
                    // 进行默认请求
                    that.clearInputCache();
                    that.createHistoryList();

                    // 输入与上一次请求值不同
                } else {
                    that.requestText = val;
                    // 如果和广告关键字一致显示广告标签功能，去掉
                    // allSearch[that.navigateTag].toggleAdvertImage(val);
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
    Prototype.createHistoryList = function() {
        var that = this,
            tag = that.navigateTag,
            html = '';
        var as = allSearch[tag];

        // 新需求：新房或家居（有广告时）保留三条历史记录
        // 家居（无广告）显示历史记录
        var advertHtml = as.advertHtml,
            historyHtml = as.getHistoryHtml(3);
        if (historyHtml) {
            if (tag === 'xf' || tag === 'jiaju') {
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
    Prototype.createSuggestList = function(key) {
        var tag = this.navigateTag;
        if (tag !== 'kuaixun') {
            var vv = {
                tejia: 'tejiafang',
                fangjia: 'chafangjia',
                xf: 'maixinfangtest',
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
    Prototype.requestSuggest = function(param) {
        var that = this;

        // 如果再次调用时前一个ajax在执行，kill掉
        if (that.ajax) {
            that.ajax.abort();
            that.ajax = 0;
        }
        that.requestTag = that.navigateTag;

        // 请求之前增加一次请求标记。
        vars.setRequestNumber();
        var url = vars.sfsf.url + '&timeFlag=' + vars.getRequestNumber();
        that.ajax = $.post(url, param, function(data) {
            that.ajax = 0;
            // 请求完成后，再次判断请求 navigateTag
            if (that.requestTag !== that.navigateTag) {
                return false;
            }

            var tag = that.navigateTag,
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
            } else {
                that.wrapper.hide();
            }
            return false;
        });
    };

    Prototype.wrapperShow = function(html, isHis) {
        var thatList = isHis ? this.historyList : this.suggestList;
        var list = thatList.html(this.boxHtml);
        list.find('tbody').html(html);
        this.dropdown(list.html());
    };

    /**
     * 标签导航滑动回调
     * 如果是新房，家居请求广告。
     */
    Prototype.hoverCallAdvert = function() {
        var that = this;
        var tag = that.navigateTag;
        if (tag !== 'xf' && tag !== 'jiaju') {
            return false;
        }

        // 目前只有新房添加了，空跳转屏蔽广告显示
        var sa = allSearch[tag].getSessionAdvert();
        var hasVoidSearch = sa && sa.hasVoidSearch;
        if (hasVoidSearch) {
            return false;
        }

        var param = {
            q: '',
            init: 'true'
        };
        if (tag === 'xf') {
            // 设置新房广告
            param.vv = 'maixinfang';
        } else if (tag === 'jiaju') {
            // 设置家居广告
            param.vv = 'zhuangxiujiaju';
        }

        that.requestAdvert(param);
        return true;
    };

    Prototype.requestAdvert = function(param) {
        var that = this;

        // hover 先关闭下拉框
        that.wrapper.hide();

        // 如果再次调用时前一个ajax在执行，kill掉
        if (that.ajax) {
            that.ajax.abort();
            that.ajax = 0;
        }
        that.requestTag = that.navigateTag;
        // 请求之前增加一次请求标记。
        vars.setRequestNumber();
        var url = vars.sfsf.url + '&timeFlag=' + vars.getRequestNumber();
        that.ajax = $.post(url, param, function(data) {
            that.ajax = 0;
            if (!data || data === 'error') {
                // console.log('advert data: ' + data);
                return false;
            }

            // 请求完成后，再次判断请求 navigateTag
            // 判断 input 是否已经是 focus 状态，防止请求慢，清空输入框失效
            if (that.requestTag === that.navigateTag) {
                allSearch[that.navigateTag].setAdvert(data);
            }
            return true;
        });
    };

    module.exports = new HomeSearch();
});
