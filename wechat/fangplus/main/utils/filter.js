/**
 * @file 快筛功能模块
 * @author icy
 */
// 基础方法模块
const utils = require('utils.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
module.exports = {
    /**
     * 菜单点击事件handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    menuTap: function (e) {
        // 当前选择菜单序号
        let idx = +e.currentTarget.dataset.idx;
        // 筛选数据
        let filterInfo = this.data.pageInfo.filterInfo;
        // 当前是否已筛选(用于判断展示默认筛选还是当前筛选)
        filterInfo.isFilter = false;
        // 遍历菜单列表
        filterInfo.filterArr.forEach((filter, index) => {
            if (index !== idx) {
                // 隐藏不是当前菜单
                filter.isShow = false;
            } else {
                // 记录当前点击菜单序号
                filterInfo.activeFilter = index;
                // 当前已筛选(用于判断展示默认筛选还是当前筛选)
                filterInfo.filterArr[index].hasParams = true;
                // 整个菜单界面随当前点击菜单显/隐
                filterInfo.isFilter = filter.isShow = !filter.isShow;
                // 记录当前点击菜单
                filterInfo.firstFilter = this.firstFilter;
            }
        });
        this.setData({
            'pageInfo.filterInfo': filterInfo
        });
    },
    /**
     * 菜单项点击事件handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    optionTap: function (e) {
        let dataset = e.currentTarget.dataset;
        // 菜单项序数
        let idx = +dataset.idx;
        // 是否是一级菜单
        let isFirst = dataset.first;
        // 菜单项id
        let id = dataset.id;
        // 筛选信息
        let filterInfo = this.data.pageInfo.filterInfo;
        // 当前快筛菜单
        let filter = filterInfo.filterArr[filterInfo.activeFilter];
        filter.hasParams = false;
        if (isFirst) {
            // 当前菜单项如果不是第一个菜单项(不限)并且没有可跳转标志(无二级菜单),记录当前选择一级菜单并初始化二级菜单
            if (filterInfo.firstFilter !== idx && !dataset.jump) {
                let firstFilter = filter.data[filterInfo.firstFilter];
                firstFilter && (firstFilter.sub.active = null);
                filterInfo.firstFilter = null;
            }
            filter.active = id;
            filterInfo.firstFilter = idx;
        } else {
            // 二级菜单，记录当前筛选信息
            let firstFilter = filter.data[filterInfo.firstFilter].sub;
            firstFilter.active = id;
            filterInfo.secfilter = idx;
        }
        this.setData({ 'pageInfo.filterInfo': filterInfo });
        console.log(dataset.jump);
        // 可跳转菜单项跳转(包括一级菜单不限，没有二级菜单的一级菜单，二级菜单)
        dataset.jump && this.filter();
    },
    /**
     * 自定义菜单输入handle
     * @param  {[object]} e 输入事件
     * @return null
     */
    customInput: function (e) {
        // 输入值
        let value = e.detail.value;
        // 输入类型(最小值或最大值)
        let type = e.currentTarget.dataset.type;
        // 快筛信息
        let filterInfo = this.data.pageInfo.filterInfo;
        // 当前快筛菜单
        let filter = filterInfo.filterArr[filterInfo.activeFilter];
        // 记录输入值
        filter.custom[type] = value;
    },

    stopPropgation: function () {}
};
