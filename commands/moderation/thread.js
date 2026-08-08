const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, ChannelType } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');

const VALID_DURATIONS = [60, 1440, 4320, 10080];
const getNearestDuration = (mins) => mins <= 0 ? 0 : VALID_DURATIONS.reduce((prev, curr) => Math.abs(curr - mins) < Math.abs(prev - mins) ? curr : prev);

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('thread')
        .setDescription(localeManager.get('moderation.thread.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.thread.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('close')
                .setDescription(localeManager.get('moderation.thread.options.close.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.thread.options.close.description'))
                .addChannelOption(opt => opt.setName('thread').setDescription(localeManager.get('moderation.thread.options.close.options.thread.description', 'en-US')).addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread))
                .addStringOption(opt => opt.setName('reason').setDescription(localeManager.get('moderation.thread.options.close.options.reason.description', 'en-US')))
                .addBooleanOption(opt => opt.setName('lock').setDescription(localeManager.get('moderation.thread.options.close.options.lock.description', 'en-US')))
        )
        .addSubcommand(sub =>
            sub.setName('autoclose')
                .setDescription(localeManager.get('moderation.thread.options.autoclose.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.thread.options.autoclose.description'))
                .addIntegerOption(opt =>
                    opt.setName('minutes')
                        .setDescription(localeManager.get('moderation.thread.options.autoclose.options.minutes.description', 'en-US'))
                        .setRequired(true)
                        .addChoices(
                            { name: 'Отключить (0)', value: 0 },
                            { name: '1 час (60 мин)', value: 60 },
                            { name: '24 часа / 1 день (1440 мин)', value: 1440 },
                            { name: '3 дня (4320 мин)', value: 4320 },
                            { name: '1 неделя (10080 мин)', value: 10080 }
                        )
                )
                .addChannelOption(opt => opt.setName('thread').setDescription(localeManager.get('moderation.thread.options.autoclose.options.thread.description', 'en-US')).addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread))
        )
        .addSubcommand(sub =>
            sub.setName('reopen')
                .setDescription(localeManager.get('moderation.thread.options.reopen.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.thread.options.reopen.description'))
                .addChannelOption(opt => opt.setName('thread').setDescription(localeManager.get('moderation.thread.options.reopen.options.thread.description', 'en-US')).addChannelTypes(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread))
                .addStringOption(opt => opt.setName('reason').setDescription(localeManager.get('moderation.thread.options.reopen.options.reason.description', 'en-US')))
        ),

    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        const memberPerms = interaction.memberPermissions;

        if (!memberPerms || (!memberPerms.has(PermissionFlagsBits.ManageThreads) && !memberPerms.has(PermissionFlagsBits.ManageChannels) && !memberPerms.has(PermissionFlagsBits.Administrator))) {
            return interaction.reply({ content: localeManager.get('moderation.thread.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
        }

        const me = interaction.guild?.members?.me;
        if (me?.permissions && !me.permissions.has(PermissionFlagsBits.ManageThreads)) {
            return interaction.reply({ content: localeManager.get('moderation.thread.messages.bot_no_perms', lang), flags: MessageFlags.Ephemeral });
        }

        const subcommand = interaction.options.getSubcommand();
        const threadOpt = interaction.options.getChannel('thread');

        if (subcommand === 'autoclose') {
            await interaction.deferReply();
            const minutes = interaction.options.getInteger('minutes');
            const durationStr = localeManager.get(`moderation.thread.messages.duration_${minutes}`, lang) || `${minutes} мин`;
            const targetThread = threadOpt || (interaction.channel?.isThread() ? interaction.channel : null);

            try {
                if (targetThread) {
                    const apiMinutes = getNearestDuration(minutes) || 60;
                    if (typeof targetThread.setAutoArchiveDuration === 'function') {
                        await targetThread.setAutoArchiveDuration(apiMinutes, localeManager.get('moderation.thread.options.autoclose.description', lang));
                    }

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setTitle(localeManager.get('moderation.thread.options.autoclose.description', lang))
                        .setDescription(localeManager.get('moderation.thread.messages.autoclose_desc', lang, { thread: `${targetThread}`, duration: durationStr }))
                        .addFields(
                            { name: localeManager.get('moderation.thread.messages.thread_label', lang), value: `${targetThread}`, inline: true },
                            { name: localeManager.get('moderation.thread.messages.autoclose_label', lang), value: durationStr, inline: true },
                            { name: localeManager.get('moderation.thread.messages.mod_label', lang), value: `${interaction.user}`, inline: false }
                        );

                    return await interaction.editReply({ embeds: [embed] });
                } else {
                    await DatabaseService.updateSetting(interaction.guild.id, 'defaultThreadAutoClose', minutes);

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setTitle(localeManager.get('moderation.thread.options.autoclose.description', lang))
                        .setDescription(localeManager.get('moderation.thread.messages.autoclose_server_desc', lang, { duration: durationStr }))
                        .addFields(
                            { name: localeManager.get('moderation.thread.messages.autoclose_label', lang), value: durationStr, inline: true },
                            { name: localeManager.get('moderation.thread.messages.mod_label', lang), value: `${interaction.user}`, inline: true }
                        );

                    return await interaction.editReply({ embeds: [embed] });
                }
            } catch (err) {
                console.error(`[Thread Autoclose Error]:`, err);
                return await interaction.editReply({ content: localeManager.get('moderation.thread.messages.autoclose_error', lang, { thread: targetThread ? `${targetThread}` : '', error: err.message || err }) });
            }
        }

        const targetChannel = threadOpt || interaction.channel;
        if (!targetChannel?.isThread || !targetChannel.isThread()) {
            return interaction.reply({ content: localeManager.get('moderation.thread.messages.not_a_thread', lang), flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply();
        const reason = interaction.options.getString('reason') || localeManager.get('moderation.thread.messages.no_reason', lang);

        try {
            if (subcommand === 'close') {
                const lock = interaction.options.getBoolean('lock') || false;

                const embed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('moderation.thread.options.close.description', lang))
                    .setDescription(localeManager.get(`moderation.thread.messages.${lock ? 'close_locked_desc' : 'close_desc'}`, lang, { thread: `${targetChannel}` }))
                    .addFields(
                        { name: localeManager.get('moderation.thread.messages.thread_label', lang), value: `${targetChannel}`, inline: true },
                        { name: localeManager.get('moderation.thread.messages.mod_label', lang), value: `${interaction.user}`, inline: true },
                        { name: localeManager.get('moderation.thread.messages.reason_label', lang), value: reason, inline: false }
                    );

                await interaction.editReply({ embeds: [embed] });

                if (lock && targetChannel.setLocked) await targetChannel.setLocked(true, reason).catch(() => {});
                if (targetChannel.setArchived) await targetChannel.setArchived(true, reason).catch(() => {});
                return;
            }

            if (subcommand === 'reopen') {
                if (targetChannel.locked && targetChannel.setLocked) await targetChannel.setLocked(false, reason);
                if (targetChannel.archived && targetChannel.setArchived) await targetChannel.setArchived(false, reason);

                const embed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('moderation.thread.options.reopen.description', lang))
                    .setDescription(localeManager.get('moderation.thread.messages.reopen_desc', lang, { thread: `${targetChannel}` }))
                    .addFields(
                        { name: localeManager.get('moderation.thread.messages.thread_label', lang), value: `${targetChannel}`, inline: true },
                        { name: localeManager.get('moderation.thread.messages.mod_label', lang), value: `${interaction.user}`, inline: true },
                        { name: localeManager.get('moderation.thread.messages.reason_label', lang), value: reason, inline: false }
                    );

                return await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`[Thread Command Error] ${subcommand}:`, error);
            const errMsg = localeManager.get(`moderation.thread.messages.${subcommand}_error`, lang, { thread: `${targetChannel}`, error: error.message || error });
            return await interaction.editReply({ content: errMsg }).catch(() => {});
        }
    }
};
