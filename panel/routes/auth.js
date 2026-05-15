// panel/routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/discord', passport.authenticate('discord', { 
    scope: ['identify', 'guilds'] 
}));

router.get('/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/dashboard')
);

module.exports = router;