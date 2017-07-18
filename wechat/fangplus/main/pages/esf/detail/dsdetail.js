/**
 * dsdetail.js
 * @file 二手房电商详情页
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
            desc: this.data.houseInfo.housetitle,
            title: this.data.houseInfo.projname + '|' + this.data.houseInfo.room + '室' + this.data.houseInfo.hall + '厅|' + this.data.houseInfo.area + '平米|' + this.data.houseInfo.price + '万'
        };
    },
    // 用于请求数据
    queryInfo: {
        projCode: '',
    },
    // 页面数据
    data: {
        cityname: '',
        houseInfo: {
            tags: []
        },
        defaultImg: vars.defaultImg,
        // 隐藏/显示 flag
        maxHeight: {
            housedetail: {
                flag: false,
                alwaysShow: false
            },
            yzzp: {
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
            },
            discribe0: {
                flag: false,
                alwaysShow: false
            },
            discribe1: {
                flag: false,
                alwaysShow: false
            },
            discribe2: {
                flag: false,
                alwaysShow: false
            }
        },
        // 地铁信息
        subInfo: '',
        // 成交信息
        recordInfo: {
            count: '',
            hit: ''
        },
        // 相关小区信息
        relatedInfo: {
            sameXq: [],
            samePrice: [],
            allcount: ''
        },
        // 经纪人评论信息
        commentInfo: {
            shareAgent: []
        }
    },

    onLoad: function (params) {
        wx.showToast({
            icon: 'loading',
            title: '数据加载中...'
        });
        console.log(params);
        this.params = params || {};
        this.init();
    },
    /**
     * 初始化
     * @return null
     */
    init: function () {
        this.setData({
            cityname: this.params.cityname,
            x: this.params.x,
            y: this.params.y
        });
        // 获取房源信息=>获取位置信息=>获取经纪人评论信息=>获取成交记录信息=>获取相关小区信息
        this.gethouseInfo().then(() => {
            this.getPosInfo().catch(() => {}).then(this.getAgentInfo).catch(() => {}).then(this.getRecordInfo).catch(() => {}).then(this.getRelatedInfo);
        }, () => {});
    },
    /**
     * 获取房源信息
     * @return null
     */
    gethouseInfo: function () {
        return new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSite + 'esfDsDetailNew',
                data: this.params,
                complete: res => {
                    console.log(res);
                    let resData = res.data;
                    let house = resData;
                    let houseInfo = this.data.houseInfo;
                    console.log(house);
                    if (house) {
                        // 房源数据存在，渲染页面
                        utils.assign(houseInfo, house);
                        this.setData({
                            houseInfo: houseInfo
                        });
                        // 设置标题
                        wx.setNavigationBarTitle({
                            title: house.projname
                        });
                        // 隐藏加载中动画
                        wx.hideToast();
                        // 记录房源相关信息，用于之后查询房源相关信息
                        this.queryInfo = {
                            // 区域
                            district: house.district,
                            // 小区id
                            projCode: house.projcode,
                            // 商圈
                            comarea: house.comarea,
                            // 房屋类型
                            purpose: house.purpose,
                            // 同价位最小值
                            priceMin: house.priceMin,
                            // 同价位最大值
                            priceMax: house.priceMax,
                            // 房源id
                            houseid: house.houseid
                        };
                        // 如果小区id存在，继续渲染其他相关信息，否则不渲染
                        if (+house.projcode) {
                            resolve()
                        } else {
                            this.setData({
                                isInfoLoad: true
                            });
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
     * @return {{[object promise]}}
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
                        // 位置信息如在，渲染位置信息
                        // 附近交通数据换行
                        if (resData.posInfo.Bustext) {
                            resData.posInfo.BustextArr = resData.posInfo.Bustext.split('\n');
                        }
                        let md = {
                            //经度
                            x: resData.posInfo.tx_coord && resData.posInfo.tx_coord.tx_coord_x || '',
                            // 纬度
                            y: resData.posInfo.tx_coord && resData.posInfo.tx_coord.tx_coord_y || '',
                            // 地铁信息
                            subInfo: resData.subInfo,
                            // 位置信息
                            posInfo: resData.posInfo
                        };
                        this.setData(md);
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
     * 获取经纪人数据
     * @return {{[object promise]}}
     */
    getAgentInfo: function () {
        return new Promise((resolve, reject) => {
            let params = {
                cityname: this.params.cityname,
                houseid: this.data.houseInfo.houseid
            }
            utils.request({
                url: vars.interfaceSite + 'jjrPhone',
                data: params,
                complete: res => {
                    let resData = res.data;
                    // 如果品论数据存在，则渲染经纪人评论
                    if (resData.commentInfo) {
                        // 评论内容换行处理
                        for (let i = 0, len = resData.commentInfo.content.length; i < len; i++) {
                            resData.commentInfo.content[i].DescriptionArr = resData.commentInfo.content[i].Description.split('\n');
                        }
                        this.setData({
                            // 评论信息
                            commentInfo: resData.commentInfo,
                            // 业主电话信息
                            ownerPhoneArr: resData.ownerPhoneArr
                        });
                        resolve();
                        console.log(resData);
                    } else {
                        this.setData({
                            isInfoLoad: true
                        });
                        resolve();
                    }
                }
            });
        });
    },
    /**
     * 获取成交记录信息
     * @return {{[object promise]}}
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
                    let resData = res.data;
                    if (resData.count) {
                        // 成交记录数量存在且不为0，显示成交记录
                        this.setData({
                            // 成交数量
                            'recordInfo.count': +resData.count,
                            // 第一条成交记录
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
     * 相关房源数据
     * @return {{[object promise]}}
     */
    getRelatedInfo: function () {
        console.log(33333);
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
            utils.request({
                url: vars.interfaceSite + 'relatDsEsfNew',
                data: params,
                complete: res => {
                    let resData = res.data;
                    console.log(resData);
                    if (resData.sameXq) {
                        this.setData({
                            // 同小区房源
                            'relatedInfo.sameXq': resData.sameXq.houseinfo,
                            // 同价位房源
                            'relatedInfo.samePrice': resData.samePrise.houseinfo,
                            // 同小区房源数量
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
     * 显/隐切换
     * @param  {[object event]} e 点击事件
     * @return null
     */
    toggleMH: function (e) {
        // 当前点击元素关键字
        let type = e.currentTarget.dataset.type;
        // 显隐类型，如果hide=true 显示以后不再隐藏
        let hide = e.currentTarget.dataset.hide;
        // 显隐数据记录对象
        let maxHeight = this.data.maxHeight;
        // 显隐切换切换
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
        // 调用wx地图api
        wx.openLocation({
            // 纬度
            latitude: +this.data.y,
            // 经度
            longitude: +this.data.x,
            // 建筑显示名称
            name: this.data.houseInfo.projname,
            // 建筑显示地址
            address: this.data.houseInfo.address,
            // 地图缩放等级
            scale: 18
        })
    },
    /**
     * 打电话
     * @param  {[object e]} e 点击事件
     * @return null
     */
    tel: function (e) {
        // 调用微信打电话api
    //    e.currentTarget.dataset.tel && wx.makePhoneCall({
    //         phoneNumber: e.currentTarget.dataset.tel
    //     });

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
    },
    /**
     * 显隐经纪人电话弹层
     * @return null
     */
    toggleTel: function () {
        this.setData({
            showTel: !this.data.showTel
        });
    },
    stopPropagation: () => {}
};
utils.assign(page, share);
// 渲染页面
Page(page);
