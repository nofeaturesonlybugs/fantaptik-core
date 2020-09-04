'use strict';

const path = require( 'path' );

module.exports = {
    source : {
        include : [
            path.join( __dirname, "src" ),
        ]
    },

    plugins : [
        "plugins/markdown"
    ],

    opts : {
        destination : path.join( __dirname, "docs" ),
        recurse : true,
        template : path.join( __dirname, "node_modules/docdash" ),
    },
};