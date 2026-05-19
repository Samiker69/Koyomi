const express = require('express');
const path = require('path');
const { requireAuth } = require('../middlewares/auth');
const router = express.Router();

router.get('/', (req, res) => req.user ? res.redirect('/dashboard') : res.redirect('/login'));

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../htmls', 'login.html'));
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

router.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get('/server/:serverId', requireAuth, (req, res) => {
    res.render('server-info.ejs', { serverId: req.params.serverId });
});

router.get('/server/:serverId/members', requireAuth, (req, res) => {
    res.render('server-members', { serverId: req.params.serverId });
});

module.exports = router;