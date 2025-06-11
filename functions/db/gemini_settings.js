const Database = require('better-sqlite3');

class GeminiDB {
    constructor(dbPath = './database/settings.db') {
        this.db = new Database(dbPath);
        this._initializeTables();
        // Включаем поддержку внешних ключей, если она не включена по умолчанию
        this.db.pragma('foreign_keys = ON');
    }

    _initializeTables() {
        const createUserSettingsTable = `
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
        `;

        const createSafetySettingsTable = `
            CREATE TABLE IF NOT EXISTS gemini_safety_settings (
                user_id TEXT NOT NULL PRIMARY KEY,
                HARM_CATEGORY_HARASSMENT TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
                HARM_CATEGORY_HATE_SPEECH TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
                HARM_CATEGORY_SEXUALLY_EXPLICIT TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
                HARM_CATEGORY_DANGEROUS_CONTENT TEXT DEFAULT "BLOCK_MEDIUM_AND_ABOVE",
                FOREIGN KEY (user_id) REFERENCES gemini_user_settings(user_id) ON DELETE CASCADE
            );
        `;
        const createGeminiTokensTable = `
            CREATE TABLE IF NOT EXISTS tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                token TEXT NOT NULL,
                public_use INTEGER DEFAULT 0, -- 0 = false, 1 = true
                uses INTEGER DEFAULT 0
            );
        `

        this.db.exec(createUserSettingsTable);
        this.db.exec(createSafetySettingsTable);
        this.db.exec(createGeminiTokensTable);
    }

    /**
     * Добавляет конфиг для пользователя. Если пользователь уже существует,
     * его основные настройки будут обновлены до значений по умолчанию или переданных.
     * Настройки безопасности создадутся с дефолтными значениями, если их нет.
     * @param {string} userId
     * @param {object} [configOverrides={}] Объект с настройками для переопределения (model, system_instructions, etc.)
     * @returns {object} Информация о результате операции
     */
    addUserConfig(userId, configOverrides = {}) {
        if (!userId) {
            throw new Error("userId is required to add a config.");
        }

        const defaultConfig = {
            model: "gemini-2.0-flash",
            system_instructions: "",
            max_output_tokens: 1000,
            temperature: 1.0,
            top_p: null,
            top_k: null,
            history_limit: 100
        };

        const finalConfig = { ...defaultConfig, ...configOverrides, user_id: userId };

        const stmtUserSettings = this.db.prepare(`
            INSERT OR REPLACE INTO gemini_user_settings 
            (user_id, model, system_instructions, max_output_tokens, temperature, top_p, top_k, history_limit)
            VALUES (@user_id, @model, @system_instructions, @max_output_tokens, @temperature, @top_p, @top_k, @history_limit)
        `);

        // Для настроек безопасности: вставляем только если не существует, чтобы не перезаписывать существующие кастомные
        const stmtSafetySettings = this.db.prepare(`
            INSERT OR IGNORE INTO gemini_safety_settings (user_id) VALUES (?)
        `);

        let infoUserSettings, infoSafetySettings;
        try {
            this.db.transaction(() => {
                infoUserSettings = stmtUserSettings.run(finalConfig);
                infoSafetySettings = stmtSafetySettings.run(userId);
            })(); // Выполняем транзакцию немедленно
            return { 
                userSettings: { changes: infoUserSettings.changes, lastInsertRowid: infoUserSettings.lastInsertRowid },
                safetySettings: { changes: infoSafetySettings.changes, lastInsertRowid: infoSafetySettings.lastInsertRowid }
            };
        } catch (error) {
            console.error("Error adding user config:", error);
            throw error; // или вернуть информацию об ошибке
        }
    }

    /**
     * Удаляет конфиг пользователя и связанные с ним настройки безопасности.
     * @param {string} userId
     * @returns {boolean} true - удалено, false - ничего не произошло
     */
    deleteUserConfig(userId) {
        if (!userId) {
            throw new Error("userId is required to delete a config.");
        }
        const stmt = this.db.prepare('DELETE FROM gemini_user_settings WHERE user_id = ?');
        const info = stmt.run(userId);
        return info.changes > 0
    }

    /**
     * Получает конфиг конкретного пользователя.
     * @param {string} userId
     * @returns {object | undefined} Объект с настройками или undefined, если пользователь не найден.
     */
    getUserConfig(userId) {
        if (!userId) {
            throw new Error("userId is required to get a config.");
        }
        const stmt = this.db.prepare('SELECT * FROM gemini_user_settings WHERE user_id = ?');
        return stmt.get(userId);
    }

    /**
     * Получает все конфиги пользователей.
     * @returns {Array<object>} Массив объектов с настройками.
     */
    getAllUserConfigs() {
        const stmt = this.db.prepare('SELECT * FROM gemini_user_settings');
        return stmt.all();
    }

    /**
     * Изменяет одно или несколько значений в конфиге пользователя.
     * @param {string} userId
     * @param {object} updates Объект, где ключи - имена полей, значения - новые значения.
     *                       Например: { model: "gemini-1.0-pro", temperature: 0.8 }
     * @returns {object} Информация о результате операции
     */
    updateUserConfig(userId, updates) {
        if (!userId) {
            throw new Error("userId is required to update a config.");
        }
        if (Object.keys(updates).length === 0) {
            return { changes: 0 }; // Нет изменений
        }

        const allowedFields = ['model', 'system_instructions', 'max_output_tokens', 'temperature', 'top_p', 'top_k', 'history_limit'];
        const fieldsToUpdate = [];
        const values = [];

        for (const key in updates) {
            if (allowedFields.includes(key)) {
                fieldsToUpdate.push(`${key} = ?`);
                values.push(updates[key]);
            } else {
                console.warn(`Field '${key}' is not allowed for update in gemini_user_settings or does not exist.`);
            }
        }

        if (fieldsToUpdate.length === 0) {
            return { changes: 0, message: "No valid fields to update." };
        }

        values.push(userId); // Для WHERE user_id = ?

        const sql = `UPDATE gemini_user_settings SET ${fieldsToUpdate.join(', ')} WHERE user_id = ?`;
        const stmt = this.db.prepare(sql);
        const info = stmt.run(...values);
        return { changes: info.changes };
    }

    // --- Методы для настроек безопасности ---

    /**
     * Получает настройки безопасности для пользователя.
     * @param {string} userId
     * @returns {object | undefined}
     */
    getSafetySettings(userId) {
        if (!userId) {
            throw new Error("userId is required to get safety settings.");
        }
        const stmt = this.db.prepare('SELECT * FROM gemini_safety_settings WHERE user_id = ?');
        const safetySettings = stmt.get(userId);
        
        const { user_id, ...restOfSettings } = safetySettings;
        return restOfSettings;
    }

    /**
     * Обновляет настройки безопасности для пользователя.
     * @param {string} userId
     * @param {object} updates Объект с настройками безопасности для обновления.
     *                       Ключи: HARM_CATEGORY_HARASSMENT, HARM_CATEGORY_HATE_SPEECH, и т.д.
     * @returns {object} Информация о результате операции
     */
    updateSafetySettings(userId, updates) {
        if (!userId) {
            throw new Error("userId is required to update safety settings.");
        }
        if (Object.keys(updates).length === 0) {
            return { changes: 0 };
        }

        const allowedFields = [
            'HARM_CATEGORY_HARASSMENT', 
            'HARM_CATEGORY_HATE_SPEECH', 
            'HARM_CATEGORY_SEXUALLY_EXPLICIT', 
            'HARM_CATEGORY_DANGEROUS_CONTENT'
        ];
        const fieldsToUpdate = [];
        const values = [];

        for (const key in updates) {
            if (allowedFields.includes(key)) {
                fieldsToUpdate.push(`${key} = ?`);
                values.push(updates[key]);
            } else {
                console.warn(`Field '${key}' is not allowed for update in gemini_safety_settings or does not exist.`);
            }
        }

        if (fieldsToUpdate.length === 0) {
            return { changes: 0, message: "No valid fields to update." };
        }

        values.push(userId); // Для WHERE user_id = ?

        const sql = `UPDATE gemini_safety_settings SET ${fieldsToUpdate.join(', ')} WHERE user_id = ?`;
        const stmt = this.db.prepare(sql);
        const info = stmt.run(...values);
        return { changes: info.changes };
    }

    //tokens

    addToken(userId, token, publicUse = 0) {
        const stmt = this.db.prepare(`INSERT INTO tokens (user_id, token, public_use) VALUES (?, ?, ?)`);
        stmt.run(userId, token, publicUse ? 1 : 0);
    }

    deleteToken(userId, token) {
        const stmt = this.db.prepare(`DELETE FROM tokens WHERE token = ? AND user_id = ?`);
        return stmt.run(token, userId);
    }

    deleteAllByUser(userId) {
        const stmt = this.db.prepare(`DELETE FROM tokens WHERE user_id = ?`);
        return stmt.run(userId);
    }

    updateTokenSettings(userId, token, updates) {
        const fields = [];
        const values = [];

        if (typeof updates.public_use === 'boolean') {
            fields.push(`public_use = ?`);
            values.push(updates.public_use ? 1 : 0);
        }

        if (typeof updates.uses === 'number') {
            fields.push(`uses = ?`);
            values.push(updates.uses);
        }

        if (fields.length === 0) return;

        const stmt = this.db.prepare(`UPDATE tokens SET ${fields.join(', ')} WHERE token = ? AND user_id = ?`);
        values.push(token, userId);
        const res = stmt.run(...values);
        return { changes: res.changes };
    }

    getUserStats(userId) {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) AS tokenCount, SUM(uses) AS totalUses
            FROM tokens
            WHERE user_id = ?
        `);
        const row = stmt.get(userId);
        return {
            tokens: row.tokenCount,
            uses: row.totalUses || 0
        };
    }

    getUserTokens(userId) {
        const tx = this.db.transaction((userId) => {
            const select = this.db.prepare(`SELECT * FROM tokens WHERE user_id = ?`);
            const row = select.get(userId);
            return row;
        });

        return tx(userId);
    }

    /**
     * Закрывает соединение с БД.
     */
    close() {
        this.db.close();
    }
}

module.exports = GeminiDB;