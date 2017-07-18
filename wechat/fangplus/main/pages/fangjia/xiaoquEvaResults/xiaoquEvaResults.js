/**
 * xiaoquEvaResults.js
 * @file 小区评估结果页
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
// 小程序实例
const app = getApp();
// promise模块
const Promise = require('../../../utils/promise.js').Promise;
// 通用方法模块
const common = require('../../../utils/common.js');
// 工具方法模块
const utils = require('../../../utils/utils.js');
let vars = app.vars;
let page = {
    // 分享
    onShareAppMessage: function () {
        let that = this;
        let detail = this.data.pageInfo.pgdetail, dot = ',';
        let district = detail.district ? (detail.district + dot) : '';
        let projName = detail.projName ? (detail.projName + dot) : '';
        let buildArea = detail.buildArea ? (detail.buildArea + '平米') : '';
        let path = '/pages/fangjia/index/index?' + 'cityname=' + that.params.cityname;
        // 定位城市若为当前城市
        if (app.userPosition && app.userPosition.location && app.userPosition.location.bdlat && app.userPosition.location.bdlng && app.userPosition.shortCity === that.params.cityname) {
            path += '&x=' + app.userPosition.location.bdlng + '&y=' + app.userPosition.location.bdlat;
        }
        return {
            title: '我家房子竟然值' + (detail.totalPrice || '') + '万，不服来比比看',
            desc: district + projName + buildArea,
            path: path
        };
    },
    data: {
        // 页面信息
        pageInfo: {},
        // 页面加载完成标识
        dataLoad: false,
        // 小区案例每次加载个数
        pageSize: 10
    },

    /***
     * 查看更多:每页加载10条
     */
    showMore: function () {
        let pageInfo = this.data.pageInfo.record;
        if (!pageInfo.loading) {
            pageInfo.page = (pageInfo.page || 1) + 1
            let total = pageInfo.count;
            let hit = pageInfo.hit;
            let loadedNum = hit.length;
            if (!(loadedNum > total)) {
                // 当等于时也表示加载完成需要显示剩下的的
                if (loadedNum == total) {
                    console.log('loadedNum == total');
                    this.setData({
                        // 设置当前显示的条数
                        'pageInfo.pgdetail.hasShowSize': loadedNum
                    });
                    return;
                }

                this.setData({
                    'pageInfo.record.loading': true
                });
                let data = {
                    page: pageInfo.page,
                    pagesize: this.data.pageSize,
                    projcode: this.params.newcode,
                    cityname: this.params.cityname
                };
                // 获取加载信息
                utils.request({
                    url: vars.interfaceSite + 'tradeRecord',
                    data: data,
                    complete: res => {
                        let resData = res.data;
                        if (resData.hit && resData.hit.length) {
                            pageInfo.hit = pageInfo.hit.concat(resData.hit);
                            this.setData({
                                // 设置当前显示的条数
                                'pageInfo.pgdetail.hasShowSize': this.data.pageInfo.pgdetail.hasShowSize + this.data.pageSize,
                                // 加载完成
                                'pageInfo.record.loading': false,
                                // 已经加载条数
                                'pageInfo.record.hit': pageInfo.hit
                            });
                            console.log(this.data.pageInfo.pgdetail.hasShowSize + '  ' + resData.hit.length);
                        }
                    }
                });
            }
        }
    },
    /***
     * 页面加载回调
     * @param options 页面参数
     */
    onLoad: function (options) {
        // Do some initialize when page load.
        var that = this;
        // 设置loading
        that.loadingToast();
        that.options = options || {};
        that.options.cityname = that.options.cityname || app.userPosition.shortCity || '北京';
        that.params = that.options;
        // 设置标题
        that.options.Projname && wx.setNavigationBarTitle({
            title: that.options.Projname
        });
        // 获取页面信息
        let pageInfoTask = new Promise(function (resolve, reject) {
            utils.request({
                url: vars.interfaceSite + 'estimateResultApi',
                data: {
                    cityname: that.options.cityname,
                    newcode: that.options.newcode,
                    Projname: that.options.Projname,
                    // 朝向
                    forward: that.options.foward,
                    // 面积
                    Area: that.options.Area,
                    // 楼层
                    floor: that.options.floor,
                    //  调试接口用
                    //  __DEBUG_MODE__:'',
                    // 总楼层
                    zfloor: that.options.zfloor
                },
                // dataType: 'text',
                // method: 'GET',
                complete: res => {
                    let resData = res.data;
                    // 加载成功 == 因为两端数据类型不一致
                    if (res.statusCode == 200 && typeof resData === 'object') {
                        // 设置附近小区价格为整数
                        if (resData && resData.pgdetail && typeof resData.pgdetail === 'object') {
                            let info = resData.pgdetail;
                            info.totalPrice = parseInt((info.totalPrice || 0) / 10000);
                            info.avagePrice = parseInt((info.avagePrice || 0));
                            info.avagePgPrice = parseInt((info.avagePgPrice || 0));
                            // 环比箭头
                            info.arrowFlag = info.monthadd.indexOf('-') === -1 ? 'jtd-up' : 'jtd-dn';
                            // 若为为0%则无箭头
                            parseFloat(info.monthadd) === 0 && (info.arrowFlag = '');
                            // 环比去掉负号
                            info.monthadd = info.monthadd.replace(/^-/, '');
                            // 初始化已加载附近小区个数
                            info.hasShowSize = 3;
                            resData.pgdetail = info;
                        }
                        // 设置页面信息
                        that.setData({
                            dataLoad: true,
                            pageInfo: resData
                        });
                    } else {
                        reject();
                    }
                }
            });
        });
    }
};
// 合并模块方法
utils.assign(page, common);
Page(page);
