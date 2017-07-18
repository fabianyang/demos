/**
 * @file 表单输入、选择逻辑
 * @author yangfan
 */
function tap(e) {
    let ds = e.currentTarget.dataset,
        data = this.data;

    let sd = {
        "floatBox.open": ds.name || '',
        "repaySelector.index": '0',
        "result": 0
    }

    if (ds.disabled && !data.form.input['houseMoney']) {
        sd = {
            'toastText': '请输入房价总额'
        }
    }

    if (ds.name) {
        if (data.form.selected[ds.name].custom) {
            sd['form.custom.' + ds.name] = data.form.selected[ds.name].val
        } else {
            sd['form.selected.' + ds.name + '.idx'] = data.form.selected[ds.name].idx
        }
    }

    this.setData(sd);

    if (data.toastText) {
        this.hideToast();
    }

}

function input(e) {
    let val = e.detail.value,
        ds = e.currentTarget.dataset,
        data = this.data;

    val = parseInt(val);

    let sd = {
        ['form.input.' + ds.name]: val,
        "repaySelector.index": '0',
        "result": null
    };

    let linkCalc = true;
    if (!val) {
        sd = {
            ['form.input.' + ds.name]: 0
        }
        if (ds.link) {
            sd['form.input.' + ds.link] = 0;
        }
        linkCalc = false;
    } else if (val < 0) {
        sd = {
            ['form.input.' + ds.name]: data.form.input[ds.name]
        }
        linkCalc = false;
    } else if (data.loanSelector.index === '0' && val > 9999) {
        sd = {
            ['form.input.' + ds.name]: data.form.input[ds.name],
            'toastText': '贷款总额超出计算范围'
        }
        linkCalc = false;
    } else if (data.titleSelector.index === '1' && data.loanSelector.index === '0') {
        if (val > 120) {
            sd = {
                ['form.input.' + ds.name]: 120,
                'toastText': '目前公积金最大贷款上限为120万'
            }
            linkCalc = false;
        }
    }

    if (ds.link && linkCalc) {
        sd['form.input.' + ds.link] = parseFloat((val * (1 - data.form.selected['payRatio'].val)).toFixed(2));
    }
    this.setData(sd);

    if (data.toastText) {
        this.hideToast();
    }
}

function input2(e) {
    let val = e.detail.value,
        ds = e.currentTarget.dataset,
        data = this.data;
    let sd = {
        ['form.input.' + ds.name]: val,
        "repaySelector.index": '0',
        "result": null
    };
    // 清空
    if (ds.name === 'fullMoney' || ds.name === 'houseMoney') {
        sd['form.input.fundMoney'] = 0;
        sd['form.input.lendMoney'] = 0;
    }

    if (data.loanSelector.index === '1' && ds.name !== 'houseMoney') {
        val = parseFloat(val);
    } else {
        val = parseInt(val);
    }

    let key = data.loanSelector.index === '0' ? 'fullMoney' : 'fullMoneyDis';
    let fm = data.form.input[key];
    let linkCalc = true;
    if (!val) {
        sd = {
            ['form.input.' + ds.name]: 0
        }
        if (ds.name === 'lendMoney' || ds.name === 'fundMoney') {
            sd['form.input.' + ds.link] = fm;
        }
        linkCalc = false;
    } else if (val < 0) {
        sd = {
            ['form.input.' + ds.name]: data.form.input[ds.name]
        }
        linkCalc = false;
    } else if (ds.name === 'fundMoney') {
        if (val > fm) {
            if (fm > 120) {
                sd = {
                    ['form.input.' + ds.name]: 120,
                    ['form.input.' + ds.link]: fm - 120
                }
            } else {
                sd = {
                    ['form.input.' + ds.name]: fm,
                    ['form.input.' + ds.link]: '0',
                    'toastText': '公积金贷款已超过贷款总额'
                }
            }
            sd['toastText'] = '公积金贷款已超过贷款总额';
            linkCalc = false;
        } else if (val > 120) {
            sd = {
                ['form.input.' + ds.name]: 120,
                ['form.input.' + ds.link]: fm - 120,
                'toastText': '目前公积金最大贷款上限为120万'
            }
            linkCalc = false;
        } 
    } else if (ds.name === 'lendMoney') {
        if (val > fm) {
            sd = {
                ['form.input.' + ds.name]: fm,
                ['form.input.' + ds.link]: '0',
                'toastText': '商业贷款已超过贷款总额'
            }
            linkCalc = false;
        }
    } else if (ds.name === 'fullMoney') {
        if (val > 9999) {
            sd = {
                ['form.input.' + ds.name]: data.form.input[ds.name],
                'toastText': '贷款总额超出计算范围'
            }
            linkCalc = false;
        }
    }

    if (ds.link && linkCalc) {
        if (ds.link === 'fullMoneyDis') {
            sd['form.input.' + ds.link] = parseFloat((val * (1 - data.form.selected['payRatio'].val)).toFixed(2));
        } else {
            sd['form.input.' + ds.link] = parseFloat((fm - val).toFixed(2));
        }
    }
    this.setData(sd);

    if (data.toastText) {
        this.hideToast();
    }
}

function focus2(e) {
    let val = e.detail.value,
        ds = e.currentTarget.dataset,
        data = this.data;

    let sd = {}
    if (val === '0') {
        sd['form.input.' + ds.name] = 0;
    }

    if (ds.name === 'lendMoney' || ds.name === 'fundMoney') {
        if (data.loanSelector.index === '0' && !data.form.input['fullMoney']) {
            sd['toastText'] = '请输入贷款总额';
        }
        if (data.loanSelector.index === '1' && !data.form.input['fullMoneyDis']) {
            sd['toastText'] = '请输入房价总额';
        }
    }

    this.setData(sd);

    if (data.toastText) {
        this.hideToast();
    }
}

/**
 * 点击计算按钮
    // 还款类型 0:等额本息 1:等额本金
    payMethodType: data.repaySelector.index + '',
    // 贷款类型 0:商业贷款 1:公积金贷款 2:组合贷款
    pageType: data.pageType + '',
    // 房价总额
    totalMoney: data.form.houseMoney + '',
    // 贷款总额(万元)
    dkTotalMoney: data.form.lendMoney + '',
    // 首付比例(万元)
    sfMoney: data.form.selected['payRatio'].val + '',
    // 按揭年数
    ajYear: data.form.selected['loanTerm'].val + '',
    // 利率倍数
    rateDiscount: data.form.selected['lendRate'].val + '',
    // 利率
    rate: data.form.baseRate + ''
 */

function calc() {
    let data = this.data,
        sd = {};

    if (data.loanSelector.index === '0' && !data.form.input['lendMoney']) {
        sd = {
            'toastText': '请输入贷款总额'
        }
    }

    if (data.loanSelector.index === '1') {
        if (!data.form.input['houseMoney']) {
            sd = {
                'toastText': '请输入房价总额'
            }
        }
        if (data.form.input['lendMoneyDis'] > 9999) {
            sd = {
                'toastText': '贷款总额超出计算范围'
            }
        }
    }

    if (data.titleSelector.index === '1') {
        if (data.loanSelector.index === '0' && data.form.input['lendMoney'] > 120) {
            sd = {
                'toastText': '目前公积金最大贷款上限为120万'
            }
        } 
        if (data.loanSelector.index === '1' && data.form.input['lendMoneyDis'] > 120) {
            sd = {
                'toastText': '目前公积金最大贷款上限为120万'
            }
        }
    }

    if (sd.toastText) {
        this.setData(sd);
        this.hideToast();
        return;
    }

    this.calcResult()
}

function calc2() {
    let data = this.data,
        sd = {};

    if (data.loanSelector.index === '0') {
        if (!data.form.input['fullMoney']) {
            sd = {
                'toastText': '请输入贷款总额'
            }
        } else if (!data.form.input['fundMoney']) {
            sd = {
                'toastText': '请输入公积金贷款'
            }
        } else if (data.form.input['fundMoney'] > 120) {
            sd = {
                'toastText': '目前公积金最大贷款上限为120万'
            }
        }
    }

    if (data.loanSelector.index === '1') {
        if (!data.form.input['houseMoney']) {
            sd = {
                'toastText': '请输入房价总额'
            }
        } else if (!data.form.input['fundMoney']) {
            sd = {
                'toastText': '请输入公积金贷款'
            }
        } else if (data.form.input['fundMoney'] > 120) {
            sd = {
                'toastText': '目前公积金最大贷款上限为120万'
            }
        } else if (data.form.input['lendMoneyDis'] > 9999) {
            sd = {
                'toastText': '贷款总额超出计算范围'
            }
        }
    }

    if (sd.toastText) {
        this.setData(sd);
        this.hideToast();
        return;
    }

    this.calcResult();
}

module.exports = {
    "form.tap": tap,
    "form.input": input,
    "form.input2": input2,
    "form.focus2": focus2,
    "form.calc": calc,
    "form.calc2": calc2,
};
