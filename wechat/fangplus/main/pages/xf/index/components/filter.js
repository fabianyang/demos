/**
 * @file 新房，快筛
 * @author yangfan
 */
// 基础方法模块
// const utils = require('utils.js');
// object序列化为请求参数串
// let queryStringify = utils.queryStringify;

module.exports = {
    /**
     * 菜单点击事件
     */
    tabTap: function (e) {
        let ds = e.currentTarget.dataset;
        // 取消再次点击关闭
        if (ds.key === this.data.filter.key) {
            this.setData({
                "filter.key": '',
                "filter.open": false
            });
        } else {
            this.setData({
                // 城市定位数据完成flag
                "filter.key": ds.key,
                "filter.open": true
            });
        }
    },
    /**
     * 菜单项点击事件
     */
    optionTap: function (e) {
        let ds = e.currentTarget.dataset;
        let key = this.data.filter.key;

        // 判断有无商圈，有商圈不跳转
        if (ds.next) {
            if (key === 'district') {
                this.params[key] = ds.name;
                this.params["comarea"] = "";
                this.setData({
                    ["filter.text." + key]: ds.txt,
                    "filter.text.comarea": ''
                });
            } else {
                this.params[key] = ds.name;
                this.setData({
                    ["filter.text." + key]: ds.txt
                });
            }
            return;
        }

        // 没有商圈，即：没有下一级列表
        if (key === 'district') {
            this.params["district"] = ds.name;
            this.params["comarea"] = "";
            this.setData({
                "filter.open": false,
                "filter.key": '',
                "page": 1,
                "loading": true,
                "isEnd": false,
                "list.data": [],
                "filter.text.district": ds.txt,
                "filter.text.comarea": ''
            })
        }

        // 清空自定义数值
        if (key === 'price') {
            this.params["price"] = ds.name;
            this.setData({
                "filter.open": false,
                "filter.key": '',
                "page": 1,
                "loading": true,
                "isEnd": false,
                "list.data": [],
                "filter.text.price": ds.txt,
                "filter.priceCustom": { min: '', max: '' }
            })
        }

        if (key === 'bedroom') {
            this.params["bedroom"] = ds.name;
            this.setData({
                "filter.open": false,
                "filter.key": '',
                "page": 1,
                "loading": true,
                "isEnd": false,
                "list.data": [],
                "filter.text.bedroom": ds.txt
            })
        }

        this.refresh(function (page, data) {
            var d = data.xflist;
            if (d.length) {
                page.setData({
                    "loading": false,
                    "page": ++page.data.page,
                    "list.data": d
                })
            } else {
                page.setData({
                    "loading": false
                })
            }
        })

    },
    nextTap: function (e, isBox) {
        let ds = e.currentTarget.dataset;

        let d = {
            "filter.open": false,
            "filter.key": '',
            "page": 1,
            "loading": true,
            "isEnd": false,
            "list.data": []
        }
        if (!isBox) {
            this.params["comarea"] = ds.name;
            d["filter.text.comarea"] = ds.txt;
        } else {
            this.params["comarea"] = this.params["comarea"];
            d["filter.text.comarea"] = this.data.filter.text["comarea"];
        }
        this.setData(d);

        this.refresh(function (page, data) {
            var d = data.xflist;
            if (d.length) {
                page.setData({
                    "loading": false,
                    "page": ++page.data.page,
                    "list.data": d
                })
            } else {
                page.setData({
                    "loading": false
                })
            }
        })
    },
    boxTap: function (e) {
        let ds = e.currentTarget.dataset;

        if (ds.next) {
            this.nextTap(e, true);
        }

        this.setData({
            "filter.key": '',
            "filter.open": false
        })
    },
    stopPropagation: function (e) {
        return false;
    },
    customInput: function (e) {
        let that = this;
        // 输入类型(最小值或最大值)
        let ds = e.currentTarget.dataset;

        let br = false;

        // 不是数字 或 小于 1
        let v = parseInt(e.detail.value);
        if (!v || v < 1) {
            br = true;
        }

        // 0 或 '', 有手机兼容问题
        if (e.detail.value === '') {
            br = false;
            // 0 或非数字
        }

        if (br) {
            this.setData({
                'filter.alterText': '您输入的价格区间有误'
            })

            let timer = null;
            timer = setTimeout(function () {
                that.alterHide();
                clearTimeout(timer);
            }, 1000);
        }

        v = e.detail.value.replace(/[^0-9]/g, '').replace(/^0+/g, '')

        if (ds.name === 'min') {
            this.setData({
                "filter.priceCustom.min": v || ''
            })
        }

        if (ds.name === 'max') {
            this.setData({
                "filter.priceCustom.max": v || ''
            })
        }

    },
    customSubmit: function (e) {
        let that = this;
        let ds = e.currentTarget.dataset;

        let max = ds.max - 0,
            min = ds.min - 0;

        if (min && max && min > max) {
            this.setData({
                'filter.alterText': '您输入的价格区间有误'
            })

            let timer = null;
            timer = setTimeout(function () {
                that.alterHide();
                clearTimeout(timer);
            }, 1000);
            return;
        }

        // let t = min + '-' + max + '万',
        //     a = ["[", (min * 10000).toFixed(0), ",", (max * 10000).toFixed(0), "]单价"];

        let t = min + '-' + max + '元/㎡',
            a = ["[", min, ",", max, "]单价"];

        // 都为空，不限
        if (!min && !max) {
            t = '';
            a = [];
        }

        // 最小值为空
        if (!min && max) {
            // t = max + '万以下';
            t = max + '元/㎡以下';
            a[1] = '0';
        }

        // 最大值为空
        if (min && !max) {
            // t = min + '万以上';
            t = min + '元/㎡以上';
            a[3] = '';
        }

        this.params["price"] = a.join('');
        this.setData({
            "filter.open": false,
            "filter.key": '',
            "page": 1,
            "loading": true,
            "isEnd": false,
            "list.data": [],
            "filter.text.price": t
            // "filter.priceCustom": { min: '', max: '' },
        })

        this.refresh(function (page, data) {
            var d = data.xflist;
            if (d.length) {
                page.setData({
                    "loading": false,
                    "page": ++page.data.page,
                    "list.data": d
                })
            } else {
                page.setData({
                    "loading": false
                })
            }
        })
    },
    alterHide: function(e) {
        this.setData({
            'filter.alterText': ''
        })
    }
};
