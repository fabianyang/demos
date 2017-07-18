<template>
    <div class="fbconl notice">
        <!-- 标题组件 -->
        <left-title></left-title>
        <div class="fbconlcon">
            <!-- 内容组件 -->
            <left-notice-content></left-notice-content>
        </div>
    </div>
</template>

<script>
    import leftTitle from '../components/left-title';
    import leftNoticeContent from '../components/left-notice-content';

    export default {
        name: 'left-notice',
        components: {
            leftTitle,
            leftNoticeContent
        },
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


    /* 左侧聊天 */

    .fbconl {
        width: 510px;
        height: 550px;
        overflow: hidden;
        float: left;
    }

    .fbconl .fbconlcon {
        width: 510px;
        height: 318px;
        background: #fff;
    }

    /* 左侧通知 */
    .fbconl.notice .fbconlcon {
        height: 498px;
    }
</style>