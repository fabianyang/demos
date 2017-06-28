import events from '../events';
import util from '../util';

let formatReceiveJSON = (json) => {
    // group 类型发送的是群 id, 个人是 oa:id
    // 是不是要加一层过滤判断是否发送的是自己？ msgLists 有判断么？
    // let isGroup = json.command.split('_')[0] === 'group';
    // if (!isGroup) {
    //     if (json.sendto !== config.username) {
    //         console.log('is send to: ' + json.sendto);
    //     }
    // }
    let messagetime = json.messagetime || util.dateFormat(new Date());
    let time = new Date(messagetime).getTime();
    return {
        // 进行 msgList 信息列表区分。 VIEW_CHAT_CHANGE 使用
        id: json.from || json.form,
        from: json.from || json.form,
        nickname: json.nickname,
        // 发送消息 id oa:125460 群没有 oa 前缀
        sendto: json.sendto,
        command: json.command,
        messageid: json.messageid,
        messagekey: json.messagekey,
        messagetime: messagetime,
        time: time
    };
};

let isJSON = (str) => {
    if (typeof str === 'string') {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
};

class InterfaceReceive {
    constructor() {
    }

    // 文字通知的
    // 纯链接文字通知（属于文字通知的一种）
    receiveCommonNotice(json) {
        let msg = formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        let message = json.message.split('^@');

        let card = null;
        if (content && content.title && content.pic && content.desc) {
            card = {
                title: content.title,
                pic: content.pic,
                desc: content.desc
            };
        }
        msg = Object.assign(msg, {
            purpose: json.purpose,
            // 通知标题
            housetitle: json.housetitle,
            // 收件人
            mallname: json.mallName,
            // 通知发送人姓名
            usertitle: content.UserTitle,
            // 通知内容
            message: message[0],
            pics: message.slice(1),
            card: card
        });

        events.trigger('socket:receive:notice', msg);
    }

    receiveVoiceNotice(json) {
        let msg = formatReceiveJSON(json);
        let content = isJSON(json.msgContent);

        msg = Object.assign(msg, {
            purpose: json.purpose,
            // 通知标题
            housetitle: json.housetitle,
            // 收件人
            mallname: json.mallName,
            // 通知发送人姓名
            usertitle: content.UserTitle,
            // 通知内容
            message: '[语音]请到APP中查看'
        });

        events.trigger('socket:receive:notice', msg);
    }

    receiveFile(json) {
        let msg = formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        msg = Object.assign(msg, {
            message: json.message,
            extension: content.filename.substring(content.filename.lastIndexOf('.') + 1).toLowerCase(),
            filename: content.filename,
            size: content.size
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveCard(json) {
        let msg = formatReceiveJSON(json);
        let info = json.message.split(';');
        msg = Object.assign(msg, {
            message: json.message,
            card_nickname: info[0],
            card_avatar: info[1],
            card_department: info[2],
            card_username: info[3]
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveLocation(json) {
        let msg = formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        let title = content.title.split(';');
        let loc = json.message.split(';').join(',');

        msg = Object.assign(msg, {
            message: loc,
            title0: json.isMine ? '我的位置' : title[0],
            title1: title[1],
            // pic: 'http://api.map.baidu.com/staticimage/v2?ak=E4805d16520de693a3fe707cdc962045&center='+ loc+'&width=500&height=500&zoom=11&labels=%E6%B5%B7%E6%B7%80|116.487812,40.017524|%E6%9C%9D%E9%98%B3|%E5%A4%A7%E7%BA%A2%E9%97%A8|116.442968,39.797022|%E4%B8%B0%E5%8F%B0|116.275093,39.935251|116.28377,39.903743&labelStyles=%E6%B5%B7%E6%B7%80,1,32,0x990099,0xff00,1|%E4%B8%9C%E5%8C%97%E4%BA%94%E7%8E%AF,1,14,0xffffff,0x996600,1|%E6%9C%9D%E9%98%B3,1,14,,0xff6633,1|%E5%A4%A7%E7%BA%A2%E9%97%A8,1,32,0,0xffffff,1|%E6%9C%AA%E7%9F%A5%EF%BC%9F%EF%BC%81%23%EF%BF%A5%25%E2%80%A6%E2%80%A6%26*%EF%BC%88%EF%BC%89%EF%BC%81,1,14,0xff0000,0xffffff,1|%E4%B8%B0%E5%8F%B0%E5%A4%A7%E8%90%A5,1,24,0,0xcccccc,1|%E8%A5%BF%E5%9B%9B%E7%8E%AF,,14,0,0xffffff,|%E6%88%91%E4%BB%AC%E4%BC%9F%E5%A4%A7%E7%A5%96%E5%9B%BD%E9%A6%96%E9%83%BD%E5%8C%97%E4%BA%AC,1,25,0xffff00,0xff0000,0'
            pic: content.pic
        });
        events.trigger('socket:receive:chat', msg);
    }
    receiveRedBag(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[红包]请到APP中查看'
        });
        events.trigger('socket:receive:chat', msg);
    }
    receiveVideo(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[语音]请到APP中查看'
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveVoice(json) {
        let msg = formatReceiveJSON(json);
        let info = json.split(';');
        msg = Object.assign(msg, {
            message: info[0],
            second: info[2]
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveImage(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: json.message
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveLinkChat(json) {
        let msg = formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        msg = Object.assign(msg, {
            message: json.message,
            title: content.title,
            pic: content.pic,
            desc: content.desc
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveCommonChat(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: json.message
        });
        events.trigger('socket:receive:chat', msg);
    }

    socket_error() {
        events.trigger('socket:state:change', 'error');
    }

    socket_close() {
        events.trigger('socket:state:change', 'close');
    }

    imei() {
        let imei = util.getCookie('fang_oaim_imei');
        if (!imei) {
            imei = util.imei_guid();
            util.setCookie('fang_oaim_imei', this.imei, 30);
        }
        return imei;
    }
}

export default InterfaceReceive;