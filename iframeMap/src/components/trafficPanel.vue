<template>
    <div class="map_lp">
        <div class="map_tit">
            <a @click="buildingChange">返回</a>
            <strong>{{ title }}</strong>
        </div>
        <div class="map_lpcon" :style="{height: height - 41 - 55 + 'px'}">
            <ul class="map_ipt" v-if="!dsTraffic.length && !dsTrafficError">
                <li><input type="text" class="ipt_txt" :class="{ ipt_txt_focus: focusIndex === 1 }" @focus="inputFocus(1)" @blur="inputBlur(1)" v-model="startText"></li>
                <li><input type="text" class="ipt_txt" :class="{ ipt_txt_focus: focusIndex === 2 }" @focus="inputFocus(2)" @blur="inputBlur(2)" v-model="endText"></li>
                <li><input type="button" class="ipt_btn" value="获取线路" @click="beginSearch"></li>
                <li class="change">
                    <a @click="changeStartEnd"></a>
                </li>
            </ul>
            <traffic-result v-if="dsTraffic.length || dsTrafficError" :nodata='dsTrafficError' :tool="tool" :ds="dsTraffic" :start="startText" :end="endText"></traffic-result>
            <!-- <div class="traffic_result map_line" style="display:none;" id="drive_wrap"></div> -->
        </div>
    </div>
</template>

<script>
import map from '@/api/map';
import { mapState, mapMutations } from 'vuex';
import { VIEW_TOOL_CHANGE, VIEW_BUILDING_CHANGE } from '../store/mutation-types';
import trafficResult from './trafficResult';

let vars = global.FangMap.vars;

let defaultText = {
    start: '请输入起点',
    end: '请输入终点'
};

export default {
    name: 'tabPanel',
    props: ['height'],
    components: {
        trafficResult
    },
    watch: {
        tool(nv, ov) {
            // if (nv !== ov) {
                map.onSearchComplete = null
                map.clearSearch(ov);
                this.dsTraffic = [];
                this.dsTrafficError = 0;
            // }
        }
    },
    computed: {
        title() {
            let title = '';
            switch (this.tool) {
                case 'transit':
                    title = '公交';
                    break;
                case 'driving':
                    title = '驾车';
                    break;
            }
            return title;
        },
        ...mapState([
            'tool'
        ]),
    },
    methods: {
        inputFocus(index) {
            this.focusIndex = index;
            if (index === 1 && this.startText === defaultText.start) {
                this.startText = '';
            }
            if (index === 2 && this.endText === defaultText.end) {
                this.endText = '';
            }
        },
        inputBlur(index) {
            this.focusIndex = 0;
            /* 过滤特殊字符和空格 */
            if (index === 1 && this.startText.replace(/[<>\(\);{}"'\[\]\/@!,]|\s/g, '') === '') {
                this.startText = defaultText.start;
            }
            if (index === 2 && this.endText.replace(/[<>\(\);{}"'\[\]\/@!,]|\s/g, '') === '') {
                this.endText = defaultText.end;
            }
        },
        beginSearch() {
            if (this.startText === defaultText.start) {
                alert('请填写起点信息');
                return;
            }
            if (this.endText === defaultText.end) {
                alert('请填写终点信息');
                return;
            }
            map.clearSearch(this.tool);
            map.onSearchComplete = (data) => {
                if (!data) {
                    this.dsTrafficError = 1;
                }
                this.dsTraffic = data;
                // console.log(data);
            };
            map[this.tool].search(this.startText, this.endText);
        },
        buildingChange() {
            let building = vars.mainBuilding;
            let pixel = map.getCardPosition(building);
            building.pixel = pixel;

            map.onSearchComplete = null
            map.clearSearch(this.tool);
            this.dsTrafficError = 0;
            this.viewToolChange('');

            this.viewBuildingChange(building);
        },
        changeStartEnd() {
            [this.startText, this.endText] = [this.endText, this.startText];
        },
        ...mapMutations({
            'viewBuildingChange': VIEW_BUILDING_CHANGE,
            'viewToolChange': VIEW_TOOL_CHANGE
        })
    },
    data() {
        return {
            focusIndex: 0,
            startText: vars.mainBuilding.title,
            endText: defaultText.end,
            dsTrafficError: 0,
            dsTraffic: []
        }
    }
}
</script>

<style scoped>
.map_lp {
    margin-top: 10px;
    margin-left: 10px;
}

.map_lp .hx1 {
    height: 316px;
    overflow-y: auto;
}

.map_tit {
    margin-right: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
    font-size: 14px;
}

.map_tit a {
    float: right;
    padding: 1px 4px 1px 13px;
    background: url(../assets/img/arr_back.gif) 2px center no-repeat;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 12px;
    color: #999;
    cursor: pointer;
}

.map_lpcon {
    margin-top: 10px;
    padding-right: 10px;
    height: 305px;
    overflow-y: auto;
    overflow-x: hidden;
}

.map_ipt {
    position: relative;
    padding: 10px 0 0 40px;
    background: url(../assets/img/way.gif) 3px 19px no-repeat;
}

.map_ipt li {
    padding: 9px 0;
}

.map_ipt .ipt_txt {
    margin: 0;
    padding: 6px;
    border: 1px solid #ddd;
    width: 150px;
    outline: none;
    color: #999;
}

.map_ipt .ipt_txt_focus {
    border: 1px solid #bbb;
    color: #333;
}

.map_ipt .change {
    position: absolute;
    right: 5px;
    top: 39px;
}

.map_ipt .change a {
    display: block;
    width: 22px;
    height: 21px;
    background: url(../assets/img/way_change.gif) no-repeat;
    cursor: pointer;
}

.map_ipt .ipt_btn {
    margin: 0;
    padding: 0 15px;
    height: 30px;
    line-height: 30px;
    border: 0 none;
    border-radius: 3px;
    background: #46b9e8;
    cursor: pointer;
    color: #fff;
    overflow: visible;
    outline: none;
}
</style>

