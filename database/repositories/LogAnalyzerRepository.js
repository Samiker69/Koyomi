const BaseRepository = require('./BaseRepository');
const { UnsupportedMod, BannedMod, ModMapping, AllowedLauncher } = require('../models/models');
const CacheService = require('../../services/CacheService');

class LogAnalyzerRepository extends BaseRepository {
    constructor() {
        super(BannedMod);
    }

    async getLogAnalyzerConfig() {
        const cacheKey = 'db:log_analyzer';
        let config = CacheService.get(cacheKey);
        if (config) return config;
        const [unsupported, banned, mapping, launchers] = await Promise.all([
            UnsupportedMod.findAll(), BannedMod.findAll(), ModMapping.findAll(), AllowedLauncher.findAll()
        ]);
        config = {
            unsupportedMods: unsupported.reduce((acc, mod) => ({ ...acc, [mod.mod_id]: mod.reason }), {}),
            bannedMods: banned.map(m => m.mod_id),
            modsMapping: mapping.reduce((acc, m) => ({ ...acc, [m.original_name]: m.modrinth_id }), {}),
            allowedLaunchers: launchers.map(l => l.launcher_name)
        };
        CacheService.set(cacheKey, config);
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
        CacheService.delete('db:log_analyzer');
        return true;
    }

    async removeBannedMod(modId) {
        await BannedMod.destroy({ where: { mod_id: modId } });
        CacheService.delete('db:log_analyzer');
        return true;
    }

    async addUnsupportedMod(modId, reason) {
        await UnsupportedMod.upsert({ mod_id: modId, reason });
        CacheService.delete('db:log_analyzer');
        return true;
    }

    async removeUnsupportedMod(modId) {
        await UnsupportedMod.destroy({ where: { mod_id: modId } });
        CacheService.delete('db:log_analyzer');
        return true;
    }

    async addAllowedLauncher(launcherName) {
        await AllowedLauncher.findOrCreate({ where: { launcher_name: launcherName } });
        CacheService.delete('db:log_analyzer');
        return true;
    }

    async removeAllowedLauncher(launcherName) {
        await AllowedLauncher.destroy({ where: { launcher_name: launcherName } });
        CacheService.delete('db:log_analyzer');
        return true;
    }
}

module.exports = new LogAnalyzerRepository();