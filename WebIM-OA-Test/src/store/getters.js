export default {
    message_list(state) {
        let list = state.message_lists[state.leftWindow.id];
        list = list ? list.concat().reverse() : [];
        return list;
    },
    history_list(state) {
        let list = state.historyContainer.list;
        list = list ? list.concat().reverse() : [];
        return list;
    },
    notice_list(state) {
        let list = state.notice_lists[state.leftWindow.id];
        list = list ? list.concat().reverse() : [];
        return list;
    },
    right_panel_open(state) {
        return state.rightPanel.open[state.leftWindow.signame];
    }
    // history_nomore(state) {
    //     return state.history_nomore[state.leftWindow.id];
    // }
};