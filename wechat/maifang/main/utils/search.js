/**
 * @file 搜索功能模块
 * @author icy
 */
const app = getApp();
const Promise = require('./promise.js').Promise;
// 通用数据
const vars = app.vars;
// 叙述，用于联想接口有序
let sequence = 0;
module.exports = {
    /**
     * 搜索界面切换
     * @return null
     */
    toggleSearch: function () {
        this.setData({
            'searchInfo.isSearch': !this.data.searchInfo.isSearch
        });
    },
    /**
     * 搜索按钮点击handle
     * @return null
     */
    searchTap: function () {
        // 当前输入关键字
        let value = this.data.searchInfo.valueInput;
        // 关键字存在则存历史
        value && this.refreshHistory(value);
        // 回复默认值（用于搜索结果页返回时，能显示主页面而不是搜索页）
        this.setData({
            'searchInfo.value': '',
            'searchInfo.valueInput': '',
            'searchInfo.isSearch': false
        });
        // 搜索处理
        this.search(value || '');
    },
    /**
     * 搜索输入事件handle
     * @param  {[object]} e input事件
     * @return null
     */
    searchInput: function (e) {
        // 输入值
        let value = e.detail.value;
        // 搜索信息
        let searchInfo = this.data.searchInfo;
        // this.SearchValue =value;
        // 生成唯一序数
        sequence++;
        if (value) {
            // 有输入则进行联想
            // console.log(vars.interfaceSite, sequence);
            // 调取联想接口
            new Promise(resolve => {
                wx.request({
                    url: vars.interfaceSite + 'AutoSuggest',
                    data: {
                        cityname: searchInfo.cityname,
                        q: value
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
                            let prompt = raw.split(',')[0];
                            let index = prompt.indexOf(value);
                            let result = [];
                            // 关键字前有字符，把之前字符置入列表
                            index && result.push(prompt.substr(0, index))
                            // 置入关键字
                            result.push(value);
                            // 关键字后有字符，把之后字符置入列表
                            index + value.length < prompt.length && result.push(prompt.substr(index + value.length));
                            // 返回格式化后的关键字
                            return {
                                raw: raw,
                                promptfy: result
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
                            'searchInfo.showHistory': 0
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
        let name = e.currentTarget.dataset.name;
        // 更新历史记录
        this.refreshHistory(name);
        // 恢复默认值
        this.setData({
            'searchInfo.value': '',
            'searchInfo.valueInput': '',
            'searchInfo.isSearch': false
        });
        // 搜索
        this.search(name);
    },
    /**
     * 刷新历史记录
     * @param  {[string]} name 关键字
     * @return null
     */
    refreshHistory: function (name) {
        // 搜索信息
        let searchInfo = this.data.searchInfo;
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
        history.unshift({ raw: name, name: name.split(',')[0] });
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
        wx.clearStorageSync();
        // 渲染页面并弹出已删除提示
        this.setData({
            'searchInfo.showHistory': 0,
            'searchInfo.history': [],
            'searchInfo.deleteHistoryAlert': true
        });
        // 隐藏toast提示
        setTimeout(() => this.setData({
            'searchInfo.deleteHistoryAlert': false
        }), 2000)
    }
};
