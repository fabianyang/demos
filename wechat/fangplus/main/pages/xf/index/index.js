// pages/xf/index/index.js

const app = getApp();
const utilPath = '../../../utils/';
const Promise = require(utilPath + 'promise.js').Promise;
//基础方法模块
const utils = require(utilPath + 'utils.js');
// 搜索功能模块
const search = require(utilPath + 'search.js');

// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);

// 新房快筛功能模块
const filter = require('components/filter.js');
/**
 * 未筛选
 标题：北京新房
 描述：互联网买新房，24小时置业顾问服务！

 有筛选项
 标题：北京朝阳望京优质楼盘推荐
 描述：房天下帮您找到这些优惠楼盘，来看看吧！
 */
let page = {
    onShareAppMessage: function () {
        // 获取当前页面路径
        let pages = getCurrentPages();
        let page = pages[pages.length - 1];
        // 获取页面路由信息及页面参数
        let route = page.__route__;
        // let params = page.params;
        // params.text = JSON.stringify(this.data.filter.text);
        let path = route + '?cityname=' + this.params.cityname
            + '&red=' + this.params.red
            + '&keyword=' + this.data.keyword
            + '&district=' + this.params.district
            + '&price=' + this.params.price
            + '&bedroom=' + this.params.bedroom
            + '&comarea=' + this.params.comarea
            + '&text=' + JSON.stringify(this.data.filter.text);
        let o = {
            desc: '互联网买新房，24小时置业顾问服务！',
            title: this.params.cityname + '新房',
            path: path
        };
        if (this.params.district) {
            o = {
                title: this.params.cityname + this.params.district + this.params.comarea + '优质楼盘推荐',
                desc: '房天下帮您找到这些优惠楼盘，来看看吧！',
                path: path
            }
        }
        return o;
    },
    data: {
        site: app.vars.interfaceSiteJava || 'https://m.fang.com/xcx.d?m=',
        cityInfo: {},
        // 首次加载标识
        firstLoad: true,
        filter: {
            open: false,
            key: '',
            text: {
                "district": '',
                "price": '',
                "bedroom": '',
                "comarea": ''
            },
            data: {
                "district": [],
                "price": [],
                "priceNew": [],
                "bedroom": ['', '一居', '二居', '三居', '四居', '五居', '五居以上'],
                "comarea": {},
                "comareaid": {}
            },
            "priceCustom": { min: '', max: '' }
        },
        list: {
            data: []
        },
        page: 1,
        keyword: '',
        loading: true,
        isEnd: false
    },
    clickTime: '',
    refresh: function (callback, params = {}) {
        let data = Object.assign({
            city: encodeURIComponent(this.params.cityname),
            p: this.data.page,
            keyword: encodeURIComponent(this.data.keyword),
            red: this.params.red,
            district: encodeURIComponent(this.params.district),
            price: encodeURIComponent(this.params.price),
            bedrooms: encodeURIComponent(this.params.bedroom),
            comarea: encodeURIComponent(this.params.comarea)
        }, params);

        // 连接字符串写法要写两遍 encodeURIComponent ， 请求参数data 中 只需一遍
        // let url = data.site + '?m=xflistData' + '&city=' + encodeURIComponent(encodeURIComponent('北京'));
        let that = this;
        utils.request({
            url: this.data.site + 'xflist',
            data: data,
            success: function (res) {
                callback && callback(that, res.data);
            }
        })
    },
    onLoad: function (params) {
        this.params = Object.assign({}, {
            cityname: app.userPosition.shortCity || '北京',
            red: '',
            district: '',
            price: '',
            bedroom: '',
            comarea: ''
        }, params);

        if (params.keyword) {
            this.setData({
                "keyword": params.keyword
            })
        }

        if (params.text) {
            this.setData({
                "filter.text": JSON.parse(params.text)
            })
        }
        this.init();
    },
    /**
     * 页面初始化
     */
    init: function () {
        this.setData({
            "page": 1,
            "loading": true,
            "isEnd": false,
            "list.data": []
        });

        // 获取搜索历史
        this.getSearchHistory();

        // 设置 title
        wx.setNavigationBarTitle({
            title: this.params.cityname + '新房'
        });

        let page = this;
        let data = page.data;

        // 请求参数快筛
        let fd = data.filter;
        utils.request({
            url: page.data.site + 'xflistData',
            data: {
                city: encodeURIComponent(page.params.cityname)
            },
            success: function (res) {
                let d = res.data;

                let district = fd.data.district.concat(d.district),
                    price = fd.data.price.concat(d.price.split(';'));

                fd.data.district = [''].concat(d.district);
                fd.data.price = [''].concat(d.price.split(';'));
                fd.data.priceNew = [''].concat(d.priceNew.split(';'));

                d.district.forEach((x, i) => {
                    let dc = d.comarea[i];
                    if (dc) {
                        let a = [{
                            id: '',
                            name: ''
                        }];
                        d.comarea[i].split(',').forEach((x, i) => {
                            let s = x.split(';');
                            a.push({
                                id: s[1],
                                name: s[0]
                            });
                        });
                        fd.data.comarea[x] = a;
                    }
                });

                page.setData({
                    "filter.data": fd.data
                });
            }
        });

        // 初始化列表
        this.refresh(function (page, data) {
            var d = data.xflist;
            if (d.length) {
                let ld = d;
                // 只有一条数据，将置顶变为普通楼盘
                if (d.length === 1) {
                    ld = d.map((x, i) => {
                        if (x.zhiding) {
                            x.zhiding = '~' + x.zhiding
                        }
                        return x;
                    });
                }
                page.setData({
                    "loading": false,
                    "page": ++page.data.page,
                    "list.data": ld
                })
            } else {
                page.setData({
                    "loading": false
                })
            }
        });
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        if (!this.data.firstLoad) {
            // this.init();
            // 更新搜索历史
            this.getSearchHistory();
        } else {
            this.data.firstLoad = false;
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    /**
     * 获取搜索历史
     */
    getSearchHistory: function () {
        new Promise((resolve, reject) => {
            wx.getStorage({
                key: 'xfHistory-' + this.params.cityname,
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
                        cityname: this.params.cityname,
                        // localstorage存储key
                        historyTag: 'xfHistory-' + this.params.cityname,
                        // 搜索输入展示标志位
                        // 1:history show;2:autoprompt show;3: autopromt nodata;0:hide;
                        showHistory: history.length ? 1 : 0,
                        // 搜索结果跳转地址
                        url: '/pages/xf/index/index'
                    });
                }
            });
        }).then(resData => {
            this.setData({
                // 搜索数据
                searchInfo: resData
            });
        });
    },
    loadmore: function () {
        if (!this.data.loading) {
            this.setData({
                "loading": true,
                "isEnd": false
            })

            this.refresh(function (page, data) {
                let d = data.xflist;
                if (d.length) {
                    let ld = d.map((x, i) => {
                        // 将置顶变为普通楼盘
                        if (x.zhiding) {
                            x.zhiding = '~' + x.zhiding
                        }
                        return x;
                    })
                    page.setData({
                        "loading": false,
                        "page": ++page.data.page,
                        "list.data": page.data.list.data.concat(ld),
                        "isEnd": false
                    })

                } else {
                    page.setData({
                        "loading": true,
                        "isEnd": true
                    })
                }
            })
        }
    },
    specialTap: function (e) {
        let clickTime = this.clickTime;
        // 从未点击或者两次点击时间超过一秒允许跳转
        if (!clickTime || (e.timeStamp - clickTime) >= 1000) {
            let url = '/pages/xf/index/index?red=hb&cityname=' + this.params.cityname
                + '&keyword=' + this.data.keyword
                + '&district=' + this.params.district
                + '&price=' + this.params.price
                + '&bedroom=' + this.params.bedroom
                + '&comarea=' + this.params.comarea
                + '&text=' + JSON.stringify(this.data.filter.text);

            // !clickTime && this.setData({
            //     clickTime: e.timeStamp
            // });
            this.clickTime = e.timeStamp;

            wx.navigateTo({
                url: url
            });
        } else if ((e.timeStamp - clickTime) < 1000) {
            this.clickTime = e.timeStamp;
        }
    },
    commonTap: function (e) {
        let clickTime = this.clickTime;
        // 从未点击或者两次点击时间超过一秒允许跳转
        if (!clickTime || (e.timeStamp - clickTime) >= 1000) {
            let ds = e.currentTarget.dataset;
            let url = '/pages/xf/detail/detail?' + utils.queryStringify({
                cityname: this.params.cityname,
                houseid: ds.newcode,
                housetype: '',
                title: ds.projname,
                x: app.userPosition.location && app.userPosition.location.lng || '',
                y: app.userPosition.location && app.userPosition.location.lat || ''
            })

            this.clickTime = e.timeStamp;

            wx.navigateTo({
                url: url
            });
        } else if ((e.timeStamp - clickTime) < 1000) {
            this.clickTime = e.timeStamp;
        }
    },
    search: function (name) {
        this.setData({
            "page": 1,
            "loading": true,
            "isEnd": false,
            "list.data": [],
            "keyword": name.split(',')[0]
        });

        let isRedPage = false;
        if (this.params.red) {
            isRedPage = true;
        }

        // 搜索时不加红包页参数
        this.params["red"] = '';
        this.refresh(function (page, data) {
            let d = data.xflist;
            if (d.length) {
                let ld = d;
                // 红包页，或者只有一条数据，将置顶变为普通楼盘
                if (isRedPage || d.length === 1) {
                    ld = d.map((x, i) => {
                        if (x.zhiding) {
                            x.zhiding = '~' + x.zhiding
                        }
                        return x;
                    });
                }
                page.setData({
                    "loading": false,
                    "page": ++page.data.page,
                    "list.data": ld
                })
            } else {
                page.setData({
                    "loading": false
                })
            }
        });
    }
};
Page(Object.assign(page, filter, search));