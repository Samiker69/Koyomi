const { Events, MessageFlags, Collection, EmbedBuilder } = require('discord.js');
const { bot_log_channel } = require('../../config.json')
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../services/DatabaseService');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const settings = interaction.guild ? (DatabaseService.getSettings(interaction.guild.id) || {}) : {};
        const preferredLang = settings.language || interaction.guildLocale || 'ru';

        Object.defineProperty(interaction, 'guildLocale', {
            get: () => preferredLang,
            configurable: true
        });

        const lang = preferredLang;

        if (!interaction.isChatInputCommand()) {
            return;
        }
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Команда ${interaction.commandName} не найдена.`);
            return;
        }

        if (interaction.guild && DatabaseService.isDisabled(interaction.guild.id, interaction.commandName, interaction.user.id)) {
            await interaction.reply({
                content: localeManager.get('events.errors.command_disabled', lang, { commandName: interaction.commandName }),
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return await interaction.reply({
                    content: localeManager.get('events.errors.cooldown', lang, {
                        commandName: command.data.name,
                        timestamp: expiredTimestamp
                    }),
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(localeManager.get('events.interaction_log.title', lang))
                .addFields(
                    { name: localeManager.get('events.interaction_log.command_label', lang), value: `${interaction.commandName}` },
                    { name: localeManager.get('events.interaction_log.error_label', lang), value: `\`\`\`txt\n${(error.stack || error.message).slice(0, 1000)}\n\`\`\`` }
                )
                .setTimestamp(new Date())

            try {
                const logChannel = await interaction.client.channels.fetch(bot_log_channel).catch(() => null);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({ embeds: [errorEmbed] });
                }
            } catch (logErr) {
                console.error('[Logger Error] Could not send to log channel:', logErr.message);
            }

            if (error.code === 10062) return;

            const errorMessage = localeManager.get('events.errors.command_error', lang);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
                }
            } catch (replyError) {
                console.error('[Error Handler] Failed to send error message to user:', replyError.message);
            }
        }
    },
};