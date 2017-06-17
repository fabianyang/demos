// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import app from './app';
import store from './store';
import events from './events';
import controller from './controller';
import socket from './socket';

// document.domain = 'fang.com';
// require('./controller');
// require('./socket');
// require('./css/global.css');

// global.fangwebim = {
//     data: {}
// };

// import socket from './socket';


// // var events = require('events');
// let opts = {
//     extraHeaders: {
//         imeinew: '98:5A:EB:CA:CF:D2',
//         city: '%E5%8C%97%E4%BA%AC',
//         'Sec-WebSocket-Protocol': 'A253BAE1BD01CAEDD4E2A123A4909DDD',
//         username: 'oa%3A184241',
//         clienttype: 'web'
//     }
// };
// var socket = window.io.connect('ws://124.251.46.69:9999/chat', {
//     query: 'foo=bar'
// });
// console.log(opts);
// var socket = require('engine.io-client')('ws://124.251.46.69:9999/chat', opts);

// let socket = new WebSocket('ws://124.251.46.69:9999/chat?imeinew=98:5A:EB:CA:CF:D2&city=%E5%8C%97%E4%BA%AC&username=oa%3A184241&clienttype=web', 'A253BAE1BD01CAEDD4E2A123A4909DDD')
// let username = '&#x6768;&#x65ED;&#x4E1C;';
// let username = encodeURIComponent('杨旭东');
// let username = '\u6768\u65ed\u4e1c';

// 正在连接。。。
// let socket = new WebSocket('ws://124.251.46.69:9999/chat', 'A253BAE1BD01CAEDD4E2A123A4909DDD');
// let socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');


// socket.send({
//     imeinew: '98:5A:EB:CA:CF:D2',
//     city: '%E5%8C%97%E4%BA%AC',
//     'Sec-WebSocket-Protocol': 'A253BAE1BD01CAEDD4E2A123A4909DDD',
//     username: 'oa%3A184241',
//     clienttype: 'web'
// });

// setInterval(function () {
//     switch (socket.readyState) {
//         case WebSocket.CONNECTING:
//             console.log('WebSocket.CONNECTING');
//             break;
//         case WebSocket.OPEN:
//             console.log('WebSocket.OPEN');
//             break;
//         case WebSocket.CLOSING:
//             console.log('WebSocket.CLOSING');
//             break;
//         case WebSocket.CLOSED:
//             console.log('WebSocket.CLOSED');
//             break;
//         default:
//             // this never happens
//             break;
//     }
// }, 10);

// socket.onopen = function (event) {
//     console.log('Socket has been opened');
//     console.log(event);
//     // socket.send({ "form":"oa:184241","sendto":"","message":"","type":"web","clienttype":"oa","command":"getgrouplist"});
// };

// socket.onmessage = function (msg) {
//     console.log(msg.data);
// };

// socket.onclose = function (event) {
//     console.log('Socket has been closed');
//     var code = event.code;
//     var reason = event.reason;
//     var wasClean = event.wasClean;
//     // handle close event
//     console.log(code, reason, wasClean);
// };


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
