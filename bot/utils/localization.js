const data = require('../data/localization.json');

function localization(lang, name) {
    return data[name][lang];
}

module.exports = localization;