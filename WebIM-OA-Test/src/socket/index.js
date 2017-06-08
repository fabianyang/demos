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
            msg.messagekey = util.guid();
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
            // 同步组信息
            if (id) {
                if (util.isArray(id)) {
                    this.syncGroupCount = id.length;
                    id.forEach((v) => {
                        this.core.syncGroup(v);
                    });
                } else {
                    this.syncGroupCount = 1;
                    this.core.syncGroup(id);
                }
            } else {
                this.core.syncGroup();
            }
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
