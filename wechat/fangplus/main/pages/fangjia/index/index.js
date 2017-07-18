// index.js
/**
 * @file 查房价首页
 * @author icy
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
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let vars = app.vars;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
let page = {
    // 设置分享信息
    onShareAppMessage: function () {
        return {
            title: this.params.cityname + '查房价',
            desc: '轻松评估房价走势',
            path: utils.getCurrentPage().path
        }
    },
    data: {
        // 判断定位数据是否完毕
        positionReady: app.positionReady,
        // 当前城市
        cityname: '北京',
        // 数据初始化完毕flag
        dataLoad: true,
        // 首次加载标识
        firstLoad: true,
        // 初始化页面数据
        fjPageInfo: {
            xfInfo: {
                left: {},
                right: {}
            },
            esfInfo: {
                left: {},
                right: {}
            },
        },
        // 搜索数据
        searchInfo: {},
        hasFilter: false
    },
    //第一次加载
    firstLoad: true,
    /**
     * [page 加载回调]
     * @param  {[object]} params [query]
     * @return null
     */
    onLoad: function (params) {
        // 更新标题
        wx.setNavigationBarTitle({
            title: (params.cityname || '北京') + '查房价'
        });
        this.setData({
            'view': true,
        });
        app.now2 = Date.now();
        console.log(app.now2 - app.now);
        // 设置loading
        // this.loadingToast();
        this.params = params || {};
        // console.log(this.params);
        // 判断是否有筛选
        if (this.params.district || this.params.price || this.params.orderid) {
            this.hasFilter = true;
        }
        // 判断是否是筛选页，筛选页不需要展示定位信息
        if (this.params.isFilter) {
            this.filterFlag = true;
            delete this.params.isFilter
        }
        this.init(true);
        // 备份条件：确保跳转到详情后再返回过滤条件一致。
        this.paramsBak = utils.deepCopy(this.params);
    },
    onShow: function () {
        if (!this.data.firstLoad) {
            this.paramsBak && (this.params = utils.deepCopy(this.paramsBak));
            // 页面返回更新数据
            // this.init(true);
            this.getSearchHistory().then(res => {
                this.setData({
                    searchInfo: res
                });
            });
        } else {
            this.data.firstLoad = false;
        }
    },
    /**
     * 页面初始化
     * @return null
     */
    init: function (isReady) {
        // 城市参数 默认为传参值，其次定位值，默认北京
        this.params.cityname = this.params.cityname || app.userPosition.shortCity || '北京';
        let sameCity = this.params.cityname === app.userPosition.shortCity;
        // 获取首页基础数据
        // let pageInfoTask = new Promise((resolve, reject) => {
        //     utils.request({
        //         url: vars.interfaceSite + 'getHouseDealApi',
        //         data: this.params,
        //         complete: res => {
        //             let resData = res.data;
        //             // console.log(resData);
        //             // 判断小区记录数量
        //             if (resData.cityInfo) {
        //                 // 格式化查房价新房数据
        //                 resData.xfInfo = this.initxfInfo(resData.xf || {});
        //                 // 格式化查房价二手房数据
        //                 resData.esfInfo = this.initesfInfo(resData.esf && resData.esf.ListInfo || {});
        //                 // // 格式化快筛数据
        //                 // resData.filterInfo = this.initFilter(resData.filter);
        //                 // 记录搜索关键字
        //                 resData.keyword = this.params.keyword;
        //                 resolve(resData);
        //             } else {
        //                 reject();
        //             }
        //         }
        //     });
        // });
        // 小区列表数据
        let filterTask = new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSite + 'getXiaoquFilter',
                data: { cityname: this.params.cityname },
                complete: res => {
                    let resData = res.data,
                        tempObj = {};
                    // 判断小区记录数量
                    if (typeof resData === 'object') {
                        // 格式化快筛数据
                        tempObj.filterInfo = this.initFilter(resData);
                        tempObj.filter = resData;
                        let pageInfo = this.data.pageInfo || {};
                        Object.assign(pageInfo, tempObj);
                        this.setData({
                            // 当前城市
                            cityname: this.params.cityname,
                            // 数据初始化完毕flag
                            dataLoad: true,
                            pageInfo: pageInfo,
                            keyword: this.params.keyword,
                            hasFilter: this.hasFilter,
                            positionReady: true
                        });
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
        filterTask.then(this.getSearchHistory).then(res => {
            this.setData({
                // 搜索数据
                searchInfo: res
            });
        }).then(() => {
            // 小区列表数据
            let listTask = new Promise((resolve, reject) => {
                this.paramsQuery = Object.assign({}, this.params);
                if (isReady && !this.filterFlag && !this.params.keyword && this.params.x && this.params.y) {
                    this.paramsQuery.lng = this.params.x;
                    this.paramsQuery.lat = this.params.y;
                    this.paramsQuery.distance = 2;
                }
                utils.request({
                    // getXiaoquList=>getAllXqList
                    url: vars.interfaceSite + 'getAllXqList',
                    data: this.paramsQuery,
                    complete: res => {
                        let resData = res.data;
                        // 判断小区记录数量
                        if (typeof resData === 'object') {
                            let pageInfo = this.data.pageInfo || {};
                            Object.assign(pageInfo, resData);
                            resolve(pageInfo);
                        } else {
                            reject();
                        }
                    }
                });
            });
            return listTask;
        }).then(pageInfo => {
            this.firstLoad && this.setData({
                pageInfo: pageInfo
            });
            this.setData({
                listReady: true
            })
        });
    },
    getSearchHistory: function () {
        return new Promise((resolve, reject) => {
            let historyTag = 'cfjHistory-' + this.params.cityname;
            wx.getStorage({
                key: historyTag,
                complete: res => {
                    // 格式化历史记录
                    let history = (res.data || []).map(value => ({ raw: value, name: value.split(',')[0], suffix: value.split(',')[2] }));
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
                        url: '/pages/fangjia/index/index'
                    });
                }
            });
        });
    },
    /**
     * 定位信息提示
     * @return null
     */
    showPositionTip: function () {
        let cityNow = this.params.cityname;
        let userPosition = app.userPosition;
        let positionCity = userPosition.shortCity;
        if (app.fakeLocationSuc) {

            this.setData({
                // 展示当前地址标志位
                showFailLocation: true
            });
            setTimeout(() => {
                this.setData({
                    // 展示当前地址标志位
                    showFailLocation: false
                });
            }, 3000)
        } else {
            // 当前城市与定位城市相同，显示定位位置，3s后隐藏
            if (cityNow === positionCity) {
                this.setData({
                    // 展示当前地址标志位
                    showCurrentLocation: true,
                    // 当前地址
                    location: userPosition.addr
                });
                setTimeout(() => {
                    this.setData({
                        // 展示当前地址标志位
                        showCurrentLocation: false
                    });
                }, 3000)
            } else {
                // 定位城市与当前城市不同，显示定位城市，提示是否切换
                this.setData({
                    // 展示当前定位城市标志位
                    showChangeLocation: true,
                    // 当前定位城市
                    locationCity: positionCity
                });
            }
        }

    },
    /**
     * 是否切换切换城市点击handle
     * @param  {[object]} e [description]
     * @return null
     */
    changeCity: function (e) {
        // 是否切换flag
        let ifChange = e.currentTarget.dataset.change;
        let params = {
            cityname: app.userPosition.shortCity
        }
        if (ifChange) {
            // 跳转定位城市
            wx.redirectTo({
                url: this.data.searchInfo.url + '?' + queryStringify(params)
            })
        } else {
            // 隐藏切换城市提示框
            this.setData({
                showChangeLocation: false
            })
        }
    },
    /**
     * 执行搜索方法
     * @param  {[string]} name [搜索关键字]
     * @return null
     */
    search: function (name) {
        let nameArr = name.split(',');
        // 搜索提示列表和搜索历史点击，判断
        if (/新房/.test(nameArr[2])) {
            let url = '/pages/xf/detail/detail?' + queryStringify({
                cityname: this.params.cityname,
                houseid: nameArr[1],
                title: nameArr[0]
            });
            wx.navigateTo({ url: url });
        } else {
            // 上一个搜索关键字，判断当前页是首页还是搜索结果页
            let keyword = this.params.keyword;
            // 跳转参数
            let params = {
                keyword: name.split(',')[0],
                cityname: this.params.cityname
            };
            // 生成跳转地址
            let url = this.data.searchInfo.url + '?' + queryStringify(params);
            let func;
            this.oneListJumpDetail(() => wx.redirectTo({ url: url }), params);

            // if (keyword && name) {
            //  // 原先是搜索结果页，现在是搜索结果页，用不带返回的跳转
            //  this.oneListJumpDetail(() => wx.redirectTo({url: url}), params);

            // } else if (keyword) {
            //  // 原先搜索结果页，现在回到首页，用返回上一页
            //  wx.navigateBack()
            // } else if (name) {
            //  // 原先首页，现在搜索结果页，用带返回的跳转
            //  this.oneListJumpDetail(() => wx.navigateTo({url: url}), params);
            // } else {
            //  // 原先首页，现在首页，用不带跳转的返回
            //  wx.redirectTo({url: url});
            // }
        }
    },
    /**
     * 小区列表加载更多
     * @return null
     */
    loadmore: function () {
        let pageInfo = this.data.pageInfo;
        // 正在加载中不执行加载
        if (!pageInfo.loading) {
            // 计算当前需要加载的页码
            pageInfo.page = (pageInfo.page || 1) + 1;
            // 数据总数量
            let total = pageInfo.xqallcount;
            // 已加载列表
            let list = pageInfo.list;
            // 已加载数量
            let loadedNum = list.length;
            // 如果还有未加载数据，执行加载
            if (loadedNum < total) {
                // 展示加载中动画
                this.setData({
                    'pageInfo.loading': true
                });
                let data = Object.assign({
                    page: pageInfo.page
                }, this.paramsQuery);
                utils.request({
                    url: vars.interfaceSite + 'getAllXqList',
                    data: data,
                    complete: res => {
                        let resData = res.data;
                        // 加载完成把新加载数据置入已加载列表
                        if (resData.list && resData.list.length) {
                            pageInfo.list = pageInfo.list.concat(resData.list);
                        }
                        // 取消加载中动画，更新已加载列表
                        this.setData({
                            'pageInfo.loading': false,
                            'pageInfo.list': pageInfo.list
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
        // 菜单key值(区域=>distrct,均价=>price 排序=>order)
        let type = filter.key;
        // 一级筛选列
        let firstFilter = filter.data[filterInfo.firstFilter];
        if (type === 'order') {
            // 排序query生成
            params.orderid = firstFilter.id;
            params.orderName = firstFilter.name;
        } else {
            // 生成query
            params[type] = firstFilter.name.replace('元', '');
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
        // console.log(this.filterFlag);
        this.oneListJumpDetail(() => wx.redirectTo({
            url: filterInfo.url + '?' + queryStringify(params)
        }));

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
        if (min && max && min > max) {
            let timer = null;
            this.setData({
                errorInput: true
            });
            setTimeout(() => {
                this.setData({
                    errorInput: false
                });
            }, 1000);
            return;
        }
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
        this.oneListJumpDetail(() => wx.redirectTo({
            url: filterInfo.url + '?' + queryStringify(params)
        }));
    },
    /**
     * 格式化新房查房价数据
     * @param  {[object]} xf xf查房价原始数据
     * @return {[object]}    xf查房价格式化
     */
    initxfInfo: function (xf) {
        let xfInfo = {};
        if (xf) {
            console.log(xf);
            if (+xf.d_maketao) {
                // 昨日成交套数存在
                let scale = parseFloat(xf.d_scale);
                xfInfo.left = {
                    // 数据类型（1=>昨天,2=>上周，3=>上月）
                    type: 1,
                    // 成交套数
                    maketao: xf.d_maketao,
                    // 环比
                    scale: Math.abs(scale) + '%',
                    // 环比符号
                    scaleFlag: scale ? (scale < 0 ? 'jt-dn' : 'jt-up') : '',
                    // 数据时间
                    dateName: '昨日',
                    // 数据时间格式化，用于弹层内容
                    date: '昨日：' + xf.yesterday
                };
            } else if (+xf.w_maketao) {
                // 上周成交套数存在
                xfInfo.left = {
                    type: 2,
                    maketao: xf.w_maketao,
                    scale: xf.w_scale,
                    scaleFlag: xf.w_scaleFlag,
                    dateName: '第' + xf.this_week + '周',
                    date: '第' + xf.this_week + '周：' + xf.last_week
                };
            } else if (+xf.m_maketao) {
                // 上月成交套数存在
                xfInfo.left = {
                    type: 3,
                    maketao: xf.m_maketao,
                    scale: xf.m_scale,
                    scaleFlag: xf.m_scaleFlag,
                    dateName: xf.datamonth + '月',
                    date: ''
                };
            }
            if (+xf.d_makeprice) {
                // 昨日成交均价存在
                let scale = parseFloat(xf.d_makeprice_scale);
                xfInfo.right = {
                    type: 1,
                    makeprice: parseInt(xf.d_makeprice, 10),
                    makeprice_scale: Math.abs(scale) + '%',
                    makeprice_scaleFlag: scale ? (scale < 0 ? 'jt-dn' : 'jt-up') : '',
                    dateName: '昨日',
                    date: '昨日：' + xf.yesterday
                };
            } else if (+xf.w_makeprice) {
                // 上周成交均价存在
                let scale = parseFloat(xf.w_makeprice_scale);
                xfInfo.right = {
                    type: 2,
                    makeprice: parseInt(xf.w_makeprice, 10),
                    makeprice_scale: Math.abs(scale) + '%',
                    makeprice_scaleFlag: scale ? (scale < 0 ? 'jt-dn' : 'jt-up') : '',
                    dateName: '第' + xf.this_week + '周',
                    date: '第' + xf.this_week + '周：' + xf.last_week
                };
            } else if (+xf.m_makeprice) {
                // 上月成交均价存在
                xfInfo.right = {
                    type: 3,
                    makeprice: parseInt(xf.m_makeprice, 10),
                    makeprice_scale: xf.m_makeprice_scale,
                    makeprice_scaleFlag: xf.m_makeprice_scaleFlag,
                    dateName: xf.datamonth + '月',
                    date: ''
                };
            }
        }
        return xfInfo;
    },
    /**
     * 格式化二手房查房价数据
     * @param  {[object]} esf esf查房价原始数据
     * @return {[object]}    esf查房价格式化
     * 字段同新房
     */
    initesfInfo: function (esf) {
        let esfInfo = {};
        if (+esf.YesterdaydealAmount) {
            let scale = parseFloat(esf.AmountDayAdd);
            esfInfo.left = {
                type: 1,
                maketao: esf.YesterdaydealAmount,
                scale: Math.abs(scale) + '%',
                scaleFlag: scale ? (scale < 0 ? 'jt-dn' : 'jt-up') : '',
                dateName: '昨日',
                date: '昨日:' + esf.Yesterday
            };
        } else if (+esf.WeekDealAmount) {
            esfInfo.left = {
                type: 2,
                maketao: esf.WeekDealAmount,
                scale: esf.AmountWeekAdd,
                scaleFlag: esf.AmountWeekAddFlag,
                dateName: '第' + esf.Howmanyweeks + '周',
                date: '第' + esf.Howmanyweeks + '周：' + esf.LastWeekTime
            };
        } else if (+esf.MonthDealAmount) {
            esfInfo.left = {
                type: 3,
                maketao: esf.MonthDealAmount,
                scale: esf.AmountMonthAdd,
                scaleFlag: esf.AmountMonthAddFlag,
                dateName: esf.Pricetime + '月',
                date: ''
            };
        }
        esfInfo.right = {
            type: 3,
            makeprice: parseInt(esf.Price, 10),
            makeprice_scale: esf.PriceMonthAdd,
            makeprice_scaleFlag: esf.PriceMonthAddFlag,
            dateName: esf.Pricetime + '月',
            date: '二手房参考均价由房天下大数据根据网站发布房源价格计算得来'

        }
        return esfInfo;
    },
    /**
     * 初始化筛选数据
     * @param  {[object]} filter 筛选原始数据
     * @return {[object]}  格式化筛选数据
     */
    initFilter: function (filter) {
        let params = this.params;
        // 区域
        let district = filter.district;
        // 商圈（区域二级菜单）
        let comarea = filter.comarea;
        // 均价
        let price = filter.price;
        // 排序
        let order = filter.order;
        let filterArr = [];
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
            };
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
        // 原始数据没有id字段，复制name字段，用于渲染页面循环
        price.forEach((name, index) => {
            price[index].id = price[index].name;
        });
        let priceParam = (params.price || '').replace(/([\d-]+)/, '$1元') || '';
        filterArr.push({
            hasParams: true,
            params: [priceParam],
            name: '均价',
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
            params: [params.orderName],
            name: '排序',
            key: 'order',
            data: order,
            hasSub: false,
            active: '',
            activeBak: params.orderid || ''
        });
        let filterInfo = {
            // 筛选跳转地址
            url: '/pages/fangjia/index/index',
            // 筛选数据
            filterArr: filterArr,
            // 是否展示筛选页
            isFilter: false
        };
        return filterInfo;
    },
    // 添加点击间隔
    clickTime: '',
    /**
     * 小区列表数据点击跳转详情页handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    listNavigator: function (e) {
        let clickTime = this.clickTime;
        // 从未点击或者两次点击时间超过一秒允许跳转
        if (!clickTime || (e.timeStamp - clickTime) >= 1000) {
            this.clickTime = e.timeStamp;
            // 尘归尘，土归土
            let dataset = e.currentTarget.dataset,
                url = '/pages/fangjia/xiaoquDetail/xiaoquDetail?' + queryStringify({
                    cityname: this.params.cityname,
                    xqid: dataset.projcode,
                    title: dataset.name
                });
            // 二手房、新房参数
            let tempParam = queryStringify({
                cityname: this.params.cityname,
                houseid: dataset.projcode,
                title: dataset.name
            });
            switch (dataset.type) {
                // 新房
                case 'xf':
                    url = '/pages/xf/detail/detail?' + tempParam;
                    break;
                default:
            }
            wx.navigateTo({
                url: url
            });
        } else if (e.timeStamp - clickTime < 1000) {
            this.clickTime = e.timeStamp;
        }
    },
    /**
     * 查房价数据统计信息点击提示handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    showInfo: function (e) {
        this.setData({
            showCfjInfo: e.currentTarget.dataset.id
        });
    },
    oneListJumpDetail: function (cb, params) {
        let data = Object.assign({ page: 1 },
            params || this.params);
        utils.request({
            url: vars.interfaceSite + 'ajaxGetXqListApi',
            data: data,
            complete: res => {
                let resData = res.data;
                // 加载完成把新加载数据置入已加载列表
                if (resData.list && resData.list.length === 1) {
                    wx.navigateTo({
                        url: '/pages/fangjia/xiaoquDetail/xiaoquDetail?' + queryStringify({
                            cityname: this.params.cityname,
                            xqid: resData.list[0].projcode,
                            title: resData.list[0].projname
                        })
                    });
                } else {
                    cb();
                }
            }
        });
    }
};
// 合并模块方法
Object.assign(page, filter, search, common);
// 渲染页面
Page(page);
