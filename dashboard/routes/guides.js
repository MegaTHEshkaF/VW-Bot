const router = require('express').Router();
const { isLogged } = require('../utils/functions');

router.get('/', (req, res) => {
    res.redirect('/guides/verification-guide')
});

router.get('/verification-guide', isLogged, (req, res) => {
    const guild = req.user ? req.user.guilds.find(guild => guild.id === req.params.id) : null;
    res.render('verification-guide', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        guild,
    });
});

module.exports = router;