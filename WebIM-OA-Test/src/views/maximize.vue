<template>
    <div class="fbbox boxShadow clearfix">
        <!-- 左侧聊天视图 -->
        <left-chat v-show="leftState === 'chat'"></left-chat>
        <!-- 左侧通知视图 -->
        <left-notice v-show="leftState === 'notice'"></left-notice>

        <!-- 右侧视图 -->
        <right></right>
    </div>
</template>

<script>
// <notice></notice>
// <chat></chat>
import { mapState, mapMutations } from 'vuex';
import { VIEW_STATE_CHANGE } from '../store/mutation-types';
import leftChat from './left-chat';
import leftNotice from './left-notice';
import right from './right';

export default {
    name: 'max-im',
    components: {
        leftChat,
        leftNotice,
        right
    },
    computed: {
        ...mapState({
            // 箭头函数可使代码更简练
            leftState: state => state.left,
            rightState: state => state.right,
            info: state => state.info
        })
    },
    methods: {
        ...mapMutations({
            'stateChange': VIEW_STATE_CHANGE // 映射 this.add() 为 this.$store.commit('increment')
        })
    },
    data() {
        return {
            msg: 'Welcome to Your Vue.js App'
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
div {
    box-sizing: border-box;
}

div {
    margin: 0;
    padding: 0;
    border: 0;
}

.boxShadow {
    box-shadow: 0 0 5px 2px rgba(0, 0, 0, .1);
}

.fbbox {
    font-family: "Microsoft Yahei";
    margin: 0 auto;
    padding: 0;
    font-size: 12px;
    color: #333;
}

.fbbox {
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 10000;
}
</style>
