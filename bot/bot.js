require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Discord JS
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_WEBHOOKS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
client.login(process.env.BOT_TOKEN);

// Events
fs.readdir(path.join(__dirname, 'events'), (err, items) => {
    console.log('Events list:');

    if(err) return console.error;
    items.forEach(item => {
        console.log(chalk.green(' | ' + item));

        if(!item.endsWith('.js')) return;
        const event = require(path.join(__dirname, `events/${item}`));
        let eventName = item.split('.')[0];
        client.on(eventName, event.bind(null, client));
    });
});

module.exports = client;