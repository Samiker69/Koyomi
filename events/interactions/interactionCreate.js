const { Events, MessageFlags, EmbedBuilder } = require('discord.js');
const { bot_log_channel } = require('../../config.json');
const Pipeline = require('../../core/middlewares/Pipeline');
const ContextMiddleware = require('../../core/middlewares/ContextMiddleware');
const PermissionMiddleware = require('../../core/middlewares/PermissionMiddleware');
const CooldownMiddleware = require('../../core/middlewares/CooldownMiddleware');
const pipeline = new Pipeline()
    .use(ContextMiddleware)
    .use(PermissionMiddleware)
    .use(CooldownMiddleware);
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`Команда ${interaction.commandName} не найдена.`);
            return;
        }
        try {
            await pipeline.execute(interaction, async (ctx) => {
                await command.execute(ctx);
            });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(interaction.t('events.interaction_log.title') || 'Error')
                .addFields(
                    { name: interaction.t('events.interaction_log.command_label') || 'Command', value: `${interaction.commandName}` },
                    { name: interaction.t('events.interaction_log.error_label') || 'Error', value: `\`\`\`txt\n${(error.stack || error.message).slice(0, 1000)}\n\`\`\`` }
                )
                .setTimestamp(new Date());
            try {
                const logChannel = await interaction.client.channels.fetch(bot_log_channel).catch(() => null);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({ embeds: [errorEmbed] });
                }
            } catch (logErr) {
                console.error('[Logger Error] Could not send to log channel:', logErr.message);
            }
            if (error.code === 10062) return;
            const errorMessage = interaction.t('events.errors.command_error') || 'An error occurred while executing the command.';
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