const router = require('express').Router();
const { isLogged } = require('../utils/functions');

router.get('/', (req, res) => {
    res.redirect('/guides/verification-guide')
});

router.get('/verification-guide', isLogged, (req, res) => {
    res.render('verification-guide', {
        isLoggedIn: req.isLogged,
        userDoc: req.user,
        guild: req.user.guilds.find(guild => guild.id === req.params.id),
    });
});

module.exports = router;