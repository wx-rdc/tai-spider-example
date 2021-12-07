const Item = require('tai-spider').Item;

module.exports = new Item({
    metadata: {
        title: '',
        author: '',
        pubdate: '',
        url: '',
        spider: '',
        fetchtime: '',
    },
    images: [{
        src: '',
        comment: '',
    }],
    name: 'h3.author-title',
    birthdate: {
        value: '.author-born-date',
        type: 'date',
    },
    bio: '.author-description',
});
