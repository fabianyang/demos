import {
    SOCKET_COUNT_UP,
    SOCKET_CONFIG_CHANGE,
    SOCKET_BUDDY_CHANGE,
    SOCKET_GROUP_CHANGE,
    SOCKET_FOLLOW_CHANGE
} from '../mutations';

const state = {
    count: 0,
    group: [],
    buddy: [],
    follow: []
};

// getters
const getters = {
    // groupGetter: (state) => {

    //     let group = state.group;
    //     let list = group.list.map((id) => {
    //         return group.info[id];
    //     });
    //     return list;
    // }
};

// actions
const actions = {

};

// mutations
const mutations = {
    [SOCKET_COUNT_UP](state) {
        state.count++;
    },
    // 应该可以不要！！！
    [SOCKET_CONFIG_CHANGE](state, config) {
        // debugger;
        // 客户端类型
        state.config = {
            clienttype: config.clienttype,
            usertype: config.usertype,
            username: config.username,
            agentname: config.username
        };
    },
    [SOCKET_GROUP_CHANGE](state, data) {
        // info change
        // console.log(data);
        if (data.length) {
            state.group = state.group.concat(data);
        }
    },
    [SOCKET_BUDDY_CHANGE](state, data) {
        if (data.length) {
            state.buddy = state.buddy.concat(data);
        }
        // else {
        //     state.buddyInfo = Object.assign({}, state.buddyInfo, data);
        // }
    },
    [SOCKET_FOLLOW_CHANGE](state, data) {
        if (data.length) {
            state.follow = state.follow.concat(data);
        }
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
