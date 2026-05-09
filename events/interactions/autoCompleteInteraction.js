const { Events } = require('discord.js');
const SettingsDB = require('../../functions/db/settings');
const sdb = new SettingsDB();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isAutocomplete()) { // Если это запрос автодополнения
            const settings = interaction.guild ? (sdb.getSettings(interaction.guild.id) || {}) : {};
            const preferredLang = settings.language || interaction.guildLocale || 'ru';

            Object.defineProperty(interaction, 'guildLocale', {
                get: () => preferredLang,
                configurable: true
            });
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) {
                console.error(`Команда ${interaction.commandName} для автодополнения не найдена.`);
                return;
            }
    
            try {
                // Проверяем, есть ли у команды метод autocomplete
                if (typeof command.autocomplete === 'function') {
                     await command.autocomplete(interaction);
                } else {
                     console.warn(`У команды ${interaction.commandName} нет обработчика autocomplete.`);
                     await interaction.respond([]);
                }
            } catch (error) {
                console.error('Ошибка автодополнения:', error);
            }
        }
    }
}