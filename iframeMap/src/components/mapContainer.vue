<template>
  <div class="map_container">
      <building-marker v-if="dsBuilding" :ds="dsBuilding"></building-marker>
      <around-marker v-for="(value, index) in markers" :key="index" :ds="value" :i="+index"></around-marker>
  </div>
</template>

<script>
import map from '@/api/map';
import { mapState, mapGetters, mapActions } from 'vuex';
import buildingMarker from './buildingMarker';
import aroundMarker from './aroundMarker';

let vars = global.FangMap.vars;

export default {
  name: 'mapContainer',
  components: {
    buildingMarker,
    aroundMarker
  },
  computed: {
    ...mapState({
      markers: state => state.dsAroundMarkers
    })
  },
  data() {
    return {
      dsBuilding: null
    }
  },
  created() {
    this.$nextTick(() => {
      let {lng, lat} = vars.mainBuilding;
      map.create(this.$el, {
        lng: lng,
        lat: lat
      });
      // ie bug 必须要在地图渲染完成后再渲染标点。
      this.dsBuilding = vars.mainBuilding;

      // map.getCardPosition({});
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.map_container {
  height: 460px;
  width: 100%;
  overflow: hidden;
  position: relative;
  z-index: 0;
  background-color: rgb(243, 241, 236);
  color: rgb(0, 0, 0);
  text-align: left;
}
</style>
