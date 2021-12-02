const router = require('express').Router();
const passport = require('passport');

router.get('/', passport.authenticate('discord'));

router.get('/redirect', passport.authenticate('discord'), (req, res) => {
    console.log(4);
    res.redirect(301, '/dashboard');
});

module.exports = router;