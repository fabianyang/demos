import util from '../util';

class Socket {
    constructor() {
        if (window.WebSocket) {
            let {
                ws
            } = require('./socket');
            this.core = ws;
        } else {
            // longPollingSocket
        }
    }

    init() {
        try {
            this.core.init();
        } catch (e) {
            console.error(e);
        }
    }

    sendMsg(msg) {
        try {
            this.core.sendMsg(msg);
        } catch (e) {
            console.error(e);
        }
    }

    syncBuddy() {
        try {
            this.core.syncBuddy();
        } catch (e) {
            console.error(e);
        }
    }

    syncGroup(id) {
        try {
            if (util.isArray(id)) {
                this.syncGroupCount = id.length;
                id.forEach((v) => {
                    this.core.socketGroupInfo(v);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    getBuddyInfo(buddy) {
        try {
            this.core.postUserInfo(buddy.id.split(':')[1], {
                [buddy.id]: buddy
            });
        } catch (e) {
            console.error(e);
        }
    }

    getGroupInfo(group) {
        try {
            this.core.socketGroupInfo([group.id]);
        } catch (e) {
            console.error(e);
        }
    }

    getRecentMessage(group) {
        try {
            this.core.socketGroupInfo(group.id);
        } catch (e) {
            console.error(e);
        }
    }

    getHistory(data) {
        try {
            this.core.postHistory(data);
        } catch (e) {
            console.error(e);
        }
    }

    searchUser(data) {
        try {
            this.core.postSearchUser(data);
        } catch (e) {
            console.error(e);
        }
    }
}

let socket = new Socket();
socket.init();

export default socket;

// socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');
// let socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');
