const Database = require('better-sqlite3');
const path = require('path'); // Для удобства работы с путями

// Определим константы для имен настроек и настроек типа boolean
const VALID_SETTINGS = [
    'logchannel',
    'newMemberChannelId',
    'inviteLoggerChannel',
    'allowInviteLogging',
    'allowLogingMembersAdd',
    'mainVoiceChannelId',
    'voiceCategoryId'
];
const BOOLEAN_SETTINGS = ['allowInviteLogging', 'allowLogingMembersAdd'];

class SettingsDatabase {
    /**
     * Создает экземпляр базы данных настроек.
     * @param {string} [dbPath='settings.db'] Путь к файлу базы данных SQLite.
     */
    constructor(dbPath = 'settings.db') {
        try {
            // Инициализируем соединение с БД
            // verbose: console.log можно раскомментировать для отладки SQL-запросов
            this.db = new Database(dbPath /*, { verbose: console.log } */);
            console.log(`Подключено к базе данных: ${path.resolve(dbPath)}`);

            // Инициализируем таблицу при создании объекта
            this._initTable();

            // Подготавливаем часто используемые SQL-запросы для производительности
            this._prepareStatements();

        } catch (err) {
            console.error("Ошибка инициализации базы данных:", err);
            throw err; // Пробрасываем ошибку дальше, чтобы приложение знало о проблеме
        }
    }

    /**
     * Инициализирует таблицу настроек, если она не существует.
     * @private
     */
    _initTable() {
        // TEXT для ID каналов/категорий (снежинки Discord - строки)
        // INTEGER для boolean (0 = false, 1 = true)
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS guild_settings (
                guildId TEXT PRIMARY KEY,
                logchannel TEXT DEFAULT '',
                newMemberChannelId TEXT DEFAULT '',
                inviteLoggerChannel TEXT DEFAULT '',
                allowInviteLogging INTEGER DEFAULT 0,  -- 0 for false, 1 for true
                allowLogingMembersAdd INTEGER DEFAULT 0, -- 0 for false, 1 for true
                mainVoiceChannelId TEXT DEFAULT '',
                voiceCategoryId TEXT DEFAULT ''
            );
        `;
        this.db.exec(createTableQuery);
        console.log("Таблица 'guild_settings' инициализирована.");
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
         console.log("SQL-запросы подготовлены.");
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
            console.error("getSettings: Предоставлен неверный guildId:", guildId);
            return undefined;
        }
        try {
            const row = this.statements.getSettings.get(guildId);
            return this._formatSettings(row);
        } catch (err) {
            console.error(`Ошибка получения настроек для сервера ${guildId}:`, err);
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
            throw new Error("addServer: guildId должен быть непустой строкой.");
        }
        try {
            // Выполняем INSERT OR IGNORE. Значения по умолчанию будут установлены схемой таблицы.
            const result = this.statements.addServer.run(guildId);
            if (result.changes > 0) {
                console.log(`Сервер ${guildId} добавлен в БД с настройками по умолчанию.`);
            } else {
                console.log(`Сервер ${guildId} уже существует в БД.`);
            }
            return result;
        } catch (err) {
            console.error(`Ошибка добавления сервера ${guildId}:`, err);
            throw err; // Пробрасываем ошибку для обработки выше
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
            throw new Error("removeServer: guildId должен быть непустой строкой.");
        }
        try {
            const result = this.statements.removeServer.run(guildId);
             if (result.changes > 0) {
                console.log(`Настройки для сервера ${guildId} удалены из БД.`);
            } else {
                console.log(`Сервер ${guildId} не найден в БД для удаления.`);
            }
            return result;
        } catch (err) {
             console.error(`Ошибка удаления сервера ${guildId}:`, err);
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
            throw new Error("updateSetting: guildId должен быть непустой строкой.");
        }
        if (!VALID_SETTINGS.includes(settingName)) {
            throw new Error(`Недопустимое имя настройки: ${settingName}. Допустимые: ${VALID_SETTINGS.join(', ')}`);
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
            // Получаем подготовленный запрос для нужной настройки
            const statement = this.statements.update[settingName];
            if (!statement) {
                 // Эта ошибка не должна возникать при правильной инициализации
                 throw new Error(`Внутренняя ошибка: Подготовленный запрос для '${settingName}' не найден.`);
            }
            // Выполняем UPDATE. Важен порядок аргументов: [value, guildId]
            const result = statement.run(dbValue, guildId);

            if (result.changes === 0) {
                 console.warn(`Настройка '${settingName}' для сервера ${guildId} не была обновлена (возможно, сервер не найден или значение не изменилось).`);
                 // Можно добавить проверку, существует ли сервер вообще перед обновлением
                 // const exists = this.db.prepare('SELECT 1 FROM guild_settings WHERE guildId = ?').get(guildId);
                 // if (!exists) throw new Error(`Сервер ${guildId} не найден в базе данных.`);
            } else {
                 console.log(`Настройка '${settingName}' для сервера ${guildId} обновлена на '${value}'.`);
            }

            return result;
        } catch (err) {
            console.error(`Ошибка обновления настройки '${settingName}' для сервера ${guildId}:`, err);
            throw err;
        }
    }

    /**
     * Закрывает соединение с базой данных.
     * Важно вызывать при завершении работы бота.
     */
    close() {
        if (this.db && this.db.open) {
            this.db.close();
            console.log("Соединение с базой данных закрыто.");
        }
    }
}

module.exports = SettingsDatabase;