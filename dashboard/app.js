const path = require('path');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const Store = require('connect-mongo');
const flash = require('connect-flash');
require('./utils/discord');

const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Routes
const auth = require('./routes/auth');
const home = require('./routes/home');
const logout = require('./routes/logout');
const guides = require('./routes/guides');
const dashboard = require('./routes/dashboard');

app.use(session({
    secret: 'secret',
    cookie: {
        maxAge: 60000 * 60 * 3
    },
    resave: false,
    saveUninitialized: false,
    store: Store.create({ mongoUrl: mongoose.connection._connectionString }),
}));
app.use(flash());

// EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json());

// Middleware routes
app.use('/', home);
app.use('/auth', auth);
app.use('/logout', logout);
app.use('/guides', guides);
app.use('/dashboard', dashboard);

app.listen(PORT, () => console.log(`Port — ${PORT}`));