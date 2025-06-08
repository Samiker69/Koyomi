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
    'voiceCategoryId',
    'supportChannelId',
    'prefix',
    'webhookLogId',           // НОВАЯ НАСТРОЙКА
    'webhookLogToken',        // НОВАЯ НАСТРОЙКА
    'webhookLogChannelId',    // НОВАЯ НАСТРОЙКА (ID канала, где находится вебхук)
    'enableWebhookLogging'    // НОВАЯ НАСТРОЙКА (флаг включения/выключения)
];
const BOOLEAN_SETTINGS = [
    'allowInviteLogging',
    'allowLogingMembersAdd',
    'enableWebhookLogging'
];

class SettingsDatabase {
    /**
     * Создает экземпляр базы данных настроек.
     * @param {string} [dbPath='settings.db'] Путь к файлу базы данных SQLite.
     */
    constructor(dbPath = 'settings.db') {
        try {
            this.db = new Database(dbPath /*, { verbose: console.log } */);
            //console.log(`Подключено к базе данных: ${path.resolve(dbPath)}`);

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
     * Инициализирует таблицу настроек, если она не существует, или добавляет новые столбцы, если их нет.
     * @private
     */
    _initTable() {
        // Создаем таблицу с базовыми полями, если ее нет
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guild_settings (
                guildId TEXT PRIMARY KEY,
                logchannel TEXT DEFAULT '',
                newMemberChannelId TEXT DEFAULT '',
                inviteLoggerChannel TEXT DEFAULT '',
                allowInviteLogging INTEGER DEFAULT 0,
                allowLogingMembersAdd INTEGER DEFAULT 0,
                mainVoiceChannelId TEXT DEFAULT '',
                voiceCategoryId TEXT DEFAULT '',
                supportChannelId TEXT DEFAULT '',
                prefix TEXT DEFAULT '..'
            );
        `);

        // Добавляем новые столбцы, если они еще не существуют.
        // Это позволяет обновить существующие базы данных без их удаления.
        const alterTableQueries = [
            "ALTER TABLE guild_settings ADD COLUMN webhookLogId TEXT DEFAULT '';",
            "ALTER TABLE guild_settings ADD COLUMN webhookLogToken TEXT DEFAULT '';",
            "ALTER TABLE guild_settings ADD COLUMN webhookLogChannelId TEXT DEFAULT '';",
            "ALTER TABLE guild_settings ADD COLUMN enableWebhookLogging INTEGER DEFAULT 0;"
        ];

        // Проверяем наличие каждого столбца перед добавлением
        const existingColumns = this.db.prepare("PRAGMA table_info(guild_settings);").all().map(col => col.name);

        alterTableQueries.forEach(query => {
            const columnName = query.match(/ADD COLUMN (\w+)/)?.[1];
            if (columnName && !existingColumns.includes(columnName)) {
                try {
                    this.db.exec(query);
                    console.log(`[DB] Добавлен столбец '${columnName}' в guild_settings.`);
                } catch (e) {
                    // Игнорируем ошибку, если столбец уже существует (например, при конкурентном доступе)
                    if (!e.message.includes('duplicate column name')) {
                        console.error(`[DB] Ошибка при добавлении столбца '${columnName}':`, e.message);
                    }
                }
            }
        });

        console.log('[DB] Таблица guild_settings успешно проверена/обновлена.');
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
            addServer: this.db.prepare(`
                INSERT OR IGNORE INTO guild_settings (guildId, allowInviteLogging, allowLogingMembersAdd, enableWebhookLogging)
                VALUES (?, ?, ?, ?)
            `),

            // Запрос на удаление настроек сервера
            removeServer: this.db.prepare('DELETE FROM guild_settings WHERE guildId = ?'),

            // Подготовленные запросы для обновления каждой отдельной настройки
            update: {}
        };
        VALID_SETTINGS.forEach(setting => {
            this.statements.update[setting] = this.db.prepare(
                `UPDATE guild_settings SET ${setting} = ? WHERE guildId = ?`
            );
        });
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

        return settings;
    }

    /**
     * Получает настройки для указанного сервера.
     * Если настроек для сервера нет, добавляет его с дефолтными и возвращает их.
     * @param {string} guildId ID сервера Discord.
     * @returns {object} Объект с настройками сервера.
     */
    getSettings(guildId) {
        if (!guildId || typeof guildId !== 'string') {
            console.error("getSettings: Предоставлен неверный guildId:", guildId);
            return {}; // Возвращаем пустой объект, если guildId некорректен
        }
        try {
            let row = this.statements.getSettings.get(guildId);
            if (!row) {
                // Если настроек нет, добавляем сервер с дефолтными и получаем их
                this.addServer(guildId);
                row = this.statements.getSettings.get(guildId); // Повторно получаем после добавления
            }
            return this._formatSettings(row);
        } catch (err) {
            console.error(`Ошибка получения настроек для сервера ${guildId}:`, err);
            return {}; // В случае ошибки возвращаем пустой объект
        }
    }


    /**
     * Добавляет сервер в базу данных с настройками по умолчанию.
     * Если сервер уже существует, операция будет проигнорирована.
     * Вызывается, когда бот присоединяется к новому серверу, или когда запрашиваются настройки для нового сервера.
     * @param {string} guildId ID сервера Discord.
     * @returns {Database.RunResult} Результат выполнения запроса better-sqlite3.
     * @throws {Error} Если guildId не предоставлен или не является строкой.
     */
    addServer(guildId) {
        if (!guildId || typeof guildId !== 'string') {
            throw new Error("addServer: guildId должен быть непустой строкой.");
        }
        try {
            // Устанавливаем дефолтные значения для новых полей при добавлении сервера.
            // Значения 0 соответствуют false для BOOLEAN_SETTINGS.
            const result = this.statements.addServer.run(guildId, 0, 0, 0); // allowInviteLogging, allowLogingMembersAdd, enableWebhookLogging
            if (result.changes > 0) {
                console.log(`Сервер ${guildId} добавлен в БД с настройками по умолчанию.`);
            } else {
                // console.log(`Сервер ${guildId} уже существует в БД.`); // Убрал для уменьшения шума в логах
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
     * @returns {boolean} True, если настройки удалены, false если сервер не найден.
     * @throws {Error} Если guildId не предоставлен или не является строкой, или произошла ошибка БД.
     */
    removeServer(guildId) {
         if (!guildId || typeof guildId !== 'string') {
            throw new Error("removeServer: guildId должен быть непустой строкой.");
        }
        try {
            const result = this.statements.removeServer.run(guildId);
             if (result.changes > 0) {
                console.log(`Настройки для сервера ${guildId} удалены из БД.`);
                return true;
            } else {
                console.log(`Сервер ${guildId} не найден в БД для удаления.`);
                return false;
            }
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
                 // console.warn(`Настройка '${settingName}' для сервера ${guildId} не была обновлена (возможно, сервер не найден или значение не изменилось).`); // Убрал для уменьшения шума
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
     */
    close() {
        if (this.db && this.db.open) {
            this.db.close();
            console.log("Соединение с базой данных закрыто.");
        }
    }
}

module.exports = SettingsDatabase;