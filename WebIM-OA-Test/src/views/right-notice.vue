<template>
    <div class="fbconr">
        <!-- 搜索框组件 -->
        <right-title></right-title>
        <div class="listcon">
            <!-- 消息列表组件，会有多个 -->
            <right-list signame="im_notice" title="通知" v-if="notice.length" :list="notice" :info="info_user"></right-list>
            <right-list signame="im_notice_single" title="单聊" v-if="single.length" :list="single" :info="info_user">></right-list>
            <right-list signame="im_notice_group" title="群聊" v-if="group.length" :list="group" :info="info_group">></right-list>
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
        name: 'right-notice',
        components: {
            rightTitle,
            rightList,
            rightSwitch
        },
        computed: mapState({
            // 箭头函数可使代码更简练
            single: state => state.view_notice_single,
            group: state => state.view_notice_group,
            info_user: state => state.info_user,
            info_group: state => state.info_group,
            notice: state => state.view_notice,
        }),
        data() {
            return {
                info_notice: {},
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