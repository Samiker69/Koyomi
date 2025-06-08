const Database = require('better-sqlite3');

class DisabledCommandsDB {
    constructor(dbPath = './database/moderation.db') {
        this.db = new Database(dbPath);
        this._initTable();
    }

    /**
     * Инициализирует таблицу для хранения отключенных команд, если она не существует.
     * Добавляем столбец user_id и уникальное ограничение на комбинацию guild_id, user_id, command_name.
     * @private
     */
    _initTable() {
        // Проверяем, существует ли таблица disabled_commands
        const tableExists = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='disabled_commands';").get();

        if (!tableExists) {
            const createTableQuery = `
                CREATE TABLE disabled_commands (
                    guild_id TEXT NOT NULL,
                    user_id TEXT, -- NULL для ограничений всей гильдии
                    command_name TEXT NOT NULL,
                    UNIQUE (guild_id, user_id, command_name) -- Уникальность для комбинации
                )
            `;
            this.db.exec(createTableQuery);
            console.log("Table 'disabled_commands' created.");
        } else {
            // Проверяем, есть ли столбец user_id. Если нет, добавляем его.
            const columnExists = this.db.prepare("PRAGMA table_info(disabled_commands);").all().some(col => col.name === 'user_id');
            if (!columnExists) {
                 // SQLite позволяет добавлять nullable столбцы без пересоздания таблицы
                 this.db.exec('ALTER TABLE disabled_commands ADD COLUMN user_id TEXT;');
                 console.log("Column 'user_id' added to 'disabled_commands'.");

                 // Добавляем уникальное ограничение, если его нет.
                 // Это может потребовать удаления старых ограничений, если они были,
                 // или временного переименования таблицы и копирования данных.
                 // Для простоты примера, будем считать, что если user_id не было, то и уникального ограничения не было.
                 try {
                     this.db.exec('CREATE UNIQUE INDEX unique_restriction ON disabled_commands (guild_id, user_id, command_name);');
                     console.log("Unique index 'unique_restriction' created.");
                 } catch (e) {
                     // Индекс уже может существовать, игнорируем ошибку
                     if (!e.message.includes("index unique_restriction already exists")) {
                        console.error("Error creating unique index:", e);
                     }
                 }

            } else {
                // Столбец user_id уже существует. Проверяем уникальное ограничение.
                 try {
                     this.db.exec('CREATE UNIQUE INDEX unique_restriction ON disabled_commands (guild_id, user_id, command_name);');
                     // console.log("Unique index 'unique_restriction' checked/created.");
                 } catch (e) {
                      if (!e.message.includes("index unique_restriction already exists")) {
                        console.error("Error ensuring unique index:", e);
                     }
                 }
            }
        }
    }


    /**
     * Добавляет команду в список отключенных для указанного guildId и/или userId.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @param {string|null} userId ID пользователя. Null для ограничений всей гильдии.
     * @returns {boolean} true, если команда была успешно добавлена (или уже была), false при ошибке.
     */
    add(guildId, commandName, userId = null) {
        if (!guildId || !commandName) {
            console.error("guildId и commandName не могут быть пустыми.");
            return false;
        }
        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO disabled_commands (guild_id, user_id, command_name) VALUES (?, ?, ?)');
            const info = stmt.run(guildId, userId, commandName);
             // Возвращаем true, если произошла вставка (changes > 0), или если запись уже существовала (IGNORE сработал).
             // По сути, операция "успешна", если после нее запись существует.
            return true;
        } catch (error) {
            console.error("Ошибка при добавлении ограничения:", error);
            return false;
        }
    }

    /**
     * Удаляет команду из списка отключенных для указанного guildId и/или userId.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @param {string|null} userId ID пользователя. Null для ограничений всей гильдии.
     * @returns {boolean} true, если ограничение было успешно удалено, false если не найдено или при ошибке.
     */
    remove(guildId, commandName, userId = null) {
        if (!guildId || !commandName) {
            console.error("guildId и commandName не могут быть пустыми.");
            return false;
        }
        try {
            // Для удаления ограничения всей гильдии, user_id должен быть NULL
            // Для удаления ограничения пользователя, user_id должен соответствовать
            const stmt = this.db.prepare('DELETE FROM disabled_commands WHERE guild_id = ? AND command_name = ? AND user_id IS ?');
            const info = stmt.run(guildId, commandName, userId);
            return info.changes > 0; // true если что-то было удалено
        } catch (error) {
            console.error("Ошибка при удалении ограничения:", error);
            return false;
        }
    }

    /**
     * Проверяет, отключена ли команда для указанного пользователя в указанной гильдии.
     * Проверяет как ограничения всей гильдии, так и персональные ограничения пользователя.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @param {string} userId ID пользователя.
     * @returns {boolean} true, если команда отключена (для гильдии или для пользователя), иначе false.
     */
    isDisabled(guildId, commandName, userId) {
        if (!guildId || !commandName || !userId) {
            // Для проверки пользователя нужны все три параметра
            return false;
        }
        try {
            // Проверяем наличие ограничения для всей гильдии (user_id IS NULL)
            // ИЛИ Проверяем наличие ограничения для конкретного пользователя (user_id = userId)
            const stmt = this.db.prepare(
                'SELECT 1 FROM disabled_commands WHERE guild_id = ? AND command_name = ? AND (user_id IS NULL OR user_id = ?) LIMIT 1'
            );
            const row = stmt.get(guildId, commandName, userId);
            return !!row; // true если найдено любое подходящее ограничение
        } catch (error) {
            console.error("Ошибка при проверке ограничения для пользователя:", error);
            return false; // В случае ошибки считаем, что не отключена (безопасный вариант)
        }
    }

     /**
     * Проверяет, отключена ли команда для всей гильдии (игнорируя пользовательские ограничения).
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} commandName Имя команды.
     * @returns {boolean} true, если команда отключена для гильдии, иначе false.
     */
     isGuildDisabled(guildId, commandName) {
         if (!guildId || !commandName) {
             return false;
         }
         try {
             const stmt = this.db.prepare('SELECT 1 FROM disabled_commands WHERE guild_id = ? AND command_name = ? AND user_id IS NULL LIMIT 1');
             const row = stmt.get(guildId, commandName);
             return !!row;
         } catch (error) {
             console.error("Ошибка при проверке ограничения гильдии:", error);
             return false;
         }
     }


    /**
     * Получает все отключенные для всей гильдии команды.
     * @param {string} guildId ID сервера (гильдии).
     * @returns {string[]} Массив имен отключенных команд для гильдии. Пустой массив, если ничего не найдено или ошибка.
     */
    getGuildRestrictions(guildId) {
        if (!guildId) {
            return [];
        }
        try {
            const stmt = this.db.prepare('SELECT command_name FROM disabled_commands WHERE guild_id = ? AND user_id IS NULL');
            const rows = stmt.all(guildId);
            return rows.map(row => row.command_name);
        } catch (error) {
            console.error("Ошибка при получении списка ограничений гильдии:", error);
            return [];
        }
    }

     /**
     * Получает все отключенные для конкретного пользователя команды в гильдии.
     * @param {string} guildId ID сервера (гильдии).
     * @param {string} userId ID пользователя.
     * @returns {string[]} Массив имен отключенных команд для пользователя. Пустой массив, если ничего не найдено или ошибка.
     */
    getUserRestrictions(guildId, userId) {
        if (!guildId || !userId) {
            return [];
        }
        try {
            const stmt = this.db.prepare('SELECT command_name FROM disabled_commands WHERE guild_id = ? AND user_id = ?');
            const rows = stmt.all(guildId, userId);
            return rows.map(row => row.command_name);
        } catch (error) {
            console.error("Ошибка при получении списка ограничений пользователя:", error);
            return [];
        }
    }

    /**
     * Закрывает соединение с базой данных.
     */
    close() {
        this.db.close();
        console.log("Соединение с БД 'restrictions.db' закрыто.");
    }
}

module.exports = DisabledCommandsDB;