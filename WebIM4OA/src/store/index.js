import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    // actions,
    state: {
        socket_state: 'connecting',
        // 应用窗口状态 max: 最大化 min: 最小化
        app: 'min',
        // left - 左侧窗口状态 chat: 聊天窗口打开 notice: 通知窗口打开 close: 关闭
        left: 'close',
        // right - 右侧窗口状态
        right: 'notice',
        // search - 是否正在搜索
        search: {
            result: [],
            info: 'loading',
            keyword: '',
            requesting: false
        },
        // leftWindow - 聊天窗口信息
        leftWindow: {},
        rightPanel: {
            open: {}
        },
        historyContainer: {
            open: false,
            loadState: '',
            list: [],
            nomore: false
        },
        // 对话消息列表，以 id 为 key
        message_lists: {},
        // 通知消息列表
        notice_lists: {},
        // socket 连接次数
        // 群信息，以 id 为 key
        info_group: {},
        // 好友、上下级等信息，以 username 为 key
        info_user: {},
        // 群成员列表，存储 id
        view_book_group: [],
        // 好友、上下级等列表，存储 username
        view_book_buddy: [],
        view_book_manager: [],
        view_book_mate: [],
        // 特别关注列表，view_book_body 子集
        view_book_follow: [],
        // 通知消息发送人列表，存储 id
        view_notice: [],
        // 单聊消息成员列表，存储 id
        view_notice_single: [],
        // 群聊消息成员列表，存储 id
        view_notice_group: [],
        // 未读消息数量
        recent: {
            notice: 0,
            book: 0,
            list: {
                notice: {}
            }
        },
        // 是否提示欢迎语 -100 不再提示， -1 提示在头部，正数提示在回复中
        welcome: {},
        // 草稿
        draft: {}
    },
    // modules: {
    //     view,
    //     socket
    // },
    getters: getters,
    mutations: mutations,
    strict: debug
});
