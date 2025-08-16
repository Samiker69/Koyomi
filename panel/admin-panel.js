const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 6969;

// Инициализация базы данных
if (!fs.existsSync('../database')) {
    fs.mkdirSync('../database');
}

const db = new Database('../database/main.db');

// Список админов (можешь добавить свой ID)
const ADMIN_IDS = ['691246997646213131'];

// Добавляем админов в БД если их там нет
const insertAdmin = db.prepare('INSERT OR IGNORE INTO admin_users (user_id, username) VALUES (?, ?)');
ADMIN_IDS.forEach(id => insertAdmin.run(id, null));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'htmls')); 

app.use(session({
    secret: process.env.ENCRYPTION_KEY || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 часа
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Discord Strategy
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

// Middleware для проверки админ прав
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    const isAdmin = db.prepare('SELECT * FROM admin_users WHERE user_id = ?').get(req.user.id);
    if (!isAdmin) {
        return res.status(403).json({ status: 403, message: "forbidden" });
    }
    
    next();
};

// Middleware для проверки Gemini доступа
const requireGeminiAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: 401, message: "unauthorized" });
    }
    
    const hasGeminiSettings = db.prepare('SELECT * FROM gemini_user_settings WHERE user_id = ?').get(req.user.id);
    if (!hasGeminiSettings) {
        return res.status(403).json({ status: 403, message: "forbidden" });
    }
    
    next();
};

// Подключение к Discord боту через IPC
const BotIPCClient = require('./ipc-client');
const GeminiDB = require('../functions/db/gemini_settings');
const botIPC = new BotIPCClient();

// Пытаемся подключиться к боту
botIPC.connect().catch(error => {
    console.log('[WARN]: Discord bot not available via IPC, using mock data');
});

// Переподключение при разрыве связи
botIPC.on('disconnected', () => {
    console.log('[WARN]: Lost connection to Discord bot, attempting reconnect...');
});

botIPC.on('connected', () => {
    console.log('[INFO]: Connected to Discord bot via IPC');
});

// Routes
app.get('/', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'htmls', 'login.html'));
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', {
        user: req.user
    });
});

// API Routes
app.get('/api/stats', requireAuth, (req, res) => {
    try {
        const totalCases = db.prepare('SELECT COUNT(*) as count FROM mod_cases').get().count;
        const totalTokens = db.prepare('SELECT COUNT(*) as count FROM tokens').get().count;
        const totalPunishments = db.prepare('SELECT COUNT(*) as count FROM user_punishment').get().count;
        const totalServers = db.prepare('SELECT COUNT(DISTINCT serverId) as count FROM mod_cases').get().count;

        res.json({
            totalServers,
            totalCases,
            totalTokens,
            totalPunishments
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/guilds', requireAuth, async (req, res) => {
    try {
        if (botIPC.connected) {
            const guilds = await botIPC.getGuilds();
            res.json(guilds);
        } else {
            // Fallback к mock данным если бот недоступен
            const mockGuilds = [
                {
                    id: '123456789012345678',
                    name: 'Test Server (Mock)',
                    iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png',
                    memberCount: 100
                }
            ];
            res.json(mockGuilds);
        }
    } catch (error) {
        console.error('Error fetching guilds:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/server/:serverId', requireAuth, (req, res) => {
    const serverId = req.params.serverId;
    
    res.render('server-info.ejs', {
        serverId: serverId
    });
});

// API для статистики сервера
app.get('/api/server/:serverId/stats', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    
    try {
        const totalCases = db.prepare('SELECT COUNT(*) as count FROM mod_cases WHERE serverId = ?').get(serverId).count;
        const totalPunishments = db.prepare('SELECT COUNT(*) as count FROM user_punishment WHERE guild_id = ?').get(serverId).count;
        const bansCount = db.prepare('SELECT COUNT(*) as count FROM mod_cases WHERE serverId = ? AND action = \'ban\'').get(serverId).count;
        const warnsCount = db.prepare('SELECT COUNT(*) as count FROM mod_cases WHERE serverId = ? AND action = \'warn\'').get(serverId).count;

        let serverName = `Server ${serverId}`;
        
        // Получаем название сервера от бота если возможно
        if (botIPC.connected) {
            try {
                const guildInfo = await botIPC.getGuildInfo(serverId);
                serverName = guildInfo.name;
            } catch (error) {
                console.error('Error getting guild info:', error);
            }
        }

        res.json({
            serverName,
            totalCases,
            totalPunishments,
            bansCount,
            warnsCount
        });
    } catch (error) {
        console.error('Error getting server stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для получения кейсов сервера
app.get('/api/server/:serverId/cases', requireAuth, (req, res) => {
    const serverId = req.params.serverId;
    const limit = parseInt(req.query.limit) || 50;
    
    try {
        const cases = db.prepare('SELECT * FROM mod_cases WHERE serverId = ? ORDER BY timestamp DESC LIMIT ?').all(serverId, limit);
        res.json(cases);
    } catch (error) {
        console.error('Error getting server cases:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для экспорта данных сервера
app.get('/api/server/:serverId/export', requireAuth, (req, res) => {
    const serverId = req.params.serverId;
    
    try {
        const cases = db.prepare('SELECT * FROM mod_cases WHERE serverId = ?').all(serverId);
        const punishments = db.prepare('SELECT * FROM user_punishment WHERE guild_id = ?').all(serverId);
        
        const exportData = {
            serverId,
            exportDate: new Date().toISOString(),
            cases,
            punishments
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="server_${serverId}_data.json"`);
        res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        console.error('Error exporting server data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для очистки данных сервера
app.delete('/api/server/:serverId/clear', requireAuth, (req, res) => {
    const serverId = req.params.serverId;
    
    try {
        const deleteCases = db.prepare('DELETE FROM mod_cases WHERE serverId = ?');
        const deletePunishments = db.prepare('DELETE FROM user_punishment WHERE guild_id = ?');
        
        const casesDeleted = deleteCases.run(serverId).changes;
        const punishmentsDeleted = deletePunishments.run(serverId).changes;
        
        res.json({ 
            success: true, 
            deletedCases: casesDeleted, 
            deletedPunishments: punishmentsDeleted 
        });
    } catch (error) {
        console.error('Error clearing server data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Настройки Gemini
app.get('/gemini-settings', requireGeminiAccess, (req, res) => {
    const userId = req.user.id;
    
    try {
        const userSettings = db.prepare('SELECT * FROM gemini_user_settings WHERE user_id = ?').get(userId);
        const safetySettings = db.prepare('SELECT * FROM gemini_safety_settings WHERE user_id = ?').get(userId);
        
        res.render('gemini-settings', { 
            userSettings: userSettings,
            safetySettings: safetySettings 
        });
    } catch (error) {
        console.error('Error loading Gemini settings:', error);
        res.status(500).send('Ошибка загрузки настроек');
    }
});

app.get('/api/gemini/models', requireGeminiAccess, async (req, res) => {
    const userId = req.user.id;
    const tokens = new GeminiDB('../database/main.db').getAllUserTokens(userId);
    
    try {
        res.send(Object.fromEntries(await botIPC.getGeminiModels(tokens[0][0])));
    } catch (error) {
        console.log(error)
        res.status(500).send("Ошибка получения моделей");
    }
})

// API для сохранения настроек Gemini
app.post('/api/gemini/user-settings', requireGeminiAccess, (req, res) => {
    const userId = req.user.id;
    const {
        model,
        system_instructions,
        max_output_tokens,
        temperature,
        top_p,
        top_k,
        history_limit
    } = req.body;

    try {
        const upsertSettings = db.prepare(`
            INSERT INTO gemini_user_settings 
            (user_id, model, system_instructions, max_output_tokens, temperature, top_p, top_k, history_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                model = EXCLUDED.model,
                system_instructions = EXCLUDED.system_instructions,
                max_output_tokens = EXCLUDED.max_output_tokens,
                temperature = EXCLUDED.temperature,
                top_p = EXCLUDED.top_p,
                top_k = EXCLUDED.top_k,
                history_limit = EXCLUDED.history_limit;
        `);

        upsertSettings.run(
            userId,
            model,
            system_instructions,
            parseInt(max_output_tokens),
            parseFloat(temperature),
            top_p ? parseFloat(top_p) : null,
            top_k ? parseInt(top_k) : null,
            parseInt(history_limit)
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/gemini/safety-settings', requireGeminiAccess, (req, res) => {
    const userId = req.user.id;
    const {
        HARM_CATEGORY_HARASSMENT,
        HARM_CATEGORY_HATE_SPEECH,
        HARM_CATEGORY_SEXUALLY_EXPLICIT,
        HARM_CATEGORY_DANGEROUS_CONTENT
    } = req.body;

    try {
        const upsertSafetySettings = db.prepare(`
            INSERT OR REPLACE INTO gemini_safety_settings 
            (user_id, HARM_CATEGORY_HARASSMENT, HARM_CATEGORY_HATE_SPEECH, HARM_CATEGORY_SEXUALLY_EXPLICIT, HARM_CATEGORY_DANGEROUS_CONTENT)
            VALUES (?, ?, ?, ?, ?)
        `);

        upsertSafetySettings.run(
            userId,
            HARM_CATEGORY_HARASSMENT,
            HARM_CATEGORY_HATE_SPEECH,
            HARM_CATEGORY_SEXUALLY_EXPLICIT,
            HARM_CATEGORY_DANGEROUS_CONTENT
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving safety settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для получения участников сервера
app.get('/api/server/:serverId/members', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const limit = parseInt(req.query.limit) || 100;
    
    try {
        if (botIPC.connected) {
            const members = await botIPC.getGuildMembers(serverId, limit);
            res.json(members);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error getting guild members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для получения подробной информации о сервере
app.get('/api/server/:serverId/info', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    
    try {
        if (botIPC.connected) {
            const guildInfo = await botIPC.getGuildInfo(serverId);
            res.json(guildInfo);
        } else {
            res.status(503).json({ error: 'Bot not available' });
        }
    } catch (error) {
        console.error('Error getting guild info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API для выполнения действий модерации
app.post('/api/server/:serverId/action', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const { action, userId, reason, extra } = req.body;
    
    if (!botIPC.connected) {
        return res.status(503).json({ error: 'Bot not available' });
    }
    
    try {
        let result;
        
        switch (action) {
            case 'kick':
                result = await botIPC.kickMember(serverId, userId, reason);
                break;
            
            case 'ban':
                result = await botIPC.banMember(serverId, userId, reason, extra?.deleteMessageDays);
                break;
            
            case 'unban':
                result = await botIPC.unbanMember(serverId, userId, reason);
                break;
            
            default:
                return res.status(400).json({ error: 'Unknown action' });
        }
        
        // Записываем действие в базу данных
        const caseNum = (db.prepare('SELECT MAX(caseNum) as maxCase FROM mod_cases WHERE serverId = ?').get(serverId)?.maxCase || 0) + 1;
        
        db.prepare(`
            INSERT INTO mod_cases (serverId, caseNum, targetId, moderatorId, action, reason, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            serverId,
            caseNum,
            userId,
            req.user.id,
            action,
            reason,
            Date.now()
        );
        
        res.json({ success: true, caseNum, ...result });
    } catch (error) {
        console.error('Error executing action:', error);
        res.status(500).json({ error: error.message });
    }
});

// API для отправки сообщений от имени бота
app.post('/api/server/:serverId/message', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const { channelId, content, embed } = req.body;
    
    if (!botIPC.connected) {
        return res.status(503).json({ error: 'Bot not available' });
    }
    
    try {
        const result = await botIPC.sendMessage(serverId, channelId, content, embed);
        res.json(result);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});
// Страница управления участниками
app.get('/server/:serverId/members', requireAuth, (req, res) => {
    const serverId = req.params.serverId;
    
    res.render('server-members', {
        serverId: serverId
    })
});

// API для общей статистики бота
app.get('/api/bot-stats', requireAuth, async (req, res) => {
    try {
        if (botIPC.connected) {
            const botStats = await botIPC.getBotStats();
            res.json(botStats);
        } else {
            res.status(503).json({ error: 'Bot not available' });
        }
    } catch (error) {
        console.error('Error getting bot stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`[INFO] Admin panel running on http://localhost:${PORT}`);
    console.log(`[INFO] Login at: http://localhost:${PORT}/login`);
});