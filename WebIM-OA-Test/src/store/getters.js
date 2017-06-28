export default {
    message_list(state) {
        let list = state.message_lists[state.leftWindow.id];
        list = list ? list.concat().reverse() : [];
        return list;
    },
    history_list(state) {
        let list = state.history_lists[state.leftWindow.id];
        list = list ? list.concat().reverse() : [];
        return list;
    },
    history_nomore(state) {
        return state.history_nomore[state.leftWindow.id];
    }
};