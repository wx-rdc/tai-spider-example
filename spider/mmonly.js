'use strict'

const { TaiSpider } = require('tai-spider');

class MmonlySpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'mmonly';
        this.debug = true;
        this.start_urls = [
            'https://www.mmonly.cc/gxtp/',
        ];
        this.envs['ECHO'] = false;
        this.envs['FILE_STORE'] = 'output';
        this.addPipeline(require('../pipeline/echo'));
    }

    *parse(response) {
        for (let ele of response.css('div.item')) {
            let imageEle = ele.css('img').get(0);
            yield response.download(imageEle.attr('src'), {
                type: 'jpg',
                extData: {
                    title: imageEle.attr('alt'),
                }
            });
        }
    }
}

module.exports = MmonlySpider;