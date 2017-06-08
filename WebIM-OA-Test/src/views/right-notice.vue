<template>
    <div class="fbconr">
        <!-- 搜索框组件 -->
        <right-title></right-title>
        <div class="listcon">
            <!-- 消息列表组件，会有多个 -->
            <right-list title="通知" type="notice"></right-list>
            <right-list title="单聊" type="single"></right-list>
            <right-list title="群聊" type="group"></right-list>
        </div>
        <!-- 右下角搜索和通讯录切换面板 -->
        <right-switch></right-switch>
    </div>
</template>

<script>
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