/**
 * app.js
 * @file 小程序逻辑,入口
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
const utils = require('utils/utils.js');
const Promise = require('utils/promise.js').Promise;
App({
    now: Date.now(),
    onLaunch: function () {
        // Do something initial when launch.
        this.locationPromise = this.getLocation();
    },
    /**
     * 通过经纬度获取用户地理位置
     * @param sucCallback
     * @param failCallback
     */
    getLocation: function (sucCallback, failCallback) {
        let that = this;
        // 获取用户经纬度
        let userPostionTask = new Promise((resolve, reject) => {
            // 初始化用户位置
            wx.getLocation({
                // 返回可以用于wx.openLocation的经纬度
                type: 'gcj02',
                complete: res => {
                    if (res.errMsg === 'getLocation:ok') {
                        console.log('gcj02', res);
                        resolve(res);
                    } else {
                        reject();
                    }
                }
            });

        });
        // 经纬度转为详细地址
        return userPostionTask.then(resUserPos => {
            return new Promise((resolve, reject) => {
                utils.request({
                    url: that.vars.interfaceSiteJava + 'locationbd',
                    data: {
                        geox: resUserPos.latitude,
                        geoy: resUserPos.longitude
                    },
                    complete: res => {
                        let data = res.data;
                        if (data) {
                            let resData = data.root;
                            // 请求成功更新用户位置
                            that.positionReady = true;
                            that.userPosition = resData;
                            // 成功回调
                            if (resData.shortCity) {
                                that.fakeLocationSuc = false;
                                // 标识定位成功为经纬度
                                that.vars.positionType = 'xy';
                                console.log('经纬度定位--', that.userPosition);
                                resolve(that.userPosition);
                                (typeof sucCallback === 'function') && sucCallback(that.userPosition);
                            } else {
                                this.getLocationByIP().then(res => {
                                    resolve(that.userPosition);
                                    (typeof sucCallback === 'function') && sucCallback(that.userPosition);
                                }).catch(err => {
                                    reject();
                                    (typeof failCallback === 'function') && failCallback(that.userPosition);
                                });
                            }
                        } else {
                            reject();
                            (typeof failCallback === 'function') && failCallback(that.userPosition);
                        }
                    }
                });

            });
        }).catch(err=> {
            return new Promise((resolve, reject) => {
                this.getLocationByIP().then(res => {
                    resolve(that.userPosition);
                    (typeof sucCallback === 'function') && sucCallback(that.userPosition);
                }).catch(err => {
                    reject();
                    (typeof failCallback === 'function') && failCallback(that.userPosition);

                });
            });
        });
    },
    /**
     * 通过ip获取用户地理位置
     */
    getLocationByIP: function () {
        let that = this;
        return new Promise((resolve, reject) => {
            utils.request({
                url: that.vars.interfaceSiteJava + 'getcitybyip',
                complete: res => {
                    let data = res.data;
                    if (data) {
                        let resData = data.root;
                        // 请求成功更新用户位置
                        that.positionReady = true;
                        that.userPosition = resData;
                        // 成功回调
                        if (resData.shortCity) {
                            that.fakeLocationSuc = false;
                            // 标识定位成功为经纬度
                            that.vars.positionType = 'ip';
                            console.log('IP定位--', that.userPosition);
                            resolve && resolve(that.userPosition);
                        } else {
                            that.positionFail = true;
                            that.userPosition.shortCity = '定位失败';
                            reject();
                        }
                    }else {
                        that.positionFail = true;
                        that.userPosition.shortCity = '定位失败';
                        reject();
                    }
                }
            });
        });
    },
    onShow: function () {
        // Do something when show.
    },
    onHide: function () {
        // Do something when hide.
    },
    onError: function () {
        // Do something when error ocurs.
    },
    /**
     *  性能诊断方法与tiemEnd成对使用,,类似console.time
     * @param keyStr
     * @returns null
     */
    time: function (keyStr = 'defaultKey') {
        let start = new Date().getTime();
        this.performance[keyStr] = start;
    },

    /**
     *  性能诊断方法与tiem成对使用,类似console.timeEnd
     * @param keyStr
     * @returns null
     */
    timeEnd: function (keyStr = 'defaultKey') {
        let end = new Date().getTime(),
            result = 0;
        if (this.performance[keyStr]) {
            result = end - this.performance[keyStr];
            console.info(keyStr, result);
        }
    },
    /**
     * 获取当前城市是否为查房价城市
     * @param click boolean 是否为click触发
     * @param e 事件对象
     */
    checkPrice: function (cityname) {
        return new Promise((resolve) => {
            utils.request({
                url: this.vars.interfaceSite + 'isPingguCity',
                data: {
                    cityname: cityname
                },
                complete: (res) => {
                    resolve(!!~~res.data);
                }
            });
        });
    },

    /**
     * 调试使用
     */
    show: function (title) {
        wx.showToast({
            title: title + ''
        });
        setTimeout(function () {
            wx.hideToast();
        }, 3000);
    },
    // 定位失败标识
    fakeLocationSuc: true,
    // 腾讯地图密钥
    mapKey: '5NHBZ-AKRW5-2WLIP-QDEKP-53C42-JFBMY',
    // 性能诊断用
    performance: {},
    // 用户位置
    userPosition: {},
    positionReady: false,
    // 全局数据
    vars: {
        // 默认图片地址
        defaultImg: 'https://static.soufunimg.com/common_m/m_wechat/public/images/default_logo.jpg',
        // 图片地址
        imgSite: 'https://static.soufunimg.com/common_m/m_wechat/public/images/',
        // 接口地址
        // interfaceSite: 'https://m.fang.com/public/?c=wechatPublic&a=',
        interfaceSite: 'https://m.fang.com/public/?c=wechatTestPublic&a=',
        // java推荐房源接口地址
        // interfaceSiteJava: 'https://m.fang.com/xcx.d?m=',
        interfaceSiteJava: 'https://m.fang.com/xcxtest.d?m=',
        // 查房价城市标识
        isBargainCity: undefined,
        // 当前数据城市
        currentCity: '',
        // 定位类型
        positionType: '',
        appname: 'fang',
        version : '1.1.42'
    }
});
