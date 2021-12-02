const Discord = require('discord.js');
const got = require('got');
const Guild = require('../../schemas/Guild');
const localization = require('../utils/localization');
const getEmoji = require('../utils/emoji');

// Wiki logging
module.exports = {
    run: (client, guild, guildDoc) => {
        function localize(name) { return localization(guildDoc.language, name); }
        function emoji(name) { return getEmoji(client, name); }

        guildDoc.wiki_log.forEach(async log => {
            try {
                const webhook = log.simple ? await client.fetchWebhook(log.webhook.wh_id, log.webhook.wh_token).catch(() => { return undefined; }) : null;
                if(log.simple && !webhook) return;
                const channel = !log.simple ? guild.channels.cache.find(c => c.id === log.channel_id) : null;
                if(!log.simple && !channel) return;

                var gotWiki = await got(`https://${log.domain}/api.php?action=query&list=recentchanges&rcnamespace=*&rclimit=1&rcprop=ids&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query.recentchanges[0]; });
                if(gotWiki.rcid <= log.rcid) return; //console.log('Нет новых правок');
                const rclimit = gotWiki.rcid - log.rcid + 1;

                gotWiki = await got(`https://${log.domain}/api.php?action=query&list=recentchanges&rcnamespace=*&rclimit=${rclimit}&rcprop=user|comment|title|ids|sizes|loginfo|timestamp&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query.recentchanges; });
                // console.log(gotWiki);
                await Guild.updateOne({ _id: guild.id, "wiki_log.domain": log.domain }, { "$set": { "wiki_log.$.rcid": gotWiki[0].rcid } });

                if(rclimit > 200) return;

                gotWiki.reverse();
                
                gotWiki.forEach((edit, editIndex) => {
                    if(edit.rcid <= log.rcid) gotWiki.splice(editIndex, 1);
                });

                gotWiki.forEach(edit => {
                    var size = '', diff = '', editType, color, iconURL;
                    if(edit.type == 'edit') {
                        size = edit.newlen - edit.oldlen;
                        if(size >= 0) size = `+${size}`;
                        if(Math.abs(edit.newlen - edit.oldlen) > 500) size = ` (**${size}**)`;
                        else size = ` (${size})`;

                        diff = ` ([${localize('WIKILOG_DIFF')}](<https://${log.domain}/index.php?title=${encodeURI(edit.title)}&diff=${log.revid}&oldid=${log.old_revid}>))`
                    }

                    // Edit type
                    if(edit.type == 'new') { editType = localize('WIKILOG_NEW'); color = '#43be2a' }// New
                    if(edit.type == 'log') {// Log
                        if(edit.logaction == 'delete') { editType = localize('WIKILOG_DELETE'); color = '#c82f2f'; iconURL = ''; }
                        if(edit.logaction == 'overwrite') { editType = localize('WIKILOG_OVERWRITE'); color = '#e18925'; }
                        if(edit.logaction == 'block') { editType = localize('WIKILOG_BLOCK'); color = '#7a1c1c'; }
                        if(edit.logaction == 'protect') { editType = localize('WIKILOG_PROTECT'); color = '#2f90c8'; }
                        if(edit.logaction == 'rights') { editType = localize('WIKILOG_RIGHTS'); color = '#2f62c8'; }
                        else { editType = localize('WIKILOG_LOAD'); color = '#902fc8'; }
                    }
                    if(edit.type == 'edit') { editType = localize('WIKILOG_EDIT'); color = '#e1b925' }// Edit

                    if(log.simple) {
                        var comment = edit.comment ? ` *(${edit.comment})*` : '';
                        // Webhook
                        webhook.send(`${localize('WIKILOG_USER')} [${edit.user}](<https://${log.domain}/User:${encodeURI(edit.user)}>) ${editType} [${edit.title}](<https://${log.domain}/${encodeURI(edit.title)}>)${size}${comment}${diff}`);
                    }
                    else {
                        // Embed
                        const Embed = new Discord.MessageEmbed()
                        .setAuthor(`${edit.user} ${editType}`, null, `https://${log.domain}/User:${encodeURI(edit.user)}`)
                        .setTitle(edit.title + size)
                        .setURL(`https://${log.domain}/${encodeURI(edit.title)}`)
                        .setTimestamp(edit.timestamp)
                        .setColor(color);

                        if(edit.type == 'edit') {
                            if(edit.comment) Embed.setDescription(`${localize('WIKILOG_COMMENT')}: *${edit.comment}*${diff}`);
                            else Embed.setDescription(diff);
                        }

                        channel.send({ embeds: [Embed] });
                    }
                });
            } catch(err) {
                console.log(err);
            }
        });
    }
}