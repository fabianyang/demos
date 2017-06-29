import axios from 'axios';
import InterfaceReceive from './interfaceReceive';
import setting from '../setting';
import util from '../util';

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

class LongPolling extends InterfaceReceive {
    constructor() {
        super();
        this.imei = this.imei();
    }

    // 与 websocket 请求方式不同的需要提出
    syncGroup() {
        return new Promise((resolve, reject) => {
            this.getgrouplist().then((data) => {
                let message = data.data.message;
                resolve(message.split(',').filter((x) => x));
            });
        });
    }

    syncBuddy() {
        return new Promise((resolve, reject) => {
            this.getbuddyV3().then((data) => {
                // message	好友列表：用户名,分组,备注,是否特别关注,在线状态 每个好友由\t隔开	oa:195626,我的好友,,0,1\toa:18908,我的好友,刘新路,0,1
                let message = data.data.message;
                resolve(message.split('\t').filter((x) => x));
            });
        });
    }

    socketGroupInfo(data) {
        return new Promise((resolve, reject) => {
            this.receiveGroupInfo = closeGroupInfo(data.length, resolve);
            data.forEach((v) => {
                this.getgroupinfoV2(v).then((data) => {
                    let message = data.data.message;
                    this.receiveGroupInfo(message);
                });
            });
        });
    }

    socketRecentCount(time) {
        return new Promise((resolve, reject) => {
            this.getmessagecountbytime(time).then((data) => {
                let contact = data.data.recentcontacts,
                    group = data.data.recentgroups;
                resolve({
                    buddy: contact,
                    group: group
                });
            });
        });
    }

    socketSendMessage(message) {
        return new Promise((resolve, reject) => {
            this.sendMessage(message).then((data) => {
                if (data.status === 200) {
                    resolve({
                        messagekey: message.messagekey,
                        sendto: message.sendto
                    });
                } else {
                    reject(data.message);
                }
            });
        });
    }

    // chat/img
    sendMessage(data) {
        return axios({
            url: setting.LONGPOLLING_CHAT,
            method: 'post',
            data: util.queryStringify({
                username: config.username,
                from: config.username,
                sendto: data.sendto,
                clienttype: config.clienttype,
                type: config.usertype,
                os: config.os,
                message: data.message,
                command: data.command,
                nickname: config.nickname,
                city: config.city,
                imei: this.imei
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    // loginout
    login(command = 'login') {
        return new Promise((resolve, reject) => {
            axios({
                url: setting.LONGPOLLING_CHAT,
                method: 'post',
                data: util.queryStringify({
                    clienttype: config.clienttype,
                    type: config.usertype,
                    username: config.username,
                    nickname: config.nickname,
                    agentid: config.agentid,
                    city: config.city,
                    os: config.os,
                    imei: this.imei,
                    command: command
                })
            }).then((data) => {
                if (data.status === 200) {
                    this.polling = setInterval(() => {
                        this.request(util.guid());
                    }, 30 * 1000);
                    resolve();
                }
            });
        });
    }

    request(requestid) {
        return axios({
            url: setting.LONGPOLLING_CHAT,
            method: 'post',
            data: util.queryStringify({
                clienttype: config.clienttype,
                type: config.usertype,
                username: config.username,
                nickname: config.nickname,
                agentid: config.agentid,
                city: config.city,
                os: config.os,
                imei: this.imei,
                requestid: requestid,
                command: 'request'
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    getbuddyV3() {
        return axios({
            url: setting.LONGPOLLING_CI,
            method: 'post',
            data: util.queryStringify({
                clienttype: config.clienttype,
                type: config.usertype,
                username: config.username,
                nickname: config.nickname,
                token: config.token,
                resourceId: config.agentid,
                command: 'getbuddyV3'
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    getgroupinfoV2(groupid) {
        return axios({
            url: setting.LONGPOLLING_CI,
            method: 'post',
            data: util.queryStringify({
                clienttype: config.clienttype,
                type: config.usertype,
                username: config.username,
                nickname: config.nickname,
                token: config.token,
                resourceId: config.agentid,
                command: 'getgroupinfoV2',
                groupid: groupid
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    getgrouplist() {
        return axios({
            url: setting.LONGPOLLING_CI,
            method: 'post',
            data: util.queryStringify({
                clienttype: config.clienttype,
                type: config.usertype,
                username: config.username,
                nickname: config.nickname,
                token: config.token,
                resourceId: config.agentid,
                command: 'getgrouplist'
            })
        }).catch(function (error) {
            console.log(error);
        });
    }

    getmessagecountbytime(time) {
        return axios({
            url: setting.LONGPOLLING_CI,
            method: 'post',
            data: util.queryStringify({
                clienttype: config.clienttype,
                type: config.usertype,
                username: config.username,
                nickname: config.nickname,
                synctime: time - 1000,
                command: 'getmessagecountbytime'
            })
        }).catch(function (error) {
            console.log(error);
        });
    }
}

export let Socket = LongPolling;
