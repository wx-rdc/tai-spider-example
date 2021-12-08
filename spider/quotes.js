'use strict'

const { TaiSpider, ItemLoader } = require('tai-spider');

class QuotesSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'quotes';
        this.debug = true;
        this.start_urls = [
            'https://quotes.toscrape.com/page/1/',
        ];
    }

    *parse(response) {
        for (let ele of response.css('div.quote')) {
            yield {
                'text': ele.css('span.text').extract_first(),
                'href': ele.css('span a').get(0).attr('href')
            };
            yield* response.follow_all(ele.css('span a'), this.parseAuthor);
        }
    }

    *parseAuthor(response) {
        const loader = new ItemLoader(response, require('../model/author'));
        yield loader.load_item();
    }

}

module.exports = QuotesSpider;