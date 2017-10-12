define("dsy/search/1.2.3/fangjia",["jquery","dsy/search/1.2.3/interface"],function(require,exports,module){"use strict";function FangJiaSearch(){Search.call(this),this.tag="fangjia",this.suffix="\u623f\u4ef7",this.init()}var $=require("jquery"),vars=seajs.data.vars,Search=require("dsy/search/1.2.3/interface");$.extend(FangJiaSearch.prototype,new Search),FangJiaSearch.prototype.init=function(){this.tpl=["<tr data-key=\"{{search_key}}\" data-search='{{search_object}}'>",'<th><p>{{suggest_word}}&nbsp;<span class="gray9">{{suggest_district}}</span></p></th>',"<td><p>{{suggest_count}}</p></td>","</tr>"].join(""),this.defaultText=vars.searchDefaultText.fangjia,this.historyKey=this.getHistoryKey(this.tag)},FangJiaSearch.prototype.formatSearch=function(opts){var that=this;return{key:opts.key||"",hrefUrl:opts.hrefUrl||"",district:opts.district||"",comerce:opts.comerce||"",tag:that.tag,suffix:that.suffix}},FangJiaSearch.prototype.getSuggestHtml=function(data){var that=this,rows=data.split(","),html="",length=rows.length;if(that.hrefCode="",that.hrefKey="",length){for(var row=[],i=0;i<length;i++){row=rows[i].split("^");var obj=that.formatSearch({key:row[0],district:row[1],comerce:row[2]}),tpl=that.tpl;tpl=tpl.replace("{{search_key}}",obj.key),tpl=tpl.replace("{{search_object}}",JSON.stringify(obj)),tpl=tpl.replace("{{suggest_word}}",obj.key),tpl=tpl.replace("{{suggest_district}}",obj.district+" "+obj.comerce);var suggestCount=row[3];suggestCount=+suggestCount>0?"\u7ea6"+suggestCount+"\u6761\u623f\u6e90\u6837\u672c":"",tpl=tpl.replace("{{suggest_count}}",suggestCount),html+=tpl}1===length&&(that.hrefCode=row[4],that.hrefKey=row[0])}that.suggestHtml=html},FangJiaSearch.prototype.searchByKey=function(key,data){var that=this,url="http://fangjia.fang.com/pinggu/ajax/searchtransfer.aspx",cityName=vars.cityName;cityName&&"\u5168\u56fd"!==cityName||(cityName="\u5317\u4eac");var cityCode=vars.cityCode;cityCode&&"quanguo"!==cityCode||(cityCode="bj"),data&&data.hrefUrl?url=data.hrefUrl:key&&key!==that.defaultText?(url=url+"?strcity="+escape(cityName)+"&projname="+escape(key),that.hrefCode&&that.hrefKey&&that.hrefKey===key&&(url="http://fangjia.fang.com/process/"+cityCode+"/"+that.hrefCode+".htm")):url=url+"?strcity="+escape(cityName),this.openUrl(key,url);var so=data;that.hrefCode?so=that.formatSearch({key:key,hrefUrl:url}):data||(so=that.formatSearch({key:key})),that.setHistory(key,so)},module.exports=new FangJiaSearch});