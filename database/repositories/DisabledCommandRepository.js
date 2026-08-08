const BaseRepository = require('./BaseRepository');
const { DisabledCommand } = require('../models/models');
const { Op } = require('sequelize');
const CacheService = require('../../services/CacheService');

class DisabledCommandRepository extends BaseRepository {
    constructor() {
        super(DisabledCommand);
    }

    async isDisabled(guildId, commandName, userId) {
        if (!guildId || !commandName || !userId) return false;
        const cacheKey = `db:disabled_commands:${guildId}:${commandName}:${userId}`;
        let isDisabled = CacheService.get(cacheKey);
        if (isDisabled !== undefined) return isDisabled;
        const restriction = await this.model.findOne({
            where: {
                guild_id: guildId,
                command_name: commandName,
                [Op.or]: [
                    { user_id: null },
                    { user_id: userId }
                ]
            }
        });
        isDisabled = !!restriction;
        CacheService.set(cacheKey, isDisabled);
        return isDisabled;
    }

    async isGuildDisabled(guildId, commandName) {
        if (!guildId || !commandName) return false;
        const restriction = await this.model.findOne({
            where: {
                guild_id: guildId,
                command_name: commandName,
                user_id: null
            }
        });
        return !!restriction;
    }

    async addDisabledCommand(guildId, commandName, userId = null) {
        if (!guildId || !commandName) return false;
        try {
            await this.model.findOrCreate({
                where: { guild_id: guildId, command_name: commandName, user_id: userId }
            });
            CacheService.deleteByPrefix(`db:disabled_commands:${guildId}`);
            return true;
        } catch (error) {
            console.error('Error adding restriction:', error);
            return false;
        }
    }

    async removeDisabledCommand(guildId, commandName, userId = null) {
        if (!guildId || !commandName) return false;
        const deleted = await this.model.destroy({
            where: { guild_id: guildId, command_name: commandName, user_id: userId }
        });
        CacheService.deleteByPrefix(`db:disabled_commands:${guildId}`);
        return deleted > 0;
    }

    async getGuildRestrictions(guildId) {
        if (!guildId) return [];
        const restrictions = await this.model.findAll({
            where: { guild_id: guildId, user_id: null },
            attributes: ['command_name']
        });
        return restrictions.map(r => r.command_name);
    }

    async getUserRestrictions(guildId, userId) {
        if (!guildId || !userId) return [];
        const restrictions = await this.model.findAll({
            where: { guild_id: guildId, user_id: userId },
            attributes: ['command_name']
        });
        return restrictions.map(r => r.command_name);
    }
}

module.exports = new DisabledCommandRepository();