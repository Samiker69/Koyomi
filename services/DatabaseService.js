const { Op } = require('sequelize');
const {
    sequelize, GuildSetting, RoleMenu, UnsupportedMod, BannedMod, ModMapping,
    AllowedLauncher, ModCase, UserPunishment, DisabledCommand, GeminiUserSetting,
    GeminiSafetySetting, GeminiToken, StarboardSetting, StarboardMessage, Tag
} = require('../utils/db/models');
const fs = require('fs');

class DatabaseService {
    constructor() {
        this._settingsCache = new Map();
        this._tagsCache = new Map();
        this._geminiUserCache = new Map();
        this._logAnalyzerCache = null;
    }

    async init() {
        try {
            if (!fs.existsSync('./database')) {
                fs.mkdirSync('./database');
                console.log('[INFO]: Папка database создана');
            }
            await sequelize.sync();
            const countLaunchers = await AllowedLauncher.count();
            if (countLaunchers === 0) await AllowedLauncher.create({ launcher_name: 'hebe' });

            const countMapping = await ModMapping.count();
            if (countMapping === 0) await ModMapping.create({ original_name: 'yet_another_config_lib_v3', modrinth_id: 'yacl' });
            
            console.log('✅ База данных SQLite (Sequelize) успешно синхронизирована.');
        } catch (error) {
            console.error('❌ Ошибка синхронизации БД:', error);
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
        const { serverId, targetId, moderatorId, action, reason = null, timestamp = new Date() } = caseData;
        
        // Транзакция для безопасного получения следующего ID
        return await sequelize.transaction(async (t) => {
            const maxCase = await ModCase.max('caseNum', { where: { serverId }, transaction: t });
            const nextCaseNum = (maxCase || 0) + 1;

            const newCase = await ModCase.create({
                serverId, caseNum: nextCaseNum, targetId, moderatorId, action, reason, timestamp
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

    async deleteModCase(serverId, caseNum) {
        const deleted = await ModCase.destroy({ where: { serverId, caseNum } });
        return deleted > 0;
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
    // ПРОЧИЕ МЕТОДЫ (Утилиты)
    // ==========================================
    
    clearCache() {
        this._settingsCache.clear();
        this._tagsCache.clear();
        this._geminiUserCache.clear();
        this._logAnalyzerCache = null;
        console.log('[DB Service] Весь кэш очищен.');
    }
}

module.exports = new DatabaseService();