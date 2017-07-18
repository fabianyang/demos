/**
 * share.js
 * @file 设置一些公共功能如分享等，若不满足可在单独页面重新设置
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
const utils = require('./utils.js');
module.exports = {
    /**
     * 公共分享
     * 标题和说明需要在本页面配置函数 shareInfoFn 返回标题和说明{desc：'',title: ''}
     * 参数需设置到params
     * @returns {{title: (string|*), desc: (string|*), path: string}}
     */
    onShareAppMessage: function () {
        // 获取当前页面路径
        let info = utils.getCurrentPage();
        let path = info.path, thisPage = info.currPage;
        let shareInfo = thisPage.shareInfoFn ? thisPage.shareInfoFn() : { desc: '房天下欢迎您', title: '房天下' };
        return {
            title: shareInfo.title,
            desc: shareInfo.desc,
            path: path
        };
    }
};