const Database = require('better-sqlite3');

class ModerationDB {
    constructor(dbPath = './database/main.db') {
        this.db = new Database(dbPath);
        this.initSchema(); // Инициализируем структуру таблицы при создании объекта
    }

    // Инициализация схемы БД (создание таблицы, если ее нет)
    initSchema() {
        const sql = `
            CREATE TABLE IF NOT EXISTS mod_cases (
                serverId TEXT NOT NULL,
                caseNum INTEGER NOT NULL,
                targetId TEXT NOT NULL,
                moderatorId TEXT NOT NULL,
                action TEXT NOT NULL CHECK(action IN ('ban', 'mute', 'kick', 'unban', 'unmute', 'warn', 'unwarn')),
                reason TEXT,
                timestamp INTEGER NOT NULL,
                PRIMARY KEY (serverId, caseNum) -- Уникальный ключ для каждого сервера
            );

            -- Индексы для ускорения поиска
            CREATE INDEX IF NOT EXISTS idx_mod_cases_target ON mod_cases (targetId, serverId);
            CREATE INDEX IF NOT EXISTS idx_mod_cases_timestamp ON mod_cases (timestamp DESC);
        `;
        this.db.exec(sql);
        console.log('Схема базы данных mod_cases инициализирована.');
    }

    // Подготовка запросов (делаем один раз для производительности)
    prepareStatements() {
        if (!this._statements) {
            this._statements = {
                getNextCaseNum: this.db.prepare('SELECT MAX(caseNum) as maxCaseNum FROM mod_cases WHERE serverId = ?'),
                insertCase: this.db.prepare(`
                    INSERT INTO mod_cases (serverId, caseNum, targetId, moderatorId, action, reason, timestamp)
                    VALUES (@serverId, @caseNum, @targetId, @moderatorId, @action, @reason, @timestamp)
                `),
                getCase: this.db.prepare('SELECT * FROM mod_cases WHERE serverId = ? AND caseNum = ?'),
                updateReason: this.db.prepare('UPDATE mod_cases SET reason = ? WHERE serverId = ? AND caseNum = ?'),
                deleteCase: this.db.prepare('DELETE FROM mod_cases WHERE serverId = ? AND caseNum = ?'),
                getTargetCases: this.db.prepare('SELECT * FROM mod_cases WHERE serverId = ? AND targetId = ? ORDER BY caseNum DESC'),
                getServerCases: this.db.prepare('SELECT * FROM mod_cases WHERE serverId = ? ORDER BY caseNum DESC'),
                getUserWarnings: this.db.prepare(`
                    SELECT
                        COALESCE(SUM(CASE WHEN action = 'warn' THEN 1 ELSE 0 END), 0) AS warns,
                        COALESCE(SUM(CASE WHEN action = 'unwarn' THEN 1 ELSE 0 END), 0) AS unwarns,
                        COALESCE(SUM(CASE WHEN action = 'warn' THEN 1 ELSE 0 END), 0)
                          - COALESCE(SUM(CASE WHEN action = 'unwarn' THEN 1 ELSE 0 END), 0)
                          AS true_warns
                    FROM mod_cases
                    WHERE targetId = ? AND serverId = ?
                `),
            };
        }
        return this._statements;
    }

    /**
     * Добавляет новый кейс модерации.
     * @param {object} caseData
     * @param {string} caseData.serverId ID сервера (гильдии)
     * @param {string} caseData.targetId ID целевого пользователя
     * @param {string} caseData.moderatorId ID модератора
     * @param {'ban'|'mute'|'kick'|'unban'|'unmute'|'warn'} caseData.action Тип действия
     * @param {string} [caseData.reason] Причина (опционально)
     * @param {Date} [caseData.timestamp] Время события (по умолчанию Date.now())
     * @returns {object} Добавленный кейс с присвоенным caseNum
     */
    addModCase(caseData) {
        const { serverId, targetId, moderatorId, action, reason = null, timestamp = new Date() } = caseData;
        const stmts = this.prepareStatements();

        if (!serverId || !targetId || !moderatorId || !action) {
            throw new Error('Не все обязательные поля предоставлены для добавления кейса.');
        }
        if (!['ban', 'mute', 'kick', 'unban', 'unmute', 'warn', 'unwarn'].includes(action)) {
            throw new Error(`Недопустимое действие: ${action}`);
        }

        // Определение следующего caseNum В ТРАНЗАКЦИИ (важно для атомарности)
        const addTransaction = this.db.transaction(() => {
            // 1. Получаем максимальный текущий номер кейса для этого сервера
            const result = stmts.getNextCaseNum.get(serverId);
            const nextCaseNum = (result?.maxCaseNum || 0) + 1;

            // 2. Вставляем новый кейс
            const insertData = {
                serverId,
                caseNum: nextCaseNum,
                targetId,
                moderatorId,
                action,
                reason,
                // Храним timestamp как целое число (Unix time milliseconds)
                timestamp: timestamp instanceof Date ? timestamp.getTime() : Date.now()
            };
            const info = stmts.insertCase.run(insertData);

            if (info.changes !== 1) {
                throw new Error('Не удалось вставить кейс в базу данных.');
            }

            console.log(`Добавлен кейс #${nextCaseNum} для сервера ${serverId}`);
            // Возвращаем полные данные добавленного кейса
            return { ...insertData, caseNum: nextCaseNum };
        });

        return addTransaction(); // Запускаем транзакцию
    }

    /**
     * Получает кейс по номеру и ID сервера.
     * @param {string} serverId ID сервера
     * @param {number} caseNum Номер кейса
     * @returns {object | undefined} Найденный кейс или undefined
     */
    getModCase(serverId, caseNum) {
        const stmts = this.prepareStatements();
        const caseData = stmts.getCase.get(serverId, caseNum);
         if (caseData) {
            // Преобразуем timestamp обратно в Date для удобства
            caseData.timestamp = new Date(caseData.timestamp);
        }
        return caseData;
    }

     /**
     * Получает все кейсы для конкретного пользователя на сервере.
     * @param {string} serverId ID сервера
     * @param {string} targetId ID пользователя
     * @returns {object[]} Массив найденных кейсов
     */
    getTargetModCases(serverId, targetId) {
        const stmts = this.prepareStatements();
        const cases = stmts.getTargetCases.all(serverId, targetId);
        // Преобразуем timestamp
        cases.forEach(c => c.timestamp = new Date(c.timestamp));
        return cases;
    }

     /**
     * Получает все кейсы на сервере.
     * @param {string} serverId ID сервера
     * @returns {object[]} Массив всех кейсов сервера
     */
    getServerModCases(serverId) {
        const stmts = this.prepareStatements();
        const cases = stmts.getServerCases.all(serverId);
        // Преобразуем timestamp
        cases.forEach(c => c.timestamp = new Date(c.timestamp));
        return cases;
    }

    /**
     * 
     * @param {string} serverId ID сервера
     * @param {string} targetId ID пользователя
     * @returns {{warns: Number, unwarns: Number, true_warns: Number}} Объект всех кейсов с варнами и общая сумма действующих варнов
     */
    getUserWarnings(serverId, targetId) {
        const stmts = this.prepareStatements();
        const warns = stmts.getUserWarnings.get(targetId, serverId);
        return warns
    }

    /**
     * Обновляет причину для существующего кейса.
     * @param {string} serverId ID сервера
     * @param {number} caseNum Номер кейса
     * @param {string} newReason Новая причина
     * @returns {boolean} true, если обновление успешно, иначе false
     */
    updateModCaseReason(serverId, caseNum, newReason) {
        const stmts = this.prepareStatements();
        const info = stmts.updateReason.run(newReason, serverId, caseNum);
        const success = info.changes === 1;
        if (success) {
            console.log(`Обновлена причина для кейса #${caseNum} на сервере ${serverId}`);
        } else {
             console.warn(`Кейс #${caseNum} на сервере ${serverId} не найден для обновления.`);
        }
        return success;
    }

    /**
     * Удаляет кейс модерации.
     * @param {string} serverId ID сервера
     * @param {number} caseNum Номер кейса
     * @returns {boolean} true, если удаление успешно, иначе false
     */
    deleteModCase(serverId, caseNum) {
        const stmts = this.prepareStatements();
        const info = stmts.deleteCase.run(serverId, caseNum);
         const success = info.changes === 1;
        if (success) {
            console.log(`Удален кейс #${caseNum} с сервера ${serverId}`);
        } else {
             console.warn(`Кейс #${caseNum} на сервере ${serverId} не найден для удаления.`);
        }
        return success;
    }

    // Метод для безопасного закрытия соединения
    close() {
        if (this.db) {
            this.db.close();
            console.log('Соединение с базой данных SQLite закрыто.');
        }
    }
}

module.exports = ModerationDB; // Экспортируем класс