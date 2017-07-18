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
            <a href="http://work.fang.com/v2/request/approve/WfRequestDetailAct.do?method=toRequestDetail&workflowid=3996&isagentCreater=0&beagenter=" target="_blank">产品意见反馈</a>
            <!--
            <a @click.stop="show_download = !show_download">下载天下聊pc客户端</a>
            <div id="im_downloadbox" class="imBox" v-show="show_download">
                <a :href="win_url"><img class="impic" src="http://js.soufunimg.com/oa/platform_web/images/login/btn-Windows.png?jsc=2017-06-22 18:13:30"></a>
                <a :href="mac_url"><img class="impic" src="http://js.soufunimg.com/oa/platform_web/images/login/btn-Mac.png?jsc=2017-06-22 18:13:30"></a>
            </div>
            -->
        </div>
    </div>
</template>

<script>
import leftTitle from '../components/left-title';
import leftChatContent from '../components/left-chat-content';
import leftChatTextarea from '../components/left-chat-textarea';

let config = window.FangChat.config;

    export default {
        name: 'left-chat',
        components: {
            leftTitle,
            leftChatContent,
            leftChatTextarea
        }
        // data() {
        //     return {
        //         show_download: false,
        //         mac_url: config.macUrl || 'javascript:;',
        //         win_url: config.winUrl || 'javascript:;'
        //     }
        // },
        // created() {
        //     this.$nextTick(() => {
        //         document.getElementById('im_app').addEventListener('click', (e) => {
        //             if (!document.getElementById('im_downloadbox').contains(e.target)) {
        //                 this.show_download = false;
        //             }
        //         });
        //     });
        // }
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
        background-color: #fff;
        position: relative;
    }

    .fbconl .fbbutr a {
        font-size: 10px;
        color: #999;
        text-decoration: underline;
    }

    .fbconl .fbbutr a:hover {
        color: #333;
    }

    .imBox {
        width: 112px;
        height: 75px;
        border: 1px solid #ccc;
        position: absolute;
        left: 15px;
        top: -75px;
        background-color: #fff;
        z-index: 100;
    }

    .imBox a {
        display: block;
    }

    .impic {
        width: 100px;
        margin: 5px 5px -5px 5px;
    }
</style>