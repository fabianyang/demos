export default {
    message_list(state) {
        let list = state.message_lists[state.leftWindow.id];
        list = list ? list.concat().reverse() : [];
        return list;
    }
};