const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'ru'
    },
    verification: {
        type: Object,
        default: {
            using: false,
            channel_id: null,
            filters: {
                edit_type: 0,// (0 - none, 1- edits only, 2 - edits & posts)
                edits: 0,
                role_type: 0,// (0 - none, 1- one role, 2 - all roles)
                roles: []
            },
            add_roles: [],
            remove_roles: [],
            newMember_roles: []
        }
    },
    colors: {
        type: Object,
        default: {
            embed_1: '#fa005a',
            embed_2: '#ffc500'
        }
    },
    main_wiki: {
        type: Object,
        default: {
            sitename: 'Community Central',
            base: 'https://community.fandom.com/wiki/Community_Central',
            domain: 'community.fandom.com',
            lang: 'en'
        }
    },
    wikies: {
        type: Array,
        default: [
            { sitename: 'Вики сообщества', domain: 'community.fandom.com/ru' },
            { sitename: 'Oxygen Not Included Вики', domain: 'oxygen-not-included.fandom.com/ru' },
            { sitename: 'Disco Elysium Вики', domain: 'disco-elysium.fandom.com/ru' }
        ]
    },
    wiki_log: {
        type: Array,
        default: [
            {
                id: 0,
                simple: false,
                domain: '',
                rcid: '0',
                webhook: {
                    id: '',
                    token: ''
                },
                channel_id: ''
            }
        ]
    }
});

module.exports = mongoose.model('Guild', guildSchema);