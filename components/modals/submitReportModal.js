const ReportService = require('../../services/ReportService');
module.exports = {
    prefix: 'submitReportModal_',
    async execute(interaction) {
        const args = interaction.customId.split('_').slice(1);
        const reportType = args[0];
        const targetMessageId = args.length > 1 ? args[1] : null;
        await ReportService.handleSubmitReport(interaction, reportType, targetMessageId);
    }
};