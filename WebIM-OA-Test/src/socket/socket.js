import util from '../util';
import setting from '../setting';
import events from '../events';

let config = global.FangChat.config;
let qs = util.queryStringify(config);

let isJSON = (str) => {
    if (typeof str === 'string') {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
};

class WS {
    constructor() {
        this.interval = 2 * 1000;
        this.websocketServer = setting.WEBSOCKET_SERVER;
        this.httpServer = setting.HTTP_SERVER;
        this.lockReconnect = false;
        this.countRecnnect = 0;
    }

    // 这里应该可以传参重新初始化
    init() {
        try {
            this.instance = new WebSocket(this.websocketServer + '?' + qs);
            // events.trigger('socket:connecting'); websocketServer// 这个时候， evnets 竟然没有初始化成功
            this.initEvent();
        } catch (e) {
            this.reconnect();
        }
    }

    reconnect() {
        // 避免重复连接
        if (this.lockReconnect) return;
        this.lockReconnect = true;
        // 重连 3 次，不再重连
        if (this.countRecnnect++ > 3) {
            events.trigger('socket:error');
            return;
        }

        // 没连接上会一直重连，设置延迟避免请求过多
        setTimeout(() => {
            this.init();
            this.lockReconnect = false;
        }, this.interval);
    }

    initEvent() {
        let that = this;
        let ws = this.instance,
            interval = this.interval;

        ws.addEventListener('open', (event) => {
            // console.log('Socket has been opened');
            // console.log(event);
            // socket.send({ "form":"oa:184241","sendto":"","message":"","type":"web","clienttype":"oa","command":"getgrouplist"});

            // 开启心跳
            // this.heart();
            // setTimeout 防止连接过快，没有过度
            that.syncBuddy();
            that.syncGroup();

            setTimeout(() => {
                events.trigger('socket:open', config);
            }, interval);
        });

        ws.addEventListener('message', (msg) => {
            // 拿到心跳信息
            // this.heart()
            // console.log(msg.data);
            let json = isJSON(msg.data);
            if (json) {
                let command = json.command;
                // message	好友列表：用户名,分组,备注,是否特别关注,在线状态 每个好友由\t隔开	oa:195626,我的好友,,0,1\toa:18908,我的好友,刘新路,0,1

                if (command === 'getbuddyV3_ret') {
                    let message = json.message;
                    let list = [];
                    let tempOA = {};
                    message.split('\t').forEach((v) => {
                        if (!v) return;
                        let l = v.split(',');
                        let id = l[0].split(':')[1];
                        tempOA[id] = {
                            // 请求 http 接口使用 id
                            id: id,
                            // 发消息使用 username
                            username: l[0],
                            group: l[1],
                            follow: +l[3],
                            online: +l[4]
                        };
                        list.push(tempOA[id]);
                    });

                    events.trigger('socket:receive:buddy', list);
                    return;
                }
                // message 以“,”分隔的 群id	10000002,10000001,
                // msgContent 以“,”分隔的 群的免打扰属性	1,1,
                if (command === 'getgrouplist_ret') {
                    let message = json.message;
                    let list = message.split(',');
                    events.trigger('socket:receive:group', list);
                    return;
                }
                // message 群id,群名,群主,群头像,群人数,管理员,群人数上限,以分隔符,分隔管理员之间以^分割	10016,新群名,testgroupuser1,http://xxxx,150,,50
                // housetype 群类型 privategroup：私有群，publicgroup：公有群 emailgroup：邮箱群	emailgroup
                // msgContent 群公告内容	公告内容，小于等于30字
                if (command === 'getgroupinfoV2_ret') {
                    let message = json.message;
                    let list = message.split(',');
                    // console.log(list);
                    let obj = {
                        id: list[0],
                        // 群组没有 oa 前缀
                        username: list[0],
                        nickname: list[1],
                        avatar: list[3] === 'null' ? '' : list[3],
                        number: list[4]
                    };
                    events.trigger('socket:receive:group', obj);
                    return;
                }
            } else {
                let array = msg.data.split('=');
                if (array[0] === 'messagekey') {
                    events.trigger('socket:receive:messagekey', array[1]);
                }
            }
            // events.trigger('socket:message');
        });

        ws.addEventListener('error', () => {
            // setTimeout 防止连接过快，没有过度
            setTimeout(() => {
                events.trigger('socket:error');
            }, interval);
        });

        ws.addEventListener('close', (event) => {
            var code = event.code;
            var reason = event.reason;
            var wasClean = event.wasClean;
            // handle close event
            // console.log('Socket has been closed');
            // console.log(code, reason, wasClean);
            setTimeout(() => {
                events.trigger('socket:close');
            }, interval);
        });
    }

    sendMsg(data) {
        // debugger;
        let msg = {
            clienttype: config.clienttype,
            messagekey: data.messagekey,
            // oa:125460 oaid
            sendto: data.sendto,
            message: data.message,
            type: config.usertype,
            command: data.command,
            form: config.username,
            agentname: config.nickname
        };
        this.send(msg);
    }

    // 同步联系人
    syncBuddy() {
        let msg = {
            command: 'getbuddyV3',
            messagekey: util.guid(),
            form: config.username,
            clienttype: config.clienttype,
            type: config.usertype,
            agentname: config.nickname
        };
        this.send(msg);
    }

    // 获取群列表
    syncGroup(id) {
        let msg = {
            command: 'getgrouplist',
            messagekey: util.guid(),
            form: config.username,
            clienttype: config.clienttype,
            type: config.usertype,
            agentname: config.nickname
        };
        if (id) {
            msg.command = 'getgroupinfoV2';
            msg.message = id;
        }
        this.send(msg);
    }

    heart() {
        // 60秒 发送一次心跳
        let timeout = 60 * 1000;
        let ws = this.instance;
        let timerSend = null,
            timerClose = null;
        if (timerSend) clearTimeout(timerSend);
        if (timerClose) clearTimeout(timerClose);

        timerSend = setTimeout(() => {
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            // onmessage 拿到返回的心跳就说明连接正常
            ws.send('t');
            // 如果超过一定时间还没重置，说明后端主动断开了
            timerClose = setTimeout(function () {
                // 如果 onclose 会执行 reconnect，执行 ws.close() 就行了.如果直接执行 reconnect 会触发 onclose 导致重连两次
                ws.close();
            }, timeout);
        }, timeout);
    }

    send(data) {
        try {
            this.instance.send(JSON.stringify(data));
        } catch (e) {
            // 需要判断已经断开的情况
            console.log(e);
        }
    }
}

export let ws = new WS();

// console.log(server + '?' + qs);
// let ws = new WebSocket(server + '?' + qs);
// events.trigger('socket:connecting');

// let timer = setInterval(function () {
//     if (ws.readyState  === WebSocket.CONNECTING) {
//         events.trigger('socket:connecting');
//     }
//     // switch (socket.readyState) {
//     //     case WebSocket.CONNECTING:
//     //         console.log('WebSocket.CONNECTING');
//     //         break;
//     //     case WebSocket.OPEN:
//     //         console.log('WebSocket.OPEN');
//     //         break;
//     //     case WebSocket.CLOSING:
//     //         console.log('WebSocket.CLOSING');
//     //         break;
//     //     case WebSocket.CLOSED:
//     //         console.log('WebSocket.CLOSED');
//     //         break;
//     //     default:
//     //         // this never happens
//     //         break;
//     // }
// }, second);
