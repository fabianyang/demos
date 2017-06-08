<template>
    <ul>
        <li class="time">2017-03-10 10:30</li>
        <!-- 文字图片通知 -->
        <li>
            <div class="noticewrap">
                <div class="noticetit">
                    <p>F0合作申请产品需求讲解及需求细节讨论</p>
                    <p>收件人：allstaff</p>
                </div>
                <div class="noticecon">
                    <p>本次会议细节重点确认问题如下：</p>
                    <p>一、申请人角色相关</p>
                    <p>1、申请基本信息增加“姓名拼音”字段；</p>
                    <p>2、选择分行，增加“意向城市”属性，可切换，分行联想结果按城市联想；</p>
                    <p>3、有已签约状态申请后不允许再申请其他分行，涉及其他并行中的申请自动标记为“放弃/不合适”；</p>
                    <p>4、有未选择分行的申请，或者已有三个分行并行处理的情况，不可再发起新申请；</p>
                    <p>5、签约/面谈通知，三端发送（邮件、短信、IM），其中IM登录后可查看；</p>
                    <p>6、提交简历后状态为“投递成功”，分行总监或人事查看后标记为“已查看”，被邀请面谈后标记为“邀请面谈”，被邀请签约后标记为“邀请签约”，签字后标记为“已签约”，被人事或分行总监或审批未通过标记为“被拒绝”，自己撤回或放弃</p>
                </div>
                <div class="noticeimg">
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                </div>
            </div>
        </li>
        <li class="time">2017-03-10 10:30</li>
        <!-- 文字图片通知 -->
        <li>
            <div class="noticewrap">
                <div class="noticetit">
                    <p>F0合作申请产品需求讲解及需求细节讨论</p>
                    <p>收件人：allstaff</p>
                </div>
                <div class="noticecon">
                    <p><a href="#" title="">http://esf.fang.com/zt/201705/bjrmtjf.html?cms_uuid=201311339_bj_89785</a></p>
                </div>
                <div class="noticeimg">
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                </div>
            </div>
        </li>
        <li class="time">2017-03-10 10:30</li>
        <!-- 发送链接通知 -->
        <li>
            <div class="noticewrap">
                <div class="noticetit">
                    <p>F0合作申请产品需求讲解及需求细节讨论</p>
                    <p>收件人：allstaff</p>
                </div>
                <div class="noticecon2">
                    <div class="con">
                        <h6>需求升级调整安排需求升级调整安排需求升级调整安排需求升级调整安排</h6>
                        <p>提供财经日历，最权威外汇实时行情资讯，财经数据，外汇保证分析评论,提供财经日历，最权威外汇实时行情资讯，财经数据，外汇保证分析评论</p>
                    </div>
                    <div class="pic"><img src="images/user.jpg" alt=""></div>
                </div>
                <div class="noticeimg">
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                    <p><img src="images/pic.png" alt=""></p>
                </div>
            </div>
        </li>
    </ul>
</template>

<script>
    export default {
        name: 'left-chat',
        data() {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>

<style lang="scss" scoped>
    * {
        box-sizing: border-box;
    }

    div,
    ul,
    li,
    span,
    p {
        margin: 0;
        padding: 0;
        border: 0;
    }

    img,
    a img {
        border: 0;
        margin: 0;
        padding: 0;
    }

    h6 {
        margin: 0;
        padding: 0;
        font-size: 12px;
    }

    ul,
    li {
        list-style: none;
    }

    img {
        vertical-align: top;
    }

    a {
        color: #333;
        text-decoration: none;
    }

    a:hover {
        color: #333;
        cursor: pointer;
    }

    /* 左侧通知 */
    ul {
        width: 100%;
        height: 498px;
        padding: 15px;
        overflow-y: auto;
    }

    ul li {
        width: 100%;
        margin-bottom: 15px;
        overflow: hidden;
    }

    .noticewrap {
        width: 450px;
        height: auto;
        margin: 0 auto;
        padding: 15px;
        padding-right: 0;
        background: #f7f7f7;
    }

    .noticetit {
        width: 435px;
        height: auto;
        padding-right: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e5e5e5;
    }

    .noticetit p:first-child {
        color: #000;
        font-size: 16px;
        font-weight: bold;
        line-height: 16px;
    }

    .noticetit p:last-child {
        color: #999;
        font-size: 12px;
        line-height: 12px;
        margin-top: 8px;
    }

    .noticecon {
        width: 435px;
        height: auto;
        padding-right: 15px;
        margin-top: 10px;
    }

    .noticecon p {
        color: #333;
        font-size: 14px;
        line-height: 24px;
    }

    .noticecon p a {
        color: #4d90fe;
    }

    .noticecon2 {
        width: 420px;
        height: 86px;
        background: #ebebeb;
        padding: 10px;
        margin-top: -1px;
        overflow: hidden;
    }

    .noticecon2 .con {
        width: 320px;
        height: 66px;
        float: left;
    }

    .noticecon2 .con h6 {
        height: 20px;
        line-height: 20px;
        color: #333;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .noticecon2 .con p {
        height: 40px;
        line-height: 20px;
        color: #666;
        font-size: 14px;
        margin-top: 6px;
        overflow: hidden;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .noticecon2 .pic {
        width: 66px;
        height: 66px;
        border-radius: 5px;
        overflow: hidden;
        float: right;
    }

    .noticecon2 .pic img {
        width: 66px;
        height: auto;
    }

    .noticeimg {
        width: 100%;
        height: 140px;
        overflow: hidden;
    }

    .noticeimg p {
        float: left;
        width: 72px;
        height: 55px;
        margin-right: 15px;
        margin-top: 15px;
    }

    .noticeimg p img {
        width: 72px;
        height: 55px;
    }

    /* 聊天时间 */

    ul li.time {
        height: 15px;
        line-height: 15px;
        color: #999;
        font-size: 12px;
        text-align: center;
        margin: 0 auto 15px;
    }
</style>