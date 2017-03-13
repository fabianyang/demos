var pasteBox = $('.pasteBox'),
    ceBox = $('.ceBox'),
    close = $('.close'),
    mask = $('.mask');

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
    ceBox.on('paste', function(ev) {
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
            });
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
            }
        }, 16);
    });
}


close.on('click', function(e) {
    mask.hide();
    pasteBox.empty().hide();
})
