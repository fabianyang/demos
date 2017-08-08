/*
 * @file: 新房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.1/xfSearch', [
    'dsy/search/1.2.1/interfaceSearch'
], function (require, exports, module) {
    'use strict';
    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.1/interfaceSearch');

    function XFSearch() {
        Search.call(this);
        this.tag = 'xf';
        this.suffix = '新房';
        this.init();
    }

    XFSearch.prototype = Object.create(Search.prototype);
    XFSearch.prototype.constructor = XFSearch;

    XFSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',
            '<td>{{suggest_count}}</td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.xf;
        this.defaultHref = vars.searchDefaultHref.xf;
        this.historyKey = this.getHistoryKey(this.tag);
        this.sessionKey = this.getSessionKey(this.tag);
    };

    XFSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            // 搜索词
            key: opts.key || '',
            // 广告跳转 url
            adUrl: opts.adUrl || '',
            // 搜索跳转 url
            hrefUrl: opts.hrefUrl || '',
            // 地区
            district: opts.district || '',
            store: opts.store || '1',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    // 广告：合景万景峰 70万起享41-47㎡地铁小户^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6809&ci=111793&or=10752&l=57384&bg=57387&b=53034&u=http://newhouse.sh.fang.com/zt/201607/hjwjf.html,国浩长风汇都 约170-225㎡央景大平层^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6812&ci=111793&or=7509&l=47878&bg=47881&b=42832&u=http://newhouse.sh.fang.com/zt/201606/ghcfhd0603.html,虹桥正荣府 青浦四开间朝南四房^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6817&ci=111793&or=2162&l=57404&bg=57407&b=53057&u=http://newhouse.sh.fang.com/zt/201604/hqzrf0419.html,3
    // 6,国浩长风汇都^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6823&ci=113215&or=8274&l=57719&bg=57722&b=53389&u=http://newhouse.sh.fang.com/zt/201606/ghcfhd0603.html,泰禾红桥^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6826&ci=111793&or=10143&l=57594&bg=57597&b=53280&u=http://newhouse.sh.fang.com/zt/201606/thhq627.html,合景万景峰^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6831&ci=111793&or=10752&l=57386&bg=57389&b=53035&u=http://newhouse.sh.fang.com/zt/201607/hjwjf.html,水榭兰亭^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6833&ci=111793&or=10750&l=57342&bg=57345&b=52975&u=http://newhouse.sh.fang.com/zt/201606/sxlt.html,好世凤翔苑^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6838&ci=111793&or=10751&l=57598&bg=57601&b=53284&u=http://fengxiangyuanhs.fang.com/,万科金域澜湾^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6840&ci=111793&or=7843&l=56931&bg=56934&b=52529&u=http://jinyulanwanwk021.fang.com/,颐景御府^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6843&ci=111793&or=10025&l=52895&bg=52898&b=48390&u=http://newhouse.sh.fang.com/zt/201606/yjyfpc0623.html,万科金域华府^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6845&ci=111793&or=2146&l=56938&bg=56941&b=52536&u=http://newhouse.sh.fang.com/zt/201604/wkjyhf0415.html,当代万国府MOMA^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6848&ci=111793&or=7650&l=56897&bg=56900&b=52482&u=http://wanguofumomaddsh.fang.com/,中洲里程^^ ^http://mshow.fang.com/c?z=fang&la=0&si=207&cg=442&c=6851&ci=111793&or=2161&l=56940&bg=56943&b=52538&u=http://newhouse.sh.fang.com/zt/201604/zzlc0412.html
    XFSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        var rows = data.split(','),
            suggestHtml = '',
            advertHtml = '';

        // data[0] 改为了最后请求标识，防止先请求比后请求的先返回结果，导致查询错误。
        if (rows.length && +rows[0] >= vars.getRequestNumber()) {
            for (var i = 1; i < rows.length; i++) {
                var row = rows[i].split('^'),
                    tpl = that.tpl;
                var key = row[0],
                    url = row[3];
                var adUrl = /^http:\/\/mshow\.fang\.com.*&u=/.test(url) ? that.replaceUrlArg(url) : '';
                var obj = that.formatSearch({
                    key: key,
                    district: row[1],
                    hrefUrl: url,
                    adUrl: adUrl,
                    store: adUrl ? '0' : '1'
                });

                var searchObject = JSON.stringify(obj);
                if (url) {
                    that.urlBackup(key, searchObject);
                }

                var isRedBag = obj.key === '买新房 领红包 人人有份',
                    suggestCount = row[2],
                    suggestWord = obj.key,
                    suggestDistrict = obj.district;

                if (isRedBag) {
                    suggestWord = '<font color="red">' + suggestWord + '</font>';
                }

                if (+suggestCount) {
                    if (isRedBag) {
                        suggestCount = '<p>支持' + suggestCount + '个楼盘</p>';
                    } else {
                        suggestCount = '<p>约' + suggestCount + '条</p>';
                    }
                } else {
                    suggestCount = '';
                }

                if (adUrl) {
                    suggestCount = that.advertImage;
                }

                if (suggestDistrict) {
                    suggestDistrict = '[' + suggestDistrict + ']';
                }

                tpl = tpl.replace('{{search_key}}', obj.key);
                tpl = tpl.replace('{{search_object}}', searchObject);
                tpl = tpl.replace('{{suggest_word}}', suggestWord);
                tpl = tpl.replace('{{suggest_district}}', suggestDistrict);
                tpl = tpl.replace('{{suggest_count}}', suggestCount);

                if (adUrl) {
                    advertHtml += tpl;
                } else {
                    suggestHtml += tpl;
                }
            }
        }
        if (advertHtml) {
            that.advertHtml = advertHtml;
        }
        that.suggestHtml = suggestHtml;
    };

    /**
     * 进行跳转操作
     * 1、是否已经获取过该 key 的 url，直接用 url 跳转
     * 2、是否为广告，广告不记录历史（2016.07.13 改为记录历史）
     */
    // window.clickMainxinfang(e, houseUrl);
    XFSearch.prototype.searchByKey = function (pKey, data) {
        var that = this,
            key = pKey;
        var bu = that.backup[key],
            json = null;

        if (bu) {
            json = JSON.parse(bu);
        } else if (data) {
            json = data;
        }

        // tj 没有 defaultHref / 分割
        var url = json ? json.hrefUrl : '';
        if (url) {
            url = url.replace(/\&amp;/g, '&');
        } else if (key && key !== that.defaultText) {
            url = that.defaultHref + '/a9' + that.encode(key) + '/';
        } else {
            url = that.defaultHref + '/';
        }

        vars.aHref.href = url;
        vars.aHref.click();

        if (!json) {
            json = that.formatSearch({
                key: key,
                hrefUrl: url
            });
        }

        // 20160803 广告不记录历史记录，为了排重
        if (+json.store) {
            that.setHistory(key, json);
        }
        // 搜索列表 u 参数，后面为真正的跳转地址
        // url = that.replaceUrlArg(url);
    };

    module.exports = new XFSearch();
});
