/**
 * @file 还款方式选择类
 * @author yangfan
 */
function tap(e) {
    let ds = e.currentTarget.dataset;
    this.setData({
        "repaySelector.index": ds.index
    });
    
    if (this.data.titleSelector.index !== '2') {
        this['form.calc']();
    } else {
        this['form.calc2']();
    }
}

function href(e) {
    let ds = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/tools/detail/detail?' + ds.params
    })
    console.log(ds.params)
}

module.exports = {
    "repaySelector.tap": tap,
    "repaySelector.href": href
};
