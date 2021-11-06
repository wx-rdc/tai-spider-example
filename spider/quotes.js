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
                'text': response.css('span.text', ele).text(),
                'href': response.css('span a', ele)[0].attribs['href']
            };
            yield* response.follow_all(response.css('span a', ele), this.parseAuthor);
        }
    }

    *parseAuthor(response) {
        const loader = new ItemLoader(response, require('../model/author'));
        yield loader.load_item();
    }

}

module.exports = QuotesSpider;