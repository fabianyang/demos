<template>
    <div class="fbconr">
        <!-- 标题组件 -->
        <right-title></right-title>
        <!-- 搜索结果组件 -->
        <right-search-result></right-search-result>
        <!-- 右下角搜索和通讯录切换面板 -->
    </div>
</template>

<script>
    import rightTitle from '../components/right-title';
    import rightSearchResult from '../components/right-search-result';

    export default {
        name: 'right-search',
        components: {
            rightTitle,
            rightSearchResult
        },
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<style lang="scss" scoped>
* { box-sizing: border-box;}
  div, form, ul, ol, li, span, p, dl, dt, dd { margin: 0; padding: 0; border: 0; }
  img, a img { border: 0; margin: 0; padding: 0; }
  h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; font-size: 12px; }
  ul, ol, li { list-style: none; }
  table, td, input,textarea { font-size: 12px; padding: 0; font-family: inherit; }
  img { vertical-align: top;}
  em ,i { font-style: normal;}
  a { color: #333; text-decoration: none; }
  a:hover { color:#333; cursor: pointer;}

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


    /* 搜索 最小化 */

    .fbconr .fbconrtit {
        width: 240px;
        height: 52px;
        padding: 11px 0px 11px 15px;
    }

    .fbconr .fbconrtit .search {
        width: 180px;
        height: 30px;
        padding: 5px;
        padding-left: 34px;
        line-height: 18px;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        background: url(../assets/images/icon-search.png) no-repeat 10px center;
        background-color: #f7f7f7;
    }

    .fbconr .fbconrtit .close2 {
        width: 45px;
        height: 30px;
        display: inline-block;
        background: url(../assets/images/icon-close2.png) no-repeat center;
    }


    /* 搜索结果 */

    .fbconr .search-result {
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

    .fbconr .search-result ul {
        width: 100%;
        min-height: 498px;
        padding: 10px 0 34px;
        position: relative;
    }

    .fbconr .search-result ul li {
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

    .fbconr .search-result ul .nomore2 {
        text-align: center;
        color: #999;
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .fbconr .search-result.result2,
    .fbconr .search-result.result3 {
        background-image: url(../assets/images/result.png);
        background-repeat: no-repeat;
        background-position: center 145px;
    }

    .fbconr .search-result.result2 ul,
    .fbconr .search-result.result3 ul {
        display: none;
    }

    .fbconr .search-result .none {
        font-size: 14px;
        color: #999;
        text-align: center;
        margin-top: 285px;
        display: none;
    }

    .fbconr .search-result .fail {
        display: block;
        font-size: 14px;
        color: #4d90fe;
        text-align: center;
        text-decoration: underline;
        margin-top: 285px;
        display: none;
    }

    .fbconr .search-result .loading {
        font-size: 14px;
        color: #999;
        text-align: center;
        margin-top: 65px;
        padding-top: 28px;
        background: url(../assets/images/icon-active.png) no-repeat center top;
        display: none;
    }

    .fbconr .search-result.result2 .none {
        display: block;
    }

    .fbconr .search-result.result3 .fail {
        display: block;
    }

    .fbconr .search-result.result3 .loading {
        display: block;
    }
</style>