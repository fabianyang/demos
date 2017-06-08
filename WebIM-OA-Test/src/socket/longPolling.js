/**
 * longConnectSocket链接
 * by blue
 * 功能：长连接方式socket接口
 */
fangimjs.define("sdk/longConnectSocket", ["jquery", "json2", "util/util", "setting/setting", "event/event"], function (require, exports, module) {
    "use strict";
    /*flash加载判断操作*/
    var $ = require("jquery"),
        JSON = require("json2"),
        event = require("event/event"),
        setting = require("setting/setting").getInstance(),
        vars = fangimjs.data.vars,
        util = require("util/util");
    var CMD_JS_INIT = "CMD_JS_INIT",
        CMD_JS_ICON_CLICKED = "CMD_JS_ICON_CLICKED",
        CMD_JS_PAGE_ACTIVE = "CMD_JS_PAGE_ACTIVE",
        CMD_JS_SEND_MES = "CMD_JS_SEND_MES",
        CMD_JS_LOGOUT = "CMD_JS_LOGOUT",
        CMD_JS_RE_CONNECT = "CMD_JS_RE_CONNECT";
    var win = window;
    var localStorage = vars.localStorage;
    var FANG_IM_CONTACTS_LIST = "fang_im_contacts_list";
    var _msgid = 0;
    var loginErrorNumber = 0;
    var xhr;
    var ajaxSetting = {
        url: setting.LONG_CONNECT_REQUEST_PATH,
        type: 'POST',
        method: 'POST'
        //xhr: undefined,
        //dataType: "json",
        //headers:{'WebIM-UserName':that.selfData.originUserName}
    };

    function msgid() {
        return _msgid++;
    }

    var callList = [];

    function longConnectSocket() {
        this.contactList = [];
        this.newMsgIDList = [];
        this.storedMsgList = [];
        this.requestid = util.getGUID();
        this.msgSendTimes = [];
        this.loginSetTimeOutFlag = 0;//重连setTimeout函数标识
        this.pollingAjax = null;
    }

    longConnectSocket.prototype = {
        /**
         * 外部接口声明
         * @param type 类型
         * @param data 数据
         */
        callIM: function (type, data) {
            var that = this;
            if (undefined === xhr) {
                callList.push({type: type, data: data});
                that.setAjaxProxy();
            } else {
                that.execIM(type, data);
            }
        },
        execIM: function (type, data) {
            var that = this;
            switch (type) {
                case CMD_JS_INIT:
                    that.init(data);
                    break;
                case CMD_JS_ICON_CLICKED:
                    that.iconClickHandle(data);
                    break;
                case CMD_JS_SEND_MES:
                    that.sendMsg(data);
                    break;
                case CMD_JS_RE_CONNECT:
                    that.login();
                    break;
                case "SET_CONTACT_LIST_DATA":
                    that.setContactsList(data);
                case CMD_JS_LOGOUT:
                    that.logout();
            }
        },
        /**
         * 初始化
         * @param data
         */
        init: function (data) {
            var that = this;
            var regType = 0;
            that.imei = util.getCookie('polling_imei');
            if (!that.imei) {
                that.imei = util.getGUID();
                util.setCookie('polling_imei', that.imei, 30);
            }
            if (!data.username) {
                regType = 1;
                data.username = that.imei;
                data.showname = '网友-' + that.imei.substr(0, 6);
            }
            that.selfData = {
                city: data.city,
                regType: regType,//是否注册用户
                showname: data.showname || data.username,
                state: 2,//当前用户状态0链接中、1登录、2离线
                //username: data.username,
                userType: data.usertype,
                usercookie: data.cookie
            };
            that.selfData.username = (regType === 1 ? 'w:' : 'wl:') + data.username;
            ajaxSetting = $.extend(ajaxSetting, {
                xhr: xhr,
                dataType: "json",
                headers: {'WebIM-UserName': encodeURIComponent(data.username)}
            });
            that.selfData.uid = that.selfData.username;
            win.FangChat.setSelfData([that.selfData]);
            if (localStorage) {
                try {
                    var contactsList = localStorage.getItem(FANG_IM_CONTACTS_LIST);
                    while (typeof contactsList == "string") {
                        contactsList = JSON.parse(contactsList)
                    }
                    that.contactList = contactsList || [];
                } catch (e) {
                    util.trace("localStorage error");
                }
            }
            if ($.isArray(that.contactList) && that.contactList.length > 0) {
                win.FangChat.contactListDataChange([that.contactList]);
                that.selfData.usercookie = that.selfData.username;
            }
            if (that.selfData.usercookie) {
                that.login();
            }
            win.FangChat.setMaster([true]);
        },
        setAjaxProxy: function () {
            var that = this;
            var frame = $('<iframe src="' + setting.AJAX_PROXY_PATH + '" style="display:none"></iframe>');
            $(document.body).append(frame);
            var iframe = frame.get(0);
            iframe.onload = function () {
                that.getAjaxProxy(iframe);
            };
        },
        getAjaxProxy: function (iframe) {
            var that = this;
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            if (doc && doc.readyState && doc.readyState == "complete") {
                var getXhr = iframe.contentWindow.getXhr || iframe.getXhr;
                if (typeof getXhr === 'function') {
                    xhr = getXhr();

                    while (callList.length > 0) {
                        var obj = callList.shift();
                        that.execIM(obj.type, obj.data);
                    }
                } else {
                    //报严重错误
                }
            } else {
                setTimeout(function () {
                    that.getAjaxProxy(iframe);
                }, 100);
            }
        },
        /**
         * 登陆操作
         */
        login: function () {
            var that = this;
            if (that.loginSetTimeOutFlag) {
                clearTimeout(that.loginSetTimeOutFlag);
                that.loginSetTimeOutFlag = 0;
            }
            if (that.selfData.state !== 2)return;
            that.showSystemInfo("login");
            that.selfData.state = 0;//连接中
            var obj = {
                "command": "login",
                "imei": that.imei,
                "os": "web",
                "username": that.selfData.username,
                "usertype": that.selfData.userType,
                "city": that.selfData.city,
                "version": "",
                "nickname": that.selfData.showname
            };
            $.ajax($.extend({data: obj}, ajaxSetting))
                .done(function (data) {
                    that.loginSuccess(data);
                })
                .fail(function (data) {
                    if (data.status === 0) {
                        ajaxSetting = $.extend(ajaxSetting, {
                            dataType: 'jsonp',  //类型
                            jsonp: 'callback' //jsonp回调参数，必需
                        });
                    }
                    that.showSystemInfo("socket_error", 3000);
                    that.setUserState(2);
                    that.loginSetTimeOutFlag = setTimeout(function () {
                        that.reLogin();
                    }, 3000);
                });
        },
        reLogin: function () {
            var that = this;
            loginErrorNumber++;
            if (loginErrorNumber > 3) {
                loginErrorNumber = 0;
                that.showSystemInfo("socket_close");
                that.setUserState(2);
                return;
            }
            that.login();
        },
        /**
         * 设置联系人列表
         * @param data
         */
        setContactsList: function (data) {
            var that = this;
            if (data && $.isArray(data)) {
                that.contactList = data;
                try {
                    localStorage && localStorage.setItem(FANG_IM_CONTACTS_LIST, JSON.stringify(that.contactList));
                } catch (e) {
                    util.trace("localStorage error");
                }
            }
        },
        /**
         * 点击添加联系人后操作
         */
        iconClickHandle: function () {
            //写入联系人数据缓存
            var that = this;
            if (that.selfData.state == 2) {
                that.login();
            }
        },
        /**
         * 登陆成功操作
         * @param data
         */
        loginSuccess: function (data) {
            var that = this;
            if (data.state == 200) {
                that.showSystemInfo("sucess");
                that.setUserState(1);//连接成功，在线
                win.FangChat.setSelfData([that.selfData]);
                if (that.selfData.regType) {
                    win.FangChat.loginSuccess([that.selfData.username]);
                }
                that.polling();
                if (that.storedMsgList.length > 0) {
                    var l = that.storedMsgList.length;
                    for (var i = 0; i < l; i++) {
                        that.sendMsg(that.storedMsgList.shift());
                    }
                }
            } else {
                //登陆失败处理
                that.showSystemInfo("socket_error");
                that.setUserState(2);
            }
        },
        setUserState: function (value) {
            var that = this;
            that.selfData.state = value;
            // yf: 传参的时候和 flash 没有统一，导致 sfb im 状态一直没有轮训成功，现在已经修复。
            win.FangChat.setUserState([value]);
        },
        /**
         * 执行长轮询
         */
        polling: function () {
            var that = this;
            var obj = {
                command: "request",
                requestid: that.requestid,
                from: that.selfData.username
            };
            if (that.pollingAjax) {
                that.pollingAjax.abort();
            }
            that.pollingAjax = $.ajax($.extend({data: obj, timeout: setting.POLLING_INTERVAL}, ajaxSetting))
                .done(function (data) {
                    that.pollingAjax = null;
                    that.receiveMsg(data);
                })
                .fail(function () {
                    that.pollingAjax = null;
                    that.polling();
                });
        },
        /**
         * 收到消息操作
         * @param data
         */
        receiveMsg: function (data) {
            var that = this;
            //({"command":"close"})
            if (data && data.command == "close") {
                return;
            }
            if (data && (data.state == "-100")) {
                if (that.selfData.state === 1) {
                    that.setUserState(2);
                }
                that.login();
                return;
            }
            that.polling();
            if (!$.isArray(data))return;
            var l = data.length;
            var msgAckArray = [];
            win.FangChat.imLog(["poll", JSON.stringify(data)]);
            for (var i = 0; i < l; i++) {
                var msg = data[i];
                if (!msg.from)continue;
                if ($.inArray(msg.messageid, that.newMsgIDList) === -1) {
                    msg.showname = msg.nickname;
                    msg.caller = msg.from;
                    msg.msgMine = false;
                    msg.id = msg.messageid;
                    msg.time = msg.messagetime;//new Date().getTime(.replace('-','/'));
                    msg.customerId = msg.from;
                    msg.userid = msg.sendto;
                    msg.content = msg.message;
                    // msg.msgType = msg.command == 'img' ? 1 : 0;
                    if(msg.command == 'img') {//1图片
                        msg.msgType = 1;
                    } else if (msg.command == "com_card") {//2卡片
                        msg.msgType = 2;
                    } else if (msg.command == "red_packets_cash") {//3现金红包
                        msg.msgType = 3;
                    } else if (msg.command == "newhouses") {//4[房天下红包]（楼盘红包）、[楼盘]、[户型]
                        msg.msgType = 4;
                        msg.msgPurpose = msg.purpose;
                    } else if (msg.command == "house") {//5房源
                        msg.msgType = 5;
                    } else if (msg.command == "voice") {//6语音
                        msg.msgType = 6;
                    } else if (msg.command == "video") {//7视频
                        msg.msgType = 7;
                    } else if (msg.command == "namecard") {//8个人名片
                        msg.msgType = 8;
                    } else if (msg.command == "location") {//9位置
                        msg.msgType = 9;
                    } else {
                        msg.msgType = 0;
                        if(msg.purpose == "anli"){//案例
                            msg.msgPurpose = msg.purpose;
                        }
                    }

                    msg.agentId = msg.caller;
                    that.newMsgIDList.push(msg.messageid);
                    win.FangChat.recvMsg([msg]);
                }
                msgAckArray.push(msg.messageid);
            }
            that.msgAck(msgAckArray);
        },
        /**
         * 消息回执
         * @param array
         */
        msgAck: function (array) {
            var that = this;
            var obj = {
                command: "msgack",
                messageid: array.join(','),
                from: that.selfData.username
            };
            $.ajax($.extend({data: obj}, ajaxSetting));
        },
        /**
         * 发送消息
         * @param data
         */
        sendMsg: function (data) {
            if (data.autoMsg == 2)return;
            var that = this;
            if (undefined === data.messageid) {
                data.messageid = msgid();
            }
            var obj = {
                "from": data.from || data.form,
                "sendto": data.sendto,
                "message": data.content || data.message,
                "type": that.selfData.userType,
                "clienttype": "web",
                "command": data.command,
                "nickname": that.selfData.showname
            };
            var delaySendMsg = function (data) {
                that.storedMsgList.push(data);
                //that.login();
            };
            if (that.selfData.state != 1) {
                delaySendMsg(data);
                return;
            }
            var reSendMsg = function (data) {
                if (that.msgSendTimes[data.messageid] < 3) {
                    that.sendMsg(data);
                }
            };
            if (undefined === that.msgSendTimes[data.messageid])that.msgSendTimes[data.messageid] = 0;
            that.msgSendTimes[data.messageid] += 1;
            $.ajax($.extend({data: obj, cache: true}, ajaxSetting))
                .done(function (result) {
                    //that.sendMsgBack(result);
                    //{"command":"chat_ret","state":"200","message":"ok"}
                    if (result && result.state == "-100") {
                        delaySendMsg(data);
                        return;
                    }
                    if (result && result.command == 'chat_ret' && result.state == '200') {
                        //成功
                    } else {
                        reSendMsg(data);
                    }
                })
                .fail(function () {
                    reSendMsg(data);
                });
        },
        /**
         * 发送消息回执（预留）
         * @param data
         */
        sendMsgBack: function (data) {
        },
        /**
         * 显示系统消息
         * @param type
         * @param value
         */
        showSystemInfo: function (type, value) {
            var data = {type: type, value: value};
            win.FangChat.sysInfo([data]);
        },
        logout: function () {
            this.setUserState(2);
        }
    }
    module.exports = new longConnectSocket();
});
