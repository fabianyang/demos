<template>
  <div class="loudong tf" :style="{width: width + 'px', height: height + 'px'}" :id="prick">
    <!-- 大导航 -->
    <top-navigator v-if="!nohead" :panorama="have_panorama"></top-navigator>
    <!--周边配套-->
    <div class="rightcons" v-show="view === 'main'" :style="{width: width + 'px', height: height - 64 + 'px'}">
      <div class="ld_nei">
        <div class="map_area">
          <div class="map_tip" v-if="dsBuildingCard" :style="{left: dsBuildingCard.pixel.x + 'px', top: dsBuildingCard.pixel.y + 'px'}">
            <building-card :ds="dsBuildingCard"></building-card>
          </div>
          <map-container :style="{height: height - 64 + 'px'}"></map-container>

          <div class="map_zhishi" :style="{height: height - 64 - 48 + 'px'}">
              <div class="tou1" id="typeTab">
                  <span v-for="(title, index) in mainTab_list" :key="index" :class="{ on: tab_index === index }" @click="mainTabChange(index, title)">{{ title.text }}</span>
              </div>

              <div class="xinxi" v-if="!tool">
                <div class="map_lp" v-for="(title, index) in mainTab_list" :key="index">
                  <tab-panel v-if="tab_index === index" :height="height - 64 - 48" :ds="ds_tab_panel(title.key)" :tab="subTab[title.key]" :title="title"></tab-panel>
                </div>
              </div>
              <div class="xinxi" v-if="tool">
                  <traffic-panel :height="height - 64 - 48"></traffic-panel>
              </div>
          </div>
        </div>
      </div>
    </div>
    <!--街景地图-->
    <div class="rightcons" v-if="have_panorama" v-show="view === 'panorama'" :style="{width: width + 'px', height: height - 64 + 'px'}">
      <map-panorama></map-panorama>
    </div>
  </div>
</template>

<script>
import map from '@/api/map';
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import { VIEW_MAINTAB_CHANGE, VIEW_AROUND_CHANGE, VIEW_XIANWU_CHANGE } from './store/mutation-types';
import topNavigator from './components/topNavigator';
import tabPanel from './components/tabPanel';
import trafficPanel from './components/trafficPanel';
import mapContainer from './components/mapContainer';
import mapPanorama from './components/mapPanorama';
import buildingCard from './components/buildingCard';

let vars = global.FangMap.vars,
  functions = global.FangMap.functions;

let createTabList = () => {
    if (vars.city_en !== 'bj') {
      return [{
        key: 'around',
        text: vars.esf ? '小区' : '楼盘'
      }, {
        key: 'traffic',
        text: '交通'
      }, {
        key: 'business',
        text: '商业'
      }, {
        key: 'school',
        text: '学校'
      }, {
        key: 'hospital',
        text: '医院'
      }, {
        key: 'xianwu',
        text: '嫌恶'
      }]
    } else {
      return [{
        key: 'around',
        text: vars.esf ? '小区' : '楼盘'
      }, {
        key: 'traffic',
        text: '交通'
      }, {
        key: 'business',
        text: '商业'
      }, {
        key: 'hospital',
        text: '医院'
      }, {
        key: 'xianwu',
        text: '嫌恶'
      }]
    }
};

export default {
  name: 'app',
  components: {
    topNavigator,
    tabPanel,
    trafficPanel,
    mapContainer,
    mapPanorama,
    buildingCard
  },
  computed: {
    ...mapState([
      'view',
      'tool',
      'around',
      'traffic',
      'business',
      'school',
      'hospital',
      'xianwu'
    ]),
    ...mapState({
      subTab: state => state.subTab,
      dsBuildingCard: state => state.dsBuildingCard,
    })
  },
  methods: {
    ...mapActions([
      'getAroundBuilding',
      'getLocalSearchBuilding',
      'getDisgustBuilding'
    ]),
    ...mapMutations({
        'viewMainTabChange': VIEW_MAINTAB_CHANGE,
        'viewAroundChange': VIEW_AROUND_CHANGE,
        'viewXianwuChange': VIEW_XIANWU_CHANGE,
    }),
    ds_tab_panel(key) {
      return this[key];
    },
    mainTabChange(index, title) {
      this.tab_index = index;
      if (this.tool) {
        map.setZoom();
        map.setCenter(vars.mainBuilding);
        map.clearSearch(this.tool);
      }
      this.viewMainTabChange(title);
      if (title.key === 'around') {
        this.viewAroundChange();
      } else if (title.key === 'xianwu') {
        this.viewXianwuChange();
      } else {
        this.getLocalSearchBuilding(title);
      }
    }
  },
  data() {
    return {
      mainTab_list: createTabList(),
      tab_index: 0,
      width: vars.windowWidth,
      height: vars.windowHeight,
      nohead: vars.nohead,
      prick: vars.prick.app,
      have_panorama: false
    }
  },
  created() {
    let building = vars.mainBuilding;
    map.getPanoramaByLocation(building, (data) => {
      if (data) {
        this.have_panorama = true;
      }
    });
    this.getAroundBuilding();
    this.getDisgustBuilding();
  }
}
</script>

<style>
div,
ul,
li,
a,
span,
dl,
dt,
dd {
  margin: 0;
  padding: 0;
  outline: none;
}

a {
  text-decoration: none!important;
  color: #333;
}

ul {
  list-style: none;
}

.clear {
  clear: both;
  height: 0px;
  font-size: 0px;
  visibility: hidden;
  line-height: 0px;
}

.clearfix {
  zoom: 1;
}
</style>

<style scoped>
.loudong {
  box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
  -moz-box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
  font: 12px/22px Arial, "\5B8B\4F53", "SimSun", HELVETICA, "Hiragino Sans GB";
  color: #333
}

.tf {
  font-family: "\5FAE\8F6F\96C5\9ED1", 微软雅黑, "Microsoft Yahei", 雅黑\9, Arial;
  margin: 0 auto;
}

.ld_nei {
  overflow: hidden;
}

.map_area {
  position: relative;
  width: 100%;
}

.map_tip {
  position: absolute;
  z-index: 1001;
  visibility: visible;
  opacity: 1;
  display: block;
}

.map_zhishi {
    position: absolute;
    z-index: 1;
    width: 380px;
    height: 412px;
    background: #FFFFFF;
    box-shadow: 0 0px 6px rgba(0,0,0,.3);
    -moz-box-shadow: 0 0px 6px rgba(0,0,0,.3);
    -webkit-box-shadow: 0 0px 6px rgba(0,0,0,.3);
    top: 24px;
    right: 20px;
}

.map_zhishi .tou1 {
    height: 39px;
    line-height: 39px;
    width: 380px;
    background-color: #f2f2f2;
    font-size: 20px;
    color: #666;
    border-bottom: 2px solid #ff3333;
    position: relative;
}

.tou1 span {
    display: inline-block;
    width: 16%;
    text-align: center;
    height: 100%;
    font-size: 14px;
    cursor: pointer;
}

.tou1 span.on {
    background-color: #ff3333;
    color: #FFFFFF;
}

</style>
