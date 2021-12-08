'use strict';

const { Client } = require('@elastic/elasticsearch')
const eshelper = require('../utils/es-helper')

class ElasticSearchPipeline {

    open_spider(spider) {
        let es_server = spider.envs['ES_SERVER'];
        if (!es_server) {
            spider.log.error('You must set ES_SERVER first!')
            process.exit(1)
        }
        this.client = new Client({ node: es_server })
        eshelper.putTemplate(this.client, {
            settings: {
                "number_of_replicas": 0
            }
        })
    }

    async process_item(item, spider, request) {
        const { index_name, ...body } = item;
        const reqKey = request.reqKey;

        if (index_name) {
            if (reqKey) {
                await this.client.index({
                    index: index_name,
                    id: reqKey,
                    body: {
                        _spider_name: spider.name,
                        ...body
                    },
                })
            } else {
                await this.client.index({
                    index: index_name,
                    body: {
                        _spider_name: spider.name,
                        ...body
                    },
                })
            }
        }
        return item;
    }
}

module.exports = ElasticSearchPipeline;