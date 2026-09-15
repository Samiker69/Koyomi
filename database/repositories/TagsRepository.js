const BaseRepository = require('./BaseRepository');
const { Tag } = require('../models/models');
const CacheService = require('../../services/CacheService');

class TagsRepository extends BaseRepository {
    constructor() {
        super(Tag);
    }

    async getTag(serverId, name) {
        const cacheKey = `db:tags:${serverId}:${name}`;
        let tag = CacheService.get(cacheKey);
        if (tag) return tag;
        const record = await this.model.findOne({ where: { serverId, name } });
        const data = record ? record.toJSON() : null;
        if (data) {
            CacheService.set(cacheKey, data);
        }
        return data;
    }

    async addTag(serverId, name, content, disallowedChannelsId = [], allowedChannelId = []) {
        await this.model.upsert({ serverId, name, content, disallowedChannelsId, allowedChannelId });
        CacheService.delete(`db:tags:${serverId}:${name}`);
        return true;
    }

    async editTag(serverId, name, updates) {
        await this.model.update(updates, { where: { serverId, name } });
        CacheService.delete(`db:tags:${serverId}:${name}`);
        return true;
    }

    async getTagsByServer(serverId) {
        const tags = await this.model.findAll({ where: { serverId }, order: [['name', 'ASC']] });
        return tags.map(t => t.toJSON());
    }

    async removeTag(serverId, name) {
        await this.model.destroy({ where: { serverId, name } });
        CacheService.delete(`db:tags:${serverId}:${name}`);
        return true;
    }
}

module.exports = new TagsRepository();