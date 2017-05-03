$(function(){

    var selectButton = $('.answer'),
        nextButton = $('.btn03').show(),
        finishButton = $('.btn04').hide(),
        anumi = $('.anum').find('i'),
        itemSpan = $('.bt').find('span');

    var answerSpan = selectButton.find('span');

    var index = 1;
    var items = [],
        selected = [];
    
    (function(list) {
        var item = {};
        for(var i = 0; i < list.length; i++) {
            if (!item.itemId) {
                item = list[i];
            } else {
                item.answerId = [item.answerId, list[i].answerId];
                item.answerContent = [item.answerContent, list[i].answerContent];
                items.push(item);
                item = {};
            }
        }
    })(JSON.parse(itemList));

    var itemsCopy = items.concat();

    var clearClass = function() {
        selectButton.removeClass('cur');
        nextButton.removeClass('active');
        finishButton.removeClass('active');
    }

    function randomInt(min, max) {   
        var range = max - min ;   
        var rand = Math.random();   
        return (min + parseInt(rand * range));   
    }

    function randomItem() {
        var random = randomInt(0, itemsCopy.length);
        var item = itemsCopy[random];
        itemsCopy.splice(random, 1);
        
        itemSpan.text(item.itemContent);
        answerSpan.eq(0).text(item.answerContent[0]);
        answerSpan.eq(1).text(item.answerContent[1]);

        var button = index === 5 ? finishButton : nextButton;
        button.data({
            itemId: item.itemId
        })
        selectButton.eq(0).data({
            answerId: item.answerId[0]
        });
        selectButton.eq(1).data({
            answerId: item.answerId[1]
        });
    }

    randomItem();

    // $('.btn01').on('click', function(){
    //     $('.bj01').fadeOut(function() {
    //         $('.bj02').show();
    //     })
    // });

    $('.btn02').on('click', function(){
        clearClass();
        randomItem();
        if (!itemsCopy.length) {
            itemsCopy = items.concat();
        }
    })

    selectButton.on('click', function(){
        var that = $(this);
        clearClass();
        that.addClass('cur');
        var button = index === 5 ? finishButton : nextButton;
        button.addClass('active').data({
            answerId: that.data().answerId
        })
    })

    nextButton.on('click', function() {
        var that = $(this);
        if (!that.hasClass('active')) {
            return false;
        }
        clearClass();
        anumi.text(++index);
        if (index === 5) {
            nextButton.hide();
            finishButton.show();
            $('.icon01').find('.cur').removeClass('cur').next().addClass('cur');
        }
        // 换题
        var data = that.data();
        console.log(data);
        selected.push({
            id: data.itemId,
            askid: data.answerId
        });

        // 重新生成 items
        items.forEach(function(item, index) {
            if (item.itemId === data.itemId) {
                items.splice(index, 1);
            }
        });
        itemsCopy = items.concat();
        console.log(items);
        randomItem();
    })

    finishButton.on('click', function(){
        var that = $(this);
        if (!that.hasClass('active')) {
            return false;
        }

        var data = that.data();
        console.log(data);
        selected.push({
            id: data.itemId,
            askid: data.answerId
        });
        console.log(selected);

        var item = {
            'openId': openId,
            'nickName': encodeURIComponent(encodeURIComponent(nickName)),
            'headimgurl': headimgurl,
            'item': selected
        };

        // ajax
		var url = window.location.protocol + '//' + window.location.hostname + '/huodongAC.d?class=BosomFriendHc';
		$.get(url + '&m=saveItem&Item=' + JSON.stringify(item), function(data){
			var root = JSON.parse(data).root;
			if (root.isSuccess === 'true') {
                window.location.href = url + '&m=saveSelf&subjectOpenId=' + root.subjectOpenId + '&itemUUID=' + root.itemUUID
			} else {
                alert('error');
            }
		});
        that.off('click');
    });
})
