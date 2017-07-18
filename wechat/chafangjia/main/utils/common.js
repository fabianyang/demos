/**
 * common.js
 * @file 设置一些公共功能如加载中等
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
module.exports = {
    /**
     * 加载中吐司
     * @param txt 加载内容
     */
    loadingToast: function (txt = '加载中...') {
        let showFn = function () {
            wx.showToast({
                title: txt,
                icon: 'loading',
                mask: true,
                // 最大10s
                duration: 10000
            });
        };
        showFn();
        let time = setInterval(() => {
            if (this.data.dataLoad) {
                wx.hideToast();
                clearInterval(time);
            }
        }, 100);
    },
    /**
    * 判断页面是否加载失败：10s轮询
    * @return null
    */
    checkFail: function () {
        // 1s间隔查询，成功初始化页面
        let waitTime = 10;
        let time = setInterval(() => {
            waitTime--;
            // 页面加载完毕或者时间到清除计时器
            if (this.data.dataLoad || !waitTime) {
                clearInterval(time);
                // 时间到
                !waitTime && (this.setData({
                    'failInfo.showFail': true
                }));
            }
        }, 1000);
    }
};