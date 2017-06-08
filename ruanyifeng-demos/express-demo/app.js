// app1.js
let express = require('express');
// 调用express，生成一个 Web 应用的实例。
let app = express();

// app3.js add
// body-parser 模块的作用，是对 POST、PUT、DELETE 等 HTTP 方法的数据体进行解析。
// app.use 用来将这个模块加载到当前应用。有了这两句，就可以处理 POST、PUT、DELETE 等请求了。
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));

let router = express.Router();

// app4.js add
// router.use 的作用是加载一个函数。这个函数被称为中间件，作用是在请求被路由匹配之前，先进行一些处理。
// 上面这个中间件起到 logging 的作用，每收到一个请求，就在命令行输出一条记录。
// 请特别注意，这个函数内部的 next()，它代表下一个中间件，表示将处理过的请求传递给下一个中间件。
// 这个例子只有一个中间件，就进入路由匹配处理（实际上，bodyparser、router本质都是中间件，整个 Express 的设计哲学就是不断对 HTTP 请求加工，然后返回一个 HTTP 回应）。
router.use(function (req, res, next) {
    console.log('There is a requesting.');
    next();
});

// homework 1.请增加一个中间件，服务器每次收到用户请求，会在服务器的控制台打印出收到请求的时间。
router.use(function (req, res, next) {
    console.log(new Date());
    next();
});

// 新建一个路由对象，该对象指定访问根路由（/）时，返回 Hello World。然后，将该路由加载在 /home 路径，也就是说，访问 /home 会返回 Hello World 。
// router.get 方法的第二个参数是一个回调函数，当符合指定路由的请求进来，会被这个函数处理。
// 该函数的两个参数， req 和 res 都是 Express 内置的对象，分别表示用户的请求和 Web 服务器的回应。 res.send 方法就表示服务器回应所送出的内容。
router.get('/', function (req, res) {
    console.log(req.query.name);
    res.send('<h1>Hello Express</h1>');
});

// app2.js add
// 新增一个路由，这个路由的路径是一个命名参数 :name ，可以从 req.params.name 拿到这个传入的参数。
router.get('/:name', function (req, res) {
    res.send('<h1>Hello ' + req.params.name + '</h1>');
});

// homework 2.URL 的查询字符串
router.get('/QueryString', function (req, res) {
    res.send('<h1>Hello ' + req.query.name + '</h1>');
});

// app3.js add
// 如果收到了 / 路径（实际上是 /home 路径）的 POST 请求，先从数据体拿到 name 字段，然后返回一段 JSON 信息。
// 在 Chrome 浏览器的 Postman 插件里面，向 http://127.0.0.1:8080/home 发出一个POST请求。
// 数据体的编码方法设为 x-www-form-urlencoded，里面设置一个 name 字段，值可以随便取，假定设为 Alice。
router.post('/', function (req, res) {
    let name = req.body.name;
    res.json({
        message: 'Hello ' + name
    });
});

app.use('/', router);

// yangfan: 注意 /home 时, 127.0.0.1 会 Cannot GET /
// app.use('/home', router);

let port = process.env.PORT || 8080;

app.listen(port);

console.log('Magic happens on port ' + port);