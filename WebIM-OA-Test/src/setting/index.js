// 正式
const webSocketUrl = 'ws://124.251.50.51:9999';
const longPollingUrl = 'http://124.251.50.52:8022';
const httpUrl = 'http://oachat.client.3g.fang.com';
// 测试
// const webSocketUrl = 'ws://124.251.46.69:9999';
// const longPollingUrl = 'http://124.251.46.69:8022';
// const httpUrl = 'http://testoachat.client.3g.fang.com';

// const onlineUrl = 'http://testchat.client.3g.fang.com/OnLine';

let emoji_s = (function () {
    var list = ['微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭', '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '愉快', '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '悠闲', '奋斗', '咒骂', '疑问', '嘘', '晕', '疯了', '哀', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼', '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒', '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '嘴唇', '爱心', '心碎', '蛋糕', '闪电', '炸弹', '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引', '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '投降', '激动', '街舞', '献吻', '左太极', '右太极'];
    var map = {};
    for (var i = 0; i < list.length; i++) {
        let png = 'emoji_' + (i + 1001 + '').substr(1) + '.png';
        map[list[i]] = require('../assets/emoji_s/' + png);
    }
    return map;
})();

export default {
    // 长轮询时间间隔
    // POLLING_INTERVAL: 40000,
    // 在线
    // ONLINE_STATE_SEARCH_INTERVAL: 120000,
    WEBSOCKET_CHAT: webSocketUrl + '/chat',
    LONGPOLLING_CHAT: longPollingUrl + '/longPolling',
    LONGPOLLING_CI: longPollingUrl + '/ClientInterface',
    HTTP_CI: httpUrl + '/ClientInterface',
    UPLOAD_IMG_PATH: 'http://img1u.soufun.com/upload/mchat?channel=webim&city=',
    UPLOAD_IMG_BACK_URL_PATH: 'http://activities.m.fang.com/im/?c=imchat',
    PASTE_IMG_PATH: 'http://activities.m.test.fang.com/im/?c=imgUpload&a=ajaxUploadImg',
    // PASTE_IMG_PATH: 'http://10.2.101.180:3100/im/?c=imgUpload&a=ajaxUploadImg',
    // PASTE_IMG_PATH: 'http://activities.m.fang.com/im/?c=imgUpload&a=ajaxUploadImg',
    PASTE_IMG_BACK_URL_PREFIX: 'http://static.soufunimg.com/h5',
    EMOJI: emoji_s,
    defaultAvatar: 'http://js.soufunimg.com/common_m/m_public/images/fang.jpg',
    filePicture: {
        doc: require('../assets/images/file-word.png'),
        xls: require('../assets/images/file-exal.png'),
        ppt: require('../assets/images/file-ppt.png'),
        pdf: require('../assets/images/file-pdf.png'),
        txt: require('../assets/images/file-txt.png'),
        i: require('../assets/images/file-wenzi.png')
    }
};

