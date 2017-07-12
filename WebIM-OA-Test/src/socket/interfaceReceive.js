import events from '../events';
import util from '../util';

let config = window.FangChat.config;

let formatReceiveJSON = (json) => {
    // group 类型发送的是群 id, 个人是 oa:id
    // 是不是要加一层过滤判断是否发送的是自己？ msgLists 有判断么？
    // let isGroup = json.command.split('_')[0] === 'group';
    // if (!isGroup) {
    //     if (json.sendto !== config.username) {
    //         console.log('is send to: ' + json.sendto);
    //     }
    // }
    let messagetime = json.messagetime.substr(0, json.messagetime.lastIndexOf('.'));
    let time = new Date(messagetime).getTime();
    let result = {
        // 进行 msgList 信息列表区分。 VIEW_CHAT_CHANGE 使用
        from: json.from || json.form,
        nickname: json.nickname,
        // 发送消息 id oa:125460 群没有 oa 前缀
        sendto: json.sendto,
        command: json.command,
        messageid: json.messageid,
        messagekey: json.messagekey,
        messagetime: messagetime,
        time: time
    };

    let isGroup = json.command.split('_')[0] === 'group';
    if (isGroup) {
        result.id = json.houseid;
        result.sendto = json.houseid;
    } else if (result.from === config.username) {
        result.id = json.sendto;
    } else {
        result.id = result.from;
    }
    return result;
};

class InterfaceReceive {
    constructor() {
        this.init();
    }

    init() {
        events.on('socket:receive:message', (data) => {
            let message = this.receiveSwitch(data);
            if (message !== 'notice') {
                events.trigger('socket:receive:chat', message);
            }
        });
    }

    receiveSwitch(json) {
        let command = json.command,
            purpose = json.purpose,
            content = util.isJSON(json.msgContent) && JSON.parse(json.msgContent);

        // command = 'notice'; // 用于测试，写死
        switch (command) {
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
                        this.receiveCommonNotice(json);
                        break;
                    case 'voice_tongzhi':
                        this.receiveVoiceNotice(json);
                        break;
                }
                return 'notice';
            case 'chat':
            case 'group_chat':
                // 链接卡片
                // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"chat","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"www.fang.com","messageid":"2019427","messagekey":"B2FEE76E-B492-407F-8000-322768E74E8A","messagetime":"2017-05-11 16:44:22","msgContent":"{\n  \"title\" : \"【北京房地产门户\\/房地产网】-北京搜房网\",\n  \"pic\" : \"https:\\/\\/static.soufunimg.com\\/common_m\\/m_public\\/201511\\/images\\/app_fang.png\",\n  \"desc\" : \"手机搜房网是中国最大的房地产家居移动互联网门户，为亿万用户提供全面及时的房地产新闻资讯内容,为所有楼盘提供网上浏览及业主论坛信息。覆盖全国300多个城市,找新房、找二手房、找租房,更多便捷,更加精准。\"\n}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:22","sendto":"oa:184241","type":"oa"};
                // content = util.isJSON(json.msgContent) && JSON.parse(json.msgContent);
                if (content && content.title && content.pic && content.desc) {
                    json.command = json.command.replace('chat', 'link');
                    return this.receiveLinkChat(json);
                }
                return this.receiveCommonChat(json);
            case 'batchchat':
            case 'group_batchchat':
                return this.receiveBatchChat(json);
            case 'img':
            case 'group_img':
                // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"img","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/SouFunOA/Image/201705/11/B6914F3C821F50A9BF1DE50EB400AA95.jpg","messageid":"2019432","messagekey":"3C254A8D-9E9F-4D23-AB42-8B26D596340F","messagetime":"2017-05-11 16:44:31","msgContent":"{\"size\":\"640.000000*360.000000\"}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:31","sendto":"oa:184241","type":"oa"}
                return this.receiveImage(json);
            case 'voice':
            case 'group_voice':
                // {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"voice","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/SouFunOA/Audio/201705/11/BDA538CF460046FC893EA33BE41C5629.amr;67248;3;;","messageid":"2019435","messagekey":"6B8C191C160362C41341EACF1D5235DF","messagetime":"2017-05-11 16:44:40","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:40","sendto":"oa:184241","type":"oa"}
                return this.receiveVoice(json);
            case 'video':
            case 'group_video':
                // message   第一个分号前xxx.mp4表示视频rul     第三个分号前2为时长2秒
                // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"video","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws01.soufunimg.com/SouFunOA/video/201705/11/8CA1AE9C03EE8F4F956CF0D218390EF6.mp4;54;2;;;(null)","messageid":"2019443","messagekey":"EC7F220B2DF369705BD783F2B4E73A86","messagetime":"2017-05-11 16:44:58","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:44:58","sendto":"oa:184241","type":"oa"}
                return this.receiveVideo(json);
            case 'location':
            case 'group_location':
                // msgContent中title、pic表示标题、图片。标题中分号前为大标题，分号后为小标题。
                // 我的位置 目前切图没有区分
                // json = {"agentname":"张永强","city":"北京","clienttype":"phone","command":"location","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"116.310756;39.814532","messageid":"2019452","messagekey":"F14F4211-5A4B-459A-9604-C90C224804B0","messagetime":"2017-05-11 16:45:09","msgContent":"{\n  \"title\" : \"郭公庄701号;樊羊路附近\",\n  \"pic\" : \"http:\\/\\/imgws03.soufunimg.com\\/SouFunOA\\/Image\\/201705\\/11\\/5546B3FC3BFD163E9A3F71939476A6D1.jpg\"\n}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:45:09","sendto":"oa:184241","type":"oa"};
                return this.receiveLocation(json);
            case 'card':
                // message   名片内容，中有4个字段分号相隔。分别为 姓名、头像、部门、IM用户名
                // json = {"agentId":"51060","agentcity":"北京","agentname":"张永强","city":"北京","clienttype":"phone","command":"card","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"岳彦磊;http://img8.soufunimg.com/sfwork/2016_12/06/M01/0A/36/wKgEQlhGtViINzyjAABbmBqQVLAAAW-UQPN_ckAAFuw888.jpg;前端技术研究组/平台技术中心;oa:13124","messageid":"2019462","messagekey":"A52DC2C2-E31B-4C89-92CA-4EEF05081C3C","messagetime":"2017-05-11 16:46:16","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:46:16","sendto":"oa:184241","type":"oa"}
                return this.receiveCard(json);
            case 'file':
            case 'group_file':
                // msgContent   中 filename、mimetype、size分别为 文件名称、类型、大小。
                // json = {"agentname":"张永强","city":"北京","clienttype":"pc","command":"file","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","ip":"","message":"http://imgws03.soufunimg.com/OA/201705/11/windows6C-3B-E5-19-59-05_1494492389048.txt","messageid":"2019468","messagekey":"5401f255-7b3c-491d-8788-a99469070e8c","messagetime":"2017-05-11 16:47:06","msgContent":"{\"filename\":\"HOSTS.txt\",\"mimetype\":\"text/plain\",\"size\":\"957\"}","nickname":"张永强","realSendtoClientType":"phone","sendtime":"2017-05-11 16:47:06","sendto":"oa:184241","type":"oa"}
                return this.receiveFile(json);
            case 'red_packets_cash':
                // json = {"agentname":"张永强","city":"北京","clienttype":"phone","command":"red_packets_cash","form":"oa:51060","from":"oa:51060","houseid":"","housetitle":"","message":"恭喜发财，大吉大利！","messageid":"2019482","messagetime":"2017-05-11 16:49:54","msgContent":"http://m.fang.com/my/?c=my&a=receiveRedBag&redBagId=4F959A6D3BAFEC0E3A44E4C6A24D611AF39FE9BFD95A9EC27968754734E762D5&sendPid=55710295&sendUname=rentapp4268031&acceptPid=55232425&acceptUname=&imSendUname=oa%3A51060&imAcceptUname=oa%3A44005&sendOAId=51060&acceptOAId=44005&vcode=aab5f7de3a54bb77df2b3711e0a45ee7","nickname":"张永强","purpose":"received","realSendtoClientType":"phone","sendtime":"2017-05-11 16:49:54","sendto":"oa:184241","type":"oa","typeid":"1"}
                return this.receiveRedBag(json);
        }
    }

    // 文字通知的
    // 纯链接文字通知（属于文字通知的一种）
    receiveCommonNotice(json) {
        let msg = formatReceiveJSON(json);
        let content = util.isJSON(json.msgContent);
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
        let msg = formatReceiveJSON(json);
        let content = util.isJSON(json.msgContent);

        msg = Object.assign(msg, {
            purpose: json.purpose,
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

    receiveFile(json) {
        let msg = formatReceiveJSON(json);
        let content = util.isJSON(json.msgContent);
        msg = Object.assign(msg, {
            message: json.message,
            extension: content ? content.filename.substring(content.filename.lastIndexOf('.') + 1).toLowerCase() : '',
            filename: content ? content.filename : '未知',
            size: content ? content.size : '未知'
        });
        return msg;
    }

    receiveCard(json) {
        let msg = formatReceiveJSON(json);
        let info = json.message.split(';');
        msg = Object.assign(msg, {
            message: json.message,
            card_nickname: info[0],
            card_avatar: info[1],
            card_department: info[2],
            card_username: info[3]
        });
        return msg;
    }

    receiveLocation(json) {
        let msg = formatReceiveJSON(json);
        let content = util.isJSON(json.msgContent);
        let title = ['我的位置', '附近没有热点'];
        // 处理多条历史记录，无 msgContent 字段情况。
        if (content) {
            title = content.title.split(';');
            if (content.sharePosition === 'true') {
                title[0] = '我的位置';
            }
        }
        let loc = json.message.split(';').join(',');

        msg = Object.assign(msg, {
            message: loc,
            title0: title[0],
            title1: title[1],
            // pic: 'http://api.map.baidu.com/staticimage/v2?ak=E4805d16520de693a3fe707cdc962045&center='+ loc+'&width=500&height=500&zoom=11&labels=%E6%B5%B7%E6%B7%80|116.487812,40.017524|%E6%9C%9D%E9%98%B3|%E5%A4%A7%E7%BA%A2%E9%97%A8|116.442968,39.797022|%E4%B8%B0%E5%8F%B0|116.275093,39.935251|116.28377,39.903743&labelStyles=%E6%B5%B7%E6%B7%80,1,32,0x990099,0xff00,1|%E4%B8%9C%E5%8C%97%E4%BA%94%E7%8E%AF,1,14,0xffffff,0x996600,1|%E6%9C%9D%E9%98%B3,1,14,,0xff6633,1|%E5%A4%A7%E7%BA%A2%E9%97%A8,1,32,0,0xffffff,1|%E6%9C%AA%E7%9F%A5%EF%BC%9F%EF%BC%81%23%EF%BF%A5%25%E2%80%A6%E2%80%A6%26*%EF%BC%88%EF%BC%89%EF%BC%81,1,14,0xff0000,0xffffff,1|%E4%B8%B0%E5%8F%B0%E5%A4%A7%E8%90%A5,1,24,0,0xcccccc,1|%E8%A5%BF%E5%9B%9B%E7%8E%AF,,14,0,0xffffff,|%E6%88%91%E4%BB%AC%E4%BC%9F%E5%A4%A7%E7%A5%96%E5%9B%BD%E9%A6%96%E9%83%BD%E5%8C%97%E4%BA%AC,1,25,0xffff00,0xff0000,0'
            pic: content ? content.pic : ''
        });
        return msg;
    }
    receiveRedBag(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[红包]请到APP中查看'
        });
        return msg;
    }
    receiveVoice(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[语音]请到APP中查看'
        });
        return msg;
    }
    receiveBatchChat(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: '[聊天记录]请到APP中查看'
        });
        return msg;
    }

    receiveVideo(json) {
        let msg = formatReceiveJSON(json);
        let info = json.message.split(';');
        msg = Object.assign(msg, {
            message: info[0],
            second: util.secondFormat(+info[2])
        });
        return msg;
    }

    receiveImage(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: json.message
        });
        return msg;
    }

    receiveLinkChat(json) {
        let msg = formatReceiveJSON(json);
        let content = util.isJSON(json.msgContent);
        msg = Object.assign(msg, {
            message: json.message,
            title: content.title,
            pic: content.pic,
            desc: content.desc
        });
        return msg;
    }

    receiveCommonChat(json) {
        let msg = formatReceiveJSON(json);
        msg = Object.assign(msg, {
            message: json.message
        });
        return msg;
    }

    socket_error() {
        events.trigger('socket:state:change', 'error');
    }

    socket_close() {
        events.trigger('socket:state:change', 'close');
    }

    imei() {
        let imei = util.getCookie('fang_oaim_imei');
        if (!imei) {
            imei = util.imei_guid();
            util.setCookie('fang_oaim_imei', this.imei, 30);
        }
        return imei;
    }
}

export default new InterfaceReceive();