// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import app from './app';
import store from './store';
import events from './events';
import controller from './controller';
import socket from './socket';

let body = document.body;
let div = document.createElement('div');
div.id = 'fang-oa-im';
// div.innerHTML = "新元素";
body.appendChild(div);

// 关闭生产环境提示
Vue.config.productionTip = false;

let vab = '你好';

new Vue({
    name: vab,
    el: '#fang-oa-im',
    template: '<app/>',
    store,
    components: {
        app
    }
});
