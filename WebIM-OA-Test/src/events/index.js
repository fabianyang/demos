// let fangwebim = global.fangwebim;
// console.log(fangwebim);
document.domain = 'fang.com';
let fangwebim = global.FangChat = {
    data: {
        defaultAvatar: 'http://js.soufunimg.com/common_m/m_public/images/fang.jpg'
    },
    config: {
        command: 'login',
        username: 'oa:125460',
        nickname: 'yangfan',
        agentid: '125460',
        clienttype: 'web',
        usertype: 'oa',
        os: 'windows',
        imei: '98:5A:EB:CA:CF:D2',
        city: 'bj'
    }
};

/**
 * util-events.js - The minimal events support
 */
let events = fangwebim.data.events = {};

// Bind event, name not use 'on', 'off', 'emit'
fangwebim.on = function (name, callback) {
    let list = events[name] || (events[name] = []);
    list.push(callback);
    return events;
};

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
fangwebim.off = function (name, callback) {
    // Remove *all* events
    if (!(name || callback)) {
        events = {};
        return events;
    }

    let list = events[name];
    if (list) {
        if (callback) {
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i] === callback) {
                    list.splice(i, 1);
                }
            }
        } else {
            delete events[name];
        }
    }

    return events;
};

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
fangwebim.emit = function (name, data) {
    let list = events[name];

    if (list) {
        // Copy callback lists to prevent modification
        list = list.slice();

        // Execute event callbacks, use index because it's the faster.
        for (let i = 0, len = list.length; i < len; i++) {
            list[i](data);
        }
    }

    return events;
};
// fangoaim事件命名空间
let eventSpace = 'imEvent:';
let eventRegister = {
    // 选择 socket 事件，异步实现加载
    'socket:selec': 1,
    'socket:connecting': 1,
    'socket:receive:buddy': 1,
    'socket:receive:group': 1,
    'socket:receive:messagekey': 1,
    'socket:open': 1,
    'socket:close': 1,
    'socket:error': 1,
    'socket:receive:msg': 1,
    'socket:send:msg': 1,
    // 'socket:master:set': 1,
    // 'socket:msg:new': 1, //
    // 'socket:msg:change': 1,
    // "socket:ui:change": 1, //uidata变化事件
    // "socket:contactlist:change": 1, //soket端联系人列表变化事件
    // "socket:systemInfo:show": 1,
    // "socket:im:log": 1,
    // "socket:state:set": 1, //自己状态改变
    // "socket:userstate:logout": 1, // 登出
    // "userinfo:update": 1,
    // "userlist:update": 1,
    // "userpanel:update": 1,
    // 'socket:selfdata:set': 1, //设置个人信息
    // "message:new": 1,
    // "message:unread": 1,
    // "message:history": 1,
    // "assignsvrs:finish": 1,
    // "switchsvrs:finish": 1,
    // "loading:status": 1,
    // "notice:show": 1,
    // "history:empty": 1,
    // /*联系人列表操作事件*/
    // "action:click": 1,
    // "action:change": 1,
    // /*消息处理*/
    // "msg:postback": 1,
    // "msg:posterror": 1,
    // "msg:chatWithback": 1,
    // /*model层联动事件*/
    // "model:contact:newMsg": 1,
    // "model:contacts:change": 1,
    // "model:contacts:numChange": 1,
    // "model:singlecontact:change": 1,
    // "model:window:change": 1,
    // 'model:msg:change': 1,
    // 'model:msg:alert': 1,
    // 'model:msg:receive': 1,
    // 'model:msg:save': 1,
    // "model:otherContacts:change": 1,
    // "model:contacts:pollingState": 1, //轮询联系人状态
    // "model:singleContact:state": 1, //单个联系人状态
    // /*视图联动事件*/
    // "view:contacts:add": 1,
    // "view:contact:selected": 1,
    // "view:window:change": 1,
    // "view:newmsg:click": 1,
    // "view:msg:send": 1,
    // "view:msg:history": 1,
    // "view:otherContacts:add": 1,
    // "view:otherContact:selected": 1,
    // "view:socket:login": 1, //视图点击socket登陆操作事件
    // //上传图片相关事件
    // "view:image:upload": 1,
    // 'view:image:del': 1,
    // "model:image:change": 1,
    // //鼠标移入移出事件
    // 'view:mouse:enter': 1,
    // //flash传出相关提示字符串
    // 'socket:msgstring:show': 1
};
export default {
    on: function (type, callback) {
        fangwebim.on(eventSpace + type, callback);
    },
    off: function (type, callback) {
        fangwebim.off(eventSpace + type, callback);
    },
    trigger: (type, data) => {
        // console.log(type);
        // console.log(eventRegister[type]);
        eventRegister[type] && fangwebim.emit(eventSpace + type, data);
    }
};
