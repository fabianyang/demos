<template>
    <div>
        <!-- 工具栏 -->
        <div class="fbtools clearfix">
            <!-- 工具选中时添加类名 cur -->
            <div id="im_facebutton" class="bq" :class="{ cur: emoji_show }" @click="emoji_show = !emoji_show" title="选择表情"></div>
            <div class="tp" :class="{ cur: upload.state && upload.type === 'img' }">
                <input type="file" title="发送图片" v-if="upload.state !== 'loading'" @change="uploadImage" />
            </div>
            <div class="wj" :class="{ cur: upload.state && upload.type === 'file' }">
                <input type="file" title="发送文件" v-if="upload.state !== 'loading'" @change="uploadFile" />
            </div>
            <div class="jl" :class="{ cur: historyContainerOpen }" @click="toggleHistoryContainer" title="历史记录"></div>
            <!-- 表情 默认隐藏 显示添加 show , yangfan: img 添加个 a 标签-->
            <div class="bqbox" v-show="emoji_show">
                <div class="bqcon">
                    <a v-for="(emoji, key) in emoji_map" @click="emoji_insert(key)">
                        <img :src="emoji" width="24" height="24" :title="key" :alt="key">
                    </a>
                </div>
            </div>
        </div>
        <!-- 输入内容组件 -->
        <div class="textarea" :style="{ height: changeHeight ? '85px' : '115px' }">
            <!--<textarea v-show="!upload.state" name="" cols="" rows="" placeholder="点击这里开始交流，按 Ctrl+Enter 发送信息" @paste="uploadImage" @keyup="send('chat', $event)" v-model="message"></textarea>-->
            <!-- yangfan:实验结果，不能只使用 blur save_caret_position 会位置为 0，需要 click 或 keyup 时都记录一下光标位置。插入表情 -->
            <div id="im_chatarea" :style="{ height: changeHeight ? '60px' : '90px' }" class='im_chatarea' contenteditable='true' v-show="!upload.state" @paste="uploadImage" @keydown.enter="sendChat" @click="save_caret_position" @keyup="save_caret_position" @focus="togglePrompt" @blur="togglePrompt" v-text="draft_text"></div>
            <p class='im_prompt' v-show="prompt_show && !upload.state" @click="togglePrompt">点击开始交流...</p>
            <!-- 上传状态 默认隐藏 显示添加 show -->
            <p class="upload loading" v-show="upload.state === 'loading'">上传中，请稍后...</p>
            <p class="upload success" v-show="upload.state === 'success'">
                <a :href="upload.response" class="image_box" v-if="upload.response && /jpeg|jpg|gif|png|bmp/.test(upload.type)" target="_blank">
                    <img :src="upload.response">
                </a>
                <a :href="upload.response" class="file_box"  v-if="upload.response && /docx?|xlsx?|pptx?|pdf|txt/.test(upload.type)" target="_blank">
                    <div class="info">
                        <h6>{{ upload.name }}</h6>
                        <p>
                            <span>{{ upload.size }}</span>
                        </p>
                    </div>
                    <div class="type">
                        <img :src="extension" :alt="upload.name" width="50" height="50">
                    </div>
                </a>
                <a @click="sendUpload" id="im_uploadSuccess" href="javascript:;" @keydown.enter="sendUpload">发送</a>
                <a @click="clear">删除</a>
            </p>
            <p class="upload fail" v-show="upload.state === 'fail'">图片上传失败，请稍后上传
                <a @click="clear">删除</a>
            </p>
        </div>
        <transition name="fade">
            <div class="im_error" v-if="error.show">{{ error.text }}</div>
        </transition>
    </div>
</template>

<script>
import api from '../socket/http'
import setting from '../setting';
import events from '../events';
import util from '../util';
import { mapState, mapMutations } from 'vuex';
import { VIEW_CHAT_CHANGE, VIEW_LEFT_OPEN, VIEW_TOGGLE_HISTORY,VIEW_DRAFT_CHAGE } from '../store/mutation-types';

let config = window.FangChat.config;
let el_textarea = (function() {
    let element = null;
    return () => {
        if (!element) {
            element = document.getElementById('im_chatarea');
        }
        return element;
    }
})();

let scope_send = function (cmd, message, content) {
    let date = new Date();
    let signame = this.leftWindow.signame.split('_');
    let data = {
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
        time: date.getTime(),
        source: 'send'
    }

    if (cmd === 'file') {
        data.content = this.fileContent;
        data.extension = this.upload.type,
        data.filename = this.upload.name,
        data.size = this.upload.size
    }

    this.viewChatMsg(data);
    events.trigger('view:send:message', data);

    if (!this.historyContainerOpen) {
        this.toggleHistory({
            open: 0
        });
    }
}

let scope_errorShow = function (text) {
    if (!this.error.show) {
        this.error.show = true;
        this.error.text = text;
        setTimeout(() => {
            this.error.show = false;
        }, 500);
    }
}

let scope_uploadComplete = function(data, type) {
    let that = this;
    let success = () => {
        that.upload.state = 'success';
        that.upload.response = data;
        this.$nextTick(() => {
            document.getElementById('im_uploadSuccess').focus();
        });
    }

    if (!data) {
        that.upload.state = 'fail';
    } else {
        if (type === 'img') {
            let image = new Image();
            image.src = data;
            image.onload = function (a) {
                success();
            }
        }
        if (type === 'file') {
            success();
        }
        // that.showTip('图片上传成功，请发送。 <a href="' + data + '" target="_blank" data-id="look">\u67e5\u770b</a> <a href="javascript:;" data-id="del">\u5220\u9664</a>');// \u56fe\u7247\u4e0a\u4f20\u6210\u529f\uff0c\u8bf7\u53d1\u9001\u3002
    }

    this.viewDraftChange(this.leftWindow.id);
    this.clear('chat');
}

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

function moveEnd(element) {
    // var range = document.createRange();
    // range.selectNodeContents(element);
    // range.collapse(false);
    // var sel = window.getSelection();
    // sel.removeAllRanges();
    // sel.addRange(range);

    element.focus(); //解决ff不获取焦点无法定位问题
    if (window.getSelection) {//ie11 10 9 ff safari
        var range = window.getSelection();//创建range
        range.selectAllChildren(element);//range 选择element下所有子内容
        range.collapseToEnd();//光标移至最后
    }
    else if (document.selection) {//ie10 9 8 7 6 5
        var range = document.selection.createRange();//创建选择对象
        //var range = document.body.createTextRange();
        range.moveToElementText(element);//range定位到element
        range.collapse(false);//光标移至最后
        range.select();
    }
}

function sizeCompute(b) {
    let kb = b / 1024
    if (kb < 1024) {
        return parseFloat(kb.toFixed(2)) + 'kb';
    }
    let mb = kb / 1024;
    return parseFloat(mb.toFixed(2)) + 'mb';
}

export default {
    name: 'left-chat-textarea',
    computed: {
        draft_text() {
            let id = this.leftWindow.id;
            if (!id) {
                return '';
            }
            let draft = this.draft[id];
            if (draft) {
                this.prompt_show = false;
                el_textarea().innerText = draft;
                this.$nextTick(() => {
                    moveEnd(el_textarea());
                })
            } else {
                this.prompt_show = true;
                this.clear('chat');
            }
            this.clear();
            return draft || '';
        },
        extension() {
            return setting.filePicture[this.upload.type.substr(0, 3)] || setting.filePicture['i'];
        },
        ...mapState({
            historyContainerOpen: state => state.historyContainer.open,
            leftWindow: state => state.leftWindow,
            draft: state => state.draft
        })
    },
    methods: {
        togglePrompt(e) {
            // console.log(e.type);
            // 提示被点击
            if (e.type === 'click') {
                this.prompt_show = false;
                el_textarea().focus();
                return;
            }
            // 输入框获得焦点
            if (e.type === 'focus') {
                this.prompt_show = false;
                return;
            }
            // 输入框失去焦点
            if (e.type === 'blur') {
                let text = el_textarea().innerText.trim();
                if (text) {
                    this.prompt_show = false;
                    return;
                }
            }
        },
        sendChat(event) {
            event.preventDefault();
            let message = el_textarea().innerText.trim();
            if (!message) {
                this.clear('chat');
                this.prompt_show = false;
                scope_errorShow.call(this, '请输入发送消息');
                return;
            }
            if (message.length > 1000) {
                scope_errorShow.call(this, '最多输入1000字');
                return;
            }

            scope_send.call(this, 'chat', message);
            this.clear('chat');
        },
        sendUpload() {
            let message = this.upload.response;
            if (!message) {
                return;
            }
            scope_send.call(this, this.fileContent ? 'file' : 'img', message);
            this.clear();
        },
        clear(type) {
            if (type === 'chat') {
                el_textarea().innerText = '';
            } else {
                this.upload = {
                    type: '',
                    size: '',
                    name: '',
                    response: '',
                    state: ''
                };
                this.fileContent = '';
            }
        },
        uploadImage: function (ev) {
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
                        this.clear();
                        this.upload.state = 'loading';
                        this.upload.type = 'png';
                        var reader = new FileReader();
                        reader.onload = function (evt) {
                            var result = evt.target.result;
                            // var arr = result.split(",");
                            // var data = arr[1]; // raw base64
                            // var contentType = arr[0].split(";")[0].split(":")[1];
                            api.pasteUploadImage(result).then((data) => {
                                scope_uploadComplete.call(that, data, 'img');
                            }).catch(() => {
                                scope_uploadComplete.call(that);
                            });
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
                        let el = el_textarea();
                        let html = el.innerHTML;
                        if (html.search(/<img src="data:.+;base64,/) > -1) {
                            this.clear();
                            this.upload.state = 'loading';
                            this.upload.type = 'png';
                            let img = html.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i)[1];
                            // let text = html.replace(/<img(.*)src=\"([^\"]+)\"[^>]+>/g, '');
                            el.innerText = html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, '');
                            api.pasteUploadImage(img).then((data) => {
                                scope_uploadComplete.call(that, data, 'img');
                            }).catch(() => {
                                scope_uploadComplete.call(that);
                            });

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
                    alert('不支持文件类型' + fileType + '，支持 jpeg,jpg,gif,png,bmp 图片类型文件！');
                    return;
                }
                this.clear();
                this.upload.state = 'loading';
                this.upload.type = fileType;
                let file = files[0];
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
                    console.log(evt.target.result.length);
                    api.pasteUploadImage(evt.target.result).then((data) => {
                        scope_uploadComplete.call(that, data, 'img');
                    }).catch(() => {
                        scope_uploadComplete.call(that);
                    });
                };
                reader.readAsDataURL(file);
                // this.$el.querySelector('form').submit();
            }
        },
        uploadFile(ev) {
            let files = ev.target.files || ev.dataTransfer.files;
            if (!files.length) {
                return;
            }
            let file = files[0];
            let fileName = file.name;
            let fileType = fileName.substr(fileName.lastIndexOf('.') + 1);

            if (!/docx?|xlsx?|pptx?|pdf|txt/.test(fileType)) {
                alert('不支持文件类型' + fileType + '，支持 doc, xls, ppt, pdf, txt 类型文件！');
                return;
            }
            this.clear();

            let fileSize = file.size;
            this.upload.state = 'loading';
            this.upload.type = fileType;
            this.upload.name = fileName;
            this.upload.size = sizeCompute(fileSize);

            this.fileContent = JSON.stringify({
                filename: fileName,
                mimetype: file.type,
                size: fileSize
            });

            api.uploadFile(file).then((response) => {
                let data = response.data;
                scope_uploadComplete.call(this, data.data, 'file');
            }).catch(function (error) {
                scope_uploadComplete.call(this)
            });
            return;
        },
        emoji_insert(key) {
            let el = el_textarea();
            // let emoji = '<img class="im_emoji" data-key="' + key + '" src="' + setting.EMOJI.path + setting.EMOJI.map[key] + '" width="24" border="0" style="vertical-align: bottom;" />';
            // 插入图片的话仍会发生光标定位问题
            // this.message = this.contenteditable_insert('[' + key + ']');
            let position = this.caret_position;
            // innerHtml ie 下空值会多出 <br>
            let text = el.innerText;
            // console.log(text);
            el.innerText = text.slice(0, position) + '[' + key + ']' + text.slice(position, text.length);
            this.emoji_show = false;
            this.prompt_show = false;
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
            this.save_caret_position();
        },
        save_caret_position() {
            this.caret_position = getCaretCharacterOffsetWithin(el_textarea());
            // console.log('caret position', this.caret_position);
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
            'toggleHistory': VIEW_TOGGLE_HISTORY,
            'viewDraftChange': VIEW_DRAFT_CHAGE
        })
    },
    data() {
        return {
            changeHeight: false,
            caret_position: 0,
            prompt_show: true,
            emoji_show: false,
            // emoji_path: setting.EMOJI.path,
            emoji_map: setting.EMOJI,
            // 用原生获取，不进行双向绑定，插入表情或普通输入有影响
            // message: '',
            upload: {
                type: '',
                size: '',
                name: '',
                response: '',
                state: ''
            },
            error: {
                text: '',
                show: false
            },
            fileContent: ''
        }
    },
    created() {
        this.$nextTick(() => {
            if (window.screen.height < 700) {
                this.changeHeight = true;
            }

            document.getElementById('im_app').addEventListener('click', this.emoji_close);

        });

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
* {
    box-sizing: border-box;
}

div,
form,
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

p {
    white-space: normal;
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
.fbtools .jl,
.fbtools .wj {
    float: left;
    width: 18px;
    height: 18px;
    margin-right: 20px;
    overflow: hidden;
    cursor: pointer;
}

.fbtools .tp input, .fbtools .wj input {
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

.fbtools .wj {
    background: url(../assets/images/icon-wj.png);
}

.fbtools .wj.cur {
    background: url(../assets/images/icon-wj3.png);
}

.fbtools .wj:hover,
.fbtools .wj:active {
    background: url(../assets/images/icon-wj2.png);
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

.fbtools .bqbox .bqcon a:hover img {
    transform: scale(1.1);
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
    background-color: #fff;
    position: absolute;
    top: 10px;
    left: 15px;
}

.textarea .upload.loading {
    background: url(../assets/images/icon-upload.png) no-repeat left center;
}

.textarea .upload.success {
    // background-image: url(../assets/images/icon-upload-success.png);
    // yangfan add
    height: auto;
    top: 0;
    left: 0;
    padding: 10px 15px;
}

.textarea .upload.success a {
    color: #4d90fe;
    // yangfan add
    display: inline-block;
    vertical-align: middle;
    outline: none;
}

.upload.success .image_box img {
    max-width: 121px;
    max-height: 89px;
    border-radius: 5px;
}

.upload.success .file_box {
    color: #4d90fe;
    display: inline-block;
    width: 220px;
    height: 70px;
    background: #f7f7f7;
    padding: 10px;
}

.upload.success .file_box .info {
    width: 140px;
    height: 50px;
    float: left;
    margin-right: 10px;
}

.upload.success .file_box .info h6 {
    height: 34px;
    line-height: 17px;
    color: #333;
    font-size: 12px;
    font-weight: normal;
    overflow: hidden;
}

.upload.success .file_box .info p {
    color: #999;
    font-size: 12px;
}

.upload.success .file_box .type {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    overflow: hidden;
}

.upload.fail {
    background-image: url(../assets/images/icon-upload-fail.png) no-repeat left center;
    color: #e01818;
}

.upload.fail a {
    color: #4d90fe;
}

.im_prompt {
    width: 480px;
    height: 20px;
    padding: 10px 15px;
    color: #aaa;
    position: absolute;
    top: 0;
    left: 0;
    cursor: text;
}

.im_error {
    position: absolute;
    left: 20%;
    top: 30%;
    z-index: 1000;
    text-align: center;
    background: rgba(0, 0, 0, 0.6);
    padding: 10px;
    width: 200px;
    border-radius: 5px;
    color: #fff;
    font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .5s
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active in <2.1.8 */

{
    opacity: 0
}
</style>