/**
 * @file 商业贷款、公积金贷款，总额计算方式选择类
 * @author yangfan
 */
function tap(e) {
    let ds = e.currentTarget.dataset,
        data = this.data;

    let o = {
        'form.selected' : data.form.selected,
        'form.input' : data.form.input
    }
    data.loanSelector.store[data.loanSelector.index] = JSON.stringify(o); 

    let index = ds.index;

    let sd = {
        "loanSelector.index": index,
        "repaySelector.index": '0',
        "result": null,
        "form.custom.lendRate": '',
        "form.custom.fundRate": ''
        // "form.houseMoney": '',
        // "form.lendMoney": '',
        // "form.lendMoneyDis": ''
    }

    if (data.loanSelector.store[index]) {
        let json = JSON.parse(data.loanSelector.store[index]);
        sd['form.selected'] = json['form.selected'];
        sd['form.input'] = json['form.input'];
    } else {
        sd['form.selected'] = data.initSelected;
        sd['form.input'] = data.initInput;
    }

    this.setData(sd);
}


module.exports = {
    "loanSelector.tap": tap
};
