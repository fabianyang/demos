// index.js
/**
 * @file 大首页
 * @author tankunpeng
 */
const app = getApp();
const Promise = require('../../utils/promise.js').Promise;
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
let pageIndex = {
    onShareAppMessage: function () {
        console.log(utils.getCurrentPage().path.split('?')[0] + '?cityname=' + this.cityname);
        return {
            title: '房天下+',
            desc: '房天下覆盖全国600多个城市，提供买新房、买二手房、查房价服务。房天下让买房变得更容易！',
            path: utils.getCurrentPage().path.split('?')[0] + '?cityname=' + this.cityname
        }
    },
    data: {
        // 判断定位数据是否完毕
        positionReady: app.positionReady,
        // 当前页显示数据是否加载完毕
        dataLoad: false,
        cityInfo: {},
        vars: app.vars,
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
        }

    },
    onShow: function () {
        if (!this.data.firstLoad) {
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
            }

            // 判断来自哪个页面 来自城市选择页面 回到顶部
            if (vars.cityPage) {
                this.setData({
                    scrollTop: 0
                });
                vars.cityPage = false;
            }

            this.init();
            // 设置title
            if (vars.needSetTitle) {
                wx.setNavigationBarTitle({
                    title: '房天下+'
                });
            }
            // 更新搜索历史记录
            this.getSearchHistory().then(resData => {
                this.setData({
                    // 搜索数据
                    searchInfo: resData
                });
            });
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
        this.params = params || {};
        console.log('当前页面地址::::' + utils.getCurrentPage().path);
        // 处理网络信息
        this.getNetwork();
        // 设置loading
        // this.loadingToast();
        // 城市参数 默认为传参值，其次定位值，默认北京
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
        if (app.positionReady) {
            // 标识初始化的时候已经定位完成
            this.initPosition = true;
        }
        this.init();
        // 获取定位信息
        let location = this.getLocation();
        location.then(() => {
            if (vars.cityInfo) {
                vars.cityInfo.positionCity = app.userPosition.shortCity;
            }
            // 判断初始化的时候是否已经完成定位
            if (!this.initPosition) {
                this.init(true);
            }
            if (vars.positionType === 'xy') {
                this.showPositionTip();
            }
        }).catch(() => {
            console.warn('最终定位失败~~');
        });
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
                console.log('网络状态--',networkType);
            }
        });
    },
    /**
     * 页面初始化
     */
    init: function (posed) {
        this.setData({
            cityname: this.cityname
        });
        if (app.userPosition.location) {
            this.x = app.userPosition.location.bdlng || '';
            this.y = app.userPosition.location.bdlat || '';
        }
        if (posed && vars.currentCity === this.cityname) {
            // 获取查成交数据
            this.getPrice();
            // 获取新房推荐数据
            this.getTjXf();
            // 获取二手房推荐数据
            this.getTjEsf();
        } else {
            // 获取搜索历史记录
            this.getSearchHistory().then(resData => {
                this.setData({
                    // 搜索数据
                    searchInfo: resData
                });
            });

            // 获取当前城市是否为查房价城市
            this.checkPrice();

            // 预加载城市切换数据
            if (typeof vars.cityInfo === 'object') {
                // 获取城市切换历史信息
                let cityHistoryTask = this.getCityHistory();
                cityHistoryTask.then(res => {
                    utils.assign(vars.cityInfo, res);
                });
            } else {
                // 城市列表
                let cityInfoTask = this.getCityList();
                // 获取城市切换历史信息
                let cityHistoryTask = this.getCityHistory();
                // 城市切换
                Promise.all([cityInfoTask, cityHistoryTask]).then((res) => {
                    let cityInfo = res[0];
                    utils.assign(cityInfo, res[1]);
                    vars.cityInfo = cityInfo;
                });
            }

            // 获取查成交数据
            this.getPrice();
            // 获取新房推荐数据
            this.getTjXf();
            // 获取二手房推荐数据
            this.getTjEsf();

            // 城市缓存localstorage
            try {
                wx.setStorageSync('currentCity', this.cityname);
            } catch (e) {
                vars.currentCity = this.cityname;
            }

        }

    },


    /**
     * 查成交
     */
    getPrice: function () {
        let checkTrading = new Promise((resolve, reject) => {
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
        checkTrading.then((resData) => {
            this.setData({
                cjInfo: resData
            });
        });
    },

    /**
     * 推荐新房
     */
    getTjXf: function () {
        console.log('indexXfTj', this.cityname, app.userPosition.shortCity === this.cityname ? this.x : '', app.userPosition.shortCity === this.cityname ? this.y : '');
        let pageInfoTjXf = new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSiteJava + 'indexXfTj',
                data: {
                    city: encodeURIComponent(this.cityname)
                },
                complete: res => {
                    if (~~res.statusCode === 200) {
                        let resData = res.data || [{}, {}, {}];
                        for (let i = 0, len = resData.length; i < len; i++) {
                            let sigleDataXf = resData[i];
                            sigleDataXf.character = sigleDataXf.character && sigleDataXf.character.split(',');
                            if (sigleDataXf.image) {
                                sigleDataXf.image = imgReg.test(sigleDataXf.image) ? sigleDataXf.image : 'https:' + sigleDataXf.image;
                            } else {
                                sigleDataXf.image = vars.defaultImg;
                            }
                        }
                        resolve(resData);
                    } else {
                        reject();
                    }

                }
            });
        });
        pageInfoTjXf.then((resData) => {
            this.setData({
                xfList: resData,
                vars: app.vars
            });
        });
    },

    /**
     * 推荐二手房
     */
    getTjEsf: function () {
        let pageInfoTjEsf = new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSiteJava + 'indexEsfTj',
                data: {
                    city: encodeURIComponent(this.cityname),
                    x: app.userPosition.shortCity === this.cityname ? this.x : '',
                    y: app.userPosition.shortCity === this.cityname ? this.y : ''
                },
                complete: res => {
                    if (~~res.statusCode === 200) {
                        let resData = res.data || [{}, {}, {}];
                        for (let i = 0, len = resData.length; i < len; i++) {
                            let sigleDataEsf = resData[i];
                            resData[i].tags = resData[i].tags && resData[i].tags.split(',');
                            if (sigleDataEsf.image) {
                                sigleDataEsf.image = imgReg.test(sigleDataEsf.image) ? sigleDataEsf.image : 'https:' + sigleDataEsf.image;
                            } else {
                                sigleDataEsf.image = vars.defaultImg;
                            }
                        }
                        resolve(resData);
                    } else {
                        reject();
                    }
                }
            });
        });
        pageInfoTjEsf.then((resData2)=> {
            this.setData({
                esfList: resData2,
                vars: app.vars
            });
        });
    },

    /**
     * 获取搜索历史
     * @param historyTag
     */
    getSearchHistory: function (historyTag) {
        return new Promise((resolve) => {
            historyTag = historyTag || 'xfHistory-' + this.cityname;
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
                        cityname: this.cityname,
                        placeholder: '输入区县、商圈、小区名',
                        // localstorage存储key
                        historyTag: historyTag,
                        // 搜索输入展示标志位
                        // 1:history show;2:autoprompt show;3: autopromt nodata;0:hide;
                        showHistory: history.length ? 1 : 0,
                        // 搜索结果跳转地址
                        url: '/pages/index/index',
                        searchtype: historyTag.replace(/history.*$/i, '')
                    });
                }
            });
        });
    },

    /**
     * 获取城市列表
     * @returns {*}
     */
    getCityList: function () {
        return new Promise((resolve, reject) => {
            utils.request({
                url: vars.interfaceSiteJava + 'cityList',
                complete: res => {
                    if (~~res.statusCode === 200) {
                        let resData = res.data;
                        if (resData) {
                            // 通用标识串，防止id重复
                            let prefix = 'cityIndex';
                            // 格式化数据
                            let cityes = [];
                            // 处理热门城市
                            resData.hc = resData.hc.replace(/\[|\]| /g, '').split(',');
                            cityes.push({key: prefix, name: '热门城市', cities: resData.hc});
                            delete resData.hc;
                            for (let key in resData) {
                                if (resData.hasOwnProperty(key)) {
                                    resData[key] = resData[key].replace(/\[|\]| /g, '').split(',');
                                    cityes.push({
                                        key: prefix + key,
                                        name: key,
                                        cities: resData[key]
                                    });
                                }
                            }
                            // 城市信息
                            let cityInfo = {
                                // 分类
                                category: cityes,
                                // 当前定位城市
                                positionCity: !app.userPosition.shortCity ? '' : app.userPosition.shortCity
                            };
                            resolve(cityInfo);
                        } else {
                            reject();
                        }
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    /**
     * 获取城市历史记录
     * @returns {*}
     */
    getCityHistory: function () {
        return new Promise((resolve) => {
            let historyTag = 'cityHistory';
            wx.getStorage({
                key: historyTag,
                complete: res => {
                    let history = res.data || [];
                    resolve({
                        history: history,
                        placeholder: '输入城市名称进行搜索',
                        historyTag: historyTag,
                        showHistory: history.length ? 1 : 0
                    });
                }
            });
        });
    },
    /**
     * 获取当前城市是否为查房价城市
     * @param click boolean 是否为click触发
     * @param e 事件对象
     */
    checkPrice: function (click, e) {
        let allow = new Promise((resolve) => {
            utils.request({
                url: vars.interfaceSite + 'isPingguCity',
                data: {
                    cityname: this.cityname
                },
                complete: (res) => {
                    resolve(!!~~res.data);
                }
            });
        });
        allow.then((res) => {
            allowCheck = res;
            // 查成交城市定义
            vars.isBargainCity = allowCheck;
            if (click) {
                this.pdNavigator(e);
            }
        }).catch((e)=> {
            console.log(e);
            this.checkPrice(click, e);
        });
    },
    /**
     * 定位信息提示
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
     *隐藏提示浮层
     */
    hideFloat: function () {
        this.setData({
            showCurrentLocation: false,
            showFailLocation: false,
            showFloat: false,
            showNetwork: false
        });
    },
    /**
     * 是否切换切换城市点击handle
     * @param  e
     * @return null
     */
    changeCity: function (e) {
        // 是否切换flag
        let ifChange = e.currentTarget.dataset.change;
        let params = {
            cityname: app.userPosition.shortCity
        };
        // 跳转定位城市
        if (ifChange && app.userPosition.inCityList) {
            try {
                wx.setStorageSync('currentCity', app.userPosition.shortCity);
                wx.redirectTo({
                    url: '/pages/index/index?' + queryStringify(params)
                });
            } catch (e) {
                wx.removeStorage({
                    key: 'currentCity',
                    success: res => {
                        wx.redirectTo({
                            url: '/pages/index/index?' + queryStringify(params)
                        })
                    }
                });
            }
        }
        // 隐藏切换城市提示框
        this.setData({
            showChangeLocation: false
        });
    },

    /**
     * 频道跳转
     * @param e 事件对象
     */
    pdNavigator: function (e) {
        if (!clicked) {
            clicked = true;
            if (e.currentTarget.dataset.name === 'fangjia') {
                if (allowCheck === null) {
                    this.checkPrice(true, e);
                } else if (allowCheck) {
                    wx.navigateTo({
                        url: '/pages/' + e.currentTarget.dataset.name + '/index/index?' + queryStringify({
                            cityname: this.cityname,
                            x: app.userPosition.shortCity === this.cityname ? this.x : '',
                            y: app.userPosition.shortCity === this.cityname ? this.y : ''
                        })
                    });
                } else {
                    this.setData({
                        showFloat: true
                    });
                    clearTimeout(this.cjTimer);
                    this.cjTimer = setTimeout(() => {
                        this.setData({
                            showFloat: false
                        });
                    }, 2000);
                }
            } else {
                wx.navigateTo({
                    url: '/pages/' + e.currentTarget.dataset.name + '/index/index?' + queryStringify({
                        cityname: this.cityname,
                        x: app.userPosition.shortCity === this.cityname ? this.x : '',
                        y: app.userPosition.shortCity === this.cityname ? this.y : ''
                    })
                });
            }
            setTimeout(() => clicked = false, 1000);
        }

    },

    /**
     * 推荐城市列表跳转
     * @param e
     */
    listNavigator: function (e) {
        if (!clicked) {
            clicked = true;
            let dataset = e.currentTarget.dataset;
            let url = '/pages/' + dataset.name + '/detail/detail';
            let {name, id, title, dsflag, housetype} = dataset;
            if (name === 'esf' && dsflag) {
                url = '/pages/' + dataset.name + '/detail/dsdetail';
            }
            // 兼容无网络状态,给出兼容值 ''
            wx.navigateTo({
                url: url + '?' + queryStringify({
                    cityname: this.cityname,
                    houseid: id || '',
                    housetype: housetype || '',
                    title: title || ''
                })
            });
            setTimeout(() => clicked = false, 1000);
        }

    },

    /**
     * 执行搜索方法
     * @param  {[string]} name [搜索关键字]
     * @param  {[string]} searchtype 搜索类型 xf,esf
     */
    search: function (name, searchtype) {
        // 跳转参数
        let key = name.split(',')[0];
        let params = {
            keyword: key,
            cityname: this.cityname
        };
        // 生成跳转地址
        let url = '/pages/' + searchtype + '/index/index?' + queryStringify(params);
        wx.navigateTo({url: url});
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
let pagejson = utils.assign(pageIndex, search, common, share);
// 渲染页面
Page(pagejson);
