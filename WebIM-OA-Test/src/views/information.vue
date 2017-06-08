<template>
    <!-- 默认隐藏，显示添加 show -->
    <!-- 正在连接 connect -->
    <!-- 成功 添加 connect success -->
    <!-- 失败 添加 connect fail -->
    <!-- 重新 添加 connect refresh -->
    <!--
    <div class="connect">
        <span class="icon"></span>
        <span>正在连接服务器...</span>
    </div>
    <div class="connect success">
        <span class="icon"></span>
        <span>已连接成功</span>
    </div>
    <div class="connect fail">
        <span class="icon"></span>
        <span>连接服务器失败</span>
    </div>
    -->
    <div class="connect" :class="klass">
        <span class="icon"></span>
        <span v-text="text">已离线</span>
        <a title="close" v-show="info === 'close'">重新登陆</a>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'information',
        computed: {
            text() {
                let text = {
                    connecting: '正在连接服务器...',
                    open: '已连接成功',
                    close: '已离线',
                    error: '连接服务器失败',
                }[this.info];
                return text || this.info;
            },
            klass() {
                return {
                    'success': this.info === 'open',
                    'refresh': this.info === 'close',
                    'fail': this.info === 'error'
                }
            },
            ...mapState({
                info: state => state.view.info
            })
        },
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    div,
    span,
    a {
        box-sizing: border-box;
    }

    div,
    span {
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


    /* 登陆状态 */

    .connect {
        width: 240px;
        height: 40px;
        background: #333;
        color: #fff;
        font-size: 14px;
        text-align: center;
        line-height: 40px;
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, .5);
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 10001;
    }

    .connect .icon {
        width: 14px;
        height: 14px;
        display: inline-block;
        vertical-align: middle;
        margin-right: 10px;
        margin-top: -2px;
        background: url(../assets/images/connect.png) no-repeat left center;
    }

    .connect.success .icon {
        background-image: url(../assets/images/connect-success.png);
    }

    .connect.fail .icon {
        background-image: url(../assets/images/connect-fail.png);
    }

    .connect.refresh .icon {
        background-image: url(../assets/images/connect-refresh.png);
    }

    .connect a {
        color: #fff;
        font-size: 14px;
        text-decoration: underline;
        margin-left: 5px;
    }
</style>
