<template>
    <div class="tc_mes">
        <div class="tc_mes_nr" v-if="ds.main_key === 'around' || ds.main_key === 'main'">
            <a class="popclose" @click="viewCardClose">X</a>
            <dl>
                <dd>
                    <a target="_blank" :href="getHref('detail', ds.purpose)" :title="ds.title">{{ ds.title }}</a>
                </dd>
                <dt v-text="inputSaleType(ds)"></dt>
            </dl>
            <div class="clear"></div>
            <div class="tc_mes_xx">
                <div class="tc_mes_text">
                    <ul>
                        <li>
                            <b>{{ ds.price_num || '价格暂无' }}</b>{{ ds.price_unit }}
                            <span v-if="ds.youhui" class="rbox2" title="ds.youhui">{{ ds.youhui }}</span>
                        </li>

                        <li>位置：
                            <a class="gray" :href="getHref('city', ds.city)" target="_blank">{{ ds.city }}</a>
                            <a v-if="ds.district" class="gray"> - </a>
                            <a v-if="ds.district" class="gray" :href="getHref('district', ds.district)" target="_blank">{{ds.district }}</a>
                            <a v-if="ds.comarea" class="gray"> - </a>
                            <a v-if="ds.comarea" class="gray" :href="getHref('comarea', ds.comarea)" target="_blank">{{ds.comarea }}</a>
                        </li>
                        <li>
                            <a :href="ds.houseurl + 'house/' + ds.newCode + '/dongtai.htm'" target="_blank">{{ esf ? '小区' : '楼盘' }}动态</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <a :href="ds.bbs" target="_blank">业主论坛</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <a :href="ds.houseurl + 'house/' + ds.newCode + '/housedetail.htm'" target="_blank">更多详情</a>
                        </li>
                    </ul>
                </div>
                <img :src="ds.picAddress" width="108" height="72" alt="ds.title">
            </div>
        </div>
        <div class="tc_mes_nr" v-else>
            <a class="popclose" @click="viewCardClose">X</a>
            <dl>
                <dd>{{ ds.title }}</dd>
            </dl>
            <div class="clear"></div>
            <div class="tc_mes_xx">
                <div class="tc_mes_text">
                    <ul>
                        <li>地址：{{ ds.address }}</li>
                        <li>电话：{{ ds.phone || '暂无' }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="clear"></div>
    </div>
</template>

<script>
import map from '@/api/map';
import { mapMutations } from 'vuex';
import { VIEW_CARD_CLOSE } from '@/store/mutation-types';

let vars = global.FangMap.vars;
/* 拼url*/
let httpAddress = (purpose) => {
    let city_en = vars.city_en;
    let city_cn = vars.city_cn || '';

    var soufunhttp = '';
    // IE兼容 indexOf
    // if (!Array.indexOf) {
    //     Array.prototype.indexOf = function (obj) {
    //         for (var i = 0; i < this.length; i++) {
    //             if (this[i] == obj) {
    //                 return i;
    //             }
    //         }
    //         return -1;
    //     };
    // }
    if (purpose.indexOf('写字楼') > -1) {
        /* 北京、成都、广州、深圳、天津、上海、重庆、苏州、杭州、沈阳*/
        var isInThose = city_en == 'bj' || city_en == 'sh' || city_en == 'cd' || city_en == 'gz' || city_en == 'sz' || city_en == 'tj' || city_en == 'cq';
        if (isInThose || city_en == 'sy' || city_en == 'hz' || city_en == 'suzhou') {
            if (city_en == 'bj') {
                soufunhttp = 'http://office.fang.com';
            } else {
                soufunhttp = 'http://office.' + city_en + '.fang.com';
            }
            return soufunhttp + '/house/' + city_cn + '_';
        }
    } else if (purpose.indexOf('商铺') > -1) {
        /* 北京、天津、上海、深圳、东莞、武汉、南京、苏州*/
        if (city_en == 'bj' || city_en == 'sh' || city_en == 'dg' || city_en == 'sz' || city_en == 'tj' || city_en == 'wuhan' || city_en == 'nanjing' || city_en == 'suzhou') {
            if (city_en == 'bj') {
                soufunhttp = 'http://shop.fang.com';
            } else {
                soufunhttp = 'http://shop.' + city_en + '.fang.com';
            }
            return soufunhttp + '/house/' + city_cn + '_';
        }
    }
    if (city_en == 'bj') {
        soufunhttp = 'http://www.fang.com/house/';
    } else if (city_en == 'nanjing') {
        soufunhttp = 'http://nanjing.fang.com/house/';
    } else {
        soufunhttp = 'http://newhouse.' + city_en + '.fang.com/house/';
    }
    return soufunhttp;
};

export default {
    name: 'buildingCard',
    props: ['ds'],
    methods: {
        inputSaleType: function(info) {
            //销售状态
            let result = '';
            switch (info.saling) {
                case 0:
                    result = '售&nbsp;完';
                    break;
                case 1:
                    result = '在&nbsp;售';
                    break;
                case 2:
                    result = '待&nbsp;售';
                    break;
                case 3:
                    result = '出&nbsp;租';
                    break;
                case 4:
                    result = '租&nbsp;售';
                    break;
            }

            if (info.category && info.esfNum && '2' == info.category) {
                if (info.esfNum) {
                    result = '(' + info.esfNum + '套房源)';
                } else {
                    result = '(暂无房源信息)';
                }
            }
            return result;
        },
        getHref(key, value) {
            let result = 'http://www.fang.com/house/s/' + value;
            switch (key) {
                case 'detail':
                    result = httpAddress(value) + this.ds.newCode + '.htm';
                    break;
            }
            return result;
            // return str.match(/href=[\'\"]?([^\'\"]*)[\'\"]?/i)[1];
        },
        ...mapMutations({
            'viewCardClose': VIEW_CARD_CLOSE
        })
    },
    data() {
        return {
            esf: vars.esf ? 1 : 0
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.popclose {
    position: absolute;
    right: 13px;
    top: 17px;
    display: block;
    width: 14px;
    height: 14px;
    background: url(../assets/img/map_icon.png) no-repeat -124px -5px;
    overflow: hidden;
    text-indent: -9999em;
    cursor: pointer;
}

.tc_mes {
    width: 354px;
    border: solid 1px #ccc;
    background: #fff;
    box-shadow: 2px 2px 8px #888888;
    border-radius: 4px;
}

.tc_mes_nr {
    width: 335px;
    height: auto;
    display: table;
    margin: 0px auto;
    padding-bottom: 15px;
}

.tc_mes_nr dl {
    border-bottom: solid 1px #eeeeee;
    height: 45px;
    overflow: hidden;
}

.tc_mes_nr dl dd {
    font-family: "微软雅黑";
    font-size: 16px;
    line-height: 45px;
    float: left;
    overflow: hidden;
    height: 45px;
}

.tc_mes_nr dl dt {
    padding: 0px 3px 0px 3px;
    text-align: center;
    float: left;
    color: #fff;
    background-color: #ff0000;
    line-height: 16px;
    border-radius: 2px;
    margin-left: 10px;
    margin-top: 14px;
}

.tc_mes_nr .tc_mes_xx {
    width: 335px;
    margin-top: 15px;
}

.tc_mes_nr .tc_mes_text {
    float: left;
}

.tc_mes_xx ul {
    width: auto;
    overflow: hidden;
    margin-left: 5px;
}

.tc_mes_xx li {
    line-height: 25px;
    word-wrap: break-word;
    word-break: break-all;
}

.tc_mes_xx li b {
    color: #ff3333;
    margin-right: 5px;
    display: inline;
    vertical-align: middle;
    font-size: 20px;
    font-family: Arial, Verdana, sans-serif, 宋体, "Microsoft Yahei", 微软雅黑;
}

.tc_mes_xx li span {
    color: #fff;
    padding: 3px 5px 4px 5px;
    color: #fff;
    background-color: #ff0000;
    display: inline;
    _padding-top: 5px;
    margin-left: 5px;
}

.tc_mes_xx li a {
    color: #0066cc;
}

.tc_mes_xx li a.gray {
    color: #333333;
}

.tc_mes_xx img {
    float: right;
}
</style>
