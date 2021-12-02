const Discord = require('discord.js');
const got = require('got');
const localization = require('../utils/localization');
const getEmoji = require('../utils/emoji');
const { getRoles, checkRoles, addRoles, removeRoles } = require('../utils/roles');

module.exports = {
    callback: async (client, interaction, guildDoc) => {
        await interaction.deferReply();

        function localize(name) { return localization(guildDoc.language, name); }
        function emoji(name) { return getEmoji(client, name); }

        const ver = guildDoc.verification;
        if(!ver.using) return await interaction.editReply({ content: `${localize('VERIFICATION_ERROR3')}`, ephemeral: true });

        if(!ver.channel_id || interaction.channelId == ver.channel_id) {
            // Options values
            const usernameValue = interaction.options.getString('username');
            
            const domain = guildDoc.main_wiki.domain;

            try {
                // User id
                const gotId = await got(`https://${domain}/api.php?action=query&list=users&ususers=${encodeURI(usernameValue.replace(/\s/g, '+'))}&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query.users[0].userid; });
                if(!gotId) throw new Error('No user id!');

                const gotUser = await got(`https://${domain}/wikia.php?controller=UserProfile&method=getUserData&userId=${gotId}&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.userData; });

                const { username, name, avatar, discordHandle, registration, userPage, localEdits, posts, isBlocked, tags } = gotUser;

                const Embed = new Discord.MessageEmbed().setFooter(domain);
                if(name) Embed.setAuthor(`${username} aka ${name}`, avatar, userPage); else Embed.setAuthor(`${username}`, avatar, userPage);

                var reason = "";

                // Tags
                if(interaction.user.tag == discordHandle) { Embed.addField(`${emoji('success')} ${localize('VERIFICATION_TAGS')}`, `\`\`${interaction.user.tag}\`\` = \`\`${discordHandle}\`\``); }
                else {
                    if(!discordHandle) {
                        Embed.addField(`${emoji('failure')} ${localize('VERIFICATION_TAGS')}`, `\`\`${interaction.user.tag}\`\` ≠ \`\`???\`\``);
                        reason += localize('VERIFICATION_REASON1');
                    }
                    else {
                        Embed.addField(`${emoji('failure')} ${localize('VERIFICATION_TAGS')}`, `\`\`${interaction.user.tag}\`\` ≠ \`\`${discordHandle}\`\``);
                        reason += localize('VERIFICATION_REASON2');
                    }
                }

                const filters = ver.filters;

                // Edits
                if(filters.edit_type) {
                    const edits = (filters.edit_type == 1) ? localEdits : localEdits + posts;

                    if(filters.edit_type == 1) {
                        if(edits >= filters.edits) Embed.addField(`${emoji('success')} ${localize('VERIFICATION_EDITS')}`, `\`\`${localEdits}\`\` [${localize('VERIFICATION_LOCAL_EDITS')}](https://${domain}/Special:Contributions/${username} "Contributions") >= \`\`${filters.edits}\`\``);
                        else {
                            Embed.addField(`${emoji('failure')} ${localize('VERIFICATION_EDITS')}`, `\`\`${localEdits}\`\` [${localize('VERIFICATION_LOCAL_EDITS')}](https://${domain}/Special:Contributions/${username} "Contributions") < \`\`${filters.edits}\`\``);
                            reason += localize('VERIFICATION_REASON3');
                        }
                    }
                    else if(filters.edit_type == 2) {
                        if(edits >= filters.edits) Embed.addField(`${emoji('success')} ${localize('VERIFICATION_EDITS')}`, `\`\`${localEdits}\`\` [${localize('VERIFICATION_LOCAL_EDITS')}](https://${domain}/Special:Contributions/${username} "Contributions") + \`\`${posts}\`\` [${localize('VERIFICATION_POSTS')}](https://${domain}/Special:UserProfileActivity/${username}?tab=posts "UserProfileActivity") >= \`\`${filters.edits}\`\``);
                        else {
                            Embed.addField(`${emoji('failure')} ${localize('VERIFICATION_EDITS')}`, `\`\`${localEdits}\`\` [${localize('VERIFICATION_LOCAL_EDITS')}](https://${domain}/Special:Contributions/${username} "Contributions") + \`\`${posts}\`\` [${localize('VERIFICATION_POSTS')}](https://${domain}/Special:UserProfileActivity/${username}?tab=posts "UserProfileActivity") < \`\`${filters.edits}\`\``);
                            reason += localize('VERIFICATION_REASON4');
                        }
                    }
                }

                // Roles
                if(filters.role_type) {
                    const reqRoles = getRoles(interaction, filters.roles);

                    if(reqRoles[0]) {
                        const check = checkRoles(interaction, filters.roles);

                        if(check[0] == true) Embed.addField(`${emoji('success')} ${localize('VERIFICATION_ROLES')}`, reqRoles.join(', '));
                        else {
                            check[1] = getRoles(interaction, check[1]);
                            Embed.addField(`${emoji('failure')} ${localize('VERIFICATION_ROLES')}`, check[1].join(', '));
                            reason += localize('VERIFICATION_REASON5');
                        }
                    }
                }

                // Timestamp
                const timestamp = Number.isInteger(Date.parse(registration)) ? `<t:${Date.parse(registration) / 1000}:R>` : registration;
                if(registration) Embed.addField(localize('VERIFICATION_REGISTRATION'), timestamp); else Embed.addField(localize('VERIFICATION_REGISTRATION'), localize('VERIFICATION_NO_REGISTRATION'));

                if(!reason) {
                    // Block
                    if(isBlocked == true || tags[0] == 'Blocked' || tags[0] == 'Заблокирован(а)') {
                        Embed.setDescription(localize('VERIFICATION_REASON6')).setColor('#CC902C');
                    }
                    else Embed.setColor('#00b050');

                    if(ver.add_roles[0]) addRoles(interaction, ver.add_roles[0]);
                    if(ver.remove_roles[0]) removeRoles(interaction, ver.remove_roles[0]);
                }
                else {
                    Embed.setDescription(reason).setColor('#ee2222');
                }
                
                await interaction.editReply({ embeds: [Embed] });
            } catch(err) {
                console.log(err);
                await interaction.editReply({ content: localize('VERIFICATION_ERROR2'), ephemeral: true });
            }
        }
        else await interaction.editReply({ content: `${localize('VERIFICATION_ERROR1')} <#${ver.channel_id}>`, ephemeral: true });
    }
}