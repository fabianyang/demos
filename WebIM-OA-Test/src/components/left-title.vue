<template>
    <div class="fbconltit">
        <span>{{ leftWindow.nickname + (leftWindow.department || leftWindow.number)}}</span>
        <a class="flor grey" v-text="leftWindow.email" v-show="leftWindow.email">yangqing.bj@fang.com</a>
        <a class="close" @click="stateChange(['left', 'close'])"></a>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { VIEW_STATE_CHANGE } from '../store/mutation-types';

export default {
    name: 'left-title',
    computed: mapState({
        leftWindow: state => state.leftWindow
    }),
    methods: mapMutations({
        'stateChange': VIEW_STATE_CHANGE
    })
}
</script>

<style lang="scss" scoped>
div,
span,
a {
    box-sizing: border-box;
}

div,
a {
    margin: 0;
    padding: 0;
    border: 0;
}

a {
    color: #333;
    text-decoration: none;
}

a:hover {
    color: #333;
    cursor: pointer;
}

.grey {
    color: #999;
}


/* 姓名 */

.fbconltit {
    width: 510px;
    height: 52px;
    background: #f7f7f7;
    line-height: 52px;
    font-size: 14px;
    border-bottom: 1px solid #e5e5e5;
    padding-left: 16px;
    padding-right: 37px;
    position: relative;
}

.fbconltit .close {
    width: 12px;
    height: 12px;
    background: url(../assets/images/icon-close.png) no-repeat;
    position: absolute;
    top: 20px;
    right: 16px;
    z-index: 999;
    cursor: pointer;
}
</style>