/**
 * sfbdetail.js
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
        cityname: '',
        x: '',
        y: '',
        houseInfo: {
            tags: []
        },
        // 隐藏/显示 flag
        maxHeight: {
            housedetail: {
                flag: false,
                alwaysShow: false
            },
            zbpt: {
                flag: false,
                alwaysShow: false
            },
            traffic: {
                flag: false,
                alwaysShow: false
            }
        },
        subInfo: '',
        recordInfo: {
            count: '',
            hit: ''
        },
        relatedInfo: {
            sameXq: [],
            samePrice: [],
            allcount: ''
        }
    },

    onLoad: function (params) {
        console.log(params);
        this.params = params || {};
        this.setData({
            cityname: this.params.cityname,
            x: this.params.x,
            y: this.params.y
        })
        this.init();
    },
    init: function () {
        this.gethouseInfo().catch().then(this.getRecordInfo).catch(() => {}).then(this.getPosInfo).catch(() => {}).then(this.getRelatedInfo);
    },
    gethouseInfo: function () {
        return new Promise((resolve, reject) => {
            wx.request({
                url: vars.interfaceSite + 'esfDetail',
                data: this.params,
                complete: res => {
                    let resData = res.data;
                    let house = resData.house;
                    let houseInfo = this.data.houseInfo;
                    console.log(house);
                    if (house) {
                        utils.assign(houseInfo, house);
                        this.setData({
                            houseInfo: houseInfo
                        });
                        // 设置标题
                        wx.setNavigationBarTitle({
                            title: house.title
                        });
                        this.queryInfo = {
                            district: house.district,
                            projCode: house.plotid,
                            comarea: house.comarea,
                            purpose: house.purpose,
                            priceMin: house.priceMin,
                            priceMax: house.priceMax,
                            houseid: house.houseid
                        };

                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    getPosInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                projCode: this.queryInfo.projCode
            }
            wx.request({
                url: vars.interfaceSite + 'esfDsPos',
                data: params,
                complete: res => {
                    let resData = res.data;
                    if (resData.subInfo) {
                        this.setData({
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
    getRecordInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                plotid: this.queryInfo.projCode
            }
            wx.request({
                url: vars.interfaceSite + 'esfRecord',
                data: params,
                complete: res => {
                    console.log(2222);
                    let resData = res.data;
                    if (resData.count) {
                        this.setData({
                            'recordInfo.count': resData.count,
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
    getRelatedInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                projCode: this.queryInfo.projCode,
                purpose: this.queryInfo.purpose,
                district: this.queryInfo.district,
                comarea: this.queryInfo.comarea,
                priceMin: this.queryInfo.priceMin,
                priceMax: this.queryInfo.priceMax,
                houseid: this.queryInfo.houseid
            }
            wx.request({
                url: vars.interfaceSite + 'relatEsf',
                data: params,
                complete: res => {
                    let resData = res.data;
                    console.log(resData);
                    if (resData.sameXq) {
                        this.setData({
                            'relatedInfo.sameXq': resData.sameXq.houseinfo,
                            'relatedInfo.samePrice': resData.samePrise.houseinfo,
                            'relatedInfo.allcount': resData.sameXq.countinfo.allcount,
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
    toggleMH: function (e) {
        let type = e.currentTarget.dataset.type;
        let hide = e.currentTarget.dataset.hide;
        let maxHeight = this.data.maxHeight;
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
        wx.openLocation({
            latitude: +this.data.y,
            longitude: +this.data.x,
            name: this.data.houseInfo.projname,
            address: this.data.houseInfo.address,
            scale: 18
        })
    },
    tel: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.tel
        });
    }
};
utils.assign(page,share);
// 渲染页面
Page(page);
