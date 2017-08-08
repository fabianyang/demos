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

window.FangChat.textarea = (function () {
    let element = null;
    return () => {
        if (!element) {
            element = document.getElementById('im_chatarea');
        }
        return element;
    };
})();

// 关闭生产环境提示
Vue.config.productionTip = false;

new Vue({
    el: '#fang-oa-im',
    template: '<app/>',
    store,
    components: {
        app
    }
});
