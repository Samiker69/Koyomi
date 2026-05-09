const { Events, MessageFlags, Collection, EmbedBuilder } = require('discord.js');
const { bot_log_channel } = require('../../config.json')
const localeManager = require('../../locales/localeManager');

const DisabledCommandsDB = require('../../functions/db/restrictions');
const SettingsDB = require('../../functions/db/settings');
const db = new DisabledCommandsDB();
const sdb = new SettingsDB();


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const settings = interaction.guild ? (sdb.getSettings(interaction.guild.id) || {}) : {};
        const preferredLang = settings.language || interaction.guildLocale || 'ru';
        
        // Переопределяем guildLocale, чтобы все команды использовали выбранный язык
        Object.defineProperty(interaction, 'guildLocale', {
            get: () => preferredLang,
            configurable: true
        });

        const lang = preferredLang;
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Команда ${interaction.commandName} не найдена.`);
            return;
        }

        if (interaction.guild && db.isDisabled(interaction.guild.id, interaction.commandName, interaction.user.id)) {
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
                { name: localeManager.get('events.interaction_log.command_label', lang), value: `${interaction.commandName}`},
                { name: localeManager.get('events.interaction_log.error_label', lang), value: `\`\`\`txt\n${error.message}\n${error.stack || ''}\`\`\`` }
            )
            .setTimestamp(new Date())
            
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] })
            
            const errorMessage = localeManager.get('events.errors.command_error', lang);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
            }
        }
    },
};