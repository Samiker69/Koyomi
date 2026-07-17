const BaseRepository = require('./BaseRepository');
const { GuildSetting } = require('../models/models');
const CacheService = require('../../services/CacheService');

class GuildSettingsRepository extends BaseRepository {
    constructor() {
        super(GuildSetting);
    }

    async getSettings(guildId) {
        const cacheKey = `db:settings:${guildId}`;
        let settings = CacheService.get(cacheKey);
        if (settings) return settings;
        const record = await this.findById(guildId);
        const data = record ? record.toJSON() : undefined;
        if (data) {
            CacheService.set(cacheKey, data);
        }
        return data;
    }

    async updateSetting(guildId, settingName, value) {
        await this.model.update({ [settingName]: value }, { where: { guildId } });
        CacheService.delete(`db:settings:${guildId}`);
        return true;
    }

    async addServer(guildId) {
        await this.model.findOrCreate({ where: { guildId } });
        CacheService.delete(`db:settings:${guildId}`);
        return true;
    }

    async removeServer(guildId) {
        await this.model.destroy({ where: { guildId } });
        CacheService.delete(`db:settings:${guildId}`);
        return true;
    }

    async getBannedRoleId(guildId) {
        const settings = await this.getSettings(guildId);
        return settings ? settings.parserBannedRoleId || '' : '';
    }
}

module.exports = new GuildSettingsRepository();