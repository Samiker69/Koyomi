const express = require('express');
const session = require('express-session');
const passport = require('passport');

// Поддержка пакета discord-strategy
const DiscordStrategy = require('discord-strategy').Strategy || require('discord-strategy');

const path = require('path');
const { DataTypes } = require('sequelize');
const { sequelize, AdminUser } = require('../utils/db/models');

const { CACHE_ADMINS } = require('./middlewares/auth');

// IPC
const BotIPCClient = require('./ipc-client');
const botIPC = new BotIPCClient('localhost', process.env.WS_PORT || 8765);

// Роуты
const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');
const geminiRoutes = require('./routes/gemini');

function startPanel() {
    // 1. Инициализация БД для админов
    (async () => {
        try {
            await AdminUser.sync();
            for (const admin of CACHE_ADMINS) {
                await AdminUser.findOrCreate({
                    where: { user_id: admin.id },
                    defaults: { username: admin.username }
                });
            }
            console.log('[INFO] Admin panel DB checked/initialized');
        } catch (error) {
            console.error('[ERROR] Failed to initialize panel DB:', error);
        }
    })();

    // 2. Инициализация связи с ботом
    botIPC.connect().catch(() => console.log('[WARN]: Discord bot not available via IPC, using mock data'));
    botIPC.on('disconnected', () => console.log('[WARN]: Lost connection to Discord bot, attempting reconnect...'));
    botIPC.on('connected', () => console.log('[INFO]: Connected to Discord bot via WS'));

    const app = express();
    const PORT = process.env.PORT || 6969;

    // 3. Настройка Express
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'htmls')); 

    app.use(session({
        secret: process.env.ENCRYPTION_KEY || 'fallback-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }
    }));

    // 4. Настройка Passport Discord
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new DiscordStrategy({
        clientID: process.env.clientId,
        clientSecret: process.env.clientSecret,
        callbackURL: process.env.redirectUrl + '/auth/discord/callback',
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        profile.accessToken = accessToken;
        return done(null, profile);
    }));

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    // 5. Подключение маршрутов
    app.use('/auth', authRoutes);
    app.use('/', pagesRoutes);
    
    // Передаем BotIPC клиент в маршруты, где он нужен
    app.use('/api', apiRoutes(botIPC));
    app.use('/', geminiRoutes(botIPC));

    // 6. Запуск сервера
    app.listen(PORT, () => {
        console.log(`[INFO] Admin panel running on http://localhost:${PORT}`);
        console.log(`[INFO] Login at: http://localhost:${PORT}/login`);
    });
}

module.exports = { startPanel };