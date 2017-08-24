define("dsy/search/1.2.2/interface",["jquery","dsy/util/1.1.2/historyUtil"],function(t,e,r){"use strict";function o(){this.tag="interface",this.historyKeySuffix="His",this.hisTpl=["<tr data-key=\"{{history_key}}\" data-history='{{history_object}}'>",'<th><p>{{history_key}}&nbsp;<span class="gray9">{{history_type}}</span>&nbsp;<span class="gray9">{{history_ext}}</span></p></th>','<td class="remove_history"> X </td>',"</tr>"].join(""),this.advertImage='<img src="http://imgd3.soufunimg.com/2016/07/19/25k/5c7d1e9a085b40e783e5818af3af8b20.png" style="width:28px;height:15px;float:right;">',this.typeNick={xf:"\u65b0\u623f",esf:"\u4e8c\u624b\u623f",zf:"\u79df\u623f"},this.advertHtml="",this.suggestHtml="",this.backup={}}var s=t("jquery"),i=t("dsy/util/1.1.2/historyUtil"),n=seajs.data.vars;o.prototype.formatSearch=function(){console.log("you do not implement the method - formatSearch! "+this.tag)},o.prototype.setAdvert=function(t){var e=this,r=t.split(","),o=n.searchInput,s=n.searchInputAdvertImage,i=r.length;if(i){var a=r[parseInt(Math.random()*(i-1))].split("^"),y=a[0],p=a[1],h=e.formatSearch({key:y,hrefUrl:p,adUrl:e.replaceUrlArg(p),store:"0"});e.urlBackup(y,JSON.stringify(h)),o.val(y),s.show()}},o.prototype.getSessionAdvert=function(){return i.getSession(this.sessionKey)},o.prototype.setSessionAdvert=function(t){i.setSession(this.sessionKey,t)},o.prototype.setInputValue=function(){var t=this,e=n.searchInput.css("color","#888"),r=t.getLastHistory();r?e.val(r.key):e.val(t.defaultText)},o.prototype.getSuggestHtml=function(){console.log("you do not implement the method - getSuggestHtml! "+this.tag)},o.prototype.getHistoryKey=function(t){return n.cityCode+t+"His"},o.prototype.getSessionKey=function(t){return n.cityCode+t+"Session"},o.prototype.searchByKey=function(){console.log("you do not implement the method - searchByKey! "+this.tag)},o.prototype.urlBackup=function(t,e){var r=this;e&&!r.backup[t]&&(r.backup[t]=e)},o.prototype.setHistory=function(t,e){var r=this;t&&t!==r.defaultText&&i.setHistory(r.historyKey,e)},o.prototype.removeHistoryItem=function(t){var e=this,r=n.searchInput,o=i.removeHistoryItem(e.historyKey,t);return o?r.css("color","#888").val(e.defaultText):e.setInputValue(),o},o.prototype.getLastHistory=function(){return i.getLastHistory(this.historyKey)},o.prototype.inputIsHistory=function(t){return!!i.queryHistory(this.historyKey,t)},o.prototype.clearHistory=function(){i.clearHistory(this.historyKey)},o.prototype.getHistoryHtml=function(t){var e=this,r=i.getHistory(e.historyKey),o="",s=r.length;if(t&&t<s&&(s=t),r&&r.length){for(var n=0;n<s;n++){var a=r[n],y=e.hisTpl;y=y.replace(/{{history_key}}/g,a.key),y=y.replace(/{{history_type}}/,e.typeNick[a.type]||""),y=y.replace(/{{history_ext}}/,a.ext||"");var p=JSON.stringify(a);y=y.replace(/{{history_object}}/,p),o+=y}t||(o+='<tr><td class="clear_history" colspan="2" style="text-align:center">\u6e05\u9664\u5386\u53f2\u8bb0\u5f55</td></tr>')}return o},o.prototype.replaceUrlArg=function(t){var e=s.trim(t);return e.match("u=http:([^&]*)")&&(e="http:"+e.match("u=http:([^&]*)")[1].trim()),e},o.prototype.encode=function(t){return n.encode(t)},o.prototype.inputIsAdvert=function(t){var e=this.backup[t];if(e){if(JSON.parse(e).adUrl)return!0}return!1},o.prototype.openUrl=function(t,e){n.aHref.href=e,n.aHref.click();var r=n.searchInput;t||r.val(this.defaultText),r.css("color","#888")},r.exports=o});