const data = require('../data/emoji.json');

// Получение эмодзи с сервера
function getEmoji(client, name) {
    return client.emojis.cache.get(data[name]);
}

module.exports = getEmoji;