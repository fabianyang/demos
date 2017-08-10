import http from './http';
import events from '../events';
import storage from '../store/storage';
import receiveApi from './interfaceReceive';

let Socket = null;
if (window.WebSocket) {
    Socket = require('./webSocket').Socket;
} else {
    console.log('not support websocket!');
    Socket = require('./longPolling').Socket;
}
let config = window.FangChat.config;

class IndexSocket {
    constructor() {
        this.core = new Socket();
        this.retryCount = 0;
        this.syncError = {
            buddy: true,
            group: true,
            manager: true,
            mate: true
        };
    }

    init(callback) {
        this.core.login().then(() => {
            this.sync().then(() => {
                callback && callback();
                // 获取登录人信息
                this.postUserInfo([{
                    id: config.username
                }]);

                // 同步联系人完成后，同步未读消息
                // 不同步未读消息了
                // let time = storage.getSynctime();
                // console.log('sync time: ' + time);
                // if (time) {
                //     this.syncRecentCount(time);
                // }
            }).catch(() => {
                console.log('sync error');
            });
        }).catch(function (error) {
            console.log('login', error);
            events.trigger('socket:state:change', 'error');
        });
    }

    sync() {
        return new Promise((resolve, reject) => {
            let data = {
                info_group: storage.coreGet('info_group') || {},
                info_user: storage.coreGet('info_user') || {},
                view_notice: storage.coreGet('view_notice') || [],
                view_notice_single: storage.coreGet('view_notice_single') || [],
                view_notice_group: storage.coreGet('view_notice_group') || [],
                notice_lists: storage.coreGet('notice_lists') || [],
                message_lists: storage.coreGet('message_lists') || {},
                draft: storage.coreGet('draft') || {}
            };

            // 有一个发生错误都会断掉
            // Promise.all([
            // ]).then((data) => {
            //     console.log(data);
            //     resolve();
            // }).catch((err) => {
            //     console.log('sync error', err);
            //     events.trigger('socket:state:change', 'error');
            // });

            // 有存储备份信息。

            let promise = new Promise((resolve, reject) => {
                data.resolve = resolve;
                events.trigger('socket:restore:info', data);
            });
            promise.then(() => {
                console.log('sync from localstorage finish!');
                this.hasRestore = true;
                resolve();
            });

            if (this.syncError.buddy) {
                this.sync_buddy().then(() => {
                    this.syncError.buddy = false;
                }).catch(() => {
                    this.syncError.buddy = true;
                });
            }
            if (this.syncError.group) {
                this.sync_group().then(() => {
                    this.syncError.group = false;
                }).catch(() => {
                    this.syncError.group = true;
                });
            }
            if (this.syncError.manager) {
                this.sync_manager().then(() => {
                    this.syncError.manager = false;
                }).catch(() => {
                    this.syncError.manager = true;
                });
            }
            if (this.syncError.mate) {
                this.sync_mate().then(() => {
                    this.syncError.mate = false;
                }).catch(() => {
                    this.syncError.mate = true;
                });
            }
        });
    }

    sendMessage(msg) {
        if (this.core.ws.readyState === WebSocket.CLOSED) {
            console.log('socket re init!');
            this.init(() => {
                this.sendMessage(msg);
            });
            return;
        }
        // 消息重发机制
        this.core.socketSendMessage(msg).then((data) => {
            events.trigger('socket:messagekey:back', {
                messagekey: data,
                sendto: msg.sendto,
                state: 1
            });
        }).catch((data) => {
            console.log('sendMessage error', data);
            events.trigger('socket:messagekey:back', {
                messagekey: data,
                sendto: msg.sendto,
                state: 2
            });
        });
    }

    sync_buddy() {
        return new Promise((resolve, reject) => {
            this.core.syncBuddy().then((data) => {
                let list = data.map((v) => {
                    let l = v.split(',');
                    return {
                        // 发消息使用 username
                        id: l[0],
                        // 用于判断是否为联系人时使用
                        follow: +l[3] ? 'follow' : '',
                        online: +l[4]
                    };
                });
                this.postUserInfo(list).then((data) => {
                    resolve(data);
                }).catch((data) => {
                    reject(data);
                });
            }).catch((data) => {
                console.log('core.syncBuddy error', data);
                reject(data);
            });
        });
    }

    postUserInfo(users) {
        let ids = [],
            info = {};
        users.forEach((v) => {
            ids.push(v.id.split(':')[1]);
            info[v.id] = v;
        });
        return new Promise((resolve, reject) => {
            http.getLotUserDetail(ids.join(',')).then((response) => {
                let data = response.data;
                if (data.IsSuccess !== '1') {
                    console.log('postUserInfo http.getLotUserDetail data.IsSuccess !== 1', data);
                    reject(data);
                    return;
                }
                data = data.Data;
                let list = data.map((v) => {
                    let id = 'oa:' + v.SoufunId;
                    return Object.assign({}, info[id], {
                        nickname: v.TrueName,
                        phone: v.Phone,
                        avatar: v.LogoUrl,
                        email: v.Officeemail,
                        department: v.OrgName
                    });
                });
                events.trigger('socket:receive:user', list);
                resolve(list);
            });
        });
    }

    /**
     * core.sync_group.then([]) reponse is array
     */
    sync_group() {
        return new Promise((resolve, reject) => {
            this.core.syncGroup().then((data) => {
                let list = data.map((v) => {
                    return {
                        id: v
                    };
                });
                this.getGroupInfo(list).then((data) => {
                    resolve(data);
                }).catch((data) => {
                    console.log('getGroupInfo error', data);
                    reject(data);
                });
            }).catch((data) => {
                console.log('core.syncGroup error', data);
                reject(data);
            });
        });
    }

    /**
     * core.socketGroupInfo.then([]) reponse is array
     * 直接触发事件
     */
    getGroupInfo(groups) {
        let ids = [],
            info = {};
        groups.forEach((v) => {
            ids.push(v.id);
            info[v.id] = v;
        });
        return new Promise((resolve, reject) => {
            this.core.socketGroupInfo(ids).then((data) => {
                let list = data.map((v) => {
                    return Object.assign({}, info[v.id], v);
                });
                events.trigger('socket:receive:group', list);
                resolve(data);
            }).catch((data) => {
                console.log('socketGroupInfo error', data);
                reject(data);
            });
        });
    }

    // 获取群列表
    sync_manager() {
        return new Promise((resolve, reject) => {
            http.myManagerAndSubordinate().then((response) => {
                let data = response.data;
                if (data.code !== '1') {
                    console.log('http.myManagerAndSubordinate edata.code !== 1', data);
                    reject(data);
                    return;
                }
                let managers = {};
                let ids = data.data.map((v) => {
                    let id = 'oa:' + v.id;
                    managers[id] = {
                        id: id,
                        nickname: v.name,
                        avatar: v.imgUrl,
                        department: v.OrgName
                    };
                    return v.id;
                }).join(',');

                http.getLotUserDetail(ids).then((response) => {
                    let data = response.data;
                    if (data.IsSuccess !== '1') {
                        console.log('myManagerAndSubordinate http.getLotUserDetail data.IsSuccess !== 1', data);
                        reject(data);
                        return;
                    }

                    let list = data.Data.map((v) => {
                        let id = 'oa:' + v.SoufunId;
                        return Object.assign(managers[id], {
                            nickname: v.TrueName,
                            phone: v.Phone,
                            avatar: v.LogoUrl,
                            email: v.Officeemail,
                            department: v.OrgName
                        });
                    });

                    events.trigger('socket:receive:manager', list);
                    resolve(list);
                }).catch(function (error) {
                    console.log('myManagerAndSubordinate http.getLotUserDetail', error);
                });
            }).catch(function (error) {
                console.log('myManagerAndSubordinate', error);
            });
        });
    }

    // 获取群列表
    sync_mate() {
        return new Promise((resolve, reject) => {
            http.mySubordinate().then((response) => {
                let data = response.data;
                if (data.code !== '1') {
                    console.log('http.mySubordinate data.code !== 1', data);
                    reject(data);
                    return;
                }
                let mates = {};
                let ids = data.data.map((v) => {
                    let id = 'oa:' + v.id;
                    mates[id] = {
                        id: id,
                        nickname: v.name,
                        avatar: v.imgUrl,
                        department: v.OrgName
                    };
                    return v.id;
                }).join(',');

                http.getLotUserDetail(ids).then((response) => {
                    let data = response.data;
                    if (data.IsSuccess !== '1') {
                        console.log('mySubordinate http.getLotUserDetail data.IsSuccess !== 1', data);
                        reject(data);
                        return;
                    }

                    let list = data.Data.map((v) => {
                        let id = 'oa:' + v.SoufunId;
                        return Object.assign(mates[id], {
                            nickname: v.TrueName,
                            phone: v.Phone,
                            avatar: v.LogoUrl,
                            email: v.Officeemail,
                            department: v.OrgName
                        });
                    });
                    events.trigger('socket:receive:mate', list);
                    resolve(list);
                }).catch(function (error) {
                    console.log('mySubordinate http.getLotUserDetail', error);
                });
            }).catch(function (error) {
                console.log('mySubordinate', error);
            });
        });
    }

    syncRecentCount(time) {
        this.core.socketRecentCount(time).then((data) => {
            events.trigger('socket:receive:recent', {
                buddy: data.buddy.map((v) => {
                    return {
                        id: v.id,
                        nickname: v.name,
                        recent_new: +v.messageCount
                    };
                }),
                group: data.group.map((v) => {
                    return {
                        id: v.id,
                        nickname: v.name,
                        recent_new: +v.messageCount
                    };
                })
            });
        }).catch((data) => {
            console.log('core.socketRecentCount error', data);
        });
    }

    postHistory(data) {
        http.getChatMsgHistory({
            sendto: data.id,
            messageid: data.messageid,
            fn: data.fn,
            pageSize: data.pageSize
        }).then((response) => {
            // console.log(response.data.message);
            let list = [];
            response.data.message.forEach((v, i) => {
                try {
                    let message = receiveApi.receiveSwitch(v);
                    // command = 'livechat' 就返回 undefined
                    if (message) {
                        list.push(message);
                    }
                } catch (e) {
                    console.log('receiveSwitch error!', 'value: ', v, 'index: ', i);
                    console.log(e);
                }
            });
            events.trigger('socket:receive:history', {
                id: data.id,
                exec: data.exec,
                history: list
            });
        }).catch((data) => {
            console.log('http.getChatMsgHistory error', data);
        });
    }

    postSearchUser(data) {
        http.fuzzyQuery({
            keyword: data.keyword,
            start: data.start
        }).then((response) => {
            let hits = response.data.hits;
            if (!hits) {
                console.log('postSearchUser', response.data);
                events.trigger('socket:search:user:back', []);
                return;
            }
            if (hits.length) {
                events.trigger('socket:search:user:back', hits.map((v) => {
                    return {
                        id: v.imusername,
                        nickname: v.nickname,
                        avatar: v.logourl,
                        department: v.sname
                    };
                }));
            } else {
                events.trigger('socket:search:user:back', []);
            }
        }).catch((data) => {
            console.log('http.fuzzyQuery error', data);
        });
    }


    pointRecord() {
        http.insertOrUpdateIsLimit().then((response) => {
            let data = response.data;
            if (data.code === 0) {
                console.log('记录布点:' + data.message);
            } else {
                console.log('记录布点:' + data.message);
            }
        }).catch((data) => {
            console.log('http.insertOrUpdateIsLimit error', data);
        });
    }
}

let is = new IndexSocket();
is.init();

export default is;

// socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');
// let socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');
