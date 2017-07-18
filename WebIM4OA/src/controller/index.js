import events from '../events';
import socket from '../socket';
import store from '../store';

import {
    SOCKET_STATE_CHANGE,
    SOCKET_USER_CHANGE,
    SOCKET_MANAGER_CHANGE,
    SOCKET_MATE_CHANGE,
    SOCKET_GROUP_CHANGE,
    SOCKET_CHAT_CHANGE,
    SOCKET_NOTICE_CHANGE,
    SOCKET_SEARCH_USER_CHANGE,
    SOCKET_RECONNECT,
    SOCKET_RESTORE_INFO,
    VIEW_STATE_CHANGE,
    VIEW_CHAT_MSGKEY,
    VIEW_CHAT_CHANGE,
    SOCKET_RECENT_CHANGE
} from '../store/mutation-types';

// 请求超时。信号不好，或者网络临时性关闭，不会执行 onclose
events.on('socket:state:change', function (data) {
    // setTimeout 防止连接过快，没有过度
    store.commit(SOCKET_STATE_CHANGE, data);
    if (data === 'open') {
        setTimeout(() => {
            store.commit(SOCKET_STATE_CHANGE, '');
        }, 1000);
    }
    if (data === 'close' || data === 'error') {
        store.commit(VIEW_STATE_CHANGE, ['app', 'min']);
    }
});

/**
 * {
    "clienttype": "web",        客户端类型
    "messagekey": "964d2818-ebd8-43f7-bd8d-117e460f1b68",  GUID，消息的身份标识字段。服务器根据此字段来判断两条消息是不是同一条消息
    "sendto": "oa%3A60197",     消息接收者
    "message": "%5B%E6%9C%88%E4%BA%AE%5D",   消息内容
    "type": "oa",               用户类型：oa
    "command": "chat",          消息类型：这里是文字消息
    "form": "oa%3A125460",      消息发送者
    "agentname": "%E9%99%88%E5%9B%BD%E5%AE%89"   消息发送者的姓名
}
 */

events.on('view:reconnect:socket', () => {
    // 需要清空所有的存储信息，目前是联系人列表
    store.commit(SOCKET_STATE_CHANGE, 'connecting');
    // store.commit(SOCKET_RECONNECT);
    // 重新初始化
    socket.init();
});

events.on('socket:restore:info', (data) => {
    store.commit(SOCKET_RESTORE_INFO, data);
});

events.on('view:send:message', (data) => {
    socket.sendMessage(data);
});

events.on('view:search:user', (data) => {
    socket.postSearchUser(data);
});

events.on('store:request:user', (data) => {
    socket.postUserInfo([data]);
});

events.on('store:request:group', (data) => {
    socket.getGroupInfo([data]);
});

events.on('store:request:history', (data) => {
    socket.postHistory(data);
});

events.on('socket:search:user:back', (data) => {
    store.commit(SOCKET_SEARCH_USER_CHANGE, data);
});

events.on('socket:receive:user', (data) => {
    store.commit(SOCKET_USER_CHANGE, data);
});

events.on('socket:receive:manager', (data) => {
    store.commit(SOCKET_MANAGER_CHANGE, data);
});

events.on('socket:receive:mate', (data) => {
    store.commit(SOCKET_MATE_CHANGE, data);
});

events.on('socket:receive:group', (data) => {
    store.commit(SOCKET_GROUP_CHANGE, data);
});

// 如果是同步联系人列表需要将所有联系人信息都返回以后才更新 store, 否则报错，并且更新视图频繁。

events.on('socket:messagekey:back', (data) => {
    store.commit(VIEW_CHAT_MSGKEY, data);
});

/**
 * 一定要先更新基础信息
 */
events.on('socket:receive:chat', (data) => {
    if (!data) {
        console.log('socket receive void chat');
        return;
    }
    store.commit(SOCKET_CHAT_CHANGE, data);
    store.commit(VIEW_CHAT_CHANGE, data);
});

events.on('socket:receive:history', (data) => {
    store.commit(SOCKET_CHAT_CHANGE, data);
});

// function replaceSrc(txt) {
//     var reg = /(((https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/ig;
//     var result = txt.replace(reg, function (item) {
//         return "<a href='" + item + "' target='_blank'>" + item + "</a>";
//     });
//     return result;
// }

// 缺少一个人发多条的代码考虑。
events.on('socket:receive:notice', (data) => {
    let msg = Object.assign(data, {
        isLink: /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i.test(data.message)
    });

    store.commit(SOCKET_NOTICE_CHANGE, msg);
});


events.on('socket:receive:recent', (data) => {
    store.commit(SOCKET_RECENT_CHANGE, data);
});
