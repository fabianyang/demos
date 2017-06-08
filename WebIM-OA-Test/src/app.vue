<template>
    <div id="app">
        <img src="./assets/logo.png">
        <!-- 窗口最大化 -->
        <max-view v-show="appState === 'max'"></max-view>
        <!-- 窗口最小化 -->
        <min-view v-show="!info && appState === 'min'"></min-view>
        <!-- 消息通知 -->
        <info-view v-show="info"></info-view>
    </div>
</template>

<script>
// <hello></hello>
// import Hello from './components/Hello'
import { mapState } from 'vuex';
import maxView from './views/maximize'
import minView from './views/minimize'
import infoView from './views/information'

export default {
    name: 'app',
    components: {
        maxView,
        minView,
        infoView
    },
    computed: mapState({
        // 箭头函数可使代码更简练
        appState: state => state.view.app,
        info: state => state.view.info
    })
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
/* 排除顶部全局标签样式，单独引入到各个 view/component style scope 中，因为可能会影响页面的样式 */


/* common */

.clearfix:after {
    clear: both;
    content: "\200B";
    display: block;
    height: 0;
}

.clearfix {
    *zoom: 1;
}

.clear {
    clear: both;
    font-size: 0;
    height: 0;
    line-height: 0;
    overflow: hidden;
}

.flol {
    float: left;
}

.flor {
    float: right;
}

.hide {
    display: none!important;
}

.show {
    display: block!important;
}


.unselectable {
    -moz-user-select: -moz-none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    /*
     Introduced in IE 10.
     See http://ie.microsoft.com/testdrive/HTML5/msUserSelect/
   */
    -ms-user-select: none;
    user-select: none;
}

</style>
