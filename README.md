# Tai Spider Examples

Tai Spider is grown from [node-crawler](https://github.com/bda-research/node-crawler), and has similar APIs with [scrapy](https://github.com/scrapy/scrapy). Here are some basic examples using tai-spider for beginner. 

## Table of Content
  - [Our first Spider](#our-first-spider)
  - [How to run our spider](#how-to-run-our-spider)
  - [Follow links in page](#follow-links-in-page)
  - [Item loader for model](#item-loader-for-model)
  - [Download images and other files](#download-images-and-other-files)
  - [Use splash to snapshot page](#use-splash-to-snapshot-page)

### Our first spider 
Spiders are classes that you define and use to scrape information from a website (or a group of websites). They must subclass `TaiSpider` and define the initial requests to make, optionally how to follow links in the pages, and how to parse the downloaded page content to extract data.

This is the code for our first Spider. A file named `quotes.js` under the `spider` directory in example project:

```javascript
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
        }
    }
}

module.exports = QuotesSpider;
```

As you can see, our Spider subclasses `TaiSpider` and defines some attributes and methods:

   - name: identifies the Spider. It must be unique within a project, that is, you can’t set the same name for different Spiders.

   - start_urls: which the Spider will begin to crawl from. Subsequent requests will be generated successively from these initial requests.

   - parse(): a method that will be called to handle the response downloaded for each of the requests made. The response parameter is an instance of TextResponse that holds the page content and has further helpful methods to handle it.

The parse() method usually parses the response, extracting the scraped data as json object and also finding new URLs to follow and creating new requests (Request) from them.

### How to run our spider
To put our spider to work, go to the project’s top level directory and run:

```
taispider run quotes
```

This command runs the spider with name quotes that we’ve just added, that will send some requests for the `quotes.toscrape.com` domain. You will get an output similar to this:

```
run spider: quotes
start url: https://quotes.toscrape.com/page/1/
[2021-11-06T09:31:44.570] [DEBUG] taispider - seenreq is initialized.
[2021-11-06T09:31:46.991] [DEBUG] taispider - connect to a new https://quotes.toscrape.com
[2021-11-06T09:31:48.027] [DEBUG] taispider - Http2 session https://quotes.toscrape.com connection init
[2021-11-06T09:31:48.675] [DEBUG] taispider - https://quotes.toscrape.com/page/1/ stream ends
[2021-11-06T09:31:48.676] [DEBUG] taispider - Got https://quotes.toscrape.com/page/1/ (11053 bytes)...
[2021-11-06T09:31:48.694] [DEBUG] taispider - Queue size: 0
```
In `parse` function, you can selecting elements using css expression with the response object just as normal. The detail about css expression, you can find in [cheerio](https://cheerio.js.org/).

You can save scrapy data to a file instead of printing in console. Just use the follow command options:
```
taispider run quotes -o result.jl
```

### Follow links in page
Now, after extracting the data, the parse() method looks for the link to the next page, builds a full absolute URL using the urljoin() method (since the links can be relative) and yields a new request to the next page, registering itself as callback to handle the data extraction for the next page and to keep the crawling going through all the pages.

What you see here is the mechanism of following links: when you yield a Request in a callback method, `TaiSpider` will schedule that request to be sent and register a callback method to be executed when that request finishes.

Using this, you can build complex crawlers that follow links according to rules you define, and extract different kinds of data depending on the page it’s visiting.

In our example, it creates a new function named parseAuthor to parse new type author page, following all the author links in start page.

```javascript
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
            };
            yield* response.follow_all(response.css('span a', ele), this.parseAuthor);
        }
    }

    *parseAuthor(response) {
        const extract_with_css = (query) => {
            return _.trim(response.css(query).text());
        }

        yield {
            'name': extract_with_css('h3.author-title'),
            'birthdate': extract_with_css('.author-born-date'),
            'bio': extract_with_css('.author-description'),
        }
    }

}

module.exports = QuotesSpider;
```

### Item loader for model
Item Loaders provide a convenient mechanism for populating scraped items. Even though items can be populated directly, Item Loaders provide a much more convenient API for populating them from a scraping process, by automating some common tasks like parsing the raw extracted data before assigning it.

In other words, items provide the container of scraped data, while Item Loaders provide the mechanism for populating that container.

To use an Item Loader, you must first instantiate it. You can either instantiate it with an item object, in which case an item object is automatically created in the Item Loader using the item class. Then, you can collecting values using the Item Loader.

```javascript
    *parseAuthor(response) {
        const loader = new ItemLoader(response, require('../model/author'));
        yield loader.load_item();
    }
```

`model/author.js`
```javascript
const Item = require('tai-spider').Item;

module.exports = new Item({
    name: 'h3.author-title',
    birthdate: {
        value: '.author-born-date',
        type: 'date',
    },
    bio: '.author-description',
});
```

### Download Images and Other Files
Some of our web scraping tasks involves downloading images or other file types, like grabbing images to train image recognition algorithms. 
With crawler, a few settings will do the trick; simply set `FILE_STORE` to the output path, and yield object return by `response.download` function.

The files are stored using a MD5 hash of their URLs for the file names. You can use `extData` pass some properties to next pipeline, or use `cb` function to build a object.

```javascript
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
```

In above example, `extData` will be transfer to next pipeline with some infos of stored file, here is `echo` pipeline.

```javascript
'use strict';

class EchoPipeline {

	process_item(item, spider) {
		console.log(item);
		return item;
	}
}

module.exports = EchoPipeline;
```

Or use `cb` function to build a new object to transfer:

```javascript
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
```
### Use splash to snapshot page

Splash is a standalone server, which provides HTTP api to make page's snapshot. Here is [API Doc](https://splash.readthedocs.io/en/stable/api.html).

You can use script under `docker/splash` to start splash service, just run the below command:

```shell
docker-compose up -d
```

`Tai Spider` add support for splash, you simply set `CAPTURE_STORE` to the output path, `SPLASH_SERVER` to the splash server, and yield object return by `response.capture_all` or `response.capture` function.

```javascript
'use strict'

const { TaiSpider } = require('tai-spider');

class JianshuSpider extends TaiSpider {

    constructor(options = {}) {
        super(options);
        this.name = 'jianshu';
        this.debug = true;
        this.start_urls = [
            'https://www.jianshu.com/',
        ];
        this.envs['SPLASH_SERVER'] = 'http://localhost:8050';
        this.envs['CAPTURE_STORE'] = 'output';
    }

    *parse(response) {
        for (let ele of response.css('div.content')) {
            yield* response.capture_all(response.css('a.title', ele), {
                render_all: 0,
                wait: 0,
                viewport: '1200x2000',
            });
        }
    }

}

module.exports = JianshuSpider;
```