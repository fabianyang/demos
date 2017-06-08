<template>
        <!-- yangfan: 正常结果，什么都不加 -->
        <!-- 无结果时添加 result2 -->
        <!-- 加载失败时添加 result3 -->
        <div class="search-result">
            <p class="none">无搜索结果</p>
            <a class="fail">加载失败 重试</a>
            <p class="loading">加载中…</p>
            <ul>
                <li>周书萍-通用产品技术部与工作技周书萍-通用产品技术部与工作技</li>
                <li>周书萍-通用产品技术部与工作技</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li>周书萍-通用产品技术部</li>
                <li class="nomore2">没有更多了</li>
            </ul>
        </div>
</template>

<script>
    export default {
        name: 'right-search-result',
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
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

    .search-result.result2 ul,
    .search-result.result3 ul {
        display: none;
    }

    .search-result .none {
        font-size: 14px;
        color: #999;
        text-align: center;
        margin-top: 285px;
        display: none;
    }

    .search-result .fail {
        display: block;
        font-size: 14px;
        color: #4d90fe;
        text-align: center;
        text-decoration: underline;
        margin-top: 285px;
        display: none;
    }

    .search-result .loading {
        font-size: 14px;
        color: #999;
        text-align: center;
        margin-top: 65px;
        padding-top: 28px;
        background: url(../assets/images/icon-active.png) no-repeat center top;
        display: none;
    }

    .search-result.result2 .none {
        display: block;
    }

    .search-result.result3 .fail {
        display: block;
    }

    .search-result.result3 .loading {
        display: block;
    }
</style>