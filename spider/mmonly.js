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
        this.envs['FILE_STORE'] = 'output';
    }

    *parse(response) {
        for (let ele of response.css('div.item')) {
            let imageEle = ele.css('img').get(0);
            yield response.follow(imageEle.attr('src'), this.parseImage, {
                download: true,
                options: {
                    type: 'jpg',
                },
                extData: {
                    title: imageEle.attr('alt'),
                }
            });
        }
    }

    *parseImage(response) {
        yield {
            ...response.options.extData,
        }
    }
}

module.exports = MmonlySpider;