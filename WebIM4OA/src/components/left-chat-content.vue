<template>
    <!-- 所有聊天内容都放在 replybox 中，发送中添加active，失败添加fail -->
    <ul @scroll="onScroll" :style="{ height: changeHeight ? '210px' : '318px' }">
        <li class="load" v-show="historyContainerState === 'loading'"></li>
        <li class="nomore" v-show="historyContainerOpen && historyContainerState !== 'loading'">{{  historyContainerNomore ? '没有更多了' :  '以下为历史记录' }}</li>
        <li class="nomore" v-show="list.length && !historyContainerOpen && historyContainerState !== 'loading'">更多请查看历史记录</li>
        <li class="im_welcome" v-if='welcome_index === -1'><p>网页版天下聊仅收取登录期间的聊天消息，如要查看完整聊天内容，请点击下方<i></i>按钮</p></li>
        <template v-for="(item, index) in list">
            <li class="time" v-text="item.messagetime">messagetime</li>
            <li :class="{ even: item.source === 'send', odd: item.source === 'receive' }">
                <a class="user" @click="openWindow(item)">
                    <img :src="getAvatar(item)">
                </a>
                <div class="replybox" :class="{ group: isGroup, active: item.messagestate === 0 }">
                    <div class="fail" v-show="item.messagestate === 2" @click="reSend(item)"></div>
                    <p class="name" v-text="getNickname(item)" v-if="isGroup">Nickname</p>
                    <!-- 文字内容 replycontent; 群聊中添加姓名 replybox 添加类名 group -->
                    <div class="replycontent" :data-time="item.messagetime" v-if="item.command === 'chat' || item.command === 'group_chat'" v-html="pack_msg(item.message)">Message</div>
                    <!-- yangfan: 语音内容 -->
                    <div class="replycontent" v-if="item.command === 'voice' || item.command === 'group_voice' || item.command === 'red_packets_cash' || item.command === 'batchchat' || item.command === 'group_batchchat'" v-text="item.message">Message</div>
                    <!-- 图片内容 replyimg -->
                    <div class="replyimg" v-if="item.command === 'img' || item.command === 'group_img'">
                        <a :href="item.message" target="_blank">
                            <img :src="item.message" :alt="item.nickname">
                        </a>
                    </div>

                    <!-- 链接卡片 replylink -->
                    <div class="replylink" v-if="item.command === 'link' || item.command === 'group_link'">
                        <a :href='item.message' target="_blank">
                            <h6 v-text="item.title">msgContent Title</h6>
                            <div class="con">
                                <div class="con-text" v-text="item.desc">msgContent desc</div>
                                <div class="con-img">
                                    <img :src="item.pic" :alt="item.title" :title="item.title">
                                </div>
                            </div>
                        </a>
                    </div>

                    <!-- 视频内容 replyvideo -->
                    <div class="replyvideo" v-if="item.command === 'video' || item.command === 'group_video'">
                        <a :href='item.message' target="_blank">
                            <span class="start"></span>
                            <span class="time" v-text="item.second">second</span>
                        </a>
                    </div>

                    <!-- 定位内容 replylocation -->
                    <div class="replylocation" v-if="item.command === 'location' || item.command === 'group_location'">
                        <div class="info">
                            <a v-text="item.title0" :href="location_href(item)" target="_blank">big title</a>
                            <a v-text="item.title1" :href="location_href(item)" target="_blank">small title</a>
                        </div>
                        <div class="map">
                            <a :href="location_href(item)" target="_blank">
                                <img :src="getMapSrc(item)">
                            </a>
                            <!-- 地图内容
                            <span class="location"></span>
                            -->
                        </div>
                    </div>
                    <!-- 名片内容 replyuser -->
                    <div class="replyuser" v-if="item.command === 'card' || item.command === 'group_card'" @click="openCard(item)">
                        <div class="title">
                            <div class="info">
                                <a v-text="item.card_nickname">card Nickname</a>
                                <a v-text="item.card_department">card Department</a>
                            </div>
                            <div class="user-head">
                                <img :src="item.card_avatar" alt="头像">
                            </div>
                        </div>
                        <div class="type">个人名片</div>
                    </div>
                    <!-- 文件内容 replyfile -->
                    <div class="replyfile" v-if="item.command === 'file' || item.command === 'group_file'">
                        <a :href="item.message" target="_blank">
                            <div class="info">
                                <h6 v-text="item.filename">file name</h6>
                                <p>
                                    <span v-text="item.size">9.5mb</span>
                                    <span class="flor">已发送</span>
                                </p>
                            </div>
                            <div class="type">
                                <img :src="getFilePic(item.extension)" alt="item.message">
                            </div>
                        </a>
                    </div>
                </div>
            </li>
            <li class="im_welcome" v-if='index === welcome_index'><p>网页版天下聊仅收取登录期间的聊天消息，如要查看完整聊天内容，请点击下方<i></i>按钮</p></li>
        </template>
    </ul>
</template>

<script>
import events from '../events';
import setting from '../setting';
import util from '../util';
import { mapState, mapGetters, mapMutations } from 'vuex';
import {VIEW_TOGGLE_HISTORY,VIEW_LEFT_OPEN,VIEW_STATE_CHANGE,VIEW_RIGHT_SWITCH,VIEW_CHAT_CHANGE,VIEW_CHAT_MSGKEY} from '../store/mutation-types';
let timer = null;
let lock = false;
let historyRequested = false;

let config = window.FangChat.config;
/**
 * getAvatar() getNickname 基本都会执行 2 遍，一遍发送刷新视图，一遍返回发送状态刷新视图
 **/

export default {
    name: 'left-chat-content',
    // watch: {
    //     list() {

    //     }
    // },
    computed: {
        list() {
            this.$nextTick(() => {
                // 请求返回数据，渲染后解锁
                lock = false;
                if (!historyRequested) {
                    let el = this.$el;
                    // var container = this.$el.querySelector("#im_content");
                    el.scrollTop = el.scrollHeight;
                    // 聊天记录有图片时候，先滚动一次，然后等加载完成再滚动一次
                    setTimeout(() => {
                        el.scrollTop = el.scrollHeight;
                    }, 100);
                }
            });
            if (this.historyContainerOpen) {
                return this.history_list;
            } else {
                historyRequested = false;
                return this.message_list;
            }
        },
        isGroup() {
            // 关闭窗口会将 leftWindow = {} 会报错
            if (this.leftWindow.signame) {
                return this.leftWindow.signame.split('_')[2] === 'group';
            } else {
                return false;
            }
        },
        welcome_index() {
            return this.welcome[this.leftWindow.id];
        },
        ...mapGetters({
            message_list: 'message_list',
            history_list: 'history_list'
        }),
        ...mapState({
            leftWindow: state => state.leftWindow,
            historyContainerOpen: state => state.historyContainer.open,
            historyContainerState: state => state.historyContainer.loadState,
            historyContainerNomore: state => state.historyContainer.nomore,
            welcome: state => state.welcome,
            info_user: state => state.info_user
        })
    },
    methods: {
        location_href(item) {
            return 'http://m.fang.com/chat/location.jsp?pos_x=' + item.message.split(',')[0] + '&pos_y=' + item.message.split(',')[1] + '&message=' + item.title1 + '&title=' + item.title0;
        },
        showTimeStamp(index) {
            let prev = this.list[index - 1];
            if (!prev) {
                return true;
            } else {
                let now = this.list[index];

                console.log(prev, now);
                if (now.time - prev.time > 60 * 1000) {
                    console.log(now.messagetime, prev.messagetime, now.time - prev.time);
                    return true;
                }
            }
        },
        getMapSrc(item) {
            return item.pic || 'http://api.map.baidu.com/staticimage?width=240&height=118&copyright=1&zoom=18&markers=' + item.message + '&markerStyles=m';
        },
        getFilePic(extension) {
            // Word—— .doc，.docx
            // EXCEL—— .xls，.xlsx
            // PPT—— .ppt，.pptx
            // PDF—— .pdf
            // TXT—— .txt
            if (!extension) {
                return setting.filePicture['i'];
            }
            let key = extension.substr(0, 3);
            return setting.filePicture[key] || setting.filePicture['i'];
        },
        getAvatar(item) {
            let info = this.info_user[item.from];
            if (info) {
                return info.avatar || setting.defaultAvatar;
            }
        },
        getNickname(item) {
            let info = this.info_user[item.from];
            if (info) {
                return info.nickname || 'fang.com';
            }
        },
        pack_msg(msg) {
            let isLink = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i.test(msg);
            if (isLink) {
                return '<a href="' + msg + '" target="_blank">' + msg + '</a>';
            }

            // 把对应的表情字符转换成表情src
            return msg.replace(/\[([^\]]*)\]/g, function () {
                return '<img src="' + setting.EMOJI[arguments[1]] + '" width="24" border="0" style="vertical-align: bottom;" />'
            });
        },
        openCard(item) {
            let card = {
                id: item.card_username,
                nickname: item.card_nickname,
                avatar: item.card_avatar,
                department: item.card_department
            }
            Object.assign(card, this.info_user[card.id]);
            if (!card.email) {
                events.trigger('store:request:user', card);
                card.bySearch = 1;
            }
            card.signame = 'im_notice_single';
            this.stateChange(['left', 'chat']);
            this.stateLeftOpen(card);
            this.stateChange(['right', 'notice']);
            this.stateRightOpen({
                signame: 'im_notice_single',
                open: true
            });
            this.toggleHistory({
                open: 0
            });
        },
        openWindow(item) {
            let info = this.info_user[item.from];
            if (!info) {
                info = {
                    id: item.from,
                    nickname: item.nickname
                }
                events.trigger('store:request:user', info);
                info.bySearch = 1;
            }
            // 重置窗口
            info.signame = 'im_notice_single';
            this.stateChange(['left', 'chat']);
            this.stateLeftOpen(info);
            this.stateChange(['right', 'notice']);
            this.stateRightOpen({
                signame: 'im_notice_single',
                open: true
            });
        },
        onScroll(e) {
            // console.log(e.target.scrollTop);
            // 非历史记录界面 return; 点击历史记录按钮就会请求，所以 history.length > 0
            if (!this.history_list.length || !this.historyContainerOpen || this.historyContainerNomore || lock) {
               return;
            }
            if (e.target.scrollTop < 20) {
                lock = true;
                setTimeout(() => {
                    lock = false;
                }, 2000)
                historyRequested = true;
                events.trigger('store:request:history', {
                    id: this.leftWindow.id,
                    messageid: this.history_list[0].messageid,
                    fn: 'p',
                    exec: 'more_history'
                });

                this.toggleHistory({
                    state: 'loading'
                });
            }
        },
        reSend(item) {
            this.viewRemoveMsg({
                messagekey: item.messagekey,
                sendto: item.sendto,
                remove: 1
            });
            let msg = Object.assign({}, item, {
                messagekey: util.guid(),
                messagestate: 0
            });
            this.viewChatMsg(item);
            events.trigger('view:send:message', item);
        },
        ...mapMutations({
            'toggleHistory': VIEW_TOGGLE_HISTORY,
            'stateLeftOpen': VIEW_LEFT_OPEN,
            'stateChange': VIEW_STATE_CHANGE,
            'stateRightOpen': VIEW_RIGHT_SWITCH,
            'viewChatMsg': VIEW_CHAT_CHANGE,
            'viewRemoveMsg': VIEW_CHAT_MSGKEY
        })
    },
    data() {
        return {
            changeHeight: false,
            username: config.username
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
* {
    box-sizing: border-box;
}

div,
ul,
li,
span,
p {
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

h6 {
    margin: 0;
    padding: 0;
    font-size: 12px;
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

p {
    white-space: normal;
}

/* 对话列表 */
ul {
    width: 100%;
    height: 318px;
    padding: 15px;
    overflow-y: auto;
}

ul li {
    width: 100%;
    margin-bottom: 15px;
    overflow: hidden;
}

ul li:last-child {
    margin-bottom: 0;
}

ul li .user {
    width: 30px;
    height: 30px;
    overflow: hidden;
    border-radius: 50%;
}

ul li .user img {
    width: 30px;
    height: auto;
}

ul li.odd .user {
    float: left;
    margin-right: 10px;
}

ul li.even .user {
    float: right;
    margin-left: 10px;
}

/* 发送内容 */
ul li .replybox {
    max-width: 360px;
    position: relative;
}

ul li.odd .replybox {
    float: left;
}

ul li.even .replybox {
    float: right;
}




/* 发送中 发送失败 */
ul li .replybox:after {
    content: "";
    width: 15px;
    height: 15px;
    background-size: 15px;
    background-repeat: no-repeat;
    background-position: center;
    position: absolute;
    top: 50%;
    margin-top: -8px;
    cursor: pointer;
    display: none;
}

ul li.odd .replybox:after {
    right: -30px;
}

ul li.even .replybox:after {
    left: -30px;
}

ul li .replybox.active:after {
    background-image: url(../assets/images/icon-active.png);
    display: block;
}

// ul li .replybox.fail:after {
//     background-image: url(../assets/images/icon-fail.png);
//     display: block;
// }

ul li .replybox .fail {
    background-image: url(../assets/images/icon-fail.png);
    width: 15px;
    height: 15px;
    background-size: 15px;
    background-repeat: no-repeat;
    background-position: center;
    position: absolute;
    top: 50%;
    margin-top: -8px;
    left: -20px;
    cursor: pointer;
}

/* 群聊姓名 */

ul li .replybox.group {
    margin-top: 21px;
}

ul li .replybox.group .name {
    color: #666;
    font-size: 12px;
    position: absolute;
    top: -21px;
    // yangfan: 输入文字小于名字长度会换行
    width: 36px;
}

ul li.odd .replybox.group .name {
    left: 0;
}

ul li.even .replybox.group .name {
    right: 0;
}


/* 文字内容 */

ul li .replycontent {
    padding: 5px 10px;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    border-radius: 5px;
    word-break: break-all;
    word-wrap: break-word;
    position: relative;
}

ul li .replycontent a {
    color: #4d90fe;
    text-decoration: underline;
}

ul li.odd .replycontent {
    background: #f7f7f7;
}

ul li.even .replycontent {
    background: #ffdbdb;
}

ul li .replycontent:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replycontent:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replycontent:after {
    border-left: 8px solid #ffdbdb;
    right: -8px;
}




/* 图片内容 */

ul li .replyimg {
    max-width: 240px;
    max-height: 178px;
}

ul li .replyimg img {
    max-width: 240px;
    max-height: 178px;
    border-radius: 5px;
}

/* 视频内容 */

ul li .replyvideo {
    width: 240px;
    height: 178px;
    background: url(../assets/images/video_bg.png) no-repeat center;
    border-radius: 5px;
    position: relative;
}

ul li .replyvideo .start {
    width: 50px;
    height: 50px;
    background: url(../assets/images/start.png) no-repeat center;
    position: absolute;
    top: 64px;
    left: 95px;
    z-index: 10;
}

ul li .replyvideo .time {
    font-size: 12px;
    color: #fff;
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 10;
}

/* 名片内容 */

ul li .replyuser {
    width: 220px;
    height: 90px;
    background: #f7f7f7;
    padding: 9px 10px 8px;
}

ul li .replyuser .title {
    width: 200px;
    height: 53px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ddd;
}

ul li .replyuser .info {
    float: left;
    width: 140px;
    height: 44px;
}

ul li .replyuser .info a {
    display: block;
    color: #666;
    font-size: 12px;
    line-height: 12px;
    margin-top: 9px;
    width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

ul li .replyuser .info a:first-child {
    color: #333;
    font-size: 14px;
    line-height: 14px;
    margin-top: 4px;
}

ul li .replyuser .user-head {
    float: right;
    width: 44px;
    height: 44px;
    border-radius: 4px;
    overflow: hidden;
}

ul li .replyuser .user-head img {
    width: 44px;
    height: auto;
}

ul li .replyuser .type {
    margin-top: 5px;
    text-align: right;
    color: #999;
    font-size: 12px;
}

ul li .replyuser:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replyuser:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replyuser:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}

/* 文件内容 */

ul li .replyfile {
    width: 220px;
    height: 70px;
    background: #f7f7f7;
    padding: 10px;
}

ul li .replyfile .info {
    width: 140px;
    height: 50px;
    float: left;
    margin-right: 10px;
}

ul li .replyfile .info h6 {
    height: 34px;
    line-height: 17px;
    color: #333;
    font-size: 12px;
    font-weight: normal;
    overflow: hidden;
}

ul li .replyfile .info p {
    color: #999;
    font-size: 12px;
}

ul li .replyfile .type {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    overflow: hidden;
}

ul li .replyfile .type img {
    width: 50px;
    height: 50px;
}

ul li .replyfile:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replyfile:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replyfile:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}

/* 链接内容 */

ul li .replylink {
    width: 220px;
    height: 90px;
    background: #f7f7f7;
    padding: 10px;
}

ul li .replylink h6 {
    width: 200px;
    height: 20px;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    font-weight: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

ul li .replylink .con {
    width: 200px;
    height: 40px;
    margin-top: 10px;
}

ul li .replylink .con .con-text {
    width: 150px;
    height: 40px;
    line-height: 17px;
    padding: 3px 0;
    color: #999;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    float: left;
}

ul li .replylink .con .con-img {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    overflow: hidden;
    float: right;
}

ul li .replylink .con .con-img img {
    width: 40px;
    height: auto;
}

ul li .replylink:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replylink:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replylink:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}

/* 定位内容 */

ul li .replylocation {
    width: 240px;
    height: 178px;
    background: #999;
    border-radius: 5px;
    position: relative;
}

ul li .replylocation .info {
    width: 100%;
    height: 60px;
    background: #f7f7f7;
    padding: 10px 15px;
}

ul li .replylocation .info a {
    display: block;
    margin-top: 8px;
    line-height: 12px;
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

ul li .replylocation .info a:first-child {
    margin: 0;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    font-weight: bold;
}

ul li .replylocation .map {
    width: 100%;
    height: 118px;
    overflow: hidden;
    position: relative;
}

ul li .replylocation .map .location {
    width: 14px;
    height: 19px;
    background: url(../assets/images/icon-location.png) no-repeat center;
    position: absolute;
    top: 50px;
    left: 50px;
}

ul li .replylocation:after {
    content: "";
    width: 0px;
    height: 0px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    position: absolute;
    top: 8px;
}

ul li.odd .replylocation:after {
    border-right: 8px solid #f7f7f7;
    left: -8px;
}

ul li.even .replylocation:after {
    border-left: 8px solid #f7f7f7;
    right: -8px;
}

/* 内容加载中 */

ul li.load {
    width: 18px;
    height: 18px;
    background: url(../assets/images/icon-active.png) no-repeat center;
    margin: 0 auto 15px;
}

/* 没有更多 */

ul li.nomore {
    height: 15px;
    line-height: 15px;
    color: #ddd;
    font-size: 14px;
    text-align: center;
    margin: 0 auto 15px;
    position: relative;
}

ul li.nomore:before,
ul li.nomore:after {
    content: "";
    width: 120px;
    height: 1px;
    background: #ddd;
    position: absolute;
    top: 7px;
}

ul li.nomore:before {
    left: 65px;
}

ul li.nomore:after {
    right: 65px;
}

/* 聊天时间 */
ul li.time {
    height: 15px;
    line-height: 15px;
    color: #999;
    font-size: 12px;
    text-align: center;
    margin: 0 auto 15px;
}

ul li.im_welcome {
    background-color: #eee;
    padding: 10px;
    border-radius: 5px;
    width: 90%;
    margin: 0 auto 15px;
}

ul li.im_welcome p {
    color: #999;
    font-size: 12px;
    line-height: 1.6;
    letter-spacing: 1px;
}

ul li.im_welcome i{
    background-image: url(../assets/images/icom-welcome-history.png);
    width: 12px;
    height: 12px;
    vertical-align: middle;
    display: inline-block;
    margin: -2px 2px 0;
}
</style>