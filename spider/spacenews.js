'use strict'

const { TaiSpider, ItemLoader } = require('tai-spider');

class SpacenewsSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'spacenews';
        this.debug = true;
        this.start_urls = [
            'https://spacenews.com/?s=space+surveillance&orderby=date-desc',
        ];
        this.envs['ECHO'] = false;
        this.envs['ES_SERVER'] = 'http://localhost:9200';
        this.addPipeline(require('../pipeline/elastic-search'));
    }

    *parse(response) {
        // response.saveHtml();
        for (let ele of response.css('.launch-article')) {
            yield {
                'title': ele.css('.launch-title > a').extract_first(),
                'link': ele.css('.launch-title > a').get(0).attr('href'),
                'author': ele.css('.launch-author > .author').extract_first(),
                'pubdate': ele.css('.launch-author > .pubdate').get(0).attr('datetime'),
                'excerpt': ele.css('.excerpt_part').extract_first(),
                'tags': ele.css('.term-info > a').extract(),
            };
            yield* response.follow_all(ele.css('.launch-title > a'), this.parseArticle);
        }
    }

    *parseArticle(response, spider) {
        yield Object.assign({
            index_name: 'article',
            doc_id: 'canonicalLink',
        }, response.extract());
        // const loader = new ItemLoader(response, require('../model/article'));
        // yield loader.load_item();
    }
}

module.exports = SpacenewsSpider;