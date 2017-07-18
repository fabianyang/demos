/**
 * select.js
 * @file 通用选择插件
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
module.exports = {
    // 取消选择
    cancelTap: function () {
        this.setData({
            'selectInfo.showSelect': false
        });
    },
    // 选择某项
    selectTap: function (e) {
        let dataset = e.currentTarget.dataset;
        let idx = +dataset.idx;
        let selectArr = this.data.selectInfo.selectArr;
        this.setData({ 'selectInfo.currentSel': selectArr[idx].val, 'selectInfo.showSelect': false });
    }
};
