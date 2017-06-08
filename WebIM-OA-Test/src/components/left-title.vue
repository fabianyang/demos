<template>
    <div class="fbconltit">
        <span v-text="chatWindow.title">杨庆（产品组／工作台和账号中心）</span>
        <a class="flor grey" v-text="chatWindow.email" v-show="chatWindow.email">yangqing.bj@fang.com</a>
        <a class="close" @click="stateChange(['left', 'close'])"></a>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { VIEW_STATE_CHANGE } from '../store/mutations';

export default {
    name: 'left-title',
    computed: mapState({
        chatWindow: state => state.view.chatWindow
    }),
    methods: {
        ...mapMutations({
            'stateChange': VIEW_STATE_CHANGE
        })
    },
    data() {
        return {
            msg: 'Welcome to Your Vue.js App'
        }
    }
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