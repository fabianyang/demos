/*
 * @file: 特价房搜索页面
 * @author: yangfan
 * @Create Time: 2016-07-01 09:50:39
 */
define('dsy/search/1.2.1.1/tejiaSearch', [
    'dsy/search/1.2.1.1/interfaceSearch'
], function (require, exports, module) {
    'use strict';

    var vars = seajs.data.vars;
    var Search = require('dsy/search/1.2.1.1/interfaceSearch');

    function TeJiaSearch() {
        Search.call(this);
        this.tag = 'tejia';
        this.suffix = '特价房';
        this.init();
    }

    TeJiaSearch.prototype = Object.create(Search.prototype);
    TeJiaSearch.prototype.constructor = TeJiaSearch;

    TeJiaSearch.prototype.init = function () {
        this.tpl = [
            '<tr data-key="{{search_key}}" data-search=\'{{search_object}}\'>',
            '<th><p>{{suggest_word}}<span class="gray9">-{{suggest_type}}</span></p></th>',
            '<td><p>{{suggest_count}}</p></td>',
            '</tr>'
        ].join('');
        this.defaultText = vars.searchDefaultText.tejia;

        this.defaultHref = {
            xf: vars.searchDefaultHref.tejia + '/',
            // xf: 'http://newhouse1.test.fang.com/house/tejia/',
            // esf: vars.searchDefaultHref.esf + '/tejia/',
            esf: 'http://esf{{cityCode}}.test.fang.com/tejia/',
            zf: vars.searchDefaultHref.zf + '/tejia/'
            // zf: 'http://zu.test.fang.com/tejia/'
        }

        this.backHref = {
            xf: vars.searchDefaultHref.xf + '/',
            esf: vars.searchDefaultHref.esf + '/',
            zf: vars.searchDefaultHref.zf + '/'
        }

        this.historyKey = this.getHistoryKey(this.tag);
    };

    TeJiaSearch.prototype.formatSearch = function (opts) {
        var that = this;
        return {
            // 搜索词
            key: opts.key || '',
            type: opts.type || '',
            tejia: opts.tejia ? 1 : 0,
            ext: opts.ext || '',
            stateString: opts.state ? '在售' : '待售',
            // 搜索跳转 url
            hrefUrl: opts.hrefUrl || '',
            store: '1',
            tag: that.tag,
            suffix: that.suffix
        };
    };

    TeJiaSearch.prototype.replaceTpl = function (obj) {

        // 不是特价房，不是新房，没有数量，不展示。特价房没有 0 条的情况。
        if (!obj.tejia && obj.type !== 'xf' && !obj.count) {
            return '';
        }

        var tpl = this.tpl,
            typeString = this.typeString[obj.type];

        tpl = tpl.replace('{{search_key}}', obj.key);
        tpl = tpl.replace('{{search_object}}', JSON.stringify(obj));
        tpl = tpl.replace('{{suggest_word}}', obj.key);

        if (obj.ext) {
            typeString = typeString + '-' + obj.ext;
        }

        tpl = tpl.replace('{{suggest_type}}', typeString);

        var countString = '全部约' + obj.count + '条';
        if (obj.tejia) {
            countString = '<span style="color:#c00">特价房</span>' + obj.count + '条';
        } else if (obj.type === 'xf') {
            countString = obj.stateString;
        }

        tpl = tpl.replace('{{suggest_count}}', countString);
        return tpl;
    };

    TeJiaSearch.prototype.getSuggestHtml = function (data) {
        var that = this;
        // var json = JSON.parse(data);
        var rows = data.result,
            html = '';

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var obj = that.formatSearch({
                key: row.name,
                type: row.type,
                tejia: +row.tejia,
                ext: row.ext,
                hrefUrl: row.href,
                state: row.state
            });

            var searchObject = JSON.stringify(obj);
            if (obj.hrefUrl) {
                that.urlBackup(obj.key, searchObject);
            }

            obj.count = +row.count || 0;
            html += that.replaceTpl(obj);
        }
        that.suggestHtml = html;
    };

    // window.clickZhaozufang(e);
    TeJiaSearch.prototype.searchByKey = function (pKey, data) {
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
        var url = json ? json.hrefUrl : '',
            type = json ? json.type : 'xf',
            tejia = json ? json.tejia : 1;

        var tejiaCityCode = vars.tejiaCityCode[type][vars.cityCode];

        if (url) {
            url = url.replace(/\&amp;/g, '&');
        } else if (key && key !== that.defaultText) {
            // 是存在特价房城市
            if (tejia && tejiaCityCode) {
                url = that.defaultHref[type];
                switch(type) {
                    case 'xf':
                        url = url + 'a9' + that.encode(key) + '/';
                        break;
                    case 'esf':
                        url = url.replace(/{{cityCode}}/, tejiaCityCode) + 'kw' + that.encode(key) + '/';
                        // url = url + 'kw' + that.encode(key) + '/';
                        break;
                    case 'zf':
                        url = url + 'a27-kw' + that.encode(key) + '/';
                        break;
                }
            } else {
                vars.tejiaCommonSearch[type].searchByKey(pKey, {store: 0});
            }
        } else {
            if (tejiaCityCode) {
                url = that.defaultHref[type];
            } else {
                vars.tejiaCommonSearch[type].searchByKey(pKey, {store: 0});
            }
        }

        if (url) {
            vars.aHref.href = url;
            vars.aHref.click();
        }

        // 没有 json 的情况：直接点击搜索按钮，或回车跳转的。
        if (!json) {
            json = that.formatSearch({
                key: key,
                hrefUrl: url,
                type: type
            });
        }

        that.setHistory(key, json);
    };

    module.exports = new TeJiaSearch();
});
