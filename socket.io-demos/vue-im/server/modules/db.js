var mongoose = require('mongoose');
var setting = require('../setting.js');

let uri = 'mongodb://localhost:27017/vueim';
mongoose.Promise = global.Promise;
let connect = () => {
    mongoose.connect(uri, {
        useMongoClient: true
    }).then((data) => {
        console.log('connected!');
    });
};
connect();

mongoose.connection.on('close', function () {
    console.log('正在重新连接数据库');
    connect();
});

mongoose.connection.on('error', function (error) {
    console.log('连接失败');
    console.log(error);
    mongoose.disconnect();
});

module.exports = mongoose;
