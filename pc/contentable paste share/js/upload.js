var pasteBox = $('.pasteBox'),
    ceBox = $('.ceBox'),
    close = $('.close'),
    mask = $('.mask');

var picBox = $('.picBox');

var _ua = navigator.userAgent.toLowerCase();

var GECKO = _ua.indexOf('gecko') > -1 && _ua.indexOf('khtml') == -1,
    WEBKIT = _ua.indexOf('applewebkit') > -1;


// 检测是否支持 paste 事件
if (!WEBKIT && !GECKO) {
    var pasted = false;
    ceBox.on('paste', function(ev) {
        pasted = true;
        return true;
    });
    setTimeout(function() {
        ceBox.on('keyup', function(ev) {
            if (pasted) {
                pasted = false;
                return true;
            }
            if (ev.keyCode == 86 && ev.ctrlKey) alert('您的浏览器不支持粘贴图片！');
        })
    }, 10);
}

// 图片缩放
function imageZoom(width, height) {

    // var aspectRatio = this.width / this.height;
    var containerHeight = 500, containerWidth = 500;
    var w = width, h = height;
    if (width > containerWidth && height < containerHeight) {
        w = containerWidth;
        h = containerWidth * height / width;
    } else if (width < containerWidth && height > containerHeight) {
        w = containerHeight * width / height;
        h = containerHeight;
    } else if (width > containerWidth && height > containerHeight){
        if (width > height) {
            w = containerWidth;
            h = containerWidth * height / width;
        } else {
            w = containerHeight * width / height;
            h = containerHeight;
        }
    }

    return {
        width: w + 'px',
        height: h + 'px'
    }
}

// 上传图片
function upload_pic(data, url) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://192.168.79.182:1337/');
    xhr.overrideMimeType('application/octet-stream');
    xhr.sendAsBinary(data);
}

XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    function byteValue(x) {
        return x.charCodeAt(0) & 0xff;
    }
    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a.buffer);
};

/* Paste in chrome.*/
if (WEBKIT) {
    ceBox.on('paste', function(ev) {
        var $this = $(this),
            file = null, blobUrl = '',
            items0 = ev.originalEvent.clipboardData.items[0];

        console.log(items0);

        var kind = items0.kind,
            type = items0.type;

        if (kind === 'file' && type.indexOf('image/') !== -1) {
            file = items0.getAsFile();

            window.URL = window.URL || window.webkitURL;
            blobUrl = window.URL.createObjectURL(file);
        }
        console.log(file);

        // 粘贴屏幕截图
        if (file) {
            var img = new Image();
            img.src = blobUrl;

            // 为了缩略图宽高自适应，等待图片 complete 或 onload 之后才能获取图片宽高
            $(img).on('load', function() {

                var wh = imageZoom(this.width, this.height);

                $(this).attr(wh);

                pasteBox.empty();
                pasteBox.append($(this)).show();
                mask.show();
            });

            var reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function(evt) {
                // console.log(evt.target.result);
                upload_pic(reader.result, blobUrl);
            };

        }

        // 粘贴网页图片
        else {
            setTimeout(function() {
                var html = ceBox.html();
                if (html.search(/<img[^>]*>/) > -1) {
                    var img = html.match(/<img[^>]*>/)[0];

                    html = html.replace(/<img[^>]*>/, '');
                    ceBox.html(html);

                    var src = $(img).attr('src');
                    var crossOriginImage = new Image();
                    // 网络图片跨域，要想加入到 canvas 必须添加此参数。
                    crossOriginImage.setAttribute('crossOrigin', 'anonymous');
                    crossOriginImage.src = src;

                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');

                    $(crossOriginImage).on('load', function() {
                        $(this).attr({
                            'width': this.width > this.height ? '100%' : '',
                            'height': this.height > this.width ? '100%' : ''
                        });

                        pasteBox.html(this).show();
                        mask.show();

                        canvas.width = this.width;
                        canvas.height = this.height;

                        ctx.drawImage(this, 0, 0, this.width, this.height);

                        var dataurl = canvas.toDataURL('image/png');

                        // dataurl 是 base64 编码，此时可以和上面一样进行上传，进行转换上传。

                    });
                }
            }, 0);
        }
    });
}
/* Paste in firefox and other.*/
else {
    ceBox.on('paste', function(ev) {
        $(this).blur();
        setTimeout(function() {
            var html = ceBox.html();
            if (html.search(/<img[^>]*>/) > -1) {
                // if (html.search(/<img src="data:.+;base64,/) > -1) {
                // 这里也需要判断是否是网络图片或剪切板图片，用相应方法进行上传。代码省略。
                var img = html.match(/<img[^>]*>/)[0];
                html = html.replace(/<img[^>]*>/, '');
                ceBox.html(html);
                $(img).on('load', function() {
                    $(this).attr({
                        'width': this.width > this.height ? '100%' : '',
                        'height': this.height > this.width ? '100%' : ''
                    });

                    pasteBox.html(this).show();
                    mask.show();
                });
            }
        }, 0);
    });
}


close.on('click', function(e) {
    mask.hide();
    pasteBox.empty().hide();
})
