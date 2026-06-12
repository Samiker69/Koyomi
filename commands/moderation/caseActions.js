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
        sub.setName('evidence')
        .setDescription(localeManager.get('moderation.case.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.evidence.description'))
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(localeManager.get('moderation.case.options.evidence.options.num.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.evidence.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
        .addAttachmentOption(opt =>
            opt.setName('evidence')
            .setDescription(localeManager.get('moderation.case.options.evidence.options.evidence.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.case.options.evidence.options.evidence.description'))
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
                const success = await DatabaseService.deleteModCase(interaction.guild.id, caseNum);
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
                const success = await DatabaseService.updateModCaseReason(interaction.guild.id, caseNum, reason);
                if (success) {
                    await interaction.reply(localeManager.get('moderation.case.messages.reason_updated', lang, { num: caseNum }));

                    // Редактируем эмбед вердикта, если logMessageId сохранён в БД
                    const caseObj = await DatabaseService.getModCase(interaction.guild.id, caseNum);
                    if (caseObj && caseObj.logMessageId) {
                        const cfg = await DatabaseService.getSettings(interaction.guild.id);
                        if (cfg && cfg.verdictChannelId) {
                            const channel = await interaction.client.channels.fetch(cfg.verdictChannelId).catch(() => null);
                            if (channel && channel.isTextBased()) {
                                const msg = await channel.messages.fetch(caseObj.logMessageId).catch(() => null);
                                if (msg && msg.embeds && msg.embeds.length > 0) {
                                    const oldEmbed = msg.embeds[0];
                                    const fields = oldEmbed.fields ? [...oldEmbed.fields] : [];

                                    const reasonFieldNameEn = localeManager.get('services.embed.reason', 'en-US');
                                    const reasonFieldNameRu = localeManager.get('services.embed.reason', 'ru');
                                    const reasonFieldNameUk = localeManager.get('services.embed.reason', 'uk');

                                    const reasonFieldIndex = fields.findIndex(f => 
                                        f.name === reasonFieldNameEn || 
                                        f.name === reasonFieldNameRu || 
                                        f.name === reasonFieldNameUk ||
                                        f.name.toLowerCase() === 'reason' ||
                                        f.name.toLowerCase() === 'причина'
                                    );

                                    if (reasonFieldIndex !== -1) {
                                        fields[reasonFieldIndex].value = reason;
                                    } else {
                                        fields.push({ name: localeManager.get('services.embed.reason', lang), value: reason, inline: false });
                                    }

                                    const newEmbed = EmbedBuilder.from(oldEmbed).setFields(fields);
                                    await msg.edit({ embeds: [newEmbed] }).catch(err => {
                                        console.error('[CASE REASON] Failed to edit log embed:', err.message);
                                    });
                                }
                            }
                        }
                    }
                } else {
                    await interaction.reply(localeManager.get('moderation.case.messages.reason_update_error', lang, { num: caseNum }));
                }
                break;
            }
            case "evidence": {
                const caseNum = interaction.options.getInteger('num');
                const evidence = interaction.options.getAttachment('evidence');
                const success = await DatabaseService.updateModCaseEvidenceUrl(interaction.guild.id, caseNum, evidence.url);
                if (success) {
                    await interaction.reply(localeManager.get('moderation.case.messages.evidence_updated', lang, { num: caseNum }));

                    // Редактируем эмбед вердикта, если logMessageId сохранён в БД
                    const caseObj = await DatabaseService.getModCase(interaction.guild.id, caseNum);
                    if (caseObj && caseObj.logMessageId) {
                        const cfg = await DatabaseService.getSettings(interaction.guild.id);
                        if (cfg && cfg.verdictChannelId) {
                            const channel = await interaction.client.channels.fetch(cfg.verdictChannelId).catch(() => null);
                            if (channel && channel.isTextBased()) {
                                const msg = await channel.messages.fetch(caseObj.logMessageId).catch(() => null);
                                if (msg && msg.embeds && msg.embeds.length > 0) {
                                    const oldEmbed = msg.embeds[0];
                                    const fields = oldEmbed.fields ? [...oldEmbed.fields] : [];

                                    const evidenceFieldNameEn = localeManager.get('services.embed.evidence', 'en-US');
                                    const evidenceFieldNameRu = localeManager.get('services.embed.evidence', 'ru');
                                    const evidenceFieldNameUk = localeManager.get('services.embed.evidence', 'uk');

                                    const evidenceFieldIndex = fields.findIndex(f => 
                                        f.name === evidenceFieldNameEn || 
                                        f.name === evidenceFieldNameRu || 
                                        f.name === evidenceFieldNameUk ||
                                        f.name.toLowerCase() === 'evidence' ||
                                        f.name.toLowerCase() === 'доказательства' ||
                                        f.name.toLowerCase() === 'докази'
                                    );

                                    const clickToViewText = localeManager.get('services.embed.click_to_view', lang);
                                    const fieldValue = `[${clickToViewText}](${evidence.url})`;

                                    if (evidenceFieldIndex !== -1) {
                                        fields[evidenceFieldIndex].value = fieldValue;
                                    } else {
                                        fields.push({ name: localeManager.get('services.embed.evidence', lang), value: fieldValue, inline: false });
                                    }

                                    const newEmbed = EmbedBuilder.from(oldEmbed)
                                        .setFields(fields)
                                        .setImage(evidence.url);

                                    await msg.edit({ embeds: [newEmbed] }).catch(err => {
                                        console.error('[CASE EVIDENCE] Failed to edit log embed:', err.message);
                                    });
                                }
                            }
                        }
                    }
                } else {
                    await interaction.reply(localeManager.get('moderation.case.messages.evidence_update_error', lang, { num: caseNum }));
                }
                break;
            }
            case "view": {
                const caseNum = interaction.options.getInteger('num');
                const caseObj = await DatabaseService.getModCase(interaction.guild.id, caseNum);
                if (!caseObj) return await interaction.reply({ content: localeManager.get('moderation.case.messages.case_not_found', lang), flags: MessageFlags.Ephemeral });

                const moderator = await interaction.guild.members.fetch(caseObj.moderatorId).catch(() => null);
                const actionLabel = localeManager.get(`moderation.moderation.messages.labels.${caseObj.action}`, lang) || caseObj.action;

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: caseObj.caseNum,
                    targetId: caseObj.targetId,
                    reason: caseObj.reason,
                    evidence: caseObj.evidenceUrl ? { url: caseObj.evidenceUrl } : null,
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
                const modCases = await DatabaseService.getTargetModCases(interaction.guild.id, targetUser.id);

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