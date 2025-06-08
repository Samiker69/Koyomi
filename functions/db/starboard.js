// main.js или starboard-db.js
const Database = require('better-sqlite3');

class StarboardDB {
    constructor(dbPath = './database/settings.db') {
        this.db = new Database(dbPath);
        this._initTables();
    }

    _initTables() {
        // Таблица для настроек Starboard для каждого сервера
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS starboard_settings (
                guildId TEXT PRIMARY KEY NOT NULL,
                starboardChannelId TEXT,
                enabled INTEGER NOT NULL DEFAULT 1, -- 0 for false, 1 for true
                minReactions INTEGER NOT NULL DEFAULT 5
            );
        `);

        // Таблица для отслеживания сообщений, уже добавленных на Starboard
        // starboardMessageId - это ID сообщения, которое было создано ботом В канале starboard
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS starboard_messages (
                guildId TEXT NOT NULL,
                messageId TEXT NOT NULL,           -- ID оригинального сообщения
                starboardMessageId TEXT NOT NULL,  -- ID сообщения в starboard канале
                PRIMARY KEY (guildId, messageId)
            );
        `);
    }

    // --- Функции для управления настройками Starboard ---

    /**
     * Получает настройки Starboard для указанного сервера.
     * @param {string} guildId ID сервера.
     * @returns {object | null} Объект с настройками или null, если настроек нет (хотя будут возвращены дефолтные).
     */
    getSettings(guildId) {
        const stmt = this.db.prepare('SELECT * FROM starboard_settings WHERE guildId = ?');
        const row = stmt.get(guildId);

        if (row) {
            return {
                guildId: row.guildId,
                starboardChannelId: row.starboardChannelId,
                enabled: row.enabled === 1, // Конвертация в boolean
                minReactions: row.minReactions,
            };
        }
        // Если для сервера нет записи, возвращаем дефолтные значения
        return {
            guildId: guildId,
            starboardChannelId: null,
            enabled: true, // Default from schema is 1
            minReactions: 5, // Default from schema is 5
        };
    }

    /**
     * Обновляет настройки Starboard для сервера.
     * Можно передавать только те поля, которые нужно изменить.
     * @param {string} guildId ID сервера.
     * @param {object} settings Объект с настройками для обновления.
     * @param {string} [settings.starboardChannelId] ID канала Starboard.
     * @param {boolean} [settings.enabled] Включен ли Starboard.
     * @param {number} [settings.minReactions] Минимальное количество реакций.
     * @returns {object} Обновленные настройки.
     */
    updateSettings(guildId, { starboardChannelId, enabled, minReactions }) {
        const currentSettings = this.getSettings(guildId); // Получаем текущие или дефолтные

        const newSettings = {
            sChannelId: starboardChannelId !== undefined ? starboardChannelId : currentSettings.starboardChannelId,
            sEnabled: enabled !== undefined ? (enabled ? 1 : 0) : (currentSettings.enabled ? 1 : 0),
            sMinReactions: minReactions !== undefined ? minReactions : currentSettings.minReactions,
        };

        const stmt = this.db.prepare(`
            INSERT INTO starboard_settings (guildId, starboardChannelId, enabled, minReactions)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(guildId) DO UPDATE SET
                starboardChannelId = excluded.starboardChannelId,
                enabled = excluded.enabled,
                minReactions = excluded.minReactions;
        `);

        stmt.run(
            guildId,
            newSettings.sChannelId,
            newSettings.sEnabled,
            newSettings.sMinReactions
        );
        return this.getSettings(guildId); // Возвращаем обновленные данные
    }

    // --- Функции для управления сообщениями на Starboard ---

    /**
     * Добавляет сообщение на Starboard.
     * @param {string} guildId ID сервера.
     * @param {string} messageId ID оригинального сообщения.
     * @param {string} starboardMessageId ID сообщения, созданного в канале Starboard.
     * @returns {boolean} true если успешно, false если произошла ошибка.
     */
    addStarboardEntry(guildId, messageId, starboardMessageId) {
        const stmt = this.db.prepare(`
            INSERT OR IGNORE INTO starboard_messages (guildId, messageId, starboardMessageId)
            VALUES (?, ?, ?)
            ON CONFLICT(guildId, messageId) DO UPDATE SET starboardMessageId = excluded.starboardMessageId; 
        `);
        try {
            const info = stmt.run(guildId, messageId, starboardMessageId);
            return info.changes > 0;
        } catch (error) {
            console.error("Ошибка при добавлении записи в starboard_messages:", error);
            return false;
        }
    }

    /**
     * Удаляет сообщение с Starboard.
     * @param {string} guildId ID сервера.
     * @param {string} messageId ID оригинального сообщения.
     * @returns {string | null} ID сообщения в starboard-канале (starboardMessageId) если удалено, иначе null.
     */
    deleteStarboardEntry(guildId, messageId) {
        // Сначала получим starboardMessageId, чтобы его можно было вернуть (для удаления самого сообщения в Discord)
        const getStmt = this.db.prepare('SELECT starboardMessageId FROM starboard_messages WHERE guildId = ? AND messageId = ?');
        const entry = getStmt.get(guildId, messageId);

        if (!entry) {
            return null; // Сообщения нет в базе
        }

        const deleteStmt = this.db.prepare('DELETE FROM starboard_messages WHERE guildId = ? AND messageId = ?');
        const info = deleteStmt.run(guildId, messageId);

        return info.changes > 0 ? entry.starboardMessageId : null;
    }

    /**
     * Проверяет, есть ли уже такое сообщение (messageId) на Starboard для данного сервера.
     * @param {string} guildId ID сервера.
     * @param {string} messageId ID оригинального сообщения.
     * @returns {boolean} true, если сообщение есть на Starboard, иначе false.
     */
    isMessageOnStarboard(guildId, messageId) {
        const stmt = this.db.prepare('SELECT 1 FROM starboard_messages WHERE guildId = ? AND messageId = ? LIMIT 1');
        const row = stmt.get(guildId, messageId);
        return !!row; // Преобразуем в boolean (true если row не undefined/null, false иначе)
    }

    /**
     * Получает ID сообщения в starboard-канале по ID оригинального сообщения.
     * @param {string} guildId ID сервера.
     * @param {string} messageId ID оригинального сообщения.
     * @returns {string | null} ID сообщения в starboard-канале или null, если не найдено.
     */
    getStarboardMessageId(guildId, messageId) {
        const stmt = this.db.prepare('SELECT starboardMessageId FROM starboard_messages WHERE guildId = ? AND messageId = ?');
        const row = stmt.get(guildId, messageId);
        return row ? row.starboardMessageId : null;
    }


    /**
     * Закрывает соединение с базой данных.
     */
    close() {
        this.db.close();
    }
}

module.exports = StarboardDB;