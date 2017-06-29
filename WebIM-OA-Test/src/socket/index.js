import http from './http';
import events from '../events';
import storage from '../store/storage';

// let config = window.FangChat.config;

let Socket = null;
if (window.WebSocket) {
    Socket = require('./webSocket').Socket;
} else {
    Socket = require('./longPolling').Socket;
}


class IndexSocket {
    constructor() {
        this.core = new Socket();
    }

    init(config, isReco) {
        try {
            this.core.login(config, isReco).then(() => {
                setTimeout(() => {
                    if (!isReco) {
                        events.trigger('socket:state:change', 'syncing');
                        this.sync(isReco).then(() => {
                            setTimeout(() => {
                                events.trigger('socket:state:change', 'open');
                                // events.trigger('socket:state:change', 'close');
                            }, 1000);
                        });
                    } else {
                        events.trigger('socket:state:change', 'open');
                    }
                }, 1000);
            }).catch(function (error) {
                console.log(error);
                events.trigger('socket:state:change', 'error');
            });
        } catch (e) {
            console.error(e);
        }
    }

    sync() {
        return new Promise((resolve, reject) => {
            let data = {
                info_group: storage.coreGet('info_group') || {},
                info_user: storage.coreGet('info_user') || {},
                view_notice: storage.coreGet('view_notice') || [],
                view_notice_single: storage.coreGet('view_notice_single') || [],
                view_notice_group: storage.coreGet('view_notice_group') || [],
                view_book_group: storage.coreGet('view_book_group') || [],
                view_book_buddy: storage.coreGet('view_book_buddy') || [],
                view_book_manager: storage.coreGet('view_book_manager') || [],
                view_book_mate: storage.coreGet('view_book_mate') || [],
                view_book_follow: storage.coreGet('view_book_follow') || [],
                notice_list: storage.coreGet('notice_list') || []
            };

            let sync_http = (sync_count) => {
                Promise.all([
                    this.sync_buddy(true),
                    this.sync_group(true),
                    this.sync_manager(true),
                    this.sync_mate(true)
                ]).then((res) => {
                    console.log('sync from http finish!', res);
                    if (sync_count) {
                        resolve();
                        let time = storage.getSynctime();
                        if (time) {
                            // 同步联系人完成后，同步未读消息
                            this.syncRecentCount(time);
                        }
                    }
                });
            };

            // 有存储备份信息。
            if (Object.keys(data.info_user).length) {
                let promise = new Promise((resolve, reject) => {
                    data.resolve = resolve;
                    events.trigger('socket:restore:info', data);
                });
                promise.then(() => {
                    console.log('sync from localstorage finish!');
                    resolve();
                    let time = storage.getSynctime();
                    console.log('sync time: ' + time);
                    if (time) {
                        // 同步联系人完成后，同步未读消息
                        this.syncRecentCount(time);
                    }
                    sync_http(false);
                });
            } else {
                sync_http(true);
            }
        });
    }

    sendMessage(msg) {
        try {
            this.core.socketSendMessage(msg).then((data) => {
                events.trigger('socket:messagekey:back', data);
            });
        } catch (e) {
            console.error(e);
        }
    }

    sync_buddy() {
        try {
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
                    });
                });
            });
        } catch (e) {
            console.error(e);
        }
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
                    console.log(data.ErrMsg);
                    return;
                }
                data = data.Data;
                let list = data.map((v) => {
                    let id = 'oa:' + v.SoufunId;
                    return Object.assign(info[id], {
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
        let that = this;
        try {
            return new Promise((resolve, reject) => {
                this.core.syncGroup().then((data) => {
                    that.getGroupInfo(data).then((data) => {
                        resolve(data);
                    });
                });
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * core.socketGroupInfo.then([]) reponse is array
     * 直接触发事件
     */
    getGroupInfo(groups) {
        return new Promise((resolve, reject) => {
            this.core.socketGroupInfo(groups).then((data) => {
                events.trigger('socket:receive:group', data);
                resolve(data);
            });
        });
    }

    // 获取群列表
    sync_manager() {
        return new Promise((resolve, reject) => {
            http.myManagerAndSubordinate().then((response) => {
                let data = response.data;
                if (data.code !== '1') {
                    console.log(data.message);
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
                        reject(data.ErrMsg);
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
                });
            });
        });
    }

    // 获取群列表
    sync_mate() {
        return new Promise((resolve, reject) => {
            http.mySubordinate().then((response) => {
                let data = response.data;
                if (data.code !== '1') {
                    console.log(data.message);
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
                        reject(data.ErrMsg);
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
                });
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
        });
    }

    postHistory(data) {
        http.getChatMsgHistory({
            sendto: data.id,
            messageid: data.messageid,
            fn: data.fn,
            pageSize: data.pageSize
        }).then((response) => {
            let message = response.data.message;
            if (message.length) {
                events.trigger('socket:receive:history', {
                    id: data.id,
                    exec: data.exec,
                    history: message
                });
            }
        });
    }

    postSearchUser(data) {
        http.fuzzyQuery({
            keyword: data.keyword,
            start: data.start
        }).then((response) => {
            let hits = response.data.hits;
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
        });
    }
}

let is = new IndexSocket();
is.init();

export default is;

// socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');
// let socket = new WebSocket('ws://124.251.46.69:9999/chat?command=login&username=oa:184241&agentid=184241&clienttype=web&usertype=oa&nickname=yangfan&os=windows&imei=98:5A:EB:CA:CF:D2');
