const Guild = require('../../schemas/Guild');

module.exports = async (client, interaction) => {
    // Slash commands
    if(interaction.isCommand()) {
        const guildDoc = await Guild.findOne({ _id: interaction.guildId });
        const command = require(`../commands/${interaction.commandName}`)
        command.callback(client, interaction, guildDoc);
    }

    // Buttons
}