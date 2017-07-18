/**
 * Created by liuxinlu@fang.com on 17/1/13.
 *  二手房列表页
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
// 快筛功能模块
const filter = require('../../../utils/filter.js');
// 基础方法模块
const utils = require('../../../utils/utils.js');
// 搜索功能模块
const search = require('../../../utils/search.js');
// 通用方法模块
const common = require('../../../utils/common.js');
// 分享
const share = require('../../../utils/share.js');

// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let vars = app.vars;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
/**
 *
 *
 未筛选
 标题：城市二手房
 描述：轻松选房真房源，专业经纪人线下服务！
 有筛选项
 标题：城市+商圈好房推荐
 标题：房天下帮你找到这些优惠房源，来看看吧
 */
let page = {
    data: {
        // 当前页显示数据是否加载完毕
        dataLoad: false,
        listReady: true,
        pageInfo:{filterInfo:[]},
        // 是否为自营列表
        dsType: false
    },
    shareInfoFn: function () {
        let desc='轻松选房真房源，专业经纪人线下服务！',
            title='城市二手房';
        if (this.hasFilter) {
                desc = '房天下帮你找到这些优惠房源，来看看吧';
                title = this.params.cityname + (this.params.district === '不限' ? '': this.params.district) + (this.params.comarea === '不限' ? '': this.params.comarea) + '好房推荐';
        }
        return {
            desc:desc,
            title:title
        };
    },
    /**
     * [page 加载回调]
     * @param  {[object]} params [query]
     * @return null
     */
    onLoad: function (params) {
        app.now2 = Date.now();
        vars.isSearch = true;
        // 设置loading
        this.loadingToast();
        this.params = params || {};
        // 判断筛选条件
        if (this.params.district || this.params.price || this.params.ordertype || this.params.roomtype) {
            this.hasFilter = true;
        }
        // 是否获取在售房源
        if (this.params.projcode && this.params.src) {
            this.onSale = true;
        }
        // 判断是否为自营列表
        if (this.params.type) {
            this.setData({
                dsType: true
            });
        }
        // 判断是否是筛选页，筛选页不需要展示定位信息
        if (this.params.isFilter) {
            this.filterFlag = true;
            delete this.params.isFilter
        }
        this.init(true);
    },
    /**
     * 页面初始化
     * @return null
     */
    init: function (isReady) {
        // 城市参数 默认为传参值，其次定位值，默认北京
        this.params.cityname = this.params.cityname || app.userPosition.shortCity || '北京';
        //快筛数据
        let filterInfo = new Promise((resolve, reject) => {
            wx.request({
                url: vars.interfaceSite + 'esfFilterList',
                data: this.params,
                complete: res => {
                    if (res.data) {
                        // 格式化快筛数据
                        let resData = this.initFilter(res.data);
                        // 记录搜索关键字
                        resData.keyword = this.params.keyword || '';
                        resolve(resData);
                    } else {
                        reject();
                    }
                }
            });
        });
         // 获取搜索历史记录
            new Promise((resolve, reject) => {
                let historyTag = 'esfHistory';
                wx.getStorage({
                    key: historyTag,
                    complete: res => {
                        // 格式化历史记录
                        let history = (res.data || []).map(value => ({raw: value, name: value.split(',')[0]}));
                        resolve({
                            // 搜索历史记录
                            history: history,
                            // 首页判断，多个搜索复用通用代码，用于区别
                            isIndex: true,
                            // 搜索input值
                            value: '',
                            // 当前城市
                            cityname: this.params.cityname,
                            placeholder: '输入区县、商圈、小区名',
                            // localstorage存储key
                            historyTag: historyTag,
                            // 搜索输入展示标志位
                            // 1:history show;2:autoprompt show;3: autopromt nodata;0:hide;
                            showHistory: history.length ? 1 : 0,
                            // 搜索结果跳转地址
                            url: '/pages/esf/index/index'
                        });
                    }
                });
            }).then(resData => {
                this.setData({
                    // 搜索数据
                    searchInfo: resData,
                    keyword:this.params.keyword
                });
            });
        // 二手房列表数据
        let listInfo = new Promise((resolve, reject) => {
            wx.request({
                url: vars.interfaceSite + 'esfIndexList',
                data: this.params,
                complete: res => {
                    let resData = res.data;
                    if (resData) {
                        let pageInfo = res.data || {};
                        let listDs = pageInfo.dsList;
                        if (listDs && listDs.countinfo.allcount > 0) {
                            listDs.houseinfo = this.initDsListInfo(listDs.houseinfo);
                        } else {
                            delete pageInfo.dsList;
                        }
                        if (listDs && listDs.countinfo.allcount > 0 || pageInfo.fdsList && pageInfo.fdsList.countinfo.allcount > 0){
                            this.listReady = true;
                        } else {
                            this.listReady = false;
                        }
                        Object.assign(pageInfo, resData);
                        resolve(pageInfo);
                    } else {
                        reject();
                    }
                }
            });
        });
        Promise.all([filterInfo,listInfo]).then(res => {
            let pageInfo = res[1];
            pageInfo.filterInfo = res[0];
            this.setData({
                pageInfo:pageInfo
            });
            this.setData({
                // 当前城市
                cityname: this.params.cityname,
                hasFilter: this.hasFilter,
                listReady: this.listReady,
                dataLoad: true
            });
            isReady && !this.filterFlag;
        });
    },
    /**
     * 执行搜索方法
     * @param  {[string]} name [搜索关键字]
     * @return null
     */
    search: function (name) {
        // 跳转参数
        let params = {
            keyword: name.split(',')[0],
            cityname: this.params.cityname
        };
        // 生成跳转地址
        let url = '/pages/esf/index/index?' + queryStringify(params);
        wx.navigateTo({url: url});
    },
    /**
     * 加载更多
     * @return null
     */
    loadmore: function () {
         let pageInfo = this.data.pageInfo;
         let total;
         let list;
         // 正在加载中不执行加载
         if (!pageInfo.loading) {
             // 计算当前需要加载的页码
             pageInfo.page = (pageInfo.page || 1) + 1;
             // 区分自营和普通列表
             if (this.params.type && this.params.type ==1) {
                 total = pageInfo.dsList.countinfo.allcount;
                 // 已加载列表
                 list = pageInfo.dsList.houseinfo;
             } else {
                 total = pageInfo.fdsList.countinfo.allcount;
                 list = pageInfo.fdsList.houseinfo;
             }
             // 已加载数量
             let loadedNum = list.length;
             // 如果还有未加载数据，执行加载
             if (loadedNum < total) {
                 // 展示加载中动画
                 this.setData({
                    'pageInfo.loading': true
                 });
                 let data = Object.assign({
                    page: pageInfo.page,
                    htmlType:1
                 }, this.params);
                 wx.request({
                    url: vars.interfaceSite + 'esfIndexList',
                    data: data,
                     complete: res => {
                         let resData = res.data;
                         // 加载完成把新加载数据置入已加载列表
                         if (resData.fdsList && resData.fdsList.houseinfo && resData.fdsList.houseinfo.length) {
                            pageInfo.fdsList.houseinfo = pageInfo.fdsList.houseinfo.concat(resData.fdsList.houseinfo);
                         } else if(resData.dsList && resData.dsList.houseinfo && resData.dsList.houseinfo.length) {
                             pageInfo.dsList.houseinfo = pageInfo.dsList.houseinfo.concat(resData.dsList.houseinfo);
                         }
                         // 取消加载中动画，更新已加载列表
                         this.setData({
                            'pageInfo.loading': false,
                            'pageInfo': pageInfo

                         })
                     }
                 });
             }
         }
     },
    /**
     * 快筛
     * @return null
     */
    filter: function () {
        // 快筛数据
        let filterInfo = this.data.pageInfo.filterInfo;
        // 当前筛选菜单（区域，均价，排序）
        let filter = filterInfo.filterArr[filterInfo.activeFilter];
        let params = this.params;
        // 菜单key值(区域=>distrct,均价=>price 排序=>ordertype 户型=> roomtype)
        let type = filter.key;
        // 一级筛选列
        let firstFilter = filter.data[filterInfo.firstFilter];
        if (type === 'roomtype' || type === 'ordertype') {
            params[type] = firstFilter.id;
        } else {
            // 生成query
            params[type] = firstFilter.name.replace('万', '');
            // 如果含有二级菜单,生成二级菜单query(区域)
            if (filter.hasSub) {
                if (firstFilter.sub) {
                    let key = firstFilter.sub.key;
                    let value = firstFilter.sub.data[filterInfo.secfilter].name;
                    params[key] = value;
                } else {
                    delete params[filter.data[1].sub.key];
                }

            }
        }
        // 隐藏筛选菜单
        this.setData({
            'pageInfo.filterInfo.isFilter': false
        });
        // 筛选跳转标志位，用于首页判断是否显示定位信息
        params.isFilter = true;
        wx[this.filterFlag ? 'redirectTo' : 'navigateTo']({
            url: filterInfo.url + '?' + queryStringify(params)
        });

    },
    /**
     * 自定义筛选（均价）
     * @return null
     */
    customSubmit: function () {
        let filterInfo = this.data.pageInfo.filterInfo;
        let filter = filterInfo.filterArr[filterInfo.activeFilter];
        let params = this.params;
        // 最小值
        let min = +filter.custom.min;
        // 最大值
        let max = +filter.custom.max;
        if (min && max) {
            // 最小值，最大值都存在 min-max
            params.price = min + '-' + max;
        } else if (min) {
            // 最小值存在 min以上
            params.price = min + '以上';
        } else if (max) {
            // 最大值存在 max一下
            params.price = max + '以下';
        } else {
            // 都不存在不传
            delete params.price
        }
        // 隐藏筛选菜单
        this.setData({
            'pageInfo.filterInfo.isFilter': false
        });
        // 筛选跳转标志位，用于首页判断是否显示定位信息
        params.isFilter = true;
        wx[this.filterFlag ? 'redirectTo' : 'navigateTo']({
            url: filterInfo.url + '?' + queryStringify(params)
        });
    },
    /**
     * 初始化筛选数据
     * @param  {[object]} filter 筛选原始数据
     * @return {[object]}  格式化筛选数据
     */
    initFilter: function (filter) {
        let params = this.params;
        // 均价
        let priceArr = filter.price;
        // 排序
        let orderArr = filter.ordertype;
        // 户型
        let roomtype = filter.roomtype;
        let filterArr = [];
        let order=[];
        let price = [];
        let room = [];
        for (let i in orderArr) {
            if (orderArr[i]) {
                order.push({id:i,name:orderArr[i]});
            }
        }
        for (let j in priceArr) {
            if (priceArr[j]) {
                price.push({id:priceArr[j].name,name:priceArr[j].name});
            }
        }
        // 格式化户型数组
        roomtype.forEach((r, index) => {
            room.push({id: index, name: r});
        });
        if (!this.onSale) {
            // 区域
            let district = filter.district;
            // 商圈（区域二级菜单）
            let comarea = filter.comarea;
            // 将区域与二级菜单商圈关联
            district.forEach((dist, index) => {
                // 区域第一条记录是不限，没有二级菜单
                if (index) {
                    if (dist.name === params.district) {
                        this.firstFilter = index;
                    }
                    dist.sub = {
                        // 菜单key
                        key: 'comarea',
                        // 数据
                        data: comarea[index - 1],
                        // 当前选中筛选项
                        active: '',
                        // 原先选中筛选项
                        activeBak: params.comarea
                    }
                }
                ;
            });
            filterArr.push({
                // 区域特殊标志位，用于展示
                flag: true,
                // 是否使用默认选中项
                hasParams: true,
                // 默认选中项
                params: [params.district, params.comarea],
                // 菜单名
                name: '区域',
                // 菜单关键字，用于生成跳转query
                key: 'district',
                // 菜单项数据
                data: district,
                // 是否含有二级菜单
                hasSub: true,
                // 当前选中
                active: '',
                // 之前选中
                activeBak: params.district
            });
        }
        let priceParam = (params.price || '').replace(/([\d-]+)/, '$1万') || '';
        filterArr.push({
            hasParams: true,
            params: [priceParam],
            name: '总价',
            key: 'price',
            data: price,
            needCustom: true,
            hasSub: false,
            active: '',
            activeBak: priceParam,
            custom: {}
        });
        filterArr.push({
            hasParams: true,
            params: [roomtype[params.roomtype]],
            name: '户型',
            key: 'roomtype',
            data: room,
            hasSub: false,
            active: '',
            activeBak: params.roomtype || ''
        });
        filterArr.push({
            hasParams: true,
            params: [orderArr[params.ordertype]],
            name: '排序',
            key: 'ordertype',
            data: order,
            hasSub: false,
            active: '',
            activeBak: params.ordertype || ''
        });
        let filterInfo = {
            // 筛选跳转地址
            url: '/pages/esf/index/index',
            // 筛选数据
            filterArr: filterArr,
            // 是否展示筛选页
            isFilter: false,
            // 筛选频道
            filterChannel:'esf',
            onSale:this.onSale
        };
        return filterInfo;
    },
    /**
     * 二手房列表页跳转json
     * @param  {[object]} e 点击事件
     * @return null
     */
    listNavigator: function (e) {
        let curObj = e.currentTarget.dataset;
        this.navigatorUrl =  (curObj.type && curObj.type == 1 ? '/pages/esf/index/index':curObj.housetype ==="DS"?'/pages/esf/detail/dsdetail':'/pages/esf/detail/detail') + '?';
        let navUrl,detailParam;
        if (curObj.type && curObj.type == 1){
            this.params.type = 1;
            navUrl = this.navigatorUrl+ queryStringify(this.params);
        }else{
            detailParam = {
                cityname: this.params.cityname,
                housetype: curObj.housetype || '',
                houseid: curObj.houseid,
                x: curObj.x,
                y: curObj
            };
            navUrl = this.navigatorUrl + queryStringify(detailParam);
        }
        wx.navigateTo({
            url:navUrl
        });
    },
    /**
     * 格式化电商房源展示数据
     */
    initDsListInfo: function (dsList) {
        for(let index in dsList){
            let list = dsList[index];
            list.title = list.title || (list.district + ';' + list.comarea + ';' + list.projname);
        }        
        return dsList;
    }
};

// 合并模块方法
Object.assign(page, filter, search, common,share);
// 渲染页面
Page(page);
