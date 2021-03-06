require('dotenv').config();
const mongoose = require('mongoose');
const chalk = require('chalk');
const { debug_mode } = require('./config.json');

// MongoDB
mongoose.connect(process.env.MONGO_PATH, { useNewUrlParser: true, useUnifiedTopology: true, },
(err) => err
? console.log(chalk.red('VW-Bot: Error! Couldn\'t connect to MongoDB!\n' + err))
: console.log(chalk.green('VW-Bot: MongoDB is connected!')));

// bot -> bot.js
require('./bot/bot');
// dashboard -> app.js
require('./dashboard/app');

// Debug notification
if(debug_mode == true) console.log(chalk.yellow('Debug mode is active!'));