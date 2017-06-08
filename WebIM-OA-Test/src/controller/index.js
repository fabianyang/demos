import events from '../events';
import socket from '../socket';
import store from '../store';

import {
    VIEW_INFO_CHANGE,
    SOCKET_COUNT_UP,
    SOCKET_CONFIG_CHANGE,
    SOCKET_BUDDY_CHANGE,
    SOCKET_GROUP_CHANGE,
    SOCKET_FOLLOW_CHANGE,
    VIEW_CHAT_MSG_SUCCESS
} from '../store/mutations';

events.on('socket:select', function () {
    console.log('controller selected');
    // store.commit(VIEW_INFO_CHANGE, 'info');
});

events.on('socket:connecting', function () {
    store.commit(VIEW_INFO_CHANGE, 'connecting');
});

events.on('socket:open', function (config) {
    // setTimeout 防止连接过快，没有过度
    store.commit(VIEW_INFO_CHANGE, 'open');
    store.commit(SOCKET_CONFIG_CHANGE, config);
    store.commit(SOCKET_COUNT_UP);
    setTimeout(() => {
        store.commit(VIEW_INFO_CHANGE, '');
    }, 2 * 1000);
});

// 请求超时。信号不好，或者网络临时性关闭，不会执行 onclose
events.on('socket:close', function () {
    store.commit(VIEW_INFO_CHANGE, 'close');
});

events.on('socket:error', function () {
    store.commit(VIEW_INFO_CHANGE, 'error');
});

events.on('socket:receiveMessage', function () {
    console.log('controller closed');
    store.commit(VIEW_INFO_CHANGE, 'info');
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

events.on('socket:send:msg', function (data) {
    socket.sendMsg(data);
});


events.on('socket:receive:buddy', function (data) {
    let list = [];

    data.forEach((v) => {
        // 没有请求过信息的进行请求
        if (v) {
            list.push(v);
        }
    });

    store.commit(SOCKET_BUDDY_CHANGE, list);
});

// 如果是同步联系人列表需要将所有联系人信息都返回以后才更新 store, 否则报错，并且更新视图频繁。


let hasSyncGroupCount = 0,
    tempSyncGroup = [],
    tempSyncFollow = [];
// v1 记录数量分开记录信息
// tempSyncGroupInfo[data.id] = data;
// if (!tempSyncGroupList.length) {
//     tempSyncGroupList = [data.id];
// }
// if (++hasSyncGroupCount === socket.syncGroupCount) {
//     store.commit(SOCKET_GROUP_CHANGE, tempSyncGroupList);
//     store.commit(SOCKET_GROUP_CHANGE, tempSyncGroupInfo);
//     hasSyncGroupCount = 0;
//     tempSyncGroupInfo = {};
//     tempSyncGroupList = [];
//     console.log('同步联系人信息完成');
// }
events.on('socket:receive:group', function (data) {
    // 同步信息
    if (data.id) {
        // 单条，没有批量同步情况
        if (!tempSyncGroup.length) {
            tempSyncGroup = [data];
            if (data.folow) {
                tempSyncFollow.push(data);
            }
        } else {
            for (let i = 0; i < tempSyncGroup.length; i++) {
                let tsg = tempSyncGroup[i];
                if (tsg === data.id) {
                    tempSyncGroup[i] = data;
                    if (data.folow) {
                        tempSyncFollow.push(data);
                    }
                    break;
                }
            }
        }

        if (++hasSyncGroupCount === socket.syncGroupCount) {
            store.commit(SOCKET_GROUP_CHANGE, tempSyncGroup);
            hasSyncGroupCount = 0;
            tempSyncGroup = 0;
            if (tempSyncFollow.length) {
                store.commit(SOCKET_FOLLOW_CHANGE, tempSyncFollow);
                tempSyncFollow = [];
            }
            console.log('同步联系人信息完成');
        }
    } else {
        // debugger;
        data.forEach((v) => {
            // 没有请求过信息的进行请求
            if (v) {
                tempSyncGroup.push(v);
            }
        });
        socket.syncGroup(tempSyncGroup);
    }
});

events.on('socket:receive:messagekey', function (key) {
    store.commit(VIEW_CHAT_MSG_SUCCESS, key);
});
