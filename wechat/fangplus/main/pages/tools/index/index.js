// pages/tools/index/index.js

/**
 * @file 商业贷款业务逻辑
 * @author tankunpeng
 * @modify yangfan
 * 数值或字符串定义原则：只有计算需要使用时，使用数值。
 */
// const Promise = require('../../../utils/promise.js').Promise;
// 分享
// const share = require('../../../utils/share.js');
// 通用方法模块
// const common = require('../../../utils/common.js');
// object序列化为请求参数串
// 通用数据
// let vars = app.vars;

const titleSelector = require('../components/titleSelector.js');
const loanSelector = require('../components/loanSelector.js');
const repaySelector = require('../components/repaySelector.js');
const form = require('../components/form.js');
const floatBox = require('../components/floatBox.js');
const model = require('../components/modelParse.js');

const app = getApp();
// 基础方法模块
const utils = require('../../../utils/utils.js');
let queryStringify = utils.queryStringify;

// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);

// Extend the default Number object with a formatMoney() method:
// usage: someVar.formatMoney(decimalPlaces, symbol, thousandsSeparator, decimalSeparator)
// defaults: (2, "$", ",", ".")
function formatMoney(numbers, places, symbols, thousand, decimal) {
    numbers = numbers || 0;
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbols = symbols !== undefined ? symbols : '';
    thousand = thousand || ',';
    decimal = decimal || '.';
    var negative = numbers < 0 ? '-' : '',
        i = parseInt(numbers = Math.ceil(Math.abs(+numbers || 0)).toFixed(places), 10) + '',
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbols + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(numbers - i).toFixed(places).slice(2) : '');
};


let pageIndex = {
    onShareAppMessage: function () {
        return {
            title: '房贷计算器',
            desc: '房天下覆盖全国600多个城市，提供买新房、买二手房、查房价服务。房天下让买房变得更容易！',
            path: utils.getCurrentPage().path
        }
    },
    data: {
        vars: app.vars,
        // 首次加载标识
        firstLoad: true,
        titleSelector: {
            index: '0',
            store: {}
        },
        loanSelector: {
            index: '0',
            store: {}
        },
        repaySelector: {
            index: '0'
        },
        form: {
            listRate: [
                { val: 1, txt: '基准利率' },
                { val: 0.7, txt: '7折' },
                { val: 0.75, txt: '75折' },
                { val: 0.8, txt: '8折' },
                { val: 0.85, txt: '85折' },
                { val: 0.88, txt: '88折' },
                { val: 0.9, txt: '9折' },
                { val: 0.95, txt: '95折' },
                { val: 1.1, txt: '1.1倍' },
                { val: 1.2, txt: '1.2倍' },
                { val: 1.3, txt: '1.3倍' }
            ],
            payRatio: [
                { val: 0.2, txt: '20%' },
                { val: 0.25, txt: '25%' },
                { val: 0.3, txt: '30%' },
                { val: 0.35, txt: '35%' },
                { val: 0.4, txt: '40%' },
                { val: 0.45, txt: '45%' },
                { val: 0.5, txt: '50%' },
                { val: 0.55, txt: '55%' },
                { val: 0.6, txt: '60%' },
                { val: 0.65, txt: '65%' },
                { val: 0.7, txt: '70%' },
                { val: 0.75, txt: '75%' },
                { val: 0.8, txt: '80%' }
            ],
            loanTerm: [
                // { term: 204, val: 17, txt: '17年（204期）' },
                // { term: 216, val: 18, txt: '18年（216期）' },
                // { term: 228, val: 19, txt: '19年（228期）' },
                // { term: 240, val: 20, txt: '20年（240期）' },
                // { term: 252, val: 21, txt: '21年（252期）' },
                // { term: 264, val: 22, txt: '22年（264期）' },
                // { term: 276, val: 23, txt: '23年（276期）' }
            ],
            // 请求后要重置
            selected: {
                lendRate: { idx: '0', val: 1, txt: '基准利率（4.90%）' },
                fundRate: { idx: '0', val: 1, txt: '基准利率（3.25%）' },
                payRatio: { idx: '2', val: 0.3, txt: '30%' },
                loanTerm: { idx: '10', val: 20, txt: '20年（240期）' }
            },
            custom: {
                lendRate: '',
                fundRate: ''
            }, 
            input: {
                houseMoney: 0, // 按房价计算都在使用
                lendMoney: 0, // 商业贷、公积金贷使用
                lendMoneyDis: 0, // 商业贷、公积金贷按房价计算使用
                fundMoney: 0, // 组合贷使用
                fullMoney: 0, // 组合贷使用
                fullMoneyDis: 0 // 组合贷使用
            },
            baseRate: {
                lend: 4.9,
                fund: 3.25
            }
        },
        floatBox: {
            open: ''
        },
        store: [],
        result: null,
        listLilv: [
            [4.34,4.75,4.75,4.90].reverse(),
            [2.75,3.25].reverse()
        ],
        // pageType: 0,
        toastText: '',
        lilv: '4.34,4.75,4.75,4.90|2.75,3.25'
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

        var a = [];
        for (let i = 30; i > 0; i--) {
            a.push({
                val: i, txt: i + '年（' + i * 12 + '期）'
            })
        }
        this.setData({
            'form.loanTerm': a
        });

        wx.getStorage({
            key: model.wxStorageKey,
            complete: res => {
                if (res.data) {
                    this.updateLilv(res.data);
                }
                // 比较时间戳
                this.compareTime();
            }
        });
    },
    /**
     * 比较比较时间戳
     */
    compareTime: function () {
        let nowDate = new Date();
        let nowTime = nowDate.getTime();
        let beTime = 24 * 60 * 60 * 1000;
        wx.getStorage({
            key: model.wxStorageKeyTimeStamp,
            complete: res => {
                let storageTime = parseInt(res.data);
                if (storageTime) {
                    if (nowTime - storageTime >= beTime) {
                        this.getLilv();
                    } else {
                        let nowDay = nowDate.getDate();
                        let storageDay = new Date(storageTime).getDate();
                        if (nowDay !== storageDay) {
                            this.getLilv();
                        }
                    }
                } else {
                    this.getLilv();
                }
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
                        'showNetwork': true
                    });
                    setTimeout(() => {
                        this.setData({
                            'showNetwork': false
                        });
                    }, 2000);
                }
                console.log('网络状态--', networkType);
            }
        });
    },
    /**
     * 页面初始化
     */
    init: function () {
    },

    getLilv: function () {
        let that = this;
        utils.request({
            url: app.vars.interfaceSite + 'getLilv',
            complete: function (res) {
                let data;
                if (res.data && that.data.lilv !== res.data) {
                    data = res.data;
                } else {
                    data = that.data.lilv;
                }
                // 暂时放到 localStroage
                wx.setStorage({
                    key: model.wxStorageKey,
                    data: data
                });
                wx.setStorage({
                    key: model.wxStorageKeyTimeStamp,
                    data: new Date().getTime()
                });
                that.updateLilv(data);
            }
        });
    },

    /**
     * 更新利率
     * @param ite 利率数据
     */
    updateLilv: function (ite) {
        // 初始化，请求比较
        let data = this.data;
        
        data.lilv = ite;

        let s = ite.split('|');
        // 转化成数字
        let br = [
            // 商贷利率
            s[0].split(',').map((val) => { return parseFloat(val) }).reverse(), 
            // 公积金贷利率
            s[1].split(',').map((val) => { return parseFloat(val) }).reverse()
        ];

        data.listLilv = {
            lend: br[0],
            fund: br[1]
        };
        data.form.baseRate = {
            lend: br[0][0],
            fund: br[1][0]
        }

        this.setData({
            'form.selected.lendRate.txt': '基准利率（' + br[0][0] + '%）',
            'form.selected.fundRate.txt': '基准利率（' + br[1][0] + '%）',
        });

        // 这里最好进行对象浅拷贝
        data.initSelected = {
            lendRate: { idx: '0', val: 1, txt: '基准利率（' + br[0][0] + '%）' },
            fundRate: { idx: '0', val: 1, txt: '基准利率（' + br[1][0] + '%）' },
            payRatio: { idx: '2', val: 0.3, txt: '30%' },
            loanTerm: { idx: '10', val: 20, txt: '20年（240期）' }
        };

        // 这里最好进行对象浅拷贝
        data.initInput = {
            houseMoney: 0,
            fullMoney: 0,
            lendMoney: 0,
            fundMoney: 0,
            fullMoneyDis: 0,
            lendMoneyDis: 0
        };

        // 这里最好进行对象浅拷贝
        data.initSelector = {
            index: '0',
            store: {}
        };

        // let that = this;
        // wx.getStorage({
        //     key: model.wxStorageKeyIndexStore + '.' + data.pageType,
        //     complete: res => {
        //         let data = res.data;
        //         if (data) {
        //             let json = JSON.parse(res.data);
        //             this.data.store = json['store'];
        //             this.setData({
        //                 'loanSelector.index': json['loanSelector.index'],
        //                 'form.selected': json['form.selected'],
        //                 'form.houseMoney': json['form.houseMoney'],
        //                 'form.lendMoney': json['form.lendMoney'],
        //                 'form.lendMoneyDis': json['form.lendMoneyDis']
        //             })
        //         }
        //     }
        // });

    },

    /**
     * 阻止冒泡
     */
    stopPropagation: function () {
        return false;
    },

    hideToast: function () {
        let timer = null,
            that = this;
        timer = setTimeout(function () {
            that.setData({
                'toastText': ''
            });
            clearTimeout(timer);
        }, 1000);
    },
    calcResult: function (e) {
        let data = this.data;
        /**
         * 默认按贷款总额计算 参数
         */

        let dkData = {
            // 还款类型 0:等额本息 1:等额本金
            payMethodType: data.repaySelector.index,
            // 贷款类型 0:商业贷款 1:公积金贷款 2:组合贷款
            pageType: data.titleSelector.index,
            // 贷款总额(万元)
            dkTotalMoney: data.form.input['lendMoney'],
            // 按揭年数
            ajYear: data.form.selected['loanTerm'].val,
            // 利率倍数
            rateDiscount: data.form.selected['lendRate'].val + '',
            // 利率
            rate: data.form.baseRate[data.titleSelector.index === '0' ? 'lend' : 'fund'] * data.form.selected['lendRate'].val
        }

        if (data.titleSelector.index !== '2') {
            /**
             * 按房价总额计算 参数
             */
            if (data.loanSelector.index === '1') {
                // 房价总额
                dkData['totalMoney'] = data.form.input.houseMoney;
                // 首付比例(万元)
                dkData['sfMoney'] = data.form.selected['payRatio'].val;
                dkData['dkTotalMoney'] = data.form.input['lendMoneyDis'];
            }

            let key = data.titleSelector.index === '0' ? 'lendRate' : 'fundRate';
            if (data.form.selected[key].custom) {
                dkData['rate'] = data.form.selected[key].val;
                dkData['rateDiscount'] = '0';
            }


        } else {
            /**
             * 组合贷
             */
            let dk = {
                dkMoney: data.form.input['lendMoney'] * 10000, // data.dkTotalMoney * 10000
                monthNum: data.form.selected['loanTerm'].val * 12 + '', // data.ajYear * 12
                monthRate: data.form.baseRate['lend'] * data.form.selected['lendRate'].val / 1200, // data.rate * 0.01 / 12;
                initrateVal: data.form.baseRate['lend'] * data.form.selected['lendRate'].val,
                rateDiscount: data.form.selected['lendRate'].val + ''
            };

            if (data.form.selected['lendRate'].custom) {
                dk['rate'] = data.form.selected['lendRate'].val;
                dk['rateDiscount'] = '0';
            }

            let gjj = {
                dkMoney: data.form.input['fundMoney'] * 10000,
                monthNum: data.form.selected['loanTerm'].val * 12 + '',
                monthRate: data.form.baseRate['fund'] * data.form.selected['fundRate'].val / 1200,
                initrateVal: data.form.baseRate['fund'] * data.form.selected['fundRate'].val,
                rateDiscount: data.form.selected['fundRate'].val + ''
            };

            if (data.form.selected['fundRate'].custom) {
                dk['rate'] = data.form.selected['fundRate'].val;
                dk['rateDiscount'] = '0';
            }

            dkData = {
                dk: dk,
                gjj : gjj,
                payMethodType: data.repaySelector.index,
                pageType: data.titleSelector.index
            };
        }

        var result = model.calResult(dkData);
        var payInfo = result.payInfo;

        // different: 0
        // dkMonth: 240
        // dkmoney: 700000
        // hkmoney: 1099467
        // monthAvgPay: 4582
        // monthPayOrigin: "4581.11"
        // monthRate: 0.004083333333333334
        // payLx: 399467
        // payMethodType: "0"

        if (data.titleSelector.index !== '2') {
            this.setData({
                'result': {
                    diff: +payInfo.different || (0).toFixed(2),
                    payMonth: formatMoney(payInfo.monthPayOrigin, 0),
                    lendMoney: (payInfo.dkmoney / 10000).toFixed(2) + '万',
                    interest: (payInfo.payLx / 10000).toFixed(2) + '万',
                    payMoney: (payInfo.hkmoney / 10000).toFixed(2) + '万',
                    hrefParams: queryStringify(dkData)
                }
            });
        } else {
            this.setData({
                'result': {
                    diff: (+payInfo.dk.different) + (+payInfo.gjj.different) || (0).toFixed(2),
                    payMonth: formatMoney(payInfo.monthAvgPay, 0),
                    lendMoney: ((payInfo.dk.dkMoney + payInfo.gjj.gjjMoney) / 10000).toFixed(2) + '万',
                    interest: (payInfo.payLx/ 10000).toFixed(2) + '万',
                    payMoney: (payInfo.hkmoney/ 10000).toFixed(2) + '万',
                    hrefParams: queryStringify(dkData)
                }
            });
        }
        setTimeout(() => {
            this.setData({
                'calcScrollTo': 'calcBtn'
            });
        }, 0);
    }
};
// 合并模块方法
// let pagejson = utils.assign(pageIndex, common, share);
let pagejson = utils.assign(pageIndex, titleSelector, loanSelector, repaySelector, form, floatBox);
// 渲染页面
Page(pagejson);
