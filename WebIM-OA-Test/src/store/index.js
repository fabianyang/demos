import Vue from 'vue';
import Vuex from 'vuex';
import view from './modules/view';
import socket from './modules/socket';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    // actions,
    modules: {
        view,
        socket
    },
    strict: debug
});
