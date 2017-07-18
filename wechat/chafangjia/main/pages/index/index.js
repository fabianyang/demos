// index.js
/**
 * @file 查房价首页
 * @author icy
 */
const app = getApp();
const Promise = require('../../utils/promise.js').Promise;
// 快筛功能模块
const filter = require('../../utils/filter.js');
// 基础方法模块
const utils = require('../../utils/utils.js');
// 搜索功能模块
const search = require('../../utils/search.js');
// 通用方法模块
const common = require('../../utils/common.js');
// 分享
const share = require('../../utils/share.js');
// object序列化为请求参数串
let queryStringify = utils.queryStringify;
// 通用数据
let vars = app.vars;
let imgReg = /http:|https:/;
let allowCheck = null;
// 屏蔽双击问题
let clicked = false;
// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);
let page = {
    // 设置分享信息
    shareInfoFn: function () {
        return { desc: '轻松评估房价走势', title: '房天下查房价' };
    },
    data: {
        // 判断定位数据是否完毕
        positionReady: app.positionReady,
        // 当前页显示数据是否加载完毕
        dataLoad: false,
        // 当前城市
        cityInfo: {},
        // 首次加载标识
        firstLoad: true,
        // 查成交
        cjInfo: {
            cityInfo: {},
            esf: {
                ListInfo: {}
            },
            esfInfo: {
                left: {},
                right: {}
            },
            xf: {},
            xfInfo: {
                left: {},
                right: {}
            }
        },
        // 搜索数据
        searchInfo: {},
        hasFilter: false
    },
    //第一次加载
    firstLoad: true,
    onShow: function () {
        console.log('back');
        if (!this.data.firstLoad) {
            this.paramsBak && (this.params = utils.deepCopy(this.paramsBak));
            // 处理网络信息
            this.getNetwork();
            // 页面返回更新数据
            // 如果有this.params.cityname 代表分享过来的页面 首次进来需要加载分享的城市数据
            if (this.params.cityname) {
                this.cityname = this.params.cityname;
                // 赋值完成后需要删除 这个参数,否则影响城市选择
                delete this.params.cityname;
            } else if (vars.currentCity !== this.cityname) {
                this.cityname = vars.currentCity;
                // 选择城市后清空筛选条件
                this.params.district && delete this.params.district;
                this.params.comarea && delete this.params.comarea;
                this.params.price && delete this.params.price;
                this.params.orderid && delete this.params.orderid;
            }
        }

        // 判断来自哪个页面 来自城市选择页面 回到顶部
        if (vars.cityPage) {
            this.setData({
                scrollTop: 0
            });
            vars.cityPage = false;
            this.init(app.positionReady);
        } else {
            this.data.firstLoad = false;
        }
    },
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
            'view': true
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
        // 处理网络信息
        this.getNetwork();
        try {
            let currentCity = wx.getStorageSync('currentCity');
            // 如果有this.params.cityname 代表分享过来的页面 首次进来需要加载分享的城市数据
            if (this.params.cityname) {
                this.cityname = this.params.cityname;
                // 赋值完成后需要删除 这个参数,否则影响城市选择
                delete this.params.cityname;
            } else if (currentCity) {
                this.cityname = currentCity;
            } else {
                this.cityname = app.userPosition.shortCity || '北京';
            }
        } catch (e) {
            this.cityname = this.params.cityname || app.userPosition.shortCity || '北京';
        }
        vars.currentCity = this.cityname;
        this.init(app.positionReady);
        if (app.positionReady) {
            // 标识初始化的时候已经定位完成
            this.initPosition = true;
            !this.filterFlag && !this.citySelectFlag && (vars.positionType === 'xy') && this.firstLoad && this.showPositionTip();
        }
        // 获取定位信息
        let location = this.getLocation();
        location.then(() => {
            if (vars.cityInfo) {
                vars.cityInfo.positionCity = app.userPosition.shortCity;
            }
            // 判断初始化的时候若没有完成定位，则再次请求
            if (!this.initPosition) {
                this.init(true);
                !this.filterFlag && !this.citySelectFlag && (vars.positionType === 'xy') && this.firstLoad && this.showPositionTip();
            }
        }).catch(() => {
            console.warn('最终定位失败~~');
        });
        // 备份条件：确保跳转到详情后再返回过滤条件一致。
        this.paramsBak = utils.deepCopy(this.params);
    },
    /**
     * 处理网络状态
     */
    getNetwork: function () {
        // 获取网络信息
        wx.getNetworkType({
            success: res => {
                // 返回网络类型2g，3g，4g，wifi, none, unknown
                let networkType = res.networkType;
                if (networkType === 'none' || networkType === 'unknown') {
                    this.setData({
                        'showNetwork': true
                    });
                    setTimeout(() => {
                        this.setData({
                            'showNetwork': false
                        });
                    }, 2000);
                }
                console.log('网络状态--', networkType);
            }
        });
    },
    /**
     * 页面初始化
     * @return null
     */
    init: function (isReady) {
        this.setData({
            cityname: this.cityname
        });
        if (app.userPosition.location) {
            this.x = app.userPosition.location.bdlng || '';
            this.y = app.userPosition.location.bdlat || '';
        }
        let sameCity = this.cityname === app.userPosition.shortCity;
        // 获取首页基础数据
        let pageInfoTask = new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSiteJava + 'getHouseDealApi',
                data: {
                    city: encodeURIComponent(this.cityname)
                },
                complete: res => {
                    if (~~res.statusCode === 200) {
                        let resData = res.data || {};
                        // 判断小区记录数量
                        if (resData) {
                            // 记录搜索关键字
                            resData.keyword = this.params.keyword || '';
                            this.setData({
                                cjInfo: resData
                            });
                            resolve(resData);
                        } else {
                            reject();
                        }
                    } else {
                        reject();
                    }
                }
            });
        });

        // 或许搜索历史记录
        let searchInfoTask = new Promise((resolve, reject) => {
            let historyTag = 'cfjHistory';
            wx.getStorage({
                key: historyTag,
                complete: res => {
                    // 格式化历史记录
                    let history = (res.data || []).map(value => ({ raw: value, name: value.split(',')[0] }));
                    resolve({
                        // 搜索历史记录
                        history: history,
                        // 首页判断，多个搜索复用通用代码，用于区别
                        isIndex: true,
                        // 搜索input值
                        value: '',
                        // 当前城市
                        cityname: this.cityname,
                        placeholder: '输入区县、商圈、小区名',
                        // localstorage存储key
                        historyTag: historyTag,
                        // 搜索输入展示标志位
                        // 1:history show;2:autoprompt show;3: autopromt nodata;0:hide;
                        showHistory: history.length ? 1 : 0,
                        // 搜索结果跳转地址
                        url: '/pages/index/index'
                    });
                }
            });
        });
        Promise.all([pageInfoTask, searchInfoTask]).then(res => {
            this.setData({
                // 当前城市
                cityname: this.cityname,
                // 数据初始化完毕flag
                dataLoad: true,
                // 搜索数据
                searchInfo: res[1],
                hasFilter: this.hasFilter
            });
            this.setData({
                // 城市定位数据完成flag
                positionReady: true,
            });
        }).then(() => {
            // 小区列表数据
            let listTask = new Promise((resolve, reject) => {
                this.paramsQuery = Object.assign({ cityname: this.cityname }, this.params);
                if (isReady && sameCity && !this.filterFlag && !this.params.keyword) {
                    let location = app.userPosition.location;
                    this.paramsQuery.lng = location.lng;
                    this.paramsQuery.lat = location.lat;
                    this.paramsQuery.distance = 2;
                }
                utils.request({
                    url: vars.interfaceSite + 'getXiaoquList',
                    data: this.paramsQuery,
                    complete: res => {
                        let resData = res.data;
                        // 判断小区记录数量
                        if (resData.filter) {
                            // 格式化快筛数据
                            resData.filterInfo = this.initFilter(resData.filter);
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

        // 城市缓存localstorage
        try {
            wx.setStorageSync('currentCity', this.cityname);
        } catch (e) {
            vars.currentCity = this.cityname;
        }
    },
    /**
     * 定位信息提示
     * @return null
     */
    showPositionTip: function () {
        let cityNow = this.cityname;
        let userPosition = app.userPosition;
        let positionCity = userPosition.shortCity;
        let inCityList = userPosition.inCityList;
        if (this.params.customCity) {
            return;
        }
        if (cityNow === positionCity && app.fakeLocationSuc) {
            this.setData({
                // 展示定位失败标志位
                showFailLocation: true
            });
            setTimeout(() => {
                this.setData({
                    // 展示定位失败标志位
                    showFailLocation: false
                });
            }, 2000);
            // }
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
                }, 2000);
                // 判断是否为手动选择的城市
            } else if (inCityList) {
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
        // 上一个搜索关键字，判断当前页是首页还是搜索结果页
        let keyword = this.params.keyword;
        // 跳转参数
        let params = {
            keyword: name.split(',')[0],
            cityname: this.cityname
        };
        // 生成跳转地址
        let url = this.data.searchInfo.url + '?' + queryStringify(params);
        let func;
        if (keyword && name) {
            // 原先是搜索结果页，现在是搜索结果页，用不带返回的跳转
            this.oneListJumpDetail(() => wx.redirectTo({ url: url }), params);

        } else if (keyword) {
            // 原先搜索结果页，现在回到首页，用返回上一页
            wx.navigateBack()
        } else if (name) {
            // 原先首页，现在搜索结果页，用带返回的跳转
            this.oneListJumpDetail(() => wx.navigateTo({ url: url }), params);
        } else {
            // 原先首页，现在首页，用不带跳转的返回
            wx.redirectTo({ url: url });
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
        this.oneListJumpDetail(() => wx[this.filterFlag ? 'redirectTo' : 'navigateTo']({
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
        this.oneListJumpDetail(() => wx[this.filterFlag ? 'redirectTo' : 'navigateTo']({
            url: filterInfo.url + '?' + queryStringify(params)
        }));
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
            url: '/pages/index/index',
            // 筛选数据
            filterArr: filterArr,
            // 是否展示筛选页
            isFilter: false
        };
        return filterInfo;
    },
    /**
     * 小区列表数据点击跳转详情页handle
     * @param  {[object]} e 点击事件
     * @return null
     */
    listNavigator: function (e) {
        // 尘归尘，土归土
        let dataset = e.currentTarget.dataset, url = '/pages/xiaoquDetail/xiaoquDetail?' + queryStringify({
            cityname: this.cityname,
            xqid: dataset.projcode,
            title: dataset.name
        });
        // 二手房、新房参数
        let tempParam = queryStringify({
            cityname: this.cityname,
            houseid: dataset.projcode,
            title: dataset.name,
            housetype: dataset.esfHouseType || ''
        });

        // 二手房分电商和普通
        let esfHouseUrl = (dataset.esfHouseType === 'DS' ? '/pages/esf/detail/dsdetail' : '/pages/esf/detail/detail') + '?';
        switch (dataset.type) {
            // 新房
            case 'xf':
                url = '/pages/xf/detail/detail?' + tempParam;
                break;
            // 二手房
            case 'esf':
                url = esfHouseUrl + tempParam;
                break;
            default:
        }
        wx.navigateTo({
            url: url
        });
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
                        url: '/pages/xiaoquDetail/xiaoquDetail?' + queryStringify({
                            cityname: this.cityname,
                            xqid: resData.list[0].projcode,
                            title: resData.list[0].projname
                        })
                    });
                } else {
                    cb();
                }
            }
        });
    },
    /**
 * 获取定位信息
 * @returns {*}
 */
    getLocation: function () {
        return app.locationPromise.then(() => {
            return new Promise((resolve, reject) => {
                if (app.positionReady) {
                    console.warn('定位成功');
                    resolve();
                } else {
                    reject();
                }
            });
        }).catch(() => {
            return new Promise((resolve, reject) => {
                console.warn('定位失败,重新定位开始');
                app.getLocation(userPosition => {
                    resolve();
                }, userPosition => {
                    reject();
                })
            });
        });
    }
};
// 合并模块方法
utils.assign(page, filter, search, common, share);
// 渲染页面
Page(page);
