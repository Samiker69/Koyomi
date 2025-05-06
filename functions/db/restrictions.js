const Database = require('better-sqlite3');

class DisabledCommandsDB {
    constructor(dbPath = 'disabled_commands.db') {
        this.db = new Database(dbPath); // , { verbose: console.log } // для отладки SQL запросов
        this._initTable();
    }

    /**
     * Инициализирует таблицу для хранения отключенных команд, если она не существует.
     * @private
     */
    _initTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS disabled_commands (
                guild_id TEXT NOT NULL,
                command_name TEXT NOT NULL,
                PRIMARY KEY (guild_id, command_name)
            )
        `;
        this.db.exec(query);
    }

    /**
     * Добавляет команду в список отключенных для указанного guildId.
     * Если команда уже отключена, ничего не происходит.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @returns {boolean} true, если команда была успешно добавлена (или уже была), false при ошибке.
     */
    add(guildId, commandName) {
        if (!guildId || !commandName) {
            console.error("guildId и commandName не могут быть пустыми.");
            return false;
        }
        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO disabled_commands (guild_id, command_name) VALUES (?, ?)');
            const info = stmt.run(guildId, commandName);
            return true; // info.changes > 0 если была вставка, 0 если уже существует (IGNORE)
        } catch (error) {
            console.error("Ошибка при добавлении команды:", error);
            return false;
        }
    }

    /**
     * Удаляет команду из списка отключенных для указанного guildId.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @returns {boolean} true, если команда была успешно удалена, false если не найдена или при ошибке.
     */
    remove(guildId, commandName) {
        if (!guildId || !commandName) {
            console.error("guildId и commandName не могут быть пустыми.");
            return false;
        }
        try {
            const stmt = this.db.prepare('DELETE FROM disabled_commands WHERE guild_id = ? AND command_name = ?');
            const info = stmt.run(guildId, commandName);
            return info.changes > 0; // true если что-то было удалено
        } catch (error) {
            console.error("Ошибка при удалении команды:", error);
            return false;
        }
    }

    /**
     * Проверяет, отключена ли команда для указанного guildId.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @returns {boolean} true, если команда отключена, иначе false.
     */
    isDisabled(guildId, commandName) {
        if (!guildId || !commandName) {
            return false;
        }
        try {
            const stmt = this.db.prepare('SELECT 1 FROM disabled_commands WHERE guild_id = ? AND command_name = ? LIMIT 1');
            const row = stmt.get(guildId, commandName);
            return !!row; // true если запись найдена, false если row === undefined
        } catch (error) {
            console.error("Ошибка при проверке команды:", error);
            return false; // В случае ошибки считаем, что не отключена (безопасный вариант)
        }
    }

    /**
     * Получает все отключенные команды для указанного guildId.
     * @param {string} guildId ID сервера (гильдии).
     * @returns {string[]} Массив имен отключенных команд. Пустой массив, если ничего не найдено или ошибка.
     */
    getDisabledCommands(guildId) {
        if (!guildId) {
            return [];
        }
        try {
            const stmt = this.db.prepare('SELECT command_name FROM disabled_commands WHERE guild_id = ?');
            const rows = stmt.all(guildId);
            return rows.map(row => row.command_name);
        } catch (error) {
            console.error("Ошибка при получении списка отключенных команд:", error);
            return [];
        }
    }

    /**
     * Закрывает соединение с базой данных.
     */
    close() {
        this.db.close();
        console.log("Соединение с БД 'disabled_commands.sqlite' закрыто.");
    }
}

module.exports = DisabledCommandsDB;