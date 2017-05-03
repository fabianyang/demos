$(function() {
	var resultReply = {
		right: {
			count: 0,
			text: [
				'友谊的小船要扬帆起航了',
				'厉害了，我的哥！',
				'亦可赛艇！',
				'朋友，你知道的太多了',
				'老铁666！看来必须得请你吃顿饭了。'
			]
		},
		wrong: {
			count: 0,
			text: [
				'我们的基情破裂了',
				'我可能交了个假朋友。',
				'你的好友已下线。',
				'友尽，出门左转不送',
				'对方并不想理你，并向你丢了一坨'
			]
		}
	}

	var button = $('.btnstyle'),
		template = $('#js_template'),
		list = $('#js_list'),
		path = $('#path').val();

	var firstQ = template.find('.odd').first(),
		firstA = template.find('.even').first(),
		lastA = template.find('.even').last(),
		lastQ = template.find('.odd').last();

	var index = 0,
		score = 0,
		answer = undefined;
		items = JSON.parse(answerItemArray);
	
	var buttonGroup = $('.bbtn');

	buttonGroup.eq(0).hide();
	buttonGroup.eq(1).show();

	var isl = new IScrollLite('.div580');
	// isl.scrollToElement('.div580 li:last-child')

	function sendQ() {
		var item = items[index];
		answer = item.answer;
		var commonQ = firstQ.clone();
		commonQ.appendTo(list).find('.js_text').text(
			index + 1 + '. 关于' + item.itemContent + '：' + item.answerContent
		);
		isl.refresh();
		isl.scrollToElement(commonQ[0]);
	}

	function sendR(tof) {
		var reply = resultReply[tof];
		var text = firstQ.clone().appendTo(list).find('.js_text').text(
			reply.text[reply.count]
		);

		if(tof === 'wrong' && index === 4) {
			text.append('<img src=' + path + '"/images/icon08.png" style="width:0.675rem; vertical-align:middle;margin-left:5px;">');
		}
		index++;
	}

	// 创建第一题
	button.eq(3).on('click', function() {
		buttonGroup.eq(0).show();
		buttonGroup.eq(1).hide();
		firstQ.clone().appendTo(list);
		sendQ();
	});


	
	function selected(bool) {
		if (answer === bool) {
			score = score + 20;
			sendR('right');
			resultReply['right'].count++;
		} else {
			sendR('wrong');
			resultReply['wrong'].count++;
		}
		if (index < 5) {
			sendQ();
		} else {
			finish();
		}
	}

	function finish() {
		button.off('click');

		var answerMatter = {
			'name': encodeURIComponent(encodeURIComponent(name)),
			'openId': openId,
			'avatar': avatar,
			'subjectOpenId': subjectOpenId,
			'itemUUID': itemUUID,
			'scores': score
		}

		var url = window.location.protocol + '//' + window.location.hostname + '/huodongAC.d?class=BosomFriendHc';
		$.get(url + '&m=saveAnswerMatter&answerMatter=' + JSON.stringify(answerMatter), function(data){
			var root = JSON.parse(data).root;
			if (root.isSuccess === 'true') {
				lastQ.data({
					url: url + '&m=redirtScores&subjectOpenId=' + root.subjectOpenId + '&openId=' + root.openId + '&itemUUID=' + root.itemUUID
				}).appendTo(list);
				isl.refresh();
				isl.scrollToElement(lastQ[0]);
			} else {
                alert('error');
			}
		});

	}

	button.eq(0).on('click', function() {
		var wrong = firstA.clone().appendTo(list);
		isl.refresh();
		isl.scrollToElement(wrong[0]);
		selected(false);
		console.log(index, score);
	});

	button.eq(1).on('click', function() {
		var right = lastA.clone().appendTo(list);
		isl.refresh();
		isl.scrollToElement(right[0]);
		selected(true);
		console.log(index, score);
	});

	lastQ.on('click', function(){
		window.location.href = $(this).data().url;
	});

})