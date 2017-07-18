/**
 * @file 成交记录详情页
 * @author icy
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
// 快筛功能模块
const filter = require('../../../utils/filter.js');
// 基础方法模块
const utils = require('../../../utils/utils.js');
// 通用方法模块
const common = require('../../../utils/common.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let vars = app.vars;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
let page = {
    data: {
        // 当前页显示数据是否加载完毕
        dataLoad: false
    },
    onLoad: function (params) {
        // console.log(params);
        // 设置loading
        this.loadingToast();
        this.params = params || {};
        this.init();
    },
    /**
     * 页面初始化
     * @return null
     */
    init: function () {
        // 获取首屏数据
        let pageInfoTask = new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSite + 'tradeRecord',
                data: this.params,
                complete: res => {
                    let resData = res.data || {};
                    // 初始化筛选数据
                    resData.filterInfo = this.initFilter();
                    resolve(resData);
                    // console.log(resData);
                }
            });
        });
        Promise.all([pageInfoTask]).then(res => {
            this.setData({
                dataLoad: true,
                pageInfo: res[0]
            })
        });
    },
    /**
     * 初始化筛选数据
     * @return object 格式化后筛选数据
     */
    initFilter: function () {
        let filterInfo = this.filterInfo;
        let params = this.params;
        let filterArr = filterInfo.filterArr;
        filterArr.forEach((filter, idx) => {
            let param = params[filter.key] || 'buxian';
            filter.activeBak = param;
            // 将params的已选参数与filter列表里对应项关联起来
            filter.data.forEach(info => {
                param === info.id && filter.params.push(info.name);
            });
        });
        return filterInfo;
    },
    /**
     * 快筛数据
     * @type {Object}
     */
    filterInfo: {
        // 快筛跳转地址
        url: '/pages/fangjia/tradeCaseList/tradeCaseList',
        // 
        filterArr: [{
            // 是否使用默认选中项
            hasParams: true,
            // 默认选中项
            params: [],
            // 菜单名
            name: '总价',
            // 菜单关键字，用于生成跳转query
            key: 'dealmoney',
            // 菜单项数据
            data: [{
                id: 'buxian',
                name: '不限'
            }, {
                id: '[0,200]',
                name: '200万以下'
            }, {
                id: '[200,250]',
                name: '200-250万'
            }, {
                id: '[250,300]',
                name: '250-300万'
            }, {
                id: '[300,400]',
                name: '300-400万'
            }, {
                id: '[400,500]',
                name: '400-500万'
            }, {
                id: '[500,800]',
                name: '500-800万'
            }, {
                id: '[800,1000]',
                name: '800-1000万'
            }, {
                id: '[1000,]',
                name: '1000万以上'
            }],
            // 自定义数据（最小值和最大值）
            custom: {},
            // 是否含有二级菜单
            hasSub: false,
            // 当前选中
            active: ''
        }, {
            hasParams: true,
            params: [],
            name: '面积',
            key: 'buildarea',
            data: [{
                id: 'buxian',
                name: '不限'
            }, {
                id: '[0,50]',
                name: '50㎡以下'
            }, {
                id: '[50,70]',
                name: '50-70㎡'
            }, {
                id: '[70,90]',
                name: '70-90㎡'
            }, {
                id: '[90,110]',
                name: '90-110㎡'
            }, {
                id: '[110,130]',
                name: '110-130㎡'
            }, {
                id: '[130,150]',
                name: '130-150㎡'
            }, {
                id: '[150,200]',
                name: '150-200㎡'
            }, {
                id: '[200,300]',
                name: '200-300㎡'
            }, {
                id: '[300,]',
                name: '300㎡以上'
            }],
            hasSub: false,
            active: ''
        }, {
            hasParams: true,
            params: [],
            name: '户型',
            key: 'room',
            data: [{
                id: 'buxian',
                name: '不限'
            }, {
                id: '[1,1]',
                name: '一居'
            }, {
                id: '[2,2]',
                name: '两居'
            }, {
                id: '[3,3]',
                name: '三居'
            }, {
                id: '[4,4]',
                name: '四居'
            }, {
                id: '[5,5]',
                name: '五居'
            }, {
                id: '[6,]',
                name: '五居以上'
            }],
            hasSub: false,
            active: ''
        }],
        isFilter: false
    },
    /**
     * 成交记录列表加载更多
     * @return null
     */
    loadmore: function () {
        let pageInfo = this.data.pageInfo;
        // 正在加载中不执行加载
        if (!pageInfo.loading) {
            // 计算当前需要加载的页码
            pageInfo.page = (pageInfo.page || 1) + 1;
            // 数据总数量
            let total = pageInfo.count;
            // 已加载列表
            let hit = pageInfo.hit;
            // 已加载数量
            let loadedNum = hit.length;
            console.log(loadedNum, total);
            // 如果还有未加载数据，执行加载
            if (loadedNum < total) {
                // 展示加载中动画
                this.setData({
                    'pageInfo.loading': true
                });
                let data = Object.assign({
                    page: pageInfo.page
                }, this.params);
                utils.request({
                    url: vars.interfaceSite + 'tradeRecord',
                    data: data,
                    complete: res => {
                        let resData = res.data;
                        // 加载完成把新加载数据置入已加载列表
                        if (resData.hit && resData.hit.length) {
                            pageInfo.hit = pageInfo.hit.concat(resData.hit);
                        }
                        // 取消加载中动画，更新已加载列表
                        this.setData({
                            'pageInfo.loading': false,
                            'pageInfo.hit': pageInfo.hit
                        })
                    }
                });
            }
        }
    },
    /**
     * 快筛
     * @return null
     */
    filter: function () {
        // 快筛数据
        let filterInfo = this.data.pageInfo.filterInfo;
        // 当前筛选菜单（总价，面积，户型）
        let filter = filterInfo.filterArr[filterInfo.activeFilter];
        let params = this.params;
        // 菜单key值(总价=>dealmoney,面积=>buildarea 户型=>room)
        let type = filter.key;
        // 一级筛选列
        let firstFilter = filter.data[filterInfo.firstFilter];
        // 筛选值
        let value = firstFilter.id;
        // 不限不传
        if (value === 'buxian' && params[type]) {
            delete params[type];
        } else if (value !== 'buxian') {
            params[type] = value;
        }
        wx.redirectTo({
            url: filterInfo.url + '?' + queryStringify(params)
        });
    },
    /**
     * 自定义筛选（总价）
     * @return null
     */
    customSubmit: function () {
        let filterInfo = this.data.pageInfo.filterInfo;
        let filter = filterInfo.filterArr[filterInfo.activeFilter];
        let params = this.params;
        // 最小值
        let min = +filter.custom.min;
        // 最大值
        let max = +filter.custom.max;
        if (min && max && min > max) {
            let timer = null;
            wx.showToast({
                title: '请检查自定义条件！',
                success: function () {
                    timer = setTimeout(function () {
                        wx.hideToast();
                        clearTimeout(timer);
                    }, 1000);
                }
            })
            return;
        }
        if (min && max) {
            // 最小值，最大值都存在 [min,max]
            params.price = '[' + min + ',' + max + ']';
        } else if (min) {
            // 最小值存在 [min,]
            params.price = '[' + min + ',]';
        } else if (max) {
            // 最大值存在 [0,max]
            params.price = '[0,' + max + ']';
        } else {
            // 都不存在不传
            delete params.price
        }
        wx.redirectTo({
            url: filterInfo.url + '?' + queryStringify(params)
        });
    }
};
Object.assign(page, filter, common);
Page(page);
