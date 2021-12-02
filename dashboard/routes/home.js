const router = require('express').Router();

const { isLogged } = require('../utils/functions');
const { guilds } = require('../../bot/bot');
const botGuilds = guilds.cache;

router.get('/', isLogged, (req, res) => {
    res.render('home', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        botGuilds,
        clientId: process.env.DASHBOARD_CLIENT_ID,
        redirectUri: process.env.DASHBOARD_CALLBACK_URL,
    });
});

module.exports = router;