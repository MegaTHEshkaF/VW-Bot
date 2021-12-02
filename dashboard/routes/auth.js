const router = require('express').Router();
const passport = require('passport');

router.get('/', passport.authenticate('discord'));

router.get('/redirect', passport.authenticate('discord'), (req, res) => {
    res.redirect(301, '/dashboard');
});

module.exports = router;