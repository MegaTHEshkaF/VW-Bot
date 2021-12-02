const router = require('express').Router();

const { isLogged } = require('../utils/functions');
const { guilds } = require('../../bot/bot');
const botGuilds = guilds.cache;

router.get('/', isLogged, (req, res) => {
    res.render('home', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        botGuilds,
    });
});

module.exports = router;