'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

async function run() {
    await client.index({
        index: 'game-of-thrones',
        id: 'Ned Stark',
        body: {
            character: 'Ned Stark',
            quote: 'Winter is coming.'
        }
    })

    await client.index({
        index: 'game-of-thrones',
        id: 'Arya Stark',
        body: {
            character: 'Arya Stark',
            quote: 'A girl is Arya Stark of Winterfell. And I\'m going home.'
        }
    })

    const { body } = await client.search({
        index: 'game-of-thrones',
        body: {
            query: { match_all: {} }
        }
    })

    console.log(body.hits.hits)
}

async function getMapping() {
    await client.indices.putMapping({
        index: 'game-of-thrones',
        body: {
            properties: {
                character: {
                    type: "text",
                    fields: {
                        keyword: {
                            type: "keyword",
                            "ignore_above": 256,
                        }
                    }
                }
            }
        }
    })

    const { body } = await client.indices.getMapping({
        index: 'game-of-thrones',
    })

    console.log(JSON.stringify(body['game-of-thrones'].mappings))
}

async function getSetting() {
    await client.indices.putSettings({
        index: 'game-of-thrones',
        body: {
            "number_of_replicas": 0
        }
    })

    const { body } = await client.indices.getSettings({
        index: 'game-of-thrones',
    })

    console.log(JSON.stringify(body['game-of-thrones'].settings))
}

async function createIndex() {
    const { body: exists } = await client.indices.exists({
        index: 'game-of-thrones',
    })

    if (exists) {
        await clean();
    }

    const { body } = await client.indices.create({
        index: 'game-of-thrones',
        body: {
            settings: {
                "number_of_replicas": 0
            }
        }
    })

    console.log(body);
}

async function putTemplate() {
    const { body } = await client.indices.putTemplate({
        name: 'tai-template',
        body: {
            template: "tai-*",
            settings: {
                "number_of_replicas": 0
            }
        }
    })

    console.log(body);
}

async function tai_run() {
    await client.index({
        index: 'tai-thrones',
        id: 'Ned Stark',
        body: {
            character: 'Ned Stark',
            quote: 'Winter is coming.'
        }
    })

    const { body } = await client.cat.indices({
        format: "json"
    });

    console.log(body)
}

async function search() {
    const { body } = await client.search({
        index: 'game-of-thrones',
        body: {
            query: {
                match_all: {
                }
            }
        }
    })

    console.log(body.hits.hits)
}

async function upsert() {

    await client.updateByQuery({
        index: 'game-of-thrones',
        refresh: true,
        body: {
            script: {
                lang: 'painless',
                source: 'ctx._source = params.doc',
                params: {
                    doc: {
                        character: 'Jim Stark',
                        quote: 'A boy is Jim Stark of Winterfell. And I\'m going home.'
                    },
                },
            },
            query: {
                match: {
                    'character.keyword': 'Jim Stark'
                }
            },
        }
    })

    const { body } = await client.search({
        index: 'game-of-thrones',
        body: {
            query: {
                match: {
                    'character.keyword': 'Jim Stark'
                }
            }
        }
    })

    console.log(body.hits.hits)
}

async function clean() {
    const { body } = await client.indices.delete({
        index: 'tai-article',
    });

    console.log(body)
}

async function list() {
    const { body } = await client.cat.indices({
        format: "json"
    });

    console.log(body)
}

clean().catch(console.log)