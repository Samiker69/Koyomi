const ReportService = require('../../services/ReportService');
module.exports = {
    prefix: 'report_',
    async execute(interaction) {
        const reportType = interaction.customId.split('_')[1];
        await ReportService.handleReportButton(interaction, reportType);
    }
};