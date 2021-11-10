'use strict'

const { TaiSpider } = require('tai-spider');

class JianshuSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'jianshu';
        this.debug = true;
        this.start_urls = [
            'https://www.jianshu.com/',
        ];
        this.envs['SPLASH_SERVER'] = 'http://localhost:8050';
        this.envs['CAPTURE_STORE'] = 'output';
    }

    *parse(response) {
        for (let ele of response.css('div.content')) {
            yield* response.capture_all(response.css('a.title', ele), {
                render_all: 0,
                wait: 0,
                // engine: "chromium",
                viewport: '1200x2000',
            });
        }
    }

}

module.exports = JianshuSpider;