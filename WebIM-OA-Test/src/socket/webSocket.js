import InterfaceReceive from './interfaceReceive';
import util from '../util';
import setting from '../setting';

let config = window.FangChat.config;

let isJSON = (str) => {
    if (typeof str === 'string') {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
};

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

let PromiseResolve = {};

class WS extends InterfaceReceive {
    constructor() {
        super();
        this.imei = super.imei();
    }

    // 这里应该可以传参重新初始化
    login(data) {
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
            if (data) {
                params = Object.assign(params, data);
            }

            try {
                let ws = this.ws = new WebSocket(setting.WEBSOCKET_CHAT + '?' + util.queryStringify(params));

                ws.addEventListener('open', (event) => {
                    resolve();
                    // 开启心跳
                    setInterval(() => {
                        ws.send('t');
                    }, 80 * 1000);
                });

                this.initMessageEvent();

                ws.addEventListener('error', (event) => {
                    super.socket_error();
                });

                ws.addEventListener('close', (event) => {
                    // var code = event.code;
                    // var reason = event.reason;
                    // var wasClean = event.wasClean;
                    // handle close event
                    super.socket_close();
                });
            } catch (e) {
                reject();
            }
        });
    }

    initMessageEvent() {
        let that = this;
        this.ws.addEventListener('message', (msg) => {
            // 拿到心跳信息。此项目每 80 秒发送一个 t 字符串保持连接即可，不会返回信息。
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
                    case 'getgrouplist_ret':
                        // message 以“,”分隔的 群id	10000002,10000001,
                        // msgContent 以“,”分隔的 群的免打扰属性	1,1,
                        PromiseResolve[command](json.message.split(',').filter((x) => x));
                        break;
                    case 'getbuddyV3_ret':
                        PromiseResolve[command](json.message.split('\t').filter((x) => x));
                        break;
                    case 'getgroupinfoV2_ret':
                        that.receiveGroupInfo(json.message);
                        break;
                    case 'getmessagecountbytime_ret':
                        PromiseResolve[command]({
                            buddy: json.recentcontacts,
                            group: json.recentgroups
                        });
                        break;
                    case 'notice':
                        // purpose = 'tongzhi'; // 用于测试，写死
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
                                super.receiveCommonNotice(json);
                                break;
                            case 'voice_tongzhi':
                                super.receiveVoiceNotice(json);
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
                            super.receiveLinkChat(json);
                        } else {
                            super.receiveCommonChat(json);
                        }
                        break;
                    case 'img':
                    case 'group_img':
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"img","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/SouFunOA/Image/201705/11/B6914F3C821F50A9BF1DE50EB400AA95.jpg","messageid":"2019432","messagekey":"3C254A8D-9E9F-4D23-AB42-8B26D596340F","messagetime":"2017-05-11 16:44:31","msgContent":"{\"size\":\"640.000000*360.000000\"}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:31","sendto":"oa:184241","type":"oa"}
                        super.receiveImage(json);
                        break;
                    case 'voice':
                    case 'group_voice':
                        // {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"voice","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/SouFunOA/Audio/201705/11/BDA538CF460046FC893EA33BE41C5629.amr;67248;3;;","messageid":"2019435","messagekey":"6B8C191C160362C41341EACF1D5235DF","messagetime":"2017-05-11 16:44:40","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:40","sendto":"oa:184241","type":"oa"}
                        super.receiveVoice(json);
                        break;
                    case 'video':
                    case 'group_video':
                        // message   第一个分号前xxx.mp4表示视频rul     第三个分号前2为时长2秒
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"video","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws01.soufunimg.com/SouFunOA/video/201705/11/8CA1AE9C03EE8F4F956CF0D218390EF6.mp4;54;2;;;(null)","messageid":"2019443","messagekey":"EC7F220B2DF369705BD783F2B4E73A86","messagetime":"2017-05-11 16:44:58","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:58","sendto":"oa:184241","type":"oa"}
                        super.receiveVideo(json);
                        break;
                    case 'location':
                    case 'group_location':
                        // msgContent中title、pic表示标题、图片。标题中分号前为大标题，分号后为小标题。
                        // 我的位置 目前切图没有区分
                        // json = {"agentname":"张永强","city":"北京","clienttype":"phone","command":"location","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"116.310756;39.814532","messageid":"2019452","messagekey":"F14F4211-5A4B-459A-9604-C90C224804B0","messagetime":"2017-05-11 16:45:09","msgContent":"{\n  \"title\" : \"郭公庄701号;樊羊路附近\",\n  \"pic\" : \"http:\\/\\/imgws03.soufunimg.com\\/SouFunOA\\/Image\\/201705\\/11\\/5546B3FC3BFD163E9A3F71939476A6D1.jpg\"\n}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:45:09","sendto":"oa:184241","type":"oa"};
                        if (content && content.sharePosition === 'true') {
                            json.isMine = true;
                        }
                        super.receiveLocation(json);
                        break;
                    case 'card':
                        // message   名片内容，中有4个字段分号相隔。分别为 姓名、头像、部门、IM用户名
                        // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"card","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"岳彦磊;http://img8.soufunimg.com/sfwork/2016_12/06/M01/0A/36/wKgEQlhGtViINzyjAABbmBqQVLAAAW-UQPN_ckAAFuw888.jpg;前端技术研究组/平台技术中心;oa:13124","messageid":"2019462","messagekey":"A52DC2C2-E31B-4C89-92CA-4EEF05081C3C","messagetime":"2017-05-11 16:46:16","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:46:16","sendto":"oa:184241","type":"oa"}
                        super.receiveCard(json);
                        break;
                    case 'file':
                    case 'group_file':
                        // msgContent   中 filename、mimetype、size分别为 文件名称、类型、大小。
                        // json = {"agentname":"张永强","city":"北京","clienttype":"pc","command":"file","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/OA/201705/11/windows6C-3B-E5-19-59-05_1494492389048.txt","messageid":"2019468","messagekey":"5401f255-7b3c-491d-8788-a99469070e8c","messagetime":"2017-05-11 16:47:06","msgContent":"{\"filename\":\"HOSTS.txt\",\"mimetype\":\"text/plain\",\"size\":\"957\"}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:47:06","sendto":"oa:184241","type":"oa"}
                        super.receiveFile(json);
                        break;
                    case 'batchchat':
                        // 聊天记录
                        break;
                    case 'red_packets_cash':
                        // json = {"agentname":"张永强","city":"北京","clienttype":"phone","command":"red_packets_cash","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","message":"恭喜发财，大吉大利！","messageid":"2019482","messagetime":"2017-05-11 16:49:54","msgContent":"http://m.fang.com/my/?c=my&a=receiveRedBag&redBagId=4F959A6D3BAFEC0E3A44E4C6A24D611AF39FE9BFD95A9EC27968754734E762D5&sendPid=55710295&sendUname=rentapp4268031&acceptPid=55232425&acceptUname=&imSendUname=oa%3A51060&imAcceptUname=oa%3A44005&sendOAId=51060&acceptOAId=44005&vcode=aab5f7de3a54bb77df2b3711e0a45ee7","nickname":"张永强","purpose":"received","realSendtoClientType":"phone","sendtime":"2017-05-11 16:49:54","sendto":"oa:184241","type":"oa","typeid":"1"}
                        super.receiveRedBag(json);
                        break;
                }
            } else {
                let array = msg.data.split('=');
                if (array[0] === 'messagekey') {
                    let pr = PromiseResolve[array[1]];
                    pr && pr.resolve({
                        messagekey: array[1],
                        sendto: pr.sendto
                    });
                }
            }
            // events.trigger('socket:message');
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
        });
    }

    socketSendMessage(data) {
        return new Promise((resolve, reject) => {
            let msg = {
                form: config.username,
                sendto: data.sendto,
                clienttype: config.clienttype,
                type: config.usertype,
                message: data.message,
                command: data.command,
                messagekey: data.messagekey,
                agentname: config.nickname
            };
            this.send(msg);
            // messagekey 在发送时已生成
            let key = msg.messagekey;
            PromiseResolve[key] = {
                sendto: data.sendto,
                resolve: resolve
            };
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
        try {
            this.ws.send(JSON.stringify(data));
        } catch (e) {
            // 需要判断已经断开的情况
            console.log(e);
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
