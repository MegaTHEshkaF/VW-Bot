const { debug_mode } = require('../../config.json');
const Guild = require('../../schemas/Guild');

module.exports = async (client, message) => {
    if(message.channel.type === 'dm' || message.author.bot) return;
    
    // Debug commands
    if(debug_mode == true) {
        // Emit guildCreate
        if(message.content == 'test') {
            client.emit("guildMemberAdd", message.member);

            return message.reply('Done!');
        }
    }
}