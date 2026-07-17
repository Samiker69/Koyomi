const ReportService = require('../../services/ReportService');
module.exports = {
    prefix: 'addNoteModal_',
    async execute(interaction) {
        const reportId = interaction.customId.split('_')[1];
        await ReportService.handleAddNote(interaction, reportId);
    }
};