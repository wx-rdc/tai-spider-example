'use strict'

const { TaiSpider } = require('tai-spider');

class SseSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'sse';
        this.debug = true;
        this.start_urls = [
            'http://www.sse.com.cn/disclosure/listedinfo/announcement/json/stock_bulletin_publish_order.json',
        ];
        this.envs['ECHO'] = false;
        this.envs['FILE_STORE'] = 'output';
        this.addPipeline(require('../pipeline/echo'));
    }

    *parse(response) {
        let data = response.getJSON();
        for (let item of data['publishData'].slice(0, 3)) {
            yield response.download(item['bulletinUrl'], {
                type: 'pdf',
                cb: (uid) => {
                    return Object.assign({}, item, { uid });
                }
            })
        };
    }

}

module.exports = SseSpider;