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
    // $.ajax({
    //     type: "POST",
    //     url: "uploadImageSvlt",
    //     dataType: 'json',
    //     data: {
    //         fileurl: url
    //     },
    //     success: function(html) {
    //         alert(html);
    //     }
    // });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://192.168.79.182:1337/");
    xhr.overrideMimeType("application/octet-stream");
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

// base64 转 ArrayBuffer
function _base64ToArrayBuffer(base64) {
    // var binary_string =  window.atob(base64);
    var binary_string =  window.btoa(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.atob( binary );
}


// base64 转 blob
function _dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = window.atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}


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
        }
        console.log(file);

        if (file) {
            var img = new Image();
            img.src = blobUrl;

            // 为了缩略图宽高自适应，等待图片 complete 或 onload 之后才能获取图片宽高
            $(img).on('load', function() {

                var wh = imageZoom(this.width, this.height);

                $(this).attr(wh);

                // $(this).attr({
                //     'width': this.width > this.height ? '100%' : '',
                //     'height': this.height > this.width ? '100%' : ''
                // });

                pasteBox.empty();
                pasteBox.append($(this)).show();
                mask.show();

                // pasteBox.html($(this).html());
            });

            var reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function(evt) {
                // console.log(evt.target.result);
                upload_pic(reader.result, blobUrl);
            };


            // reader.readAsDataURL(file);
            // reader.onload = function(evt) {
            //     var result = evt.target.result;
            //     var arr = result.split(",");
            //     var data = arr[1];
            //     var contentType = arr[0].split(";")[0].split(":")[1];
            //     console.log(contentType);

            //     // var buffer = _base64ToArrayBuffer(result);
            //     // var base64 = _arrayBufferToBase64(buffer);

            //     // if (result == base64) {
            //     //     console.log("base64 to ArrayBuffer to base64 success!!");
            //     // }

            //     var blob = _dataURLtoBlob(result);
            //     console.log(blob);
            //     // 再 readAsDataURL(blob) 变为 base64
            // };

            // reader.readAsArrayBuffer(file) // 将文件读取为 ArrayBuffer
            // reader.onload = function(evt) {
            //     console.log(evt.target.result);
            // }

            // reader.readAsDataURL(file);
            // readAsBinaryString(file) 将文件读取为二进制字符串
            // readAsDataURL(file) 将文件读取为 Data URL
            // readAsText(file, [encoding]) 将文件读取为文本，encoding 缺省值为 'UTF-8'

        } else {
            setTimeout(function() {
                var html = ceBox.html();
                if (html.search(/<img[^>]*>/) > -1) {
                    var img = html.match(/<img[^>]*>/)[0];

                    html = html.replace(/<img[^>]*>/, '');
                    ceBox.html(html);

                    if (html.search(/src="data:.+;base64,/) > -1) {
                        $(img).on('load', function() {
                            $(this).attr({
                                'width': this.width > this.height ? '100%' : '',
                                'height': this.height > this.width ? '100%' : ''
                            });

                            pasteBox.html(this).show();
                            mask.show();
                        });
                    } else {
                        var src = $(img).attr('src');
                        var crossOriginImage = new Image();
                        crossOriginImage.setAttribute('crossOrigin', 'anonymous');
                        crossOriginImage.src = src;

                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');

                        // var parser = new DOMParser();
                        // img = parser.parseFromString(img, 'text/xml');

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

                            // 进行转换上传。
                        });
                    }
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
            // if (html.search(/<img src="data:.+;base64,/) > -1) {
            if (html.search(/<img[^>]*>/) > -1) {
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
                // ceBox.html(html.replace(/<img src="data:.+;base64,.*".*\/>/, ''));

                // $.post(createLink('file', 'ajaxPasteImage'), {editor: html}, function(data){ceBox.html(data);});
            }
        }, 0);
    });
}



close.on('click', function(e) {
    mask.hide();
    pasteBox.empty().hide();
})
