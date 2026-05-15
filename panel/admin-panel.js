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


// Создание таблиц если их нет
db.exec(`
    CREATE TABLE IF NOT EXISTS mod_cases (
        serverId TEXT NOT NULL,
        caseNum INTEGER NOT NULL,
        targetId TEXT NOT NULL,
        moderatorId TEXT NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('ban', 'mute', 'kick', 'unban', 'unmute', 'warn', 'unwarn')),
        reason TEXT,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY (serverId, caseNum)
    );

    CREATE TABLE IF NOT EXISTS gemini_user_settings (
        user_id TEXT NOT NULL PRIMARY KEY,
        model TEXT DEFAULT "gemini-2.0-flash",
        system_instructions TEXT DEFAULT "",
        max_output_tokens INTEGER DEFAULT 1000,
        temperature REAL DEFAULT 1.0,
        top_p REAL DEFAULT NULL,
        top_k INTEGER DEFAULT NULL,
        history_limit INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS gemini_safety_settings (
        user_id TEXT NOT NULL PRIMARY KEY,
        HARM_CATEGORY_HARASSMENT TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
        HARM_CATEGORY_HATE_SPEECH TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
        HARM_CATEGORY_SEXUALLY_EXPLICIT TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
        HARM_CATEGORY_DANGEROUS_CONTENT TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
        FOREIGN KEY (user_id) REFERENCES gemini_user_settings(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        public_use INTEGER DEFAULT 0,
        uses INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_punishment (
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        negative_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
        user_id TEXT NOT NULL PRIMARY KEY,
        username TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Список админов (можешь добавить свой ID)
const CACHE_ADMINS = [{ id: "691246997646213131", username: "samiker"}];

// Добавляем админов в БД если их там нет
const insertAdmin = db.prepare('INSERT OR IGNORE INTO admin_users (user_id, username) VALUES (?, ?)');
CACHE_ADMINS.forEach(({id, username}) => insertAdmin.run(id, username));

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
    if (CACHE_ADMINS.some(admin => admin.id === req.user.id)) {
        next();
    } else {
        const isAdmin = db.prepare('SELECT * FROM admin_users WHERE user_id = ?').get(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ status: 403, message: "You are not an admin" });
        }
        next();
    }
};

// Middleware для проверки Gemini доступа
const requireGeminiAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    
    const hasGeminiSettings = db.prepare('SELECT * FROM gemini_user_settings WHERE user_id = ?').get(req.user.id);
    if (!hasGeminiSettings) {
        return res.status(403).json({ status: 403, message: "You are not in the database. Use /ai add-apikey to access." });
    }
    
    next();
};

// Подключение к Discord боту через WS
const BotIPCClient = require('./ipc-client');
const botIPC = new BotIPCClient('localhost', 8765);
const GeminiDB = require('../utils/db/gemini_settings');

// Пытаемся подключиться к боту
botIPC.connect().catch(error => {
    console.log('[WARN]: Discord bot not available via IPC, using mock data');
});

// Переподключение при разрыве связи
botIPC.on('disconnected', () => {
    console.log('[WARN]: Lost connection to Discord bot, attempting reconnect...');
});

botIPC.on('connected', () => {
    console.log('[INFO]: Connected to Discord bot via WS');
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
            success: true,
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
/**
 * @deprecated
 */
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

app.post('/api/server/:serverId/members/:userId', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const userId = req.params.userId;
    const { action, reason, duration, roleId, type } = req.body;
    
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
                result = await botIPC.banMember(serverId, userId, reason);
                break;

            case 'mute':
                result = await botIPC.muteMember(serverId, userId, reason, duration);
                break;
            
            case 'unban':
                result = await botIPC.unbanMember(serverId, userId, reason);
                break;

            case 'role': 
                result = await botIPC.roleAction(serverId, userId, roleId, type);
                break;

            default:
                return res.status(400).json({ error: 'Unknown action' });
        }

        if (action === 'role') {
            res.json({ success: true, ...result });
        } else {
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
        }
    } catch (error) {
        console.error('Error executing action:', error);
        res.status(500).json({ error: error.message });
    }
})

app.get('/api/server/:serverId/roles', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;

    try {
        const roles = await botIPC.getGuildRoles(serverId)
        res.json(roles);
    } catch (error) {
        console.error('Error getting server roles:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/server/:serverId/members/:userId', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const userId = req.params.userId;

    try {
        const member = await botIPC.getMember(serverId, userId)
        res.json(member);
    } catch (error) {
        console.error('Error getting member info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/server/:serverId/channels/:channelId', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const channelId = req.params.channelId;
    const {
        action,
        name,
        avatar
    } = req.body;

    try {
        const data = await botIPC.channelAction(serverId, channelId, { action, name, avatar });
        res.json(data)
    } catch (error) {
        console.error('Error executing action:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

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

app.get('/api/server/:serverId/channels', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const useCache = req.query.cache === 'true';

    try {
        if (botIPC.connected) {
            let channels;
            
            if (useCache) {
                // Получаем из кэша
                channels = await botIPC.getCache('channels', null, serverId);
                if (!channels || channels.length === 0) {
                    channels = await botIPC.getServerChannels(serverId);
                    console.log(`📦➡️🔄 Cache miss, fallback to Discord API`);
                }
                console.log(`📦 Serving channels from cache for server ${serverId}`);
            } else {
                // Получаем через Discord API
                channels = await botIPC.getServerChannels(serverId);
                console.log(`🔄 Fetching channels from Discord API for server ${serverId}`);
            }
            
            res.json({ 
                data: channels || [],
                source: useCache ? 'cache' : 'api',
            });
        } else {
            res.status(503).json({ error: 'Bot not available' });
        }
    } catch (error) {
        console.error('Error getting server channels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/server/:serverId/channel/:channelId/messages', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    const channelId = req.params.channelId;
    const useCache = req.query.cache === 'true';

    try {
        if (botIPC.connected) {
            let messages;
            
            if (useCache) {
                messages = await botIPC.getCache('messages', channelId);
                if (!messages || messages.length === 0) {
                    messages = await botIPC.getChannelMessages(serverId, channelId);
                    console.log(`📦➡️🔄 Cache miss, fallback to Discord API`);
                }
                console.log(`📦 Serving messages from cache for server ${serverId}`);
            } else {
                // Получаем через Discord API
                messages = await botIPC.getChannelMessages(serverId, channelId);
                console.log(`🔄 Fetching messages from Discord API for channel ${channelId}`);
            }
            messages.messages = messages.messages.sort((a, b) => a.timestamp - b.timestamp);
            
            res.json({
                data: messages || [],
                source: useCache ? 'cache' : 'api',
            });
        } else {
            res.status(503).json({ error: 'Bot not available' });
        }
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Дополнительный эндпоинт для получения только кэша
app.get('/api/cache/channels/:serverId', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;

    try {
        if (botIPC.connected) {
            const channels = await botIPC.getCache('channels', null, serverId);
            res.json({
                cached: true,
                data: channels || [],
                timestamp: Date.now()
            });
        } else {
            res.status(503).json({ error: 'Bot not available' });
        }
    } catch (error) {
        console.error('Error getting cached channels:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/cache/messages/:channelId', requireAuth, async (req, res) => {
    const channelId = req.params.channelId;

    try {
        if (botIPC.connected) {
            const messages = await botIPC.getCache('messages', channelId);
            res.json({
                cached: true,
                data: messages || [],
                timestamp: Date.now()
            });
        } else {
            res.status(503).json({ error: 'Bot not available' });
        }
    } catch (error) {
        console.error('Error getting cached messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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