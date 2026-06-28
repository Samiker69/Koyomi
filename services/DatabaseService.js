const { Op } = require('sequelize');
const {
    sequelize, GuildSetting, RoleMenu, UnsupportedMod, BannedMod, ModMapping,
    AllowedLauncher, ModCase, UserPunishment, DisabledCommand, GeminiUserSetting,
    GeminiSafetySetting, GeminiToken, StarboardSetting, StarboardMessage, Tag,
    Marriage, ParentChild
} = require('../utils/db/models');
const fs = require('fs');
const { Umzug, SequelizeStorage } = require('umzug');

class DatabaseService {
    constructor() {
        this._settingsCache = new Map();
        this._tagsCache = new Map();
        this._geminiUserCache = new Map();
        this._logAnalyzerCache = null;
        this._starboardCache = new Map();
        this._disabledCommandsCache = new Map();
    }

    async init() {
        try {
            if (!fs.existsSync('./database')) {
                fs.mkdirSync('./database');
                console.log('[INFO]: Папка database создана');
            }

            await sequelize.sync(); 
            const umzug = new Umzug({
                migrations: { 
                    glob: 'migrations/*.js',
                    resolve: ({ name, path, context }) => {
                        const migration = require(path);
                        return {
                            name,
                            up: async () => migration.up(context, sequelize.Sequelize),
                            down: async () => migration.down(context, sequelize.Sequelize),
                        };
                    }
                },
                context: sequelize.getQueryInterface(),
                storage: new SequelizeStorage({ sequelize }),
                logger: console,
            });

            const pendingMigrations = await umzug.pending();
            if (pendingMigrations.length > 0) {
                console.log(`[INFO]: Найдено миграций для применения: ${pendingMigrations.length}`);
                await umzug.up();
                console.log('[INFO]: Все миграции успешно применены.');
            } else {
                console.log('[INFO]: База данных актуальна, миграции не требуются.');
            }

            // Автоматическое исправление некорректных форматов дат (числа вместо строк) в таблице mod_cases
            try {
                await sequelize.query(`
                    UPDATE mod_cases 
                    SET timestamp = datetime(timestamp / 1000, 'unixepoch') 
                    WHERE (typeof(timestamp) = 'integer' OR typeof(timestamp) = 'real') AND timestamp > 100000000000;
                `);
                await sequelize.query(`
                    UPDATE mod_cases 
                    SET timestamp = datetime(timestamp, 'unixepoch') 
                    WHERE (typeof(timestamp) = 'integer' OR typeof(timestamp) = 'real') AND timestamp <= 100000000000;
                `);
            } catch (err) {
                console.error('[DB Service] Ошибка при автоматическом исправлении дат:', err);
            }

            const countLaunchers = await AllowedLauncher.count();
            if (countLaunchers === 0) await AllowedLauncher.create({ launcher_name: 'hebe' });

            const countMapping = await ModMapping.count();
            if (countMapping === 0) await ModMapping.create({ original_name: 'yet_another_config_lib_v3', modrinth_id: 'yacl' });
            
            console.log('✅ База данных SQLite (Sequelize) успешно синхронизирована и мигрирована.');
        } catch (error) {
            console.error('❌ Ошибка синхронизации/миграции БД:', error);
            process.exit(1); 
        }
    }

    // ==========================================
    // НАСТРОЙКИ СЕРВЕРА (Guild Settings)
    // ==========================================

    async getSettings(guildId) {
        if (this._settingsCache.has(guildId)) return this._settingsCache.get(guildId);
        
        const settings = await GuildSetting.findByPk(guildId);
        const data = settings ? settings.toJSON() : undefined;
        if (data) this._settingsCache.set(guildId, data);
        return data;
    }

    async updateSetting(guildId, settingName, value) {
        await GuildSetting.update({ [settingName]: value }, { where: { guildId } });
        this._settingsCache.delete(guildId);
        return true;
    }

    async addServer(guildId) {
        await GuildSetting.findOrCreate({ where: { guildId } });
        this._settingsCache.delete(guildId);
        return true;
    }

    async removeServer(guildId) {
        await GuildSetting.destroy({ where: { guildId } });
        this._settingsCache.delete(guildId);
        return true;
    }

    // ==========================================
    // ТЕГИ (Tags)
    // ==========================================

    async getTag(serverId, name) {
        const cacheKey = `${serverId}:${name}`;
        if (this._tagsCache.has(cacheKey)) return this._tagsCache.get(cacheKey);

        const tag = await Tag.findOne({ where: { serverId, name } });
        const data = tag ? tag.toJSON() : null;
        if (data) this._tagsCache.set(cacheKey, data);
        return data;
    }

    async addTag(serverId, name, content, disallowedChannelsId = [], allowedChannelId = []) {
        await Tag.upsert({ serverId, name, content, disallowedChannelsId, allowedChannelId });
        this._tagsCache.delete(`${serverId}:${name}`);
        return true;
    }

    async editTag(serverId, name, updates) {
        await Tag.update(updates, { where: { serverId, name } });
        this._tagsCache.delete(`${serverId}:${name}`);
        return true;
    }

    async getTagsByServer(serverId) {
        const tags = await Tag.findAll({ where: { serverId }, order: [['name', 'ASC']] });
        return tags.map(t => t.toJSON());
    }

    async removeTag(serverId, name) {
        await Tag.destroy({ where: { serverId, name } });
        this._tagsCache.delete(`${serverId}:${name}`);
        return true;
    }

    // ==========================================
    // GEMINI
    // ==========================================

    async getUserGeminiConfig(userId) {
        if (this._geminiUserCache.has(userId)) return this._geminiUserCache.get(userId);

        const config = await GeminiUserSetting.findByPk(userId);
        const data = config ? config.toJSON() : undefined;
        if (data) this._geminiUserCache.set(userId, data);
        return data;
    }

    async updateUserGeminiConfig(userId, updates) {
        await GeminiUserSetting.update(updates, { where: { user_id: userId } });
        this._geminiUserCache.delete(userId);
        return true;
    }

    async getSafetySettings(userId) {
        const cacheKey = `safety:${userId}`;
        if (this._geminiUserCache.has(cacheKey)) return this._geminiUserCache.get(cacheKey);

        const settings = await GeminiSafetySetting.findByPk(userId);
        if (!settings) return null;
        const { user_id, ...data } = settings.toJSON();
        this._geminiUserCache.set(cacheKey, data);
        return data;
    }

    async updateSafetySettings(userId, updates) {
        await GeminiSafetySetting.update(updates, { where: { user_id: userId } });
        this._geminiUserCache.delete(`safety:${userId}`);
        return true;
    }

    async addUserConfig(userId, overrides = {}) {
        await sequelize.transaction(async (t) => {
            await GeminiUserSetting.upsert({ user_id: userId, ...overrides }, { transaction: t });
            await GeminiSafetySetting.findOrCreate({ where: { user_id: userId }, transaction: t });
        });
        this._geminiUserCache.delete(userId);
        this._geminiUserCache.delete(`safety:${userId}`);
        return true;
    }

    async deleteUserConfig(userId) {
        await GeminiUserSetting.destroy({ where: { user_id: userId } });
        this._geminiUserCache.delete(userId);
        this._geminiUserCache.delete(`safety:${userId}`);
        return true;
    }

    async getAllUserTokens(userId) {
        const tokens = await GeminiToken.findAll({ where: { user_id: userId } });
        // Сохраняем формат отдачи как в старом коде [[decrypted], [encrypted]]
        const decrypted = tokens.map(t => t.token); // Геттер автоматически расшифровывает
        const encrypted = tokens.map(t => t.getDataValue('token'));
        return tokens.length > 0 ? [decrypted, encrypted] : [];
    }

    async addToken(userId, token, publicUse) {
        const existing = await this.getAllUserTokens(userId);
        if (existing[0]?.includes(token)) return { changes: 0, message: 'Этот ключ уже добавлен в бд!' };
        
        await GeminiToken.create({ user_id: userId, token, public_use: publicUse });
        return { changes: 1 };
    }

    async deleteToken(userId, token) {
        const tokens = await GeminiToken.findAll({ where: { user_id: userId } });
        const target = tokens.find(t => t.token === token);
        if (!target) return { changes: 0, message: "Этот ключ отсутствует в бд!" };
        
        await target.destroy();
        return { changes: 1 };
    }

    async deleteAllTokensByUser(userId) {
        await GeminiToken.destroy({ where: { user_id: userId } });
        return true;
    }

    async updateTokenSettings(userId, token, updates) {
        const tokens = await GeminiToken.findAll({ where: { user_id: userId } });
        const target = tokens.find(t => t.token === token);
        if (target) {
            await target.update(updates);
            return { changes: 1 };
        }
        return { changes: 0 };
    }

    async getUserStats(userId) {
        const tokens = await GeminiToken.count({ where: { user_id: userId } });
        const usesSum = await GeminiToken.sum('uses', { where: { user_id: userId } });
        return { tokens, uses: usesSum || 0 };
    }

    // ==========================================
    // КЕЙСЫ МОДЕРАЦИИ (Mod Cases)
    // ==========================================

    async addModCase(caseData) {
        const { serverId, targetId, moderatorId, action, reason = null, evidenceUrl = null, timestamp = new Date() } = caseData;
        
        // Транзакция для безопасного получения следующего ID
        return await sequelize.transaction(async (t) => {
            const maxCase = await ModCase.max('caseNum', { where: { serverId }, transaction: t });
            const nextCaseNum = (maxCase || 0) + 1;

            const newCase = await ModCase.create({
                serverId, caseNum: nextCaseNum, targetId, moderatorId, action, reason, evidenceUrl, timestamp
            }, { transaction: t });

            return newCase.toJSON();
        });
    }

    async getModCase(serverId, caseNum) {
        const caseRecord = await ModCase.findOne({ where: { serverId, caseNum } });
        return caseRecord ? caseRecord.toJSON() : undefined;
    }

    async getTargetModCases(serverId, targetId) {
        const cases = await ModCase.findAll({ 
            where: { serverId, targetId }, 
            order: [['caseNum', 'DESC']] 
        });
        return cases.map(c => c.toJSON());
    }

    async getServerModCases(serverId) {
        const cases = await ModCase.findAll({ where: { serverId }, order: [['caseNum', 'DESC']] });
        return cases.map(c => c.toJSON());
    }

    async getUserWarnings(serverId, targetId) {
        const warnsCount = await ModCase.count({ where: { serverId, targetId, action: 'warn' } });
        const unwarnsCount = await ModCase.count({ where: { serverId, targetId, action: 'unwarn' } });
        return {
            warns: warnsCount,
            unwarns: unwarnsCount,
            true_warns: warnsCount - unwarnsCount
        };
    }

    async updateModCaseReason(serverId, caseNum, newReason) {
        const [updated] = await ModCase.update({ reason: newReason }, { where: { serverId, caseNum } });
        return updated > 0;
    }

    async updateModCaseEvidenceUrl(serverId, caseNum, newEvidenceUrl) {
        const [updated] = await ModCase.update({ evidenceUrl: newEvidenceUrl }, { where: { serverId, caseNum } });
        return updated > 0;
    }

    async updateModCaseLogMessageId(serverId, caseNum, logMessageId) {
        const [updated] = await ModCase.update({ logMessageId }, { where: { serverId, caseNum } });
        return updated > 0;
    }

    async deleteModCase(serverId, caseNum) {
        const deleted = await ModCase.destroy({ where: { serverId, caseNum } });
        return deleted > 0;
    }

    // ==========================================
    // РОЛЬ-МЕНЮ (Role Menus)
    // ==========================================

    async addRoleMenu(messageId, guildId, channelId, type, roles) {
        await RoleMenu.upsert({ messageId, guildId, channelId, type, roles });
        return true;
    }

    async getRoleMenu(messageId) {
        const menu = await RoleMenu.findByPk(messageId);
        return menu ? menu.toJSON() : undefined;
    }

    async deleteRoleMenu(messageId) {
        const deleted = await RoleMenu.destroy({ where: { messageId } });
        return deleted > 0;
    }

    async getAllRoleMenus(guildId) {
        const menus = await RoleMenu.findAll({ where: { guildId } });
        return menus.map(m => m.toJSON());
    }

    // ==========================================
    // ЛОГ АНАЛИЗАТОР
    // ==========================================

    async getLogAnalyzerConfig() {
        if (this._logAnalyzerCache) return this._logAnalyzerCache;

        const [unsupported, banned, mapping, launchers] = await Promise.all([
            UnsupportedMod.findAll(), BannedMod.findAll(), ModMapping.findAll(), AllowedLauncher.findAll()
        ]);

        const config = {
            unsupportedMods: unsupported.reduce((acc, mod) => ({ ...acc, [mod.mod_id]: mod.reason }), {}),
            bannedMods: banned.map(m => m.mod_id),
            modsMapping: mapping.reduce((acc, m) => ({ ...acc, [m.original_name]: m.modrinth_id }), {}),
            allowedLaunchers: launchers.map(l => l.launcher_name)
        };

        this._logAnalyzerCache = config;
        return config;
    }

    async getUnsupportedMods() {
        const config = await this.getLogAnalyzerConfig();
        return config.unsupportedMods;
    }

    async getBannedMods() {
        const config = await this.getLogAnalyzerConfig();
        return config.bannedMods;
    }

    async getModsMapping() {
        const config = await this.getLogAnalyzerConfig();
        return config.modsMapping;
    }

    async getAllowedLaunchers() {
        const config = await this.getLogAnalyzerConfig();
        return config.allowedLaunchers;
    }

    async addBannedMod(modId) {
        await BannedMod.findOrCreate({ where: { mod_id: modId } });
        this._logAnalyzerCache = null;
        return true;
    }

    async removeBannedMod(modId) {
        await BannedMod.destroy({ where: { mod_id: modId } });
        this._logAnalyzerCache = null;
        return true;
    }

    async addUnsupportedMod(modId, reason) {
        await UnsupportedMod.upsert({ mod_id: modId, reason });
        this._logAnalyzerCache = null;
        return true;
    }

    async removeUnsupportedMod(modId) {
        await UnsupportedMod.destroy({ where: { mod_id: modId } });
        this._logAnalyzerCache = null;
        return true;
    }

    async getBannedRoleId(guildId) {
        const settings = await this.getSettings(guildId);
        if (settings) {
            return settings.parserBannedRoleId || ''; // я честно хз че оно вернёт и по идее таким образом оно точно конвертируется в строку
        }
    }

    async addAllowedLauncher(launcherName) {
        await AllowedLauncher.findOrCreate({ where: { launcher_name: launcherName } });
        this._logAnalyzerCache = null;
        return true;
    }

    async removeAllowedLauncher(launcherName) {
        await AllowedLauncher.destroy({ where: { launcher_name: launcherName } });
        this._logAnalyzerCache = null;
        return true;
    }

    // ==========================================
    // ОГРАНИЧЕНИЯ КОМАНД (Disabled Commands)
    // ==========================================

    /**
     * Проверяет, отключена ли команда для указанного пользователя.
     * Учитывает как глобальные запреты на сервере, так и персональные запреты пользователя.
     */
    async isDisabled(guildId, commandName, userId) {
        if (!guildId || !commandName || !userId) return false;

        const cacheKey = `${guildId}-${commandName}-${userId}`;
        if (this._disabledCommandsCache.has(cacheKey)) {
            return this._disabledCommandsCache.get(cacheKey);
        }

        const restriction = await DisabledCommand.findOne({
            where: {
                guild_id: guildId,
                command_name: commandName,
                [Op.or]: [
                    { user_id: null }, // Запрещено для всех на сервере
                    { user_id: userId } // Запрещено персонально этому пользователю
                ]
            }
        });

        const isDisabled = !!restriction;
        this._disabledCommandsCache.set(cacheKey, isDisabled);
        return isDisabled;
    }

    /**
     * Проверяет, отключена ли команда строго для всей гильдии (игнорируя персональные запреты).
     */
    async isGuildDisabled(guildId, commandName) {
        if (!guildId || !commandName) return false;

        const restriction = await DisabledCommand.findOne({
            where: {
                guild_id: guildId,
                command_name: commandName,
                user_id: null
            }
        });
        console.log(restriction, !!restriction)

        return !!restriction;
    }

    /**
     * Добавляет команду в список отключенных.
     * @param {string|null} userId Передайте null, чтобы отключить для всего сервера.
     */
    async addDisabledCommand(guildId, commandName, userId = null) {
        if (!guildId || !commandName) return false;
        
        try {
            await DisabledCommand.findOrCreate({
                where: { guild_id: guildId, command_name: commandName, user_id: userId }
            });
            this._disabledCommandsCache.clear();
            return true;
        } catch (error) {
            console.error("Ошибка при добавлении ограничения:", error);
            return false;
        }
    }

    /**
     * Удаляет ограничение команды.
     */
    async removeDisabledCommand(guildId, commandName, userId = null) {
        if (!guildId || !commandName) return false;

        const deleted = await DisabledCommand.destroy({
            where: { guild_id: guildId, command_name: commandName, user_id: userId }
        });

        this._disabledCommandsCache.clear();
        return deleted > 0;
    }

    /**
     * Получает список всех отключенных команд для сервера (глобально).
     */
    async getGuildRestrictions(guildId) {
        if (!guildId) return [];

        const restrictions = await DisabledCommand.findAll({
            where: { guild_id: guildId, user_id: null },
            attributes: ['command_name'] // Вытаскиваем только колонку с именем команды
        });

        return restrictions.map(r => r.command_name);
    }

    /**
     * Получает список команд, отключенных персонально для пользователя на сервере.
     */
    async getUserRestrictions(guildId, userId) {
        if (!guildId || !userId) return [];

        const restrictions = await DisabledCommand.findAll({
            where: { guild_id: guildId, user_id: userId },
            attributes: ['command_name']
        });

        return restrictions.map(r => r.command_name);
    }

    // ==========================================
    // СТАРБОРД (Starboard)
    // ==========================================

    async getStarboardSettings(guildId) {
        if (this._starboardCache.has(guildId)) return this._starboardCache.get(guildId);

        const settings = await StarboardSetting.findByPk(guildId);
        if (settings) {
            const data = settings.toJSON();
            this._starboardCache.set(guildId, data);
            return data;
        }

        const newSettings = await StarboardSetting.create({ guildId });
        const newData = newSettings.toJSON();
        this._starboardCache.set(guildId, newData);
        return newData;
    }

    async updateStarboardSetting(guildId, key, value) {
        await StarboardSetting.upsert({ guildId, [key]: value });
        this._starboardCache.delete(guildId);
        return true;
    }

    async isMessageOnStarboard(guildId, messageId) {
        const count = await StarboardMessage.count({ where: { guildId, messageId } });
        return count > 0;
    }

    async getStarboardMessageId(guildId, messageId) {
        const entry = await StarboardMessage.findOne({ where: { guildId, messageId } });
        return entry ? entry.starboardMessageId : null;
    }

    async addStarboardEntry(guildId, messageId, starboardMessageId) {
        await StarboardMessage.upsert({ guildId, messageId, starboardMessageId });
        return true;
    }

    async deleteStarboardEntry(guildId, messageId) {
        await StarboardMessage.destroy({ where: { guildId, messageId } });
        return true;
    }

    // ==========================================
    // СВАДЬБЫ И СЕМЬИ
    // ==========================================

    async getMarriage(guildId, userId) {
        return await Marriage.findOne({ where: { guildId, userId } });
    }

    async marry(guildId, user1Id, user2Id) {
        await Marriage.create({ guildId, userId: user1Id, spouseId: user2Id });
        await Marriage.create({ guildId, userId: user2Id, spouseId: user1Id });
    }

    async divorce(guildId, userId) {
        const marriage = await Marriage.findOne({ where: { guildId, userId } });
        if (!marriage) return false;
        const spouseId = marriage.spouseId;
        await Marriage.destroy({ where: { guildId, userId } });
        await Marriage.destroy({ where: { guildId, userId: spouseId } });
        return true;
    }

    async adoptChild(guildId, parentId, childId) {
        await ParentChild.create({ guildId, parentId, childId });
    }

    async abandonChild(guildId, parentId, childId) {
        return await ParentChild.destroy({ where: { guildId, parentId, childId } });
    }

    async leaveParents(guildId, childId) {
        return await ParentChild.destroy({ where: { guildId, childId } });
    }

    async getChildren(guildId, parentId) {
        return await ParentChild.findAll({ where: { guildId, parentId } });
    }

    async getParents(guildId, childId) {
        return await ParentChild.findAll({ where: { guildId, childId } });
    }

    async getSiblings(guildId, userId) {
        const parents = await ParentChild.findAll({ where: { guildId, childId: userId } });
        if (!parents.length) return [];
        const parentIds = parents.map(p => p.parentId);
        const siblings = await ParentChild.findAll({
            where: {
                guildId,
                parentId: parentIds,
                childId: { [Op.ne]: userId }
            }
        });
        return [...new Set(siblings.map(s => s.childId))];
    }

    async getFamily(guildId, userId) {
        const marriage = await Marriage.findOne({ where: { guildId, userId } });
        const spouseId = marriage ? marriage.spouseId : null;
        
        const childrenRows = await ParentChild.findAll({ where: { guildId, parentId: userId } });
        const childrenIds = childrenRows.map(c => c.childId);
        
        const parentsRows = await ParentChild.findAll({ where: { guildId, childId: userId } });
        const parentIds = parentsRows.map(p => p.parentId);
        
        const siblingIds = await this.getSiblings(guildId, userId);
        
        return {
            spouseId,
            childrenIds,
            parentIds,
            siblingIds
        };
    }

    async getFullFamilyTree(guildId, userId, depth = 15, visited = new Set()) {
        if (depth <= 0 || visited.has(userId)) return null;
        visited.add(userId);

        const marriage = await Marriage.findOne({ where: { guildId, userId } });
        const spouseId = marriage ? marriage.spouseId : null;

        const childrenRows = await ParentChild.findAll({ where: { guildId, parentId: userId } });
        const childrenIds = [...new Set(childrenRows.map(c => c.childId))];

        const parentsRows = await ParentChild.findAll({ where: { guildId, childId: userId } });
        const parentIds = parentsRows.map(p => p.parentId);

        const siblingIds = await this.getSiblings(guildId, userId);

        const children = [];
        for (const childId of childrenIds) {
            if (spouseId) visited.add(spouseId);
            const childTree = await this.getFullFamilyTree(guildId, childId, depth - 1, visited);
            children.push(childTree || {
                userId: childId,
                spouseId: null,
                children: [],
                parentIds: [userId, ...(spouseId ? [spouseId] : [])],
                siblingIds: []
            });
        }

        return {
            userId,
            spouseId,
            children,
            parentIds,
            siblingIds
        };
    }

    async isAncestor(guildId, userId, potentialAncestorId, visited = new Set()) {
        if (visited.has(userId)) return false;
        visited.add(userId);

        const parents = await ParentChild.findAll({ where: { guildId, childId: userId } });
        for (const p of parents) {
            if (p.parentId === potentialAncestorId) return true;
            if (await this.isAncestor(guildId, p.parentId, potentialAncestorId, visited)) return true;
        }
        return false;
    }

    async isDescendant(guildId, userId, potentialDescendantId, visited = new Set()) {
        if (visited.has(userId)) return false;
        visited.add(userId);

        const children = await ParentChild.findAll({ where: { guildId, parentId: userId } });
        for (const c of children) {
            if (c.childId === potentialDescendantId) return true;
            if (await this.isDescendant(guildId, c.childId, potentialDescendantId, visited)) return true;
        }
        return false;
    }

    // ==========================================
    // ПРОЧИЕ МЕТОДЫ (Утилиты)
    // ==========================================
    
    clearCache() {
        this._settingsCache.clear();
        this._tagsCache.clear();
        this._geminiUserCache.clear();
        this._starboardCache.clear();
        this._disabledCommandsCache.clear();
        this._logAnalyzerCache = null;
        console.log('[DB Service] Весь кэш очищен.');
    }
}

module.exports = new DatabaseService();