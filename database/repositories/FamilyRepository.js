const BaseRepository = require('./BaseRepository');
const { Marriage, ParentChild } = require('../models/models');
const { Op } = require('sequelize');

class FamilyRepository extends BaseRepository {
    constructor() {
        super(Marriage);
    }

    async getMarriage(guildId, userId) {
        return await this.model.findOne({ where: { guildId, userId } });
    }

    async marry(guildId, user1Id, user2Id) {
        await this.model.create({ guildId, userId: user1Id, spouseId: user2Id });
        await this.model.create({ guildId, userId: user2Id, spouseId: user1Id });
    }

    async divorce(guildId, userId) {
        const marriage = await this.model.findOne({ where: { guildId, userId } });
        if (!marriage) return false;
        const spouseId = marriage.spouseId;
        await this.model.destroy({ where: { guildId, userId } });
        await this.model.destroy({ where: { guildId, userId: spouseId } });
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
        const marriage = await this.model.findOne({ where: { guildId, userId } });
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
        const marriage = await this.model.findOne({ where: { guildId, userId } });
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
}

module.exports = new FamilyRepository();