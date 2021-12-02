const flags = {// ru, pl, es, pt...  имеют идентичные флаги
    en: 'us',
    ja: 'jp',
    uk: 'ua',
    cs: 'cz'
}

// Преобразование языка вики во флаг
function langFlag(lang) {
    if(flags.hasOwnProperty(lang)) return `:flag_${flags[lang]}:`;
    else return `:flag_${lang}:`;
}

module.exports = langFlag;