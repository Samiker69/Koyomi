const Database = require('better-sqlite3');
const path = require('path');

class UserPunishmentDB {
    constructor(dbPath = './database/moderation.db') {
        this.db = new Database(dbPath);
        this.init();
    }

    init() {
        // Создаем таблицу с необходимыми ограничениями
        const createTable = `
            CREATE TABLE IF NOT EXISTS user_punishment (
                user_id TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                negative_points INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, guild_id)
            )
        `;
        
        this.db.exec(createTable);

        // Создаем индексы для быстрого поиска
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_guild_id ON user_punishment(guild_id)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_channel_id ON user_punishment(channel_id)');

        // Подготавливаем запросы
        this.statements = {
            insert: this.db.prepare(`
                INSERT INTO user_punishment (user_id, channel_id, guild_id, negative_points)
                VALUES (?, ?, ?, ?)
            `),
            
            update: this.db.prepare(`
                UPDATE user_punishment 
                SET negative_points = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND guild_id = ?
            `),
            
            updateChannel: this.db.prepare(`
                UPDATE user_punishment 
                SET channel_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND guild_id = ?
            `),
            
            delete: this.db.prepare(`
                DELETE FROM user_punishment 
                WHERE user_id = ? AND guild_id = ?
            `),
            
            selectByUserGuild: this.db.prepare(`
                SELECT * FROM user_punishment 
                WHERE user_id = ? AND guild_id = ?
            `),
            
            selectByGuild: this.db.prepare(`
                SELECT * FROM user_punishment 
                WHERE guild_id = ?
            `),
            
            selectByChannel: this.db.prepare(`
                SELECT * FROM user_punishment 
                WHERE channel_id = ?
            `)
        };
    }

    /**
     * Добавить новую запись о наказании пользователя
     * @param {string} userId - ID пользователя
     * @param {string} channelId - ID канала
     * @param {string} guildId - ID сервера
     * @param {number} negativePoints - Количество штрафных очков
     * @returns {boolean} - Успешность операции
     */
    addRecord(userId, channelId, guildId, negativePoints = 0) {
        try {
            this.statements.insert.run(userId, channelId, guildId, negativePoints);
            return true;
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                throw new Error(`Пользователь ${userId} уже имеет запись на сервере ${guildId}`);
            }
            throw error;
        }
    }

    /**
     * Обновить штрафные очки пользователя
     * @param {string} userId - ID пользователя
     * @param {string} guildId - ID сервера
     * @param {number} negativePoints - Новое количество штрафных очков
     * @returns {boolean} - Успешность операции
     */
    updatePoints(userId, guildId, negativePoints) {
        const result = this.statements.update.run(negativePoints, userId, guildId);
        return result.changes > 0;
    }

    /**
     * Обновить канал пользователя
     * @param {string} userId - ID пользователя
     * @param {string} guildId - ID сервера
     * @param {string} newChannelId - Новый ID канала
     * @returns {boolean} - Успешность операции
     */
    updateChannel(userId, guildId, newChannelId) {
        const result = this.statements.updateChannel.run(newChannelId, userId, guildId);
        return result.changes > 0;
    }

    /**
     * Удалить запись пользователя
     * @param {string} userId - ID пользователя
     * @param {string} guildId - ID сервера
     * @returns {boolean} - Успешность операции
     */
    deleteRecord(userId, guildId) {
        const result = this.statements.delete.run(userId, guildId);
        return result.changes > 0;
    }

    /**
     * Получить запись пользователя по ID пользователя и сервера
     * @param {string} userId - ID пользователя
     * @param {string} guildId - ID сервера
     * @returns {Object|null} - Запись или null
     */
    getRecord(userId, guildId) {
        return this.statements.selectByUserGuild.get(userId, guildId) || null;
    }

    /**
     * Получить все записи на сервере
     * @param {string} guildId - ID сервера
     * @returns {Array} - Массив записей
     */
    getRecordsByGuild(guildId) {
        return this.statements.selectByGuild.all(guildId);
    }

    /**
     * Получить запись по каналу
     * @param {string} channelId - ID канала
     * @returns {Object|null} - Запись или null
     */
    getRecordByChannel(channelId) {
        return this.statements.selectByChannel.get(channelId) || null;
    }

    /**
     * Увеличить штрафные очки пользователя
     * @param {string} userId - ID пользователя
     * @param {string} guildId - ID сервера
     * @param {number} points - Количество очков для добавления
     * @returns {boolean} - Успешность операции
     */
    addPoints(userId, guildId, points = 1) {
        const record = this.getRecord(userId, guildId);
        if (!record) {
            return false;
        }
        return this.updatePoints(userId, guildId, record.negative_points + points);
    }

    /**
     * Уменьшить штрафные очки пользователя
     * @param {string} userId - ID пользователя
     * @param {string} guildId - ID сервера
     * @param {number} points - Количество очков для вычитания
     * @returns {boolean} - Успешность операции
     */
    removePoints(userId, guildId, points = 1) {
        const record = this.getRecord(userId, guildId);
        if (!record) {
            return false;
        }
        const newPoints = Math.max(0, record.negative_points - points);
        return this.updatePoints(userId, guildId, newPoints);
    }

    /**
     * Закрыть соединение с базой данных
     */
    close() {
        this.db.close();
    }
}

module.exports = UserPunishmentDB;