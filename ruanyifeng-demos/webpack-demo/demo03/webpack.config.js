module.exports = {
    entry: './main.jsx',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.js[x]?$/, // 匹配 .js 或 .jsx 结尾文件 /\.js|jsx$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'react']
                }
            }]
        }]
    }
};
