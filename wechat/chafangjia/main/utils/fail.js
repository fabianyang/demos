/**
 * fail.js
 * @file 页面异常插件：重新加载
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
const utils = require('./utils.js');
module.exports = {
    // 重新加载页面
    reloadTap: function () {
        // 获取当前页面路径
        let path = utils.getCurrentPage();
        wx.redirectTo({ url: path });
    }
};
