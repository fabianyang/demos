(function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("XPlayer",[],t):"object"==typeof exports?exports.XPlayer=t():e.XPlayer=t()})(this,function(){return function(e){function t(n){if(i[n])return i[n].exports;var a=i[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,t),a.l=!0,a.exports}var i={};return t.m=e,t.c=i,t.d=function(e,i,n){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=2)}([function(e,t,i){"use strict";var n={play:["0 0 16 32","M15.552 15.168q0.448 0.32 0.448 0.832 0 0.448-0.448 0.768l-13.696 8.512q-0.768 0.512-1.312 0.192t-0.544-1.28v-16.448q0-0.96 0.544-1.28t1.312 0.192z"],pause:["0 0 17 32","M14.080 4.8q2.88 0 2.88 2.048v18.24q0 2.112-2.88 2.112t-2.88-2.112v-18.24q0-2.048 2.88-2.048zM2.88 4.8q2.88 0 2.88 2.048v18.24q0 2.112-2.88 2.112t-2.88-2.112v-18.24q0-2.048 2.88-2.048z"],"volume-up":["0 0 21 32","M13.728 6.272v19.456q0 0.448-0.352 0.8t-0.8 0.32-0.8-0.32l-5.952-5.952h-4.672q-0.48 0-0.8-0.352t-0.352-0.8v-6.848q0-0.48 0.352-0.8t0.8-0.352h4.672l5.952-5.952q0.32-0.32 0.8-0.32t0.8 0.32 0.352 0.8zM20.576 16q0 1.344-0.768 2.528t-2.016 1.664q-0.16 0.096-0.448 0.096-0.448 0-0.8-0.32t-0.32-0.832q0-0.384 0.192-0.64t0.544-0.448 0.608-0.384 0.512-0.64 0.192-1.024-0.192-1.024-0.512-0.64-0.608-0.384-0.544-0.448-0.192-0.64q0-0.48 0.32-0.832t0.8-0.32q0.288 0 0.448 0.096 1.248 0.48 2.016 1.664t0.768 2.528zM25.152 16q0 2.72-1.536 5.056t-4 3.36q-0.256 0.096-0.448 0.096-0.48 0-0.832-0.352t-0.32-0.8q0-0.704 0.672-1.056 1.024-0.512 1.376-0.8 1.312-0.96 2.048-2.4t0.736-3.104-0.736-3.104-2.048-2.4q-0.352-0.288-1.376-0.8-0.672-0.352-0.672-1.056 0-0.448 0.32-0.8t0.8-0.352q0.224 0 0.48 0.096 2.496 1.056 4 3.36t1.536 5.056zM29.728 16q0 4.096-2.272 7.552t-6.048 5.056q-0.224 0.096-0.448 0.096-0.48 0-0.832-0.352t-0.32-0.8q0-0.64 0.704-1.056 0.128-0.064 0.384-0.192t0.416-0.192q0.8-0.448 1.44-0.896 2.208-1.632 3.456-4.064t1.216-5.152-1.216-5.152-3.456-4.064q-0.64-0.448-1.44-0.896-0.128-0.096-0.416-0.192t-0.384-0.192q-0.704-0.416-0.704-1.056 0-0.448 0.32-0.8t0.832-0.352q0.224 0 0.448 0.096 3.776 1.632 6.048 5.056t2.272 7.552z"],"volume-down":["0 0 21 32","M13.728 6.272v19.456q0 0.448-0.352 0.8t-0.8 0.32-0.8-0.32l-5.952-5.952h-4.672q-0.48 0-0.8-0.352t-0.352-0.8v-6.848q0-0.48 0.352-0.8t0.8-0.352h4.672l5.952-5.952q0.32-0.32 0.8-0.32t0.8 0.32 0.352 0.8zM20.576 16q0 1.344-0.768 2.528t-2.016 1.664q-0.16 0.096-0.448 0.096-0.448 0-0.8-0.32t-0.32-0.832q0-0.384 0.192-0.64t0.544-0.448 0.608-0.384 0.512-0.64 0.192-1.024-0.192-1.024-0.512-0.64-0.608-0.384-0.544-0.448-0.192-0.64q0-0.48 0.32-0.832t0.8-0.32q0.288 0 0.448 0.096 1.248 0.48 2.016 1.664t0.768 2.528z"],"volume-off":["0 0 21 32","M13.728 6.272v19.456q0 0.448-0.352 0.8t-0.8 0.32-0.8-0.32l-5.952-5.952h-4.672q-0.48 0-0.8-0.352t-0.352-0.8v-6.848q0-0.48 0.352-0.8t0.8-0.352h4.672l5.952-5.952q0.32-0.32 0.8-0.32t0.8 0.32 0.352 0.8z"],loop:["0 0 32 32","M1.882 16.941c0 4.152 3.221 7.529 7.177 7.529v1.882c-4.996 0-9.060-4.222-9.060-9.412s4.064-9.412 9.060-9.412h7.96l-3.098-3.098 1.331-1.331 5.372 5.37-5.37 5.372-1.333-1.333 3.1-3.098h-7.962c-3.957 0-7.177 3.377-7.177 7.529zM22.94 7.529v1.882c3.957 0 7.177 3.377 7.177 7.529s-3.221 7.529-7.177 7.529h-7.962l3.098-3.098-1.331-1.331-5.37 5.37 5.372 5.372 1.331-1.331-3.1-3.1h7.96c4.998 0 9.062-4.222 9.062-9.412s-4.064-9.412-9.060-9.412z"],full:["0 0 32 33","M6.667 28h-5.333c-0.8 0-1.333-0.533-1.333-1.333v-5.333c0-0.8 0.533-1.333 1.333-1.333s1.333 0.533 1.333 1.333v4h4c0.8 0 1.333 0.533 1.333 1.333s-0.533 1.333-1.333 1.333zM30.667 28h-5.333c-0.8 0-1.333-0.533-1.333-1.333s0.533-1.333 1.333-1.333h4v-4c0-0.8 0.533-1.333 1.333-1.333s1.333 0.533 1.333 1.333v5.333c0 0.8-0.533 1.333-1.333 1.333zM30.667 12c-0.8 0-1.333-0.533-1.333-1.333v-4h-4c-0.8 0-1.333-0.533-1.333-1.333s0.533-1.333 1.333-1.333h5.333c0.8 0 1.333 0.533 1.333 1.333v5.333c0 0.8-0.533 1.333-1.333 1.333zM1.333 12c-0.8 0-1.333-0.533-1.333-1.333v-5.333c0-0.8 0.533-1.333 1.333-1.333h5.333c0.8 0 1.333 0.533 1.333 1.333s-0.533 1.333-1.333 1.333h-4v4c0 0.8-0.533 1.333-1.333 1.333z"],"full-in":["0 0 32 33","M24.965 24.38h-18.132c-1.366 0-2.478-1.113-2.478-2.478v-11.806c0-1.364 1.111-2.478 2.478-2.478h18.132c1.366 0 2.478 1.113 2.478 2.478v11.806c0 1.364-1.11 2.478-2.478 2.478zM6.833 10.097v11.806h18.134l-0.002-11.806h-18.132zM2.478 28.928h5.952c0.684 0 1.238-0.554 1.238-1.239 0-0.684-0.554-1.238-1.238-1.238h-5.952v-5.802c0-0.684-0.554-1.239-1.238-1.239s-1.239 0.556-1.239 1.239v5.802c0 1.365 1.111 2.478 2.478 2.478zM30.761 19.412c-0.684 0-1.238 0.554-1.238 1.238v5.801h-5.951c-0.686 0-1.239 0.554-1.239 1.238 0 0.686 0.554 1.239 1.239 1.239h5.951c1.366 0 2.478-1.111 2.478-2.478v-5.801c0-0.683-0.554-1.238-1.239-1.238zM0 5.55v5.802c0 0.683 0.554 1.238 1.238 1.238s1.238-0.555 1.238-1.238v-5.802h5.952c0.684 0 1.238-0.554 1.238-1.238s-0.554-1.238-1.238-1.238h-5.951c-1.366-0.001-2.478 1.111-2.478 2.476zM32 11.35v-5.801c0-1.365-1.11-2.478-2.478-2.478h-5.951c-0.686 0-1.239 0.554-1.239 1.238s0.554 1.238 1.239 1.238h5.951v5.801c0 0.683 0.554 1.237 1.238 1.237 0.686 0.002 1.239-0.553 1.239-1.236z"],setting:["0 0 32 28","M28.633 17.104c0.035 0.21 0.026 0.463-0.026 0.76s-0.14 0.598-0.262 0.904c-0.122 0.306-0.271 0.581-0.445 0.825s-0.367 0.419-0.576 0.524c-0.209 0.105-0.393 0.157-0.55 0.157s-0.332-0.035-0.524-0.105c-0.175-0.052-0.393-0.1-0.655-0.144s-0.528-0.052-0.799-0.026c-0.271 0.026-0.541 0.083-0.812 0.17s-0.502 0.236-0.694 0.445c-0.419 0.437-0.664 0.934-0.734 1.493s0.009 1.092 0.236 1.598c0.175 0.349 0.148 0.699-0.079 1.048-0.105 0.14-0.271 0.284-0.498 0.432s-0.476 0.284-0.747 0.406-0.555 0.218-0.851 0.288c-0.297 0.070-0.559 0.105-0.786 0.105-0.157 0-0.306-0.061-0.445-0.183s-0.236-0.253-0.288-0.393h-0.026c-0.192-0.541-0.52-1.009-0.982-1.402s-1-0.589-1.611-0.589c-0.594 0-1.131 0.197-1.611 0.589s-0.816 0.851-1.009 1.375c-0.087 0.21-0.218 0.362-0.393 0.458s-0.367 0.144-0.576 0.144c-0.244 0-0.52-0.044-0.825-0.131s-0.611-0.197-0.917-0.327c-0.306-0.131-0.581-0.284-0.825-0.458s-0.428-0.349-0.55-0.524c-0.087-0.122-0.135-0.266-0.144-0.432s0.057-0.397 0.197-0.694c0.192-0.402 0.266-0.86 0.223-1.375s-0.266-0.991-0.668-1.428c-0.244-0.262-0.541-0.432-0.891-0.511s-0.681-0.109-0.995-0.092c-0.367 0.017-0.742 0.087-1.127 0.21-0.244 0.070-0.489 0.052-0.734-0.052-0.192-0.070-0.371-0.231-0.537-0.485s-0.314-0.533-0.445-0.838c-0.131-0.306-0.231-0.62-0.301-0.943s-0.087-0.59-0.052-0.799c0.052-0.384 0.227-0.629 0.524-0.734 0.524-0.21 0.995-0.555 1.415-1.035s0.629-1.017 0.629-1.611c0-0.611-0.21-1.144-0.629-1.598s-0.891-0.786-1.415-0.996c-0.157-0.052-0.288-0.179-0.393-0.38s-0.157-0.406-0.157-0.616c0-0.227 0.035-0.48 0.105-0.76s0.162-0.55 0.275-0.812 0.244-0.502 0.393-0.72c0.148-0.218 0.31-0.38 0.485-0.485 0.14-0.087 0.275-0.122 0.406-0.105s0.275 0.052 0.432 0.105c0.524 0.21 1.070 0.275 1.637 0.197s1.070-0.327 1.506-0.747c0.21-0.209 0.362-0.467 0.458-0.773s0.157-0.607 0.183-0.904c0.026-0.297 0.026-0.568 0-0.812s-0.048-0.419-0.065-0.524c-0.035-0.105-0.066-0.227-0.092-0.367s-0.013-0.262 0.039-0.367c0.105-0.244 0.293-0.458 0.563-0.642s0.563-0.336 0.878-0.458c0.314-0.122 0.62-0.214 0.917-0.275s0.533-0.092 0.707-0.092c0.227 0 0.406 0.074 0.537 0.223s0.223 0.301 0.275 0.458c0.192 0.471 0.507 0.886 0.943 1.244s0.952 0.537 1.546 0.537c0.611 0 1.153-0.17 1.624-0.511s0.803-0.773 0.996-1.297c0.070-0.14 0.179-0.284 0.327-0.432s0.301-0.223 0.458-0.223c0.244 0 0.511 0.035 0.799 0.105s0.572 0.166 0.851 0.288c0.279 0.122 0.537 0.279 0.773 0.472s0.423 0.402 0.563 0.629c0.087 0.14 0.113 0.293 0.079 0.458s-0.070 0.284-0.105 0.354c-0.227 0.506-0.297 1.039-0.21 1.598s0.341 1.048 0.76 1.467c0.419 0.419 0.934 0.651 1.546 0.694s1.179-0.057 1.703-0.301c0.14-0.087 0.31-0.122 0.511-0.105s0.371 0.096 0.511 0.236c0.262 0.244 0.493 0.616 0.694 1.113s0.336 1 0.406 1.506c0.035 0.297-0.013 0.528-0.144 0.694s-0.266 0.275-0.406 0.327c-0.542 0.192-1.004 0.528-1.388 1.009s-0.576 1.026-0.576 1.637c0 0.594 0.162 1.113 0.485 1.559s0.747 0.764 1.27 0.956c0.122 0.070 0.227 0.14 0.314 0.21 0.192 0.157 0.323 0.358 0.393 0.602v0zM16.451 19.462c0.786 0 1.528-0.149 2.227-0.445s1.305-0.707 1.821-1.231c0.515-0.524 0.921-1.131 1.218-1.821s0.445-1.428 0.445-2.214c0-0.786-0.148-1.524-0.445-2.214s-0.703-1.292-1.218-1.808c-0.515-0.515-1.122-0.921-1.821-1.218s-1.441-0.445-2.227-0.445c-0.786 0-1.524 0.148-2.214 0.445s-1.292 0.703-1.808 1.218c-0.515 0.515-0.921 1.118-1.218 1.808s-0.445 1.428-0.445 2.214c0 0.786 0.149 1.524 0.445 2.214s0.703 1.297 1.218 1.821c0.515 0.524 1.118 0.934 1.808 1.231s1.428 0.445 2.214 0.445v0z"],right:["0 0 32 32","M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z"],camera:["0 0 32 32","M16 23c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM16 13c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM27 28h-22c-1.654 0-3-1.346-3-3v-16c0-1.654 1.346-3 3-3h3c0.552 0 1 0.448 1 1s-0.448 1-1 1h-3c-0.551 0-1 0.449-1 1v16c0 0.552 0.449 1 1 1h22c0.552 0 1-0.448 1-1v-16c0-0.551-0.448-1-1-1h-11c-0.552 0-1-0.448-1-1s0.448-1 1-1h11c1.654 0 3 1.346 3 3v16c0 1.654-1.346 3-3 3zM24 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5zM15 4c0 0.552-0.448 1-1 1h-4c-0.552 0-1-0.448-1-1v0c0-0.552 0.448-1 1-1h4c0.552 0 1 0.448 1 1v0z"]};e.exports=function(e){return'<svg xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" version="1.1" viewBox="'+n[e][0]+'" width="100%"><use xlink:href="#xplayer-'+e+'"></use><path class="xplayer-fill" d="'+n[e][1]+'" id="xplayer-'+e+'"></path></svg>\n'}},function(e,t,i){"use strict";e.exports={hasClass:function(e,t){if(!e)return console.log("\u4f60\u786e\u5b9a\u6709\u8fd9\u4e2aid\uff1f");var i=e.className,n=i.split(/\s+/);for(var a in n)if(n[a]===t)return!0;return!1},addClass:function(e,t){if(!e)return console.log("\u4f60\u786e\u5b9a\u6709\u8fd9\u4e2aid\uff1f");var i=e.className,n=""!==i?" ":"",a=i+n+t;e.className=a},removeClass:function(e,t){if(!e)return console.log("\u4f60\u786e\u5b9a\u6709\u8fd9\u4e2aid\uff1f");if(e.length>0){Array.prototype.slice.call(e).forEach(function(e,i){var n=" "+e.className+" ";n=n.replace(/(\s+)/gi," ");var a=n.replace(" "+t+" "," ");a=a.replace(/(^\s+)|(\s+$)/g,""),e.className=a})}else{var i=" "+e.className+" ";i=i.replace(/(\s+)/gi," ");var n=i.replace(" "+t+" "," ");n=n.replace(/(^\s+)|(\s+$)/g,""),e.className=n}}}},function(e,t,i){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}();i(3);var s=i(4),l=i(0),r=i(5),o=i(6),c=i(7),d=i(8),u=i(1),v=/mobile/i.test(window.navigator.userAgent),p=function(){function e(t){var i=this;n(this,e),this.option=r(t),u.addClass(this.option.element,"xplayer"),this.option.video.quality&&(this.qualityIndex=this.option.video.defaultQuality,this.quality=this.option.video.quality[this.option.video.defaultQuality]),this.tran=new o(this.option.lang).tran,this.updateBar=function(e,t,i){t=t>0?t:0,t=t<1?t:1,f[e+"Bar"].style[i]=100*t+"%"};var a=["play","pause","canplay","playing","ended","error"];this.event={};for(var p=0;p<a.length;p++)this.event[a[p]]=[];this.trigger=function(e){for(var t=0;t<i.event[e].length;t++)i.event[e][t]()},this.element=this.option.element,this.element.addEventListener("click",function(e){return e&&e.stopPropagation?e.stopPropagation():window.event.cancelBubble=!0,e&&e.preventDefault?e.preventDefault():window.event.returnValue=!1,!1}),v&&u.addClass(this.element,"xplayer-mobile"),this.element.innerHTML=c.main(t),this.video=new d(this.element.getElementsByClassName("xplayer-video-current")),this.initVideo(),this.bezel=this.element.getElementsByClassName("xplayer-bezel-icon")[0],this.bezel.addEventListener("animationend",function(){u.removeClass(i.bezel,"xplayer-bezel-transition")}),this.playButton=this.element.getElementsByClassName("xplayer-play-icon")[0],this.paused=!0,this.playButton.addEventListener("click",function(){i.toggle()});var m=this.element.getElementsByClassName("xplayer-video-wrap")[0],h=this.element.getElementsByClassName("xplayer-controller-mask")[0];if(v){var y=function(){u.hasClass(i.element,"xplayer-hide-controller")?u.removeClass(i.element,"xplayer-hide-controller"):u.addClass(i.element,"xplayer-hide-controller")};m.addEventListener("click",y),h.addEventListener("click",y)}else m.addEventListener("click",function(){i.toggle()}),h.addEventListener("click",function(){i.toggle()});var f={};f.playedBar=this.element.getElementsByClassName("xplayer-played")[0],f.loadedBar=this.element.getElementsByClassName("xplayer-loaded")[0];var g=this.element.getElementsByClassName("xplayer-bar-wrap")[0],x=this.element.getElementsByClassName("xplayer-bar-time")[0],w=void 0,b=0,k=0,E=!1;this.playedTime=!1,window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,1e3/60)}}();var C=function(){i.checkLoading=setInterval(function(){k=i.video.currentTime(),!E&&k<b+.01&&!i.video.attr("paused")&&(u.addClass(i.element,"xplayer-loading"),E=!0),E&&k>b+.01&&!i.video.attr("paused")&&(u.removeClass(i.element,"xplayer-loading"),E=!1),b=k},100)},q=function(){clearInterval(i.checkLoading)};this.animationFrame=function(){i.playedTime&&(i.updateBar("played",i.video.currentTime()/i.video.duration,"width"),i.element.getElementsByClassName("xplayer-ptime")[0].innerHTML=s.secondToTime(i.video.currentTime()),i.trigger("playing")),window.requestAnimationFrame(i.animationFrame)},window.requestAnimationFrame(this.animationFrame),this.setTime=function(){i.playedTime=!0,C()},this.clearTime=function(){i.playedTime=!1,q()},g.addEventListener("click",function(e){var t=e||window.event;w=g.clientWidth;var n=(t.clientX-s.getElementViewLeft(g))/w;n=n>0?n:0,n=n<1?n:1,i.updateBar("played",n,"width"),i.video.seek(parseFloat(f.playedBar.style.width)/100*i.video.duration)}),this.isTipsShow=!1,this.timeTipsHandler=this.timeTipsHandler(g,x).bind(this),g.addEventListener("mousemove",this.timeTipsHandler),g.addEventListener("mouseover",this.timeTipsHandler),g.addEventListener("mouseenter",this.timeTipsHandler),g.addEventListener("mouseout",this.timeTipsHandler),g.addEventListener("mouseleave",this.timeTipsHandler);var T=function(e){var t=e||window.event,n=(t.clientX-s.getElementViewLeft(g))/w;n=n>0?n:0,n=n<1?n:1,i.updateBar("played",n,"width"),i.element.getElementsByClassName("xplayer-ptime")[0].innerHTML=s.secondToTime(n*i.video.duration)},L=function e(){document.removeEventListener("mouseup",e),document.removeEventListener("mousemove",T),i.video.seek(parseFloat(f.playedBar.style.width)/100*i.video.duration),i.setTime()};g.addEventListener("mousedown",function(){w=g.clientWidth,i.clearTime(),document.addEventListener("mousemove",T),document.addEventListener("mouseup",L)}),f.volumeBar=this.element.getElementsByClassName("xplayer-volume-bar-inner")[0];var B=this.element.getElementsByClassName("xplayer-volume")[0],z=this.element.getElementsByClassName("xplayer-volume-bar-wrap")[0],M=this.element.getElementsByClassName("xplayer-volume-bar")[0],N=this.element.getElementsByClassName("xplayer-volume-icon")[0];this.switchVolumeIcon=function(){var e=i.element.getElementsByClassName("xplayer-volume-icon")[0];i.video.attr("volume")>=.8?e.innerHTML=l("volume-up"):i.video.attr("volume")>0?e.innerHTML=l("volume-down"):e.innerHTML=l("volume-off")};var F=function(e){var t=e||window.event,n=(t.clientX-s.getElementViewLeft(M)-5.5)/35;i.volume(n)},A=function e(){document.removeEventListener("mouseup",e),document.removeEventListener("mousemove",F),u.removeClass(B,"xplayer-volume-active")};z.addEventListener("click",function(e){F(e)}),z.addEventListener("mousedown",function(){document.addEventListener("mousemove",F),document.addEventListener("mouseup",A),u.addClass(B,"xplayer-volume-active")}),N.addEventListener("click",function(){i.video.attr("muted")?(i.video.attr("muted",!1),i.switchVolumeIcon(),i.updateBar("volume",i.video.attr("volume"),"width")):(i.video.attr("muted",!0),N.innerHTML=l("volume-off"),i.updateBar("volume",0,"width"))});var H=0;if(!v){var S=function(){u.removeClass(i.element,"xplayer-hide-controller"),clearTimeout(H),H=setTimeout(function(){i.video.attr("played").length&&(u.addClass(i.element,"xplayer-hide-controller"),I())},2e3)};this.element.addEventListener("mousemove",S),this.element.addEventListener("click",S)}var P=c.setting(this.tran),V=this.element.getElementsByClassName("xplayer-setting-icon")[0],R=this.element.getElementsByClassName("xplayer-setting-box")[0],D=this.element.getElementsByClassName("xplayer-mask")[0];R.innerHTML=P.original;var I=function(){u.hasClass(R,"xplayer-setting-box-open")&&(u.removeClass(R,"xplayer-setting-box-open"),u.removeClass(D,"xplayer-mask-show"),setTimeout(function(){u.removeClass(R,"xplayer-setting-box-narrow"),R.innerHTML=P.original,j()},300))},O=function(){u.addClass(R,"xplayer-setting-box-open"),u.addClass(D,"xplayer-mask-show")};D.addEventListener("click",function(){I()}),V.addEventListener("click",function(){O()}),this.loop=this.option.loop;var j=function(){var e=i.element.getElementsByClassName("xplayer-setting-loop")[0],t=e.getElementsByClassName("xplayer-toggle-setting-input")[0];t.checked=i.loop,e.addEventListener("click",function(){t.checked=!t.checked,t.checked?i.loop=!0:i.loop=!1}),i.element.getElementsByClassName("xplayer-setting-speed")[0].addEventListener("click",function(){u.addClass(R,"xplayer-setting-box-narrow"),R.innerHTML=P.speed;for(var e=R.getElementsByClassName("xplayer-setting-speed-item"),t=0;t<e.length;t++)(function(t){e[t].addEventListener("click",function(){i.video.attr("playbackRate",e[t].dataset.speed),I()})})(t)})};j(),1!==this.video.duration&&(this.element.getElementsByClassName("xplayer-dtime")[0].innerHTML=this.video.duration?s.secondToTime(this.video.duration):"00:00"),this.option.autoplay&&!v?this.play():v&&this.pause(),this.element.getElementsByClassName("xplayer-full-icon")[0].addEventListener("click",function(){document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement?document.cancelFullScreen?document.cancelFullScreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitCancelFullScreen&&document.webkitCancelFullScreen():i.element.requestFullscreen?i.element.requestFullscreen():i.element.mozRequestFullScreen?i.element.mozRequestFullScreen():i.element.webkitRequestFullscreen?i.element.webkitRequestFullscreen():i.video.attr("webkitEnterFullscreen")&&i.video.current.webkitEnterFullscreen()}),this.element.getElementsByClassName("xplayer-full-in-icon")[0].addEventListener("click",function(){u.hasClass(i.element,"xplayer-fulled")?u.removeClass(i.element,"xplayer-fulled"):u.addClass(i.element,"xplayer-fulled")});var X=function(e){var t=document.activeElement.tagName.toUpperCase(),n=document.activeElement.getAttribute("contenteditable");if("INPUT"!==t&&"TEXTAREA"!==t&&""!==n&&"true"!==n){var a=e||window.event,s=void 0;switch(a.keyCode){case 27:u.hasClass(i.element,"xplayer-fulled")&&u.removeClass(i.element,"xplayer-fulled");break;case 32:a.preventDefault(),i.toggle();break;case 37:a.preventDefault(),i.video.seek(i.video.currentTime()-5);break;case 39:a.preventDefault(),i.video.seek(i.video.currentTime()+5);break;case 38:a.preventDefault(),s=i.video.attr("volume")+.1,i.volume(s);break;case 40:a.preventDefault(),s=i.video.attr("volume")-.1,i.volume(s)}}};this.option.hotkey&&document.addEventListener("keydown",X);var Q=this.element.getElementsByClassName("xplayer-menu")[0];if(this.element.addEventListener("contextmenu",function(e){var t=e||window.event;t.preventDefault(),u.addClass(Q,"xplayer-menu-show");var n=i.element.getBoundingClientRect(),a=t.clientX-n.left,s=t.clientY-n.top;a+Q.offsetWidth>=n.width?(Q.style.right=n.width-a+"px",Q.style.left="initial"):(Q.style.left=t.clientX-i.element.getBoundingClientRect().left+"px",Q.style.right="initial"),s+Q.offsetHeight>=n.height?(Q.style.bottom=n.height-s+"px",Q.style.top="initial"):(Q.style.top=t.clientY-i.element.getBoundingClientRect().top+"px",Q.style.bottom="initial"),u.addClass(D,"xplayer-mask-show"),D.addEventListener("click",function(){u.removeClass(D,"xplayer-mask-show"),u.removeClass(Q,"xplayer-mask-show")})}),this.option.video.quality&&this.element.getElementsByClassName("xplayer-quality-list")[0].addEventListener("click",function(e){u.hasClass(e.target,"xplayer-quality-item")&&i.switchQuality(e.target.dataset.index)}),this.option.screenshot){var _=this.element.getElementsByClassName("xplayer-camera-icon")[0];_.addEventListener("click",function(){var e=document.createElement("canvas");e.width=i.video.attr("videoWidth"),e.height=i.video.attr("videoHeight"),e.getContext("2d").drawImage(i.video.current,0,0,e.width,e.height),_.href=e.toDataURL(),_.download="XPlayer-snap-"+Date.now()+".png"})}}return a(e,[{key:"play",value:function(e){"[object Number]"===Object.prototype.toString.call(e)&&this.video.seek(e),this.paused=!1,this.video.attr("paused")&&(this.bezel.innerHTML=l("play"),u.addClass(this.bezel,"xplayer-bezel-transition")),this.playButton.innerHTML=l("pause"),this.video.play(),this.setTime(),u.addClass(this.element,"xplayer-playing"),this.trigger("play")}},{key:"pause",value:function(){this.paused=!0,u.removeClass(this.element,"xplayer-loading"),this.video.attr("paused")||(this.bezel.innerHTML=l("pause"),u.addClass(this.bezel,"xplayer-bezel-transition")),this.ended=!1,this.playButton.innerHTML=l("play"),this.video.pause(),this.clearTime(),u.removeClass(this.element,"xplayer-playing"),this.trigger("pause")}},{key:"volume",value:function(e){e=e>0?e:0,e=e<1?e:1,this.updateBar("volume",e,"width"),this.video.attr("volume",e),this.video.attr("muted")&&this.video.attr("muted",!1),this.switchVolumeIcon()}},{key:"toggle",value:function(){this.video.attr("paused")?this.play():this.pause()}},{key:"on",value:function(e,t){"function"==typeof t&&this.event[e].push(t)}},{key:"switchVideo",value:function(e){this.video.attr("poster",e.pic?e.pic:""),this.video.attr("src",e.url),this.pause(),this.updateBar("played",0,"width"),this.updateBar("loaded",0,"width"),this.element.getElementsByClassName("xplayer-ptime")[0].innerHTML="00:00"}},{key:"initVideo",value:function(){var e=this;this.video.on("all","durationchange",function(t,i){1!==i.duration&&(e.element.getElementsByClassName("xplayer-dtime")[0].innerHTML=s.secondToTime(e.video.duration))}),this.video.on("current","progress",function(t,i){var n=i.buffered.length?i.buffered.end(i.buffered.length-1)/i.duration:0;e.updateBar("loaded",n,"width")}),this.video.on("all","error",function(){e.notice(e.tran("This video fails to load"),-1),e.trigger("pause")}),this.video.on("current","canplay",function(){e.trigger("canplay")}),this.ended=!1,this.video.on("all","ended",function(t){t===e.video.videos.length-1&&(e.updateBar("played",1,"width"),e.loop?(e.video.switch(0),e.video.play()):(e.ended=!0,e.pause(),e.trigger("ended")),e.danIndex=0)}),this.video.on("current","play",function(){e.paused&&e.play()}),this.video.on("current","pause",function(){e.paused||e.pause()}),this.video.attr("volume",parseInt(this.element.getElementsByClassName("xplayer-volume-bar-inner")[0].style.width)/100)}},{key:"switchQuality",value:function(e){var t=this;if(this.qualityIndex!==e&&!this.switchingQuality){this.qualityIndex=e,this.switchingQuality=!0,this.quality=this.option.video.quality[e],this.element.getElementsByClassName("xplayer-quality-icon")[0].innerHTML=this.quality.name,this.video.pause();var i=c.video(!1,null,this.option.screenshot,"auto",this.quality.url),n=(new DOMParser).parseFromString(i,"text/html").body.firstChild,a=this.element.getElementsByClassName("xplayer-video-wrap")[0];a.insertBefore(n,a.getElementsByTagName("div")[0]),this.prevVideo=this.video,this.video=new d([n],this.prevVideo.duration),this.initVideo(),this.video.seek(this.prevVideo.currentTime()),this.notice(this.tran("Switching to")+" "+this.quality.name+" "+this.tran("quality"),-1),this.video.on("current","canplay",function(){if(t.prevVideo){if(t.video.currentTime()!==t.prevVideo.currentTime())return void t.video.seek(t.prevVideo.currentTime());a.removeChild(t.prevVideo.current),u.addClass(t.video.current,"xpalyer-video-current"),t.video.play(),t.prevVideo=null,t.notice(t.tran("Switched to")+" "+t.quality.name+" "+t.tran("quality")),t.switchingQuality=!1}})}}},{key:"timeTipsHandler",value:function(e,t){var i=this,n=function(e){var t=0,i=0;return e&&(t+=e.offsetTop||0,i+=e.offsetLeft||0,e=e.offsetParent),{top:t,left:i}};return function(a){if(i.video.duration){var l=a.clientX,r=n(e).left,o=l-r;switch(t.innerText=s.secondToTime(i.video.duration*(o/e.offsetWidth)),t.style.left=o-20+"px",a.type){case"mouseenter":case"mouseover":case"mousemove":if(i.isTipsShow)return;u.removeClass(t,"hidden"),i.isTipsShow=!0;break;case"mouseleave":case"mouseout":if(!i.isTipsShow)return;u.addClass(t,"hidden"),i.isTipsShow=!1}}}}},{key:"notice",value:function(e,t){var i=this.element.getElementsByClassName("xplayer-notice")[0];i.innerHTML=e,i.style.opacity=1,this.noticeTime&&clearTimeout(this.noticeTime),t&&t<0||(this.noticeTime=setTimeout(function(){i.style.opacity=0},t||2e3))}}]),e}();e.exports=p},function(e,t){},function(e,t,i){"use strict";e.exports={secondToTime:function(e){var t=function(e){return e<10?"0"+e:""+e},i=parseInt(e/60),n=parseInt(e-60*i);return t(i)+":"+t(n)},getElementViewLeft:function(e){var t=e.offsetLeft,i=e.offsetParent,n=document.body.scrollLeft+document.documentElement.scrollLeft;if(document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement)for(;null!==i&&i!==e;)t+=i.offsetLeft,i=i.offsetParent;else for(;null!==i;)t+=i.offsetLeft,i=i.offsetParent;return t-n}}},function(e,t,i){"use strict";e.exports=function(e){/mobile/i.test(window.navigator.userAgent)&&(e.autoplay=!1);var t=navigator.language||navigator.browserLanguage,i={element:document.getElementsByClassName("xplayer")[0],autoplay:!1,theme:"#c00",loop:!1,logo:"http://static.soufunimg.com/common_m/m_public/201511/images/app_fang.png",lang:-1!==t.indexOf("zh")?"zh":"en",screenshot:!1,hotkey:!0,preload:"auto",contextmenu:[{text:"FangPlayer v0.1",link:"http://fang.com/"},{text:"By \u623f\u5929\u4e0b\u524d\u7aef\u7ec4",link:""}]};for(var n in i)i.hasOwnProperty(n)&&!e.hasOwnProperty(n)&&(e[n]=i[n]);return"[object Array]"!==Object.prototype.toString.call(e.video.url)&&(e.video.url=[e.video.url]),e.video&&!e.video.hasOwnProperty("type")&&(e.video.type="auto"),e.video.quality&&(e.video.url=[e.video.quality[e.video.defaultQuality].url]),e}},function(e,t,i){"use strict";var n={Top:"\u9876\u90e8",Bottom:"\u5e95\u90e8",Rolling:"\u6eda\u52a8","About author":"\u5173\u4e8e\u4f5c\u8005","DPlayer feedback":"\u64ad\u653e\u5668\u610f\u89c1\u53cd\u9988","About DPlayer":"\u5173\u4e8e DPlayer \u64ad\u653e\u5668",Loop:"\u5faa\u73af",Speed:"\u901f\u5ea6",Normal:"\u6b63\u5e38","This video fails to load":"\u89c6\u9891\u52a0\u8f7d\u5931\u8d25","Switching to":"\u6b63\u5728\u5207\u6362\u81f3","Switched to":"\u5df2\u7ecf\u5207\u6362\u81f3",quality:"\u753b\u8d28"};e.exports=function(e){var t=this;this.lang=e,this.tran=function(e){return"en"===t.lang?e:"zh"===t.lang?n[e]:void 0}}},function(e,t,i){"use strict";var n=i(0),a={main:function(e){for(var t="",i=0;i<e.video.url.length;i++)t+=a.video(0===i,e.video.pic,e.screenshot,e.video.url.length?"metadata":e.preload,e.video.url[i]);return'<div class="xplayer-mask"></div><div class="xplayer-video-wrap">'+t+(e.logo?'<div class="xplayer-logo"><img src="'+e.logo+'"></div>':"")+'<div class="xplayer-bezel"><span class="xplayer-bezel-icon"></span><span class="diplayer-loading-icon"><svg height="100%" version="1.1" viewBox="0 0 22 22" width="100%"><svg x="7" y="1"><circle class="diplayer-loading-dot diplayer-loading-dot-0" cx="4" cy="4" r="2"></circle></svg><svg x="11" y="3"><circle class="diplayer-loading-dot diplayer-loading-dot-1" cx="4" cy="4" r="2"></circle></svg><svg x="13" y="7"><circle class="diplayer-loading-dot diplayer-loading-dot-2" cx="4" cy="4" r="2"></circle></svg><svg x="11" y="11"><circle class="diplayer-loading-dot diplayer-loading-dot-3" cx="4" cy="4" r="2"></circle></svg><svg x="7" y="13"><circle class="diplayer-loading-dot diplayer-loading-dot-4" cx="4" cy="4" r="2"></circle></svg><svg x="3" y="11"><circle class="diplayer-loading-dot diplayer-loading-dot-5" cx="4" cy="4" r="2"></circle></svg><svg x="1" y="7"><circle class="diplayer-loading-dot diplayer-loading-dot-6" cx="4" cy="4" r="2"></circle></svg><svg x="3" y="3"><circle class="diplayer-loading-dot diplayer-loading-dot-7" cx="4" cy="4" r="2"></circle></svg></svg></span></div></div><div class="xplayer-controller-mask"></div><div class="xplayer-controller"><div class="xplayer-icons xplayer-icons-left"><button class="xplayer-icon xplayer-play-icon">'+n("play")+'</button><div class="xplayer-volume"><button class="xplayer-icon xplayer-volume-icon">'+n("volume-down")+'</button><div class="xplayer-volume-bar-wrap"><div class="xplayer-volume-bar"><div class="xplayer-volume-bar-inner" style="width: 70%; background: '+e.theme+';"><span class="xplayer-thumb" style="background: '+e.theme+'"></span></div></div></div></div><span class="xplayer-time"><span class="xplayer-ptime">0:00</span> / <span class="xplayer-dtime">0:00</span></span></div><div class="xplayer-icons xplayer-icons-right">'+(e.video.quality?'<div class="xplayer-quality"><button class="xplayer-icon xplayer-quality-icon">'+e.video.quality[e.video.defaultQuality].name+'</button><div class="xplayer-quality-mask">'+a.qualityList(e.video.quality)+"</div></div>":"")+(e.screenshot?'<a href="#" class="xplayer-icon xplayer-camera-icon">'+n("camera")+"</a>":"")+'<div class="xplayer-setting"><button class="xplayer-icon xplayer-setting-icon">'+n("setting")+'</button><div class="xplayer-setting-box"></div></div><div class="xplayer-full"><button class="xplayer-icon xplayer-full-in-icon">'+n("full-in")+'</button><button class="xplayer-icon xplayer-full-icon">'+n("full")+'</button></div></div><div class="xplayer-bar-wrap"><div class="xplayer-bar-time hidden">00:00</div><div class="xplayer-bar"><div class="xplayer-loaded" style="width: 0;"></div><div class="xplayer-played" style="width: 0; background: '+e.theme+'"><span class="xplayer-thumb" style="background: '+e.theme+'"></span></div></div></div></div>'+a.contextmenuList(e.contextmenu)+'<div class="xplayer-notice"></div>'},contextmenuList:function(e){for(var t='<div class="xplayer-menu">',i=0;i<e.length;i++)t+='<div class="xplayer-menu-item"><span class="xplayer-menu-label"><a target="_blank" href="'+e[i].link+'">'+e[i].text+"</a></span></div>";return t+="</div>"},qualityList:function(e){for(var t='<div class="xplayer-quality-list">',i=0;i<e.length;i++)t+='<div class="xplayer-quality-item" data-index="'+i+'">'+e[i].name+"</div>";return t+="</div>"},video:function(e,t,i,n,a){return'<video class="xplayer-video '+(e?'xplayer-video-current"':"")+'" '+(t?'poster="'+t+'"':"")+" webkit-playsinline playsinline "+(i?'crossorigin="anonymous"':"")+" "+(n?'preload="'+n+'"':"")+' src="'+a+'"></video>'},setting:function(e){return{original:'<div class="xplayer-setting-item xplayer-setting-speed"><span class="xplayer-label">'+e("Speed")+'</span><div class="xplayer-toggle">'+n("right")+'</div></div><div class="xplayer-setting-item xplayer-setting-loop"><span class="xplayer-label">'+e("Loop")+'</span><div class="xplayer-toggle"><input class="xplayer-toggle-setting-input" type="checkbox" name="xplayer-toggle"><label for="xplayer-toggle"></label></div></div>',speed:'<div class="xplayer-setting-speed-item" data-speed="0.5"><span class="xplayer-label">0.5</span></div><div class="xplayer-setting-speed-item" data-speed="0.75"><span class="xplayer-label">0.75</span></div><div class="xplayer-setting-speed-item" data-speed="1"><span class="xplayer-label">'+e("Normal")+'</span></div><div class="xplayer-setting-speed-item" data-speed="1.25"><span class="xplayer-label">1.25</span></div><div class="xplayer-setting-speed-item" data-speed="1.5"><span class="xplayer-label">1.5</span></div><div class="xplayer-setting-speed-item" data-speed="2"><span class="xplayer-label">2</span></div>'}}};e.exports=a},function(e,t,i){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),s=i(1),l=function(){function e(t,i){var a=this;n(this,e),this.videos=t,this.multi=this.videos.length>1,this.index=0,this.current=this.videos[this.index],this.duration=i||0,this.durationArr=[],this.eventAll=[],this.eventCurrent=[],this.on("all","durationchange",function(e,t){1!==t.duration&&(a.durationArr[e]=t.duration,i||(a.duration=a.durationArr.reduce(function(e,t){return e+t})))}),this.on("current","end",function(){a.switch(a.index+1)})}return a(e,[{key:"switch",value:function(e,t){this.index!==e?(s.addClass(this.videos[e],"xplayer-video-current"),this.current.paused||this.videos[e].play(),s.removeClass(this.current,"xplayer-video-current"),this.current.pause(),this.index=e,this.current=this.videos[this.index],this.videos[e].currentTime=t||0):this.videos[e].currentTime=t||0}},{key:"on",value:function(e,t,i){var n=this;if("function"==typeof i&&("all"===e?(this.eventAll[t]||(this.eventAll[t]=[]),this.eventAll[t].push(i)):(this.eventCurrent[t]||(this.eventCurrent[t]=[]),this.eventCurrent[t].push(i)),-1===["seeking"].indexOf(t)))for(var a=0;a<this.videos.length;a++)(function(a){n.videos[a].addEventListener(t,function(){"all"!==e&&n.videos[a]!==n.current||i(a,n.videos[a])})})(a)}},{key:"trigger",value:function(e,t){var i="all"===e?this.eventAll:this.eventCurrent;if(i[t])for(var n=0;n<i[t].length;n++)i[t][n]()}},{key:"currentTime",value:function(){return this.durationArr.slice(0,this.index).length?this.durationArr.slice(0,this.index).reduce(function(e,t){return e+t})+this.current.currentTime:this.current.currentTime}},{key:"seek",value:function(e){e=Math.max(e,0),e=Math.min(e,this.duration);for(var t=0,i=0;i<=e;)i+=this.durationArr[t],t++;var n=void 0;n=this.durationArr.slice(0,this.index).length?e-this.durationArr.slice(0,t-1).reduce(function(e,t){return e+t}):e,this.switch(t-1,n),this.trigger("all","seeking")}},{key:"attr",value:function(e,t){if(void 0!==t)for(var i=0;i<this.videos.length;i++)this.videos[i][e]=t;return this.current[e]}},{key:"play",value:function(){this.current.play()}},{key:"pause",value:function(){this.current.pause()}},{key:"toggle",value:function(){this.current.paused?this.play():this.pause()}}]),e}();e.exports=l}])});
//# sourceMappingURL=XPlayer.js.map