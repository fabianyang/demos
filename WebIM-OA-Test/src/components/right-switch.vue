<template>
    <div class="bottom clearfix unselectable" v-show="rightState !== 'search'">
        <!-- 新消息红点添加 new2 -->
        <!-- 选中状态添加 cur -->
        <div class="message" :class="{ cur: rightState === 'notice', new2: recent_notice }" @click="stateChange(['right', 'notice'])">消息</div>
        <div class="contacts" :class="{ cur: rightState === 'book', new2: recent_book }" @click="stateChange(['right', 'book'])">通讯录</div>
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import { VIEW_STATE_CHANGE } from '../store/mutation-types';

    export default {
        name: 'right-switch',
        computed: mapState({
            // 箭头函数可使代码更简练
            rightState: state => state.right,
            recent_book: state => state.recent.book,
            recent_notice: state => state.recent.notice
        }),
        methods: mapMutations({
            'stateChange': VIEW_STATE_CHANGE // 映射 this.add() 为 this.$store.commit('increment')
        }),
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<style lang="scss" scoped>
    div {
        box-sizing: border-box;
    }

    div {
        margin: 0;
        padding: 0;
        border: 0;
    }
    /* 消息 通讯录 */

    .bottom {
        width: 240px;
        height: 40px;
    }

    .bottom .message,
    .bottom .contacts {
        width: 120px;
        height: 40px;
        line-height: 40px;
        color: #7d7d7d;
        background-color: #333;
        background-repeat: no-repeat;
        cursor: pointer;
        float: left;
        position: relative;
    }

    .bottom .message {
        padding-left: 55px;
        background-image: url(../assets/images/icon-message.png);
        background-position: 31px center;
    }

    .bottom .message.cur {
        color: #fff;
        background-image: url(../assets/images/icon-message2.png);
    }

    .bottom .contacts {
        padding-left: 48px;
        background-image: url(../assets/images/icon-contacts.png);
        background-position: 25px center;
    }

    .bottom .contacts.cur {
        color: #fff;
        background-image: url(../assets/images/icon-contacts2.png);
    }

    /* 新消息红点 */

    .new2:after {
        content: "";
        width: 8px;
        height: 8px;
        background: #e01818;
        border-radius: 50%;
        position: absolute;
        left: 41px;
        top: 9px;
    }
</style>