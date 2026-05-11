const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const db = new ModerationDB();
const ModerationService = require('../../services/ModerationService');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

const data = new SlashCommandBuilder()
    .setName('moderation')
    .setDescription(localeManager.get('moderation.moderation.description', 'en-US'))
    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.description'))
    .addSubcommand(sub =>
        sub.setName('ban')
            .setDescription(localeManager.get('moderation.moderation.options.ban.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.ban.description'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription(localeManager.get('moderation.moderation.options.ban.options.user.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.ban.options.user.description'))
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.ban.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.ban.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.ban.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.ban.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('mute')
            .setDescription(localeManager.get('moderation.moderation.options.mute.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.mute.description'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription(localeManager.get('moderation.moderation.options.mute.options.user.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.mute.options.user.description'))
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('time')
                    .setDescription(localeManager.get('moderation.moderation.options.mute.options.time.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.mute.options.time.description'))
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.mute.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.mute.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.mute.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.mute.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('kick')
            .setDescription(localeManager.get('moderation.moderation.options.kick.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.kick.description'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription(localeManager.get('moderation.moderation.options.kick.options.user.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.kick.options.user.description'))
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.kick.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.kick.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.kick.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.kick.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('unmute')
            .setDescription(localeManager.get('moderation.moderation.options.unmute.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unmute.description'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription(localeManager.get('moderation.moderation.options.unmute.options.user.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unmute.options.user.description'))
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.unmute.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unmute.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.unmute.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unmute.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('unban')
            .setDescription(localeManager.get('moderation.moderation.options.unban.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unban.description'))
            .addStringOption(option =>
                option.setName('userid')
                    .setDescription(localeManager.get('moderation.moderation.options.unban.options.userid.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unban.options.userid.description'))
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.unban.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unban.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.unban.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unban.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('warn')
            .setDescription(localeManager.get('moderation.moderation.options.warn.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.warn.description'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription(localeManager.get('moderation.moderation.options.warn.options.user.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.warn.options.user.description'))
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.warn.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.warn.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.warn.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.warn.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('unwarn')
            .setDescription(localeManager.get('moderation.moderation.options.unwarn.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unwarn.description'))
            .addUserOption(option =>
                option.setName('user')
                    .setDescription(localeManager.get('moderation.moderation.options.unwarn.options.user.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unwarn.options.user.description'))
                    .setRequired(false)
            )
            .addNumberOption(option =>
                option.setName('case')
                    .setDescription(localeManager.get('moderation.moderation.options.unwarn.options.case.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unwarn.options.case.description'))
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription(localeManager.get('moderation.moderation.options.unwarn.options.reason.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unwarn.options.reason.description'))
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription(localeManager.get('moderation.moderation.options.unwarn.options.evidence.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.moderation.options.unwarn.options.evidence.description'))
                    .setRequired(false)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)


module.exports = {
    cooldown: 3,
    data,
    async execute(interaction) {
        const lang = interaction.guildLocale;

        if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ 
                content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }
        if (!interaction.guild.members.me.permissions.has('BanMembers')) {
            await interaction.reply({ 
                content: localeManager.get('moderation.moderation.messages.me_no_perms', lang), 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const noReason = localeManager.get('moderation.moderation.messages.no_reason', lang);

        switch (subcommand) {
            case "ban": {
                if (!interaction.memberPermissions.has('BanMembers')) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                const targetUser = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.banUser(interaction, targetUser, reason, evidence);

                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.ban_done', lang),
                    lang: lang
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "mute": {
                if (!(interaction.memberPermissions.has('MuteMembers') || interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers))) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('user');
                const timeInput = interaction.options.getString('time');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.muteUser(interaction, targetUser, timeInput, reason, evidence);
                if (!result.success) {
                    return await interaction.editReply({ content: result.error });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.mute_done', lang),
                    durationString: result.durationString,
                    lang: lang
                });

                await interaction.editReply({ embeds: [embed] });
                break;
            }
            case "kick": {
                if (!interaction.memberPermissions.has('KickMembers')) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                const targetUser = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.kickUser(interaction, targetUser, reason, evidence);
                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.kick_done', lang),
                    lang: lang
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "unmute": {
                if (!interaction.memberPermissions.has('ModerateMembers') && !interaction.memberPermissions.has('MuteMembers')) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                const targetUser = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.unmuteUser(interaction, targetUser, reason, evidence);
                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.unmute_done', lang),
                    lang: lang
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "unban": {
                if (!interaction.memberPermissions.has('BanMembers')) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                const userId = interaction.options.getString('userid');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                // Validate if it's a snowflake
                if (!/^\d{17,20}$/.test(userId)) {
                    return await interaction.reply({ content: localeManager.get('moderation.moderation.messages.invalid_user_id', lang), flags: MessageFlags.Ephemeral });
                }

                const result = await ModerationService.unbanUser(interaction, userId, reason, evidence);
                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: userId,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.unban_done', lang),
                    lang: lang
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "warn": {
                if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.warnUser(interaction, targetUser, reason, evidence);
                if (!result.success) {
                    return await interaction.editReply({ content: result.error });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.warn_done', lang),
                    lang: lang
                });

                await interaction.editReply({ embeds: [embed] });
                break;
            }
            case "unwarn": {
                if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
                    return await interaction.reply({ 
                        content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                        flags: MessageFlags.Ephemeral 
                    });
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('user');
                const caseNum = interaction.options.getNumber('case');
                const reason = interaction.options.getString('reason') || noReason;
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.unwarnUser(interaction, targetUser, caseNum, reason, evidence);
                if (!result.success) {
                    return await interaction.editReply({ content: result.error });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: result.targetId,
                    reason,
                    evidence,
                    color: EmbedService.BRAND_COLOR,
                    footerText: localeManager.get('moderation.moderation.messages.unwarn_done', lang),
                    lang: lang
                });

                await interaction.editReply({ embeds: [embed] });
                break;
            }
            default:
                await interaction.reply({ 
                    content: localeManager.get('moderation.moderation.messages.unknown_sub', lang), 
                    flags: MessageFlags.Ephemeral 
                })
                break;
        }
    }
}