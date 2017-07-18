/**
 * @file 房贷计算器
 * @author tankunpeng
 */
const app = getApp();
// 基础方法模块
const utils = require('../../../utils/utils.js');
// 贷款数据计算
const modelParse = require('../components/modelParse.js');
const model = require('../components/modelParse.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let lets = app.lets;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
let pageIndex = {
    onShareAppMessage: function () {
        return {
            title: '房贷计算器',
            desc: '房天下覆盖全国600多个城市，提供买新房、买二手房、查房价服务。房天下让买房变得更容易！',
            path: utils.getCurrentPage().path
        }
    },
    data: {
        lets: app.lets,
        // 首次加载标识
        firstLoad: true,
        lilv: '4.34,4.75,4.75,4.90|2.75,3.25',
        act: 2,
        // 计算结果显示类型
        rtype: 0,
        // 按照贷款
        dkType: true,
        // 按照房价
        fjType: false,
        // 贷款总额
        dkze_dk: '',
        dkze_fj: '',
        // 商业贷款
        sydk_dk: '',
        sydk_fj: '',
        // 公积金金额
        gjjdk_dk: '',
        gjjdk_fj: '',
        // 房价总额
        fjze_fj: '',
        // 提示弹框标识
        errFlag: false,
        // 付款总额
        fjze: '',
        // 底部菜单弹框
        floatBox: false,
        // 商贷利率弹框
        sdlvFlag: false,
        // 首付比例弹框
        sfblFlag: false,
        // 贷款年限弹框
        dknxFlag: false,
        // 公积金弹框
        gjjFlag: false,
        // 贷款年限显示值
        dknx_fj: '20年（240期）',
        dknx_fj_val: '240',
        dknx_dk: '20年（240期）',
        dknx_dk_val: '240',
        // 贷款年限数据
        yearList: [],
        // 标识是否自定义利率
        zdyGFlag: false,
        zdySFlag: false,
        // 首付比例数据
        sfList: [
            { val: 0.2, text: '20%',cla: '', id: 0},
            { val: 0.25, text: '25%',cla: '', id: 1},
            { val: 0.3, text: '30%',cla: 'active', id: 2},
            { val: 0.35, text: '35%',cla: '', id: 3},
            { val: 0.4, text: '40%',cla: '', id: 4},
            { val: 0.45, text: '45%',cla: '', id: 5},
            { val: 0.5, text: '50%',cla: '', id: 6},
            { val: 0.55, text: '55%',cla: '', id: 7},
            { val: 0.6, text: '60%',cla: '', id: 8},
            { val: 0.65, text: '65%',cla: '', id: 9},
            { val: 0.7, text: '70%',cla: '', id: 10},
            { val: 0.75, text: '75%',cla: '', id: 11},
            { val: 0.8, text: '80%',cla: '', id: 12}
        ],
        sfbl_fj: '0.3',
        sfbl: '30%',
        businessRate: '',
        fundRate: '',
        rate: '',
        // 自定义商贷
        zdysd: '',
        rateMsg: '',
        fundRateMsg: '',
        baseRate: '',
        fundBase:'',
        sdList: [
            {text: '基准利率',cla: 'active',val: 1, id: 0},
            {text: '7折',cla: '',val: 0.7, id: 1},
            {text: '75折',cla: '',val: 0.75, id: 2},
            {text: '8折',cla: '',val: 0.8, id: 3},
            {text: '85折',cla: '',val: 0.85, id: 4},
            {text: '88折',cla: '',val: 0.88, id: 5},
            {text: '9折',cla: '',val: 0.9, id: 6},
            {text: '95折',cla: '',val: 0.95, id: 7},
            {text: '1.1倍',cla: '',val: 1.1, id: 8},
            {text: '1.2倍',cla: '',val: 1.2, id: 9},
            {text: '1.3倍',cla: '',val: 1.3, id: 10}
        ],
        gjjList: [
            {text: '基准利率',cla: 'active',val: 1, id: 0},
            {text: '7折',cla: '',val: 0.7, id: 1},
            {text: '75折',cla: '',val: 0.75, id: 2},
            {text: '8折',cla: '',val: 0.8, id: 3},
            {text: '85折',cla: '',val: 0.85, id: 4},
            {text: '88折',cla: '',val: 0.88, id: 5},
            {text: '9折',cla: '',val: 0.9, id: 6},
            {text: '95折',cla: '',val: 0.95, id: 7},
            {text: '1.1倍',cla: '',val: 1.1, id: 8},
            {text: '1.2倍',cla: '',val: 1.2, id: 9},
            {text: '1.3倍',cla: '',val: 1.3, id: 10}
        ],
        // 结果显示标识符
        showResult: false,
        // 公积金的
        rateDiscountGjj_dk:'1',
        rateDiscountGjj_fj:'1',
        // 商业的
        rateDiscountSy_dk:'1',
        rateDiscountSy_fj:'1',
        // 0 对应等额本息 1对应等额本金
        payMethodType: '0',
        pageType: '2',
        resultParam:'',
        // 默认选择贷款年限
        selectId_dk: 10,
        selectId_fj: 10,
        sdId_dk: 'sd0',
        sfId_dk: 'sf2',
        gjjId_dk: 'gjj0',
        sdId_fj: 'sd0',
        sfId_fj: 'sf2',
        gjjId_fj: 'gjj0'
    },
    href: function () {
        let data = this.data;
        this.setData({
            resultParam: 'dk=' + JSON.stringify(data.dk) + '&gjj=' + JSON.stringify(data.gjj) + '&payMethodType=' + data.payMethodType + '&pageType='+ data.pageType
        });
        wx.navigateTo({
            url: '/pages/tools/detail/detail?' +  this.data.resultParam
        });
    },
    showResult: function (data) {
        let payInfo = data.payInfo;
        this.setData({
            payMonth: data.payMonth,
            different: ((+payInfo.dk.different) + (+payInfo.gjj.different)).toFixed(2),
            dkMoney: (data.dkMoney/ 10000).toFixed(2) + '万',
            payLx: (data.payLx/ 10000).toFixed(2) + '万',
            hkTotalMoney: (data.hkTotalMoney/ 10000).toFixed(2) + '万'
        });
    },
    /**
     * 计算时校验表单完整性
     * @returns {boolean} 不完整返回true
     */
    checkFormValid: function (e) {
        let notValid = true;
        let dataset = e.currentTarget.dataset;
        let errMsg = '';
        let dkze = dataset.dkze,gjjdk = dataset.gjjdk, sydk = dataset.sydk;
        if(!dkze) {
            errMsg = '请输入贷款总额';
        }else if(!gjjdk && gjjdk !== 0) {
            errMsg = '请输入公积金贷款';
        }else if(!sydk && sydk !== 0) {
            errMsg = '请输入商业贷款';
        } else if(gjjdk > 120) {
            errMsg = '目前公积金最大贷款上限为120万';
        }
        if(this.data.fjType) {
            if(!dataset.fjze) {
                errMsg = '请输入房价总额';
            } else if(parseInt(dkze).toString().length > 4) {
                errMsg = '贷款总额超出计算范围';
            }
        }
        if(errMsg) {
            this.showErrMsg(errMsg);
        } else {
            notValid = false;
        }
        return notValid;
    },

    dktap: function (e) {
        let dataset = e.currentTarget.dataset;
        let val = parseFloat(dataset.value);
        if (!val) {
            this.showErrMsg('请输入房价总额');
        }
    },
    calculate: function (e) {
        if(this.checkFormValid(e)) {
            return;
        }
        this.setData({
            showResult: true,
            rtype: '0'
        });
        setTimeout(() => {
            this.setData({
                calcScrollTo: 'calcBtn'
            });
        },0);
        let dataset = e.currentTarget.dataset;
        let flag = dataset.flag;
        let data = this.data;
        let dk = {
            dkMoney:dataset.sydk*10000,
            monthNum:dataset.dknx,
            monthRate:dataset.sdlv/1200,
            initrateVal:dataset.sdlv,
            rateDiscount:data['rateDiscountSy'+flag]
        };
        let gjj = {
            dkMoney:dataset.gjjdk*10000,
            monthNum:dataset.dknx,
            monthRate:dataset.gjjlv/1200,
            initrateVal:dataset.gjjlv,
            rateDiscount:data['rateDiscountGjj'+flag]
        };
        // 重置贷款类型
        data.payMethodType = '0';
        let obj = {
            dk: dk,
            gjj : gjj,
            payMethodType: data.payMethodType,
            pageType: data.pageType
        };
        Object.assign(data,obj);
        this.showResult(modelParse.calResult(obj));
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
        let that = this;
        // 贷款年限数据初始化
        let a = [];
        for(let i=30; i>0; i--) {
            let obj = {val: i * 12, text: i + '年（' + i * 12+ '期）',cla:'',yearId: 30-i};
            if(i == 20) {
                obj.cla = 'active';
            }
            a.push(obj);
        }
        that.setData({
            yearList : a
        });
        wx.getStorage({
            key: model.wxStorageKey,
            complete: res =>{
                if (res.data) {
                    this.updateLilv(res.data);
                }
                // 比较时间戳
                this.compareTime();
            }
        });
    },

    /**
     * 更新利率
     * @param ite 利率数据
     */
    updateLilv: function (ite) {
        let that = this;
        let arr = ite.split('_');
        let data = that.data;
        if (arr && arr.length > 0) {
            data.businessRateArr10 = arr[0].split('|')[0].split(',');
            data.fundRateArr10 = arr[0].split('|')[1].split(',');
            data.businessRate = parseFloat(data.businessRateArr10[data.businessRateArr10.length - 1]);
            data.fundRate = parseFloat(data.fundRateArr10[data.fundRateArr10.length - 1]);
            data.fundBase = parseFloat(data.fundRate);
            data.fundRateMsg = '基准利率（' + data.fundRate + '％）';
            // 初始化页面
            data.rate = that.businessRate;
            data.rateMsg = '基准利率（' + data.businessRate + '％）';
            data.baseRate = data.businessRate;
        }

        wx.getStorage({
            key: model.wxStorageKeyIndexStore + '.' + data.pageType,
            complete: res => {
                let data = res.data;
                if (data) {
                    this.data = JSON.parse(res.data);
                    let data = this.data;
                    that.setData(data);
                    if(data.dkType) {
                        that.setData({
                            dkType: true,
                            fjType: false
                        });
                    } else if(data.fjType){
                        that.setData({
                            dkType: false,
                            fjType: true
                        });
                    }
                }
            }
        });
        that.setData({
            rateMsg_fj: data.rateMsg,
            rateMsg_dk: data.rateMsg,
            rate_dk: data.businessRate,
            rate_fj: data.businessRate,
            fundRateMsg_fj: data.fundRateMsg,
            fundRateMsg_dk: data.fundRateMsg,
            fundRate_dk: data.fundRate,
            fundRate_fj: data.fundRate,
            'lilv': ite,
            showResult: false
        });
    },

    /**
     * 比较比较时间戳
     */
    compareTime: function () {
        let nowDate = new Date();
        let nowTime = nowDate.getTime();
        let beTime = 24*60*60*1000; 
        wx.getStorage({
            key: 'gotLilvTime',
            complete: res =>{
                let storageTime = parseInt(res.data);
                if (storageTime) {
                    if (nowTime - storageTime >= beTime) {
                        this.funcGetData();
                    }else {
                        let nowDay = nowDate.getDate();
                        let storageDay = new Date(storageTime).getDate();
                        if (nowDay !== storageDay) {
                            this.funcGetData();
                        }
                    }
                }else {
                    this.funcGetData();
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
                console.log('网络状态--',networkType);
            }
        });
    },
    /**
     * 获取利率数据
     */
    funcGetData: function () {
        let that = this;
        utils.request({
            url: app.vars.interfaceSite + 'getLilv',
            complete: function (res) {
                let data;
                if (res.data && that.data.lilv !== res.data) {
                    data = res.data;
                }else {
                    data = that.data.lilv;
                }
                // 暂时放到 localStroage
                wx.setStorage({
                    key: model.wxStorageKey,
                    data: data
                });
                wx.setStorage({
                    key: 'gotLilvTime',
                    data: new Date().getTime()
                });
                that.updateLilv(data);
            }
        });
    },
    /**
     * 页面初始化
     */
    init:function () {
    },
    /**
     * 选择贷款类型
     */
    selectLoanType: function (e) {
        let dataset = e.currentTarget.dataset;
        //this.setData({
        //    act: dataset.act
        //});
        let url = '/pages/tools/index/index';
        url = url + '?pageType=' + dataset.act;
        let data = this.data;
        data.errFlag = false;
        data.showResult = false;
        wx.setStorage({
            errFlag: false,
            key: model.wxStorageKeyIndexStore + '.' + data.pageType,
            data: JSON.stringify(data)
        });
        wx.redirectTo ({
            url: url
        });
    },
    /**
     * 选择贷款计算类型
     */
    selectJsType: function (e) {
        let type = e.currentTarget.dataset.val;
        let flag = '';
        let data = this.data;
        let yearList = data.yearList;
        let sdList = data.sdList;
        let gjjList = data.gjjList;
        let sfList = data.sfList;
        if(type === '1') {
            flag = '_dk';
            this.setData({
                dkType: true,
                fjType: false
            });
        } else if(type === '0') {
            flag = '_fj';
            this.setData({
                dkType: false,
                fjType: true
            });
        }
        // 重置贷款年限、商代利率、公积金利率、首付比例的样式
        yearList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        sdList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        gjjList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        sfList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });

        // 设置贷款年限、商代利率、公积金利率、首付比例的选中样式
        yearList[data['selectId'+ flag]].cla = 'active';
        if(!data['zdySFlag' + flag]) {
            sdList[data['sdId'+ flag].replace('sd','')].cla = 'active';
        }
        if(!data['zdyGFlag' + flag]) {
            gjjList[data['gjjId'+ flag].replace('gjj','')].cla = 'active';
        }
        sfList[data['sfId'+ flag].replace('sf','')].cla = 'active';
        this.setData({
            showResult: false,
            yearList: yearList,
            sdList: sdList,
            gjjList: gjjList,
            sfList: sfList
        });
    },
    inputBlur: function (e) {
        let value = e.detail.value;
        let ds = e.currentTarget.dataset;
        let name = ds.name;
        let flag= ds.flag;
        if(name === 'dkze') {
            this.setData({
                ['dkze'+flag]: value
            });
        } else if(name === 'fjze') {
            this.setData({
                ['fjze'+flag]: value
            });
        }
    },
    /**
     * 校验贷款总额输入
     */
    checkDkze: function() {
        let data = this.data;
        let fjze_fj = data.fjze_fj;
        let dkze_dk = data.dkze_dk;
        let errMsg = '';
        if(data.fjType && !fjze_fj) {
            errMsg = '请输入房价总额';
        }
        if(data.dkType && !dkze_dk) {
            errMsg = '请输入贷款总额';
        }
        errMsg && this.showErrMsg(errMsg);
    },
    /**
     * 输入校验
     * @param e
     * @param notcheck 是否不校验长度
     * @returns {boolean}
     */
    commonInput: function (e, notcheck) {
        // 长度是否产出限制提示
        var flag = false;
        let val = e.detail.value;
        let ds = e.currentTarget.dataset;
        let name = ds.name;
        if(ds.flag) {
            name += ds.flag;
        }
        val = parseInt(val);
        if(isNaN(val)) {
            val = '';
        } else {
            if(val.toString().length > 4 && !notcheck) {
                flag = true;
                val = this.data[name];
            }
        }
        if(+e.detail.value === 0) {
            if(name == 'dkze'+ ds.flag || name == 'fjze' + ds.flag) {
                val = '';
            }
        }
        // 输入非法
        //if (ff) {
        this.setData({
            [name]: val,
            showResult: false
        });
        //}

        return flag;
    },
    /**
     * 贷款总额的控制输入
     * @param e
     */
    dkzeInput: function (e) {
        let ds = e.currentTarget.dataset;
        if(this.commonInput(e)) {
            this.showErrMsg('贷款总额超出计算范围');
        }
        // 贷款总额改变的话 公积金贷款和商业贷款清空
        this.setData({
            ['gjjdk' + ds.flag]: '',
            ['sydk' + ds.flag]: ''
        });
    },
    /**
     * 房价总额输入限制
     * @param e
     */
    fjzeInput: function (e) {
        this.commonInput(e, true);
        let data = this.data;
        let fjze = ''
        if(data.fjze_fj) {
            fjze  = (data.fjze_fj * (1 - data.sfbl_fj)).toFixed(2) || '';
        }
        this.setData({
            //dkze_fj : parseFloat((data.fjze_fj * (1 - data.sfbl_fj)).toFixed(2)) || '',
            dkze_fj : fjze,
            ['gjjdk_fj']: '',
            ['sydk_fj']: ''
        });
    },
    /**
     * 公积金贷款输入限制
     */
    gjjInput: function (e) {
        let value = e.detail.value;
        let ds = e.currentTarget.dataset;
        let flag= ds.flag;
        let data = this.data;
        let dkze = +data['dkze'+flag];
        let errMsg = '';
        if(dkze === 0) {
            errMsg = '请输入贷款总额';
            value = '';
        } else {
            if (+value > 120) {
                errMsg = '目前公积金最大贷款上限为120万';
                //value = 120;
                if(data['gjjdk'+flag] > 120) {
                    value = value;
                } else {
                    value = data['gjjdk'+flag];
                }
            } else if (+value > dkze) {
                errMsg = '公积金贷款已超过贷款总额';
                value = dkze;
            }
        }
        this.commonInput(e);
        errMsg && this.showErrMsg(errMsg);
        this.setData({
            ['gjjdk'+flag]: (value === ''|| value === '0') ?  value : +value,
            ['sydk'+flag]: value ? parseFloat((dkze - value).toFixed(2)) : ''
        });
    },
    /**
     * 关闭弹层
     */
    close: function() {
        this.setData({
            floatBox: false,
            sdlvFlag:false,
            sfblFlag:false,
            gjjFlag:false,
            dknxFlag:false
        })
    },
    /**
     * 阻止冒泡
     */
    stopPropagation: function () {
        return false;
    },
    /**
     * 商业贷款输入限制
     */
    sydkInput: function (e) {
        let ds = e.currentTarget.dataset;
        let data = this.data;
        let flag= ds.flag;
        let value = e.detail.value;
        let dkze = +data['dkze'+flag];
        let errMsg = '';
        if(dkze === 0) {
            errMsg = '请输入贷款总额';
            value = '';
        } else if (+value > dkze) {
            errMsg = '商业贷款已超过贷款总额';
            value = dkze;
        }
        this.commonInput(e);
        this.setData({
            ['sydk'+flag]:(value === ''|| value === '0') ?  value : +value,
            ['gjjdk'+flag]: value ? parseFloat((dkze - value).toFixed(2)) : ''
        });
        errMsg && this.showErrMsg(errMsg);
    },
    /**
     *隐藏提示浮层
     */
    hideFloat: function () {
        this.setData({
            errFlag: false
        });
    },
    /**
     * 切换计算结果显示类型
     */
    selectResultType: function (e) {
        let type = e.currentTarget.dataset.rtype;
        let data = this.data;
        this.setData({
            rtype: type
        });
        data.payMethodType = type;
        let obj = {
            dk: data.dk,
            gjj : data.gjj,
            payMethodType: data.payMethodType,
            pageType: data.pageType
        };
        this.showResult(modelParse.calResult(obj));
    },
    /**
     * 贷款年限选择弹框
     */
    selectDknx: function () {
        let that = this;
        let data = that.data;
        let selectId;
        if(data.fjType) {
            selectId = data.selectId_fj;
        } else if(data.dkType) {
            selectId = data.selectId_dk;
        }
        that.setData({
            showResult:false,
            yearList: that.data.yearList,
            floatBox: true,
            dknxFlag: true,
            selectId: selectId
        });
    },
    /**
     * 首付比例选择弹框
     */
    selectSfbl: function () {
        let that = this;
        let data = that.data;
        let sfId;
        if(data.fjType) {
            sfId = data.sfId_fj;
        } else if(data.dkType) {
            sfId = data.sfId_dk;
        }
        that.setData({
            showResult:false,
            sfList: that.data.sfList,
            floatBox: true,
            sfblFlag: true,
            sfId: sfId
        });

    },
    /**
     * 商贷利率选择弹框
     */
    selectSdlv: function (e) {
        let that = this;
        let data = that.data;
        let sdId;
        if(data.fjType) {
            sdId = data.sdId_fj;
        } else if(data.dkType) {
            sdId = data.sdId_dk;
        }
        this.setData({
            showResult:false,
            sdList: that.data.sdList,
            floatBox: true,
            sdlvFlag: true,
            sdId: sdId
        });
        let zdy = '';
        let flag = e.currentTarget.dataset.flag;
        if(data['zdySFlag' + flag]) {
            zdy = data['rateDiscountSy' + flag];
        }
        this.setData({
            zdysd: zdy
        })
    },
    /**
     * 公积金利率选择弹框
     */
    selectGjjBox: function (e) {
        let that = this;
        let data = that.data;
        let gjjId;
        if(data.fjType) {
            gjjId = data.gjjId_fj;
        } else if(data.dkType) {
            gjjId = data.gjjId_dk;
        }
        this.setData({
            showResult:false,
            gjjList: that.data.gjjList,
            floatBox: true,
            gjjFlag: true,
            gjjId: gjjId
        });
        let zdy = '';
        let flag = e.currentTarget.dataset.flag;
        if( data['zdyGFlag' + flag] ) {
            zdy = data['zdygjjtemp'+flag];
        }
        this.setData({
            zdygjj: zdy
        })
    },
    /**
     * 利率小数处理
     * @param lv
     * @returns {*}
     */
    convertLv: function (lv) {
        let diff = parseFloat((+lv).toFixed(3));
        return diff;
    },
    /**
     * 贷款年限关联利率处理函数
     */
    handleSyYear: function (e) {
        let data = this.data;
        let dataset = e.currentTarget.dataset;
        let val = (+dataset.val)/12;
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        let  discountSy = +data['rateDiscountSy'+ flag];
        let businessRateArr10 = data.businessRateArr10;
        // 基础利率标识
        var jcsyFlag = false;
        // 商业贷
        let bl = businessRateArr10.length;
        if(val === 1){
            data.baseRate = businessRateArr10[0];
        }else if (val <= 5 && val > 1) {
            data.baseRate = businessRateArr10[1];
        } else if (discountSy === 1) {
            jcsyFlag = true;
            data.baseRate = businessRateArr10[bl - 1];
        } else {
            data.baseRate = businessRateArr10[bl - 1];
        }
        data.businessRate = this.convertLv(data.baseRate * discountSy);
        if(jcsyFlag) {
            data.rateMsg = '基准利率（' + data.businessRate + '％）';
        } else {
            data.rateMsg = data.businessRate + '％';
        }
        this.setData(data);
        // 房价类型商贷利率赋值
        this.setData({
            ['rateMsg'+flag]: data.rateMsg,
            ['rate'+flag]: data.businessRate
        });
    },
    /**
     * 贷款年限关联公积金利率处理函数
     */
    handleGjjYear: function (e) {
        let data = this.data;
        let dataset = e.currentTarget.dataset;
        let val = (+dataset.val)/12;
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        let discountGjj = +data['rateDiscountGjj'+ flag];
        let fundRateArr10 = data.fundRateArr10;
        let businessRateArr10 = data.businessRateArr10;
        // 基础利率标识
        var jcgjjFlag = false;
        // 公积金贷
        if (val <= 5) {
            data.fundBase = fundRateArr10[0];
        } else if (discountGjj === 1) {
            jcgjjFlag = true;
            data.fundBase = fundRateArr10[1];
        } else {
            data.fundBase = fundRateArr10[1];
        }
        data.fundRate = this.convertLv(data.fundBase * discountGjj);
        if(jcgjjFlag) {
            data.fundRateMsg = '基准利率（' + data.fundBase + '％）';
        } else {
            data.fundRateMsg =  data.fundRate + '％';
        }
        this.setData(data);
        // 房价类型公积金利率赋值
        this.setData({
            ['fundRateMsg'+flag]: data.fundRateMsg,
            ['fundRate'+flag] : data.fundRate
        });
    },
    /**
     * 选择贷款年限
     */
    selectYear: function (e) {
        let data = this.data;
        if(!data.zdySFlag) {
            this.handleSyYear(e);
        }
        if(!data.zdyGFlag) {
            this.handleGjjYear(e);
        }
        let dataset = e.currentTarget.dataset;
        let year = dataset.year;
        let val = dataset.val;
        let index = dataset.index;
        let yearList = data.yearList;
        yearList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        yearList[index].cla = 'active';
        this.setData({
            ['selectId'+flag]: index,
            floatBox: false,
            dknxFlag: false,
            yearList: yearList
        });
        // 贷款年限赋值
        this.setData({
            ['dknx'+flag]: year,
            ['dknx'+flag+'_val']: val
        });
    },
    /**
     * 选择商贷利率
     */
    selectSd: function (e) {
        let dataset = e.currentTarget.dataset;
        let val = dataset.val;
        let index = dataset.index;
        let data = this.data;
        let sdList = data.sdList;
        let rateMsg = '';
        let businessRate = data.baseRate;
        sdList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        sdList[index].cla = 'active';
        this.setData({
            floatBox: false,
            sdlvFlag: false,
            sdList: sdList,
            zdysd: ''
        });
        if(val === 1) {
            rateMsg = '基准利率（' + businessRate + '％）';
        } else {
            businessRate = this.convertLv(businessRate * val);
            rateMsg = businessRate + '％';
        }
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        data['rateDiscountSy'+flag] = val;
        data.zdySFlag = false;
        data['zdySFlag' + flag] = false;
        // 房价类型商贷利率赋值
        this.setData({
            ['rateMsg'+flag]: rateMsg,
            ['rate'+flag]: businessRate,
            ['sdId'+flag]: 'sd'+ index
        });
    },
    /**
     * 选择公积金利率
     */
    selectGjj: function (e) {
        let dataset = e.currentTarget.dataset;
        let index = dataset.index;
        let val = dataset.val;
        let data = this.data;
        let gjjList = data.gjjList;
        let fundRateMsg = '';
        let fundRate = data.fundBase;
        gjjList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        gjjList[index].cla = 'active';
        this.setData({
            floatBox: false,
            gjjFlag: false,
            gjjList: gjjList,
            zdygjj:''
        });
        if(val === 1) {
            fundRateMsg = '基准利率（' + fundRate + '％）';
        } else {
            fundRate = this.convertLv(fundRate * val);
            fundRateMsg = fundRate + '％';
        }
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        data['rateDiscountGjj'+flag] = val;
        data.zdyGFlag = false;
        data['zdyGFlag' + flag] = false;
        // 房价类型公积金利率赋值
        this.setData({
            ['fundRateMsg'+flag]: fundRateMsg,
            ['fundRate'+flag] : fundRate,
            ['gjjId'+flag]: 'gjj'+ index
        });
    },
    /**
     * 自定义公积金利率
     */
    zdyGjj: function(e) {
        let data = this.data;
        let val = +data.zdygjj;
        if(!val) {
            this.setData({
                zdygjj: ''
            });
            this.showErrMsg('请输入自定义利率');
            return;
        }
        this.setData({
            floatBox: false,
            gjjFlag: false
        });
        data.zdygjjtemp = val;
        let fundRateMsg = val + '%';
        let fundRate = val;
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        data['zdygjjtemp'+flag] = val;
        data['rateDiscountGjj' + flag] = val;
        data['zdyGFlag' + flag] = true;
        // 房价类型公积金利率赋值
        this.setData({
            ['fundRateMsg' + flag]: fundRateMsg,
            fundRate: fundRate,
            ['fundRate' + flag] : fundRate
        });
        data.zdyGFlag = true;
        data.gjjList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
    },
    /**
     * 选择首付比例
     */
    selectSf: function (e) {
        let dataset = e.currentTarget.dataset;
        let val = dataset.val;
        let text = dataset.text;
        let index = dataset.index;
        let data = this.data;
        let fjze = data.fjze_fj;
        let sfList = data.sfList;
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        sfList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        sfList[index].cla = 'active';
        this.setData({
            floatBox: false,
            sfblFlag: false,
            sfList: sfList,
            sfbl_fj: val,
            sfbl: text,
            dkze_fj: fjze ? (fjze*(1-val)).toFixed(2) : '',
            sydk_fj:'',
            gjjdk_fj:'',
            ['sfId'+flag]: 'sf'+ index
        });
    },
    bindFocus: function (e) {
        let val = e.detail.value;
        let ds = e.currentTarget.dataset;
        let name = ds.name;
        let flag = ds.flag;
        let data = this.data;
        data['zdy'+flag + 'temp'] = val;
        if(val) {
            this.setData({
                [name]: ''
            });
        }
    },
    /**
     * 自定义利率输入校验
     */
    bindLlInput: function (e) {
        let val = e.detail.value;
        let name = e.currentTarget.dataset.name;
        let zdy = this.data[name];
        var errMsg;
        if(!val || val === '.') {
            val = '';
        }else if (!/^(\d|[1-9](\d+))?(\.|\.\d{1,3})?$/.test(val)) {
            val = zdy;
        } else {
            let fval = parseFloat(val);
            if (fval < 0 || fval > 100) {
                val = zdy;
                errMsg = '请输入100以内的数字';
            }
        }
        this.setData({
            [name]: val
        });
        errMsg && this.showErrMsg(errMsg);
    },
    /**
     * 显示提示信息
     * @param errMsg 错误提示
     */
    showErrMsg: function (errMsg) {
        let that = this;
        if(that.timeout) {
            return;
        }
        that.setData({
            errFlag: true,
            errMsg: errMsg
        });
        that.timeout = setTimeout(() => {
            that.setData({
                errFlag: false
            });
            clearTimeout(that.timeout);
            that.timeout = '';
        }, 2000);
    },
    /**
     * 取消底部菜单弹层11
     */
    cancelBox: function () {
        let zdysd = '',zdygjj = '';
        let data = this.data;
        if(data.zdyGFlag) {
            zdygjj = data.zdygjjtemp;
        }
        if(data.zdySFlag) {
            zdysd = data.zdysdtemp;
        }
        this.setData({
            floatBox: false,
            gjjFlag: false,
            sdlvFlag: false,
            sfblFlag: false,
            dknxFlag: false,
            zdysd: zdysd,
            zdygjj: zdygjj
        });
    },
    /**
     * 自定义商贷利率
     */
    confirmBox: function () {
        let data = this.data;
        let val = +data.zdysd;
        if(!val) {
            this.setData({
                zdysd: ''
            });
            this.showErrMsg('请输入自定义利率');
            return;
        }
        this.setData({
            floatBox: false,
            sdlvFlag: false
        });
        let rateMsg = val + '%';
        let businessRate = val;
        let flag = '';
        if(data.fjType) {
            flag = '_fj';
        } else if(data.dkType) {
            flag = '_dk';
        }
        data.zdysdtemp = val;
        data['rateDiscountSy' + flag] = val;
        data['zdySFlag' + flag] = true;
        // 房价类型商贷利率赋值
        this.setData({
            ['rateMsg' + flag]: rateMsg,
            ['rate' + flag]: businessRate
        });
        data.zdySFlag = true;
        data.sdList.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
    }
};
// 合并模块方法
let pagejson = utils.assign(pageIndex, modelParse);
// 渲染页面
Page(pagejson);
