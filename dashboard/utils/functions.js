// If user is logged in
function isLogged(req, res, next) {
    if(req.user) {
        console.log('Авторизирован');
        req.isLogged = true;
    }
    next();
}

// If user is logged in, but redirect
function isAuthorized(req, res, next) {
    if(req.user) {
        // console.log('Авторизирован');
        req.isLogged = true;
        next();
    }
    else {
        // console.log('Не авторизирован');
        res.redirect('/');
    }
}

module.exports = { isLogged, isAuthorized };