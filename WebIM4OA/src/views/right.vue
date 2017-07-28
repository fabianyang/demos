<template>
    <div class="fbconr" :style="{ height: changeHeight ? '412px' : '550px' }">
        <!-- 搜索框组件 -->
        <right-title></right-title>
        <div class="listcon" v-if="rightState === 'notice'" :style="{ height: changeHeight ? '320px' : '458px' }">
            <!-- 消息列表组件，会有多个 -->
            <right-list signame="im_notice" title="通知" :list="notice" :info="info_user"></right-list>
            <right-list signame="im_notice_single" title="单聊" :list="single" :info="info_user">></right-list>
            <right-list signame="im_notice_group" title="群聊" :list="group" :info="info_group">></right-list>
        </div>
        <div class="listcon" v-if="rightState === 'book'" :style="{ height: changeHeight ? '320px' : '458px' }">
            <!-- 消息列表组件，会有多个 -->
            <right-list signame="im_book_buddy" title="好友" :list="self_buddy" :info="info_user"></right-list>
            <right-list signame="im_book_group" title="群聊" :list="list_group" :info="info_group"></right-list>
            <right-list signame="im_book_manager" title="直接上下级" :list="list_manager" :info="info_user"></right-list>
            <right-list signame="im_book_mate" title="部门同事" :list="list_mate" :info="info_user"></right-list>
            <right-list signame="im_book_follow" title="特别关注" :list="list_follow" :info="info_user"></right-list>
        </div>
        <!-- 搜索结果组件 -->
        <right-search-result v-if="rightState === 'search'"></right-search-result>
        <!-- 右下角搜索和通讯录切换面板 -->
        <right-switch v-show="rightState !== 'search'"></right-switch>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import rightTitle from '../components/right-title';
    import rightList from '../components/right-list';
    import rightSwitch from '../components/right-switch';
    import rightSearchResult from '../components/right-search-result';

    let config = window.FangChat.config;

    export default {
        name: 'right-notice',
        components: {
            rightTitle,
            rightList,
            rightSwitch,
            rightSearchResult
        },
        computed: {
            self_buddy() {
                return [config.username].concat(this.list_buddy);
            },
            ...mapGetters({
                list_buddy: 'sort_list_buddy',
                list_manager: 'sort_list_manager',
                list_mate: 'sort_list_mate',
                list_group: 'sort_list_group',
                list_follow: 'sort_list_follow',
            }),
            ...mapState({
                // 箭头函数可使代码更简练
                rightState: state => state.right,
                single: state => state.view_notice_single,
                group: state => state.view_notice_group,
                notice: state => state.view_notice,
                info_user: state => state.info_user,
                info_group: state => state.info_group
            })
        },
        data() {
            return {
                changeHeight: false
            }
        },
        created() {
            this.$nextTick(() => {
                if (window.screen.height < 700) {
                    this.changeHeight = true;
                }
            });
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