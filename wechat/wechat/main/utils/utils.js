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
    otherObj.forEach(function (sourceObj) {
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
        obj.hasOwnProperty(key) && result.push(key + '=' + obj[key]);
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
    return {lng: gg_lng, lat: gg_lat};
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
    let x = lon, y = lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let tempLon = z * Math.cos(theta) + 0.0065;
    let tempLat = z * Math.sin(theta) + 0.006;
    return {lng: tempLon, lat: tempLat};
}


/**
 *  获取当前页面url
 * @returns {string}
 */
function getCurrentPage() {
    let pages = getCurrentPages();
    let thisPage = pages[pages.length - 1];
    // 获取页面路由信息及页面参数
    let route = thisPage.__route__;
    let params = thisPage.params;
    let paramStr = queryStringify(params);
    return {path: paramStr ? '/' + route + '?' + paramStr : '/' + route, currPage: thisPage};
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
        length = Math.ceil(flScore), allLen = 5;
    // 设置总评分长度5
    scoreArr.length = allLen;
    for (let i = 0; i < allLen; i++) {
        let item = i < length ? allCls : '';
        scoreArr[i] = item;
    }
    // 有小数则最后一个为半
    (flScore + '').indexOf('.') > -1 ? (scoreArr[length - 1] = halfCls) : null;
    return scoreArr;
}

module.exports = {
    assign: assign,
    filterAssign: filterAssign,
    queryStringify: queryStringify,
    getCurrentPage: getCurrentPage,
    bd09ToGcj02: bd09Togcj02,
    gcj02ToBd09: gcj02ToBd09,
    ensurepProtocol: ensurepProtocol,
    scoreToArr: scoreToArr
}
