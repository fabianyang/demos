/**
 * @file 计算器类型选择类
 * @author yangfan
 */
function tap(e) {
    let ds = e.currentTarget.dataset,
        data = this.data;

    let o = {
        'loanSelector' : data.loanSelector,
        'form.selected' : data.form.selected,
        'form.input' : data.form.input
    }
    data.titleSelector.store[data.titleSelector.index] = JSON.stringify(o); 

    let sd = {
        "titleSelector.index": ds.index,
        "repaySelector.index": '0',
        "result": null,
        "form.custom.lendRate": '',
        "form.custom.fundRate": ''
        // "form.houseMoney": '',
        // "form.lendMoney": '',
        // "form.lendMoneyDis": ''
    }

    if (data.titleSelector.store[ds.index]) {
        let json = JSON.parse(data.titleSelector.store[ds.index]);
        sd['loanSelector'] = json['loanSelector'];
        sd['form.selected'] = json['form.selected'];
        sd['form.input'] = json['form.input'];
    } else {
        sd['loanSelector'] = {
            index: '0',
            store: {}
        };
        sd['form.selected'] = data.initSelected;
        sd['form.input'] = data.initInput;
    }

    this.setData(sd);
}

module.exports = {
    "titleSelector.tap": tap
};
