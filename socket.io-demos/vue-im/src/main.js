import Vue from 'vue';
// import App from './App';
import VueRouter from 'vue-router';
import LoginForm from './components/loginform';
import User from './components/user';
import AliveList from './components/alivelist';
import Account from './components/account';
import UserList from './components/userlist';
import New from './components/new';
import Talk from './components/talk';
import Noconnect from './components/noconnect';
import Noperson from './components/noperson';
import Info from './components/info';
import Confirm from './components/confirm';
// import './public/js/jquery.form.min.js';
// import './public/js/jquery.min.js';
// 定义组件
Vue.use(VueRouter);

var routes = [{
    path: '/',
    component: LoginForm
// }, {
//     path: '/confirm',
//     component: Confirm
// }, {
//     path: '/user',
//     component: User
// }, {
//     path: '/user/alivelist',
//     component: AliveList
// }, {
//     path: '/user/alivelist/talk',
//     component: Talk
// }, {
//     path: '/user/alivelist//noperson',
//     component: Noperson
// }, {
//     path: '/user/alivelist//info',
//     component: Info
// }, {
//     path: '/user/account',
//     component: Account
// }, {
//     path: '/user/userlist',
//     component: UserList
// }, {
//     path: '/user/userlist/talk',
//     component: Talk
// }, {
//     path: '/user/userlist/noconnect',
//     component: Noconnect
// }, {
//     path: '/user/new',
//     component: New
}];
// router.map({
// });
// router.start(App, '#app');

let router = new VueRouter({
    mode: 'history',
    routes: routes
});

// 创建根实例
let app = new Vue({
    template: '<router-view></router-view>',
    router: router
}).$mount('#app');

// new Vue({
//     el: '#app',
//     template: '<app/>',
//     components: {
//         App
//     }
// });

// new Vue({
//     el: '#app',
//     router
// }).$mount('#app');
