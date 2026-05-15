const SettingsDatabase = require('../utils/db/settings');
const TagsDB = require('../utils/db/tags');
const GeminiDB = require('../utils/db/gemini_settings');
const CaseDatabase = require('../utils/db/case');
const UserPunishmentDB = require('../utils/db/user_punishment');
const StarboardDB = require('../utils/db/starboard');
const RestrictionsDB = require('../utils/db/restrictions');

class DatabaseService {
    constructor() {
        this.settingsDb = new SettingsDatabase();
        this.tagsDb = new TagsDB();
        this.geminiDb = new GeminiDB();
        this.caseDb = new CaseDatabase();
        this.punishmentDb = new UserPunishmentDB();
        this.starboardDb = new StarboardDB();
        this.restrictionsDb = new RestrictionsDB();

        // Кэши
        this._settingsCache = new Map();
        this._tagsCache = new Map(); // Ключ: serverId:tagName
        this._geminiUserCache = new Map();
        this._logAnalyzerCache = null;
    }

    // --- Методы настроек с кэшированием ---

    getSettings(guildId) {
        if (this._settingsCache.has(guildId)) {
            return this._settingsCache.get(guildId);
        }


        const settings = this.settingsDb.getSettings(guildId);
        if (settings) {
            this._settingsCache.set(guildId, settings);
        }
        return settings;
    }

    updateSetting(guildId, settingName, value) {
        const result = this.settingsDb.updateSetting(guildId, settingName, value);
        // Сброс кэша при обновлении
        this._settingsCache.delete(guildId);
        return result;
    }

    addServer(guildId) {
        const result = this.settingsDb.addServer(guildId);
        this._settingsCache.delete(guildId);
        return result;
    }

    removeServer(guildId) {
        const result = this.settingsDb.removeServer(guildId);
        this._settingsCache.delete(guildId);
        return result;
    }

    // --- Методы тегов с кэшированием ---

    getTag(serverId, name) {
        const cacheKey = `${serverId}:${name}`;
        if (this._tagsCache.has(cacheKey)) {
            return this._tagsCache.get(cacheKey);
        }

        const tag = this.tagsDb.get(serverId, name);
        if (tag) {
            this._tagsCache.set(cacheKey, tag);
        }
        return tag;
    }

    addTag(serverId, name, description, disallowedChannelsId = [], allowedChannelId = []) {
        const result = this.tagsDb.add(serverId, name, description, disallowedChannelsId, allowedChannelId);
        this._tagsCache.delete(`${serverId}:${name}`);
        return result;
    }

    editTag(serverId, name, updates) {
        const result = this.tagsDb.edit(serverId, name, updates);
        this._tagsCache.delete(`${serverId}:${name}`);
        return result;
    }

    getTagsByServer(serverId) {
        return this.tagsDb.getTagsByServer(serverId);
    }

    removeTag(serverId, name) {
        const result = this.tagsDb.remove(serverId, name);
        this._tagsCache.delete(`${serverId}:${name}`);
        return result;
    }

    // --- Методы Gemini с кэшированием ---

    getUserGeminiConfig(userId) {
        if (this._geminiUserCache.has(userId)) {
            return this._geminiUserCache.get(userId);
        }

        const config = this.geminiDb.getUserConfig(userId);
        if (config) {
            this._geminiUserCache.set(userId, config);
        }
        return config;
    }

    updateUserGeminiConfig(userId, updates) {
        const result = this.geminiDb.updateUserConfig(userId, updates);
        this._geminiUserCache.delete(userId);
        return result;
    }

    getSafetySettings(userId) {
        // Настройки безопасности тоже можно кэшировать
        const cacheKey = `safety:${userId}`;
        if (this._geminiUserCache.has(cacheKey)) {
            return this._geminiUserCache.get(cacheKey);
        }

        const settings = this.geminiDb.getSafetySettings(userId);
        if (settings) {
            this._geminiUserCache.set(cacheKey, settings);
        }
        return settings;
    }

    updateSafetySettings(userId, updates) {
        const result = this.geminiDb.updateSafetySettings(userId, updates);
        this._geminiUserCache.delete(`safety:${userId}`);
        return result;
    }

    getAllUserTokens(userId) {
        return this.geminiDb.getAllUserTokens(userId);
    }

    deleteToken(userId, token) {
        return this.geminiDb.deleteToken(userId, token);
    }

    getUserStats(userId) {
        return this.geminiDb.getUserStats(userId);
    }

    addUserConfig(userId, overrides = {}) {
        const result = this.geminiDb.addUserConfig(userId, overrides);
        this._geminiUserCache.delete(userId);
        this._geminiUserCache.delete(`safety:${userId}`);
        return result;
    }

    deleteUserConfig(userId) {
        const result = this.geminiDb.deleteUserConfig(userId);
        this._geminiUserCache.delete(userId);
        this._geminiUserCache.delete(`safety:${userId}`);
        return result;
    }

    addToken(userId, token, publicUse) {
        return this.geminiDb.addToken(userId, token, publicUse);
    }

    deleteAllTokensByUser(userId) {
        return this.geminiDb.deleteAllByUser(userId);
    }

    updateTokenSettings(userId, token, updates) {
        return this.geminiDb.updateTokenSettings(userId, token, updates);
    }

    // --- Методы кейсов модерации ---

    addModCase(caseData) {
        return this.caseDb.addModCase(caseData);
    }

    getModCase(serverId, caseNum) {
        return this.caseDb.getModCase(serverId, caseNum);
    }

    getTargetModCases(serverId, targetId) {
        return this.caseDb.getTargetModCases(serverId, targetId);
    }

    getServerModCases(serverId) {
        return this.caseDb.getServerModCases(serverId);
    }

    getUserWarnings(serverId, targetId) {
        return this.caseDb.getUserWarnings(serverId, targetId);
    }

    updateModCaseReason(serverId, caseNum, newReason) {
        return this.caseDb.updateModCaseReason(serverId, caseNum, newReason);
    }

    deleteModCase(serverId, caseNum) {
        return this.caseDb.deleteModCase(serverId, caseNum);
    }

    // --- Проходные методы ---

    getCase(guildId, caseNum) {
        return this.caseDb.getCase(guildId, caseNum);
    }

    addCase(caseData) {
        return this.caseDb.addCase(caseData);
    }

    // --- Конфигурация LogAnalyzer ---

    getLogAnalyzerConfig() {
        if (this._logAnalyzerCache) {
            return this._logAnalyzerCache;
        }

        const config = {
            unsupportedMods: this.settingsDb.getUnsupportedMods(),
            bannedMods: this.settingsDb.getBannedMods(),
            modsMapping: this.settingsDb.getModsMapping(),
            allowedLaunchers: this.settingsDb.getAllowedLaunchers()
        };

        this._logAnalyzerCache = config;
        return config;
    }

    getUnsupportedMods() {
        return this.getLogAnalyzerConfig().unsupportedMods;
    }

    getBannedMods() {
        return this.getLogAnalyzerConfig().bannedMods;
    }

    getModsMapping() {
        return this.getLogAnalyzerConfig().modsMapping;
    }

    getAllowedLaunchers() {
        return this.getLogAnalyzerConfig().allowedLaunchers;
    }

    addBannedMod(modId) {
        const result = this.settingsDb.addBannedMod(modId);
        this._logAnalyzerCache = null;
        return result;
    }

    removeBannedMod(modId) {
        const result = this.settingsDb.removeBannedMod(modId);
        this._logAnalyzerCache = null;
        return result;
    }

    addUnsupportedMod(modId, reason) {
        const result = this.settingsDb.addUnsupportedMod(modId, reason);
        this._logAnalyzerCache = null;
        return result;
    }

    removeUnsupportedMod(modId) {
        const result = this.settingsDb.removeUnsupportedMod(modId);
        this._logAnalyzerCache = null;
        return result;
    }

    addAllowedLauncher(launcherName) {
        const result = this.settingsDb.addAllowedLauncher(launcherName);
        this._logAnalyzerCache = null;
        return result;
    }

    removeAllowedLauncher(launcherName) {
        const result = this.settingsDb.removeAllowedLauncher(launcherName);
        this._logAnalyzerCache = null;
        return result;
    }

    // Утилита для полной очистки кэша
    clearCache() {
        this._settingsCache.clear();
        this._tagsCache.clear();
        this._geminiUserCache.clear();
        this._logAnalyzerCache = null;
        console.log('[DB Service] Весь кэш очищен.');
    }
}

// Экспортируем синглтон
module.exports = new DatabaseService();
