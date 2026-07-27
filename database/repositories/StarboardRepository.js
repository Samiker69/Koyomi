const BaseRepository = require('./BaseRepository');
const { StarboardSetting, StarboardMessage } = require('../models/models');
const CacheService = require('../../services/CacheService');

class StarboardRepository extends BaseRepository {
    constructor() {
        super(StarboardSetting);
    }

    async getStarboardSettings(guildId) {
        const cacheKey = `db:starboard:settings:${guildId}`;
        let settings = CacheService.get(cacheKey);
        if (settings) return settings;
        const record = await this.findById(guildId);
        if (record) {
            const data = record.toJSON();
            CacheService.set(cacheKey, data);
            return data;
        }
        const newSettings = await this.create({ guildId });
        const newData = newSettings.toJSON();
        CacheService.set(cacheKey, newData);
        return newData;
    }

    async updateStarboardSetting(guildId, key, value) {
        await this.model.upsert({ guildId, [key]: value });
        CacheService.delete(`db:starboard:settings:${guildId}`);
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
}

module.exports = new StarboardRepository();