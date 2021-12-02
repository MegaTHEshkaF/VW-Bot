const router = require('express').Router();

router.get('/', (req, res) => {
    req.logOut();
    res.status(200).clearCookie('connect.sid', {
            path: '/',
            secure: false,
            httpOnly: false,
            domain: req.hostname,
            sameSite: true,
        });
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
});

module.exports = router;