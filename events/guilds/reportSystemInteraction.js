const { Events } = require('discord.js');
const ReportService = require('../../services/ReportService');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.guild) {
            const Settings = require('../../functions/db/settings');
            const sdb = new Settings();
            const guildSettings = sdb.getSettings(interaction.guildId);
            if (guildSettings && guildSettings.language) {
                Object.defineProperty(interaction, 'guildLocale', {
                    get: () => guildSettings.language,
                    configurable: true
                });
            }
        }
        
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isMessageContextMenuCommand()) {
            return;
        }

        const customId = interaction.isButton() || interaction.isModalSubmit() ? interaction.customId : null;

        if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Пожаловаться на сообщение') {
            return await ReportService.handleContextMenuReport(interaction);
        }

        if (interaction.isButton() && customId.startsWith('report_')) {
            const reportType = customId.split('_')[1];
            return await ReportService.handleReportButton(interaction, reportType);
        }

        if (interaction.isButton() && customId.startsWith('modAction_')) {
            const parts = customId.split('_');
            const actionType = parts[1];
            const originalReportMessageId = parts[2];
            return await ReportService.handleModAction(interaction, actionType, originalReportMessageId);
        }

        if (interaction.isModalSubmit()) {
            const [action, ...args] = interaction.customId.split('_');

            if (action === 'submitReportModal') {
                const reportType = args[0];
                const targetMessageId = args.length > 1 ? args[1] : null;
                return await ReportService.handleSubmitReport(interaction, reportType, targetMessageId);
            }
            else if (action === 'sendReplyToUserModal') {
                return await ReportService.handleReplyToUser(interaction, args[0]);
            }
            else if (action === 'declineReportModal') {
                return await ReportService.handleDeclineReport(interaction, args[0]);
            }
            else if (action === 'addNoteModal') {
                return await ReportService.handleAddNote(interaction, args[0]);
            }
        }
    },
};