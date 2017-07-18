/**
 * detail.js
 * @file 二手房搜房帮详情页
 * @author icy
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
const utils = require('../../../utils/utils.js');
const common = require('../../../utils/common.js');
const share = require('../../../utils/share.js');
const fail = require('../../../utils/fail.js');
let vars = app.vars;
// 页面配置
let page = {
    // 设置分享信息
    shareInfoFn: function () {
        return {
            desc: this.data.houseInfo.title,
            title: this.data.houseInfo.projname + '|' + this.data.houseInfo.roomnum + '室' + this.data.houseInfo.hallnum + '厅|' + this.data.houseInfo.allacreage + '平米|' + this.data.houseInfo.price + '万'
        };
    },
    // 用于请求数据
    queryInfo: {
        projCode: '',
    },
    // 页面数据
    data: {
        // 城市
        cityname: '',
        // 默认图片
        defaultImg: vars.defaultImg,
        // 经纬度坐标坐标
        x: '',
        y: '',
        // 详情页基础数据
        houseInfo: {
            tags: []
        },
        // 隐藏/显示 flag
        maxHeight: {
            // 房源详情
            housedetail: {
                flag: false,
                alwaysShow: false
            },
            // 周边配套
            zbpt: {
                flag: false,
                alwaysShow: false
            },
            // 周边交通
            traffic: {
                flag: false,
                alwaysShow: false
            }
        },
        // 地铁信息
        subInfo: '',
        // 成交信息
        recordInfo: {
            // 成交数量
            count: '',
            // 一条成交记录
            hit: ''
        },
        // 相关房源
        relatedInfo: {
            // 同小区
            sameXq: [],
            // 同价位
            samePrice: [],
            // 同小区在售数量
            allcount: ''
        }
    },

    onLoad: function (params) {
        // 显示加载动画
        wx.showToast({
            icon: 'loading',
            title: '数据加载中...'
        });
        console.log(params);
        this.params = params || {};
        // 初始化页面
        this.init();
    },
    /**
     * 初始化
     * @return null
     */
    init: function () {
        // 初始渲染城市和经纬度数据
        this.setData({
            cityname: this.params.cityname,
            x: this.params.x,
            y: this.params.y
        });
        // 获取房源信息=>获取成交记录=>获取位置信息=>获取相关小区
        this.gethouseInfo().then(() => {
            this.getRecordInfo().catch(() => {}).then(this.getPosInfo).catch(() => {}).then(this.getRelatedInfo);
        }, () => {});
    },
    /**
     * 获取房源信息
     * @return {[object promise]}
     */
    gethouseInfo: function () {
        return new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSite + 'esfDetailNew',
                data: this.params,
                complete: res => {
                    let resData = res.data;
                    let house = resData.house;
                    let houseInfo = this.data.houseInfo;
                    console.log(house);
                    if (house) {
                        // 格式化房源详情和地铁数据，按换行符分割成数组，用于渲染多行效果
                        house.housedetailArr = house.housedetail.split('\n');
                        house.trafficInfoArr = house.trafficInfo.split('\n');
                        // 合并房源信息
                        utils.assign(houseInfo, house);
                        // 照片数据格式化，去除首尾空字符
                        houseInfo.photoUrl = houseInfo.photoUrl && houseInfo.photoUrl.trim();
                        // 渲染页面
                        this.setData({
                            houseInfo: houseInfo
                        });
                        // 设置标题
                        wx.setNavigationBarTitle({
                            title: house.projname
                        });
                        wx.hideToast();
                        // 记录房源相关信息，用于之后查询相关小区等操作
                        this.queryInfo = {
                            // 区域
                            district: house.district,
                            // 小区id
                            projCode: house.plotid,
                            // 商圈
                            comarea: house.comarea,
                            // 房源类型
                            purpose: house.purpose,
                            // 同价位最小值
                            priceMin: house.priceMin,
                            // 同价位最大值
                            priceMax: house.priceMax,
                            // 房源id
                            houseid: house.houseid
                        };
                        // 如果小区id不存在，不请求其他数据，只渲染房源信息
                        if (+house.plotid) {
                            resolve();
                        } else {
                            reject();
                        }
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    /**
     * 获取位置信息
     * @return {[object promise]}
     */
    getPosInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                projCode: this.queryInfo.projCode
            }
            utils.request({
                url: vars.interfaceSite + 'esfDsPos',
                data: params,
                complete: res => {
                    let resData = res.data;
                    if (resData.posInfo) {
                        // 如果位置信息存在，更新经纬度和地铁信息
                        this.setData({
                            x: resData.posInfo.tx_coord && resData.posInfo.tx_coord.tx_coord_x || '',
                            y: resData.posInfo.tx_coord && resData.posInfo.tx_coord.tx_coord_y || '',
                            subInfo: resData.subInfo
                        });
                        resolve();
                        console.log(resData);
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    /**
     * 获取成交记录
     * @return {[object promise]}
     */
    getRecordInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                plotid: this.queryInfo.projCode
            }
            utils.request({
                url: vars.interfaceSite + 'esfRecord',
                data: params,
                complete: res => {
                    console.log(2222);
                    let resData = res.data;
                    if (resData.count) {
                        // 有成交记录，渲染成交数量和第一条成交记录
                        this.setData({
                            'recordInfo.count': +resData.count,
                            'recordInfo.hit': resData.hit[0]
                        });
                    } else {
                        this.setData({
                            'recordInfo.hide': true
                        });
                    }
                    resolve();
                }
            });
        });
    },
    /**
     * 获取相关小区
     * @return {[object promise]}
     */
    getRelatedInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                plotid: this.queryInfo.projCode,
                purpose: this.queryInfo.purpose,
                district: this.queryInfo.district,
                comarea: this.queryInfo.comarea,
                priceMin: this.queryInfo.priceMin,
                priceMax: this.queryInfo.priceMax,
                houseid: this.queryInfo.houseid
            }
            utils.request({
                url: vars.interfaceSite + 'relatEsfNew',
                data: params,
                complete: res => {
                    let resData = res.data;
                    console.log(resData);
                    if (resData.sameXq) {
                        // 如果有数据渲染页面
                        this.setData({
                            // 同小区房源
                            'relatedInfo.sameXq': resData.sameXq.houseinfo,
                            // 同价位房源
                            'relatedInfo.samePrice': resData.samePrise.houseinfo,
                            // 同小区在售房源数量
                            'relatedInfo.allcount': +resData.sameXq.countinfo.allcount,
                            // 房源所在城市
                            'relatedInfo.cityname': this.params.cityname
                        });
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    /**
     * 显示/隐藏更多数据
     * @param  {[object event]} e 点击事件
     * @return null
     */
    toggleMH: function (e) {
        // 当前点击元素的关键字
        let type = e.currentTarget.dataset.type;
        // 显/隐类型，如果 为true,不再隐藏
        let hide = e.currentTarget.dataset.hide;
        let maxHeight = this.data.maxHeight;
        // 显隐flag切换
        maxHeight[type].flag = hide || !maxHeight[type].flag;
        this.setData({
            maxHeight: maxHeight
        });
    },
    /***
     * 打开微信内置地图
     * @returns null
     */
    openPosition: function () {
        // 调用微信地图api
        wx.openLocation({
            // 纬度
            latitude: +this.data.y,
            // 经度
            longitude: +this.data.x,
            // 建筑显示名字
            name: this.data.houseInfo.projname,
            // 建筑显示地址
            address: this.data.houseInfo.address,
            // 缩放等级
            scale: 18
        })
    },
    /**
     * 打电话
     * @param  {[object event]} e 电话信息
     * @return null
     */
    tel: function (e) {
        // 调用微信打电话api
        // wx.makePhoneCall({
        //     phoneNumber: e.currentTarget.dataset.tel,
        //     success: function() {
        //         console.log('拨打电话成功！');
        //     }
        // });

        let ds = e.currentTarget.dataset,
        that = this;
        ds.tel && wx.makePhoneCall({
            phoneNumber: ds.tel,
            success: function() {
                // yf: 增加统计
                utils.request({
                    url: vars.interfaceSite + 'call',
                    data: {
                        city: that.params.cityname || app.userPosition.shortCity || '',
                        tel: ds.tel,
                        houseid: that.params.houseid,
                        housetype: that.params.housetype
                    }
                })
            }
        });
    }
};
utils.assign(page, share);
// 渲染页面
Page(page);
