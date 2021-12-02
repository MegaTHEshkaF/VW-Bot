const Discord = require('discord.js');
const got = require('got');
const localization = require('../utils/localization');
const getEmoji = require('../utils/emoji');
const langFlag = require('../utils/langFlag');

module.exports = {
    callback: async (client, interaction, guildDoc) => {
        await interaction.deferReply();

        function localize(name) { return localization(guildDoc.language, name); }
        function emoji(name) { return getEmoji(client, name); }

        // Options values
        const wikiValue = interaction.options.getString('wiki');
        const domainValue = interaction.options.getString('domain');

        const domain = wikiValue ? wikiValue : domainValue ? domainValue : guildDoc.main_wiki.domain;

        try {
            var gotWiki = await got(`https://${domain}/api.php?action=query&meta=siteinfo&siprop=general|statistics&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query; });
            const wikiGeneral = gotWiki.general;
            const wikiStatistic = gotWiki.statistics;

            gotWiki = await got(`https://${domain}/api.php?action=query&titles=${gotWiki.general.mainpage}&prop=revisions&rvprop=timestamp&rvlimit=1&rvdir=newer&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query; });
            
            // Timestamp
            const time = gotWiki.pages[Object.keys(gotWiki.pages)[0]].revisions[0].timestamp;
            const timestamp = Number.isInteger(Date.parse(time)) ? `<t:${Date.parse(time) / 1000}:R>` : time;

            const Embed = new Discord.MessageEmbed()
            .setTitle(`${emoji('fandomflame')} ${wikiGeneral.sitename}`).setURL(guildDoc.main_wiki.href)                                   // Sitename
            .setURL(wikiGeneral.base)
            .setThumbnail(`https://${domain}/wiki/Special:FilePath/Wiki-wordmark.png?width=200`)                                           // Logo
            .addField(localize('WIKIINFO_LANGUAGE'), langFlag(wikiGeneral.lang), true)                                                     // Language
            .addField(localize('WIKIINFO_CREATION_DATE'), timestamp, true)                                                                     // Date
            .addField(localize('WIKIINFO_PAGES'), `${wikiStatistic.pages}`, true)                                                          // Pages
            .addField(localize('WIKIINFO_ARTICLES'), `[${wikiStatistic.articles}](https://${domain}/wiki/Special:AllPages)`, true)         // Articles
            .addField(localize('WIKIINFO_EDITS'), `[${wikiStatistic.edits}](https://${domain}/wiki/Special:RecentChanges)`, true)          // Edits
            .addField(localize('WIKIINFO_FILES'), `[${wikiStatistic.images}](https://${domain}/wiki/Special:NewFiles)`, true)              // Files
            .addField(localize('WIKIINFO_ACTIVE_USERS'), `[${wikiStatistic.activeusers}](https://${domain}/wiki/Special:ListUsers)`, true) // Active users
            .addField(localize('WIKIINFO_ADMINS'), `[${wikiStatistic.admins}](https://${domain}/wiki/Special:ListUsers?group=sysop)`, true)// Admins
            .setFooter(domain)                                                                                                             // Domain
            .setColor(guildDoc.colors.embed_2);                                                                                            // Embed color
    
            await interaction.editReply({ content: `https://${domain}/wiki/Special:Statistics`, embeds: [Embed] });
        } catch(err) {
            // console.log(err);
            await interaction.editReply({ content: localize('WIKIINFO_ERROR'), ephemeral: true });
        }
    }
}