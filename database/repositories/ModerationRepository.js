const BaseRepository = require('./BaseRepository');
const { ModCase, UserPunishment, sequelize } = require('../models/models');

class ModerationRepository extends BaseRepository {
    constructor() {
        super(ModCase);
    }

    async addModCase(caseData) {
        const { serverId, targetId, moderatorId, action, reason = null, evidenceUrl = null, timestamp = new Date() } = caseData;
        return await sequelize.transaction(async (t) => {
            const maxCase = await this.model.max('caseNum', { where: { serverId }, transaction: t });
            const nextCaseNum = (maxCase || 0) + 1;
            const newCase = await this.model.create({
                serverId, caseNum: nextCaseNum, targetId, moderatorId, action, reason, evidenceUrl, timestamp
            }, { transaction: t });
            return newCase.toJSON();
        });
    }

    async getModCase(serverId, caseNum) {
        const caseRecord = await this.model.findOne({ where: { serverId, caseNum } });
        return caseRecord ? caseRecord.toJSON() : undefined;
    }

    async getTargetModCases(serverId, targetId) {
        const cases = await this.model.findAll({
            where: { serverId, targetId },
            order: [['caseNum', 'DESC']]
        });
        return cases.map(c => c.toJSON());
    }

    async getServerModCases(serverId) {
        const cases = await this.model.findAll({ where: { serverId }, order: [['caseNum', 'DESC']] });
        return cases.map(c => c.toJSON());
    }

    async getUserWarnings(serverId, targetId) {
        const warnsCount = await this.model.count({ where: { serverId, targetId, action: 'warn' } });
        const unwarnsCount = await this.model.count({ where: { serverId, targetId, action: 'unwarn' } });
        return {
            warns: warnsCount,
            unwarns: unwarnsCount,
            true_warns: warnsCount - unwarnsCount
        };
    }

    async updateModCaseReason(serverId, caseNum, newReason) {
        const [updated] = await this.model.update({ reason: newReason }, { where: { serverId, caseNum } });
        return updated > 0;
    }

    async updateModCaseEvidenceUrl(serverId, caseNum, newEvidenceUrl) {
        const [updated] = await this.model.update({ evidenceUrl: newEvidenceUrl }, { where: { serverId, caseNum } });
        return updated > 0;
    }

    async updateModCaseLogMessageId(serverId, caseNum, logMessageId) {
        const [updated] = await this.model.update({ logMessageId }, { where: { serverId, caseNum } });
        return updated > 0;
    }

    async deleteModCase(serverId, caseNum) {
        const deleted = await this.model.destroy({ where: { serverId, caseNum } });
        return deleted > 0;
    }
}

module.exports = new ModerationRepository();