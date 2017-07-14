import util from '../util';
import setting from '../setting';
import events from '../events';
import receiveApi from './interfaceReceive';

let config = window.FangChat.config;

let closeGroupInfo = (count, resolve) => {
    let result = [];
    return (message) => {
        let list = message.split(',');
        let obj = {
            id: list[0],
            nickname: list[1],
            avatar: list[3] === 'null' ? '' : list[3],
            number: list[4]
        };
        result.push(obj);
        if (result.length === count) {
            resolve(result);
        }
    };
};

let PromiseResolve = {},
    PromiseRejectTimer = {},
    heart_timer = null;

class WS {
    constructor() {
        this.imei = receiveApi.imei();
    }

    // 这里应该可以传参重新初始化
    login() {
        return new Promise((resolve, reject) => {
            let params = {
                command: 'login',
                username: config.username,
                nickname: config.nickname,
                agentid: config.agentid,
                clienttype: config.clienttype,
                usertype: config.usertype,
                os: config.os,
                imei: this.imei
            };

            receiveApi.socket_connecting();
            let ws = this.ws = new WebSocket(setting.WEBSOCKET_CHAT + '?' + util.queryStringify(params));

            let resolveTimer = null;
            ws.addEventListener('open', (event) => {
                this.initMessageEvent();
                clearTimeout(resolveTimer);
                resolveTimer = setTimeout(() => {
                    receiveApi.socket_open();
                    resolve();
                }, 1000);
                // 开启心跳
                heart_timer = setInterval(() => {
                    ws.send('t');
                }, 80 * 1000);
            });

            ws.addEventListener('error', (event) => {
                clearInterval(heart_timer);
                receiveApi.socket_error();
            });

            ws.addEventListener('close', (event) => {
                // var code = event.code;
                // var reason = event.reason;
                // var wasClean = event.wasClean;
                // handle close event
                clearInterval(heart_timer);
                receiveApi.socket_close();
            });
        });
    }

    initMessageEvent() {
        // 拿到心跳信息。此项目每 80 秒发送一个 t 字符串保持连接即可，不会返回信息。
        // this.heart()
        // console.log(msg.data);
        // console.log(msg);
        let that = this;
        this.ws.addEventListener('message', (msg) => {
            let json = util.isJSON(msg.data);
            if (json) {
                let command = json.command;

                // command = 'notice'; // 用于测试，写死
                switch (command) {
                    case 'getgrouplist_ret':
                        // message 以“,”分隔的 群id  10000002,10000001,
                        // msgContent 以“,”分隔的 群的免打扰属性   1,1,
                        clearTimeout(PromiseRejectTimer[command]);
                        PromiseResolve[command](json.message.split(',').filter((x) => x));
                        break;
                    case 'getbuddyV3_ret':
                        clearTimeout(PromiseRejectTimer[command]);
                        PromiseResolve[command](json.message.split('\t').filter((x) => x));
                        break;
                    case 'getgroupinfoV2_ret':
                        that.receiveGroupInfo(json.message);
                        break;
                    case 'getmessagecountbytime_ret':
                        clearTimeout(PromiseRejectTimer[command]);
                        PromiseResolve[command]({
                            buddy: json.recentcontacts,
                            group: json.recentgroups
                        });
                        break;
                    case 'notice':
                        events.trigger('socket:receive:message', json);
                        break;
                    case 'chat':
                    case 'group_chat':
                    case 'batchchat':
                    case 'group_batchchat':
                    case 'img':
                    case 'group_img':
                    case 'voice':
                    case 'group_voice':
                    case 'video':
                    case 'group_video':
                    case 'location':
                    case 'group_location':
                    case 'card':
                    case 'group_card':
                    case 'file':
                    case 'group_file':
                    case 'red_packets_cash':
                        events.trigger('socket:receive:message', json);
                        break;
                }
            } else {
                let array = msg.data.split('=');
                if (array[0] === 'messagekey') {
                    clearTimeout(PromiseRejectTimer[array[1]]);
                    let pr = PromiseResolve[array[1]];
                    pr && pr(array[1]);
                }
            }
        });
    }

    // 同步联系人
    syncBuddy() {
        return new Promise((resolve, reject) => {
            let msg = {
                command: 'getbuddyV3',
                messagekey: util.guid(),
                form: config.username,
                clienttype: config.clienttype,
                type: config.usertype,
                agentname: config.nickname
            };
            this.send(msg);
            let ret = 'getbuddyV3_ret';
            PromiseResolve[ret] = resolve;
            PromiseRejectTimer[ret] = setTimeout(() => {
                reject();
            }, 5 * 1000);
        });
    }

    // 获取群列表
    syncGroup() {
        return new Promise((resolve, reject) => {
            let msg = {
                command: 'getgrouplist',
                messagekey: util.guid(),
                form: config.username,
                clienttype: config.clienttype,
                type: config.usertype,
                agentname: config.nickname
            };
            this.send(msg);
            let ret = 'getgrouplist_ret';
            PromiseResolve[ret] = resolve;
            PromiseRejectTimer[ret] = setTimeout(() => {
                reject();
            }, 10 * 1000);
        });
    }

    // message 群id,群名,群主,群头像,群人数,管理员,群人数上限,以分隔符,分隔管理员之间以^分割	10016,新群名,testgroupuser1,http://xxxx,150,,50
    // housetype 群类型 privategroup：私有群，publicgroup：公有群 emailgroup：邮箱群	emailgroup
    // msgContent 群公告内容	公告内容，小于等于30字
    socketGroupInfo(data) {
        return new Promise((resolve, reject) => {
            this.receiveGroupInfo = closeGroupInfo(data.length, resolve);
            data.forEach((v) => {
                let msg = {
                    command: 'getgroupinfoV2',
                    messagekey: util.guid(),
                    form: config.username,
                    clienttype: config.clienttype,
                    type: config.usertype,
                    agentname: config.nickname,
                    message: v
                };
                this.send(msg);
            });
        });
    }

    socketRecentCount(time) {
        return new Promise((resolve, reject) => {
            let msg = {
                command: 'getmessagecountbytime',
                messagekey: util.guid(),
                form: config.username,
                clienttype: config.clienttype,
                type: config.usertype,
                synctime: time - 1000
            };
            this.send(msg);
            let key = 'getmessagecountbytime_ret';
            // 不推荐这样用，https://stackoverflow.com/questions/26150232/resolve-javascript-promise-outside-function-scope
            PromiseResolve[key] = resolve;
            PromiseRejectTimer[key] = setTimeout(() => {
                reject();
            }, 5 * 1000);
        });
    }

    socketSendMessage(data) {
        return new Promise((resolve, reject) => {
            let msg = {
                form: config.username,
                clienttype: config.clienttype,
                type: config.usertype,
                message: data.message,
                command: data.command,
                messagekey: data.messagekey,
                agentname: config.nickname
            };
            if (data.command.split('_')[0] === 'group') {
                msg.houseid = data.sendto;
            } else {
                msg.sendto = data.sendto;
            }
            this.send(msg);
            // messagekey 在发送时已生成
            let key = msg.messagekey;
            PromiseResolve[key] = resolve;
            PromiseRejectTimer[key] = setTimeout(() => {
                reject(msg.messagekey);
            }, 3 * 1000);
        });
    }

    // heart() {
    //     // 60秒 发送一次心跳
    //     let timeout = 60 * 1000;
    //     let ws = this.instance;
    //     let timerSend = null,
    //         timerClose = null;
    //     if (timerSend) clearTimeout(timerSend);
    //     if (timerClose) clearTimeout(timerClose);

    //     timerSend = setTimeout(() => {
    //         // 这里发送一个心跳，后端收到后，返回一个心跳消息，
    //         // onmessage 拿到返回的心跳就说明连接正常
    //         ws.send('t');
    //         // 如果超过一定时间还没重置，说明后端主动断开了
    //         timerClose = setTimeout(function () {
    //             // 如果 onclose 会执行 reconnect，执行 ws.close() 就行了.如果直接执行 reconnect 会触发 onclose 导致重连两次
    //             ws.close();
    //         }, timeout);
    //     }, timeout);
    // }


    // reconnect() {
    //     // 避免重复连接
    //     if (this.lockReconnect) return;
    //     this.lockReconnect = true;
    //     // 重连 3 次，不再重连
    //     if (this.countRecnnect++ > 3) {
    //         events.trigger('socket:error');
    //         return;
    //     }

    //     // 没连接上会一直重连，设置延迟避免请求过多
    //     setTimeout(() => {
    //         this.init();
    //         this.lockReconnect = false;
    //     }, this.interval);
    // }

    send(data) {
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                console.log('WebSocket.CONNECTING');
                break;
            case WebSocket.OPEN:
                this.ws.send(JSON.stringify(data));
                break;
            case WebSocket.CLOSING:
                console.log('WebSocket.CLOSING');
                break;
            case WebSocket.CLOSED:
                console.log('WebSocket.CLOSED');
                this.login(data);
                break;
        }
    }
}

export let Socket = WS;

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
