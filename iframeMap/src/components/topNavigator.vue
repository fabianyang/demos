<template>
  <div class="bigtit modify">
    <ul class="change_map">
      <li @click="viewChange('main')" :class="{ hover: view === 'main' }">周边配套</li>
      <li v-if="panorama" @click="viewChange('panorama')" :class="{ hover: view === 'panorama' }">街景地图</li>
    </ul>
    <!--地图板块按钮-->
    <div class="icon_menu" id="icon_menu">
      <a class="i1" @click="toggleScreen">{{ fullStatus ? '取消全屏': '全屏' }}</a>
      <a v-if="esf" :href="'http://esf' + (city_en !== 'bj' ? '.' + city_en : '') + '.fang.com/map/'" target="_blank" class="i2">{{ city_cn }}小区地图</a>
      <a v-else :href="'http://newhouse' + (city_en !== 'bj' ? '.' + city_en : '') + '.fang.com/house/s/list/'" target="_blank" class="i2">{{ city_cn }}楼盘地图</a>
      <a class="i3" @click="toolChange('meter')">测距</a>
      <a class="i4" @click="toolChange('transit')">公交</a>
      <a class="i5" @click="toolChange('driving')">驾车</a>
    </div>
  </div>
</template>

<script>
import map from '@/api/map';
import { mapState, mapMutations } from 'vuex';
import { VIEW_TOPNAV_CHANGE, VIEW_TOOL_CHANGE } from '../store/mutation-types';

let vars = window.FangMap.vars;

export default {
  name: 'topNavigator',
  props: ['panorama'],
  computed: {
    ...mapState([
      'view'
    ])
  },
  methods: {
    toggleScreen() {
        var pParent = window.parent;
        if (!this.fullStatus) {
            pParent.callMapFullScreen();
        } else {
            pParent.cancelMapFullScreen();
        }
    },
    toolChange(key) {
      if (key !== 'meter') {
        map.setZoom();
        map.setCenter(vars.mainBuilding);
        map.clearSearch(this.tool);
      } else {
        map.openDistanceTool();
      }

      this.viewToolChange(key);
    },
    ...mapMutations({
        'viewToolChange': VIEW_TOOL_CHANGE,
        'viewChange': VIEW_TOPNAV_CHANGE
    })
  },
  data() {
    return {
      fullStatus: vars.fullStatus,
      city_en: vars.city_en,
      city_cn: vars.city_cn,
      esf: vars.esf ? 1 : 0
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bigtit {
    background-color: #f8f8f8;
    height: 62px;
    line-height: 62px;
    font-size: 20px;
    color: #000;
    padding-left: 30px;
    border-bottom: 1px solid #e4e4e4;
    font-weight: bold;
}

.modify {
    padding-left: 0;
    height: 63px;
}

.bigtit .change_map {
  float: left;
}

.bigtit .change_map li {
    float: left;
    font-size: 20px;
    padding: 0 30px;
    cursor: pointer;
}

.bigtit .change_map li.hover {
    color: #ff3333;
    border-bottom: 2px solid #ff3333;
}

.icon_menu {
    float: right;
    font-size: 14px;
    padding-right: 30px;
}

.bigtit .icon_menu a {
    font-weight: normal;
}

.icon_menu a {
    margin-left: 10px;
    padding-left: 18px;
    background: url(../assets/img/icon_menu.gif) no-repeat;
}

.icon_menu a:hover{ background:url(../assets/img/icon_menu_hover.gif) no-repeat; color:#c00; text-decoration:none; cursor: pointer}
.icon_menu .i1,.icon_menu .i1:hover{ background-position:0 0;}
.icon_menu .i2,.icon_menu .i2:hover{ background-position:0 -16px;}
.icon_menu .i3,.icon_menu .i3:hover{ background-position:0 -32px;}
.icon_menu .i4,.icon_menu .i4:hover{ background-position:0 -48px;}
.icon_menu .i5,.icon_menu .i5:hover{ background-position:0 -64px;}



</style>
