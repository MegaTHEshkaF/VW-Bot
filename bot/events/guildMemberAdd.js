const Discord = require('discord.js');
const localization = require('../utils/localization');
const getEmoji = require('../utils/emoji');
const { getRoles, addRoles } = require('../utils/roles');
const Guild = require('../../schemas/Guild');

module.exports = async (client, member) => {
    if(member.user.bot) return;

    function localize(name) { return localization(guildDoc.language, name); }
    function emoji(name) { return getEmoji(client, name); }

    const guildDoc = await Guild.findOne({ _id: member.guild.id });
    const ver = guildDoc.verification;

    // Add roles to new member
    if(ver.newMember_roles[0]) { const event = { member }; addRoles(event, ver.newMember_roles[0]); }

    // Check for verification channel
    const channel = member.guild.channels.cache.find(c => c.id === ver.channel_id);
    if(!channel || !ver.using) return;

    const Embed = new Discord.MessageEmbed().setDescription(`**${localize('NEWMEMBER_DESCRIPTION')}** \`\`\`/verification\`\`\``);
    
    const filters = ver.filters;

    if(filters.edit_type) Embed.addField(`${emoji('edits')} ${localize('NEWMEMBER_EDITS')}`, `\`\`${filters.edits}\`\` ${localize('NEWMEMBER_EDITS_DESCRIPTION')}`, true);
    if(filters.role_type) {
        const reqRoles = getRoles(member, filters.roles);
        if(reqRoles[0]) Embed.addField(`${emoji('role')} ${localize('NEWMEMBER_REQUIRED_ROLES')}`, reqRoles.join(', '), true);
    }

    const row = new Discord.MessageActionRow()
    .addComponents(
        new Discord.MessageButton()
        .setLabel(localize('NEWMEMBER_BUTTON_GUIDE'))
        .setURL('https://discordjs.guide/interactions/buttons.html#building-and-sending-buttons')
        .setStyle('LINK'),
    );

    channel.send({ content: `<@${member.user.id}>`, embeds: [Embed], components: [row] });
}