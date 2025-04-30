const Database = require('better-sqlite3');
const path = require('path');

class TagsDB {
    /**
     * @param {string} dbName Имя файла базы данных (например, 'tags.db')
     */
    constructor(dbName = 'tags.db') {
        // Инициализация соединения с БД
        try {
            this.db = new Database(dbName, { /* verbose: console.log */ });
            this.db.pragma('journal_mode = WAL');
            this._initDb();
        } catch (error) {
            console.error('[DB] Ошибка при инициализации базы данных:', error);
            throw error;
        }
    }

    /**
     * Инициализирует структуру таблицы в БД, если она не существует.
     * @private
     */
    _initDb() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tags (
                serverId TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                content TEXT,
                disallowedChannelsId TEXT DEFAULT '',
                allowedChannelId TEXT DEFAULT '',
                PRIMARY KEY (serverId, name)
            );
        `;
        try {
            this.db.exec(createTableQuery);
            console.log('[DB] Таблица tags успешно проверена/создана.');
        } catch (error) {
            console.error('[DB] Ошибка при создании таблицы tags:', error);
            throw error;
        }
    }

    /**
     * Преобразует массив ID в строку, разделенную пробелами.
     * @param {Array<string|number>} idArray Массив ID.
     * @returns {string} Строка ID или пустая строка.
     * @private
     */
    _arrayToString(idArray) {
        if (!Array.isArray(idArray) || idArray.length === 0) {
            return '';
        }
        // Убираем пустые значения и преобразуем в строки перед соединением
        return idArray.filter(id => id != null && id !== '').map(String).join(' ');
    }

    /**
     * Преобразует строку ID, разделенную пробелами, в массив чисел.
     * @param {string|null} idString Строка ID.
     * @returns {Array<number>} Массив ID или пустой массив.
     * @private
     */
    _stringToArray(idString) {
        if (typeof idString !== 'string' || idString.trim() === '') {
            return [];
        }
        return idString.split(' ').filter(id => id.trim() !== '').map(Number);
    }

    /**
     * Форматирует результат из БД в ожидаемый JS-объект.
     * @param {object} row Строка данных из БД.
     * @returns {object|null} Отформатированный объект или null.
     * @private
     */
    _formatOutput(row) {
        if (!row) {
            return null;
        }
        return {
            serverId: row.serverId,
            name: row.name,
            description: row.description,
            disallowedChannelsId: this._stringToArray(row.disallowedChannelsId),
            allowedChannelId: this._stringToArray(row.allowedChannelId),
        };
    }

    // --- Публичные методы CRUD ---

    /**
     * Записывает новую конфигурацию сервера или перезаписывает существующую.
     * Использует INSERT OR REPLACE для простоты.
     *
     * @param {string} serverId Уникальный идентификатор сервера.
     * @param {string} name Название конфигурации.
     * @param {string} description Описание.
     * @param {Array<string|number>} [disallowedChannelsId=[]] Массив ID запрещенных каналов.
     * @param {Array<string|number>} [allowedChannelId=[]] Массив ID разрешенных каналов.
     * @returns {boolean} true в случае успеха, false в случае ошибки.
     */
    add(serverId, name, description, disallowedChannelsId = [], allowedChannelId = []) {
        const insertQuery = `
            INSERT OR REPLACE INTO tags
            (serverId, name, content, disallowedChannelsId, allowedChannelId)
            VALUES (?, ?, ?, ?, ?)
        `;
        try {
            const stmt = this.db.prepare(insertQuery);
            const result = stmt.run(
                serverId,
                name,
                description,
                this._arrayToString(disallowedChannelsId),
                this._arrayToString(allowedChannelId)
            );
            // result.changes > 0 означает, что строка была вставлена или заменена
            return result.changes > 0;
        } catch (error) {
            console.error(`[DB] Ошибка при записи конфигурации для serverId ${serverId}:`, error);
            return false;
        }
    }

     /**
     * Получает конфигурацию сервера по ID.
     * @param {string} serverId Идентификатор сервера.
     * @returns {object|null} Объект конфигурации или null, если не найден.
     */
     get(serverId, name) {
        const selectQuery = 'SELECT content FROM tags WHERE serverId = ? AND name = ?';
        try {
            const stmt = this.db.prepare(selectQuery);
            const row = stmt.get(serverId, name);
            return this._formatOutput(row);
        } catch (error) {
            console.error(`[DB] Ошибка при получении конфигурации для serverId ${serverId}:`, error);
            return null;
        }
    }


    /**
     * Изменяет существующую конфигурацию сервера.
     * Можно передавать только те поля, которые нужно изменить.
     *
     * @param {string} serverId Идентификатор сервера для обновления.
     * @param {object} updates Объект с полями для обновления (например, { name: 'Новое имя', content: 'Новое описание' }).
     *                         Может содержать name, content, disallowedChannelsId, allowedChannelId.
     * @returns {boolean} true если обновление прошло успешно (и запись существовала), false иначе.
     */
    edit(serverId, name, updates) {
        // Проверяем, есть ли что обновлять
        const validKeys = ['content', 'disallowedChannelsId', 'allowedChannelId'];
        const keysToUpdate = Object.keys(updates).filter(key => validKeys.includes(key) && updates[key] !== undefined);

        if (keysToUpdate.length === 0) {
            console.warn(`[DB] Нет полей для обновления для serverId ${serverId}.`);
            return false; // Нет изменений
        }

        // Подготовка данных для SQL (конвертация массивов в строки)
        const params = [];
        const setClauses = keysToUpdate.map(key => {
            let value = updates[key];
            if (key === 'disallowedChannelsId' || key === 'allowedChannelId') {
                value = this._arrayToString(value); // Конвертируем массив в строку
            }
            params.push(value);
            // Используем ` внутри `` для имен столбцов, чтобы избежать конфликтов с ключевыми словами SQL (хотя здесь это не обязательно)
            return `\`${key}\` = ?`;
        });

        // Добавляем serverId в конец параметров для WHERE клаузы
        params.push(serverId, name);

        const updateQuery = `
            UPDATE tags
            SET ${setClauses.join(', ')}
            WHERE serverId = ? AND name = ?
        `;

        try {
            const stmt = this.db.prepare(updateQuery);
            const result = stmt.run(...params);
            // result.changes > 0 означает, что строка была найдена и обновлена
            return result.changes > 0;
        } catch (error) {
            console.error(`[DB] Ошибка при обновлении конфигурации для serverId ${serverId}:`, error);
            return false;
        }
    }

    /**
     * Удаляет тег
     * @param {string} serverId Идентификатор сервера для удаления.
     * @returns {boolean} true если удаление прошло успешно (и запись существовала), false иначе.
     */
    remove(serverId, name) {
        const deleteQuery = 'DELETE FROM tags WHERE serverId = ? AND name = ?';
        try {
            const stmt = this.db.prepare(deleteQuery);
            const result = stmt.run(serverId, name);
            return result.changes > 0;
        } catch (error) {
            console.error(`[DB] Ошибка при удалении конфигурации для serverId ${serverId}:`, error);
            return false;
        }
    }

    /**
     * Закрывает соединение с базой данных.
     * Важно вызвать при завершении работы приложения.
     */
    close() {
        if (this.db) {
            this.db.close();
            console.log('[DB] Соединение с базой данных закрыто.');
        }
    }

    /**
     * Получает все конфигурации. Полезно для отладки или администрирования.
     * @returns {Array<object>} Массив всех конфигураций.
     */
    getAllTags() {
        const selectAllQuery = 'SELECT * FROM tags';
        try {
            const stmt = this.db.prepare(selectAllQuery);
            const rows = stmt.all();
            return rows.map(row => this._formatOutput(row));
        } catch (error) {
            console.error('[DB] Ошибка при получении всех конфигураций:', error);
            return [];
        }
    }
}

module.exports = TagsDB;