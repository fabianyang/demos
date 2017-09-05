import api from '../api';
import map from '../api/map';
import {
    VIEW_AROUND_CHANGE,
    VIEW_LOCALSEARCH_CHANGE,
    VIEW_XIANWU_CHANGE
} from './mutation-types';

let vars = global.FangMap.vars,
    functions = global.FangMap.functions;

export default {
    getAroundBuilding({
        commit
    }) {
        api.ajaxXiaoquMapSearch({
            newCode: vars.mainBuilding.newCode,
            lng: vars.mainBuilding.lng,
            lat: vars.mainBuilding.lat,
            city: vars.city_en
        }).then((data) => {
            if (!data) {
                console.log('traffic show');
                this.commit(VIEW_AROUND_CHANGE, {
                    list: [],
                    data: {}
                });
                return false;
            }
            let around = {},
                tab = [];
            tab = Object.keys(data).map((key) => {
                let array = data[key].map((v) => {
                    let ff = functions.buildingFormat(v);
                    ff.distance = functions.getShortDistance(vars.mainBuilding.lng, vars.mainBuilding.lat, ff.lng, ff.lat);
                    ff.main_key = 'around';
                    return ff;
                });
                around[key] = array;
                return key;
            });
            commit(VIEW_AROUND_CHANGE, {
                list: tab,
                data: around
            });
        }).catch((data) => {
            console.log('traffic show');
        });
    },

    getDisgustBuilding({
        commit
    }) {
        api.getDisgust({
            newCode: vars.mainBuilding.newCode,
            city: vars.city_en
        }).then((data) => {
            if (!data) {
                this.commit(VIEW_XIANWU_CHANGE, {
                    list: [],
                    data: {}
                });
                return false;
            }
            // console.log(data);
            let xianwu = {},
                tab = [];
            tab = Object.keys(data).map((key) => {
                let array = data[key].map((v) => {
                    let ff = functions.buildingFormat(v);
                    ff.distance = v.distance;
                    ff.main_key = 'xianwu';
                    return ff;
                });
                xianwu[key] = array;
                return key;
            });
            commit(VIEW_XIANWU_CHANGE, {
                list: tab,
                data: xianwu
            });
        }).catch((data) => {
            console.log('traffic show');
        });
    },

    getLocalSearchBuilding({
        commit,
        state
    }, opts) {
        let result = {};
        let tabs = state.subTab[opts.key];
        let requestCount = 0;

        let request = (keyword) => {
            return new Promise((resolve, reject) => {
                map.localSearch(keyword, {
                    lng: vars.mainBuilding.lng,
                    lat: vars.mainBuilding.lat
                }).then((data) => {
                    resolve(data);
                }).catch(() => {
                    resolve([]);
                    console.log(keyword + 'baidu localSearch Error Catch');
                });
            });
        };

        tabs.forEach((keyword) => {
            if (keyword === '娱乐') {
                let iArray = [],
                    iCount = 0;
                ['KTV', '酒吧', '电影院', '美容院', '咖啡厅'].forEach((v) => {
                    request(v).then((data) => {
                        iArray = iArray.concat(data.slice(0, 5));
                        if (++iCount === 5) {
                            result[keyword] = iArray;
                            commit(VIEW_LOCALSEARCH_CHANGE, {
                                key: opts.key,
                                data: result
                            });
                        }
                    });
                });
            } else {
                request(keyword, tabs.length).then((data) => {
                    result[keyword] = data;
                    if (++requestCount === tabs.length) {
                        commit(VIEW_LOCALSEARCH_CHANGE, {
                            key: opts.key,
                            data: result
                        });
                    }
                });
            }
        });
    }

};
