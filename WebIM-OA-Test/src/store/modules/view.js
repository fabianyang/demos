import {
    VIEW_STATE_CHANGE,
    VIEW_INFO_CHANGE,
    VIEW_CHAT_OPEN,
    VIEW_CHAT_MSG,
    VIEW_CHAT_MSG_SUCCESS
} from '../mutations';

/**
 * info - 信息提示
 * app - 应用窗口状态 max: 最大化 min: 最小化
 * left - 左侧窗口状态 chat: 聊天窗口打开 notice: 通知窗口打开 close: 关闭
 * right - 右侧窗口状态
 * chatWindow - 聊天窗口信息
 */
const state = {
    info: 'connecting',
    app: 'min',
    left: 'close',
    right: 'notice',
    chatWindow: {},
    msgLists: {}
};

// getters
const getters = {
    msgList(state) {
        let list = state.msgLists[state.chatWindow.id];
        list = list ? list.concat().reverse() : [];
        return list;
    }
};

// actions
const actions = {

};

// mutations
const mutations = {
    [VIEW_STATE_CHANGE](state, params) {
        let key = params[0],
            value = params[1];
        state[key] = value;
        // 聊天窗口关闭
        if (key === 'left' && value === 'close') {
            state.chatWindow = {};
        }
    },
    [VIEW_INFO_CHANGE](state, str) {
        state.info = str;
    },
    [VIEW_CHAT_OPEN](state, opts) {
        state.chatWindow = {
            // 聊天对象唯一标识，http 查询信息标识, 接口 resourceid 。
            id: opts.id,
            // 添加 oa 前缀 id, socket 查询 id, oa:12345
            username: opts.username,
            // 昵称、姓名
            nickname: opts.nickname || '',
            // 聊天窗口显示文字
            title: opts.nickname || opts.username,
            // 群人员数量
            number: opts.number || '',
            // 头像
            avatar: opts.avatar || '',
            email: '',
            // 窗口类型：好友、群聊、关注。用于判断当前打开窗口。
            type: opts.type
        };
    },
    [VIEW_CHAT_MSG](state, data) {
        let lists = state.msgLists;
        let list = lists[data.id];
        if (!list) {
            list = lists[data.id] = [];
        }
        list.push(data);
        state.msgLists = Object.assign({}, state.msgLists, {
            [data.id]: list
        });
        console.log(lists);
    },
    [VIEW_CHAT_MSG_SUCCESS](state, key) {
        let id = state.chatWindow.id;
        let list = state.msgLists[id];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].messagekey === key) {
                    list[i].isSuccess = true;
                    state.msgLists = Object.assign({}, state.msgLists, {
                        [id]: list
                    });
                    break;
                }
            }
        }
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
