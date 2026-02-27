const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function (passport) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn('⚠️ Google OAuth credentials missing. Google Sign-In will not work.');
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Extract data with safety checks
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const name = profile.displayName || profile.name?.givenName || 'Google User';
                    const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

                    if (!email) {
                        console.error('Google OAuth Error:No email found in profile', profile);
                        return done(new Error('No email associated with this Google account'), null);
                    }

                    const newUser = {
                        googleId: profile.id,
                        name: name,
                        email: email,
                        avatar: avatar,
                    };

                    let user = await User.findOne({ email: email });

                    if (user) {
                        // Link account if not already linked
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            if (avatar) user.avatar = avatar;
                            await user.save();
                        }
                        return done(null, user);
                    } else {
                        // Create new user
                        user = await User.create(newUser);
                        return done(null, user);
                    }
                } catch (err) {
                    console.error('Passport Strategy Execution Error:', err);
                    return done(err, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
