const router = require('express').Router();
const got = require('got');
const Guild = require('../../schemas/Guild');

const { guilds } = require('../../bot/bot');
const botGuilds = guilds.cache;

const { isAuthorized } = require('../utils/functions');

const client = require('../../bot/bot');
const { getRoles } = require('../../bot/utils/roles');
const commands = require('../../bot/utils/commands');

// Check if user is a manager or admin in guild
function isManager(req, res, next) {
    let botGuild = botGuilds.get(req.params.id);
    req.user.guilds.forEach(guild => {
        if(guild.id == req.params.id && ((guild.permissions & 0x0000000008) == 0x0000000008 || (guild.permissions & 0x0000000020) == 0x0000000020)) manager = true;
    });
    if(manager && botGuild) {
        // console.log('Участник может управлять сервером');
        next();
    }
    else {
        // console.log('Участник не может управлять сервером или сервер не найден');
        res.redirect('/dashboard');
    }
}

// Servers list
router.get('/', isAuthorized, (req, res) => {
    // console.log(req.user);
    res.render('dashboard', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        botGuilds,
    });
});

// General
router.get('/:id/general', isAuthorized, isManager, async (req, res) => {
    const guildDoc = await Guild.findOne({ _id: req.params.id });
    res.render('general', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        botGuilds, // Добавить меню выбора вики
        guildDoc,
        domain: guildDoc.main_wiki.domain,
        status: req.flash('status'),
        guild: req.user.guilds.find(guild => guild.id === req.params.id),
    });
});
router.post('/:id/general', isAuthorized, isManager, async (req, res) => {
    // console.log(req.body);
    const guildDoc = await Guild.findOne({ _id: req.params.id });
    const guild = client.guilds.cache.find(guild => guild.id === req.params.id);
    const { language, domain } = req.body;

    try {
        const gotWiki = await got(`https://${domain}/api.php?action=query&meta=siteinfo&siprop=general|statistics&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query; });
        const wikiGeneral = gotWiki.general;

        await Guild.updateOne({ _id: req.params.id }, { "$set": {
            "language": language,
            "main_wiki.sitename": wikiGeneral.sitename,
            "main_wiki.base": wikiGeneral.base,
            "main_wiki.domain": domain,
            "main_wiki.lang": wikiGeneral.lang,
        } });

        commands.run(language, guild, guildDoc.wikies);

        req.flash('status', 'success');
        res.redirect('back');
    } catch(err) {
        console.log(err);

        req.flash('status', 'error');

        res.render('general', {
            isLoggedIn: req.isLogged,
            userDoc: req.user,
            botGuilds, // Добавить меню выбора вики
            guildDoc,
            domain,
            status: req.flash('status'),
            guild: req.user.guilds.find(guild => guild.id === req.params.id),
        });
    }
});

// Verification
router.get('/:id/verification', isAuthorized, isManager, async (req, res) => {
    //console.log(.channels.cache);
    const guildDoc = await Guild.findOne({ _id: req.params.id });
    const guild = client.guilds.cache.find(guild => guild.id === req.params.id);

    const channels = [];
    var i = 0;
    guild.channels.cache.forEach(channel => {
        if(channel.type != 'GUILD_TEXT') return;
        channels[i] = {
            name: channel.name,
            id: channel.id,
        };
        i++;
    });

    const roles = [];
    guild.roles.cache.forEach(role => {
        roles[role.position] = {
            name: role.name,
            id: role.id,
        }
    });
    roles.shift();
    roles.reverse();

    var botMaxRolePosition;
    for(var i = 0; i < roles.length; i++) {
        if(guild.me.roles.cache.has(roles[i].id)) {
            botMaxRolePosition = i;
            break;
        }
    }
    const botRoles = roles.slice(botMaxRolePosition + 1, roles.length);

    // const botRoles = 
    const filterRoles = getRoles(guild, guildDoc.verification.filters.roles).map(role => {
        const obj = {
            name: role.name,
            id: role.id,
        };
        return obj;
    });
    const newMemberRoles = getRoles(guild, guildDoc.verification.newMember_roles).map(role => {
        const obj = {
            name: role.name,
            id: role.id,
        };
        return obj;
    });
    const addRoles = getRoles(guild, guildDoc.verification.add_roles).map(role => {
        const obj = {
            name: role.name,
            id: role.id,
        };
        return obj;
    });
    const removeRoles = getRoles(guild, guildDoc.verification.remove_roles).map(role => {
        const obj = {
            name: role.name,
            id: role.id,
        };
        return obj;
    });
    
    // console.log(filterRoles);
    res.render('verification', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        botGuilds, // Добавить меню выбора вики
        guildDoc,
        ver: guildDoc.verification,
        channels,
        roles,
        botRoles,
        filterRoles,
        newMemberRoles,
        addRoles,
        removeRoles,
        status: req.flash('status'),
        guild,
    });
});
router.post('/:id/verification', isAuthorized, isManager, async (req, res) => {
    // console.log(req.body);
    const { channel_id, edit_type, edits, role_type } = req.body;
    const using = (req.body.using) ? true : false;

    const roles = Array.isArray(req.body.roles) ? req.body.roles : req.body.roles ? [req.body.roles] : [];
    const newMember_roles = Array.isArray(req.body.newMemberRoles) ? req.body.newMemberRoles : req.body.newMemberRoles ? [req.body.newMemberRoles] : [];
    const add_roles = Array.isArray(req.body.addRoles) ? req.body.addRoles : req.body.addRoles ? [req.body.addRoles] : [];
    const remove_roles = Array.isArray(req.body.removeRoles) ? req.body.removeRoles : req.body.removeRoles ? [req.body.removeRoles] : [];
    console.log(roles);

    try {
        await Guild.updateOne({ _id: req.params.id }, { "$set": {
            "verification": {
                using,
                channel_id,
                filters: {
                    edit_type,
                    edits,
                    role_type,
                    roles,
                },
                newMember_roles,
                add_roles,
                remove_roles,
            },
        } });

        req.flash('status', 'success');
        res.redirect('back');
    } catch(err) {
        console.log(err);

        req.flash('status', 'error');
        res.redirect('back');
    }
});

// Wiki-logs
router.get('/:id/wiki-logs', isAuthorized, isManager, async (req, res) => {
    //console.log(.channels.cache);
    const guildDoc = await Guild.findOne({ _id: req.params.id });
    const guild = client.guilds.cache.find(guild => guild.id === req.params.id);

    const channels = [];
    var i = 0;
    guild.channels.cache.forEach(channel => {
        if(channel.type != 'GUILD_TEXT') return;
        channels[i] = {
            name: channel.name,
            id: channel.id,
        };
        i++;
    });

    res.render('wiki-logs', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        botGuilds, // Добавить меню выбора вики
        guildDoc,
        channels,
        domain: guildDoc.wiki_log[0].domain,
        wl: guildDoc.wiki_log[0],
        status: req.flash('status'),
        guild,
    });
});
router.post('/:id/wiki-logs', isAuthorized, isManager, async (req, res) => {
    // console.log(req.body);
    const guildDoc = await Guild.findOne({ _id: req.params.id });
    const guild = client.guilds.cache.find(guild => guild.id === req.params.id);
    const { domain, channel_id } = req.body;
    const simple = (req.body.simple) ? true : false;

    const channels = [];
    var i = 0;
    guild.channels.cache.forEach(channel => {
        if(channel.type != 'GUILD_TEXT') return;
        channels[i] = {
            name: channel.name,
            id: channel.id,
        };
        i++;
    });

    try {
        await got(`https://${domain}/api.php?action=query&meta=siteinfo&siprop=general|statistics&format=json`).then(response => { const responseData = JSON.parse(response.body); return responseData.query; });

        // Webhook
        var webhook;
        try {
            webhook = await client.fetchWebhook(guildDoc.wiki_log[0].webhook.id, guildDoc.wiki_log[0].webhook.token);
            webhook.edit({
                name: domain,
                channel: channel_id,
            });
        } catch(err) {
            console.log(err);

            const channel = guild.channels.cache.find(c => c.id === channel_id);
            webhook = await channel.createWebhook(domain, {
                avatar: './dashboard/public/images/logo-mini.png',
            });
        }

        await Guild.updateOne({ _id: req.params.id, "wiki_log.id": 0 }, { "$set": {
            "wiki_log.$.simple": simple,
            "wiki_log.$.domain": domain,
            "wiki_log.$.channel_id": channel_id,
            "wiki_log.$.webhook": {
                id: webhook.id,
                token: webhook.token,
            },
        } });

        req.flash('status', 'success');
        res.redirect('back');
    } catch(err) {
        console.log(err);

        req.flash('status', 'error');

        res.render('wiki-logs', {
            isLoggedIn: req.isLogged,
            userDoc: req.user,
            botGuilds, // Добавить меню выбора вики
            guildDoc,
            domain,
            channels,
            wl: guildDoc.wiki_log[0],
            status: req.flash('status'),
            guild,
        });
    }
});

module.exports = router;