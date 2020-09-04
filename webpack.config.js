const path = require( 'path' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );

const fantaptikWebpack = require( '@fantaptik/webpack-config' );

module.exports = {
    entry : "./src/index.js",
    stats : {
        ...fantaptikWebpack.stats,
    },
    externals : {
        ...fantaptikWebpack.externals,
    },
    output : {
        filename : "index.js",
        path : path.resolve( __dirname, "dist" ),
        library : "FantaptikCore",
        libraryTarget : "umd",
    },
    plugins : [
        // Clean dist for every build.
        new CleanWebpackPlugin(),
    ],
    module : {
        rules : [
            {
                test : /\.js$/,
                exclude : /[\\/]node_modules[\\/]/,
                use : {
                    loader: 'babel-loader',
                    options : {
                        plugins : [ '@babel/plugin-proposal-class-properties' ],
                        presets : [ '@babel/preset-env' ],
                    },
                },
            },
        ],
    }
}