<template>
    <div class="zuixiaohua" v-on:click="appMax">
        <span class="num" v-if="recent">{{ recent }}</span>
        <span class="im_closed" @click.stop="closed">x</span>
        <span>天下聊</span>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import { VIEW_STATE_CHANGE } from '../store/mutation-types';

export default {
    name: 'min-im',
    computed: mapState({
        recent: state => state.recent.notice
    }),
    methods: {
        appMax() {
            this.stateChange(['right', 'notice']);
            this.stateChange(['app', 'max']);
        },
        closed() {
            this.stateChange(['app', 'closed']);
        },
        ...mapMutations({
            'stateChange': VIEW_STATE_CHANGE // 映射 this.add() 为 this.$store.commit('increment')
        })
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
div,
span {
    box-sizing: border-box;
}

div,
span {
    margin: 0;
    padding: 0;
    border: 0;
}
/* 最小化 */

.zuixiaohua {
    width: 60px;
    height: 60px;
    color: #fff;
    font-size: 12px;
    padding-top: 35px;
    padding-left: 15px; // background: url(../assets/images/icon-talk.png) no-repeat 28px 22px;
    background: url(../assets/images/icon-talk.png) no-repeat 20px 10px;
    background-color: #ed5252;
    position: fixed;
    bottom: 50%;
    right: 0;
    cursor: pointer; // border-top-left-radius: 50%;
}

.zuixiaohua .num {
    position: absolute;
    top: 5px;
    left: 45px;
}

.zuixiaohua .im_closed {
    position: absolute;
    top: -16px;
    color: #fff;
    width: 15px;
    height: 15px;
    z-index: 1000;
    left: 45px;
    background: #ddd;
    text-align: center;
    border-radius: 10px;
    font-weight: bold;
    line-height: 14px;
}
</style>
