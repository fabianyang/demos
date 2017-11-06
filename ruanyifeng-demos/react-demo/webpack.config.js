// 引入Webpack模块供我们调用，这里只能使用ES5语法，使用ES6语法会报错
var webpack = require('webpack');

// __dirname是node.js中的一个全局变量，它指向当前执行脚本所在的目录
// 注意这里是exports不是export
module.exports = {
    // 生成Source Maps,这里选择eval-source-map
    devtool: 'eval-source-map',
    // 唯一入口文件
    entry: [__dirname, '/my-demo/main.js'].join(''),
    // 输出目录
    output: {
        // 打包后的js文件存放的地方
        path: [__dirname, '/dist'].join(''),
        // 打包后输出的js的文件名
        filename: 'bundle.js'
    },

    module: {
        // loaders加载器
        loaders: [{
            // 一个匹配loaders所处理的文件的拓展名的正则表达式，这里用来匹配js和jsx文件（必须）
            test: /\.(js|jsx)$/,
            // 屏蔽不需要处理的文件（文件夹）（可选）
            exclude: /node_modules/,
            // loader的名称（必须）
            loader: 'babel-loader'
        }]
    },

    plugins: [
        // 热模块替换插件
        new webpack.HotModuleReplacementPlugin()
    ],

    devServer: {
        contentBase: './dist',
        historyApiFallback: true,
        inline: true,
        port: 8080
    }
};