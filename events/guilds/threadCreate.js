const { Events } = require('discord.js');
const DatabaseService = require('../../database/repositories');

const VALID_DURATIONS = [60, 1440, 4320, 10080];
const getNearestDuration = (mins) => VALID_DURATIONS.reduce((prev, curr) => Math.abs(curr - mins) < Math.abs(prev - mins) ? curr : prev);

module.exports = {
    name: Events.ThreadCreate,
    async execute(thread) {
        if (!thread?.guild) return;

        try {
            const settings = await DatabaseService.getSettings(thread.guild.id) || {};
            const defaultAutoClose = Number(settings.defaultThreadAutoClose);

            if (defaultAutoClose > 0) {
                const targetDuration = getNearestDuration(defaultAutoClose);
                if (thread.autoArchiveDuration !== targetDuration && thread.setAutoArchiveDuration) {
                    await thread.setAutoArchiveDuration(targetDuration, 'Автоматическая установка времени неактивности (серверная настройка)').catch(() => {});
                }
            }
        } catch (error) {
            console.error('[ThreadCreate Event Error]:', error);
        }
    }
};
