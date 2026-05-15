const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../services/DatabaseService');

const data = new SlashCommandBuilder()
    .setName('case')
    .setDescription(localeManager.get('moderation.case.description', 'en-US'))
    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.description'))
    .addSubcommand(sub =>
        sub.setName('remove')
        .setDescription(localeManager.get('moderation.case.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.remove.description'))
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(localeManager.get('moderation.case.options.remove.options.num.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.remove.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('reason')
        .setDescription(localeManager.get('moderation.case.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.reason.description'))
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(localeManager.get('moderation.case.options.reason.options.num.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.reason.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('reason')
            .setDescription(localeManager.get('moderation.case.options.reason.options.reason.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.reason.options.reason.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('view')
        .setDescription(localeManager.get('moderation.case.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.view.description'))
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(localeManager.get('moderation.case.options.view.options.num.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.view.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('user_punishments')
        .setDescription(localeManager.get('moderation.case.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.user_punishments.description'))
        .addUserOption(option =>
            option.setName('user')
                .setDescription(localeManager.get('moderation.case.options.user_punishments.options.user.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.user_punishments.options.user.description'))
                .setRequired(true)
        )
    ).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)


    module.exports = {
    cooldown: 3,
    data,
    async execute(interaction) {
        const lang = interaction.guildLocale;
        if (!(interaction.memberPermissions.has('BanMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ 
                content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "remove": {
                const caseNum = interaction.options.getInteger('num');
                const success = DatabaseService.deleteModCase(interaction.guild.id, caseNum);
                if (success) {
                    await interaction.reply(localeManager.get('moderation.case.messages.case_removed', lang, { num: caseNum }));
                } else {
                    await interaction.reply(localeManager.get('moderation.case.messages.case_remove_error', lang, { num: caseNum }));
                }
                break;
            }
            case "reason": {
                const caseNum = interaction.options.getInteger('num');
                const reason = interaction.options.getString('reason');
                const success = DatabaseService.updateModCaseReason(interaction.guild.id, caseNum, reason);
                if (success) {
                    await interaction.reply(localeManager.get('moderation.case.messages.reason_updated', lang, { num: caseNum }));
                } else {
                    await interaction.reply(localeManager.get('moderation.case.messages.reason_update_error', lang, { num: caseNum }));
                }
                break;
            }
            case "view": {
                const caseNum = interaction.options.getInteger('num');
                const caseObj = DatabaseService.getModCase(interaction.guild.id, caseNum);
                if (!caseObj) return await interaction.reply({ content: localeManager.get('moderation.case.messages.case_not_found', lang), flags: MessageFlags.Ephemeral });

                const moderator = await interaction.guild.members.fetch(caseObj.moderatorId).catch(() => null);
                const actionLabel = localeManager.get(`moderation.moderation.messages.labels.${caseObj.action}`, lang) || caseObj.action;

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: caseObj.caseNum,
                    targetId: caseObj.targetId,
                    reason: caseObj.reason,
                    color: 0x808080,
                    footerText: localeManager.get('moderation.moderation.messages.action_done_template', lang, { action: actionLabel }) || `${actionLabel} выполнен`,
                    timestamp: caseObj.timestamp,
                    moderatorUser: moderator?.user,
                    lang: lang
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "user_punishments": {
                const targetUser = interaction.options.getUser('user');
                const modCases = DatabaseService.getTargetModCases(interaction.guild.id, targetUser.id);

                const embed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('moderation.case.messages.history_title', lang, { user: targetUser.username }))
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

                if (!modCases || modCases.length === 0) {
                    embed.setDescription(localeManager.get('moderation.case.messages.history_empty', lang, { user: targetUser.username }));
                    embed.setFooter({ text: localeManager.get('moderation.case.messages.history_footer_empty', lang) });
                    await interaction.reply({ embeds: [embed] });
                    return;
                }

                const counts = {};
                for (const modCase of modCases) {
                    const action = modCase.action.toLowerCase();
                    counts[action] = (counts[action] || 0) + 1;
                }

                const statsLines = Object.entries(counts)
                    .map(([action, count]) => {
                        const label = localeManager.get(`moderation.moderation.messages.labels.${action}`, lang) || action;
                        return `• **${label}**: ${count} ${localeManager.get('moderation.case.messages.history_times', lang)}`;
                    })
                    .join('\n');

                const sortedCases = modCases.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                const maxDisplay = 10;
                const displayCases = sortedCases.slice(0, maxDisplay);

                const punishmentsText = displayCases
                    .map((modCase) => {
                        const actionLabel = localeManager.get(`moderation.moderation.messages.labels.${modCase.action}`, lang) || modCase.action;
                        return `**#${modCase.caseNum}** — **${actionLabel.toUpperCase()}**: ${modCase.reason} (<t:${Math.floor(new Date(modCase.timestamp).getTime()/1000)}:R>)`;
                    })
                    .join('\n');

                const additionalText = sortedCases.length > maxDisplay
                    ? `\n\n${localeManager.get('moderation.case.messages.history_more', lang, { max: maxDisplay, total: sortedCases.length })}`
                    : '';

                embed.setDescription(
                    `**${localeManager.get('moderation.case.messages.history_stats_title', lang)}**\n${statsLines}\n\n` +
                    `**${localeManager.get('moderation.case.messages.history_last_title', lang, { count: displayCases.length })}**\n${punishmentsText}${additionalText}`
                );
                embed.setFooter({ text: localeManager.get('moderation.case.messages.history_footer_total', lang, { count: modCases.length }) });

                await interaction.reply({ embeds: [embed] });
                break;
            }

            default:
                await interaction.reply({ 
                    content: localeManager.get('moderation.moderation.messages.unknown_sub', lang), 
                    flags: MessageFlags.Ephemeral 
                });
                break;
        }
    }
}