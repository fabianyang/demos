/**
 * 基础数据处理方法
 * by tankunpeng
 */
module.exports = {
    wxStorageKey: 'tools.index',
    wxStorageKeyTimeStamp: 'tools.timeStamp',
    wxStorageKeyIndexStore: 'tools.index.store',
    /**
     * 商业贷款/公积金贷款/组合贷计算
     * @param data 需要的数据
     */
    calResult: function (data) {
        let that = this;
        if (data.payMethodType !== undefined) {
            // 等额本息 等额本金
            that.payMethodType = data.payMethodType;
        }
        if (data.pageType !== undefined) {
            // 商业贷款 公积金贷款 组合贷款
            that.pageType = data.pageType;
        }
        // 格式化数据
        if (data.pageType && (data.pageType === '0' || data.pageType === '1')) {
            // 贷款总额(元)
            data.dkMoney = data.dkTotalMoney * 10000;
            // 按揭月数
            data.monthNum = data.ajYear * 12;
            // 月利率
            data.monthRate = data.rate * 0.01 / 12;
        }
        let resultData = {};
        switch (data.pageType) {
            // 商业贷款
            case '0':
            // 公积金贷款
            case '1':
                resultData = this.calMethod(data, that.payMethodType);
                that.payInfo = {
                    // 支付详情页存储的变量
                    // 还款总额
                    hkmoney: this.formatNum(data.dkMoney + resultData.payLx),
                    // 贷款总额
                    dkmoney: this.formatNum(data.dkMoney),
                    // 总利息
                    payLx: resultData.payLx,
                    // 贷款月数
                    dkMonth: data.ajYear * 12,
                    // 月供
                    monthAvgPay: Math.ceil(resultData.payMonth),
                    monthPayOrigin: resultData.payMonth,
                    // 月利率(没用到)
                    monthRate: data.rate * 0.01 / 12,
                    // 每月递减
                    different: resultData.payDifferent,
                    // 还款方式
                    payMethodType: that.payMethodType
                };
                resultData.pageType = data.pageType;
                resultData.totalMoney = this.formatNum(data.totalMoney);
                resultData.sfMoney = this.formatNum(data.sfMoney);
                resultData.dkMoney = this.formatNum(data.dkMoney / 10000);
                resultData.rate = Number(data.rate).toFixed(2);
                resultData.payMonthShow = '￥' + Math.ceil(resultData.payMonth);
                resultData.payMonth = Math.ceil(resultData.payMonth);
                resultData.payInfo = that.payInfo;
                return resultData;
                break;
            // 组合贷款
            case '2':
                let resultData1 = this.calMethod(data.dk, that.payMethodType);
                let resultData2 = this.calMethod(data.gjj, that.payMethodType);
                resultData1.hkTotalMoney = resultData1.payLx + data.dk.dkMoney;
                resultData2.hkTotalMoney = resultData2.payLx + data.gjj.dkMoney;
                resultData.pageType = that.pageType;
                resultData.hkTotalMoney = Math.ceil(resultData1.hkTotalMoney + resultData2.hkTotalMoney);
                resultData.dkMoney = Math.ceil((data.dk.dkMoney + data.gjj.dkMoney));
                resultData.payLx = Math.ceil(resultData1.payLx) + Math.ceil(resultData2.payLx);
                resultData.payMonth = Math.ceil(resultData1.payMonth) + Math.ceil(resultData2.payMonth);
                that.payInfo = {
                    // 支付详情页存储的变量;
                    // (2016-04-21,zhangcongfeng@fang.com)增加different:每月递减值;year贷款年数;payMethodType:还款方式;payMonth:月供(在组合贷页面有区分)
                    dk: {
                        dkMoney: this.formatNum(data.dk.dkMoney),
                        dkMonth: data.dk.monthNum, monthPayOrigin: resultData1.payMonth,
                        monthRate: data.dk.monthRate,
                        hkmoney: resultData1.hkTotalMoney,
                        different: resultData1.payDifferent,
                        year: data.dk.monthNum / 12,
                        payMonth: resultData1.payMonth
                    },
                    gjj: {
                        gjjMoney: this.formatNum(data.gjj.dkMoney),
                        gjjMonth: data.gjj.monthNum, monthPayOrigin: resultData2.payMonth,
                        monthRate: data.gjj.monthRate,
                        hkmoney: resultData2.hkTotalMoney,
                        different: resultData2.payDifferent,
                        year: data.gjj.monthNum / 12,
                        payMonth: resultData2.payMonth
                    },
                    type: that.pageType,
                    hkmoney: this.formatNum(resultData1.hkTotalMoney + resultData2.hkTotalMoney),
                    payLx: resultData.payLx,
                    monthAvgPay: Math.ceil(resultData.payMonth),
                    payMethodType: that.payMethodType
                };
                // resultData.payLx = resultData.payLx + "\u5143";
                // resultData.dkMoney = resultData.dkMoney + "\u5143";
                resultData.hkTotalMoney = this.formatNum(resultData1.hkTotalMoney + resultData2.hkTotalMoney);
                resultData.payMonthShow = '￥' + Math.ceil(resultData.payMonth);
                // resultData.payMonth = resultData.payMonth + "\u6708";
                resultData.payInfo = that.payInfo;
                // 组合贷页面增加判断参数yearFlag:贷款年限是否相同
                resultData.yearFlag = data.gjj.monthNum === data.dk.monthNum;
                // 组合贷页面longTimeDai时间较长的贷款shortTimeDai事件较短的贷款
                resultData.longTimeDai = data.gjj.monthNum > data.dk.monthNum ? 'gjj' : 'dk';
                resultData.shortTimeDai = data.gjj.monthNum > data.dk.monthNum ? 'dk' : 'gjj';
                return resultData;
                break;
        }
    },

    /*
     详情计算
     * */
    detailCalResult: function (type) {
        let that = this;
        let resultData;
        if (that.payInfo) {
            resultData = that.payInfo;
        } else {
            return;
        }
        if (!type) {
            resultData.type = that.payMethodType;
        } else {
            resultData.type = type;
        }
        resultData.pageType = that.pageType;
        switch (that.pageType) {
            case '0':
            case '1':
                resultData = that.detailCal(resultData);
                break;
            case '2':
                resultData = that.detailCal(resultData);
                break;
        }
        return resultData;
    },
    /**
     * 计算详情函数
     **/
    detailCal: function (data) {
        let month = 0;
        let year = 0;
        let itemArr = [];
        let cal = {};
        let calZh1 = {};
        let calZh2 = {};
        let showValueObj = {};
        let calMoney = '';
        let syTotal = 0;
        if (data.pageType == '0' || data.pageType == '1') {
            month = data.dkMonth;
            syTotal = data.hkmoney;
            year = month / 12;
            for (let i = 1; i <= year; i++) {
                let dataArr = [];
                for (let j = 1; j <= 12; j++) {
                    data.i = j + (i - 1) * 12;
                    cal = this.everyMonthPay(data);
                    cal.sy = Number(cal.sy);
                    cal.bj = Number(cal.bj);
                    cal.bx = Number(cal.bx);
                    if (data.type == 0) {
                        if (cal.sy < 0) {
                            cal.sy = 0;
                        }
                        calMoney = cal.bj + cal.bx;
                        dataArr.push([j + '月', '￥' + Math.floor(calMoney), '￥' + Math.floor(cal.bj), '￥' + Math.floor(cal.bx), '￥' + Math.floor(cal.sy)]);
                    } else if (data.type == 1) {
                        syTotal = syTotal - cal.bj - cal.bx;
                        calMoney = Math.floor(cal.bj) + Math.floor(cal.bx);
                        if (syTotal < 0) {
                            syTotal = 0;
                        }
                        dataArr.push([j + '月', '￥' + Math.floor(calMoney), '￥' + Math.floor(cal.bj), '￥' + Math.floor(cal.bx), '￥' + Math.floor(syTotal)]);
                    }
                }
                itemArr.push(dataArr);
            }
            showValueObj = {
                hkmoney: this.formatNum(data.hkmoney / 10000),
                dkmoney: this.formatNum(data.dkmoney / 10000),
                payLx: this.formatNum(data.payLx / 10000),
                dkmonth: data.dkMonth / 12 + '年(' + data.dkMonth + '月)',
                monthAvgPay: data.monthAvgPay,
                itemArr: itemArr
            };
        } else if (data.pageType == '2') {
            if (data.dk.dkMoney == 0 && data.gjj.gjjMoney != 0) {
                year = data.gjj.gjjMonth / 12;
            } else if (data.gjj.gjjMoney == 0 && data.dk.dkMoney != 0) {
                year = data.dk.dkMonth / 12;
            } else if (data.dk.dkMoney != 0 && data.gjj.gjjMoney != 0) {
                if (data.dk.dkMonth >= data.gjj.gjjMonth) {
                    year = data.dk.dkMonth / 12;
                } else {
                    year = data.gjj.gjjMonth / 12;
                }
            }
            syTotal = data.hkmoney;
            for (let i = 1; i <= year; i++) {
                let dataArr = [];
                for (let j = 1; j <= 12; j++) {
                    if (data.dk.dkMonth >= j + (i - 1) * 12) {
                        data.monthRate = data.dk.monthRate;
                        data.monthPayOrigin = data.dk.monthPayOrigin;
                        data.dkMonth = data.dk.dkMonth;
                        data.dkmoney = data.dk.dkMoney;
                        data.hkmoney = data.dk.hkmoney;
                        data.i = j + (i - 1) * 12;
                        calZh1 = this.everyMonthPay(data);
                    } else {
                        calZh1.bj = 0;
                        calZh1.bx = 0;
                        calZh1.sy = 0;
                    }
                    if (data.gjj.gjjMonth >= j + (i - 1) * 12) {
                        data.dkmoney = data.gjj.gjjMoney;
                        data.monthRate = data.gjj.monthRate;
                        data.monthPayOrigin = data.gjj.monthPayOrigin;
                        data.dkMonth = data.gjj.gjjMonth;
                        data.hkmoney = data.gjj.hkmoney;
                        data.i = j + (i - 1) * 12;
                        calZh2 = this.everyMonthPay(data);
                    } else {
                        calZh2.bj = 0;
                        calZh2.bx = 0;
                        calZh2.sy = 0;
                    }
                    if (data.type == 0) {
                        let tempSy = calZh1.sy + calZh2.sy;
                        if (tempSy < 0) {
                            tempSy = 0;
                        }
                        let calMonth = Math.floor(calZh1.bj + calZh2.bj) + Math.floor(calZh1.bx + calZh2.bx);
                        dataArr.push([j + '月', '￥' + calMonth, '￥' + Math.floor(calZh1.bj + calZh2.bj), '￥' + Math.floor(calZh1.bx + calZh2.bx), '￥' + Math.floor(tempSy)]);
                    } else if (data.type == 1) {
                        syTotal = syTotal - (calZh1.bj + calZh1.bx + calZh2.bj + calZh2.bx);
                        if (syTotal < 0) {
                            syTotal = 0;
                        }
                        let calMonth = Math.floor(calZh1.bx + calZh2.bx) + Math.floor(calZh1.bj + calZh2.bj);
                        dataArr.push([j + '月', '￥' + calMonth, '￥' + Math.floor(calZh1.bj + calZh2.bj), '￥' + Math.floor(calZh1.bx + calZh2.bx), '￥' + Math.floor(syTotal)]);
                    }
                }
                itemArr.push(dataArr);
            }
            showValueObj = {
                hkmoney: this.formatNum((data.dk.hkmoney + data.gjj.hkmoney) / 10000),
                dkmoney: this.formatNum(data.dk.dkMoney / 10000 + data.gjj.gjjMoney / 10000),
                gjjmoney: this.formatNum(data.gjj.gjjMoney / 10000),
                payLx: this.formatNum(data.payLx / 10000),
                dkmonth: parseInt(data.dk.dkMonth / 12) + '年(' + data.dk.dkMonth + '月)',
                gjjmonth: parseInt(data.gjj.gjjMonth / 12)+ '年(' + data.gjj.gjjMonth + '月)',
                monthAvgPay: data.monthAvgPay,
                itemArr:itemArr
            };
        }
        showValueObj.pageType = data.pageType;
        showValueObj.payMethodType = data.type;
        return showValueObj;
    },
    calMethod: function (data, type) {
        // type, dkMoney, monthRate, monthNum
        // 涉及到金额的单位统一为元
        // 还款方式公式计算
        let cal = {};
        if (type == 0) {
            // 等额本息
            // 〔贷款本金×月利率×(1＋月利率)＾款月数〕÷〔(1＋月利率)＾款月数-1〕
            cal.payMonth = ((data.dkMoney * data.monthRate * Math.pow(1 + data.monthRate, data.monthNum)) / (Math.pow(1 + data.monthRate, data.monthNum) - 1)).toFixed(2);
            // 总利息=还款月数×每月月供额-贷款本金
            cal.payLx = Math.ceil(data.monthNum * cal.payMonth - data.dkMoney);
            // 等额本息的每月递减值是0
            cal.payDifferent = 0;
        } else if (type == 1) {
            // 等额本金
            // (贷款本金÷款月数)+(贷款本金-已归本金累计额)×月利率 默认第一个月0
            cal.payMonth = (data.dkMoney / data.monthNum + (data.dkMoney-0) * data.monthRate).toFixed(2);
            // 〔(总贷款额÷款月数+总贷款额×月利率)+总贷款额÷还款月数×(1+月利率)〕÷2×款月数-总贷款额
            cal.payLx = Math.ceil(((data.dkMoney / data.monthNum + data.dkMoney * data.monthRate + (data.dkMoney / data.monthNum) * (1 + data.monthRate)) / 2) * data.monthNum - data.dkMoney);
            // 等额本金还款方式的每月递减金额(每月应还本金*月利率)(zhangcongfeng@fang.com 2016-04-21)
            cal.payDifferent = (data.dkMoney / data.monthNum * data.monthRate).toFixed(2);
        }
        // 返回月供和总利息
        return cal;
    },
    everyMonthPay: function (data) {
        // type,dkMonth,hkmoney,monthRate,i,dkmoney,monthPayOrigin
        let type = data.type;
        let dkMonth = data.dkMonth;
        let hkmoney = data.hkmoney;
        let monthRate = data.monthRate;
        // 第i个月
        let i = data.i;
        let dkmoney = data.dkmoney;
        let monthPayOrigin = data.monthPayOrigin;
        let cal = {};
        if (type == 0) {//等额本息
            //每月应还本金=贷款本金×月利率×(1+月利率)^(还款月序号-1)÷〔(1+月利率)^款月数-1〕
            cal.bj = Math.ceil(dkmoney * monthRate * Math.pow(1 + monthRate, i - 1) / (Math.pow(1 + monthRate, dkMonth) - 1));
            //每月应还利息=贷款本金×月利率×〔(1+月利率)^还款月数-(1+月利率)^(款月序号-1)〕÷〔(1+月利率)^款月数-1〕
            cal.bx = Math.ceil(dkmoney * monthRate * (Math.pow(1 + monthRate, dkMonth) - Math.pow(1 + monthRate, i - 1)) / (Math.pow(1 + monthRate, dkMonth) - 1));
            //剩余还款
            cal.sy = hkmoney - Math.ceil(i * (monthPayOrigin));
        }
        else if (type == 1) {//等额本金
            //每月应本金=贷款本金÷款月数
            //每月应利息=剩余本金×月利率=(贷款本金-已归本金累计额)×月利率
            cal.bj = dkmoney / dkMonth;
            cal.bx = (dkmoney - (i - 1) * cal.bj) * monthRate;
        }
        return cal;
    },
    formatNum: function (num, length) {
        // 格式化两位小数 如果23.00 则保留为23 如果是23.1就23.10;parseFloat 将它的字符串参数解析成为浮点数并返回
        return parseFloat(Number(num).toFixed(length || 2)) || 0;
    }
};
