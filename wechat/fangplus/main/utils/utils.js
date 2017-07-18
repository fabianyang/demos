/**
 * utils.js
 * @file 工具类
 * @author 袁辉辉(yuanhuihui@fang.com)
 */

/**
 * 函数合并
 * @param targetObj otherObj
 * @returns {obj}
 */
function assign(targetObj, ...otherObj) {
    // 特殊函数不允许覆盖，是为了添加如分享这种公共配置，也可以每个页面单独配置
    let exception = 'onShareAppMessage';
    otherObj.forEach(function(sourceObj) {
        if (sourceObj && typeof sourceObj === 'object') {
            for (let key in sourceObj) {
                if (sourceObj.hasOwnProperty(key)) {
                    if (key !== exception || !targetObj[key]) {
                        targetObj[key] = sourceObj[key];
                    }
                }
            }
        }
    });
    return targetObj;
}
/**
 *  对象合并，给指定属性赋值
 */
function filterAssign(target, source) {
    let result = {};
    if (target && typeof target === 'object' && source && typeof source === 'object') {
        for (let key in target) {
            target.hasOwnProperty(key) && source[key] && (target[key] = source[key]);
        }
        result = target;
    }
    return result;
}
/**
 * obj2str
 * @param params
 * @returns {string}
 */
function queryStringify(params) {
    let obj = params || {};
    let result = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
                obj[key] = JSON.stringify(obj[key]);
            }
            result.push(key + '=' + obj[key]);
        }
    }
    return result.join('&');
}

/**
 *  百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换：将 BD-09 坐标转换成 GCJ-02 坐标
 * 即 百度 转 谷歌、高德、腾讯
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */
function bd09Togcj02(bd_lon, bd_lat) {
    let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    let x = bd_lon - 0.0065;
    let y = bd_lat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    let gg_lng = z * Math.cos(theta);
    let gg_lat = z * Math.sin(theta);
    return { lng: gg_lng, lat: gg_lat };
}

/**
 *  百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换 将 GCJ-02 坐标转换成 BD-09 坐标
 * 即 腾讯 转 百度
 * @param lon
 * @param lat
 * @returns {*[]}
 */
function gcj02ToBd09(lon, lat) {
    let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    let x = lon,
        y = lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let tempLon = z * Math.cos(theta) + 0.0065;
    let tempLat = z * Math.sin(theta) + 0.006;
    return { lng: tempLon, lat: tempLat };
}


/**
 *  获取当前页面url
 * @returns {string}
 */
function getCurrentPage() {
    let pages = getCurrentPages();
    if (pages.length) {
        let thisPage = pages[pages.length - 1];
        // 获取页面路由信息及页面参数
        let route = thisPage.__route__;
        let params = thisPage.params;
        let paramStr = queryStringify(params);
        return { path: paramStr ? '/' + route + '?' + paramStr : '/' + route, currPage: thisPage, route: route };
    } else {
        return { path: '', currPage: null, route: '' };
    }
}

/**
 *  获取页面referrer
 * @returns {string}
 */
function getReferrer() {
    let pages = getCurrentPages(),
        result = '';
    // 若有referrer
    if (pages.length > 1) {
        let refferPage = pages[pages.length - 2];
        // 获取页面路由信息及页面参数
        let route = refferPage.__route__;
        // 参数过长会导致请求失败, 暂时去掉参数
        // let params = refferPage.params;
        // let paramStr = queryStringify(params);
        // result = paramStr ? '/' + route + '?' + paramStr : '/' + route;
        result = '/' + route;

    }
    return result;
}

/**
 *  获取统计用参数:默认返回Object
 * @param datatype obj:Object;str:string
 * @returns {string}
 */
function getStatisticsParam(datatype) {
    let referrer = encodeURIComponent(getReferrer()),
        globalid = getGlobalID(),
        pageid = encodeURIComponent(getCurrentPage().route),
        userid = '';
    let app = getApp();
    let v = app.vars.version;
    let appname = app.vars.appname;
    let result = { globalid, referrer, pageid, userid, appname, v };
    if (datatype === 'string') {
        result = queryStringify(result);
    }
    return result;
}

/**
 *  处理图片域名收敛问题：如果有协议名称则不加
 * @param imageArray
 * @param imageProp
 * @param protocol
 * @returns {obj}
 */
function ensurepProtocol(imageArray, imageProp, url, protocol = 'https:') {
    let protocolFlag = 'http';
    // 遍历图片数组
    if (imageArray && Array.isArray(imageArray)) {
        for (let key in imageArray) {
            if (imageArray.hasOwnProperty(key)) {
                let item = imageArray[key];
                let url = imageProp ? item[imageProp] : item;
                let urlResult = url.indexOf(protocolFlag) === 0 ? url : (protocol + url)
                if (imageProp) {
                    item[imageProp] = urlResult;
                } else {
                    item = urlResult;
                }
            }
        }
        return imageArray;
    } else if (url) {
        let urlResult = url.indexOf(protocolFlag) === 0 ? url : (protocol + url);
        return urlResult;
    }
}

/**
 * 评分转为数组方便展示
 * @param score
 * @param allCls
 * @param halfCls
 * @returns {obj}
 */
function scoreToArr(score, allCls = 'active', halfCls = 'half') {
    let flScore = parseFloat(score);
    let scoreArr = [],
        length = Math.ceil(flScore),
        allLen = 5;
    // 设置总评分长度5
    scoreArr.length = allLen;
    for (let i = 0; i < allLen; i++) {
        // 设置其余值为空串，否则会发生再次渲染时数据长度不正确问题
        let item = i < length ? allCls : '';
        scoreArr[i] = item;
    }
    // 有小数则最后一个为半
    (flScore + '').indexOf('.') > -1 ? (scoreArr[length - 1] = halfCls) : null;
    return scoreArr;
}

function getGlobalID() {
    var i = 0;
    var result = "";
    var pattern = "0123456789abcdef";
    for (i = 0; i < 8; i++) {
        result += pattern.charAt(Math.round(Math.random() * 15));
    }
    var time = new Date().getTime();
    result += ("00000000" + time.toString(16).toLocaleLowerCase()).substr(-8);
    return result;
}
/**
 *  对象的深复制
 * @param Object
 * @returns Object
 */
function deepCopy(source) {
    let result = {};
    for (let key in source) {
        result[key] = typeof source[key] === 'object' ? deepCoyp(source[key]) : source[key];
    }
    return result;
}
/**
 *  封装request： 1、添加统计参数 2、网络错误提示（暂时没加，toast无合适icon，页面中多request情况还需要处理）
 * @param Object
 * @returns null
 */
function request(option = {}) {
    if (typeof option !== 'object') {
        console.warn('ajax参数配置格式应为Object');
        return;
    }
    if (!option.url) {
        console.warn('url参数为必填');
        return;
    }
    // ajax参数
    let data = {};
    // 添加统计参数
    if (option && option.data) {
        data = deepCopy(option.data);
        let dataType = typeof data,
            statisData = null;
        // 根据data类型不同处理
        if (dataType === 'string' || dataType === 'object') {
            statisData = getStatisticsParam(dataType);
            if (dataType === 'string') {
                data += '&' + statisData;
            } else {
                data = assign(data, statisData);
            }
        } else {
            console.warn('data格式错误');
            return;
        }
    } else {
        // 获取统计参数
        data = getStatisticsParam();
    }
    wx.request({
        url: option.url,
        data: data,
        header: option.header || {},
        method: option.method || 'GET',
        dataType: option.dataType || 'json',
        success: res => {
            (typeof option.success === 'function') && option.success(res);
        },
        fail: res => {
            (typeof option.fail === 'function') && option.fail(res);
            // 处理网络错误提示
            if (!res.data && res.errMsg === 'request:fail') {
                try {
                    // let msg = '网络连接不可用，请稍后重试';
                    // wx.getNetworkType({
                    //     success: function (res) {
                    //         // 返回网络类型2g，3g，4g，wifi
                    //         let networkType = res.networkType;
                    //         networkType === 'none' && (msg = '无网络连接，请连接重试');
                    //     }
                    // });
                    // 关闭可能存在的加载中提示
                    // wx.hideToast();
                    // wx.showToast({
                    //     title: msg,
                    //     icon: 'success',
                    //     mask: true,
                    //     duration: 2000
                    // });
                } catch (e) {
                    // console.log('获取网络类型错误：', e);
                }

            }
        },
        complete: res => {
            (typeof option.complete === 'function') && option.complete(res);
        }
    });
}

module.exports = {
    assign: assign,
    filterAssign: filterAssign,
    getReferrer: getReferrer,
    queryStringify: queryStringify,
    getCurrentPage: getCurrentPage,
    bd09ToGcj02: bd09Togcj02,
    gcj02ToBd09: gcj02ToBd09,
    ensurepProtocol: ensurepProtocol,
    scoreToArr: scoreToArr,
    getGlobalID: getGlobalID,
    getStatisticsParam: getStatisticsParam,
    deepCopy: deepCopy,
    request: request
}