/**
 * @file 城市切换选择模块
 * @author icy
 */
const app = getApp();
// 基础工鞥模块
const utils = require('utils.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
module.exports = {
    /**
     * 城市切换界面显/隐切换
     * @return null
     */
    citySelectToggle: function () {
        this.setData({
            'cityInfo.isShow': !this.data.cityInfo.isShow
        })
    },
    /**
     * 城市导航切换（快速跳转相应城市类别）
     * @param  {[object]} e 点击事件
     * @return null
     */
    cityTab: function (e) {
        this.setData({
            'cityInfo.active': e.currentTarget.dataset.id
        });
    },
    /**
     * 城市选择
     * @param  {[object} e 点击事件
     * @return null
     */
    cityPick: function (e) {
        let params = {};
        // 选择城市名
        let cityName = e.currentTarget.dataset.id;
        // 已选择城市历史
        let cityHistory = this.data.cityInfo.cityHistory;
        // 历史记录数组
        let history = cityHistory.history;
        // 当前城市在历史数组中序号
        let index = history.indexOf(cityName);
        // 如果存在删除对应历史项
        if (~index) {
            history.splice(index, 1);
        }
        // 历史数组前插当前选择城市
        history.unshift(cityName);
        // 超过10条截取最新10条
        history.length > 10 && (history.length = 10);
        // 存localstorage
        wx.setStorageSync(cityHistory.historyTag, history);
        params.cityname = cityName;
        params.customCity = true;
        wx.redirectTo({
            url: this.data.searchInfo.url + '?' + queryStringify(params)
        });
    },
    /**
     * 重新定位成功显示当前定位信息
     * @return null
     */
    reLocate: function () {
        app.getLocation(userPosition => {
            this.setData({
                'cityInfo.positionCity': userPosition.shortCity,
                'cityInfo.location': userPosition.addr,
                'cityInfo.showCurrentLocation': true
            });
            setTimeout(() => this.setData({ 'cityInfo.showCurrentLocation': false }), 2000);
        },userPosition => {
            this.setData({
                'cityInfo.showFailLocation': true
            });
            setTimeout(() => this.setData({ 'cityInfo.showFailLocation': false }), 2000);
        })
    }
};
