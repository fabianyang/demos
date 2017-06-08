<template>
    <div class="fbconl">
        <!-- 标题组件 -->
        <left-title></left-title>
        <div class="fbconlcon">
            <!-- 内容组件 -->
            <left-chat-content></left-chat-content>
        </div>
        <!-- 输入内容组件 -->
        <left-chat-textarea></left-chat-textarea>
        <!-- 下载 -->
        <div class="fbbutr">
            <a href="#">下载天下聊pc客户端</a>
        </div>
    </div>
</template>

<script>
import leftTitle from '../components/left-title';
import leftChatContent from '../components/left-chat-content';
import leftChatTextarea from '../components/left-chat-textarea';

    export default {
        name: 'left-chat',
        components: {
            leftTitle,
            leftChatContent,
            leftChatTextarea
        },
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<style lang="scss" scoped>
    div,
    a {
        box-sizing: border-box;
    }

    div {
        margin: 0;
        padding: 0;
        border: 0;
    }

    a {
        color: #333;
        text-decoration: none;
    }

    a:hover {
        color: #333;
        cursor: pointer;
    }


    /* 左侧聊天 */

    .fbconl {
        width: 510px;
        height: 550px;
        overflow: hidden;
        float: left;
    }


    /* 对话列表 */

    .fbconl .fbconlcon {
        width: 510px;
        height: 318px;
        background: #fff;
    }


    /* 下载 */

    .fbconl .fbbutr {
        width: 510px;
        height: 25px;
        padding: 0 15px;
    }

    .fbconl .fbbutr a {
        font-size: 10px;
        color: #999;
        text-decoration: underline;
    }

    .fbconl .fbbutr a:hover {
        color: #333;
    }
</style>