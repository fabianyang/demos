let vars = global.vars = window._vars,
    mainBuilding = global.mainBuilding = window.mainBuilding;

global.BMap = window.BMap;
global.BMapLib = window.BMapLib;

let FangMap = global.FangMap = {
    vars: {
        imgUrl: vars.imgUrl,
        city_en: vars.city,
        city_cn: vars.cityname,
        esf: vars.esf || '',
        windowWidth: vars.phpGet.width || 1196,
        windowHeight: vars.phpGet.height || 552,
        fullStatus: vars.phpGet.fullstatus || '',
        resizePage: vars.phpGet.resizePage || '',
        category: vars.phpGet.residence || '',
        tag: vars.phpGet.tag || '',
        nohead: vars.phpGet.nohead || '',
        prick: {
            app: vars.category === 'commercial' ? 'xfsyxq_B08_01' : vars.sign === 'ds' ? 'xfdsxq_B12_01' : 'xfptxq_B12_01',
            xianwu: vars.sign === 'ds' ? 'xfdsxq_B12_03' : 'xfptxq_B12_03'
        }
    },
    functions: {
        /* 计算两点间距离 */
        getShortDistance: (lon1, lat1, lon2, lat2) => {

            // PI
            var DEF_PI = 3.14159265359;

            // 2*PI
            var DEF_2PI = 6.28318530712;

            // PI/180.0
            var DEF_PI180 = 0.01745329252;

            // radius of earth
            var DEF_R = 6370693.5;
            var ew1, ns1, ew2, ns2, dx, dy, dew, distance;

            // 角度转换为弧度
            ew1 = lon1 * DEF_PI180;
            ns1 = lat1 * DEF_PI180;
            ew2 = lon2 * DEF_PI180;
            ns2 = lat2 * DEF_PI180;

            // 经度差
            dew = ew1 - ew2;

            // 若跨东经和西经180 度，进行调整
            if (dew > DEF_PI) {
                dew = DEF_2PI - dew;
            } else if (dew < -DEF_PI) {
                dew = DEF_2PI + dew;
            }

            // 东西方向长度(在纬度圈上的投影长度)
            dx = DEF_R * Math.cos(ns1) * dew;

            // 南北方向长度(在经度圈上的投影长度)
            dy = DEF_R * (ns1 - ns2);

            // 勾股定理求斜边长
            distance = Math.sqrt(dx * dx + dy * dy);
            return parseInt(distance);
        },

        buildingFormat: (data) => {
            return {
                newCode: data.newCode,
                title: data.title || data.name,
                lng: parseFloat(data.baidu_coord_x || data.mapx || data.coord_x),
                lat: parseFloat(data.baidu_coord_y || data.mapy || data.coord_y),
                // 城市
                city: data.city,
                // 区域
                district: data.district,
                // 商圈
                comarea: data.comarea,
                // 价格字符串 数字 + 单位
                price: data.price,
                // 价格数字
                price_num: data.price_num,
                // 价格单位
                price_unit: data.price_unit,
                // 类型 '低价'
                price_type: data.price_type,
                // 销售状态 1在售 2待售 3在租 4租售 0售完
                saling: data.saling,
                // 为了获得详情页地址
                purpose: data.purpose,
                // 楼盘地址 {houseurl}house/{newCode}/dongtai.htm 楼盘动态地址 {houseurl}house/{newCode}/housedetail.htm 更多详情地址
                houseurl: data.houseurl,
                // 论坛地址
                bbs: data.bbs,
                // 图片地址
                picAddress: data.picAddress,
                address: data.address,
                // 优惠信息
                youhui: data.mobilepayment || data.signupname || data.soufun_card_client || '',
                // 二手房显示套数
                category: data.category,
                esfNum: data.esfNum
            };
        }
    }
};

FangMap.vars.mainBuilding = FangMap.functions.buildingFormat(mainBuilding);
FangMap.vars.mainBuilding.main_key = 'main';


// let cityx = typeof mainBuilding !== 'undefined' ? parseFloat(mainBuilding.baidu_coord_x || mainBuilding.mapx) || vars.cityx : vars.cityx,
// cityy = typeof mainBuilding !== 'undefined' ? parseFloat(mainBuilding.baidu_coord_y || mainBuilding.mapy) || vars.cityy : vars.cityy;

/* 初始化地图参数变量 */
// if (typeof mainBuilding !== 'undefined') {
//     FangMap.vars.searchdrive['snathat'] = global.housetitle;
//     FangMap.vars.searchdrive['x'] = cityx;
//     FangMap.vars.searchdrive['y'] = cityy;
// }


// housetitle: vars.housetitle,
// searchcondition: {
//     newcode: vars.newcode,
//     cityname: vars.cityname
// },
// zhouBianTag: vars.zhouBianTag,
// imgUrl: vars.imgUrl + '/img/',

// /* 获取附近楼盘url的参数*/
// params: {
//     x1: cityx,
//     y1: cityy,
//     distance: '2',
//     strNewCode: ''
// },

// /* 用来存储当前页面上所有点的信息*/
// markerList: {},

// /* 地图边界：可用来控制地图的显示范围*/
// // markerBounds: new BMap.Bounds(),
// iType: 'hs',
// house_type: {
//     zz: '住宅',
//     sp: '商铺',
//     xzl: '写字楼',
//     bs: '别墅'
// },

// // 销售状态
// saling: {
//     1: '在&nbsp;售',
//     2: '待&nbsp;售',
//     3: '在&nbsp;租',
//     4: '待&nbsp;租',
//     0: '售&nbsp;完'
// },

// /* 以下是周边查询的***/
// have_arr: {
//     hs: '',
//     jj: '',
//     zs: '',
//     bus: '',
//     subway: '',
//     ct: '',
//     bank: '',
//     school: '',
//     hos: '',
//     buy: '',
//     park: '',
//     parking: '',
//     gas: '',
//     ktv: '',
//     bar: '',
//     cinema: '',
//     beauty: '',
//     cafe: '',
//     kindergarten: '',
//     primarysc: '',
//     middlesc: '',
//     university: '',
//     traffic: '',
//     fun: ''
// },
// have_arr_new: {
//     bus: '公交',
//     subway: '地铁',
//     ct: '餐饮',
//     bank: '银行',
//     school: '学校',
//     hos: '医院',
//     buy: '购物',
//     park: '公园',
//     parking: '停车场',
//     gas: '加油站',
//     supermark: '超市',
//     ktv: 'KTV',
//     bar: '酒吧',
//     cinema: '电影院',
//     beauty: '美容院',
//     cafe: '咖啡厅',
//     kindergarten: '幼儿园',
//     primarysc: '小学',
//     middlesc: '中学',
//     university: '大学',
//     traffic: '交通',
//     fun: '娱乐',
//     hs: '楼盘'
// },
// // 需要删除的点集合包含路线,搜附近type为other的点
// toDelterMarkers: [],
// // 已描点集合
// house_near_p: {},

// /* 打开标注框方法集***/
// openTip: [],

// /* 标注获得焦点方法集***/
// focusInfoWinFuns: [],

// /* 标注失去焦点方法集***/
// blurInfoWinFuns: [],

// /* 具有小分类的周边搜索***/
// house_near_merge: {
//     traffic: ['subway', 'bus', 'parking', 'gas'],
//     // 商业包含娱乐 超市 餐饮 银行 公园
//     business: ['fun', 'supermark', 'ct', 'bank', 'park'],
//     // 娱乐
//     fun: ['ktv', 'bar', 'cinema', 'beauty', 'cafe'],
//     school: ['kindergarten', 'primarysc', 'middlesc', 'university'],
//     xianwu: []
// },

// /* 大分类列表***/
// search_wrap: ['hs', 'traffic', 'fun', 'supermark', 'ct', 'bank', 'hos', 'park', 'school'],

// /* 需要进行搜索返回值过滤的周边***/
// type_tags: {
//     subway: ['地铁']
// },

// /* 获取周边条数*/
// maxMarker_count: 20,

// // 列表中初始化可看到的元素
// view_count: 5,
// /* 获取周边范围（m）*/
// limit: 2000,

// /* 驾车查询的参数*/
// searchdrive: {
//     start: '',
//     x1: '',
//     y1: '',
//     sstatus: '',
//     end: '',
//     x2: '',
//     y2: '',
//     estatus: '',
//     type: '',
//     tag: ''
// },
// sstartname: null,
// sendname: null,
// tag: null