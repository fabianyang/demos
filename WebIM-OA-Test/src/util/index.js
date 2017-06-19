class Util {
    constructor() {}
    static addCookie(name, value, iDay) {
        if (iDay) {
            let oDate = new Date();
            oDate.setDate(oDate.getDate() + iDay);
            document.cookie = name + '=' + value + ';path=/;domain=fang.com;expires=' + oDate.toGMTString();
        } else {
            document.cookie = name + '=' + value + ';path=/; domain=fang.com';
        }
    }

    static getCookie(name) {
        let arr = document.cookie.split('; ');
        for (let i = 0; i < arr.length; i++) {
            let arr2 = arr[i].split('=');
            if (arr2[0] == name) {
                return arr2[1];
            }
        }
        return '';
    }
    // 格式化日期，返回2017-04-07格式
    static formatDate(date) {
        let ny = date.getFullYear(),
            nm = (date.getMonth() + 101).toString().substr(1),
            nd = (date.getDate() + 100).toString().substr(1);
        return ny + '-' + nm + '-' + nd;
    }

    // static formatMoney(numbers, places, symbols, thousand, decimal) {
    //     numbers = numbers || 0;
    //     places = !isNaN(places = Math.abs(places)) ? places : 2;
    //     symbols = symbols !== undefined ? symbols : '';
    //     thousand = thousand || ',';
    //     decimal = decimal || '.';
    //     let negative = numbers < 0 ? '-' : '',
    //         i = parseInt(numbers = Math.ceil(Math.abs(+numbers || 0)).toFixed(places), 10) + '',
    //         k = i.length,
    //         j = k > 3 ? k % 3 : 0;
    //     return symbols + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(numbers - i).toFixed(places).slice(2) : '');
    // }

    static queryStringify(params) {
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


    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0;
            let x = r & 0x3 | 0x8;
            let v = c === 'x' ? r : x;
            return v.toString(16);
        });
    }

    static isArray(a) {
        return Array.isArray ? Array.isArray(a) : Object.prototype.toString.call(a) === '[object Array]';
    }

    static delCookie(name) {
        Util.addCookie(name, 1, -1);
    }

    static dateFormat(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
        var o = {
            'M+': date.getMonth() + 1, //月份
            'd+': date.getDate(), //日
            'h+': date.getHours(), //小时
            'm+': date.getMinutes(), //分
            's+': date.getSeconds(), //秒
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度
            'S': date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    }
}

export default Util;
