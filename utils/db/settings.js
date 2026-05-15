const Database = require('better-sqlite3');
const path = require('path'); // Для удобства работы с путями
const localeManager = require('../../locales/localeManager');

// Определим константы для имен настроек и настроек типа boolean
const VALID_SETTINGS = [
    'logchannel',
    'newMemberChannelId',
    'inviteLoggerChannel',
    'allowInviteLogging',
    'allowLogingMembersAdd',
    'mainVoiceChannelId',
    'voiceCategoryId',
    'supportChannelId',
    'prefix',
    'reportsModerationChannelId',
    // Honeypot
    'honeypotChannelId',
    'honeypotLogChannelId',
    'honeypotEnabled',
    // Verdict log
    'verdictChannelId',
    'language'
];
const BOOLEAN_SETTINGS = ['allowInviteLogging', 'allowLogingMembersAdd', 'honeypotEnabled'];

class SettingsDatabase {
    /**
     * Создает экземпляр базы данных настроек.
     * @param {string} [dbPath='settings.db'] Путь к файлу базы данных SQLite.
     */
    constructor(dbPath = './database/main.db') {
        this.locale = localeManager.defaultLocale;

        try {
            this.db = new Database(dbPath);
            this._initTable();
            this._addMissingColumns(); // Вызываем новый метод для добавления отсутствующих колонок
            this._prepareStatements();

        } catch (err) {
            console.error(this._t('errors.init'), err);
            throw err; // Пробрасываем ошибку дальше, чтобы приложение знало о проблеме
        }
    }

    _t(key, variables = {}) {
        return localeManager.get(`database.settings.${key}`, this.locale, variables);
    }

    /**
     * Инициализирует таблицу настроек, если она не существует.
     * @private
     */
    _initTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS guild_settings (
                guildId TEXT PRIMARY KEY,
                logchannel TEXT DEFAULT '',
                newMemberChannelId TEXT DEFAULT '',
                inviteLoggerChannel TEXT DEFAULT '',
                allowInviteLogging INTEGER DEFAULT 0,  -- 0 for false, 1 for true
                allowLogingMembersAdd INTEGER DEFAULT 0, -- 0 for false, 1 for true
                mainVoiceChannelId TEXT DEFAULT '',
                voiceCategoryId TEXT DEFAULT '',
                supportChannelId TEXT DEFAULT '',
                prefix TEXT DEFAULT '..',
                language TEXT DEFAULT 'ru'
                -- reportsModerationChannelId будет добавлен методом _addMissingColumns
            );
        `;
        this.db.exec(createTableQuery);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS role_menus (
                messageId TEXT PRIMARY KEY,
                guildId TEXT NOT NULL,
                channelId TEXT NOT NULL,
                type TEXT NOT NULL, -- 'select'
                roles TEXT NOT NULL -- JSON-строка [{id: 'roleId', label: 'Role Name', description: 'Desc'}, ...]
            );
        `);

        // LogAnalyzer tables
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS unsupported_mods (
                mod_id TEXT PRIMARY KEY,
                reason TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS banned_mods (
                mod_id TEXT PRIMARY KEY
            );
            CREATE TABLE IF NOT EXISTS mods_mapping (
                original_name TEXT PRIMARY KEY,
                modrinth_id TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS allowed_launchers (
                launcher_name TEXT PRIMARY KEY
            );
        `);
        
        // Populate default values if empty
        const countLaunchers = this.db.prepare('SELECT count(*) as count FROM allowed_launchers').get();
        if (countLaunchers.count === 0) {
            this.db.prepare('INSERT INTO allowed_launchers (launcher_name) VALUES (?)').run('hebe');
        }

        const countMapping = this.db.prepare('SELECT count(*) as count FROM mods_mapping').get();
        if (countMapping.count === 0) {
            this.db.prepare('INSERT INTO mods_mapping (original_name, modrinth_id) VALUES (?, ?)').run('yet_another_config_lib_v3', 'yacl');
        }
    }

    /**
     * Добавляет новые колонки в существующую таблицу guild_settings, если они отсутствуют.
     * Это позволяет обновлять схему базы данных без потери данных.
     * @private
     */
    _addMissingColumns() {
        const existingColumns = this.db.prepare("PRAGMA table_info(guild_settings);").all().map(col => col.name);

        if (!existingColumns.includes('reportsModerationChannelId'))
            this.db.exec("ALTER TABLE guild_settings ADD COLUMN reportsModerationChannelId TEXT DEFAULT '';");

        if (!existingColumns.includes('honeypotChannelId'))
            this.db.exec("ALTER TABLE guild_settings ADD COLUMN honeypotChannelId TEXT DEFAULT '';");

        if (!existingColumns.includes('honeypotLogChannelId'))
            this.db.exec("ALTER TABLE guild_settings ADD COLUMN honeypotLogChannelId TEXT DEFAULT '';");

        if (!existingColumns.includes('honeypotEnabled'))
            this.db.exec("ALTER TABLE guild_settings ADD COLUMN honeypotEnabled INTEGER DEFAULT 0;");

        if (!existingColumns.includes('verdictChannelId'))
            this.db.exec("ALTER TABLE guild_settings ADD COLUMN verdictChannelId TEXT DEFAULT '';");

        if (!existingColumns.includes('language'))
            this.db.exec("ALTER TABLE guild_settings ADD COLUMN language TEXT DEFAULT 'ru';");
    }

    /**
     * Подготавливает SQL-запросы для многократного использования.
     * @private
     */
    _prepareStatements() {
        this.statements = {
            // Запрос на получение всех настроек для сервера
            getSettings: this.db.prepare('SELECT * FROM guild_settings WHERE guildId = ?'),

            // Запрос на добавление сервера с настройками по умолчанию
            // INSERT OR IGNORE не вызовет ошибку, если сервер уже существует
            addServer: this.db.prepare('INSERT OR IGNORE INTO guild_settings (guildId) VALUES (?)'),

            // Запрос на удаление настроек сервера
            removeServer: this.db.prepare('DELETE FROM guild_settings WHERE guildId = ?'),

            // Подготовленные запросы для обновления каждой отдельной настройки
            update: {}
        };
        VALID_SETTINGS.forEach(setting => {
            this.statements.update[setting] = this.db.prepare(
                // Динамически создаем запрос для каждой настройки
                // Использование плейсхолдеров (?) безопасно от SQL-инъекций
                `UPDATE guild_settings SET ${setting} = ? WHERE guildId = ?`
            );
        });

        this.statements.addRoleMenu = this.db.prepare("INSERT OR REPLACE INTO role_menus (messageId, guildId, channelId, type, roles) VALUES (?, ?, ?, ?, ?)");
        this.statements.getRoleMenu = this.db.prepare("SELECT * FROM role_menus WHERE messageId = ?");
        this.statements.deleteRoleMenu = this.db.prepare("DELETE FROM role_menus WHERE messageId = ?");
        this.statements.getAllRoleMenus = this.db.prepare("SELECT * FROM role_menus WHERE guildId = ?"); // Для возможного получения всех меню на сервере

        // LogAnalyzer statements
        this.statements.getUnsupportedMods = this.db.prepare('SELECT mod_id, reason FROM unsupported_mods');
        this.statements.getBannedMods = this.db.prepare('SELECT mod_id FROM banned_mods');
        this.statements.getModsMapping = this.db.prepare('SELECT original_name, modrinth_id FROM mods_mapping');
        this.statements.getAllowedLaunchers = this.db.prepare('SELECT launcher_name FROM allowed_launchers');
        
        this.statements.addUnsupportedMod = this.db.prepare('INSERT OR REPLACE INTO unsupported_mods (mod_id, reason) VALUES (?, ?)');
        this.statements.removeUnsupportedMod = this.db.prepare('DELETE FROM unsupported_mods WHERE mod_id = ?');
        
        this.statements.addBannedMod = this.db.prepare('INSERT OR IGNORE INTO banned_mods (mod_id) VALUES (?)');
        this.statements.removeBannedMod = this.db.prepare('DELETE FROM banned_mods WHERE mod_id = ?');
        
        this.statements.addModsMapping = this.db.prepare('INSERT OR REPLACE INTO mods_mapping (original_name, modrinth_id) VALUES (?, ?)');
        this.statements.removeModsMapping = this.db.prepare('DELETE FROM mods_mapping WHERE original_name = ?');
        
        this.statements.addAllowedLauncher = this.db.prepare('INSERT OR IGNORE INTO allowed_launchers (launcher_name) VALUES (?)');
        this.statements.removeAllowedLauncher = this.db.prepare('DELETE FROM allowed_launchers WHERE launcher_name = ?');
    }

    /**
     * Преобразует строку из БД в объект JS с правильными boolean значениями.
     * @param {object | undefined} row Строка данных из БД.
     * @returns {object | undefined} Отформатированный объект настроек или undefined.
     * @private
     */
    _formatSettings(row) {
        if (!row) {
            return undefined; // Возвращаем undefined, если запись не найдена
        }

        const settings = { ...row }; // Копируем объект строки

        // Преобразуем числовые значения (0/1) в boolean (false/true)
        BOOLEAN_SETTINGS.forEach(key => {
            if (settings[key] !== undefined) {
                settings[key] = Boolean(settings[key]);
            }
        });

        // Удаляем guildId из возвращаемого объекта настроек для чистоты
        // delete settings.guildId; // Раскомментируйте, если не хотите видеть guildId в объекте настроек

        return settings;
    }

    /**
     * Получает настройки для указанного сервера.
     * @param {string} guildId ID сервера Discord.
     * @returns {object | undefined} Объект с настройками сервера или undefined, если сервер не найден в БД.
     */
    getSettings(guildId) {
         if (!guildId || typeof guildId !== 'string') {
            console.error(this._t('errors.invalid_guild_id', { method: 'getSettings' }), guildId);
            return undefined;
        }
        try {
            const row = this.statements.getSettings.get(guildId);
            return this._formatSettings(row);
        } catch (err) {
            console.error(this._t('errors.get_settings', { guildId }), err);
            return undefined; // В случае ошибки возвращаем undefined
        }
    }

    /**
     * Добавляет сервер в базу данных с настройками по умолчанию.
     * Если сервер уже существует, операция будет проигнорирована.
     * Вызывается, когда бот присоединяется к новому серверу.
     * @param {string} guildId ID сервера Discord.
     * @returns {Database.RunResult} Результат выполнения запроса better-sqlite3.
     * @throws {Error} Если guildId не предоставлен или не является строкой.
     */
    addServer(guildId) {
        if (!guildId || typeof guildId !== 'string') {
            throw new Error(this._t('errors.guild_id_required', { method: 'addServer' }));
        }
        try {
            return this.statements.addServer.run(guildId);
        } catch (err) {
            console.error(this._t('errors.add_server', { guildId }), err);
            throw err;
        }
    }

    /**
     * Удаляет все настройки для указанного сервера из базы данных.
     * Вызывается, когда бот покидает сервер.
     * @param {string} guildId ID сервера Discord.
     * @returns {Database.RunResult} Результат выполнения запроса better-sqlite3.
     * @throws {Error} Если guildId не предоставлен или не является строкой.
     */
    removeServer(guildId) {
        if (!guildId || typeof guildId !== 'string') {
            throw new Error(this._t('errors.guild_id_required', { method: 'removeServer' }));
        }
        try {
            const result = this.statements.removeServer.run(guildId);
            return result.changes > 0 ? result : false;
        } catch (err) {
            console.error(this._t('errors.remove_server', { guildId }), err);
            throw err;
        }
    }

    /**
     * Обновляет значение конкретной настройки для указанного сервера.
     * @param {string} guildId ID сервера Discord.
     * @param {string} settingName Имя обновляемой настройки (из VALID_SETTINGS).
     * @param {string | boolean | number} value Новое значение настройки.
     * @returns {Database.RunResult} Результат выполнения запроса better-sqlite3.
     * @throws {Error} Если имя настройки недопустимо, guildId некорректен или произошла ошибка БД.
     */
    updateSetting(guildId, settingName, value) {
        if (!guildId || typeof guildId !== 'string') {
            throw new Error(this._t('errors.guild_id_required', { method: 'updateSetting' }));
        }
        if (!VALID_SETTINGS.includes(settingName)) {
            throw new Error(this._t('errors.invalid_setting', { settingName, allowed: VALID_SETTINGS.join(', ') }));
        }

        let dbValue = value;

        // Преобразуем boolean в integer (0 или 1) для записи в БД
        if (BOOLEAN_SETTINGS.includes(settingName)) {
            dbValue = value ? 1 : 0;
        }
        // Для текстовых полей убедимся, что значение - строка (или пустая строка для null/undefined)
        else if (typeof dbValue !== 'string') {
             dbValue = (value === null || value === undefined) ? '' : String(value);
        }


        try {
            const statement = this.statements.update[settingName];
            if (!statement) {
                throw new Error(this._t('errors.statement_not_found', { settingName }));
            }
            return statement.run(dbValue, guildId);
        } catch (err) {
            console.error(this._t('errors.update_setting', { settingName, guildId }), err);
            throw err;
        }
    }

    addRoleMenu(messageId, guildId, channelId, type, roles) {
        // roles должен быть массивом объектов, который мы преобразуем в JSON строку
        const rolesJson = JSON.stringify(roles);
        this.statements.addRoleMenu.run(messageId, guildId, channelId, type, rolesJson);
    }

    getRoleMenu(messageId) {
        const row = this.statements.getRoleMenu.get(messageId);
        if (row) {
            // Парсим JSON обратно в массив объектов
            row.roles = JSON.parse(row.roles);
        }
        return row;
    }

    deleteRoleMenu(messageId) {
        this.statements.deleteRoleMenu.run(messageId);
    }

    getAllRoleMenus(guildId) {
        const rows = this.statements.getAllRoleMenus.all(guildId);
        return rows.map(row => {
            if (row) row.roles = JSON.parse(row.roles);
            return row;
        });
    }

    // --- LogAnalyzer методы ---

    getUnsupportedMods() {
        const rows = this.statements.getUnsupportedMods.all();
        const result = {};
        for (const row of rows) {
            result[row.mod_id] = row.reason;
        }
        return result;
    }

    getBannedMods() {
        const rows = this.statements.getBannedMods.all();
        return rows.map(r => r.mod_id);
    }

    getModsMapping() {
        const rows = this.statements.getModsMapping.all();
        const result = {};
        for (const row of rows) {
            result[row.original_name] = row.modrinth_id;
        }
        return result;
    }

    getAllowedLaunchers() {
        const rows = this.statements.getAllowedLaunchers.all();
        return rows.map(r => r.launcher_name);
    }

    addBannedMod(modId) {
        const res = this.statements.addBannedMod.run(modId);
        return res.changes > 0;
    }

    removeBannedMod(modId) {
        const res = this.statements.removeBannedMod.run(modId);
        return res.changes > 0;
    }

    addUnsupportedMod(modId, reason) {
        const res = this.statements.addUnsupportedMod.run(modId, reason);
        return res.changes > 0;
    }

    removeUnsupportedMod(modId) {
        const res = this.statements.removeUnsupportedMod.run(modId);
        return res.changes > 0;
    }

    addAllowedLauncher(launcherName) {
        const res = this.statements.addAllowedLauncher.run(launcherName);
        return res.changes > 0;
    }

    removeAllowedLauncher(launcherName) {
        const res = this.statements.removeAllowedLauncher.run(launcherName);
        return res.changes > 0;
    }

    /**
     * Закрывает соединение с базой данных.
     */
    close() {
        if (this.db && this.db.open) {
            this.db.close();
        }
    }
}

module.exports = SettingsDatabase;
