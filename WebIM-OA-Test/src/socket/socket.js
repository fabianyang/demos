import util from '../util';
import setting from '../setting';
import events from '../events';
import http from './http';

let config = window.FangChat.config;
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
        this.httpServer = setting.LONGPOLLING_SERVER;
        this.lockReconnect = false;
        this.countRecnnect = 0;
        this.PromiseResolve = {};
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
        this.syncthen = {
            count: 0,
            then() {
                console.log(this.count++);
            }
        };

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
            let all = Promise.all([
                that.syncBuddy(),
                that.syncGroup(),
                that.syncManager(),
                that.syncMate()
            ]).then((res) => {
                console.log(res);
                // 同步联系人完成后，同步未读消息
                that.syncRecentCount();
            });

            setTimeout(() => {
                events.trigger('socket:open', config);
            }, interval);
        });

        ws.addEventListener('message', (msg) => {
            // 拿到心跳信息
            // this.heart()
            // console.log(msg.data);
            // console.log(msg);
            let json = isJSON(msg.data);
            if (json) {
                let command = json.command,
                    purpose = json.purpose,
                    content = isJSON(json.msgContent) && JSON.parse(json.msgContent);

                // command = 'notice'; // 用于测试，写死
                switch (command) {
                    case 'getbuddyV3_ret':
                        this.PromiseResolve[command](json.message);
                        break;
                    case 'getgrouplist_ret':
                        // message 以“,”分隔的 群id	10000002,10000001,
                        // msgContent 以“,”分隔的 群的免打扰属性	1,1,
                        this.PromiseResolve[command](json.message);
                        break;
                    case 'getgroupinfoV2_ret':
                        that.receiveGroupInfo(json.message);
                        break;
                    case 'getmessagecountbytime_ret':
                        that.receiveRecentMessageCount(json.recentcontacts, json.recentgroups);
                        break;
                    case 'notice':
                        // purpose = 'voice_tongzhi'; // 用于测试，写死
                        // 将展示名称定为通知标题
                        // json = {"clienttype":"phone","command":"notice","forceread":"false","form":"oa:51060","from":"oa:51060","housetitle":"文字通知","mallName":"王斌斌","message":"文字通知^@http://imgws03.soufunimg.com/SouFunOA/Image/201705/11/BEBD6FE13876A45ADD5529EBF7994908.jpg","messageid":"735145","messagetime":"2017-05-11 16:41:17.983","msgContent":"{\n  \"LogoUrl\" : \"http:\\/\\/img8.soufunimg.com\\/sfwork\\/2016_09\\/06\\/M07\\/0A\\/36\\/wKgEQFfOjRKISy0QAAAonPeoRxUAAW-TAEJdx0AACi0785.jpg\",\n  \"UserTitle\" : \"张永强\"\n}","projinfo":"654313","purpose":"tongzhi","realSendtoClientType":"phone","receiver":"{\n  \"subIds\" : \"\",\n  \"resIds\" : \"44005\",\n  \"agentType\" : \"\",\n  \"emailIds\" : \"\",\n  \"depIds\" : \"\"\n}","sendtime":"2017-05-11 16:41:17.983","sendto":"oa:44005","typeid":"1"}
                        // json = {"clienttype":"phone","command":"notice","forceread":"false","form":"oa:51060","from":"oa:51060","housetitle":"纯链接通知","mallName":"王斌斌","message":"http://www.fang.com^@http://imgws03.soufunimg.com/SouFunOA/Image/201705/11/778926A763CE435557AD51D2D8E868A0.jpg","messageid":"735152","messagetime":"2017-05-11 16:42:02.145","msgContent":"{\n  \"LogoUrl\" : \"http:\\/\\/img8.soufunimg.com\\/sfwork\\/2016_09\\/06\\/M07\\/0A\\/36\\/wKgEQFfOjRKISy0QAAAonPeoRxUAAW-TAEJdx0AACi0785.jpg\",\n  \"title\" : \"【北京房地产门户\\/房地产网】-北京搜房网\",\n  \"pic\" : \"https:\\/\\/static.soufunimg.com\\/common_m\\/m_public\\/201511\\/images\\/app_fang.png\",\n  \"UserTitle\" : \"张永强\",\n  \"desc\" : \"手机搜房网是中国最大的房地产家居移动互联网门户，为亿万用户提供全面及时的房地产新闻资讯内容,为所有楼盘提供网上浏览及业主论坛信息。覆盖全国300多个城市,找新房、找二手房、找租房,更多便捷,更加精准。\"\n}","projinfo":"654320","purpose":"tongzhi","realSendtoClientType":"phone","receiver":"{\n  \"subIds\" : \"\",\n  \"resIds\" : \"44005\",\n  \"agentType\" : \"\",\n  \"emailIds\" : \"\",\n  \"depIds\" : \"\"\n}","sendtime":"2017-05-11 16:42:02.145","sendto":"oa:44005","typeid":"1"}
                        // json = {"clienttype":"phone","command":"notice","forceread":"false","form":"oa:51060","from":"oa:51060","housetitle":"链接通知","mallName":"王斌斌","message":"http://www.fang.com","messageid":"735154","messagetime":"2017-05-11 16:43:11.786","msgContent":"{\n  \"LogoUrl\" : \"http:\\/\\/img8.soufunimg.com\\/sfwork\\/2016_09\\/06\\/M07\\/0A\\/36\\/wKgEQFfOjRKISy0QAAAonPeoRxUAAW-TAEJdx0AACi0785.jpg\",\n  \"title\" : \"【北京房地产门户\\/房地产网】-北京搜房网\",\n  \"pic\" : \"https:\\/\\/static.soufunimg.com\\/common_m\\/m_public\\/201511\\/images\\/app_fang.png\",\n  \"UserTitle\" : \"张永强\",\n  \"desc\" : \"手机搜房网是中国最大的房地产家居移动互联网门户，为亿万用户提供全面及时的房地产新闻资讯内容,为所有楼盘提供网上浏览及业主论坛信息。覆盖全国300多个城市,找新房、找二手房、找租房,更多便捷,更加精准。\"\n}","projinfo":"654322","purpose":"url_tongzhi","realSendtoClientType":"phone","receiver":"{\n  \"subIds\" : \"\",\n  \"resIds\" : \"44005\",\n  \"agentType\" : \"\",\n  \"emailIds\" : \"\",\n  \"depIds\" : \"\"\n}","sendtime":"2017-05-11 16:43:11.786","sendto":"oa:44005","typeid":"1"}
                        // json = {"clienttype":"phone","command":"notice","forceread":"false","form":"oa:51060","from":"oa:51060","housetitle":"语音通知","mallName":"王斌斌","message":"http://imgws03.soufunimg.com/SouFunOA/Audio/201705/11/5E87BC0E58663D435585CDF3EAA68375.amr;2","messageid":"735153","messagetime":"2017-05-11 16:42:33.874","msgContent":"{\n  \"LogoUrl\" : \"http:\\/\\/img8.soufunimg.com\\/sfwork\\/2016_09\\/06\\/M07\\/0A\\/36\\/wKgEQFfOjRKISy0QAAAonPeoRxUAAW-TAEJdx0AACi0785.jpg\",\n  \"UserTitle\" : \"张永强\"\n}","projinfo":"654321","purpose":"voice_tongzhi","realSendtoClientType":"phone","receiver":"{\n  \"subIds\" : \"\",\n  \"resIds\" : \"44005\",\n  \"agentType\" : \"\",\n  \"emailIds\" : \"\",\n  \"depIds\" : \"\"\n}","sendtime":"2017-05-11 16:42:33.874","sendto":"oa:44005","typeid":"1"}
                        json.nickname = json.housetitle;
                        switch (purpose) {
                            // 文字通知
                            case 'tongzhi':
                            case 'url_tongzhi':
                                that.receiveCommonNotice(json);
                                break;
                            case 'voice_tongzhi':
                                that.receiveVoiceNotice(json);
                                break;
                        }
                        break;
                    case 'chat':
                    case 'group_chat':
                        // 链接卡片
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"chat","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"www.fang.com","messageid":"2019427","messagekey":"B2FEE76E-B492-407F-8000-322768E74E8A","messagetime":"2017-05-11 16:44:22","msgContent":"{\n  \"title\" : \"【北京房地产门户\\/房地产网】-北京搜房网\",\n  \"pic\" : \"https:\\/\\/static.soufunimg.com\\/common_m\\/m_public\\/201511\\/images\\/app_fang.png\",\n  \"desc\" : \"手机搜房网是中国最大的房地产家居移动互联网门户，为亿万用户提供全面及时的房地产新闻资讯内容,为所有楼盘提供网上浏览及业主论坛信息。覆盖全国300多个城市,找新房、找二手房、找租房,更多便捷,更加精准。\"\n}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:22","sendto":"oa:184241","type":"oa"};
                        // content = isJSON(json.msgContent) && JSON.parse(json.msgContent);
                        if (content && content.title && content.pic && content.desc) {
                            json.command = json.command.replace('chat', 'link');
                            that.receiveLinkChat(json);
                        } else {
                            that.receiveCommonChat(json);
                        }
                        break;
                    case 'img':
                    case 'group_img':
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"img","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/SouFunOA/Image/201705/11/B6914F3C821F50A9BF1DE50EB400AA95.jpg","messageid":"2019432","messagekey":"3C254A8D-9E9F-4D23-AB42-8B26D596340F","messagetime":"2017-05-11 16:44:31","msgContent":"{\"size\":\"640.000000*360.000000\"}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:31","sendto":"oa:184241","type":"oa"}
                        that.receiveImage(json);
                        break;
                    case 'voice':
                    case 'group_voice':
                        // {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"voice","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/SouFunOA/Audio/201705/11/BDA538CF460046FC893EA33BE41C5629.amr;67248;3;;","messageid":"2019435","messagekey":"6B8C191C160362C41341EACF1D5235DF","messagetime":"2017-05-11 16:44:40","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:40","sendto":"oa:184241","type":"oa"}
                        that.receiveVoice(json);
                        break;
                    case 'video':
                    case 'group_video':
                        // message   第一个分号前xxx.mp4表示视频rul     第三个分号前2为时长2秒
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"video","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws01.soufunimg.com/SouFunOA/video/201705/11/8CA1AE9C03EE8F4F956CF0D218390EF6.mp4;54;2;;;(null)","messageid":"2019443","messagekey":"EC7F220B2DF369705BD783F2B4E73A86","messagetime":"2017-05-11 16:44:58","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:58","sendto":"oa:184241","type":"oa"}
                        that.receiveVideo(json);
                        break;
                    case 'location':
                    case 'group_location':
                        // msgContent中title、pic表示标题、图片。标题中分号前为大标题，分号后为小标题。
                        // 我的位置 目前切图没有区分
                        // json = {"agentname":"张永强","city":"北京","clienttype":"phone","command":"location","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"116.310756;39.814532","messageid":"2019452","messagekey":"F14F4211-5A4B-459A-9604-C90C224804B0","messagetime":"2017-05-11 16:45:09","msgContent":"{\n  \"title\" : \"郭公庄701号;樊羊路附近\",\n  \"pic\" : \"http:\\/\\/imgws03.soufunimg.com\\/SouFunOA\\/Image\\/201705\\/11\\/5546B3FC3BFD163E9A3F71939476A6D1.jpg\"\n}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:45:09","sendto":"oa:184241","type":"oa"};
                        if (content && content.sharePosition === 'true') {
                            json.isMine = true;
                        }
                        that.receiveLocation(json);
                        break;
                    case 'card':
                        // message   名片内容，中有4个字段分号相隔。分别为 姓名、头像、部门、IM用户名
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"card","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"岳彦磊;http://img8.soufunimg.com/sfwork/2016_12/06/M01/0A/36/wKgEQlhGtViINzyjAABbmBqQVLAAAW-UQPN_ckAAFuw888.jpg;前端技术研究组/平台技术中心;oa:13124","messageid":"2019462","messagekey":"A52DC2C2-E31B-4C89-92CA-4EEF05081C3C","messagetime":"2017-05-11 16:46:16","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:46:16","sendto":"oa:184241","type":"oa"}
                        that.receiveCard(json);
                        break;
                    case 'file':
                    case 'group_file':
                        // msgContent   中 filename、mimetype、size分别为 文件名称、类型、大小。
                        // json = {"agentname":"张永强","city":"北京","clienttype":"pc","command":"file","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/OA/201705/11/windows6C-3B-E5-19-59-05_1494492389048.txt","messageid":"2019468","messagekey":"5401f255-7b3c-491d-8788-a99469070e8c","messagetime":"2017-05-11 16:47:06","msgContent":"{\"filename\":\"HOSTS.txt\",\"mimetype\":\"text/plain\",\"size\":\"957\"}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:47:06","sendto":"oa:184241","type":"oa"}
                        that.receiveFile(json);
                        break;
                    case 'batchchat':
                        // 聊天记录
                        break;
                    case 'red_packets_cash':
                        // json = {"agentname":"张永强","city":"北京","clienttype":"phone","command":"red_packets_cash","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","message":"恭喜发财，大吉大利！","messageid":"2019482","messagetime":"2017-05-11 16:49:54","msgContent":"http://m.fang.com/my/?c=my&a=receiveRedBag&redBagId=4F959A6D3BAFEC0E3A44E4C6A24D611AF39FE9BFD95A9EC27968754734E762D5&sendPid=55710295&sendUname=rentapp4268031&acceptPid=55232425&acceptUname=&imSendUname=oa%3A51060&imAcceptUname=oa%3A44005&sendOAId=51060&acceptOAId=44005&vcode=aab5f7de3a54bb77df2b3711e0a45ee7","nickname":"张永强","purpose":"received","realSendtoClientType":"phone","sendtime":"2017-05-11 16:49:54","sendto":"oa:184241","type":"oa","typeid":"1"}
                        that.receiveRedBag(json);
                        break;
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
            this.PromiseResolve[ret] = resolve;
        }).then((data) => {
            // message	好友列表：用户名,分组,备注,是否特别关注,在线状态 每个好友由\t隔开	oa:195626,我的好友,,0,1\toa:18908,我的好友,刘新路,0,1
            let list = [];
            let buddys = {};
            data.split('\t').filter((x) => x).forEach((v) => {
                let l = v.split(',');
                buddys[l[0]] = {
                    // 发消息使用 username
                    id: l[0],
                    follow: +l[3],
                    online: +l[4]
                };
                list.push(l[0].split(':')[1]);
            });
            this.postUserInfo(list.join(','), buddys);
        });
    }

    postUserInfo(id, buddys) {
        http.getLotUserDetail(id).then((response) => {
            let data = response.data;
            if (data.IsSuccess !== '1') {
                console.log(data.ErrMsg);
                return;
            }
            data = data.Data;
            // 如果是数组是初始化，批量请求联系人
            if (util.isArray(data) && data.length > 1) {
                let list = [];
                data.forEach((v) => {
                    let id = 'oa:' + v.SoufunId;
                    let buddy = Object.assign(buddys[id], {
                        nickname: v.TrueName,
                        phone: v.Phone,
                        avatar: v.LogoUrl,
                        email: v.Officeemail,
                        department: v.OrgName
                    });
                    list.push(buddy);
                });
                events.trigger('socket:receive:buddy', list);
            } else {
                events.trigger('socket:receive:buddy',
                    Object.assign(buddys['oa:' + data[0].SoufunId], {
                        nickname: data[0].TrueName,
                        phone: data[0].Phone,
                        avatar: data[0].LogoUrl,
                        email: data[0].Officeemail,
                        department: data[0].OrgName
                    })
                );
            }
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
            this.PromiseResolve[ret] = resolve;
        }).then((data) => {
            this.socketGroupInfo(data.split(',').filter((x) => x));
        });
    }

    socketGroupInfo(data) {
        new Promise((resolve, reject) => {
            this.receiveGroupInfo = this.closeGroupInfo(data.length);
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
            let ret = 'getgroupinfoV2_ret';
            this.PromiseResolve[ret] = resolve;
        }).then(this.receiveGroupInfo);
    }

    // message 群id,群名,群主,群头像,群人数,管理员,群人数上限,以分隔符,分隔管理员之间以^分割	10016,新群名,testgroupuser1,http://xxxx,150,,50
    // housetype 群类型 privategroup：私有群，publicgroup：公有群 emailgroup：邮箱群	emailgroup
    // msgContent 群公告内容	公告内容，小于等于30字
    closeGroupInfo(count) {
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
                events.trigger('socket:receive:group', result);
            }
        };
    }

    // 获取群列表
    syncManager() {
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
    syncMate() {
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
        let msg = {
            command: 'getmessagecountbytime',
            messagekey: util.guid(),
            form: config.username,
            clienttype: config.clienttype,
            type: config.usertype,
            synctime: 1497408366000
        };
        if (time) msg.synctime = time;
        this.send(msg);
    }


    receiveRecentMessageCount(buddy, group) {
        events.trigger('socket:receive:recent', {
            buddy: buddy.map((v) => {
                return {
                    id: v.id,
                    nickname: v.name,
                    recent_new: +v.messageCount
                };
            }),
            group: group.map((v) => {
                return {
                    id: v.id,
                    nickname: v.name,
                    recent_new: +v.messageCount
                };
            })
        });
    }

    // 文字通知的
    // 纯链接文字通知（属于文字通知的一种）
    receiveCommonNotice(json) {
        let msg = this.formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        let message = json.message.split('^@');

        let card = null;
        if (content && content.title && content.pic && content.desc) {
            card = {
                title: content.title,
                pic: content.pic,
                desc: content.desc
            };
        }
        msg = Object.assign(msg, {
            purpose: json.purpose,
            // 通知时间
            messagetime: json.messagetime,
            // 通知标题
            housetitle: json.housetitle,
            // 收件人
            mallname: json.mallName,
            // 通知发送人姓名
            usertitle: content.UserTitle,
            // 通知内容
            message: message[0],
            pics: message.slice(1),
            card: card
        });

        events.trigger('socket:receive:notice', msg);
    }

    receiveVoiceNotice(json) {
        let msg = this.formatReceiveJSON(json);
        let content = isJSON(json.msgContent);

        msg = Object.assign(msg, {
            purpose: json.purpose,
            // 通知时间
            messagetime: json.messagetime,
            // 通知标题
            housetitle: json.housetitle,
            // 收件人
            mallname: json.mallName,
            // 通知发送人姓名
            usertitle: content.UserTitle,
            // 通知内容
            message: '[语音]请到APP中查看'
        });

        events.trigger('socket:receive:notice', msg);
    }


    formatReceiveJSON(json) {
        // group 类型发送的是群 id, 个人是 oa:id
        // 是不是要加一层过滤判断是否发送的是自己？ msgLists 有判断么？
        let isGroup = json.command.split('_')[0] === 'group';
        if (!isGroup) {
            if (json.sendto !== config.username) {
                console.log('is send to: ' + json.sendto);
            }
        }

        return {
            // 进行 msgList 信息列表区分。 VIEW_CHAT_CHANGE 使用
            id: json.from,
            nickname: json.nickname,
            // 发送消息 id oa:125460 群没有 oa 前缀
            sendto: json.sendto,
            command: json.command,
            time: new Date(json.sendtime).getTime()
        };
    }

    receiveFile(json) {
        let msg = this.formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        msg = Object.assign(msg, {
            message: json.message,
            extension: content.filename.substring(content.filename.lastIndexOf('.') + 1).toLowerCase(),
            filename: content.filename,
            size: content.size
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveCard(json) {
        let msg = this.formatReceiveJSON(json);
        let info = json.message.split(';');
        msg = Object.assign(msg, {
            message: json.message,
            card_nickname: info[0],
            card_avatar: info[1],
            card_department: info[2],
            card_username: info[3]
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveLocation(json) {
        let msg = this.formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        let title = content.title.split(';');
        let loc = json.message.split(';').join(',');

        msg = Object.assign(msg, {
            message: loc,
            title0: json.isMine ? '我的位置' : title[0],
            title1: title[1],
            // pic: 'http://api.map.baidu.com/staticimage/v2?ak=E4805d16520de693a3fe707cdc962045&center='+ loc+'&width=500&height=500&zoom=11&labels=%E6%B5%B7%E6%B7%80|116.487812,40.017524|%E6%9C%9D%E9%98%B3|%E5%A4%A7%E7%BA%A2%E9%97%A8|116.442968,39.797022|%E4%B8%B0%E5%8F%B0|116.275093,39.935251|116.28377,39.903743&labelStyles=%E6%B5%B7%E6%B7%80,1,32,0x990099,0xff00,1|%E4%B8%9C%E5%8C%97%E4%BA%94%E7%8E%AF,1,14,0xffffff,0x996600,1|%E6%9C%9D%E9%98%B3,1,14,,0xff6633,1|%E5%A4%A7%E7%BA%A2%E9%97%A8,1,32,0,0xffffff,1|%E6%9C%AA%E7%9F%A5%EF%BC%9F%EF%BC%81%23%EF%BF%A5%25%E2%80%A6%E2%80%A6%26*%EF%BC%88%EF%BC%89%EF%BC%81,1,14,0xff0000,0xffffff,1|%E4%B8%B0%E5%8F%B0%E5%A4%A7%E8%90%A5,1,24,0,0xcccccc,1|%E8%A5%BF%E5%9B%9B%E7%8E%AF,,14,0,0xffffff,|%E6%88%91%E4%BB%AC%E4%BC%9F%E5%A4%A7%E7%A5%96%E5%9B%BD%E9%A6%96%E9%83%BD%E5%8C%97%E4%BA%AC,1,25,0xffff00,0xff0000,0'
            pic: content.pic
        });
        events.trigger('socket:receive:chat', msg);
    }
    receiveRedBag(json) {
        let msg = this.formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[红包]请到APP中查看'
        });
        events.trigger('socket:receive:chat', msg);
    }
    receiveVideo(json) {
        let msg = this.formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[语音]请到APP中查看'
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveVoice(json) {
        let msg = this.formatReceiveJSON(json);
        let info = json.split(';');
        msg = Object.assign(msg, {
            message: info[0],
            second: info[2]
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveImage(json) {
        let msg = this.formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: json.message
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveLinkChat(json) {
        let msg = this.formatReceiveJSON(json);
        let content = isJSON(json.msgContent);
        msg = Object.assign(msg, {
            message: json.message,
            title: content.title,
            pic: content.pic,
            desc: content.desc
        });
        events.trigger('socket:receive:chat', msg);
    }

    receiveCommonChat(json) {
        let msg = this.formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: json.message
        });
        events.trigger('socket:receive:chat', msg);
    }

    sendMsg(data) {

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

    postHistory(data) {
        http.getChatMsgHistory({
            sendto: data.id
        }).then((response) => {
            console.log(response);
        });
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
