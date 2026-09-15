const ReportService = require('../../services/ReportService');
module.exports = {
    prefix: 'declineReportModal_',
    async execute(interaction) {
        const reportId = interaction.customId.split('_')[1];
        await ReportService.handleDeclineReport(interaction, reportId);
    }
};