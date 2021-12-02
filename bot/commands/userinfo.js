const Discord = require('discord.js');
const got = require('got');
const localization = require('../utils/localization');
const getEmoji = require('../utils/emoji');

module.exports = {
    callback: async (client, interaction, guildDoc) => {
        await interaction.deferReply();

        function localize(name) { return localization(guildDoc.language, name); }
        function emoji(name) { return getEmoji(client, name); }

        // Options values
        const usernameValue = interaction.options.getString('username');
        const wikiValue = interaction.options.getString('wiki');
        const domainValue = interaction.options.getString('domain');

        const domain = wikiValue ? wikiValue : domainValue ? domainValue : guildDoc.main_wiki.domain;
        
        try {
            // User id
            const gotId = await got(`https://${domain}/api.php?action=query&list=users&ususers=${encodeURI(usernameValue.replace(/\s/g, '+'))}&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query.users[0].userid; });
            if(!gotId) throw new Error('No user id!');

            const gotUser = await got(`https://${domain}/wikia.php?controller=UserProfile&method=getUserData&userId=${gotId}&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.userData; });

            const Embed = new Discord.MessageEmbed()
            .setURL(gotUser.userPage)         // Page
            .setThumbnail(gotUser.avatar)     // Avatar
            .setColor(guildDoc.colors.embed_1)// Embed color
            .setFooter(domain);               // Domain

            const { bio, registration, edits, localEdits, posts, twitter, fbPage, discordHandle, website, tags, username, name } = gotUser;

            const timestamp = Number.isInteger(Date.parse(registration)) ? `<t:${Date.parse(registration) / 1000}:R>` : registration;

            if(name)          Embed.setTitle(`${emoji('fandomflame')} **${username}** aka ${name}`); else Embed.setTitle(`${emoji('fandomflame')} ${username}`);                        // Nickname
            if(bio)           Embed.setDescription(`**${localize('USERINFO_BIO')}:** ${bio}`);                                                                                          // Description
            if(registration)  Embed.addField(`${localize('USERINFO_REGISTRATION')}`, timestamp, true); else Embed.setAuthor(localize('USERINFO_NO_REGISTRATION'));    // Is a user on a wiki
            if(edits)         Embed.addField(localize('USERINFO_EDITS'), `${edits}`, true);                                                                                             // Global edits
            if(localEdits)    Embed.addField(localize('USERINFO_LOCAL_EDITS'), `[${localEdits}](https://${domain}/Special:Contributions/${username} "Contributions")`, true);           // Local edits
            if(posts)         Embed.addField(localize('USERINFO_POSTS'), `[${posts}](https://${domain}/Special:UserProfileActivity/${username}?tab=posts "UserProfileActivity")`, true);// Posts
            if(twitter)       Embed.addField(`${emoji('twitter')} Twitter`, `[@${twitter}](https://twitter.com/${twitter})`, true);                                                     // Twitter
            if(fbPage)        Embed.addField(`${emoji('fb')} Facebook`, `[[Link]](${fbPage})`, true);                                                                                   // Facebook
            if(discordHandle) Embed.addField(`${emoji('discord')} Discord`, discordHandle, true);                                                                                       // Discord
            if(website)       Embed.addField(`:link: ${localize('USERINFO_WEBSITE')}`, `[[Link]](${website})`, true);                                                                   // Website
            if(tags[0])       Embed.addField(`${localize('USERINFO_TAGS')}`, tags.join(', '));                                                                                          // Tags

            await interaction.editReply({ embeds: [Embed] });
        } catch(err) {
            // console.log(err);
            await interaction.editReply({ content: localize('USERINFO_ERROR'), ephemeral: true });
        }
    }
}