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
*  百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
* 即 百度 转 谷歌、高德、腾讯
* @param bd_lon
* @param bd_lat
* @returns {*[]}
*/
function bd09Togcj02(bd_lon, bd_lat) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return { lng: gg_lng, lat: gg_lat };
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
    return '/' + route + '?' + queryStringify(params);
}


module.exports = {
    assign: assign,
    queryStringify: queryStringify,
    getCurrentPage: getCurrentPage,
    bd09ToGcj02: bd09Togcj02
}
