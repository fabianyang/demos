<template>
    <div class="fbconl notice" :style="{ height: changeHeight ? '412px' : '550px' }">
        <!-- 标题组件 -->
        <left-title></left-title>
        <div class="fbconlcon" :style="{ height: changeHeight ? '360px' : '498px' }">
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


    /* 左侧聊天 */

    .fbconl {
        width: 510px;
        height: 550px;
        overflow: hidden;
        float: left;
    }

    /* 左侧通知 */
    .fbconl.notice .fbconlcon {
        width: 510px;
        height: 498px;
        background: #fff;
    }
</style>