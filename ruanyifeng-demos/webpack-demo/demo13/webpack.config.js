var webpack = require('webpack');

module.exports = {
    entry: {
        app: './main.js',
        vendor: ['jquery'],
    },
    output: {
        filename: './bundle.js'
    },
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.js')
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            // (the commons chunk name)

            filename: "vendor.js",
            // (the filename of the commons chunk)
        })
    ]
};
