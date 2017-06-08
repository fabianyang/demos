const webSocketUrl = 'ws://124.251.46.69:9999/chat';

const httpUrl = 'http://124.251.46.69:8022/ClientInterface';


// const onlineUrl = 'http://testchat.client.3g.fang.com/OnLine';
// const longPollingUrl = 'http://webim.client.3g.test.fang.com/';


let emojis = (function () {
    var list = ['微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭', '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '愉快', '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '悠闲', '奋斗', '咒骂', '疑问', '嘘', '晕', '疯了', '哀', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼', '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒', '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '嘴唇', '爱心', '心碎', '蛋糕', '闪电', '炸弹', '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引', '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '投降', '激动', '街舞', '献吻', '左太极', '右太极'];
    var map = {};
    for (var i = 0; i < list.length; i++) {
        map[list[i]] = 'emoji_' + (i + 1001 + '').substr(1) + '.png';
    }
    return map;
})();

export default {
    // 长轮询时间间隔
    // POLLING_INTERVAL: 40000,
    // 在线
    // ONLINE_STATE_SEARCH_INTERVAL: 120000,
    WEBSOCKET_SERVER: webSocketUrl,
    HTTP_SERVER: httpUrl,
    UPLOAD_IMG_PATH: 'http://img1u.soufun.com/upload/mchat?channel=webim&city=',
    UPLOAD_IMG_BACK_URL_PATH: 'http://activities.m.fang.com/imchat/',
    PASTE_IMG_PATH: 'http://activities.m.fang.com/img/?c=imgUpload&a=ajaxUploadImg',
    PASTE_IMG_BACK_URL_PREFIX: 'http://static.soufunimg.com/h5',
    EMOJI: {
        map: emojis,
        path: 'http://js.soufunimg.com/upload/webim/im2/images/emoji_s/'
    }
    // ONLINE_PATH: onlineUrl,
    // LONGPOLLING_SERVER: longPollingUrl,
    // LONG_CONNECT_REQUEST_PATH: longPollingUrl + 'longPolling',
    // AJAX_PROXY_PATH: longPollingUrl + 'ajaxproxy.html'
};

