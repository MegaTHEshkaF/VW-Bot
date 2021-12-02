const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    discord_id: {
        type: String,
        required: true,
        unique: true,
    },
    discord_tag: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    guilds: {
        type: Array,
        required: true,
    }
});

module.exports = mongoose.model('User', UserSchema);