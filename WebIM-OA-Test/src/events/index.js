/**
 * util-events.js - The minimal events support
 */
let fangChat = window.FangChat;
let events = fangChat.data.events = {};

// Bind event, name not use 'on', 'off', 'emit'
fangChat.on = function (name, callback) {
    let list = events[name] || (events[name] = []);
    list.push(callback);
    return events;
};

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
fangChat.off = function (name, callback) {
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
fangChat.emit = function (name, data) {
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
    'socket:getbuddyV3:ret': 1,
    'socket:getgrouplist:ret': 1,
    'socket:getgroupinfoV2:ret': 1,
    'socket:getmessagecountbytime:ret': 1,

    // 选择 socket 事件，异步实现加载
    'socket:selec': 1,
    'socket:connecting': 1,
    'socket:receive:buddy': 1,
    'socket:receive:manager': 1,
    'socket:receive:mate': 1,
    'socket:receive:group': 1,
    'socket:receive:messagekey': 1,
    'socket:receive:history': 1,
    'socket:open': 1,
    'socket:close': 1,
    'socket:error': 1,
    'socket:receive:chat': 1,
    'socket:receive:notice': 1,
    'socket:receive:recent': 1,
    'view:send:message': 1,
    'view:search:user': 1,
    'store:request:buddy': 1,
    'store:request:group': 1,
    'store:request:history': 1
};
export default {
    on: function (type, callback) {
        fangChat.on(eventSpace + type, callback);
    },
    off: function (type, callback) {
        fangChat.off(eventSpace + type, callback);
    },
    trigger: (type, data) => {
        // console.log(type);
        // console.log(eventRegister[type]);
        eventRegister[type] && fangChat.emit(eventSpace + type, data);
    }
};
