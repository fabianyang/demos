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
    },
    sort_list_buddy(state) {
        return state.view_book_buddy.concat().sort((a, b) => {
            let aNick = state.info_user[a].nickname,
                bNick = state.info_user[b].nickname;
            return aNick.localeCompare(bNick);
        });
    },
    sort_list_manager(state) {
        return state.view_book_manager.concat().sort((a, b) => {
            let aNick = state.info_user[a].nickname,
                bNick = state.info_user[b].nickname;
            return aNick.localeCompare(bNick);
        });
    },
    sort_list_mate(state) {
        return state.view_book_mate.concat().sort((a, b) => {
            let aNick = state.info_user[a].nickname,
                bNick = state.info_user[b].nickname;
            return aNick.localeCompare(bNick);
        });
    },
    sort_list_group(state) {
        return state.view_book_group.concat().sort((a, b) => {
            let aNick = state.info_group[a].nickname,
                bNick = state.info_group[b].nickname;
            return aNick.localeCompare(bNick);
        });
    },
    sort_list_follow(state) {
        return state.view_book_follow.concat().sort((a, b) => {
            let aNick = state.info_user[a].nickname,
                bNick = state.info_user[b].nickname;
            return aNick.localeCompare(bNick);
        });
    }
    // history_nomore(state) {
    //     return state.history_nomore[state.leftWindow.id];
    // }
};