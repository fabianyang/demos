/**
 * @file 搜索功能模块
 * @author icy
 */
const app = getApp();
const Promise = require('./promise.js').Promise;
// 基础方法模块
const utils = require('./utils.js');
// 通用数据
const vars = app.vars;
// 叙述，用于联想接口有序
let sequence = 0;
let ajaxUrl = '';
module.exports = {
    /**
     * 搜索界面切换
     * @return null
     */
    toggleSearch: function (e) {
        this.data.cityInfo = this.data.cityInfo || {};
        this.data.searchInfo = this.data.searchInfo || {};
        let searchInfo = this.data.searchInfo;
        let dataset = e.currentTarget.dataset;
        // 搜索类型默认为楼盘搜索xfSearch esfSearch cfjSearch
        dataset.searchtype = searchInfo.searchtype || (dataset.type === 'index' ? 'xf' : dataset.type);
        let dataJson = {
            'searchInfo.isSearch': !searchInfo.isSearch,
            'searchInfo.type': dataset.type,
            'searchInfo.searchtype': dataset.searchtype,
            'searchInfo.showHistory': searchInfo.history.length ? 1 : 0
        };
        // 获取提示弹层是否显示过标识
        let dropshowed = wx.getStorageSync('dropshowed');
        if (dropshowed) {
            dataJson['searchInfo.hideDropBox'] = true;
        }

        // 判断是否为自定义placeholder 如果有自定义placeholder就更新自定义数据
        if (dataset.type === 'index') {
            dataset.placeholder = dataset.searchtype === 'esf' ? '小区/区县/商圈等' : '楼盘名/地名/开发商等';
        }
        // 判断是否有自定义placeholder 有就更新
        if (dataset.placeholder) {
            dataJson['searchInfo.placeholder'] = dataset.placeholder;
        }
        // 判断是否有输入内容
        if (dataset.value) {
            // isIndex 用于区分小区详情页搜索和 各频道搜索 isIndex 为true 代表 非查房价小区搜索
            dataJson['searchInfo.isIndex'] = true;
            dataJson['searchInfo.valueInput'] = dataset.value;
            dataJson['searchInfo.value'] = dataset.value;
        }
        // 如果存在滚动高度则恢复滚动高度
        if (searchInfo.scrolltop) {
            dataJson['searchInfo.scrolltop'] = searchInfo.scrolltop;
        }
        // 更新页面数据
        this.setData(dataJson);
        // 获取接口地址
        this.getAjaxUrl(dataset.searchtype);
        // 大首页单独处理
        if (dataset.type === 'index') {
            vars.needSetTitle = true;
            wx.setNavigationBarTitle({
                title: dataset.do === 'close' ? '房天下+' : '搜索'
            });
        }
        // 如果存在滚动高度记录
        if (dataset.scrolltop) {
            searchInfo.scrolltop = dataset.scrolltop;
        }
    },
    /**
     * 获取搜索接口请求地址
     * @param type 区分城市搜索还是楼盘搜索
     */
    getAjaxUrl: function (type) {
        let url = '';
        switch (type) {
            case 'index':
            case 'xf':
                url = vars.interfaceSite + 'getSearchTips&type=3&showyd=' + (app.userPosition.shortCity === '烟台' ? 1 : 0);
                break;
            case 'esf':
                url = vars.interfaceSite + 'getSearchTips&type=2';
                break;
            case 'cfj':
                url = vars.interfaceSite + 'cfjAutoSuggest';
                break;
            default:
                url = vars.interfaceSite + 'getSearchTips&type=2';
        }
        ajaxUrl = url;
    },
    /**
     * 搜索按钮点击handle
     * @return null
     */
    searchTap: function (e) {
        let dataset = e.currentTarget.dataset;
        // 当前输入关键字
        let value = this.data.searchInfo.valueInput;
        // 区分楼盘搜索和城市搜索
        let searchtype = dataset.searchtype;
        // 关键字存在则存历史
        value && this.refreshHistory(value,searchtype);
        // 回复默认值（用于搜索结果页返回时，能显示主页面而不是搜索页）
        this.setData({
            'searchInfo.value': '',
            'searchInfo.valueInput': '',
            'searchInfo.isSearch': false
        });
        // 搜索处理
        this.search(value || '', searchtype);
    },
    /**
     * 搜索输入事件handle
     * @param  {[object]} e input事件
     * @return null
     */
    searchInput: function (e) {
        // 输入值
        let value = e.detail.value.replace(/ /g, '');
        // 搜索信息
        let searchInfo = this.data.searchInfo;
        if (!searchInfo.hideDropBox) {
            this.hideDropBox();
        }
        // 生成唯一序数
        sequence++;
        if (value) {
            // 有输入则进行联想
            // 调取联想接口
            new Promise(resolve => {
                utils.request({
                    url: ajaxUrl,
                    data: {
                        q: value,
                        cityname: searchInfo.cityname
                    },
                    complete: res => resolve({
                        data: res.data,
                        sequence: sequence
                    })
                });
            }).then(res => {
                // 如果返回值是最新请求值，则处理，否则抛弃
                if (res.sequence === sequence) {
                    if (res.data && res.data.length) {
                        // 存在联想结果，处理联想结果
                        let promptArr = res.data;
                        // 对联想列表遍历，标记关键字（页面显示时对关键字标红处理）
                        promptArr = promptArr.map(raw => {
                            let rawArr = raw.split(',');
                            let prompt = rawArr[0];
                            let index = prompt.indexOf(value);
                            let len = value.length;
                            // 存放截取的文字
                            let left = '';
                            let module = '';
                            let right = '';
                            let redStr = '';
                            // 查房价后缀
                            let suffix = rawArr[2];
                            if (index < 0) {
                                left = prompt;
                            }else if (index === 0) {
                                left = prompt.substr(index,len);
                                module = prompt.substr(len);
                                redStr = 'left';
                            }else if (index + len === prompt.length) {
                                module = prompt.substring(0,index);
                                right = prompt.substr(index);
                                redStr = 'right';
                            }else {
                                left = prompt.substring(0,index);
                                module = prompt.substr(index,len);
                                right = prompt.substr(index + len);
                                redStr = 'module';
                            }
                            return {
                                raw: raw,
                                left: left,
                                module: module,
                                right: right,
                                redStr: redStr,
                                suffix: suffix
                            };
                        });
                        // 更新联想列表
                        this.setData({
                            'searchInfo.promptArr': promptArr,
                            'searchInfo.showHistory': 2
                        });
                    } else {
                        // 如果没有联想结果，则隐藏联想列表
                        this.setData({
                            'searchInfo.showHistory': searchInfo.history.length ? 1 : 0
                        });
                    }
                }
            });
        } else {
            // 输入值为空，显示默认界面（有历史显示历史记录，否则不显示）
            this.setData({
                'searchInfo.showHistory': searchInfo.history.length ? 1 : 0
            });
        }
        // 更新输入值
        this.setData({
            'searchInfo.valueInput': value
        })

    },
    /**
     * 清除输入框内容点击handle
     * @return null
     */
    clearInput: function () {
        // console.log('ddd');
        this.setData({
            'searchInfo.value': '',
            'searchInfo.valueInput': '',
            'searchInfo.showHistory': this.data.searchInfo.history.length ? 1 : 0
        });
    },
    /**
     * 历史项点击事件handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    historyTap: function (e) {
        // 当前点击项的关键字
        let dataset = e.currentTarget.dataset;
        let name = dataset.name;
        let searchtype = dataset.searchtype;
        // 更新历史记录
        this.refreshHistory(name,searchtype);
        // 恢复默认值
        this.setData({
            'searchInfo.value': '',
            'searchInfo.valueInput': '',
            'searchInfo.isSearch': false
        });
        // 搜索
        this.search(name,searchtype);
    },
    /**
     * 刷新历史记录
     * @param  {[string]} name 关键字
     * @param  {[string]} searchType 搜索类型
     * @return null
     */
    refreshHistory: function (name,searchType) {
        // 搜索信息
        let searchInfo = this.data.searchInfo;
        searchInfo.historyTag = searchType + 'History-' + searchInfo.cityname;
        // 历史信息
        let history = searchInfo.history;
        let index = -1;
        // 查询当前关键字在历史列表里序数
        for (let i = 0, len = history.length; i < len; i++) {
            if (history[i].raw === name) {
                index = i;
                break;
            }
        }
        // 如果当前关键字在列表里，则从列表里删除当前关键字
        if (~index) {
            history.splice(index, 1);
        }
        // 列表前插当前关键字
        history.unshift({raw: name, name: name.split(',')[0], suffix: name.split(',')[2]});
        // 列表大于10条记录截取最新10条
        history.length > 10 && (history.length = 10);
        // 存历史记录
        wx.setStorageSync(searchInfo.historyTag, history.map(his => his.raw));
        // 更新页面显示
        searchInfo.isSearch = !this.data.searchInfo.isSearch;
        searchInfo.showHistory = this.data.searchInfo.history.length ? 1 : 0;
        this.setData({
            searchInfo: searchInfo
        });
    },
    /**
     * 清空历史点击事件
     * @param  {[object]} e 点击事件
     * @return null
     */
    clearHistory: function (e) {
        // 清空历史记录
        wx.removeStorageSync(this.data.searchInfo.historyTag);
        // 渲染页面并弹出已删除提示
        this.setData({
            'searchInfo.showHistory': 0,
            'searchInfo.history': [],
            'searchInfo.deleteHistoryAlert': true
        });
        // 隐藏toast提示
        setTimeout(() => this.setData({
            'searchInfo.deleteHistoryAlert': false
        }), 2000);
    },
    /**
     * 隐藏删除浮层
     */
    hideDelFloat: function () {
        this.setData({
            'searchInfo.deleteHistoryAlert': false
        });
    },
    /**
     * 隐藏新房 二手房选择弹层
     */
    hideDropBox: function () {
        wx.setStorageSync('dropshowed', 'true');
        this.setData({
            'searchInfo.hideDropBox': true
        });
    },
    /**
     * 显示新房 二手房选择弹层
     */
    showDropBox: function () {
        this.setData({
            'searchInfo.hideDropBox': false
        });
    },
    switchSearch: function (e) {
        // 当前点击项的搜索类型
        let searchtype = e.currentTarget.dataset.searchtype;
        let historyTag = searchtype + 'History-' + this.data.searchInfo.cityname;
        // 获取接口地址
        this.getAjaxUrl(searchtype);
        this.getSearchHistory(historyTag).then(res => {
            this.setData({
                'searchInfo.searchtype': searchtype,
                'searchInfo.historyTag': historyTag,
                'searchInfo.history': res.history,
                'searchInfo.showHistory': res.history.length ? 1 : 0,
                'searchInfo.placeholder': searchtype === 'esf' ? '小区/区县/商圈等' : '楼盘名/地名/开发商等'
            });
        });
        this.hideDropBox();
    }
};
