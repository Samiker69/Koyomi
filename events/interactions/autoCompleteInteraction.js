const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isAutocomplete()) return;

        // Применяем локализацию
        const settings = interaction.guild ? (sdb.getSettings(interaction.guild.id) || {}) : {};
        const preferredLang = settings.language || interaction.guildLocale || 'ru';
        
        Object.defineProperty(interaction, 'guildLocale', {
            get: () => preferredLang,
            configurable: true
        });

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    },
};
