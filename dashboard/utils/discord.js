const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../../schemas/User');

passport.serializeUser((user, done) => {
    console.log(1);
    done(null, user.discord_id)
});
passport.deserializeUser(async (discord_id, done) => {
    console.log(2);
    try {
        const user = await User.findOne({ discord_id });
        return user ? done(null, user) : done(null, null);
    } catch(err) {
        console.log(err);
        done(err, null);
    }
});

passport.use(
    new DiscordStrategy({
        clientID: process.env.DASHBOARD_CLIENT_ID,
        clientSecret: process.env.DASHBOARD_CLIENT_SECRET,
        callbackURL: process.env.DASHBOARD_CALLBACK_URL,
        scope: ['identify', 'guilds'],
    }, async (accessToken, refreshToken, profile, done) => {
        console.log(3);
        try {
            const { id, username, discriminator, avatar, guilds } = profile;
            console.log(profile);
            const findUser = await User.findOneAndUpdate({ discord_id: id }, {
                discord_tag: `${username}#${discriminator}`,
                avatar,
                guilds,
            }, { new: true });
            if(findUser) {
                return done(null, findUser);
            } else {
                const newUser = await User.create({
                    discord_id: id,
                    discord_tag: `${username}#${discriminator}`,
                    avatar,
                    guilds,
                });
                return done(null, newUser);
            }
        } catch(err) {
            console.log(err);
            return done(err, null);
        }
    })
);