<template>
    <div class="mark-icon-box" @click="buildingChange(ds, i)" @mouseenter="viewMarkerHover(i)" @mouseleave="viewMarkerHover(-1)">
        <a class="map-icon mark-icon bus" :class="{ hover: clickIndex === i || hoverIndex === i }">{{ i + 1 }}</a>
        <div class="mark-tip" v-show="clickIndex !== i && hoverIndex === i " :class="{ addr: ds.address }">
            <div class="title1">
                <span>{{ ds.title }}</span>
                <b>{{ ds.distance }}米</b>
            </div>
            <div class="map_address">{{ ds.address }}</div>
        </div>
    </div>
</template>

<script>
import map from '@/api/map';
import { mapState, mapMutations } from 'vuex';
import { VIEW_MARKER_HOVER, VIEW_MARKER_CLICK, VIEW_BUILDING_CHANGE } from '../store/mutation-types';
export default {
    name: 'aroundMarker',
    props: ['ds', 'i'],
    computed: {
        ...mapState({
            'hoverIndex': state => state.marker.hover,
            'clickIndex': state => state.marker.click
        })
    },
    methods: {
        buildingChange(building, index) {
            let pixel = map.getCardPosition(building);
            building.pixel = pixel;

            this.viewBuildingChange(building);
            this.viewMarkerClick(index);
        },
        ...mapMutations({
            'viewMarkerHover': VIEW_MARKER_HOVER,
            'viewMarkerClick': VIEW_MARKER_CLICK,
            'viewBuildingChange': VIEW_BUILDING_CHANGE
        })
    },
    watch: {
        ds() {
            const { lng, lat } = this.ds;
            map.addRichMarker(this.$el, {
                lng: lng,
                lat: lat
            });
        }
    },
    data(){
        return {
            show: false
        }
    },
    created() {
        this.$nextTick(() => {
            const { lng, lat } = this.ds;
            map.addRichMarker(this.$el, {
                lng: lng,
                lat: lat
            });
        });
    }
}
</script>

<style>
.mark-icon-box {
    width: 24px;
    height: 30px;
    position: absolute;
    z-index: 98;
}

.mark-icon-box .mark-icon {
    width: 23px;
    height: 30px;
    display: block;
    cursor: pointer;
    font-size: 14px;
    color: #fff;
    font-weight: bold;
    text-align: center;
    line-height: 24px;
    background: url(../assets/img/dw01.png) no-repeat;
}

.mark-icon-box .mark-icon.hover {
    background: url(../assets/img/dw02.png) no-repeat;
}

.mark-tip {
    font-size: 14px;
    position: absolute;
    z-index: 99;
    margin-top: -62px;
    margin-left: -20px;
    background: #fff;
    padding: 5px 40px 5px 15px;
    border-radius: 5px;
    box-shadow: 3px 3px 8px #888;
}

.mark-tip.addr {
    margin-top: -85px;
}

.mark-tip .title1 {
    line-height: 20px;
    color: #000;
    height: 20px;
    background: none;
    box-shadow: none;
    padding: 0;
}

.mark-tip .title1 span {
    display: inline-block;
    max-width: 170px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 25px;
}

.mark-tip .title1 b {
    font-weight: normal;
    display: block;
    position: absolute;
    top: 5px;
    right: 10px;
}

.mark-tip .map_address {
    white-space: nowrap;
    color: #999!important;
    font-size: 12px;
}
</style>