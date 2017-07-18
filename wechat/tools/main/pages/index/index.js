const app = getApp();
const Promise = require('../../utils/promise.js').Promise;
// 基础方法模块
const utils = require('../../utils/utils.js');
// 组合贷模块
const combinationLoansView = require('combinationLoansView.js');
// 通用数据
let vars = app.vars;
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
let page = {
     data: {
        currentView: 'daikuan',
        viewName:'daikuan',
        showNav: true,
        showMain: true,
        baseRate: '',
        rate: '',
        pageType: 1,
        rateMsg: '',
        todos: [
            {text: '商业贷', cal: 'active', view: 'daikuan', viewName:'daikuan', href: 'daikuan.html'},
            {text: '公积金贷', cal: '', view: 'daikuan',viewName:'gjj', href: 'gjj.html'},
            {text: '组合贷', cal: '', view: 'zh',viewName:'zh', href: 'zh.html'},
            {text: '税费计算', cal: '', view: 'tax',viewName:'taxs', href: 'taxs.html'}
        ],
        businessRate: '',
        fundRate: ''
    },
    change: function (e) {
         let dataset = e.currentTarget.dataset;
         var index = dataset.index;
         var data = this.data;
        // 切换tab时候隐藏结果
        // $('.jsresults').hide();
        // this.$broadcast('changeTab', index + 1);
        // 页面类型:0商业贷;1公积金贷;2组合贷;3税费计算
        data.pageType = index + 1;
        data.currentView = data.todos[index].view;
        data.viewName = data.todos[index].viewName;
        // 公积金贷款和商业贷款利率区分
        index === 0 && (data.rate = data.businessRate) && (data.baseRate = data.businessRate);
        index === 1 && (data.rate = data.fundRate) && (data.baseRate = data.fundRate);
        data.rateMsg = '基准利率（' + data.baseRate + '％）';
        var len = data.todos.length;
        for (var i = 0; i < len; i++) {
            data.todos[i].cal = '';
        }
        data.todos[index].cal = 'active';
        this.setData(data);
        this.setData({
                    viewName: data.viewName
                });
    },
    changeTax:function(e) {
        let dataset = e.currentTarget.dataset;
        var tax = dataset.tax;
        if(tax === 'xftaxs') {
            this.data.pageType = 4;
            this.setData({
                xfCal: 'active',
                esfCal: '',
                tax: 'xftaxs'
            });
        } else if(tax === 'esftaxs') {
            this.data.pageType = 5;
            this.setData({
                esfCal: 'active',
                xfCal: '',
                tax: 'esftaxs'
            });
        }
    },
    /**
     * [page 加载回调]
     * @param  {[object]} params [query]
     * @return null
     */
    onLoad: function (params) {
       var that = this;
       that.init();
       that.setData({
            showDai:true,
            xfCal: 'active',
            esfCal: '',
            tax: 'xftaxs',
            // 商业贷按揭弹层不显示
            ajShow: false,
            // 商业贷利率弹层不显示
            lvShow: false
        });
        that.setData(that.syData);
        that.initBusinessLoans();
    },
    /**
     * 页面初始化
     * @return null
     */
    init: function (isReady) {
        var that = this;
        var data = that.data;
        let pageInfo = new Promise((resolve, reject) => {
            utils.request({
                url: 'http://m.test.fang.com/tools/?c=tools&a=ajaxGetLv',
                complete: res => {
                    if (~~res.statusCode === 200) {
                        let resData = res.data || [{}, {}, {}];
                        resolve(resData);
                    } else {
                        reject();
                    }
                }
            });
        });
        pageInfo.then(res => {
            var arr = res.split('_');
                    if (arr && arr.length > 0) {
                        var businessRateArr10 = arr[0].split('|')[0].split(',');
                        var fundRateArr10 = arr[0].split('|')[1].split(',');
                        data.businessRate = businessRateArr10[businessRateArr10.length - 1];
                        data.fundRate = fundRateArr10[fundRateArr10.length - 1];
                        // 初始化页面
                        data.rate = that.businessRate;
                        data.rateMsg = '基准利率（' + data.businessRate + '％）';
                        data.baseRate = data.businessRate;
                    } else {
                        data.businessRate = vars.jzlv;
                        data.fundRate = vars.gjjlv;
                        data.rate = data.businessRate;
                        data.rateMsg = '基准利率（' + data.businessRate + '％）';
                        data.baseRate = data.businessRate;
                    }
                    if (data.viewName === 'gjj') {
                        data.rate = data.fundRate;
                        data.rateMsg = '基准利率（' + data.fundRate + '％）';
                        data.baseRate = data.fundRate;
                    }
                    // 组合贷
                    if (data.viewName === 'zh') {
                        data.currentView = 'zh';
                        data.pageType = 3;
                        data.todos[2].cal = 'active';
                    }else if (data.viewName === 'gjj') {
                        // 公积金
                        data.currentView = 'daikuan';
                        data.pageType = 2;
                        data.todos[1].cal = 'active';
                    }else if (data.viewName === 'taxs') {
                        // 税费贷
                        data.currentView = 'tax';
                        data.todos[3].cal = 'active';
                        if (location.href.indexOf('esftaxs') == -1) {
                            data.pageType = 5;
                        }else {
                            data.pageType = 4;
                        }
                    }else if(data.viewName === 'daikuan'){
                        // 商业贷
                        data.currentView = 'daikuan';
                        data.pageType = 1;
                        data.todos[0].cal = 'active';
                    }
                    that.setData(data);
        }).catch(res => {
            data.businessRate = vars.jzlv;
            data.fundRate = vars.gjjlv;
            data.rate = that.businessRate;
            data.baseRate = that.businessRate;
            data.rateMsg = '基准利率（' + data.businessRate + '％）';
            if (data.viewName === 'gjj') {
                data.rate = data.fundRate;
                data.rateMsg = '基准利率（' + data.fundRate + '％）';
                data.baseRate = data.fundRate;
            }
            // 组合贷
            if (data.viewName === 'zh') {
                data.currentView = 'zh';
                data.pageType = 3;
                data.todos[2].cal = 'active';
            }else if (data.viewName === 'gjj') {
                // 公积金
                data.currentView = 'daikuan';
                data.pageType = 2;
                data.todos[1].cal = 'active';
            }else if (data.viewName === 'taxs') {
                // 税费贷
                data.currentView = 'tax';
                data.todos[3].cal = 'active';
            }else if(data.viewName === 'daikuan'){
                // 商业贷
                data.currentView = 'daikuan';
                data.pageType = 1;
                data.todos[0].cal = 'active';
            }
            that.setData(data);
        });
    },
   // ---------------商业贷的事件监听 begin--------------
    syData: {
        showDai: true,
        showResult: false,
        showDetail: false,
        totalMoney: '100',
        dkTotalMoney: '70',
        showPro: false,
        showYear: false,
        showRate: false,
        // 比例值
        propotionNum: 3,
        // 首付比例的类型
        proType: '0',
        // 成数
        propotionText: '三成',
        // 首付
        proMoney: 30,
        year: '20',
        yearMsg: '20年（240期）',
        discount: '1',
        type: '1',
        payMethodType: '0'
    },
    ajTodos: [],
    downPaymentData:{
        downtodos: [
            {text: '一成', val: '1', cla: ''},
            {text: '二成', val: '2', cla: ''},
            {text: '三成', val: '3', cla: 'on'},
            {text: '四成', val: '4', cla: ''},
            {text: '五成', val: '5', cla: ''},
            {text: '六成', val: '6', cla: ''},
            {text: '七成', val: '7', cla: ''},
            {text: '八成', val: '8', cla: ''},
            {text: '九成', val: '9', cla: ''}
        ],
        userVal: '',
        hint: ''
    },
    /***
     * 取消商业按揭选择
     */
    cancelSyAj: function () {
        this.setData({
            ajShow:false
        });
    },
    // 点击首付比例
    payClick: function () {
        var that = this;
        that.syData.showDai = false;
        that.syData.showPro = true;
        that.setData({
            showDai: false,
            showPro: true
        });
        that.setData(that.downPaymentData);
    },
    // 首付比例处理函数
    handlePay: function (e) {
        let dataset = e.currentTarget.dataset;
        let text = dataset.text;
        let val = dataset.val;
        var todos = this.downPaymentData.downtodos;
        todos.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        todos[val-1].cla = 'on';
        var index = val;
        var that = this;
        that.syData.propotionNum = val;
        that.syData.propotionText = text;
        that.syData.proType = '0';
        that.syData.showPro = false;
        that.syData.showDai = true;
        that.setData(that.syData);
        that.setData({
            propotionMsg: that.propotionMsg(),
            propotion: that.propotion()
        });
    },
    inputLimit: function (ev) {
        var value = ev.detail.value;
        value = value.match(/\d{0,4}(\.\d{0,2})?/g);
        ev.detail.value = value[0];
        this.downPaymentData.userVal = value[0];
        this[ev.target.id] = value[0];
    },
    userDefined: function () {
        // console.log(this.userVal);
        var that = this;
        var downPaymentData=that.downPaymentData;
        var syData= that.syData;
        syData.proType = '1';
        syData.proMoney = downPaymentData.userVal;
        var user = Number(downPaymentData.userVal);
        if (user > syData.totalMoney || user <= 0) {
            downPaymentData.userVal = '';
            downPaymentData.hint = '请输入正确的数字';
        } else {
            // 去除选项上的样式
            downPaymentData.downtodos.forEach(function (value, inx, array) {
                array[inx].cla = '';
            });
        }
        that.syData.showDai = true;
        that.syData.showPro = false;
        that.setData(that.syData);
        that.setData({
            propotionMsg: that.propotionMsg(),
            propotion: that.propotion()
        });
        that.setData(that.downPaymentData);
    },
    // 首付比例文本信息
    propotionMsg: function () {
        // 房屋总价输入影响 首付比例
        var message = '';
        var syData = this.syData;
        if (syData.proType === '0') {
            syData.proMoney = parseFloat((syData.totalMoney * syData.propotionNum * 0.1).toFixed(2));
            message = syData.propotionText + '（' + syData.proMoney + '万）';
        } else {
            // 自定义首付
            message = syData.proMoney + '万';
        }
        syData.dkTotalMoney = (syData.totalMoney - syData.proMoney).toFixed(2) + '';
        return message;
    },
    // 首付比例data-value
    propotion: function () {
        return this.syData.proType + '_' + this.syData.propotionNum;
    },
    /***
     * 首付比例数据初始化
     */
    initBusinessLoans: function() {
        var that = this;
        this.setData({
            propotionMsg: that.propotionMsg(),
            propotion: that.propotion()
        });
    },
    /**
     * 按揭年数的点击监听事件
     */
    syYearClick: function() {
        for (var i = 1; i <= 30; i++) {
            this.ajTodos.push({
                text: i + '年（' + i * 12 + '期）',
                val: i,
                cla: ''
            });
        }
        this.ajTodos[19].cla = 'activeS';
        this.setData({
            ajShow: true,
            ajTodos: this.ajTodos
        });
    },
    /**
     * 选中按揭年数
     */
    syFill: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        that.ajTodos.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        var curAj = that.ajTodos[index];
        curAj.cla = 'activeS';
        var data = that.data;
        that.setData({
            ajShow: false,
            ajTodos: that.ajTodos
        });
        if(data.viewName === 'zh') {
            that.setData({
                syMsg: curAj.text,
                syYear: curAj.i
            });
        } else if(data.viewName === 'daikuan') {
            that.setData({
                yearMsg: curAj.text,
                year: curAj.i
            });
        } else if(data.viewName === 'daikuan') {
            that.setData({
                yearMsg: curAj.text,
                year: curAj.i
            });
        }
    },
    lvData: {
        lvTodos: [
            {text: '基准利率', val: '1', cla: 'on'},
            {text: '7折', val: '0.7', cla: ''},
            {text: '85折', val: '0.85', cla: ''},
            {text: '88折', val: '0.88', cla: ''},
            {text: '9折', val: '0.9', cla: ''},
            {text: '95折', val: '0.95', cla: ''},
            {text: '1.1倍', val: '1.1', cla: ''},
            {text: '1.2倍', val: '1.2', cla: ''},
            {text: '1.3倍', val: '1.3', cla: ''}
        ],
        zdyUserRate: '',
        userRate: '',
        lvHint: ''
    },
    lvFill: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        var lvTodos = that.lvData.lvTodos;
        lvTodos.forEach(function (value, inx, array) {
            array[inx].cla = '';
        });
        lvTodos[index].cla = 'on';
        var data = that.data;
        data.rate = (data.baseRate * lvTodos[index].val).toFixed(2);
        data.rateMsg = '基准利率（' + data.rate + '％）';
        that.lvData.userRate = data.rate;
        that.setData({
            showDai: true,
            lvShow:false,
            lvTodos:lvTodos,
            rate: data.rate,
            rateMsg : data.rateMsg
        });
    },
    rateClick: function() {
        var that = this;
        that.setData(that.lvData);
        that.setData({
            showDai: false,
            lvShow:true
        });
    },
    rateBtnClick: function () {
        var that = this;
        var zdyUserRate = that.lvData.zdyUserRate;
        if(isNaN(Number(zdyUserRate))) {
            that.lvData.zdyUserRate = '';
            that.lvData.lvHint = '请输入正确的利率';
        } else {
            var value = Number(zdyUserRate).toFixed(2) || 0;
            if (value === 0 || value === '') {
                that.lvData.zdyUserRate = '';
                that.lvData.lvHint = '请输入正确的利率';
            }
            if (Number(zdyUserRate) <= 0) {
                that.lvData.zdyUserRate = '';
                that.lvData.lvHint = '请输入正确的利率';
            } else {
                // 自定义利率把选项样式清空
                that.lvData.lvTodos.forEach(function (value, inx, array) {
                    array[inx].cla = '';
                });
                var data = that.data;
                data.rate = zdyUserRate;
                data.rateMsg = data.rate + '％';
                that.setData({
                    showDai: true,
                    lvShow:false,
                    rate: data.rate,
                    rateMsg: data.rateMsg
                });
            }
        }
        that.setData(that.lvData);
    },
    keydownEvent: function (ev) {
        var value = ev.detail.value;
        this.lvData.zdyUserRate = value;
        var ev = ev || window.event;
        var code = ev.keyCode;
        var currentVal = String.fromCharCode(code);
        var hasValue = ev.target.value;
        // 95-106:0-9 |47-58:0-9 |110|190:. 37:<- 39:-> 8:backspace
        if ((code > 95 && code < 106) || (code > 47 && code < 58) || code === 110 || code === 190 || code === 37 || code === 39 || code === 8) {
            if (!isNaN(currentVal)) {
                if (hasValue.indexOf('.') > -1) {
                // 包含小数点
                    if (Number(hasValue) > 99.99 || Number(hasValue) < 0) {
                        ev.preventDefault();
                        return false;
                    } else if (/\d+\.\d{2}/.test(hasValue)) {
                        ev.preventDefault();
                        return false;
                        // return true;
                    } else {

                    }
                }
                else {
                    if (Number(hasValue) > 99.99 || Number(hasValue) < 0) {
                        ev.preventDefault();
                        return false;
                    } else if (hasValue.length >= 2) {
                        ev.preventDefault();
                        return false;
                    } else {
                    }
                }
            } else {
                if (code === 8 || code === 37 || code === 39) {
                    // return true;
                } else if (code === 190 || code === 110) {
                    if (hasValue.indexOf('.') > -1) {
                        ev.preventDefault();
                        return false;
                    } else if (hasValue.length >= 3) {
                        ev.preventDefault();
                        return false;
                    } else if (hasValue.length === 0) {
                        ev.preventDefault();
                        return false;
                    }
                    else {
                    }
                } else if (hasValue === '') {

                }
            }
        } else {
            ev.preventDefault();
            return false;
        }
    },
    // ---------------商业贷的事件监听 end--------------
    // ---------------组合贷款视图 begin----------------

    // ---------------组合贷款视图 end------------------
};
// 合并模块方法
Object.assign(page, combinationLoansView);
// 渲染页面
Page(page);