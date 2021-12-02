const Guild = require('../../schemas/Guild');
const chalk = require('chalk');

module.exports = async (client, guild) => {
    // Check if guild doc exists
    await Guild.findOne({ _id: guild.id })
    ?  console.log(chalk.green(` | ${guild.name}: checked!`))
    : guildCreate();

    // Create new guild doc
    async function guildCreate() {
        const doc = new Guild({
            _id: guild.id,
        });
        await doc.save();
        return console.log('Added to the new guild - ' + guild.name);
    }
}