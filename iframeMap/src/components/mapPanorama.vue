<template>
    <div class="map_container"></div>
</template>

<script>
import map from '@/api/map';
let vars = global.FangMap.vars;

export default {
    name: 'mapPanorama',
    created() {
        this.$nextTick(() => {
            map.createPanorama(this.$el, vars.mainBuilding);
        });
    }
}
</script>

<style scoped>
.map_container {
    height: 460px;
}
</style>

