import {
    SOCKET_COUNT_UP,
    SOCKET_CONFIG_CHANGE,
    SOCKET_BUDDY_CHANGE,
    SOCKET_MANAGER_CHANGE,
    SOCKET_MATE_CHANGE,
    SOCKET_GROUP_CHANGE,
    SOCKET_CHAT_CHANGE,
    SOCKET_NOTICE_CHANGE,
    SOCKET_RECENT_CHANGE,
    VIEW_STATE_CHANGE,
    VIEW_INFO_CHANGE,
    VIEW_LEFT_OPEN,
    VIEW_CHAT_CHANGE,
    VIEW_CHAT_MSGKEY
} from './mutation-types';
import util from '../util';
import events from '../events';

let formatNotSyncInfo = (data) => {
    return {
        id: data.id,
        nickname: data.nickname,
        sync: false
    };
};

let formatReceiveChat = (data) => {
    return {
        // 进行 msgList 信息列表区分。 VIEW_CHAT_CHANGE 使用
        id: data.from || data.form,
        // 发送消息 id oa:125460 群没有 oa 前缀
        sendto: data.sendto,
        message: data.message,
        // 消息类型，是否为群聊，目前 group: 群聊天, 其他: 单聊
        command: data.command,
        messagekey: data.messagekey,
        messagetime: data.messagetime,
        messagestate: 1,
        time: new Date(data.messagetime).getTime()
    };
};

let requestBuddyInfo = (state, data) => {
    // 要先添加基本信息，因为 im 已经渲染， 否则找不到信息报错
    // buddy = formatNotSyncInfo(v);
    state.info_user = Object.assign({}, state.info_user, {
        [data.id]: formatNotSyncInfo(data)
    });
    // 这里要是一个新对象，否则 vuex 报错
    // 最好是一个 promise 执行完成后进行回调，就不需要更新两遍对象，刷新两遍视图。
    events.trigger('store:request:buddy', formatNotSyncInfo(data));
};

let requestGroupInfo = (state, data) => {
    state.info_group = Object.assign({}, state.info_group, {
        [data.id]: formatNotSyncInfo(data)
    });
    // 接收到一个群消息但是不在群列表中，需要添加到群列表，同时同步群信息
    state.view_book_group = state.view_book_group.concat([data.id]);
    events.trigger('store:request:group', formatNotSyncInfo(data));
};

export default {
    [SOCKET_COUNT_UP](state) {
        state.count++;
    },
    // 应该可以不要！！！
    [SOCKET_CONFIG_CHANGE](state, config) {
        // 客户端类型
        state.config = {
            clienttype: config.clienttype,
            usertype: config.usertype,
            username: config.username,
            agentname: config.username
        };
    },
    [SOCKET_GROUP_CHANGE](state, data) {
        let info = state.info_group;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            l.push(id);
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
        });
        state.view_book_group = state.view_book_group.concat(l);
        state.info_group = Object.assign({}, info, o);
        // let l = [],
        //     o = {};
        // data.forEach(function (v) {
        //     l.push(v.id);
        //     o[v.id] = v;
        // });
        // state.view_book_group = state.view_book_group.concat(l);
        // state.info_group = Object.assign({}, state.info_group, o);
    },
    [SOCKET_BUDDY_CHANGE](state, data) {
        let info = state.info_user;
        let fl = [], bl = [], o = {};
        data.forEach(function (v) {
            let id = v.id;
            bl.push(id);
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
            if (v.follow) {
                fl.push(v.id);
            }
        });
        state.view_book_buddy = state.view_book_buddy.concat(bl);
        state.info_user = Object.assign({}, info, o);
        if (fl.length) {
            state.view_book_follow = state.view_book_follow.concat(fl);
        }
    },
    [SOCKET_MANAGER_CHANGE](state, data) {
        let info = state.info_user;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            l.push(id);
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
        });
        state.view_book_manager = state.view_book_manager.concat(l);
        state.info_user = Object.assign({}, info, o);
    },
    [SOCKET_MATE_CHANGE](state, data) {
        let info = state.info_user;
        let l = [], o = {};
        data.forEach(function (v) {
            let id = v.id;
            l.push(id);
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }
        });
        state.view_book_mate = state.view_book_mate.concat(l);
        state.info_user = Object.assign({}, info, o);
    },
    [SOCKET_CHAT_CHANGE](state, data) {
        let lists = state.message_lists;
        let id = state.leftWindow.id;
        // 多条，历史记录请求，点击窗口已经判断是否有 info, 应该都是一个人的，打开窗口的
        if (util.isArray(data)) {
            if (!util.isArray(lists[id])) {
                lists[id] = [];
            }
            let list = [];
            data.forEach((v) => {
                list.push(formatReceiveChat(v));
            });

            list = lists[id].concat(list);

            state.message_lists = Object.assign({}, lists, {
                [id]: list
            });
        } else {
            let id = data.id, command = data.command;
            let isGroup = command.split('_')[0] === 'group';
            // 这里只添加信息，不添加具体信息 在 view messageList 中添加具体消息
            let info = isGroup ? state.info_group[id] : state.info_user[id];
            if (!info) {
                if (isGroup) {
                    requestGroupInfo(state, data);
                    state.notice_group = state.notice_group.concat([data.id]);
                } else {
                    requestBuddyInfo(state, data);
                    state.view_notice_single = state.view_notice_single.concat([data.id]);
                }
            }

            if (state.leftWindow.id !== id) {
                let recent_list = state.recent.list;
                if (recent_list[id]) {
                    recent_list[id]++;
                } else {
                    recent_list[id] = 1;
                }

                state.recent.list = recent_list;
                if (info) {
                    state.recent.book++;
                }
                state.recent.notice++;
            }
        }
    },
    [SOCKET_NOTICE_CHANGE](state, data) {
        let id = data.id;
        let info = state.info_user[id];
        if (!info) {
            // 通知发送人 基本信息添加
            requestBuddyInfo(state, data);
            // 通知发送人 id 列表更新
            state.view_notice = state.view_notice.concat([data.id]);
        }
        state.notice_list = state.notice_list.concat([data]);
    },
    [SOCKET_RECENT_CHANGE](state, data) {
        let recent_list = {};
        data.group.forEach((v) => {
            state.recent.notice += v.recent_new;
            recent_list[v.id] = v.recent_new;
            state.notice_group = state.notice_group.concat([v.id]);
            // 不必判断有无组信息，不成立组无法收到消息，同步完成信息，再同步未读消息。
            state.recent.book += v.recent_new;
        });
        data.buddy.forEach((v) => {
            state.recent.notice += v.recent_new;
            recent_list[v.id] = v.recent_new;
            state.view_notice_single = state.view_notice_single.concat([v.id]);

            // 判断有无好友信息，无信息要请求，主要是头像地址。。。。
            let buddy = state.info_user[v.id];
            if (!buddy) {
                requestBuddyInfo(state, v);
            } else {
                state.recent.book += v.recent_new;
            }
        });
        state.recent.list = recent_list;
    },
    [VIEW_STATE_CHANGE](state, params) {
        let key = params[0],
            value = params[1];
        state[key] = value;
        // 聊天窗口关闭
        if (key === 'left' && value === 'close') {
            state.leftWindow = {};
        }
    },
    [VIEW_INFO_CHANGE](state, str) {
        state.info = str;
    },
    [VIEW_LEFT_OPEN](state, opts) {
        let id = opts.id;
        state.leftWindow = {
            // 聊天对象唯一标识，http 查询信息标识, 接口 resourceid 。
            id: id,
            // 添加 oa 前缀 id, socket 查询 id, oa:12345
            // username: opts.username,
            // 昵称、姓名 聊天窗口显示文字
            nickname: opts.nickname || id,
            usergroup: [opts.buddy, opts.manager, opts.mate, opts.follow].filter((x) => x).join('_'),
            department: opts.department ? '(' + opts.department + ')' : '',
            // right-list title 属性
            title: opts.title,
            // 窗口类型：好友、群聊、关注。用于判断当前打开窗口。
            signame: opts.signame,
            // 群人员数量
            number: opts.number ? '(' + opts.number + ')' : '',
            // 头像
            avatar: opts.avatar || '',
            email: opts.email || ''
        };
        let signame = opts.signame.split('_');
        if (opts.recent_new) {
            state.recent.list[id] = 0;
            state.recent.notice -= opts.recent_new;
            if (signame[1] === 'book') {
                state.recent.book -= opts.recent_new;
            }
            if (signame[1] === 'notice') {
                if (state.leftWindow.usergroup) {
                    state.recent.book -= opts.recent_new;
                }
            }
        }
        // 非通知时，拉取信息！！！
        if (signame[2]) {
            events.trigger('store:request:history', {
                id: id
            });
        }
    },
    [VIEW_CHAT_MSGKEY](state, key) {
        let lists = state.message_lists,
            id = state.leftWindow.id;
        let list = lists[id];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].messagekey === key) {
                    list[i].messagestate = 1;
                    state.message_lists = Object.assign({}, lists, {
                        [id]: list
                    });
                    break;
                }
            }
        }
    },
    [VIEW_CHAT_CHANGE](state, data) {
        let id = data.id;
        let lists = state.message_lists;

        let list = lists[id];
        if (!list) {
            list = lists[id] = [];
        }
        list.unshift(data);
        state.message_lists = Object.assign({}, lists, {
            [data.id]: list
        });
    }
};