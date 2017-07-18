/**
 * @file 城市切换选择页面
 * @author tankunpeng
 */
const app = getApp();
const Promise = require('../../utils/promise.js').Promise;
// 基础工具模块
const utils = require('../../utils/utils.js');
// 城市搜索
const search = require('modules/citySearch.js');

// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let vars = app.vars;

// 正在刷新
let positioning = false;


// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);


let page = {
    data: {
        cityInfo:{
            searchShow: false
        },
        // 首次加载标识
        firstLoad: true
    },
    onShow: function () {
        if (!this.data.firstLoad) {
            // 设置scroll-view的滚动高度
            this.setScrollHeight();
            // 处理网络信息
            this.getNetwork();
            // 显示城市列表
            this.showCityList();
        } else {
            this.data.firstLoad = false;
        }
    },
    /**
     * [page 加载回调]
     * @param  {[object]} params [query]
     * @return null
     */
    onLoad: function (params) {
        this.params = params || {};
        // 设置来自首页为了判断 再次回到首页要不要 回到顶部的标识
        vars.cityPage = true;
        // 设置scroll-view的滚动高度
        this.setScrollHeight();
        // 处理网络状态
        this.getNetwork();
        // 显示城市列表
        this.showCityList();
    },
    /**
     * 设置scroll-view的滚动高度
     */
    setScrollHeight: function () {
        // 44 为顶部搜索框高度
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    scrollHeight: res.windowHeight - 44 + 'px'
                });
            }
        })
    },
    /**
     * 显示城市列表
     */
    showCityList: function () {
        // 获取定位信息
        let location = this.getLocation();
        location.then(() => {
            console.log('定位成功',app.userPosition);
            // 更新城市列表
            if (vars.cityInfo) {
                vars.cityInfo.positionCity = app.userPosition.shortCity;
                this.setData({
                    cityInfo: vars.cityInfo,
                    cityInfoReady: true
                });
            }else {
                this.init();
            }
        }).catch(() => {
            // 更新城市列表
            if (vars.cityInfo) {
                console.log('定位失败',vars.cityInfo.positionCity);
                vars.cityInfo.positionCity = '定位失败';
                this.setData({
                    cityInfo: vars.cityInfo,
                    cityInfoReady: true
                });
            }else {
                this.init();
            }
        });
    },
    /**
     * 处理网络状态
     */
    getNetwork: function () {
        // 获取网络信息
        wx.getNetworkType({
            success: res => {
                // 返回网络类型2g，3g，4g，wifi, none, unknown
                let networkType = res.networkType;
                if (networkType === 'none' || networkType === 'unknown') {
                    this.setData({
                        'cityInfo.showNetwork': true
                    });
                    setTimeout(() => {
                        this.setData({
                            'cityInfo.showNetwork': false
                        });
                    }, 2000);
                }
                console.log('网络状态--',networkType);
            }
        });
    },
    /**
     * 页面初始化
     * posed 定位完成后再一次更新数据
     */
    init: function () {
        // 获取城市切换城市列表信息
        let cityInfoTask = new Promise((resolve, reject) => {
            utils.request({
				// java 城市列表接口
                url: vars.interfaceSiteJava + 'cityList',
                complete: res => {
                    let resData = res.data;
                    if (resData) {
                        // 通用标识串，防止id重复
                        let prefix = 'cityIndex';
                        // 格式化数据
                        let cityes = [];
                        // 处理热门城市
                        resData.hc = resData.hc.replace(/\[|\]| /g, '').split(',');
                        cityes.push({key: prefix, name: '热门城市', cities: resData.hc});
                        delete resData.hc;
                        for (let key in resData) {
                            if (resData.hasOwnProperty(key)) {
                                resData[key] = resData[key].replace(/\[|\]| /g, '').split(',');
                                cityes.push({
                                    key: prefix + key,
                                    name: key,
                                    cities: resData[key]
                                });
                            }
                        }
                        // 城市信息
                        let cityInfo = {
                            // 分类
                            category: cityes,
                            // 当前定位城市
                            positionCity: app.userPosition.shortCity || '定位失败'
                        };
                        resolve(cityInfo);
                    } else {
                        reject();
                    }
                }
            });
        });
        // 获取城市切换历史信息
        let cityHistoryTask = new Promise((resolve, reject) => {
            let historyTag = 'cityHistory';
            wx.getStorage({
                key: historyTag,
                complete: res => {
                    let history = res.data || [];
                    resolve({
                        history: history,
                        placeholder: '输入城市名称进行搜索',
                        historyTag: historyTag,
                        showHistory: history.length ? 1 : 0,
                    });
                }
            });
        });
        // 城市切换
        Promise.all([cityInfoTask, cityHistoryTask]).then((res) => {
            let cityInfo = res[0];
            utils.assign(cityInfo, res[1]);
            this.setData({
                cityInfo: cityInfo,
                cityInfoReady: true
            });
        });
    },
    /**
     * 城市导航切换（快速跳转相应城市类别）
     * @param  e 点击事件
     * @return null
     */
    cityTab: function (e) {
        this.setData({
            'cityInfo.active': e.currentTarget.dataset.id
        });
    },
    /**
     * 城市选择
     * @param  e 点击事件
     * @return null
     */
    cityPick: function (e) {
        clearInterval(vars.timer);
        // 选择城市名
        let cityName = e.currentTarget.dataset.id;
        let cityType = e.currentTarget.dataset.citytype;
        if (cityType === 'positionCity') {
            if (cityName === '定位失败') {
                return;
            }
            if (!app.userPosition.inCityList) {
                this.setData({
                    'cityInfo.showCityMsg': true,
                    'cityInfo.showCurrentLocation': false,
                    'cityInfo.showFailLocation': false
                });
                setTimeout(() => {
                    this.setData({'cityInfo.showCityMsg': false});
                }, 2000);
                return;
            }
        }
        // 城市全局变量赋值
        vars.currentCity = cityName;
        this.refreshHistory(cityName);
        let params = {
            cityname: cityName,
            customCity: true
        };
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 刷新历史记录
     * @param  {[string]} name 关键字
     * @return null
     */
    refreshHistory: function (name) {
        // 搜索信息
        let cityInfo = this.data.cityInfo;
        // 历史记录数组
        let history = cityInfo.history;
        // 当前城市在历史数组中序号
        let index = history.indexOf(name);
        // 如果存在删除对应历史项
        if (~index) {
            history.splice(index, 1);
        }
        // 历史数组前插当前选择城市
        history.unshift(name);
        // 超过5条截取最新5条
        history.length > 5 && (history.length = 5);
        // 存localstorage
        wx.setStorageSync(cityInfo.historyTag, history);
    },
    /**
     * 重新定位成功显示当前定位信息
     * @return null
     */
    reLocate: function () {
        if (!positioning) {
            positioning = true;
            app.getLocation(userPosition => {
                this.setData({
                    'cityInfo.positionCity': userPosition.shortCity,
                    'cityInfo.location': userPosition.addr,
                    'cityInfo.showCityMsg': false,
                    'cityInfo.showCurrentLocation': true
                });
                if (vars.cityInfo) {
                    vars.cityInfo.positionCity = userPosition.shortCity;
                }
                setTimeout(() => {
                    this.setData({'cityInfo.showCurrentLocation': false});
                    positioning = false;
                }, 3500);
            }, userPosition => {
                this.setData({
                    'cityInfo.showFailLocation': true,
                    'cityInfo.showCityMsg': false,
                    'cityInfo.positionCity': '定位失败'
                });
                setTimeout(() => {
                    this.setData({
                        'cityInfo.showFailLocation': false
                    });
                    positioning = false;
                }, 3500);
            })
        }
    },
    /**
     * 获取定位信息
     * @returns {*}
     */
    getLocation: function () {
        return app.locationPromise.then(() => {
            return new Promise((resolve,reject) => {
                if (app.positionReady) {
                    console.warn('定位成功');
                    resolve();
                }else {
                    reject();
                }
            });
        }).catch(() => {
            return new Promise((resolve,reject) => {
                console.warn('定位失败,重新定位开始');
                app.getLocation(userPosition => {
                    resolve();
                }, userPosition => {
                    reject();
                })
            });
        });
    },
    /**
     * 隐藏浮层
     */
    hideFloat: function () {
        this.setData({
            'cityInfo.showCurrentLocation': false,
            'cityInfo.showFailLocation': false,
            'cityInfo.showCityMsg': false,
            'cityInfo.showNetwork': false
        });
    }
};

// 渲染页面
Page(utils.assign(page, search));

