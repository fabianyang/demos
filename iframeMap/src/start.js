// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './mapConfig.js';
import Vue from 'vue';
import app from './app';
import store from './store';

// import BaiduMap from './vue-baidu-map';
// Vue.use(BaiduMap);

// that.map = new MapApi('mapObj', cityy, cityx, zoom, {minZoom: 12});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#map_main',
    template: '<app/>',
    store,
    components: {
        app
    }
});
