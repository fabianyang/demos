/**
 * @file 搜索功能模块
 * @author icy
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
// 基础工具模块
const utils = require('../../../utils/utils.js');
let queryStringify = utils.queryStringify;
// 通用数据
const vars = app.vars;
// 叙述，用于联想接口有序
let sequence = 0;
module.exports = {

    /**
     * 显示搜索
     */
    showSearch:function (e) {
        this.data.cityInfo = this.data.cityInfo || {};
        let dataset = e.currentTarget.dataset;
        this.setData({
            'cityInfo.searchShow': true,
            'cityInfo.placeholder': dataset.placeholder || this.data.cityInfo.placeholder
        });
    },

    /**
     * 搜索界面切换
     * @return null
     */
    hideSearch: function (e) {
        this.setData({
            'cityInfo.value': '',
            'cityInfo.valueInput': '',
            'cityInfo.listShow': false,
            'cityInfo.searchShow': false
        });
    },

    /**
     * 搜索输入事件handle
     * @param  {[object]} e input事件
     * @return null
     */
    searchInput: function (e) {
        // 输入值
        let value = e.detail.value.replace(/ /g, '');
        // 生成唯一序数
        sequence++;
        if (value) {
            // 有输入则进行联想
            // 城市搜索走Java接口需要二次编码
            new Promise(resolve => {
                utils.request({
					// java 城市搜索接口
                    url: vars.interfaceSiteJava + 'getCityList&q=',
                    data: {
                        q: encodeURIComponent(value)
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
                        // 存联想结果
                        this.cityList = res.data || [];
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
                            'cityInfo.promptArr': promptArr,
                            'cityInfo.listShow': true
                        });
                    } else {
                        // 如果没有联想结果，则隐藏联想列表
                        this.setData({
                            'cityInfo.listShow': false
                        });
                    }
                }
            });
        } else {
            // 输入值为空，显示默认界面（有历史显示历史记录，否则不显示）
            this.setData({
                'cityInfo.listShow': false
            });
        }
        // 更新输入值
        this.setData({
            'cityInfo.valueInput': value
        })
    },

    /**
     * 清除输入框内容点击handle
     * @return null
     */
    clearInput: function () {
        this.setData({
            'cityInfo.value': '',
            'cityInfo.valueInput': '',
            'cityInfo.listShow': false
        });
    },

    /**
     * 键盘点击完成
     */
    confirm: function () {
        let len = this.cityList.length;
        if (len === 1) {
            let name = this.cityList[0];
            // 更新历史记录
            this.refreshHistory(name);
            // 搜索
            this.search(name);
        }
    },

    /**
     * 搜索列表点击事件handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    cityTap: function (e) {
        // 当前点击项的关键字
        let name = e.currentTarget.dataset.name;
        // 更新历史记录
        this.refreshHistory(name);
        // 恢复默认值
        this.setData({
            'cityInfo.value': '',
            'cityInfo.valueInput': '',
            'cityInfo.searchShow': false
        });
        // 搜索
        this.search(name);
    },
    /**
     * 执行搜索方法
     * @param  {[string]} name [搜索关键字]
     */
    search: function (name) {
        // 跳转参数
        let params = {
            cityname: name,
            customCity: true
        };
        vars.currentCity = name;
        wx.navigateBack({
            delta: 1
        });
    }
};
