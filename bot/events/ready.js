const Guild = require('../../schemas/Guild');
const commands = require('../utils/commands');
const wikiLog = require('../utils/wikiLog');
const chalk = require('chalk');

module.exports = async client => {
    // Check on missing guild docs
    client.guilds.cache.forEach(guild => {
        client.emit("guildCreate", guild);
    });

    // Slash commands
    // Wait before all docs are checked
    setTimeout(async () => {
        console.log(chalk.green('Command builder starts!'));
        await client.guilds.cache.forEach(async guild => {
            const guildDoc = await Guild.findOne({ _id: guild.id });
            commands.run(guildDoc.language, guild, guildDoc.wikies);
        });
    }, 1000 * 3);

    // Wiki-logs
    setInterval(async function() {
        await client.guilds.cache.forEach(async guild => {
            const guildDoc = await Guild.findOne({ _id: guild.id });
            if(!guildDoc.wiki_log[0]) return;
            wikiLog.run(client, guild, guildDoc);
        });
    }, 1000 * 60);

    // Set status
    client.user.setActivity('дела участников', { type: 'WATCHING' });
    setInterval(function() { client.user.setActivity('дела участников', { type: 'WATCHING' }); }, 1000 * 60 * 60);
}