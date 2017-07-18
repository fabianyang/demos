/**
 * @file 浮层功能模块
 * @author yangfan
 */

/**
 * 选择浮层选项，注意 data.form.baseRate 和 data.baseRate
 */
function select(e) {
    let ds = e.currentTarget.dataset,
        data = this.data;
    
    let open = data.floatBox.open,
        text = ds.txt,
        value = +ds.val;

    let sd = {
        ['form.selected.' + open + '.val']: value,
        ['form.selected.' + open + '.txt']: text,
        ['form.selected.' + open + '.idx']: ds.idx,
        'floatBox.open': ''
    }

    /**
     * 格式化商贷利率
     */
    if (open === 'lendRate' || open === 'fundRate') {
        let key = open.substr(0, 4);
        text = '基准利率（' + data.form.baseRate[key].toFixed(2) + '%）';
        if (value !== 1) {
            // 大于 3 位小数
            let diff = parseFloat((value * data.form.baseRate[key]).toFixed(3));
            text = diff + '%';
        }
        sd['form.selected.' + open + '.txt'] = text;
        sd['form.selected.' + open + '.custom'] = false;
        sd['form.custom.' + open] = '';
    }

    /**
     * 贷款年限联动商贷利率
     */
    if (open === 'loanTerm') {
        let br = data.form.baseRate;
        if (data.titleSelector.index === '0' || data.titleSelector.index === '2') {
            br.lend = data.listLilv.lend[0];
            if (value < 2) {
                br.lend = data.listLilv.lend[3];
            } else if (value < 4) {
                br.lend  = data.listLilv.lend[2];
            } else if (value < 6) {
                br.lend = data.listLilv.lend[1];
            }

            console.log('baseRate.lend', br.lend);

            let lr = data.form.selected.lendRate;
            
            console.log('selected.lendRate', lr.val);
            // 不是自定义利率
            if (!lr.custom) {
                text = '基准利率（' + br.lend.toFixed(2) + '%）';
                if (lr.val !== 1) {
                    let diff = parseFloat((br.lend * lr.val).toFixed(3));
                    text = diff + '%';
                }

                sd['form.selected.lendRate.txt'] = text;
            }

        }
        if (data.titleSelector.index === '1' || data.titleSelector.index === '2') {
            br.fund = data.listLilv.fund[0];
            if (value < 6) {
                br.fund = data.listLilv.fund[1];
            }

            let fr = data.form.selected.fundRate;
            if (!fr.custom) {
                text = '基准利率（' + br.fund.toFixed(2) + '%）';
                if (fr.val !== 1) {
                    let diff = parseFloat((br.fund * fr.val).toFixed(3));
                    text = diff + '%';
                }

                sd['form.selected.fundRate.txt'] = text;
            }
        } 
    }

    /**
     * 首付比例联动贷款总额
     */
    if (open === 'payRatio' && data.form['houseMoney']) {
        sd['form.input.lendMoneyDis'] = parseFloat((data.form['houseMoney'] * (1 - value)).toFixed(2));
    }

    this.setData(sd);
}

function close() {
    let sd = {
        'floatBox.open': ''
    }
    let open = this.data.floatBox.open;
    if (open === 'lendRate') {
        sd['form.custom.' + open] = '';
    }
    this.setData(sd);
}

function input(e) {
    let val = e.detail.value,
        ds = e.currentTarget.dataset,
        data = this.data;

    let sd = {
        ['form.custom.' + ds.name]: val
    }

    if (!val || val === '.') {
        sd = {
            ['form.custom.' + ds.name]: ''
        }
        // 两位小数正则：/^\d+(\.\d{2})?$/
        // 三位小数正则：/^[1-9](\d+)?(\.|\.?\d{1,3})?$/
    } else if (!/^(\d|[1-9](\d+))?(\.|\.\d{1,3})?$/.test(val)) {
        sd = {
            ['form.custom.' + ds.name]: data.form.custom[ds.name]
        }
    } else {
        val = parseFloat(val);
        if (val < 0 || val > 100) {
            sd = {
                ['form.custom.' + ds.name]: data.form.custom[ds.name],
                'toastText': '请输入100以内的数字'
            }
        }
    }

    this.setData(sd);

    if (data.toastText) {
        this.hideToast();
    }

}

function confirm(e) {
    let ds = e.currentTarget.dataset,
        data = this.data;

    let sd = {
        ['form.custom.' + ds.name]: '',
        'toastText': '请输入自定义利率'
    }

    var customValue = +data.form.custom[ds.name]

    if (customValue > 0) {
        sd = {
            ['form.selected.' + ds.name]: { val: customValue, txt: customValue + '%', custom: true },
            // ['form.custom.' + ds.name]: '',
            'floatBox.open': ''
        }
    }

    this.setData(sd);

    if (data.toastText) {
        this.hideToast();
    }
}

function focus(e) {
    // console.log('focus');
    let val = e.detail.value,
        ds = e.currentTarget.dataset,
        data = this.data;
    
    let sd = {
        ['form.custom.' + ds.name]: ''
    }
    this.setData(sd);
}

function blur() {
    // console.log('blur');
    // this.setData({
    //     'form.custom.ing': false
    // });
}


module.exports = {
    'floatBox.close': close,
    'floatBox.select': select,
    'floatBox.input': input,
    'floatBox.confirm': confirm,
    'floatBox.focus': focus,
    'floatBox.blur': blur
};
