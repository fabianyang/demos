/**
 * xiaoquDetail.js
 * @file 小区详情页
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
const select = require('../../../utils/select.js');
const search = require('../../../utils/search.js');
const utils = require('../../../utils/utils.js');
const common = require('../../../utils/common.js');
const share = require('../../../utils/share.js');
const fail = require('../../../utils/fail.js');
let vars = app.vars;
// 页面配置
let page = {
    // 设置分享信息
    shareInfoFn: function () {
        return { desc: '我发现了一个不错的楼盘: ' + (this.data.pageInfo.ProjInfo.projname || '') + ', 所在区域: ' + (this.data.pageInfo.ProjInfo.district || ''), title: (this.data.pageInfo.ProjInfo.projname || '') };
    },
    // 页面数据
    data: {
        swiper: {
            indicatorDots: true,
            circular: true,
            autoplay: false,
            interval: 5000,
            duration: 1000
        },
        canCheck: true,
        // 滚动高度
        scrollTop: 0,
        //  表单提交
        evaform: {
            builtArea: null,
            floor: null,
            zfloor: null,
            xqid: '',
            xqname: ''
        },
        // 是否为显示更多状态
        isShowMore: false,
        // 选择朝向
        selectInfo: {
            selectArr: [{ val: '东', id: '' }, { val: '南', id: '' }, { val: '西', id: '' }, { val: '北', id: '' }, { val: '东南', id: '' }, { val: '东北', id: '' }, { val: '西南', id: '' }, { val: '西北', id: '' }, { val: '南北', id: '' }, { val: '东西', id: '' }],
            currentSel: '南',
            showSelect: false
        },
        // 当前城市：跳转到附近小区用
        cityname: '',
        failInfo: { showFail: false },
        dataLoad: false,
        cityInfo: {}
    },
    // 显示更多
    showMore: function () {
        this.setData({ 'isShowMore': !this.data.isShowMore });
    },
    // 跳转到小区成交记录
    gotoTradeList: function () {
        if (this.data.pageInfo.esfSalNum) {
            let paramObj = { cityname: this.options.cityname, projcode: this.data.pageInfo.ProjInfo.newcode }
            let paramStr = utils.queryStringify(paramObj);
            wx.navigateTo({
                url: '/pages/fangjia/tradeCaseList/tradeCaseList?' + paramStr
            })
        }
    },
    scroll: function (e) {
        this.setData({
            scrolltop: e.detail.scrollTop
        });
    },
    // 选择朝向
    selToward: function () {
        this.setData({ 'selectInfo.showSelect': true });
    },
    // 面积输入
    bindBuildInput: function (e) {
        this.setData({
            'evaform.builtArea': e.detail.value
        });
    },
    // 层数输入
    bindFloorInput: function (e) {
        this.setData({
            'evaform.floor': e.detail.value
        });
    },
    // 总层数输入
    bindZfloorInput: function (e) {
        this.setData({
            'evaform.zfloor': e.detail.value
        });
    },

    /***
     * 开始评估
     * @returns null
     */
    beginEva: function () {
        let that = this, data = this.data.evaform;
        for (let val in data) {
            if (!data.hasOwnProperty(val)) {
                continue;
            }
            // 建筑面积非0验证
            if (!data[val] || (val === 'builtArea') && data[val] == 0) {
                let txt = '请填写完整信息';
                // 小区为空
                if (val === 'xqid' && !data[val]) {
                    txt = '请填写正确信息';
                }
                wx.showToast({
                    title: txt,
                    icon: 'success',
                    mask: true,
                    duration: 2000
                });
                return;
            }
        }
        //  楼层、总楼层关系验证
        if (!isNaN(data.zfloor) && !isNaN(data.floor) && parseInt(data.floor) > parseInt(data.zfloor)) {
            wx.showToast({
                title: '楼层不得大于总楼层',
                icon: 'success',
                mask: true,
                duration: 2000
            });
            return;
        } else if (isNaN(data.floor) || isNaN(data.zfloor) || isNaN(data.builtArea)) {
            wx.showToast({
                title: '请输入有效数据',
                icon: 'success',
                mask: true,
                duration: 2000
            });
            return;
        } else if (data.floor < 1 || data.zfloor > 100) {
            wx.showToast({
                title: '楼层范围1至100层',
                icon: 'success',
                mask: true,
                duration: 2000
            });
            return;
        } else if (data.builtArea > 2000 || data.builtArea < 1 || data.builtArea.indexOf('0') === 0) {
            // 面积限制：0开头不符合规则
            wx.showToast({
                title: '建筑面积范围1至2000平米',
                icon: 'success',
                mask: true,
                duration: 2000
            });
            return;
        } else if (data.builtArea.indexOf('.') > -1 && !/^\d+(.\d{0,2})?$/.test(data.builtArea)) {
            // 面积限制两位小数
            wx.showToast({
                title: '建筑面积最多两位小数',
                icon: 'success',
                mask: true,
                duration: 2000
            });
            return;
        }
        let paramObj = { cityname: this.options.cityname, newcode: data.xqid, Projname: data.xqname, foward: this.data.selectInfo.currentSel, Area: data.builtArea, floor: data.floor, zfloor: data.zfloor };

        // 判断是否支持再决定跳转
        utils.request({
            url: vars.interfaceSite + 'estimateResultApi',
            data: {
                cityname: paramObj.cityname,
                newcode: paramObj.newcode,
                Projname: paramObj.Projname,
                // 朝向
                forward: paramObj.foward,
                // 面积
                Area: paramObj.Area,
                // 楼层
                floor: paramObj.floor,
                // 总楼层
                zfloor: paramObj.zfloor
            },
            complete: res => {
                let resData = res.data;
                // 不支持评估弹出提示
                if (typeof resData === 'string' && resData === 'error1') {
                    // that.setData({
                    //     noSupport: true
                    // });
                    // setTimeout(() => {
                    //     that.setData({
                    //         noSupport: false
                    //     });
                    // }, 2000);
                    wx.showToast({
                        title: '抱歉,该小区暂不支持查房价',
                        icon: 'success',
                        mask: true,
                        duration: 2000
                    });
                } else {
                    let paramStr = utils.queryStringify(paramObj);
                    // 跳转评估结果页面
                    wx.navigateTo({
                        url: '/pages/fangjia/xiaoquEvaResults/xiaoquEvaResults?' + paramStr
                    });
                }
            }
        });

    },
    /***
     * 打开微信内置地图
     * @returns null
     */
    openPosition: function () {
        if (this.data.pageInfo.ProjInfo.coord_x && this.data.pageInfo.ProjInfo.coord_y) {
            wx.openLocation({
                latitude: +this.data.pageInfo.ProjInfo.coord_y,
                longitude: +this.data.pageInfo.ProjInfo.coord_x,
                name: this.data.pageInfo.ProjInfo.projname,
                address: this.data.pageInfo.ProjInfo.address,
                scale: 18
            });
        }
    },
    /***
     * 页面加载回调
     * @returns null
     */
    onLoad: function (options) {
        // Do some initialize when page load.
        let that = this;
        // 设置loading
        that.loadingToast();
        // 加载失败检查
        this.checkFail();
        that.options = options || {};
        // for share
        that.params = options || {};
        that.options.cityname = that.options.cityname || app.userPosition.shortCity || '北京';
        this.setData({
            'cityname': that.options.cityname,
        });
        // 设置标题
        wx.setNavigationBarTitle({
            title: options.title
        });
        // 默认小区为当前小区
        this.setData({
            'evaform.xqid': options.xqid,
            'evaform.xqname': options.title
        });
        // 获取小区信息
        let pageInfoTask = new Promise((resolve, reject) => {
            /****
            1、cityname城市中文
            2、xqid 小区id
            3、pagesize 为附近小区列表条数
            返回结果: 
            result数组
            ProjInfo为小区信息
            img 为详细图片
            nearXiaoQuList 为附近小区列表
            esfSalNum 二手房成交套数
            esfSallingNum 二手房正在销售的数量 **/
            utils.request({
                url: vars.interfaceSite + 'esfxqDetail',
                data: {
                    cityname: that.options.cityname,
                    xqid: that.options.xqid,
                    // 接口：取3条需要传4
                    pagesize: 4
                },
                complete: res => {
                    console.log('pageInfo:', res);
                    // 若附近小区先请求完成则将附近小区加上
                    let nearXiaoquList = null;
                    (typeof that.data.pageInfo === 'object') && (nearXiaoquList = that.data.pageInfo.nearXiaoQuList);
                    let resData = res.data;
                    if (typeof resData === 'object') {
                        let res = [];
                        res[0] = resData;
                        // 图片限制为为5
                        let maxImgNum = 5;
                        if (res[0].img && res[0].img.all_picArr.length && res[0].img.all_picArr.length > maxImgNum) {
                            let newArr = res[0].img.all_picArr.filter((item, idx) => {
                                return idx < maxImgNum;
                            });
                            res[0].img.all_picArr = newArr;
                        };
                        // 设置环比上月格式
                        if (res[0].ProjInfo && typeof res[0].ProjInfo === 'object') {
                            let monthadd = res[0].ProjInfo.monthadd;
                            res[0].ProjInfo.monthadd = !isNaN(monthadd) ? (monthadd + '%') : '持平';
                            // 绿化率加%
                            res[0].ProjInfo.virescencerate = res[0].ProjInfo.virescencerate ? (res[0].ProjInfo.virescencerate + '%') : '';
                            //  百度坐标转为国测局坐标（腾讯坐标）
                            if (res[0].ProjInfo.coord_x && res[0].ProjInfo.coord_y) {
                                let latLng = utils.bd09ToGcj02(res[0].ProjInfo.coord_x, res[0].ProjInfo.coord_y);
                                res[0].ProjInfo.coord_x_t = latLng.lng;
                                res[0].ProjInfo.coord_y_t = latLng.lat;
                            }
                        }
                        // 附近小区赋值
                        res[0].nearXiaoQuList = nearXiaoquList;
                        // 初始化页面数据
                        that.setData({
                            dataLoad: true,
                            pageInfo: res[0]
                        });
                        // 接着执行附近小区任务
                        resolve(resData);
                    } else {
                        // 初始化页面数据，有小区数据也展示
                        that.setData({
                            dataLoad: nearXiaoquList,
                            pageInfo: { nearXiaoQuList: nearXiaoquList }
                        });
                        console.log('非object' + resData);
                        reject();
                    }
                }
            });
        });
        app.time("xiaoquHistory");
        // 获取小区搜索历史
        let searchInfoTask = new Promise((resolve, reject) => {
            let historyTag = 'xiaoquHistory';
            wx.getStorage({
                key: historyTag,
                complete: res => {
                    app.timeEnd("xiaoquHistory");
                    let history = (res.data || []).map(value => ({
                        raw: value,
                        name: value.split(',')[0]
                    }));
                    let searchInfo = {
                        history: history,
                        value: '',
                        cityname: that.options.cityname,
                        placeholder: '请输入小区名',
                        historyTag: historyTag,
                        // 1:history show;2:autoprompt show;3: autopromt nodata;0:hide;
                        showHistory: history.length ? 1 : 0
                    };
                    resolve(searchInfo);
                    console.log('storage:', res);
                    // 初始化页面数据
                    that.setData({
                        searchInfo: searchInfo
                    });
                }
            });
        });
        // 获取附近小区
        Promise.all([pageInfoTask]).then(res => {
            utils.request({
                url: vars.interfaceSite + 'nearXiaoQuList',
                data: {
                    cityname: that.options.cityname,
                    xqid: that.options.xqid,
                    coord_x: this.data.pageInfo.ProjInfo.coord_x,
                    coord_y: this.data.pageInfo.ProjInfo.coord_y,
                    projtype: this.data.pageInfo.ProjInfo.projtype,
                    // 接口：取3条需要传4
                    pagesize: 4
                },
                complete: res => {
                    console.log('pageInfo:', that.data);
                    let resData = res.data, pageInfo = that.data.pageInfo;
                    // 设置附近小区数据
                    (typeof pageInfo !== 'object') && (pageInfo = {});
                    // 合并数据
                    utils.assign(pageInfo, resData);
                    // 设置附近小区价格为整数
                    if (pageInfo.nearXiaoQuList && pageInfo.nearXiaoQuList.length) {
                        let nearArr = pageInfo.nearXiaoQuList;
                        nearArr = nearArr.map(item => {
                            item.price = parseInt(item.price);
                            // 图片地址处理
                            item.coverimg = utils.ensurepProtocol(null, null, item.coverimg);
                            return item;
                        });
                        pageInfo.nearXiaoQuList = nearArr;
                    }
                    that.setData({
                        dataLoad: true,
                        pageInfo: pageInfo
                    });
                }
            });
        });

        // 非查房价城市不显示评估
        if (typeof vars.isBargainCity === 'undefined') {
            app.checkPrice(that.params.cityname).then(res => {
                vars.isBargainCity = res;
                this.setData({
                    'canCheck': vars.isBargainCity,
                });
            });
        } else {
            this.setData({
                'canCheck': vars.isBargainCity
            });
        }
    },
    /***
     * 点击小区历史或suggest执行搜索
     * @returns null
     */
    search: function (name) {
        let info = name.split(',');
        this.setData({
            'hasSelected': true,
            'evaform.xqname': info[0],
            'evaform.xqid': info[1]
        });
        this.clearInput();
    }
};
// 合并属性
utils.assign(page, select, search, share, common, fail);
// 渲染页面
Page(page);
