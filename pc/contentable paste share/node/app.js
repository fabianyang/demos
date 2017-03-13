var http = require('http');
var fs = require('fs');
var path = require('path');

var imgPath = './public/images';

// 创建文件夹
function mkdirSync(url, mode, cb) {
    var path = path || require('path'),
        arr = url.split('/');
    mode = mode || 0755;

    cb = cb || function() {};
    if (arr[0] === '.') { // 处理 ./aaa
        arr.shift();
    }
    if (arr[0] == '..') { // 处理 ../ddd/d
        arr.splice(0, 2, arr[0] + '/' + arr[1])
    }

    function inner(dir) {
        if (!fs.existsSync(dir)) { //不存在就创建一个
            fs.mkdirSync(dir, mode)
        }
        if (arr.length) {
            inner(dir + '/' + arr.shift());
        } else {
            cb(dir);
        }
    }

    arr.length && inner(arr.shift());
}

// 删除文件夹
function rmdirSync(dir, cb) {
    cb = cb || function() {};
    var dirs = [];

    try {
        iterator(dir);

        // 一次性删除所有收集到的目录
        for (var i = 0; i < dirs.length; i++) {
            var el = dirs[i];
            fs.rmdirSync(el);
        }

        cb(dir);
    } catch (e) { //如果文件或目录本来就不存在，fs.statSync 会报错，不过我们还是当成没有异常发生
        e.code === 'ENOENT' ? cb() : cb(e);
    }

    function iterator(url) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            dirs.unshift(url); // 收集目录
            inner(url);
        } else if (stat.isFile()) {
            fs.unlinkSync(url); // 直接删除文件
        }
    }

    // 遍历目录中的文件
    function inner(path) {
        var arr = fs.readdirSync(path);
        for (var i = 0; i < arr.length; i++) {
            var el = arr[i];
            iterator(path + '/' + el);
        }
    }
}


var server = http.createServer(function(req, res) {

    if (req.url !== '/favicon.ico') {
        var buffer = [];
        // 接收流数据
        req.on('data', function(data) {
            buffer.push(data);
        });
        // 数据接收完毕
        req.on('end', function() {

            var imageBuffer = Buffer.concat(buffer),
                time = new Date().getTime();

            // rmdirSync(imgPath, function(data){
            //     console.log('删除' + data  + '目录以及子目录成功！')
            // })

            // 如果存在直接写入图片文件，并返回地址
            if (fs.existsSync(imgPath)) {
                fs.writeFile(imgPath + '/' + time + '.jpg', imageBuffer, function(err) {
                    if (err) {
                        console.log(err)
                    } else {
                        res.path = imgPath + '/' + time + '.jpg';
                    }
                });
            }
            // 如果不存在目录创建文件目录。写入图片文件，并返回地址
            else {

                //测试代码
                mkdirSync(imgPath, 0, function(data) {
                    console.log(data + '创建成功!');

                    var base64Img = imageBuffer.toString('base64');  // base64图片编码字符串

                    console.log(base64Img);

                    var decodeImg = new Buffer(base64Img, 'base64');  // new Buffer(string, encoding)

                    console.log(Buffer.compare(imageBuffer, decodeImg));  // 0 表示一样

                    fs.writeFile(imgPath + '/' + time + '_0.jpg', decodeImg, function(err) {
                        if(err) {
                            console.log(err)
                        } else {
                            imgPath + '/' + time + '_0.jpg';
                        }
                    });
                });
            }
        });
    }

    console.log('客户端请求数据全部接收完毕');

    res.end();
}).listen(1337, '192.168.79.182', function() {
    console.log('listened');
});

// var folder_exists = fs.existsSync(imgPath'./public/images');

// if (folder_exists == true) {
//     var dirList = fs.readdirSync('./public/images');

//     dirList.forEach(function(fileName) {
//         fs.unlinkSync('./public/images/' + fileName);
//     });
// } else {
//     mkdirsSync('./public/images');
// }
