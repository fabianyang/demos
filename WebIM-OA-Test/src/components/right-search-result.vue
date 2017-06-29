<template>
        <!-- yangfan: 正常结果，什么都不加 -->
        <!-- 无结果时添加 result2 -->
        <!-- 加载失败时添加 result3 -->
        <div class="search-result" @scroll="onScroll($event)">
            <p class="none" v-show="!result.length && info === 'none'">无搜索结果</p>
            <a class="fail" v-show="!result.length && info === 'fail'">加载失败 重试</a>
            <p class="loading" v-show="!result.length && info === 'loading'">加载中…</p>
            <ul v-if="result.length">
                <li v-for="item in result" @click="openWindow(item)">{{ item.nickname + '-' + item.department }}</li>
                <li class="nomore2" v-show="info === 'nomore'">没有更多了</li>
            </ul>
        </div>
</template>

<script>
    import events from '../events';
    import { mapState, mapMutations } from 'vuex';
    import { VIEW_SEARCH_USER_CHANGE, VIEW_LEFT_OPEN, VIEW_STATE_CHANGE } from '../store/mutation-types'

    export default {
        name: 'right-search-result',
        computed: mapState({
            result: state => state.search.result,
            info: state => state.search.info,
            keyword: state => state.search.keyword,
            requesting: state => state.search.requesting,
            user_info: state => state.user_info
        }),
        methods: {
            onScroll(ev) {
                let el = ev.target;
                // http://www.cnblogs.com/sichaoyun/p/6647458.html
                if (el.scrollTop + el.offsetHeight > el.scrollHeight - 20) {
                    if (this.requesting)
                        return false;
                    if (this.info === 'nomore')
                        return false;

                    this.stateSearchChage({
                        requesting: true
                    });
                    events.trigger('view:search:user', {
                        keyword: this.keyword,
                        start: this.result.length
                    })
                }
            },
            openWindow(info) {
                if (!user_info[info.id]) {
                    events.trigger('store:request:user', info);
                }
                // 重置窗口
                info.signame = 'im_notice_single_search';
                this.stateChange(['left', 'chat']);
                this.stateChange(['right', 'notice']);
                this.stateSearchChage({
                    result: [],
                    info: 'loading'
                });
                this.stateLeftOpen(info);
            },
            ...mapMutations({
                'stateLeftOpen': VIEW_LEFT_OPEN,
                'stateChange': VIEW_STATE_CHANGE,
                'stateSearchChage': VIEW_SEARCH_USER_CHANGE
            })
        }
    }
</script>

<style lang="scss" scoped>
  div, p, a, ul, li { box-sizing: border-box;}
  div, ul, li, p { margin: 0; padding: 0; border: 0; }
  ul, li { list-style: none; }
  a { color: #333; text-decoration: none; }
  a:hover { color:#333; cursor: pointer;}

    /* 搜索结果 */

    .search-result {
        width: 240px;
        height: 498px;
        background-color: #eee;
        padding: 0 15px;
        position: absolute;
        top: 52px;
        left: 0;
        z-index: 999;
        overflow-x: hidden;
        overflow-y: auto;
    }

    .search-result ul {
        width: 100%;
        min-height: 498px;
        padding: 10px 0 34px;
        position: relative;
    }

    .search-result ul li {
        width: 100%;
        height: 20px;
        line-height: 20px;
        margin-bottom: 14px;
        color: #333;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
    }

    .search-result ul .nomore2 {
        text-align: center;
        color: #999;
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .search-result.result2,
    .search-result.result3 {
        background-image: url(../assets/images/result.png);
        background-repeat: no-repeat;
        background-position: center 145px;
    }

    // .search-result.result2 ul,
    // .search-result.result3 ul {
    //     display: none;
    // }

    .search-result .none {
        font-size: 14px;
        color: #999;
        text-align: center;
        margin-top: 285px;
        // display: none;
    }

    .search-result .fail {
        // display: block;
        font-size: 14px;
        color: #4d90fe;
        text-align: center;
        text-decoration: underline;
        margin-top: 285px;
        // display: none;
    }

    .search-result .loading {
        font-size: 14px;
        color: #999;
        text-align: center;
        margin-top: 65px;
        padding-top: 28px;
        background: url(../assets/images/icon-active.png) no-repeat center top;
    }

    // .search-result.result2 .none {
    //     display: block;
    // }

    // .search-result.result3 .fail {
    //     display: block;
    // }

    // .search-result.result3 .loading {
    //     display: block;
    // }
</style>