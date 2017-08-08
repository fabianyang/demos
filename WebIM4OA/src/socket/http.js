import axios from 'axios';
import md5 from 'md5';
import util from '../util';
import setting from '../setting';

let config = window.FangChat.config;

export default {
    uploadFile(file) {
        var formData = new FormData()
        formData.append('file', file)
        return axios({
            url: setting.UPLOAD_FILE_PATH,
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });
    },

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
            return Promise.resolve(url);
        }).catch(function (error) {
            console.log('pasteUploadImage', error);
            return Promise.reject();
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
        });
    },

    getChatMsgHistory(data) {
        let publicKey = 'Key_oa_2015-09-24 10:21:00Thu';
        // 空值 sign 和 data 都不要传
        let secretKey = md5(config.username + 'soufunchat').toUpperCase();

        let isSingle = data.sendto.split(':')[0] === 'oa';
        let command = isSingle ? 'getChatMsgHistory' : 'getGroupChatMsgHistory';

        let sign = [
            'command=' + command,
            data.fn ? 'fn=' + data.fn : '',
            'from=' + config.username,
            isSingle ? '' : 'groupid=' + data.sendto,
            data.messageid ? 'messageid=' + data.messageid : '',
            data.pageSize ? 'pageSize=' + data.pageSize : '',
            isSingle ? 'sendto=' + data.sendto : '',
            secretKey + publicKey
        ].join('');
        console.log(sign);

        let params = {
            im_username: config.username,
            from: config.username,
            // filter: '',  // 过滤条件
            command: command,
            sign: md5(sign)
        };
        if (data.fn) {
            // n(下一页) 或p(上一页);为空，则默认上一页。 如 fn=p ：表示获取上一页
            params.fn = data.fn;
        }
        if (data.messageid) {
            params.messageid = data.messageid;
        }
        if (data.pageSize) {
            params.pageSize = data.pageSize;
        }
        if (isSingle) {
            params.sendto = data.sendto;
        } else {
            params.groupid = data.sendto;
        }

        return axios({
            url: setting.HTTP_CI,
            method: 'post',
            data: util.queryStringify(params)
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
        });
    },

    insertOrUpdateIsLimit() {
        return axios({
            url: setting.LONGPOLLING_CI,
            method: 'post',
            data: util.queryStringify({
                clienttype: config.clienttype,
                type: config.usertype,
                username: config.username,
                nickname: config.nickname,
                token: config.token,
                command: 'insertOrUpdateIsLimit'
            })
        });
    }
};