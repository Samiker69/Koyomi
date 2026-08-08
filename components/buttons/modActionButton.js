const ReportService = require('../../services/ReportService');
module.exports = {
    prefix: 'modAction_',
    async execute(interaction) {
        const parts = interaction.customId.split('_');
        const actionType = parts[1];
        const originalReportMessageId = parts[2];
        await ReportService.handleModAction(interaction, actionType, originalReportMessageId);
    }
};