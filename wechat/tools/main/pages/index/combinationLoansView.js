const app = getApp();
// 基础工鞥模块
const utils = require('../../utils/utils.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 组合贷款
module.exports = {
        props: ['rate', 'rateMsg'],
        zhData: {
            showResult: false,
            showDai: true,
            showYear: false,
            showRate: false,
            showDetail: false,
            syMoney: '',
            gjjMoney: '',
            hint: '请输入贷款金额',
            syYear: '20',
            gjjYear: '20',
            syMsg: '20年（240期）',
            gjjMsg: '20年（240期）',
            syDiscount: '1',
            gjjDiscount: '1',
            syBase: '',
            gjjBase: '',
            syRateMsg: '基准利率（％）',
            gjjRateMsg: '基准利率（％）',
//             syBase: this.$parent.businessRate,
//             gjjBase: this.$parent.fundRate,
            // syRateMsg: '基准利率（' + this.$parent.businessRate + '％）',
            // gjjRateMsg: '基准利率（' + this.$parent.fundRate + '％）',
            yearType: '',
            rateType: '',
            payMethodType: '0',
            syIndex: 0,
            gjjIndex: 0
        },
        syInputLimit: function (ev) {
            var value = ev.target.value;
            value = value.match(/\d{0,4}(\.\d{0,2})?/g);
            ev.target.value = value[0];
            // this[ev.target.id] = value[0];
        },
        // 公积金贷款按揭年数点击
        gjjYearClick: function () {
            // this.showYear = true;
            this.yearType = 'gjj';
            var num = Number(this.gjjYear);
            this.$broadcast('yearSel', num);
            $('#floatDiv').show();
            // common.showDiv();
            var section = $('#floatDiv').find('section').get(0);
            if (!scroll) {
                scroll = new IScroll(section, {
                    bindToWrapper: true, scrollY: true, scrollX: false
                });
            }
            scroll.refresh();
            // 定位

            if (1 < num && num <= 27) {
                scroll.scrollTo(0, -(num - 2) * 45);
            }else if (num === 1) {
                scroll.scrollTo(0, 0);
            }else {
                scroll.scrollTo(0, -1148);
            }
        },
        // 商业利率点击
        syRateClick: function () {
            this.$parent.showNav = false;
            this.showDai = false;
            this.showRate = true;
            // 初始化
            if (this.syDiscount === '0') {
                this.$refs.rate.userRate = this.syRate;
                this.$refs.rate.todos.forEach(function (value,inx,array) {
                    array[inx].cla = '';
                });
            }else {
                this.$refs.rate.userRate = '';
                this.$refs.rate.todos.forEach(function (value,inx,array) {
                    array[inx].cla = '';
                });
                this.$refs.rate.todos[this.syIndex].cla = 'on';
            }
            this.rateType = 'sy';
        },
        // 公积金利率点击
        gjjRateClick: function () {
            this.$parent.showNav = false;
            this.showDai = false;
            this.showRate = true;
            if (this.gjjDiscount === '0') {
                this.$refs.rate.userRate = this.gjjRate;
                this.$refs.rate.todos.forEach(function (value,inx,array) {
                    array[inx].cla = '';
                });
            }else {
                this.$refs.rate.userRate = '';
                this.$refs.rate.todos.forEach(function (value,inx,array) {
                    array[inx].cla = '';
                });
                this.$refs.rate.todos[this.gjjIndex].cla = 'on';
            }
            this.rateType = 'gjj';
        },
        // 利率处理函数
        handleRate: function (obj,index) {
            if (typeof obj === 'string') {
                // 自定义的利率值
                this[this.rateType + 'Discount'] = '0';
                this[this.rateType + 'Index'] = '';
                this[this.rateType + 'Rate'] = obj;
                this[this.rateType + 'RateMsg'] = obj + '％';
            } else {
                // 选择的利率值
                this[this.rateType + 'Discount'] = obj.val;
                this[this.rateType + 'Index'] = index;
                this[this.rateType + 'Rate'] = (this[this.rateType + 'Base'] * obj.val).toFixed(2);
                if (obj.val === '1') {
                    this[this.rateType + 'RateMsg'] = '基准利率（' + this[this.rateType + 'Base'] + '％）';
                } else {
                    this[this.rateType + 'RateMsg'] = this[this.rateType + 'Rate'] + '％';
                }
            }
            this.showRate = false;
            this.$parent.showNav = true;
            this.showDai = true;
        },
        // 按揭年数处理函数
        handleYear: function (obj) {
            this[this.yearType + 'Year'] = obj.val;
            this[this.yearType + 'Msg'] = obj.text;
            // this.showYear = false;
            $('#floatDiv').hide();
        },
        calculate: function () {
            // (1)验证
            // 商业贷款和公积金贷款不全为空时另一个为0
            if (this.syMoney === '' && this.gjjMoney === '') {
                alert('\u8bf7\u8f93\u5165\u8d37\u6b3e\u603b\u989d');
                return;
            } else if (this.gjjMoney === '') {
                this.gjjMoney = '0';
            } else if (this.syMoney === '') {
                this.syMoney = '0';
            }
            this.syMoney = common.formatNum(this.syMoney);
            this.gjjMoney = common.formatNum(this.gjjMoney);
            // 商业贷款和公积金贷款不能全为0
            if (this.syMoney === 0 && this.gjjMoney === 0) {
                alert('\u8bf7\u8f93\u5165\u8d37\u6b3e\u603b\u989d');
                return;
            }
            // 页面类型
            this.pageType = this.$parent.pageType;
            // 初始化计算方式
            this.payMethodType = '0';
            // (2)收集数据
            var data = {
                // 商业贷款相关
                dk: {
                    dkMoney: this.syMoney * 10000,
                    monthNum: common.formatNum(this.syYear) * 12,
                    monthRate: common.formatNum(this.syRate) * 0.01 / 12,
                    initrateVal: this.syRate,
                    rateDiscount: this.syDiscount
                },
                // 公积金贷款相关
                gjj: {
                    dkMoney: this.gjjMoney * 10000,
                    monthNum: common.formatNum(this.gjjYear) * 12,
                    monthRate: common.formatNum(this.gjjRate) * 0.01 / 12,
                    initrateVal: this.gjjRate,
                    rateDiscount: this.gjjDiscount
                },
                // 计算方式(默认是0)
                type: '0',
                // 页面类型
                pageType: this.$parent.pageType
            };
            // (3)计算结果
            var resultData = modelParse.calResult(data);
            // (4)展示结果
            // 按揭年数是否一样
            // var showDiffer = (this.syYear === this.gjjYear);
            this.$broadcast('showResult', resultData);
            // 只有点击开始计算按钮时候才触发(初始化还款方式)
            this.$broadcast('payMethod');
            // this.showResult = true;
            var resultD = $('.jsresults');
            resultD.show();
            $(document).scrollTop(resultD.offset().top);
        },
        // 还款方式tab切换
        handleTab: function (str) {
            this.payMethodType = str;
            // 收集数据
            var data = {
                // 商业贷款相关
                dk: {
                    dkMoney: this.syMoney * 10000,
                    monthNum: common.formatNum(this.syYear) * 12,
                    monthRate: common.formatNum(this.syRate) * 0.01 / 12,
                    initrateVal: this.syRate,
                    rateDiscount: this.syDiscount
                },
                // 公积金贷款相关
                gjj: {
                    dkMoney: this.gjjMoney * 10000,
                    monthNum: common.formatNum(this.gjjYear) * 12,
                    monthRate: common.formatNum(this.gjjRate) * 0.01 / 12,
                    initrateVal: this.gjjRate,
                    rateDiscount: this.gjjDiscount
                },
                // 计算方式(默认是0)
                type: str,
                // 页面类型
                pageType: this.$parent.pageType
            };
            // (3)计算结果
            var resultData = modelParse.calResult(data);
            resultData.payMethodType = str;
            // (4)展示结果
            // 按揭年数是否一样
            // var showDiffer = (this.syYear === this.gjjYear);
            this.$broadcast('showResult', resultData);
            // this.showResult = true;
        },
        detail: function () {
            this.$parent.showNav = false;
            this.showDai = false;
            // 显示结果页
            $('.left').html('').html('<a id="wapxfsy_D01_01" class="back" href="javascript:history.back(-1)"><i></i></a>');
            // 传递数据到子组件
            var resultData = modelParse.detailCalResult(this.payMethodType);
            resultData.payMethodType = this.payMethodType;
            resultData.pageType = this.$parent.pageType;
            this.$broadcast('detail', resultData);
            this.showDetail = true;
            modelParse.pushStateFn(true, this.$parent.pageType);
            // 页面滚动效果
            common.scrollEvent();
        },
        detailTab: function (str) {
            var data = {
                // 商业贷款相关
                dk: {
                    dkMoney: this.syMoney * 10000,
                    monthNum: common.formatNum(this.syYear) * 12,
                    monthRate: common.formatNum(this.syRate) * 0.01 / 12,
                    initrateVal: this.syRate,
                    rateDiscount: this.syDiscount
                },
                // 公积金贷款相关
                gjj: {
                    dkMoney: this.gjjMoney * 10000,
                    monthNum: common.formatNum(this.gjjYear) * 12,
                    monthRate: common.formatNum(this.gjjRate) * 0.01 / 12,
                    initrateVal: this.gjjRate,
                    rateDiscount: this.gjjDiscount
                },
                // 计算方式(默认是0)
                type: str,
                // 页面类型
                pageType: this.$parent.pageType
            };
            // (3)计算结果
            modelParse.calResult(data);
            var resultData = modelParse.detailCalResult(str);
            resultData.payMethodType = str;
            resultData.pageType = this.$parent.pageType;
            this.$broadcast('detail', resultData);
        },
        changeTab: function (data) {
            if (data != this.type) {
                this.showResult = false;
                this.type = data;
            }
        }
};