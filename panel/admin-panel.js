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
const ADMIN_IDS = ['691246997646213131'];

// Добавляем админов в БД если их там нет
const insertAdmin = db.prepare('INSERT OR IGNORE INTO admin_users (user_id, username) VALUES (?, ?)');
ADMIN_IDS.forEach(id => insertAdmin.run(id, null));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Discord Bot Admin Panel - Login</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px;
                    background: #2c2f33;
                    color: #fff;
                }
                .login-container {
                    background: #36393f;
                    padding: 30px;
                    border-radius: 10px;
                    display: inline-block;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
                .discord-btn {
                    background: #7289da;
                    color: white;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 16px;
                    display: inline-block;
                    transition: background 0.3s;
                }
                .discord-btn:hover { background: #677bc4; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>Discord Bot Admin Panel</h1>
                <p>Войдите через Discord для доступа к панели администратора</p>
                <a href="/auth/discord" class="discord-btn">Войти через Discord</a>
            </div>
        </body>
        </html>
    `);
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
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Discord Bot Admin Panel</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    background: #2c2f33;
                    color: #fff;
                }
                .header {
                    background: #36393f;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .user-info { display: flex; align-items: center; gap: 10px; }
                .avatar { width: 40px; height: 40px; border-radius: 50%; }
                .logout-btn { 
                    background: #f04747; 
                    color: white; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 5px; 
                    text-decoration: none;
                }
                .section {
                    background: #36393f;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                .btn {
                    background: #7289da;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    text-decoration: none;
                    display: inline-block;
                    margin: 5px;
                    cursor: pointer;
                }
                .btn:hover { background: #677bc4; }
                .servers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .server-card {
                    background: #40444b;
                    padding: 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .server-card:hover { background: #484c52; }
                .server-info { display: flex; align-items: center; gap: 15px; }
                .server-avatar { width: 50px; height: 50px; border-radius: 50%; }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }
                .stat-card {
                    background: #40444b;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-number { font-size: 24px; font-weight: bold; color: #7289da; }
                .loading { text-align: center; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Discord Bot Admin Panel</h1>
                <div class="user-info">
                    <img src="${req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="Avatar" class="avatar">
                    <span>${req.user.username}#${req.user.discriminator}</span>
                    <a href="/logout" class="logout-btn">Выйти</a>
                </div>
            </div>

            <div class="section">
                <h2>Общая статистика</h2>
                <div id="general-stats" class="stats-grid">
                    <div class="loading">Загрузка статистики...</div>
                </div>
            </div>

            <div class="section">
                <h2>Управление</h2>
                <a href="/gemini-settings" class="btn">Настройки Gemini</a>
                <button onclick="loadServers()" class="btn">Обновить список серверов</button>
            </div>

            <div class="section">
                <h2>Серверы бота</h2>
                <div id="servers-container" class="servers-grid">
                    <div class="loading">Загрузка серверов...</div>
                </div>
            </div>

            <script>
                async function loadStats() {
                    try {
                        const response = await fetch('/api/stats');
                        const stats = await response.json();
                        
                        document.getElementById('general-stats').innerHTML = \`
                            <div class="stat-card">
                                <div class="stat-number">\${stats.totalServers}</div>
                                <div>Всего серверов</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">\${stats.totalCases}</div>
                                <div>Всего кейсов модерации</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">\${stats.totalTokens}</div>
                                <div>Всего токенов</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">\${stats.totalPunishments}</div>
                                <div>Всего наказаний</div>
                            </div>
                        \`;
                    } catch (error) {
                        console.error('Error loading stats:', error);
                        document.getElementById('general-stats').innerHTML = '<div>Ошибка загрузки статистики</div>';
                    }
                }

                async function loadServers() {
                    try {
                        const response = await fetch('/api/guilds');
                        const guilds = await response.json();
                        
                        if (guilds.length === 0) {
                            document.getElementById('servers-container').innerHTML = '<div>Серверов не найдено</div>';
                            return;
                        }
                        
                        const serversHtml = guilds.map(guild => \`
                            <div class="server-card" onclick="selectServer('\${guild.id}')">
                                <div class="server-info">
                                    <img src="\${guild.iconURL || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="Server Icon" class="server-avatar">
                                    <div>
                                        <h3>\${guild.name}</h3>
                                        <p>ID: \${guild.id}</p>
                                        <p>Участников: \${guild.memberCount || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        \`).join('');
                        
                        document.getElementById('servers-container').innerHTML = serversHtml;
                    } catch (error) {
                        console.error('Error loading servers:', error);
                        document.getElementById('servers-container').innerHTML = '<div>Ошибка загрузки серверов</div>';
                    }
                }

                function selectServer(serverId) {
                    window.location.href = \`/server/\${serverId}\`;
                }

                // Загружаем данные при загрузке страницы
                loadStats();
                loadServers();
            </script>
        </body>
        </html>
    `);
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
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Управление сервером - Discord Bot Admin Panel</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    background: #2c2f33;
                    color: #fff;
                }
                .header {
                    background: #36393f;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .back-btn { 
                    background: #7289da; 
                    color: white; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 5px; 
                    text-decoration: none;
                }
                .section {
                    background: #36393f;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .stat-card {
                    background: #40444b;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-number { font-size: 24px; font-weight: bold; color: #7289da; }
                .btn {
                    background: #7289da;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    margin: 5px;
                    cursor: pointer;
                }
                .btn:hover { background: #677bc4; }
                .btn.danger { background: #f04747; }
                .btn.danger:hover { background: #d73838; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #40444b; }
                th { background: #40444b; }
                .loading { text-align: center; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Управление сервером: <span id="server-name">Загрузка...</span></h1>
                <a href="/dashboard" class="back-btn">← Назад к панели</a>
            </div>

            <div class="section">
                <h2>Статистика сервера</h2>
                <div id="server-stats" class="stats-grid">
                    <div class="loading">Загрузка статистики...</div>
                </div>
            </div>

            <div class="section">
                <h2>Действия</h2>
                <button onclick="refreshStats()" class="btn">Обновить статистику</button>
                <button onclick="exportData()" class="btn">Экспорт данных</button>
                <button onclick="clearData()" class="btn danger">Очистить данные сервера</button>
            </div>

            <div class="section">
                <h2>Последние кейсы модерации</h2>
                <div id="recent-cases">
                    <div class="loading">Загрузка кейсов...</div>
                </div>
            </div>

            <script>
                const serverId = '${serverId}';

                async function loadServerStats() {
                    try {
                        const response = await fetch(\`/api/server/\${serverId}/stats\`);
                        const stats = await response.json();
                        
                        document.getElementById('server-name').textContent = stats.serverName || serverId;
                        document.getElementById('server-stats').innerHTML = \`
                            <div class="stat-card">
                                <div class="stat-number">\${stats.totalCases}</div>
                                <div>Всего кейсов</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">\${stats.totalPunishments}</div>
                                <div>Активные наказания</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">\${stats.bansCount}</div>
                                <div>Банов</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">\${stats.warnsCount}</div>
                                <div>Предупреждений</div>
                            </div>
                        \`;
                    } catch (error) {
                        console.error('Error loading server stats:', error);
                        document.getElementById('server-stats').innerHTML = '<div>Ошибка загрузки статистики</div>';
                    }
                }

                async function loadRecentCases() {
                    try {
                        const response = await fetch(\`/api/server/\${serverId}/cases?limit=10\`);
                        const cases = await response.json();
                        
                        if (cases.length === 0) {
                            document.getElementById('recent-cases').innerHTML = '<p>Кейсов не найдено</p>';
                            return;
                        }
                        
                        let tableHtml = \`
                            <table>
                                <thead>
                                    <tr>
                                        <th>Кейс #</th>
                                        <th>Действие</th>
                                        <th>Цель</th>
                                        <th>Модератор</th>
                                        <th>Причина</th>
                                        <th>Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                        \`;
                        
                        cases.forEach(case_ => {
                            const date = new Date(case_.timestamp).toLocaleString();
                            tableHtml += \`
                                <tr>
                                    <td>\${case_.caseNum}</td>
                                    <td>\${case_.action}</td>
                                    <td>\${case_.targetId}</td>
                                    <td>\${case_.moderatorId}</td>
                                    <td>\${case_.reason || 'Не указана'}</td>
                                    <td>\${date}</td>
                                </tr>
                            \`;
                        });
                        
                        tableHtml += '</tbody></table>';
                        document.getElementById('recent-cases').innerHTML = tableHtml;
                    } catch (error) {
                        console.error('Error loading cases:', error);
                        document.getElementById('recent-cases').innerHTML = '<div>Ошибка загрузки кейсов</div>';
                    }
                }

                function refreshStats() {
                    loadServerStats();
                    loadRecentCases();
                }

                async function exportData() {
                    try {
                        const response = await fetch(\`/api/server/\${serverId}/export\`);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = \`server_\${serverId}_data.json\`;
                        a.click();
                    } catch (error) {
                        alert('Ошибка экспорта данных');
                    }
                }

                async function clearData() {
                    if (!confirm('Вы уверены? Это действие удалит ВСЕ данные сервера!')) return;
                    
                    try {
                        const response = await fetch(\`/api/server/\${serverId}/clear\`, { method: 'DELETE' });
                        if (response.ok) {
                            alert('Данные сервера очищены');
                            refreshStats();
                        } else {
                            alert('Ошибка очистки данных');
                        }
                    } catch (error) {
                        alert('Ошибка очистки данных');
                    }
                }

                // Загружаем данные при загрузке страницы
                loadServerStats();
                loadRecentCases();
            </script>
        </body>
        </html>
    `);
});

// API для статистики сервера
app.get('/api/server/:serverId/stats', requireAuth, async (req, res) => {
    const serverId = req.params.serverId;
    
    try {
        const totalCases = db.prepare('SELECT COUNT(*) as count FROM mod_cases WHERE serverId = ?').get(serverId).count;
        const totalPunishments = db.prepare('SELECT COUNT(*) as count FROM user_punishment WHERE guild_id = ?').get(serverId).count;
        const bansCount = db.prepare('SELECT COUNT(*) as count FROM mod_cases WHERE serverId = ? AND action = "ban"').get(serverId).count;
        const warnsCount = db.prepare('SELECT COUNT(*) as count FROM mod_cases WHERE serverId = ? AND action = "warn"').get(serverId).count;

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
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Настройки Gemini - Discord Bot Admin Panel</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px;
                        background: #2c2f33;
                        color: #fff;
                    }
                    .header {
                        background: #36393f;
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .back-btn { 
                        background: #7289da; 
                        color: white; 
                        padding: 10px 20px; 
                        border: none; 
                        border-radius: 5px; 
                        text-decoration: none;
                    }
                    .section {
                        background: #36393f;
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }
                    .form-group {
                        margin-bottom: 15px;
                    }
                    .form-group label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: bold;
                    }
                    .form-group input, .form-group select, .form-group textarea {
                        width: 100%;
                        padding: 10px;
                        border: none;
                        border-radius: 5px;
                        background: #40444b;
                        color: #fff;
                        font-size: 14px;
                    }
                    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                        outline: 2px solid #7289da;
                    }
                    .btn {
                        background: #7289da;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .btn:hover { background: #677bc4; }
                    .btn.success { background: #43b581; }
                    .btn.success:hover { background: #3ca374; }
                    .settings-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    @media (max-width: 768px) {
                        .settings-grid { grid-template-columns: 1fr; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Настройки Gemini</h1>
                    <a href="/dashboard" class="back-btn">← Назад к панели</a>
                </div>

                <div class="settings-grid">
                    <div class="section">
                        <h2>Основные настройки</h2>
                        <form id="user-settings-form">
                            <div class="form-group">
                                <label for="model">Модель:</label>
                                <select id="model" name="model">
                                    <option value="gemini-2.0-flash" ${userSettings?.model === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash</option>
                                    <option value="gemini-1.5-pro" ${userSettings?.model === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro</option>
                                    <option value="gemini-1.5-flash" ${userSettings?.model === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="max_output_tokens">Максимум токенов вывода:</label>
                                <input type="number" id="max_output_tokens" name="max_output_tokens" 
                                       value="${userSettings?.max_output_tokens || 1000}" min="1" max="8192">
                            </div>
                            
                            <div class="form-group">
                                <label for="temperature">Temperature (0.0-2.0):</label>
                                <input type="number" id="temperature" name="temperature" 
                                       value="${userSettings?.temperature || 1.0}" min="0" max="2" step="0.1">
                            </div>
                            
                            <div class="form-group">
                                <label for="top_p">Top P (опционально):</label>
                                <input type="number" id="top_p" name="top_p" 
                                       value="${userSettings?.top_p || ''}" min="0" max="1" step="0.1" placeholder="Оставьте пустым для автоматического">
                            </div>
                            
                            <div class="form-group">
                                <label for="top_k">Top K (опционально):</label>
                                <input type="number" id="top_k" name="top_k" 
                                       value="${userSettings?.top_k || ''}" min="1" placeholder="Оставьте пустым для автоматического">
                            </div>
                            
                            <div class="form-group">
                                <label for="history_limit">Лимит истории:</label>
                                <input type="number" id="history_limit" name="history_limit" 
                                       value="${userSettings?.history_limit || 100}" min="1" max="1000">
                            </div>
                            
                            <div class="form-group">
                                <label for="system_instructions">Системные инструкции:</label>
                                <textarea id="system_instructions" name="system_instructions" rows="4" 
                                          placeholder="Введите системные инструкции для ИИ...">${userSettings?.system_instructions || ''}</textarea>
                            </div>
                            
                            <button type="submit" class="btn success">Сохранить основные настройки</button>
                        </form>
                    </div>

                    <div class="section">
                        <h2>Настройки безопасности</h2>
                        <form id="safety-settings-form">
                            <div class="form-group">
                                <label for="harassment">Домогательства:</label>
                                <select id="harassment" name="HARM_CATEGORY_HARASSMENT">
                                    <option value="BLOCK_NONE" ${safetySettings?.HARM_CATEGORY_HARASSMENT === 'BLOCK_NONE' ? 'selected' : ''}>Не блокировать</option>
                                    <option value="BLOCK_ONLY_HIGH" ${safetySettings?.HARM_CATEGORY_HARASSMENT === 'BLOCK_ONLY_HIGH' ? 'selected' : ''}>Блокировать высокий уровень</option>
                                    <option value="BLOCK_MEDIUM_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_HARASSMENT === 'BLOCK_MEDIUM_AND_ABOVE' || !safetySettings ? 'selected' : ''}>Блокировать средний и выше</option>
                                    <option value="BLOCK_LOW_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_HARASSMENT === 'BLOCK_LOW_AND_ABOVE' ? 'selected' : ''}>Блокировать низкий и выше</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="hate_speech">Язык вражды:</label>
                                <select id="hate_speech" name="HARM_CATEGORY_HATE_SPEECH">
                                    <option value="BLOCK_NONE" ${safetySettings?.HARM_CATEGORY_HATE_SPEECH === 'BLOCK_NONE' ? 'selected' : ''}>Не блокировать</option>
                                    <option value="BLOCK_ONLY_HIGH" ${safetySettings?.HARM_CATEGORY_HATE_SPEECH === 'BLOCK_ONLY_HIGH' ? 'selected' : ''}>Блокировать высокий уровень</option>
                                    <option value="BLOCK_MEDIUM_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_HATE_SPEECH === 'BLOCK_MEDIUM_AND_ABOVE' || !safetySettings ? 'selected' : ''}>Блокировать средний и выше</option>
                                    <option value="BLOCK_LOW_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_HATE_SPEECH === 'BLOCK_LOW_AND_ABOVE' ? 'selected' : ''}>Блокировать низкий и выше</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="sexually_explicit">Сексуальный контент:</label>
                                <select id="sexually_explicit" name="HARM_CATEGORY_SEXUALLY_EXPLICIT">
                                    <option value="BLOCK_NONE" ${safetySettings?.HARM_CATEGORY_SEXUALLY_EXPLICIT === 'BLOCK_NONE' ? 'selected' : ''}>Не блокировать</option>
                                    <option value="BLOCK_ONLY_HIGH" ${safetySettings?.HARM_CATEGORY_SEXUALLY_EXPLICIT === 'BLOCK_ONLY_HIGH' ? 'selected' : ''}>Блокировать высокий уровень</option>
                                    <option value="BLOCK_MEDIUM_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_SEXUALLY_EXPLICIT === 'BLOCK_MEDIUM_AND_ABOVE' || !safetySettings ? 'selected' : ''}>Блокировать средний и выше</option>
                                    <option value="BLOCK_LOW_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_SEXUALLY_EXPLICIT === 'BLOCK_LOW_AND_ABOVE' ? 'selected' : ''}>Блокировать низкий и выше</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="dangerous_content">Опасный контент:</label>
                                <select id="dangerous_content" name="HARM_CATEGORY_DANGEROUS_CONTENT">
                                    <option value="BLOCK_NONE" ${safetySettings?.HARM_CATEGORY_DANGEROUS_CONTENT === 'BLOCK_NONE' ? 'selected' : ''}>Не блокировать</option>
                                    <option value="BLOCK_ONLY_HIGH" ${safetySettings?.HARM_CATEGORY_DANGEROUS_CONTENT === 'BLOCK_ONLY_HIGH' ? 'selected' : ''}>Блокировать высокий уровень</option>
                                    <option value="BLOCK_MEDIUM_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_DANGEROUS_CONTENT === 'BLOCK_MEDIUM_AND_ABOVE' || !safetySettings ? 'selected' : ''}>Блокировать средний и выше</option>
                                    <option value="BLOCK_LOW_AND_ABOVE" ${safetySettings?.HARM_CATEGORY_DANGEROUS_CONTENT === 'BLOCK_LOW_AND_ABOVE' ? 'selected' : ''}>Блокировать низкий и выше</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn success">Сохранить настройки безопасности</button>
                        </form>
                    </div>
                </div>

                <script>
                    document.getElementById('user-settings-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        
                        // Преобразуем пустые строки в null для опциональных полей
                        if (data.top_p === '') data.top_p = null;
                        if (data.top_k === '') data.top_k = null;
                        
                        try {
                            const response = await fetch('/api/gemini/user-settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            
                            if (response.ok) {
                                alert('Основные настройки сохранены!');
                            } else {
                                alert('Ошибка сохранения настроек');
                            }
                        } catch (error) {
                            alert('Ошибка сохранения настроек');
                        }
                    });
                    
                    document.getElementById('safety-settings-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        
                        try {
                            const response = await fetch('/api/gemini/safety-settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            
                            if (response.ok) {
                                alert('Настройки безопасности сохранены!');
                            } else {
                                alert('Ошибка сохранения настроек');
                            }
                        } catch (error) {
                            alert('Ошибка сохранения настроек');
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error loading Gemini settings:', error);
        res.status(500).send('Ошибка загрузки настроек');
    }
});

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
            INSERT OR REPLACE INTO gemini_user_settings 
            (user_id, model, system_instructions, max_output_tokens, temperature, top_p, top_k, history_limit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Участники сервера - Discord Bot Admin Panel</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    background: #2c2f33;
                    color: #fff;
                }
                .header {
                    background: #36393f;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .back-btn { 
                    background: #7289da; 
                    color: white; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 5px; 
                    text-decoration: none;
                }
                .section {
                    background: #36393f;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                .member-card {
                    background: #40444b;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .member-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .member-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                }
                .member-actions {
                    display: flex;
                    gap: 10px;
                }
                .btn {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .btn-danger { background: #f04747; color: white; }
                .btn-warning { background: #faa61a; color: white; }
                .btn-info { background: #7289da; color: white; }
                .search-box {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    background: #40444b;
                    border: none;
                    border-radius: 5px;
                    color: #fff;
                    font-size: 14px;
                }
                .loading { text-align: center; padding: 20px; }
                .role-tag {
                    background: #7289da;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    margin-right: 4px;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                }
                .pagination button {
                    background: #7289da;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .pagination button:disabled {
                    background: #40444b;
                    cursor: not-allowed;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Участники сервера</h1>
                <a href="/server/${serverId}" class="back-btn">← Назад к серверу</a>
            </div>

            <div class="section">
                <input type="text" id="search" class="search-box" placeholder="Поиск по имени пользователя...">
                
                <div id="members-container">
                    <div class="loading">Загрузка участников...</div>
                </div>
                
                <div class="pagination">
                    <button id="prev-btn" onclick="loadPreviousPage()" disabled>← Предыдущая</button>
                    <span id="page-info">Страница 1</span>
                    <button id="next-btn" onclick="loadNextPage()">Следующая →</button>
                </div>
            </div>

            <!-- Модальное окно для действий -->
            <div id="action-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000;">
                <div style="background: #36393f; padding: 30px; border-radius: 10px; max-width: 500px; margin: 10% auto; position: relative;">
                    <h3 id="modal-title">Действие</h3>
                    <div id="modal-content"></div>
                    <div style="margin-top: 20px; text-align: right;">
                        <button onclick="closeModal()" style="background: #40444b; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px;">Отмена</button>
                        <button id="confirm-action" onclick="confirmAction()" style="background: #f04747; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Подтвердить</button>
                    </div>
                </div>
            </div>

            <script>
                const serverId = '${serverId}';
                let currentPage = 1;
                let totalMembers = 0;
                let allMembers = [];
                let filteredMembers = [];
                let currentAction = null;
                let currentUserId = null;
                const membersPerPage = 20;

                async function loadMembers() {
                    try {
                        const response = await fetch(\`/api/server/\${serverId}/members?limit=1000\`);
                        allMembers = await response.json();
                        filteredMembers = allMembers;
                        totalMembers = allMembers.length;
                        
                        displayMembers();
                        updatePagination();
                    } catch (error) {
                        console.error('Error loading members:', error);
                        document.getElementById('members-container').innerHTML = '<div>Ошибка загрузки участников</div>';
                    }
                }

                function displayMembers() {
                    const startIndex = (currentPage - 1) * membersPerPage;
                    const endIndex = startIndex + membersPerPage;
                    const membersToShow = filteredMembers.slice(startIndex, endIndex);
                    
                    if (membersToShow.length === 0) {
                        document.getElementById('members-container').innerHTML = '<div>Участники не найдены</div>';
                        return;
                    }
                    
                    const membersHtml = membersToShow.map(member => \`
                        <div class="member-card">
                            <div class="member-info">
                                <img src="\${member.avatarURL}" alt="Avatar" class="member-avatar">
                                <div>
                                    <h4>\${member.displayName}</h4>
                                    <p style="margin: 5px 0; opacity: 0.7;">@\${member.username} • ID: \${member.id}</p>
                                    <div>
                                        \${member.roles.slice(0, 3).map(role => 
                                            role.name !== '@everyone' ? \`<span class="role-tag" style="background: \${role.color}">\${role.name}</span>\` : ''
                                        ).join('')}
                                        \${member.roles.length > 3 ? \`<span class="role-tag">+\${member.roles.length - 3}</span>\` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="member-actions">
                                <button class="btn btn-info" onclick="viewMember('\${member.id}')">Просмотр</button>
                                <button class="btn btn-warning" onclick="showActionModal('kick', '\${member.id}', '\${member.displayName}')">Кик</button>
                                <button class="btn btn-danger" onclick="showActionModal('ban', '\${member.id}', '\${member.displayName}')">Бан</button>
                            </div>
                        </div>
                    \`).join('');
                    
                    document.getElementById('members-container').innerHTML = membersHtml;
                }

                function updatePagination() {
                    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
                    
                    document.getElementById('prev-btn').disabled = currentPage <= 1;
                    document.getElementById('next-btn').disabled = currentPage >= totalPages;
                    document.getElementById('page-info').textContent = \`Страница \${currentPage} из \${totalPages} (\${filteredMembers.length} участников)\`;
                }

                function loadNextPage() {
                    currentPage++;
                    displayMembers();
                    updatePagination();
                }

                function loadPreviousPage() {
                    currentPage--;
                    displayMembers();
                    updatePagination();
                }

                function showActionModal(action, userId, displayName) {
                    currentAction = action;
                    currentUserId = userId;
                    
                    const modal = document.getElementById('action-modal');
                    const title = document.getElementById('modal-title');
                    const content = document.getElementById('modal-content');
                    
                    title.textContent = action === 'kick' ? 'Исключить пользователя' : 'Забанить пользователя';
                    
                    content.innerHTML = \`
                        <p>Вы уверены, что хотите <strong>\${action === 'kick' ? 'исключить' : 'забанить'}</strong> пользователя <strong>\${displayName}</strong>?</p>
                        <div style="margin: 15px 0;">
                            <label style="display: block; margin-bottom: 5px;">Причина:</label>
                            <input type="text" id="reason-input" style="width: 100%; padding: 8px; background: #40444b; border: none; border-radius: 4px; color: #fff;" placeholder="Укажите причину...">
                        </div>
                        \${action === 'ban' ? \`
                            <div style="margin: 15px 0;">
                                <label style="display: block; margin-bottom: 5px;">Удалить сообщения за (дней):</label>
                                <select id="delete-messages" style="width: 100%; padding: 8px; background: #40444b; border: none; border-radius: 4px; color: #fff;">
                                    <option value="0">Не удалять</option>
                                    <option value="1">1 день</option>
                                    <option value="7" selected>7 дней</option>
                                </select>
                            </div>
                        \` : ''}
                    \`;
                    
                    modal.style.display = 'block';
                }

                function closeModal() {
                    document.getElementById('action-modal').style.display = 'none';
                    currentAction = null;
                    currentUserId = null;
                }

                async function confirmAction() {
                    const reason = document.getElementById('reason-input').value || 'Не указана';
                    const deleteMessages = document.getElementById('delete-messages')?.value || 0;
                    
                    try {
                        const response = await fetch(\`/api/server/\${serverId}/action\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: currentAction,
                                userId: currentUserId,
                                reason: reason,
                                extra: { deleteMessageDays: parseInt(deleteMessages) }
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert(\`Действие выполнено успешно! Кейс #\${result.caseNum}\`);
                            closeModal();
                            loadMembers(); // Обновляем список
                        } else {
                            alert(\`Ошибка: \${result.error}\`);
                        }
                    } catch (error) {
                        alert('Ошибка выполнения действия');
                        console.error(error);
                    }
                }

                function viewMember(userId) {
                    window.open(\`https://discord.com/users/\${userId}\`, '_blank');
                }

                // Поиск
                document.getElementById('search').addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase();
                    
                    if (query === '') {
                        filteredMembers = allMembers;
                    } else {
                        filteredMembers = allMembers.filter(member => 
                            member.username.toLowerCase().includes(query) ||
                            member.displayName.toLowerCase().includes(query)
                        );
                    }
                    
                    currentPage = 1;
                    displayMembers();
                    updatePagination();
                });

                // Загружаем участников при загрузке страницы
                loadMembers();
            </script>
        </body>
        </html>
    `);
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