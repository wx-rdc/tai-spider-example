'use strict'

const { TaiSpider } = require('tai-spider');

class SeebugSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'seebug';
        this.debug = true;
        this.start_urls = [
            "https://paper.seebug.org/"
        ]
        // this.addPipeline(require('../pipeline/elastic-search'));
    }

    *parse(response) {
        for (let ele of response.css('article')) {
            yield response.follow(ele.css('.post-title a'), this.parseArticle);
            break;
        }
    }

    *parseArticle(response, spider) {
        yield {
            href: response.options.link,
            title: response.css('article header .post-title').extract_first(),
            pubdate: response.css('article header .post-meta .fulldate').get(0).attr('datetime'),
            content: response.css('article .post-content p').extract().slice(0, 5).join('\n'),
        }
    }

}

module.exports = SeebugSpider;