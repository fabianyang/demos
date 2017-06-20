import axios from 'axios';
import md5 from 'md5';
import util from '../util';
import setting from '../setting';

let config = window.FangChat.config;

export default {
    pasteUploadImage(base64) {
        return axios({
            url: setting.PASTE_IMG_PATH,
            method: 'post',
            data: util.queryStringify({
                projectName: 'webim',
                base64: encodeURIComponent(base64)
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).then(function (response) {
            let data = response.data;
            let url = setting.PASTE_IMG_BACK_URL_PREFIX + response.data.imgUrl;
            if (data.code !== '100') {
                url = '';
            }
            window.FangChat.picUploadComplete(url);
        }).catch(function (error) {
            console.log(error);
        });
    },

    // OA天下聊批量获取用户详情接口
    getLotUserDetail(names) {
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
                command: 'getLotUserDetail',
                SoufunNames: names
            })
        }).catch(function (error) {
            console.log(error);
        });
    },

    // OA天下聊获取上下级关系接口
    myManagerAndSubordinate() {
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
                command: 'myManagerAndSubordinate'
            })
        }).catch(function (error) {
            console.log(error);
        });
    },

    mySubordinate() {
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
                command: 'mySubordinate'
            })
        }).catch(function (error) {
            console.log(error);
        });
    },

    getChatMsgHistory(params) {
        let command = params.sendto.split(':')[0] === 'oa' ? 'getChatMsgHistory' : 'getGroupChatMsgHistory';
        // 空值 sign 和 data 都不要传
        let key = md5(config.username + 'soufunchat').toUpperCase();
        let sign = 'command=' + command + 'from=' + config.username + 'sendto=' + params.sendto + key + config.key;
        console.log(sign);

        return axios({
            url: setting.HTTP_CI,
            method: 'post',
            data: util.queryStringify({
                im_username: config.username,
                from: config.username,
                sendto: params.sendto,
                // fn: params.fn,   // n(下一页) 或p(上一页);为空，则默认上一页。 如 fn=p ：表示获取上一页
                // pageSize: params.pageSize,   // 默认20
                // messageid: params.messageid || '',
                // filter: '', // 过滤条件

                command: command,
                sign: md5(sign)
            })
        }).catch(function (error) {
            console.log(error);
        });
    },

    fuzzyQuery(opts) {
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
                name: opts.keyword,
                start: opts.start || 0,
                limit: opts.limit || 20,
                command: 'fuzzyQuery'
            })
        }).catch(function (error) {
            console.log(error);
        });
    }
};