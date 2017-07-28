var emoji = require('node-emoji');

// 返回 coffee 的 Emoji
let coffee = emoji.get('coffee');
console.log(coffee);
// 返回文字标签对应的 Emoji
// https://www.webpagefx.com/tools/emoji-cheat-sheet/
let fast_forward = emoji.get(':fast_forward:');
console.log(fast_forward);

// 将文字替换成 Emoji
let ihc = emoji.emojify('I :heart: :coffee:!');
console.log(ihc);

// 随机返回一个 Emoji
emoji.random();

// 查询 Emoji
// 返回结果是一个数组
emoji.search('cof');