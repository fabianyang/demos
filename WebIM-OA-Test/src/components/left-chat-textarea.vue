<template>
    <div>
        <!-- 工具栏 -->
        <div class="fbtools clearfix">
            <!-- 工具选中时添加类名 cur -->
            <div class="bq" @click="emoji_show = !emoji_show"></div>
            <div class="tp">
                <form method="Post" enctype="multipart/form-data" :action="upload_url" :target="upload_iframe_name">
                    <input type="file" title="发送图片"
                    v-if="update_state !== 'success' && update_state !== 'fail'"
                    :name="upload_input_name"
                    @change="upload_image" />
                </form>
            </div>
            <div class="jl"></div>
            <!-- 表情 默认隐藏 显示添加 show , yangfan: img 添加个 a 标签-->
            <div class="bqbox" v-show="emoji_show">
                <div class="bqcon">
                    <a v-for="(emoji, key, index) in emoji_map" @click="emoji_insert(key)">
                        <img :src="emoji_path + emoji" width="24" :title="key" :alt="emoji + '_' + index">
                    </a>
                </div>
            </div>
        </div>
        <!-- 输入内容组件 -->
        <div class="textarea">
            <!--<textarea v-show="!update_state" name="" cols="" rows="" placeholder="点击这里开始交流，按 Ctrl+Enter 发送信息" @paste="upload_image" @keyup="send('chat', $event)" v-model="message"></textarea>-->
            <div class='im_chatarea' contenteditable='true'
                v-show="!update_state"
                v-text="message"
                @paste="upload_image"
                @keydown.enter="send('chat', $event)"
                @input="input_message"
                @blur="save_caret_position"
            ></div>
            <!-- 上传状态 默认隐藏 显示添加 show -->
            <p class="upload" v-show="update_state === 'loading'">图片上传中，请稍后...</p>
            <p class="upload success" v-show="update_state === 'success'">图片上传成功，
                <a :href="picture" target="_blank">查看</a>
                <a @click="send('img')">发送</a>
                <a @click="clear('img')">删除</a>
            </p>
            <p class="upload fail" v-show="update_state === 'fail'">图片上传失败，请稍后上传</p>
            <iframe v-if="update_state !== 'success' && update_state !== 'fail'" :name="upload_iframe_name" width="0" height="0" scrolling="no" frameBorder="0" style="visibility: hidden;"></iframe>
        </div>
    </div>
</template>

<script>
import setting from '../setting';
import events from '../events';
import util from '../util';
import { mapState, mapMutations } from 'vuex';
import { SOCKET_SEND_MSG, VIEW_CHAT_MSG } from '../store/mutations';

export default {
    name: 'left-chat-textarea',
    computed: {
        upload_iframe_name() {
            return 'fcfile' + this.sid;
        },
        upload_input_name() {
            return 'file' + this.sid;
        },
        upload_url() {
            var backurl = setting.UPLOAD_IMG_BACK_URL_PATH;
            var sid = Math.round(Math.random() * 100);
            return setting.UPLOAD_IMG_PATH + '&sid=' + sid + '&backurl=' + backurl;
        },
        ...mapState({
            chatWindow: state => state.view.chatWindow
        }),
    },
    methods: {
        input_message(event) {
            this.message = event.target.textContent;
        },
        send(cmd, event = { ctrlKey: true, keyCode: 13, preventDefault() {} }) {
            event.preventDefault();
            if (event.ctrlKey && event.keyCode == 13) {
                if (cmd === 'chat' && !this.message) {
                    return;
                }
                if (cmd === 'img' && !this.picture) {
                    return;
                }

                let message = this.message;
                if (cmd === 'img') {
                    message = this.picture
                }

                let msg = {
                    // 进行 msgList 信息列表区分。 VIEW_CHAT_MSG 使用
                    id: this.chatWindow.id,
                    // 发送消息 id oa:125460 群没有 oa 前缀
                    sendto: this.chatWindow.username,
                    message: message,
                    // 消息类型，是否为群聊，目前 group: 群聊天, 其他: 单聊
                    command: this.chatWindow.type === 'group' ? 'group_' + cmd : cmd,
                    // 展示信息使用
                    avatar: this.chatWindow.avatar,
                    nickname: this.chatWindow.nickname,
                    nickcmd: cmd,
                    // 消息是否发送完成
                    isSuccess: false,
                    time: new Date().getTime()
                }

                this.viewChatMsg(msg);
                events.trigger('socket:send:msg', msg);

                this.clear(cmd);
            }
        },
        clear(type) {
            if (type === 'img') {
                this.update_state = '';
                this.picture = '';
                this.sid = Math.round(Math.random() * 10000);
            }
            if (type === 'chat') {
                this.message = '';
            }
        },
        upload_image: function (ev) {
            let that = this;
            if (ev.type === 'paste') {
                this.can_paste_upload = true;
                let _ua = navigator.userAgent.toLowerCase();
                let WEBKIT = _ua.indexOf('applewebkit') > -1;
                /* Paste in chrome.*/
                /* Code reference from http://www.foliotek.com/devblog/copy-images-from-clipboard-in-javascript/. */
                if (WEBKIT) {
                    // 可以变成纯文本
                    var file = ev.clipboardData.items[0].getAsFile();
                    if (file) {
                        var reader = new FileReader();
                        reader.onload = function (evt) {
                            var result = evt.target.result;
                            // var arr = result.split(",");
                            // var data = arr[1]; // raw base64
                            // var contentType = arr[0].split(";")[0].split(":")[1];
                            that.paste_axios_image(result);
                            // window.FangChat.picUploadComplete(result);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        var text = ev.clipboardData.getData('text/plain');
                        // Chrome之类浏览器
                        document.execCommand('insertText', false, text);
                    }
                }
                /* Paste in firfox and other firfox.*/
                else {
                    setTimeout(() => {
                        let el = that.$el.querySelector('.im_chatarea');
                        let html = el.innerHTML;
                        if (html.search(/<img src="data:.+;base64,/) > -1) {
                            let img = html.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i)[1];
                            let text = html.replace(/<img(.*)src=\"([^\"]+)\"[^>]+>/, '');
                            // textarea.html(html);

                            that.paste_axios_image(img);

                        } else {
                            // textarea.text(textarea.text());
                            // Chrome之类浏览器
                            // document.execCommand("insertText", false, html);
                        }
                    }, 0);
                }
            }
            if (ev.type === 'change') {
                let files = ev.target.files || ev.dataTransfer.files;
                if (!files.length) {
                    return;
                }
                let fileType = files[0].type.split('/')[1];
                if (!/jpeg|jpg|gif|png|bmp/.test(fileType)) {
                    alert("不支持文件类型" + fileType + "，支持 jpeg,jpg,gif,png,bmp 图片类型文件！");
                    return
                }

                this.update_state = 'loading';
                this.$el.querySelector('form').submit();
            }
        },
        emoji_insert(key) {
            // let emoji = '<img class="im_emoji" data-key="' + key + '" src="' + setting.EMOJI.path + setting.EMOJI.map[key] + '" width="24" border="0" style="vertical-align: bottom;" />';
            debugger;
            // 插入图片的话仍会发生光标定位问题
            this.message = this.contenteditable_insert('[' + key + ']');
            this.emoji_show = false;
        },
        contenteditable_insert(p_html) {
            let el = this.$el.querySelector('.im_chatarea');
            let position = this.caret_position;
            let text = el.innerHTML;
            return text.slice(0, position) + p_html + text.slice(position, text.length);
        },
        // 光标插入和选择替换插入
        textarea_insert: function (p_text, t) {
            var $t = this.$el.querySelector('textarea');
            // 如果是旧版本IE
            if (document.selection) {
                $t.focus();
                var sel = document.selection.createRange();
                sel.text = p_text;
                $t.focus();
                var l = $t.value.length;
                sel.moveStart('character', -l);
                var wee = sel.text.length;
                if (arguments.length == 2) {
                    sel.moveEnd('character', wee + t);
                    if (t <= 0) {
                        sel.moveStart('character', wee - 2 * t - p_text.length);
                    } else {
                        sel.moveStart('character', wee - t - p_text.length);
                    }
                    sel.select();
                }
            } else if ($t.selectionStart || $t.selectionStart == '0') {
                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + p_text + $t.value.substring(endPos, $t.value.length);
                $t.focus();
                $t.selectionStart = startPos + p_text.length;
                $t.selectionEnd = startPos + p_text.length;
                $t.scrollTop = scrollTop;
                if (arguments.length == 2) {
                    $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
                    $t.focus();
                }
            } else {
                $t.value += p_text;
                $t.focus();
            }
            return $t.value;
        },
        paste_axios_image(base64) {
            this.$axios.post(setting.PASTE_IMG_PATH, util.queryStringify({
                projectName: 'webim',
                base64: encodeURIComponent(base64)
            })).then((response) => {
                let data = response.data;
                let url = setting.PASTE_IMG_BACK_URL_PREFIX + response.data.imgUrl;
                if (data.code !== '100') {
                    url = '';
                }
                window.FangChat.picUploadComplete(url);
            })
        },
        save_caret_position() {
            // https://stackoverflow.com/questions/35559097/how-to-add-emoji-in-between-the-letters-in-contenteditable-div
            function getCaretCharacterOffsetWithin(element) {
                var caretOffset = 0;
                var doc = element.ownerDocument || element.document;
                var win = doc.defaultView || doc.parentWindow;
                var sel;
                if (typeof win.getSelection != 'undefined') {
                    sel = win.getSelection();
                    if (sel.rangeCount > 0) {
                        var range = win.getSelection().getRangeAt(0);
                        var preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(element);
                        preCaretRange.setEnd(range.endContainer, range.endOffset);
                        caretOffset = preCaretRange.toString().length;
                    }
                } else if ((sel = doc.selection) && sel.type != 'Control') {
                    var textRange = sel.createRange();
                    var preCaretTextRange = doc.body.createTextRange();
                    preCaretTextRange.moveToElementText(element);
                    preCaretTextRange.setEndPoint('EndToEnd', textRange);
                    caretOffset = preCaretTextRange.text.length;
                }
                return caretOffset;
            }
            this.caret_position = getCaretCharacterOffsetWithin(this.$el.querySelector('.im_chatarea'))
        },
        emoji_close(e) {
            if (!this.$el.querySelector('.bq').contains(e.target)) {
                this.emoji_show = false;
            }
        },
        ...mapMutations({
            'viewChatMsg': VIEW_CHAT_MSG
        })
    },
    data() {
        return {
            // can_paste_upload: false,
            caret_position: 0,
            emoji_show: false,
            emoji_path: setting.EMOJI.path,
            emoji_map: setting.EMOJI.map,
            message: '',
            picture: '',
            sid: Math.round(Math.random() * 10000),
            update_state: ''
        }
    },
    created() {
        // this.$nextTick(function () {
        //     // console.log(this.$el.textContent) // => 'updated'
        // })
        let that = this,
            timer = null;
        global.FangChat.picUploadComplete = (data) => {
            clearTimeout(timer);
            if (!data) {
                that.update_state = 'fail';
                timer = setTimeout(() => {
                    that.clear('image');
                }, 2000);
            } else {
                that.update_state = 'success';
                that.picture = data;
                // that.showTip('图片上传成功，请发送。 <a href="' + data + '" target="_blank" data-id="look">\u67e5\u770b</a> <a href="javascript:;" data-id="del">\u5220\u9664</a>');// \u56fe\u7247\u4e0a\u4f20\u6210\u529f\uff0c\u8bf7\u53d1\u9001\u3002
            }
        };

        // 干掉IE http之类地址自动加链接
        try {
            document.execCommand("AutoUrlDetect", false, false);
        } catch (e) { }

        window.addEventListener('click', this.emoji_close);
    }
}
</script>

<style lang="scss" scoped>
div,
textarea,
form,
input,
img,
a {
    box-sizing: border-box;
}

div,
form {
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

textarea,
input {
    font-size: 12px;
    padding: 0;
    font-family: inherit;
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

/* 工具栏 */

.fbtools {
    width: 510px;
    height: 40px;
    background: #f7f7f7;
    padding: 10px 15px;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    position: relative;
}

.fbtools .bq,
.fbtools .tp,
.fbtools .jl {
    float: left;
    width: 18px;
    height: 18px;
    margin-right: 20px;
    overflow: hidden;
    cursor: pointer;
}

.fbtools .tp input {
    // width: 18px;
    // height: 15px;
    margin-left: -70px; // yangfan: 正好选择按钮在图片位置
    vertical-align: top;
    filter: alpha(opacity=0);
    opacity: 0;
    cursor: pointer;
}

.fbtools .bq {
    background: url(../assets/images/icon-bq.png);
}

.fbtools .bq.cur {
    background: url(../assets/images/icon-bq3.png);
}

.fbtools .bq:hover,
.fbtools .bq:active {
    background: url(../assets/images/icon-bq2.png);
}

.fbtools .tp {
    background: url(../assets/images/icon-tp.png);
    height: 15px;
    margin-top: 2px;
}

.fbtools .tp.cur {
    background: url(../assets/images/icon-tp3.png);
}

.fbtools .tp:hover,
.fbtools .tp:active {
    background: url(../assets/images/icon-tp2.png);
}

.fbtools .jl {
    background: url(../assets/images/icon-jl.png);
}

.fbtools .jl.cur {
    background: url(../assets/images/icon-jl3.png);
}

.fbtools .jl:hover,
.fbtools .jl:active {
    background: url(../assets/images/icon-jl2.png);
}

.fbtools .bqbox {
    width: 370px;
    height: 210px;
    background: #fff;
    padding: 15px;
    box-shadow: 0 0 3px 2px rgba(0, 0, 0, .1);
    position: absolute;
    top: -220px;
    left: 15px;
    z-index: 1000;
}

.fbtools .bqbox:after {
    content: "";
    width: 10px;
    height: 5px;
    background: url(../assets/images/arr-down2.jpg) no-repeat;
    background-size: 10px 5px;
    position: absolute;
    bottom: -5px;
    left: 4px;
}

.fbtools .bqbox .bqcon {
    width: 100%;
    height: 180px;
    overflow-y: auto;
}

.fbtools .bqbox .bqcon a {
    width: 26px;
    height: 26px;
    display: inline-block;
}

/* 输入内容 */

.textarea {
    width: 510px;
    height: 115px;
    padding: 10px 15px;
    position: relative;
}

.textarea textarea,
.textarea .im_chatarea {
    width: 100%;
    height: 90px;
    resize: none;
    background: #fff;
    font-size: 14px;
    color: #333;
    line-height: 20px;
    outline: none;
    border: none;
    overflow-y: auto;
}












/* 图片上传状态 */

.textarea .upload {
    width: 480px;
    height: 20px;
    padding-left: 20px;
    line-height: 20px;
    color: #4d90fe;
    font-size: 14px;
    background: url(../assets/images/icon-upload.png) no-repeat left center;
    background-color: #fff;
    position: absolute;
    top: 10px;
    left: 15px;
}

.textarea .upload.success {
    background-image: url(../assets/images/icon-upload-success.png);
}

.textarea .upload.success a {
    color: #4d90fe;
    text-decoration: underline;
}

.textarea .upload.fail {
    background-image: url(../assets/images/icon-upload-fail.png);
    color: #e01818;
}
</style>