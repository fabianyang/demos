/**
 * @file 还款详情页
 * @author tankunpeng
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
// 基础方法模块
const utils = require('../../../utils/utils.js');
// 贷款数据计算
const modelParse = require('../components/modelParse.js');
// 分享
const share = require('../../../utils/share.js');
// 通用方法模块
const common = require('../../../utils/common.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let vars = app.vars;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
let pageIndex = {
    onShareAppMessage: function () {
        return {
            title: '还款详情',
            desc: '房天下覆盖全国600多个城市，提供买新房、买二手房、查房价服务。房天下让买房变得更容易！',
            path: utils.getCurrentPage().path
        }
    },
    data: {
        vars: app.vars,
        // 首次加载标识
        firstLoad: true,
        // 滚动title
        titleYear: 1
    },
    onShow: function () {
        if (!this.data.firstLoad) {
            this.init();
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
        this.init();
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
                        'showNetwork': true
                    });
                    setTimeout(() => {
                        this.setData({
                            'showNetwork': false
                        });
                    }, 2000);
                }
                console.log('网络状态--',networkType);
            }
        });
    },
    /**
     * 页面初始化
     */
    init: function () {
        console.log(this.params);
        // pages/tools/detail/detail?payMethodType=0&pageType=0&totalMoney=100&dkTotalMoney=70&sfMoney=30&ajYear=20&rateDiscount=1.0&rate=4.9
        // dk={"dkMoney":500000,"monthNum":240,"monthRate":0.004083333333333334,"initrateVal":"4.90","rateDiscount":"1"}&gjj={"dkMoney":300000,"monthNum":240,"monthRate":0.0027083333333333334,"initrateVal":"3.25","rateDiscount":"1"}&payMethodType=0&pageType=2
        let dkData = {
            // 还款类型 0:等额本息 1:等额本金
            payMethodType: '0',
            // 贷款类型 0:商业贷款 1:公积金贷款 2:组合贷款
            pageType: '0',
            // 房价总额
            totalMoney: '100',
            // 贷款总额(万元)
            dkTotalMoney: '70',
            // 首付比例(万元)
            sfMoney: '30',
            // 按揭年数
            ajYear: '20',
            // 利率倍数
            rateDiscount: '1.0',
            // 利率
            rate: '4.9'
        };
        let dk = this.params.dk;
        let gjj = this.params.gjj;
        if (dk && typeof dk === 'string') {
            this.params.dk = JSON.parse(dk);
        }
        if (gjj && typeof gjj === 'string') {
            this.params.gjj = JSON.parse(gjj);
        }
        console.log(this.params);
        Object.assign(this.data,this.params);
        // 设置scroll-view 高度
        this.setScrollHeight();
        this.detail(this.data);
    },
    /**
     * 设置scroll-view 高度
     */
    setScrollHeight: function () {
        wx.getSystemInfo({
            success: (res) => {
                // 头部元素总高为180px
                this.setData({
                    scrollHeight: res.windowHeight - 180
                });
            }
        })
    },

    /**
     * 滚动时更新标题
     */
    updateScrollTitle: function (e) {
        let scrollTop = e.detail.scrollTop;
        let num = Math.ceil(scrollTop / 367) || 1;
        this.setData({
            titleYear: num
        });
    },
    /**
     * 选择贷款类型
     */
    selectReimbursementType: function (e) {
        this.data.payMethodType = e.currentTarget.dataset.act;
        this.detail(this.data);
    },

    /**
     * 计算贷款数据
     * @param data
     */
    detail: function (data) {
        // (3)计算结果
        modelParse.calResult(data);
        var resultData = modelParse.detailCalResult(data.payMethodType);
        console.log(resultData);
        this.setData(resultData);
    }
};
// 合并模块方法
let pagejson = utils.assign(pageIndex,common, share);
// 渲染页面
Page(pagejson);
