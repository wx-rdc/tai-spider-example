'use strict';

const path = require('path');

module.exports = appInfo => {
    const config = exports = {};

    // seenreq
    // config.seenreq = {
    //     repo: 'redis',// use redis instead of memory
    //     host: '127.0.0.1',
    //     port: 6379,
    //     clearOnQuit: false,
    // };

    return {
        ...config,
    };
};
