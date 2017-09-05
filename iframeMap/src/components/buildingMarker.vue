<template>
    <div class="place_map" @click="buildingChange">
        <div class="place_map_title">{{ ds.title }}</div>
        <i></i>
    </div>
</template>

<script>
import map from '@/api/map';
import { mapMutations } from 'vuex';
import { VIEW_BUILDING_CHANGE } from '@/store/mutation-types';

export default {
    name: 'buildingMarker',
    props: ['ds'],
    methods: {
        buildingChange() {
            let building = this.ds;
            let pixel = map.getCardPosition(building);
            building.pixel = pixel;

            this.viewBuildingChange(building);
        },
        ...mapMutations({
            'viewBuildingChange': VIEW_BUILDING_CHANGE
        })
    },
    created() {
        this.$nextTick(() => {
            const { lng, lat } = this.ds;
            map.addRichMarker(this.$el, {
                lng: lng,
                lat: lat,
                anchor: {
                    x: -(48 + 15),
                    y: -17
                }
            });
        });
    }
}
</script>

<style>
.place_map {
    background: url(../assets/img/bg_map_ts_03.png) repeat;
    border-radius: 3px;
    height: 34px;
    line-height: 34px;
    padding: 0 15px;
    font-size: 16px;
    color: #FFFFFF;
    white-space: nowrap;
    position: absolute;
}

.place_map i {
    background: url(../assets/img/arr_map2_03.png) no-repeat;
    position: absolute;
    left: 45%;
    top: 34px;
    width: 13px;
    height: 8px;
}
</style>