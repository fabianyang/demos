/**
 * app.js
 * @file 小程序逻辑,入口
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
const Promise = require('utils/promise.js').Promise;
App({
    now:Date.now(),
    onLaunch: function () {
        // Do something initial when launch.
        this.getLocation();
    },
    /**
     * 获取用户地理位置
     * @param sucCallback
     * @param failCallback
     */
    getLocation: function (sucCallback, failCallback) {
        let that = this;
        // 获取用户经纬度
        let userPostionTask = new Promise(function (resolve, reject) {
            // 初始化用户位置
            wx.getLocation({
                // 返回可以用于wx.openLocation的经纬度
                type: 'gcj02',
                complete: res => {
                    if (res.latitude) {
                        let latitude = res.latitude;
                        let longitude = res.longitude;
                        let speed = res.speed;
                        let accuracy = res.accuracy;
                        console.log('gcj02:' + latitude + '  ' + longitude + '  ' + accuracy);
                        resolve(res);
                    } else {
                        // 请求不成功更新用户位置
                        that.positionReady = true;
                        // 未定位默认为北京
                        that.userPosition.shortCity = '北京';
                        // 失败回调
                        (typeof failCallback === 'function') && failCallback(that.userPosition);
                        reject();
                    }
                }
            });
        });
        // 经纬度转为详细地址
        userPostionTask.then(resUserPos => {
            new Promise((resolve, reject) => {
                wx.request({
                    url: that.vars.interfaceSite + 'coordToCity',
                    data: {
                        lat: resUserPos.latitude,
                        long: resUserPos.longitude
                    },
                    complete: res => {
                        let resData = res.data;
                        // 请求成功更新用户位置
                        that.positionReady = true;
                        resData && (resData.status === '0') && (that.userPosition = resData.result);
                        // 地址解析出的城市带“市”，单独拉出字段shortCity，先去掉此字
                        that.userPosition.addressComponent && that.userPosition.addressComponent.city && (that.userPosition.shortCity = that.userPosition.addressComponent.city.replace(/市$/, ''))
                        console.log(that.userPosition);
                        // 成功回调
                        if (resData && resData.status === '0') {
                            that.fakeLocationSuc = false;
                            (typeof sucCallback === 'function') && sucCallback(that.userPosition);
                        } else {
                            (typeof failCallback === 'function') && failCallback(that.userPosition);
                        }
                    }
                });
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
        let end = new Date().getTime(), result = 0;
        if (this.performance[keyStr]) {
            result = end - this.performance[keyStr];
            console.info(keyStr, result);
        }
    },
    // 定位失败标识
    fakeLocationSuc: true,
    // 腾讯地图密钥
    mapKey: '5NHBZ-AKRW5-2WLIP-QDEKP-53C42-JFBMY',
    // 性能诊断用
    performance: {},
    // 用户位置
    userPosition: {},
    // 全局数据
    vars: {
        // 图片地址
        imgSite: 'https://static.soufunimg.com/common_m/m_wechat/public/images/',
        // 接口地址
        interfaceSite: 'https://m.fang.com/public/?c=wechatPublic&a='
    }
});
