// Загружаем библиотеки
require('dotenv').config();
const Discord = require('discord.js');

// Создаём клиент бота
const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_WEBHOOKS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
client.login(process.env.BOT_TOKEN);