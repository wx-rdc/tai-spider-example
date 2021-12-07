'use strict'

exports.putTemplate = async (client, opts) => {
    const { body } = await client.indices.putTemplate({
        name: 'tai-template',
        body: {
            template: "tai-*",
            ...opts,
        }
    })
    return body.acknowledged;
}