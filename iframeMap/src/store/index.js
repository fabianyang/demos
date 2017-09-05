import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

let vars = global.FangMap.vars;

export default new Vuex.Store({
    state: {
        view: 'main',
        tool: '',
        // 地图中心坐标
        center: {
            lng: 116.404, lat: 39.915
        },
        around: {},
        traffic: {},
        business: {},
        school: {},
        hospital: [],
        xianwu: [],
        requested: {},
        // 导航
        mainTab: {},
        subTab: {
            around: ['住宅', '商铺', '写字楼', '别墅'],
            hospital: ['医院'],
            xianwu: ['嫌恶'],
            traffic: ['地铁', '公交', '停车场', '加油站'],
            business: ['娱乐', '超市', '餐饮', '银行', '公园'],
            // funny: ['KTV', '酒吧', '电影院', '美容院', '咖啡厅'],
            school: ['幼儿园', '小学', '中学', '大学']
        },
        subKey: '',
        mainKey: '',
        marker: {
            hover: '',
            click: ''
        },
        dsAroundMarkers: [],
        dsBuildingCard: ''
    },
    mutations: mutations,
    actions: actions,
    strict: debug
});