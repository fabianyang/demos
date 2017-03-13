var pasteBox = $('.pasteBox'),
    textarea = $('.textarea'),
    close = $('.close'),
    mask = $('.mask'),
    testBox = $('.testBox');

var _ua = navigator.userAgent.toLowerCase();

var GECKO = _ua.indexOf('gecko') > -1 && _ua.indexOf('khtml') == -1,
    WEBKIT = _ua.indexOf('applewebkit') > -1;


// 检测是否支持 paste 事件
if (!WEBKIT && !GECKO) {
    var pasted = false;
    textarea.on('paste', function(ev) {
        pasted = true;
        return true;
    });
    setTimeout(function() {
        textarea.on('keyup', function(ev) {
            if (pasted) {
                pasted = false;
                return true;
            }
            if (ev.keyCode == 86 && ev.ctrlKey) alert('您的浏览器不支持粘贴图片！');
        })
    }, 10);
}

//
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

/* Paste in chrome.*/
if (WEBKIT) {
    textarea.on('paste', function(ev) {
        var $this = $(this);
        var original = ev.originalEvent;
        var file = original.clipboardData.items[0].getAsFile();
        if (file) {

            window.URL = window.URL || window.webkitURL;
            var blobUrl = window.URL.createObjectURL(file);

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

            // var reader = new FileReader();
            // reader.readAsBinaryString(file);
            // reader.readAsArrayBuffer(file) // 将文件读取为 ArrayBuffer

            // reader.onload = function(evt) {
            // var result = evt.target.result;
            // var arr = result.split(",");
            // var data = arr[1]; // raw base64
            // var contentType = arr[0].split(";")[0].split(":")[1];

            // $.post(createLink('file', 'ajaxPasteImage'), {editor: html}, function(data){cmd.inserthtml(data);});
            // };

            // function sendAsBinary(datastr) {
            //     function byteValue(x) {
            //         return x.charCodeAt(0) & 0xff;
            //     }
            //     var ords = Array.prototype.map.call(datastr, byteValue);
            //     var ui8a = new Uint8Array(ords);
            //     return ui8a.buffer
            // };

            // reader.readAsDataURL(file);
            // readAsBinaryString(file) 将文件读取为二进制字符串
            // readAsDataURL(file) 将文件读取为 Data URL
            // readAsText(file, [encoding]) 将文件读取为文本，encoding 缺省值为 'UTF-8'

        }
    });
}
/* Paste in firefox and other.*/
else {
    textarea.on('paste', function(ev) {
        $(this).blur();
        testBox.focus();
        setTimeout(function() {
            var html = testBox.html();
            // if (html.search(/<img src="data:.+;base64,/) > -1) {
            if (html.search(/<img[^>]*>/) > -1) {
                var img = html.match(/<img[^>]*>/)[0];
                html = html.replace(/<img[^>]*>/, '');
                textarea.val(html);
                $(img).on('load', function() {
                    $(this).attr({
                        'width': this.width > this.height ? '100%' : '',
                        'height': this.height > this.width ? '100%' : ''
                    });

                    pasteBox.html(this).show();
                    mask.show();
                });
                // textarea.html(html.replace(/<img src="data:.+;base64,.*".*\/>/, ''));

                // $.post(createLink('file', 'ajaxPasteImage'), {editor: html}, function(data){textarea.html(data);});
            }
        }, 2000);
    });
}

testBox.on('focus', function(e){
    // document.execCommand('formatblock', false, '<p>');
    console.log('testBox focus!!!!');
})

close.on('click', function(e) {
    mask.hide();
    pasteBox.empty().hide();
})
