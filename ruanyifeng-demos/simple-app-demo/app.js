const $ = require('jquery');
$('h1').css({ color: 'red' });
$.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:3000/comments',
    data: {
        body: "hello world",
        postId: 1
    },
    // timeout: 2000,
    // cache: false,
    // dataType: "json",
    // async: false,
    success: function (data) {
        console.log(data);
    }
});

$.ajax({
    type: 'DELETE',
    url: 'http://127.0.0.1:3000/comments/2',
    // timeout: 2000,
    // cache: false,
    // dataType: "json",
    // async: false,
    success: function (data) {
        console.log(data);
    }
});