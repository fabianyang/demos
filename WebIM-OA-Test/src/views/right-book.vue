<template>
    <div class="fbconr">
        <!-- 搜索框组件 -->
        <right-title></right-title>
        <div class="listcon">
            <!-- 消息列表组件，会有多个 -->
            <right-list signame="im_book_buddy" title="好友" v-if="list_buddy.length" :list="list_buddy" :info="info_buddy"></right-list>
            <right-list signame="im_book_group" title="群聊" v-if="list_group.length" :list="list_group" :info="info_group"></right-list>
            <right-list signame="im_book_manager" title="直接上下级" v-if="list_manager.length" :list="list_manager" :info="info_buddy"></right-list>
            <right-list signame="im_book_mate" title="部门同事" v-if="list_mate.length" :list="list_mate" :info="info_buddy"></right-list>
            <right-list signame="im_book_follow" title="特别关注" v-if="follow.length" :list="follow" :info="info_buddy"></right-list>
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
                list_buddy: state => state.list_buddy,
                list_manager: state => state.list_manager,
                list_mate: state => state.list_mate,
                info_buddy: state => state.info_buddy,
                list_group: state => state.list_group,
                info_group: state => state.info_group,
                follow: state => state.follow,
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