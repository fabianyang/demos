var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: [
        // 'webpack/hot/dev-server',
        // 'webpack-dev-server/client?http://localhost:8080',
        './index.js'
    ],
    output: {
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    // plugins: [
    //     new webpack.HotModuleReplacementPlugin()
    // ],
    module: {
        rules: [{
            test: /\.js[x]?$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'react']
                }
            },
            include: path.join(__dirname, '.')
        }]
    }
};
