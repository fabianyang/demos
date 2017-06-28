import {
    SOCKET_RECONNECT,
    SOCKET_BUDDY_CHANGE,
    SOCKET_MANAGER_CHANGE,
    SOCKET_MATE_CHANGE,
    SOCKET_GROUP_CHANGE,
    SOCKET_CHAT_CHANGE,
    SOCKET_NOTICE_CHANGE,
    SOCKET_RECENT_CHANGE,
    SOCKET_SEARCH_USER_CHANGE,
    VIEW_SEARCH_USER_CHANGE,
    VIEW_STATE_CHANGE,
    SOCKET_STATE_CHANGE,
    VIEW_LEFT_OPEN,
    VIEW_CHAT_CHANGE,
    VIEW_CHAT_MSGKEY,
    VIEW_TOGGLE_HISTORY
} from './mutation-types';
import storage from './storage';
import util from '../util';
import events from '../events';

let messageMaxCount = 10;

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
        from: data.from || data.form,
        // 发送消息 id oa:125460 群没有 oa 前缀
        sendto: data.sendto,
        message: data.message,
        // 消息类型，是否为群聊，目前 group: 群聊天, 其他: 单聊
        command: data.command,
        messageid: data.messageid,
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

let addViewNoticeList = (state, viewName, id) => {
    let list = state[viewName];
    if (list.length > 1) {
        let i = list.length - 1;
        while (i--) {
            if (list[i] === id);
            return;
        }
        state[viewName] = state[viewName].concat([id]);
    } else {
        if (list[0] !== id) {
            state[viewName] = state[viewName].concat([id]);
        } else {
            state[viewName] = [id];
        }
    }
};

let addRecentNew = (state, id, count = 1) => {
    let recent_list = state.recent.list;
    if (recent_list[id]) {
        recent_list[id] += count;
    } else {
        recent_list[id] = count;
    }

    state.recent.list = Object.assign({}, recent_list);
    state.recent.notice++;

    if (id.split(':')[0] === 'oa') {
        [].concat.apply([], [state.view_book_buddy, state.view_book_manager, state.view_book_mate]).every((v) => {
            if (v === id) {
                state.recent.book += count;
                return false;
            }
            return true;
        });
    } else {
        state.view_book_group.every((v) => {
            if (v === id) {
                state.recent.book += count;
                return false;
            }
            return true;
        });
    }
};

let diffRecentNew = (state) => {
    // 只有打开窗口才会减少条数
    if (!state.leftWindow) {
        console.log('not open left window');
        return;
    }
    let id = state.leftWindow.id,
        count = state.leftWindow.recent_new;

    let recent_list = state.recent.list;
    recent_list[id] = 0;
    state.recent.list = Object.assign({}, recent_list);
    state.recent.notice -= count;

    if (id.split(':')[0] === 'oa') {
        [].concat.apply([], [state.view_book_buddy, state.view_book_manager, state.view_book_mate]).every((v) => {
            if (v === id) {
                state.recent.book -= count;
                return false;
            }
            return true;
        });
    } else {
        state.view_book_group.every((v) => {
            if (v === id) {
                state.recent.book -= count;
                return false;
            }
            return true;
        });
    }
};

export default {
    [SOCKET_RECONNECT](state) {
        state.info_group = {};
        state.info_user = {};
        state.view_book_group = [];
        state.view_book_buddy = [];
        state.view_book_manager = [];
        state.view_book_mate = [];
        state.view_book_follow = [];
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
        let fl = [],
            bl = [],
            o = {};

        data.forEach(function (v) {
            let id = v.id;
            bl.push(id);
            if (v.follow) {
                fl.push(v.id);
            }

            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
            }

            // 搜索用户情况，signame 传过去了
            if (v.signame) {
                state.leftWindow = Object.assign({}, v, state.leftWindow);
                delete v.signame;
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
        state.view_book_mate = state.view_book_mate.concat(l);
        state.info_user = Object.assign({}, info, o);
    },
    [SOCKET_NOTICE_CHANGE](state, data) {
        let id = data.id;
        let info = state.info_user[id];
        if (!info) {
            // 通知发送人 基本信息添加
            requestBuddyInfo(state, data);
            // 通知发送人 id 列表更新
            addViewNoticeList(state, 'view_notice', data.id);
            // state.view_notice = state.view_notice.concat([data.id]);
        }
        state.notice_list = state.notice_list.concat([data]);
    },
    [SOCKET_RECENT_CHANGE](state, data) {
        let recent_list = {};
        data.group.forEach((v) => {
            let synctime = storage.getSynctime(v.id);
            if (synctime) {
                events.trigger('store:request:history', {
                    id: v.id,
                    exec: 'sync_recent'
                });
                return;
            }

            state.recent.notice += v.recent_new;
            recent_list[v.id] = v.recent_new;
            addViewNoticeList(state, 'view_notice_group', v.id);
            // 不必判断有无组信息，不成立组无法收到消息，同步完成信息，再同步未读消息。
            state.recent.book += v.recent_new;
        });

        data.buddy.forEach((v) => {
            let synctime = storage.getSynctime(v.id);
            // 如果有的话得请求历史记录进行比对，才知道哪些是未读消息，才能添加未读条数
            if (synctime) {
                events.trigger('store:request:history', {
                    id: v.id,
                    exec: 'sync_recent'
                });
                return;
            }

            state.recent.notice += v.recent_new;
            recent_list[v.id] = v.recent_new;
            addViewNoticeList(state, 'view_notice_single', v.id);

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
    [SOCKET_SEARCH_USER_CHANGE](state, data) {
        if (util.isArray(data)) {
            let result = state.search.result;
            if (data.length) {
                state.search.result = result.concat(data);
                if (data.length < 20) {
                    state.search.info = 'nomore';
                }
            } else if (result.length) {
                state.search.info = 'nomore';
            } else {
                state.search.info = 'none';
            }
        } else {
            state.search.info = 'fail';
        }
        state.search.requesting = false;
    },
    [VIEW_SEARCH_USER_CHANGE](state, data) {
        state.search.keyword = data.keyword || state.search.keyword;
        state.search.result = data.result || state.search.result;
        state.search.info = data.info || state.search.info;
        state.search.keyword = data.keyword || state.search.keyword;
        state.search.requesting = data.requesting || state.search.requesting;
    },
    [VIEW_STATE_CHANGE](state, params) {
        let key = params[0],
            value = params[1];
        state[key] = value;
        // 聊天窗口关闭
        if (key === 'left' && value === 'close') {
            state.leftWindow = {};
        }
        if (key === 'app' && value === 'max' && state.leftWindow.id) {
            diffRecentNew(state);
        }
    },
    [SOCKET_STATE_CHANGE](state, data) {
        state.socket_state = data;
    },
    [VIEW_CHAT_MSGKEY](state, data) {
        let lists = state.message_lists,
            // 不适用 leftwindow.id 因为有可能返回结果已经切换窗口了
            id = data.sendto;
        let list = lists[id];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].messagekey === data.messagekey) {
                    list[i].messagestate = 1;
                    state.message_lists = Object.assign({}, lists, {
                        [id]: list
                    });
                    break;
                }
            }
        }
    },
    [VIEW_TOGGLE_HISTORY](state, loadState) {
        if (loadState) {
            state.historyContainer.loadState = loadState;
        } else {
            state.historyContainer.open = !state.historyContainer.open;
        }
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
            department: opts.department ? '(' + opts.department + ')' : '',
            // 窗口类型：好友、群聊、关注。用于判断当前打开窗口。
            signame: opts.signame,
            // 群人员数量
            number: opts.number ? '(' + opts.number + ')' : '',
            // 头像
            avatar: opts.avatar || '',
            email: opts.email || '',
            recent_new: opts.recent_new
        };
        let signame = opts.signame.split('_');
        // 获取几条数据
        let size = opts.recent_new || 0;
        if (size) {
            diffRecentNew(state);
            size = opts.recent_new;
        }

        let synctime = storage.getSynctime(opts.id);

        // 打开窗口有同步时间，更新同步时间
        if (opts.recent_new) {
            storage.setSynctime(opts.id);
            // 非通知时，有新消息，且没有发送或接收过消息，拉取信息！！！
            if (signame[2] && !synctime) {
                // 只有新的条数才拉取历史记录，就是为了得到未读消息。
                events.trigger('store:request:history', {
                    id: id,
                    exec: 'more_recent'
                });
            }
        }
    },
    [SOCKET_CHAT_CHANGE](state, data) {
        let lists = state.message_lists;

        let id = data.id,
            more_length = 40;
        if (data.exec === 'more_recent') {
            state.historyContainer.requested = true;
            // 不用判断是否有数组， left-chat-content 已经判断，只有有条数的时候才会加载更多信息。
            let message_count = lists[id].length;
            if (message_count < messageMaxCount) {
                more_length = messageMaxCount - message_count;
            } else {
                return;
            }
        }

        if (data.exec === 'more_history') {
            lists = state.history_lists;
            state.historyContainer.requested = true;
        }

        let history = data.history;
        // 多条，历史记录请求，点击窗口已经判断是否有 info, 应该都是一个人的，打开窗口的
        if (history) {
            // 初始化消息数组
            if (!util.isArray(lists[id])) {
                lists[id] = [];
            }

            if (!history.length) {
                state.history_nomore = Object.assign({}, {
                    [data.id]: true
                });
                return;
            }
            if (history.length < 20) {
                state.history_nomore = Object.assign({}, {
                    [data.id]: true
                });
            }

            let list = [],
                recent_new = 0;
            history.forEach((v, i) => {
                let chat = formatReceiveChat(v);
                if (data.exec === 'more_recent' && i < more_length) {
                    list.push(chat);
                    return;
                }

                if (data.exec === 'more_history') {
                    list.push(chat);
                    return;
                }

                if (data.exec === 'sync_recent') {
                    let synctime = storage.getSynctime(id);
                    // 只将未读消息更新

                    if (chat.time > synctime) {
                        list.push(chat);
                        console.log(chat);
                        recent_new++;
                    }
                }
            });

            if (recent_new) {
                if (state.leftWindow.id === id) {
                    storage.setSynctime(id);
                } else {
                    addRecentNew(state, id, recent_new);
                    if (id.split(':')[0] === 'oa') {
                        addViewNoticeList(state, 'view_notice_single', id);
                    } else {
                        addViewNoticeList(state, 'view_notice_group', id);
                    }
                }
            }

            state.historyContainer.loadState = '';

            // 有数据再更新 view 数据
            if (list.length) {
                list = lists[id].concat(list);

                if (data.exec === 'more_history') {
                    state.history_lists = Object.assign({}, lists, {
                        [id]: list
                    });
                } else {
                    state.message_lists = Object.assign({}, lists, {
                        [id]: list
                    });
                }
            }
        } else {
            let command = data.command;
            let isGroup = command.split('_')[0] === 'group';
            // 这里只添加信息，不添加具体信息 在 view messageList 中添加具体消息
            if (isGroup) {
                requestGroupInfo(state, data);
                addViewNoticeList(state, 'view_notice_group', id);
            } else {
                requestBuddyInfo(state, data);
                addViewNoticeList(state, 'view_notice_single', id);
            }

            // 接收到新消息，没有打开左侧聊天窗口，或者当前窗口不是消息发送人，或者最小化状态，记录新条数
            if (!state.leftWindow.id || state.leftWindow.id !== id || state.app === 'min') {
                addRecentNew(state, id);
                // 如果没有打开窗口，记录未读消息时间
                storage.setSynctime(data.id, data.time);
            }
        }
    },
    [VIEW_CHAT_CHANGE](state, data) {
        let id = data.id;
        // 只有当前窗口时才更新列表，否则只在 SOCKET_CHAT_CHANGE 中更新新消息条数
        if (state.leftWindow.id === id) {
            let msglists = state.message_lists;
            let msglist = msglists[id];
            if (!msglist) {
                msglist = msglists[id] = [];
                if (data.command.split('_')[0] === 'group') {
                    addViewNoticeList(state, 'view_notice_group', id);
                } else {
                    addViewNoticeList(state, 'view_notice_single', id);
                }
            }

            // 多余可显示的当前聊天条数，如果已经请求过历史记录，更新历史记录列表。
            let hislists = state.history_lists;
            if (msglist.length > messageMaxCount) {
                let pop = msglist.pop();
                let hislist = hislists[id];
                if (hislist) {
                    hislist.unshift(pop);
                    state.history_lists = Object.assign({}, hislists, {
                        [id]: hislist
                    });
                }
            }
            msglist.unshift(data);
            // 窗口打开 send 、 receive 更新同步时间，和服务器时间大概有 2000 ms 的延迟。
            storage.setSynctime(id, data.time + 2000);
            state.message_lists = Object.assign({}, msglists, {
                [id]: msglist
            });
        }
    }
};
