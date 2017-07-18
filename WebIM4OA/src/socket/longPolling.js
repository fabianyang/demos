import axios from 'axios';
import setting from '../setting';
import events from '../events';
import util from '../util';
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

class LongPolling {
    constructor() {
        this.imei = receiveApi.imei();
    }

    // loginout
    login(command = 'login') {
        return new Promise((resolve, reject) => {
            console.log('longPolling loging', config, this.imei);
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
            }).then((res) => {
                let data = res.data;
                if (data && data.state === '200') {
                    this.request();
                    resolve();
                } else {
                    receiveApi.socket_error();
                    reject();
                }
            }).catch((err) => {
                console.log('longpolling login error', err);
                receiveApi.socket_error();
                reject();
            });
        });
    }


    request() {
        let requestid = util.guid();
        if (this.polling) {
            this.polling.reject();
        }
        this.polling = axios({
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
        }).then((res) => {
            this.polling = null;
            let data = res.data;
            console.log(data);
            if (data && data.command === 'close') {
                return;
            }
            if (data && data.state === '-100') {
                this.login();
                return;
            }
            this.request();

            let json = util.isJSON(data.data);
            if (json) {
                let command = json.command;
                switch (command) {
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
            }
        }).catch(function (error) {
            this.polling = null;
            this.request();
            console.log('longpolling request error', error);
        });
    }

    // 与 websocket 请求方式不同的需要提出
    syncGroup() {
        return new Promise((resolve, reject) => {
            this.getgrouplist().then((data) => {
                let message = data.data.message;
                resolve(message.split(',').filter((x) => x));
            }).catch((err) => {
                console.log('longpolling syncGroup error', err);
            });
        });
    }

    syncBuddy() {
        return new Promise((resolve, reject) => {
            this.getbuddyV3().then((data) => {
                // message	好友列表：用户名,分组,备注,是否特别关注,在线状态 每个好友由\t隔开	oa:195626,我的好友,,0,1\toa:18908,我的好友,刘新路,0,1
                let message = data.data.message;
                resolve(message.split('\t').filter((x) => x));
            }).catch((err) => {
                console.log('longpolling syncBuddy error', err);
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
                }).catch((err) => {
                    console.log('longpolling socketGroupInfo error', err);
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
            }).catch((err) => {
                console.log('longpolling socketRecentCount error', err);
            });
        });
    }

    socketSendMessage(message) {
        return new Promise((resolve, reject) => {
            this.sendMessage(message).then((res) => {
                let data = res.data;
                if (data.state === '200') {
                    resolve(message.messagekey);
                } else {
                    reject(data.message);
                }
            }).catch((err) => {
                console.log('longpolling socketSendMessage error', err);
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
            console.log('longpolling sendMessage error', error);
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
            console.log('longpolling getbuddyV3 error', error);
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
            console.log('longpolling getgroupinfoV2 error', error);
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
            console.log('longpolling getgrouplist error', error);
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
            console.log('longpolling getmessagecountbytime error', error);
        });
    }
}

export let Socket = LongPolling;
