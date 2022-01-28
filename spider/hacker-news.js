'use strict'

const { TaiSpider } = require('tai-spider');

class HackerNewsSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'hacker-news';
        this.debug = true;
        this.start_urls = [
            "https://hackernews.cc/"
        ]
        // this.addPipeline(require('../pipeline/elastic-search'));
    }

    *parse(response) {
        for (let ele of response.css('article')) {
            let hrefNode = ele.css('.classic-list-title a').get(0);
            let dateNode = ele.css('.light-post-meta span').get(1).css('a').get(0)
            yield {
                href: hrefNode.attr('href'),
                title: hrefNode.extract(),
                pubdate: `${dateNode.extract()} ${dateNode.attr('title')}`,
                content: ele.css('.m-post-excepert').extract_first(),
            }
        }
    }

}

module.exports = HackerNewsSpider;