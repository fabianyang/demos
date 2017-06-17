<template>
    <div class="zuixiaohua" v-on:click="stateChange(['app', 'max'])">
        <span class="num" v-if="recent">{{ recent }}</span>
        <span>天下聊</span>
    </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import { VIEW_STATE_CHANGE } from '../store/mutation-types';

    export default {
        name: 'min-im',
        computed: {
            ...mapState({
                recent: state => state.recent.notice
            })
        },
        methods: {
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
        width: 140px;
        height: 140px;
        color: #fff;
        font-size: 12px;
        padding-top: 47px;
        padding-left: 21px;
        background: url(../assets/images/icon-talk.png) no-repeat 28px 22px;
        background-color: #ed5252;
        position: fixed;
        bottom: -70px;
        right: -70px;
        cursor: pointer;
        border-top-left-radius: 50%;
    }

    .zuixiaohua .num {
        position: absolute;
        top: 14px;
        left: 47px;
    }
</style>
