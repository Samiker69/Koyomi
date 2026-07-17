const BaseRepository = require('./BaseRepository');
const { RoleMenu } = require('../models/models');

class RoleMenuRepository extends BaseRepository {
    constructor() {
        super(RoleMenu);
    }

    async addRoleMenu(messageId, guildId, channelId, type, roles) {
        await this.model.upsert({ messageId, guildId, channelId, type, roles });
        return true;
    }

    async getRoleMenu(messageId) {
        const menu = await this.findById(messageId);
        return menu ? menu.toJSON() : undefined;
    }

    async deleteRoleMenu(messageId) {
        const deleted = await this.model.destroy({ where: { messageId } });
        return deleted > 0;
    }

    async getAllRoleMenus(guildId) {
        const menus = await this.model.findAll({ where: { guildId } });
        return menus.map(m => m.toJSON());
    }
}

module.exports = new RoleMenuRepository();