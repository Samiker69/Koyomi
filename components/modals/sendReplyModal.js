const ReportService = require('../../services/ReportService');
module.exports = {
    prefix: 'sendReplyToUserModal_',
    async execute(interaction) {
        const reportId = interaction.customId.split('_')[1];
        await ReportService.handleReplyToUser(interaction, reportId);
    }
};