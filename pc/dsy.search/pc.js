;(function (win) {
    'use strict';
    var vars = win._vars || (win._vars = {});
    // 设置seajs根目录地址
    vars.base = vars.public;
    // 设置当前协议
    vars.protocol = win.location.protocol;
    // 域名匹配
    var pattern = /\/\/([^.]+)\.([^.]+\.)*soufunimg\.com/;
    var match = pattern.exec(vars.public);
    // 设置seajs配置对象
    var config = {
        base: vars.base,
        // 别名，利于较长的模块名的简化
        alias: {
            jquery: 'http://js.soufunimg.com/homepage/js/source/js/jquery-1.8.3.min'
        },
        paths: {
            searchpath:"http://js.soufunimg.com/homepage/js/search"
        },
        vars: vars,
        comboExcludes: /.*/,
        charset: 'gbk'
    };
    var seajs = win.seajs;
    seajs.config(config);
})(window);

;(function (win) {
    'use strict';
    var vars = win._vars || (win._vars = {});
    var seajs = win.seajs;
    // 加载js 入口主文件
    seajs.use(["searchpath/ssk39V02.js", "searchpath/test7"], function (main, back) {
        SFSF.init();
        seajs.use(vars.entrance);
    });
})(window);
