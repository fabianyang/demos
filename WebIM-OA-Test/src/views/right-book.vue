<template>
    <div class="fbconr">
        <!-- 搜索框组件 -->
        <right-title></right-title>
        <div class="listcon">
            <!-- 消息列表组件，会有多个 -->
            <right-list title="好友" v-if="buddy.length" type="single" :list="buddy"></right-list>
            <right-list title="群聊" v-if="group.length" type="group" :list="group"></right-list>
            <right-list title="直接上下级" v-if="false" type="single"></right-list>
            <right-list title="部门同事" v-if="false" type="single"></right-list>
            <right-list title="特别关注" v-if="follow.length" type="single" :list="fllow"></right-list>
        </div>
        <!-- 右下角搜索和通讯录切换面板 -->
        <right-switch></right-switch>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import rightTitle from '../components/right-title';
    import rightList from '../components/right-list';
    import rightSwitch from '../components/right-switch';

    export default {
        name: 'right-book',
        components: {
            rightTitle,
            rightList,
            rightSwitch
        },
        computed: {
            // group() {
            //     // console.log(this.groupInfo);
            //     return {
            //         list: this.groupList,
            //         info: this.groupInfo
            //     }
            // },
            // buddy() {
            //     return {
            //         list: this.buddyList,
            //         info: this.buddyInfo
            //     }
            // },
            ...mapState({
                // 箭头函数可使代码更简练
                buddy: state => state.socket.buddy,
                group: state => state.socket.group,
                follow: state => state.socket.follow,
            })
        },
        data() {
            return {
                msg: ''
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


    /* 右侧列表 */

    .fbconr {
        width: 240px;
        height: 550px;
        background: #eee;
        position: relative;
        right: 0px;
        top: 0px;
        float: right;
    }


    /* 姓名列表 */

    .fbconr .listcon {
        width: 240px;
        height: 458px;
        color: #333;
        overflow-y: auto;
    }
</style>