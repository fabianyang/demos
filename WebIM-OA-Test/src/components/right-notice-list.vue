<template>
    <!-- 默认关闭 展开状态添加 open -->
    <!--
        <div class="conts">
            <div class="rlisttit">
                <a href="#">通知</a>
            </div>
            <ul class="rlist">
                <li>
                    <a class="user-head" href="#"><img src="images/user.jpg" alt=""></a>
                    <a class="user-name" href="#">张金玲</a>
                </li>
                <li>
                    <a class="user-head" href="#"><img src="images/user.jpg" alt=""></a>
                    <a class="user-name" href="#">张金玲</a>
                </li>
            </ul>
        </div>
        -->
    <div class="conts" :class="{ open: open }">
        <div class="rlisttit unselectable" @click="open = !open">
            <a v-text="title">Title</a>
            <!-- 新消息数字 -->
            <!-- <span class="new">100</span> -->
        </div>
        <ul class="rlist" v-show="open">
            <li v-for="item in list" :key="item.id" @click="openChat(item)" :class="{ cur: item.id === leftWindow.id }">
                <a class="user-head">
                    <img :src="item.avatar || defaultAvatar" alt="id">
                </a>
                <a class="user-name">{{ item.nickname || item.username }}</a>
                <!--<span class="new">8</span>-->
            </li>
        </ul>
    </div>
    <!--
        <div class="conts">
            <div class="rlisttit">
                <a href="#">群聊</a>
            </div>
            <ul class="rlist">
                <li>
                    <a class="user-head" href="#"><img src="images/user.jpg" alt=""></a>
                    <a class="user-name" href="#">张金玲</a>
                </li>
                <li>
                    <a class="user-head" href="#"><img src="images/user.jpg" alt=""></a>
                    <a class="user-name" href="#">张金玲</a>
                </li>
            </ul>
        </div>
        -->
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { VIEW_STATE_CHANGE, VIEW_LEFT_OPEN } from '../store/mutation-types';

export default {
    name: 'right-list',
    props: ['title', 'type', 'list'],
    computed: mapState({
        leftWindow: state => state.leftWindow
    }),
    methods: {
        openChat(item) {
            // debugger;
            // let info = this.info[id] || {id: id};
            console.log(item);
            item.title = this.title;
            this.stateChange(['left', 'chat']);
            this.chatOpen(item);
        },
        ...mapMutations({
            'stateChange': VIEW_STATE_CHANGE,
            'chatOpen': VIEW_LEFT_OPEN
        })
    },
    data() {
        return {
            open: false,
            defaultAvatar: window.FangChat.data.defaultAvatar
        }
    }
}
</script>

<style lang="scss" scoped>
div,
ul,
li,
a,
img,
span {
    box-sizing: border-box;
}

div,
ul,
li,
span {
    margin: 0;
    padding: 0;
    border: 0;
}

img,
a img {
    border: 0;
    margin: 0;
    padding: 0;
}

ul,
li {
    list-style: none;
}

img {
    vertical-align: top;
}

a {
    color: #333;
    text-decoration: none;
}

a:hover {
    color: #333;
    cursor: pointer;
}

/* 姓名列表 */

.conts {
    width: 100%;
    height: auto;
}

.conts .rlisttit {
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding-left: 35px;
    padding-right: 40px;
    color: #333;
    font-size: 14px;
    background: url(../assets/images/arr-right.png) no-repeat 15px center;
    cursor: pointer;
    position: relative;
}

.conts .rlist {
    width: 100%;
    height: auto;
    display: none;
}

.conts .rlist li {
    width: 100%;
    height: 50px;
    padding: 10px 40px 10px 15px;
    overflow: hidden;
    position: relative;
}

.conts .rlist li.cur {
    background: rgba(224, 24, 24, .1);
    border-right: 3px solid #e01818;
}

.conts .rlist li .user-head {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    float: left;
}

.conts .rlist li .user-head img {
    width: 30px;
    height: auto;
}

.conts .rlist li .user-name {
    width: 125px;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    float: left;
    margin-left: 10px;
}

.conts.open .rlisttit {
    background-image: url(../assets/images/arr-down.png);
}

.conts.open .rlist {
    display: block;
}


/* 新消息数字 */

.new {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    text-align: center;
    line-height: 16px;
    color: #fff;
    font-size: 10px;
    background: #e01818;
    border-radius: 8px;
    position: absolute;
    top: 50%;
    margin-top: -8px;
    right: 15px;
}
</style>