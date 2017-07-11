<template>
    <div>
        <!-- 工具栏 -->
        <div class="fbtools clearfix">
            <!-- 工具选中时添加类名 cur -->
            <div id="im_facebutton" class="bq" :class="{ cur: emoji_show }" @click="emoji_show = !emoji_show"></div>
            <div class="tp" :class="{ cur: upload_state }">
                <!--<form method="Post" enctype="multipart/form-data" :action="upload_url" :target="upload_iframe_name">-->
                <input type="file" title="发送图片" v-if="upload_state !== 'success' && upload_state !== 'fail'" :name="upload_input_name" @change="upload_image" />
                <!--</form>-->
            </div>
            <div class="jl" :class="{ cur: historyContainerOpen }" @click="toggleHistoryContainer"></div>
            <!-- 表情 默认隐藏 显示添加 show , yangfan: img 添加个 a 标签-->
            <div class="bqbox" v-show="emoji_show">
                <div class="bqcon">
                    <a v-for="(emoji, key, index) in emoji_map" @click="emoji_insert(key)">
                        <img :src="emoji_path + emoji" width="24" height="24" :title="key" :alt="emoji + '_' + index">
                    </a>
                </div>
            </div>
        </div>
        <!-- 输入内容组件 -->
        <div class="textarea">
            <!--<textarea v-show="!upload_state" name="" cols="" rows="" placeholder="点击这里开始交流，按 Ctrl+Enter 发送信息" @paste="upload_image" @keyup="send('chat', $event)" v-model="message"></textarea>-->
            <!-- yangfan:实验结果，不能只使用 blur save_caret_position 会位置为 0，需要 click 或 keyup 时都记录一下光标位置。插入表情 -->
            <div id="im_chatarea" class='im_chatarea' contenteditable='true' v-show="!upload_state" @paste="upload_image" @keydown.enter="send('chat', $event)" @click="save_caret_position" @keyup="save_caret_position" @focus="togglePrompt" @blur="togglePrompt"></div>
            <div class='im_prompt' v-show="prompt_state && !upload_state" @click="togglePrompt">点击开始交流...</div>
            <!-- 上传状态 默认隐藏 显示添加 show -->
            <p class="upload" v-show="upload_state === 'loading'">图片上传中，请稍后...</p>
            <p class="upload success" v-show="upload_state === 'success'">图片上传成功
                <a :href="picture" target="_blank">查看</a>
                <a @click="send('img')">发送</a>
                <a @click="clear('img')">删除</a>
            </p>
            <p class="upload fail" v-show="upload_state === 'fail'">图片上传失败，请稍后上传
                <a @click="clear('img')">删除</a>
            </p>
            <!--<iframe v-if="upload_state !== 'success' && upload_state !== 'fail'" :name="upload_iframe_name" width="0" height="0" scrolling="no" frameBorder="0" style="visibility: hidden;"></iframe>-->
        </div>
    </div>
</template>

<script>
import api from '../socket/http'
import setting from '../setting';
import events from '../events';
import util from '../util';
import { mapState, mapMutations } from 'vuex';
import { VIEW_CHAT_CHANGE,VIEW_LEFT_OPEN, VIEW_TOGGLE_HISTORY } from '../store/mutation-types';

let config = window.FangChat.config;
let el_textarea = null;

let getElTextarea = () => {
    if (!el_textarea) {
        el_textarea = document.getElementById('im_chatarea');
    }
    return el_textarea;
}

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
            historyContainerOpen: state => state.historyContainer.open,
            leftWindow: state => state.leftWindow
        }),
    },
    methods: {
        togglePrompt(e) {
            if (e.type === 'click') {
                this.prompt_state = false;
                getElTextarea().focus();
                return;
            }
            if (e.type === 'focus') {
                this.prompt_state = false;
                return;
            }
            if (e.type === 'blur') {
                if (getElTextarea().innerText.trim()) {
                    this.prompt_state = false;
                    return;
                }
            }
            this.prompt_state = true;
        },
        send(cmd, event = { ctrlKey: true, preventDefault() { } }) {
            event.preventDefault();
            if (cmd === 'img' && !this.picture) {
                return;
            }

            let message = getElTextarea().innerText;
            if (cmd === 'chat') {
                if (!message) {
                    alert('请输入发送消息');
                    return;
                }
                if (message.length > 1000) {
                    alert('最多输入1000字');
                    return;
                }
            }

            if (cmd === 'img') {
                message = this.picture
            }
            let date = new Date();
            let signame = this.leftWindow.signame.split('_');
            let msg = {
                // 进行 msgList 信息列表区分。 VIEW_CHAT_CHANGE 使用
                id: this.leftWindow.id,
                from: config.username,
                // 发送消息 id oa:125460 群没有 oa 前缀
                sendto: this.leftWindow.id,
                message: message,
                // 消息类型，是否为群聊，目前 group: 群聊天, 其他: 单聊
                command: signame[2] === 'group' ? 'group_' + cmd : cmd,
                // 消息是否发送完成
                messagestate: 0,
                messagekey: util.guid(),
                messagetime: util.dateFormat(date),
                time: date.getTime()
            }

            if (!this.historyContainerOpen) {
                this.toggleHistory({
                    open: 0
                });
            }

            this.viewChatMsg(msg);
            events.trigger('view:send:message', msg);

            // console.log('send', msg);
            this.clear(cmd);
        },
        clear(type) {
            if (type === 'img') {
                this.upload_state = '';
                this.picture = '';
                this.sid = Math.round(Math.random() * 10000);
            }
            if (type === 'chat') {
                getElTextarea().innerText = '';
            }
        },
        upload_image: function (ev) {
                        debugger;
            let that = this;
            if (ev.type === 'paste') {
                // this.can_paste_upload = true;
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
                            api.pasteUploadImage(result);
                            // window.FangChat.picUploadComplete(result);
                        };
                        reader.readAsDataURL(file);
                    }
                    // else {
                    //     var text = ev.clipboardData.getData('text/plain');
                    //     // Chrome之类浏览器
                    //     document.execCommand('insertText', false, text);
                    // }
                }
                /* Paste in firfox and other firfox.*/
                else {
                    setTimeout(() => {
                        let el = getElTextarea();
                        let html = el.innerHTML;
                        console.log(el.innerHTML);
                        if (html.search(/<img src="data:.+;base64,/) > -1) {
                            let img = html.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i)[1];
                            // let text = html.replace(/<img(.*)src=\"([^\"]+)\"[^>]+>/g, '');
                            el.innerText = html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, '');;
                            api.pasteUploadImage(img);

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
                let file = files[0];
                this.upload_state = 'loading';
                let reader = new FileReader();
                reader.onload = function (evt) {
                    // let img = new Image();
                    // img.src = evt.target.result;
                    // img.onload = function ()
                    // {
                    //     let canvas = document.createElement('canvas');
                    //     let ctx = canvas.getContext('2d');
                    //     canvas.width = this.width;
                    //     canvas.height = this.height;
                    //     ctx.drawImage(img, 0, 0, this.width, this.height);
                    //     // let base64 = canvas.toDataURL('image/jpeg', 0.5);
                    //     let base64 = canvas.toDataURL();
                    //     // let result = {
                    //     //     url: window.URL.createObjectURL(file),
                    //     //     base64: base64,
                    //     //     clearBase64: base64.substr(base64.indexOf(',') + 1),
                    //     //     suffix: base64.substring(base64.indexOf('/') + 1, base64.indexOf(';')),
                    //     // };
                    //     api.pasteUploadImage(base64);
                    // }
                    api.pasteUploadImage(evt.target.result);
                };
                reader.readAsDataURL(file);
                // this.$el.querySelector('form').submit();
            }
        },
        emoji_insert(key) {
            let el = getElTextarea();
            // let emoji = '<img class="im_emoji" data-key="' + key + '" src="' + setting.EMOJI.path + setting.EMOJI.map[key] + '" width="24" border="0" style="vertical-align: bottom;" />';
            // 插入图片的话仍会发生光标定位问题
            // this.message = this.contenteditable_insert('[' + key + ']');
            let position = this.caret_position;
            // innerHtml ie 下空值会多出 <br>
            let text = el.innerText;

            console.log(text);
            el.innerText = text.slice(0, position) + '[' + key + ']' + text.slice(position, text.length);
            this.emoji_show = false;
            this.prompt_state = false;
            el.focus();
            // https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&uact=8&ved=0ahUKEwiI7NqX9vbUAhVKFJQKHfKWAIYQFggvMAE&url=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F24115860%2Fset-caret-position-at-a-specific-position-in-contenteditable-div&usg=AFQjCNFcDFEz45PuDlQCGVqYsYt1S8EZUQ
            // https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwiI7NqX9vbUAhVKFJQKHfKWAIYQFggnMAA&url=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F6249095%2Fhow-to-set-caretcursor-position-in-contenteditable-element-div&usg=AFQjCNEWqQvJnN7lDdXPZldY5nuiKlIa2Q
            var range = document.createRange();
            range.setStart(el.firstChild, this.caret_position + key.length + 2);
            // range.setEnd(el.firstChild, this.caret_position + key.length + 2);
            range.collapse(true);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
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
        save_caret_position() {
            // https://stackoverflow.com/questions/35559097/how-to-add-emoji-in-between-the-letters-in-contenteditable-div
            function getCaretCharacterOffsetWithin(element) {
                var caretOffset = 0;
                var doc = element.ownerDocument || element.document;
                var win = doc.defaultView || doc.parentWindow;
                var sel;
                if (typeof win.getSelection != "undefined") {
                    sel = win.getSelection();
                    if (sel.rangeCount > 0) {
                        var range = win.getSelection().getRangeAt(0);
                        var preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(element);
                        preCaretRange.setEnd(range.endContainer, range.endOffset);
                        caretOffset = preCaretRange.toString().length;
                    }
                } else if ((sel = doc.selection) && sel.type != "Control") {
                    var textRange = sel.createRange();
                    var preCaretTextRange = doc.body.createTextRange();
                    preCaretTextRange.moveToElementText(element);
                    preCaretTextRange.setEndPoint("EndToEnd", textRange);
                    caretOffset = preCaretTextRange.text.length;
                }
                return caretOffset;
            }
            this.caret_position = getCaretCharacterOffsetWithin(getElTextarea());
            console.log('caret position', this.caret_position);
        },
        emoji_close(e) {
            if (!document.getElementById('im_facebutton').contains(e.target)) {
                this.emoji_show = false;
            }
        },
        toggleHistoryContainer() {
            if (!this.historyContainerOpen) {
                this.toggleHistory({
                    state: 'loading',
                    open: 1
                });
                events.trigger('store:request:history', {
                    id: this.leftWindow.id,
                    exec: 'more_history'
                });
            } else {
                this.toggleHistory({
                    open: 0
                });
            }
        },
        ...mapMutations({
            'viewChatMsg': VIEW_CHAT_CHANGE,
            'toggleHistory': VIEW_TOGGLE_HISTORY
        })
    },
    data() {
        return {
            // can_paste_upload: false,
            prompt_state: true,
            caret_position: 0,
            emoji_show: false,
            emoji_path: setting.EMOJI.path,
            emoji_map: setting.EMOJI.map,
            // 用原生获取，不进行双向绑定，插入表情或普通输入有影响
            // message: '',
            picture: '',
            sid: Math.round(Math.random() * 10000),
            upload_state: ''
        }
    },
    created() {
        this.$nextTick(() => {
            document.getElementById('im_app').addEventListener('click', this.emoji_close);
        });

        let that = this,
            timer = null;
        // oa 无法使用 form 提交上传图片。跨域。郁闷
        // document.domain = 'fang.com';
        window.FangChat.picUploadComplete = (data) => {
            clearTimeout(timer);
            if (!data) {
                that.upload_state = 'fail';
                timer = setTimeout(() => {
                    that.clear('image');
                }, 2000);
            } else {
                that.upload_state = 'success';
                that.picture = data;
                // that.showTip('图片上传成功，请发送。 <a href="' + data + '" target="_blank" data-id="look">\u67e5\u770b</a> <a href="javascript:;" data-id="del">\u5220\u9664</a>');// \u56fe\u7247\u4e0a\u4f20\u6210\u529f\uff0c\u8bf7\u53d1\u9001\u3002
            }
        };

        // 干掉IE http之类地址自动加链接
        try {
            document.execCommand("AutoUrlDetect", false, false);
        } catch (e) {
            console.log('AutoUrlDetect', e);
        }
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
    margin-left: -145px; // yangfan: 正好选择按钮在图片位置
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
    background-color: #fff;
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

.textarea .upload.fail a {
    color: #4d90fe;
    text-decoration: underline;
}

.im_prompt {
    width: 480px;
    height: 20px;
    padding: 10px 15px;
    color: #aaa;
    position: absolute;
    top: 0;
    left: 0;
}
</style>