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
            let imageEle = response.css('img', ele)[0];
            yield response.download(imageEle.attribs['src'], {
                type: 'jpg',
                extData: {
                    title: imageEle.attribs['alt'],
                }
            });
        }
    }
}

module.exports = MmonlySpider;