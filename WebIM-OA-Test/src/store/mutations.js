import {
    SOCKET_RECONNECT,
    SOCKET_RESTORE_INFO,
    SOCKET_USER_CHANGE,
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

let formatNotSyncInfo = (data, view_name) => {
    return {
        id: data.id,
        nickname: data.nickname,
        view_name: view_name
    };
};

let formatReceiveChat = (data) => {
    let isGroup = data.command.split('_')[0] === 'group';
    let result = {
        // 进行 msgList 信息列表区分。 VIEW_CHAT_CHANGE 使用
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
    if (isGroup) {
        result.id = data.from || data.form;
    } else {
        result.id = data.sendto;
    }
    return result;
};

let requestUserInfo = (state, data, view_name) => {
    // 要先添加基本信息，因为 im 已经渲染， 否则找不到信息报错
    // buddy = formatNotSyncInfo(v);
    state.info_user = Object.assign({}, state.info_user, {
        [data.id]: formatNotSyncInfo(data, view_name)
    });
    // 这里要是一个新对象，否则 vuex 报错
    // 最好是一个 promise 执行完成后进行回调，就不需要更新两遍对象，刷新两遍视图。
    events.trigger('store:request:user', formatNotSyncInfo(data, view_name));
};

let requestGroupInfo = (state, data, view_name) => {
    state.info_group = Object.assign({}, state.info_group, {
        [data.id]: formatNotSyncInfo(data, view_name)
    });
    // 接收到一个群消息但是不在群列表中，需要添加到群列表，同时同步群信息
    state.view_book_group = state.view_book_group.concat([data.id]);
    events.trigger('store:request:group', formatNotSyncInfo(data, view_name));
};

let addViewNoticeList = (state, view_name, id) => {
    let list = state[view_name];
    if (list.length) {
        let i = list.length;
        while (i--) {
            if (list[i] === id) {
                return;
            }
        }
        state[view_name] = state[view_name].concat([id]);
    } else {
        state[view_name] = [id];
    }
    storage.coreSet(view_name, state[view_name]);
};

let addRecentNew = (state, id, count = 1) => {
    let recent_list = state.recent.list;
    if (recent_list[id]) {
        recent_list[id] += count;
    } else {
        recent_list[id] = count;
    }

    state.recent.list = Object.assign({}, recent_list);
    state.recent.notice += count;

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
        state.view_notice = [];
        state.view_notice_single = [];
        state.view_notice_group = [];
        state.view_book_group = [];
        state.view_book_buddy = [];
        state.view_book_manager = [];
        state.view_book_mate = [];
        state.view_book_follow = [];
        state.notice_list = [];
        // 重连需要清空聊天记录？？重连，不再同步未读消息
        // state.message_lists = {};
    },
    [SOCKET_RESTORE_INFO](state, data) {
        state.info_group = data.info_group ;
        state.info_user = data.info_user ;
        state.view_notice = data.view_notice ;
        state.view_notice_single = data.view_notice_single ;
        state.view_notice_group = data.view_notice_group ;
        state.view_book_group = data.view_book_group ;
        state.view_book_buddy = data.view_book_buddy ;
        state.view_book_manager = data.view_book_manager ;
        state.view_book_mate = data.view_book_mate ;
        state.view_book_follow = data.view_book_follow ;
        state.notice_list = data.notice_list ;
        data.resolve();
    },
    // 同步组信息
    [SOCKET_GROUP_CHANGE](state, data) {
        let info = state.info_group;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
                l.push(id);
            }
        });
        if (l.length) {
            state.view_book_group = state.view_book_group.concat(l);
        }
        state.info_group = Object.assign({}, info, o);
    },
    // 同步用户信息
    [SOCKET_USER_CHANGE](state, data) {
        let info = state.info_user;
        let fl = [],
            bl = [],
            o = {};

        data.forEach(function (v) {
            let id = v.id;

            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
                bl.push(id);
                if (v.follow) {
                    fl.push(v.id);
                }
            }

            if (v.view_name) {
                addViewNoticeList(state, v.view_name, id);
            }

            // 搜索用户情况，signame 传过去了
            if (v.signame) {
                state.leftWindow = Object.assign({}, v, state.leftWindow);
                delete v.signame;
            }
        });
        if (bl.length) {
            state.view_book_buddy = state.view_book_buddy.concat(bl);
            storage.coreSet('view_book_buddy', state.view_book_buddy);
            if (fl.length) {
                state.view_book_follow = state.view_book_follow.concat(fl);
                storage.coreSet('view_book_follow', state.view_book_follow);
            }
        }
        state.info_user = Object.assign({}, info, o);
        storage.coreSet('info_user', state.info_user);
    },
    // 同步上下级信息
    [SOCKET_MANAGER_CHANGE](state, data) {
        let info = state.info_user;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
                l.push(id);
            }
        });
        if (l.length) {
            state.view_book_manager = state.view_book_manager.concat(l);
            storage.coreSet('view_book_manager', state.view_book_manager);
        }
        state.info_user = Object.assign({}, info, o);
        storage.coreSet('info_user', state.info_user);
    },
    // 同步同事信息
    [SOCKET_MATE_CHANGE](state, data) {
        let info = state.info_user;
        let l = [],
            o = {};
        data.forEach(function (v) {
            let id = v.id;
            if (info[id]) {
                o[id] = Object.assign(info[id], v);
            } else {
                o[id] = v;
                l.push(id);
            }
        });
        if (l.length) {
            state.view_book_mate = state.view_book_mate.concat(l);
            storage.coreSet('view_book_mate', state.view_book_mate);
        }
        state.info_user = Object.assign({}, info, o);
        storage.coreSet('info_user', state.info_user);
    },
    [SOCKET_NOTICE_CHANGE](state, data) {
        let id = data.id;
        let info = state.info_user[id];
        if (!info) {
            // 通知发送人 基本信息添加
            requestUserInfo(state, data, 'view_notice');
            // 通知发送人 id 列表更新
            // addViewNoticeList(state, 'view_notice', data.id);
            // state.view_notice = state.view_notice.concat([data.id]);
        }
        state.notice_list = state.notice_list.concat([data]);
        storage.coreSet('notice_list', state.notice_list);
    },
    [SOCKET_RECENT_CHANGE](state, data) {
        data.group.forEach((v) => {
            let synctime = storage.getSynctime(v.id);
            if (synctime) {
                events.trigger('store:request:history', {
                    id: v.id,
                    exec: 'sync_recent'
                });
                return;
            }

            addViewNoticeList(state, 'view_notice_group', v.id);
            addRecentNew(state, v.id, v.recent_new);
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

            addRecentNew(state, v.id, v.recent_new);

            // 判断有无好友信息，无信息要请求，主要是头像地址。。。。
            let buddy = state.info_user[v.id];
            if (!buddy) {
                requestUserInfo(state, v, 'view_notice_single');
            } else {
                addViewNoticeList(state, 'view_notice_single', v.id);
            }
        });
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
        // 窗口打开 send 、 receive 更新同步时间，和服务器时间大概有 2s 的延迟。所以返回之后再记录同步时间。
        let time = new Date().getTime();
        storage.setSynctime(id, 2 * 1000 + time);
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
                if (!state.info_group[data.id]) {
                    requestGroupInfo(state, data, 'view_notice_group');
                } else {
                    addViewNoticeList(state, 'view_notice_group', id);
                }
            } else {
                if (!state.info_user[data.id]) {
                    requestUserInfo(state, data, 'view_notice_single');
                } else {
                    addViewNoticeList(state, 'view_notice_single', id);
                }
            }

            // 接收到新消息，没有打开左侧聊天窗口，或者当前窗口不是消息发送人，或者最小化状态，记录新条数
            if (!state.leftWindow.id || state.leftWindow.id !== id || state.app === 'min') {
                addRecentNew(state, id);
                // 如果没有打开窗口，且没有未读消息时，记录未读消息时间
                if (!state.recent.list[data.id]) {
                    storage.setSynctime(data.id, data.time);
                }
            }

            if (state.leftWindow.id === id) {
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
            state.message_lists = Object.assign({}, msglists, {
                [id]: msglist
            });
        }
    }
};
