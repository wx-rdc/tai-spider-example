'use strict'

const { TaiSpider } = require('tai-spider');
const { Image } = require('tai-spider').types;

class ImageSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'image';
        this.debug = true;
        this.start_urls = [
            'https://www.mmonly.cc/gxtp/',
        ];
        this.envs['ECHO'] = false;
        this.envs['IMAGES_STORE'] = 'output';
    }

    *parse(response) {
        for (let ele of response.css('div.item')) {
            let imageEle = response.css('img', ele)[0];
            yield response.follow(imageEle.attribs['src'], this.parseImage, { filename: imageEle.attribs['alt'] + '.jpg' });
        }
    }

    *parseImage(response) {
        yield new Image({
            url: response.options.uri,
            type: 'jpg',
            filename: response.options.filename,
            body: response.body,
        });
    }
}

module.exports = ImageSpider;