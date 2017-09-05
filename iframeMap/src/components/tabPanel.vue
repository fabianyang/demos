<template>
    <!--楼盘-->
    <div class="myWrap" :id="title.key === 'xianwu' ? prick : ''">
        <ul v-if="ds && title.key !== 'hospital' && ( title.key !== 'xianwu' && tab.length > 1 )" class="change_lp clearfix ">
            <li v-for="(value, index) in tab" :key="index" :class="{ hover: tab_index === index }" @click="tabChange(index)">{{ value }}</li>
        </ul>
        <div v-if="ds && title.key !== 'hospital' && tab.length > 1" class="jt_hua clearfix">
            <div class="jian_hual jian_hua" @click="tabChange(tab_index === 0 ? tab.length - 1 : tab_index - 1)">
                <a class="left_hua"></a>
            </div>
            <div class="jian_huar jian_hua" @click="tabChange(tab_index === tab.length - 1 ? 0 : tab_index + 1)">
                <a class="right_hua"></a>
            </div>
        </div>
        <!-- 楼盘子筛选 【别墅,写字楼,商铺,等】 遍历-->
        <div class="rightcons" v-if="ds">
            <div class="hx1" :style="{ height: height - 41 - 55 + 'px' }" v-show="tab_index === index" v-for="(value, index) in tab" :key="index">
                <p v-if="!ds[value] || ds[value].length === 0" class="noResult">
                    暂时没有相关信息，看看其他内容吧
                </p>
                <ul v-else>
                    <li v-for="(v, i) in ds[value]" :key="i" :class="{ hover: hoverIndex === i || clickIndex === i }"  @mouseenter="viewMarkerHover(i)" @mouseleave="viewMarkerHover(-1)" @click="buildingChange(ds[value][i], i)">
                        <!-- <a :href="v.houseurl" :title="v.title"> -->
                        <a :title="v.title">
                            <span class="dw_info" v-if="false">
                                <i :class="{ hover: hoverIndex === i || clickIndex === i }">{{ i + 1 }}</i>
                                <span class="wai_traffic">
                                    <span class="shang_traffic">
                                        {{ v.title ? v.title.substr(0, 16) : '' }}
                                    </span>
                                    <b class="address">{{ v.address ? v.address.split(';').slice(0,2).join(';') + ';' : '' }}</b>
                                </span>
                            </span>
                            <span class="dw_info" v-else >
                                <i :class="{ hover: hoverIndex === i || clickIndex === i }">{{ i + 1 }}</i>{{ v.title ? v.title.substr(0, 16) : '' }}
                                <span v-if="v.saling" v-text="inputSaleType(v.saling)"></span>
                            </span>
                            <span class="dw_traffic">{{ v.distance }}米</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <!--交通-->
    <!--商业-->
    <!--医院-->
    <!--嫌恶-->
</template>

<script>
import map from '@/api/map';
import { mapState, mapMutations } from 'vuex';
import { VIEW_SUBTAB_CHANGE, VIEW_BUILDING_CHANGE, VIEW_MARKER_HOVER, VIEW_MARKER_CLICK } from '../store/mutation-types';
let vars = global.FangMap.vars;

export default {
    name: 'tabPanel',
    props: ['ds', 'tab', 'title', 'height'],
    computed: {
        ...mapState({
            'hoverIndex': state => state.marker.hover,
            'clickIndex': state => state.marker.click
        })
    },
    methods: {
        tabChange(index) {
            this.tab_index = index;
            this.viewSubTabChange({
                key: this.tab[index]
            });
        },
        buildingChange(building, index) {
            let pixel = map.getCardPosition(building);
            building.pixel = pixel;

            this.viewBuildingChange(building);
            this.viewMarkerClick(index);
        },
        inputSaleType(code) {
            let result = '';
            switch (+code) {
                case 0:
                    result = '售完';
                    break;
                case 1:
                    result = '在售';
                    break;
                case 2:
                    result = '待售';
                    break;
                case 3:
                    result = '出租';
                    break;
                case 4:
                    result = '租售';
                    break;
            }
            return result;
        },
        ...mapMutations({
            'viewMarkerHover': VIEW_MARKER_HOVER,
            'viewMarkerClick': VIEW_MARKER_CLICK,
            'viewSubTabChange': VIEW_SUBTAB_CHANGE,
            'viewBuildingChange': VIEW_BUILDING_CHANGE
        })
    },
    data() {
        return {
            tab_index: 0,
            prick: vars.prick.xianwu,
            newCode: vars.mainBuilding.newCode
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.change_lp {
    font-size: 14px;
    color: #666666;
    border-bottom: 1px solid #eeeeee;
    padding-top: 10px;
    margin-left: 20px;
    overflow: hidden;
    height: 44px;
    float: left;
}

.change_lp li {
    float: left;
    line-height: 32px;
    margin-right: 24px;
    cursor: pointer;
}

.change_lp li.hover {
    color: #ff3333;
    border-bottom: 1px solid #ff3333;
}

.ld_nei .jt_hua {
    float: left;
    margin-left: -2px;
    width: 22px!important;
    height: 42px!important;
}

.jt_hua .jian_hua {
    float: left;
    line-height: 42px;
    cursor: pointer;
}

.jt_hua .jian_hua.jian_hual {
    margin-right: 6px;
    margin-left: -8px;
}

.jt_hua .jian_hua.jian_hual a.left_hua {
    width: 10px;
    height: 42px;
    background: url(../assets/img/arrhui1.png) no-repeat center 20px;
    display: block;
}

.jt_hua .jian_hua.jian_hual a.left_hua:hover {
    background: url(../assets/img/arrred1.png) no-repeat center 20px;
}

.jt_hua .jian_hua.jian_huar {
    margin-right: 0;
}

.jt_hua .jian_hua.jian_huar a.right_hua {
    width: 10px;
    height: 42px;
    background: url(../assets/img/arrhui2.png) no-repeat center 20px;
    display: block;
}

.jt_hua .jian_hua.jian_huar a.right_hua:hover {
    background: url(../assets/img/arrred2.png) no-repeat center 20px;
}

.rightcons {
    height: 460px;
    clear: both;
}

.hx1 {
    height: 316px;
    overflow-y: auto;
}

.hx1 p {
    font-size: 14px;
    line-height: 30px;
    text-indent: 20px;
}

.hx1 ul {
    padding-top: 0px;
    overflow: hidden;
    padding-bottom: 10px;
    overflow-y: auto;
}

.hx1 ul li {
    line-height: 64px;
    padding-left: 0px;
    margin-left: 20px;
    padding-right: 20px;
    height: 64px;
    border-bottom: 1px solid #f7f7f7;
    cursor: pointer;
}

.hx1 ul li.hover {
    background: #f7f7f7;
    margin-left: -20px;
    padding-left: 40px;
}

.hx1 ul li a {
    display: block;
    height: 100%;
    width: 100%;
    font-size: 14px;
    color: #333;
}

.hx1 .dw_info {
    float: left;
}

.hx1 .dw_info i {
    float: left;
    width: 22px;
    height: 64px;
    background: url(../assets/img/dw01.png) no-repeat left center;
    line-height: 60px;
    font-style: normal;
    color: #ffffff;
    text-indent: 6px;
    margin-right: 10px;
}

.hx1 .dw_info i.hover {
    background: url(../assets/img/dw02.png) no-repeat left center;
}

.hx1 span.dw_info {
    margin-left: 14px;
    font-size: 14px;
}

.hx1 .dw_traffic {
    background: url(../assets/img/dw_tra.png) no-repeat left center;
    padding-left: 18px;
    float: right;
}

.hx1 span.wai_traffic {
    float: left;
    line-height: 24px;
    margin-top: 16px;
}

.hx1 span.shang_traffic {
    display: block;
}

.hx1 b.address {
    font-weight: normal;
    color: #999!important;
    font-size: 14px;
}
</style>
