/*
 * @file: 新房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.1.0/xfSearch', [
    'dsy/util/1.1.0/util',
    'dsy/util/1.1.0/historyUtil'
], function (require, exports, module) {
    'use strict';
    var util = require('dsy/util/1.1.0/util');
    var HistoryUtil = require('dsy/util/1.1.0/historyUtil');
    var vars = seajs.data.vars;

    function XFSearch() {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-url="{{search_url}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.input = vars.searchInput;
        this.defaultText = vars.searchDefaultText.xf;
        this.defaultHref = vars.searchDefaultHref.xf;
        this.backup = {};
        this.tag = 'xf';
        this.suffix = '新房';
        this.historyKey = vars.cityCode + this.tag + 'His';
    }

    XFSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            // 搜索词
            key: opts.key || '',
            // 是否为红包
            redbag: opts.redbag || '',
            // 广告跳转 url
            adUrl: opts.adUrl || '',
            // 搜索跳转 url
            hrefUrl: opts.hrefUrl || '',
            // 地区
            district: opts.district || '',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 合景万景峰 70万起享41-47㎡地铁小户^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6809&ci=111793&or=10752&l=57384&bg=57387&b=53034&u=http://newhouse.sh.fang.com/zt/201607/hjwjf.html,国浩长风汇都 约170-225㎡央景大平层^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6812&ci=111793&or=7509&l=47878&bg=47881&b=42832&u=http://newhouse.sh.fang.com/zt/201606/ghcfhd0603.html,虹桥正荣府 青浦四开间朝南四房^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6817&ci=111793&or=2162&l=57404&bg=57407&b=53057&u=http://newhouse.sh.fang.com/zt/201604/hqzrf0419.html,3
    XFSearch.prototype.setAdvert = function (data) {
        var that = this;
        var rows = data.split(','),
            input = that.input;
        var length = rows.length;
        if (!length) {
            input.val(that.defaultText);
            return false;
        }
        // 最后一个为数字
        var row = rows[parseInt(Math.random() * (length - 1))].split('^');
        that.urlBackup(row[0], row[1], 'ad');
        input.val(row[0]);
        return true;
    };

    // 6,国浩长风汇都^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6823&ci=113215&or=8274&l=57719&bg=57722&b=53389&u=http://newhouse.sh.fang.com/zt/201606/ghcfhd0603.html,泰禾红桥^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6826&ci=111793&or=10143&l=57594&bg=57597&b=53280&u=http://newhouse.sh.fang.com/zt/201606/thhq627.html,合景万景峰^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6831&ci=111793&or=10752&l=57386&bg=57389&b=53035&u=http://newhouse.sh.fang.com/zt/201607/hjwjf.html,水榭兰亭^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6833&ci=111793&or=10750&l=57342&bg=57345&b=52975&u=http://newhouse.sh.fang.com/zt/201606/sxlt.html,好世凤翔苑^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6838&ci=111793&or=10751&l=57598&bg=57601&b=53284&u=http://fengxiangyuanhs.fang.com/,万科金域澜湾^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6840&ci=111793&or=7843&l=56931&bg=56934&b=52529&u=http://jinyulanwanwk021.fang.com/,颐景御府^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6843&ci=111793&or=10025&l=52895&bg=52898&b=48390&u=http://newhouse.sh.fang.com/zt/201606/yjyfpc0623.html,万科金域华府^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6845&ci=111793&or=2146&l=56938&bg=56941&b=52536&u=http://newhouse.sh.fang.com/zt/201604/wkjyhf0415.html,当代万国府MOMA^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6848&ci=111793&or=7650&l=56897&bg=56900&b=52482&u=http://wanguofumomaddsh.fang.com/,中洲里程^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6851&ci=111793&or=2161&l=56940&bg=56943&b=52538&u=http://newhouse.sh.fang.com/zt/201604/zzlc0412.html
    XFSearch.prototype.getSuggestList = function (data) {
        var that = this;
        var rows = data.split(',');

        // data[0] 改为了最后请求标识，防止先请求比后请求的先返回结果，导致查询错误。
        if (!rows.length || +rows[0] < vars.getRequestNumber()) {
            return false;
        }

        var array = [],
            html = '';
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i].split('^'),
                tpl = that.tpl;
            that.urlBackup(row[0], row[3]);
            var obj = that.formatSearch({
                key: row[0],
                district: $.trim(row[1]),
                hrefUrl: row[3],
                redbag: row[0] === '买新房 领红包 人人有份'
            });

            tpl = tpl.replace('{{search_key}}', obj.key);
            tpl = tpl.replace('{{search_url}}', obj.hrefUrl);
            tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
            tpl = tpl.replace('{{suggest_word}}', obj.redbag ? '<font color="red">' + obj.key + '</font>' : obj.key);
            tpl = tpl.replace('{{suggest_district}}', obj.district ? '[' + obj.district + ']' : '');

            var suggestCount = row[2];
            if (+suggestCount) {
                suggestCount = obj.redbag ? '支持' + suggestCount + '个楼盘' : '约' + suggestCount + '条';
            }
            tpl = tpl.replace('{{suggest_count}}', suggestCount);

            array.push(obj);
            html += tpl;
        }

        return {
            html: html,
            array: array
        };
    };

    XFSearch.prototype.urlBackup = function (key, url, prop) {
        var that = this;
        if (url && !that.backup[key]) {
            that.backup[key] = {
                url: url,
                prop: prop
            };
        }
    };

    // window.clickMainxinfang(e, houseUrl);
    /**
     * 进行跳转操作
     * 1、是否已经获取过该 key 的 url，直接用 url 跳转
     * 2、是否为广告，广告不记录历史（2016.07.13 改为记录历史）
     */
    XFSearch.prototype.searchByKey = function (pKey, pUrl) {
        var that = this;
        var key = pKey,
            url = pUrl,
            prop = '';
        var bu = that.backup[key];
        if (bu) {
            url = bu.url;
            prop = bu.prop;
        }
        // tj 没有 defaultHref / 分割
        if (url) {
            url = url.replace(/\&amp;/g, '&');
        } else if (key && key !== that.defaultText) {
            url = that.defaultHref + '/a9' + util.encode(key) + '/';
        } else {
            url = that.defaultHref + '/';
        }

        vars.aHref.href = url;
        vars.aHref.click();

        // 手动搜索 u 参数，后面为真正的跳转地址
        url = that.replaceUrlArg(url);
        that.setHistory(key, url);
    };

    XFSearch.prototype.setHistory = function (key, url) {
        var that = this;
        // 一般不会传入 void key, 以防万一
        if (key && key !== that.defaultText) {
            HistoryUtil.setHistory(that.historyKey, {
                key: key,
                hrefUrl: url,
                tag: that.tag,
                suffix: that.suffix
            });
        }
    };

    XFSearch.prototype.replaceUrlArg = function (pUrl) {
        var url = $.trim(pUrl);
        var pattern = 'u=http:([^&]*)';
        if (url.match(pattern)) {
            url = 'http:' + url.match(pattern)[1].trim();
        }
        return url;
    };

    module.exports = new XFSearch();
});
