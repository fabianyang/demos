
import axios from 'axios';

let url = window.ajaxfilePath;

// url = 'http://newmap.test.fang.com/xf/?c=channel';

let http = axios.create({
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
});

export default {
    // http://ditu.test.fang.com/?c=channel&a=xiaoquNew&newcode=1010122849&city=bj&sign=pt&width=1200&height=455&resizePage=http://xingchuangrongshu.fang.com/house/web/map_resize.html&category=residence
    ajaxXiaoquMapSearch(opts) {
        if (!opts.lng || !opts.lat || !opts.newCode || !opts.city) {
            console.error('ajaxXiaoquMapSearch Params Error!');
            return Promise.reject();
        }

        let params = {
            a: 'ajaxXiaoquMapSearch',
            x1: opts.lng,
            y1: opts.lat,
            distance: '2',
            strNewCode: opts.newCode,
            city: opts.city
        };

        if (opts.esf) {
            params.esf = opts.esf;
        }

        return http.get(url, {
            params: params
        }).then((res) => {
            return Promise.resolve(res.data);
        }).catch((res) => {
            console.error('ajaxXiaoquMapSearch Response Error!', res);
            return Promise.reject();
        });
    },

    // http://newmap.test.fang.com/xf/?c=channel&a=getDisgust&city=sh&xqid=1211242360&r=0.37622127832900976
    getDisgust(opts) {
        if (!opts.newCode || !opts.city) {
            console.error('getDisgust Params Error!');
            return Promise.reject();
        }

        let params = {
            a: 'getDisgust',
            xqid: opts.newCode,
            city: opts.city
        };

        return http.get(url, {
            params: params
        }).then((res) => {
            return Promise.resolve(res.data);
        }).catch((res) => {
            console.error('getDisgust Response Error!', res);
            return Promise.reject();
        });
    }
};
