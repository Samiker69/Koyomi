const { MessageFlags, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const SettingsDB = require('../functions/db/settings');
const localeManager = require('../locales/localeManager');

const Sdb = new SettingsDB();

class ReportService {
    static async safeReply(interaction, key, lang, variables = {}, isEphemeral = true) {
        const content = localeManager.get(key, lang, variables);
        const options = { content, flags: isEphemeral ? MessageFlags.Ephemeral : undefined };
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(options);
            } else {
                await interaction.reply(options);
            }
        } catch (e) {
            console.error(`[SafeReply Error] Не удалось ответить/продолжить взаимодействие. Ключ: "${key}". Ошибка:`, e);
        }
    }

    static extractUserId(text) {
        if (!text) return null;
        const mentionMatch = text.match(/<@!?(\d+)>/);
        if (mentionMatch) return mentionMatch[1];
        if (text.match(/^\d+$/)) return text;
        return null;
    }


    static async _getReportContext(interaction, messageId = null, requirePermissions = false) {
        const lang = interaction.guildLocale || 'ru';
        if (requirePermissions &&
            !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) &&
            !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await this.safeReply(interaction, 'moderation.report.service.errors.no_permissions', lang, {}, true);
            return null;
        }

        const guildSettings = await Sdb.getSettings(interaction.guild.id);
        const moderationChannelId = guildSettings?.reportsModerationChannelId;

        if (!moderationChannelId) {
            await this.safeReply(interaction, 'moderation.report.service.errors.channel_not_set', lang, {}, true);
            return null;
        }

        const moderationChannel = await interaction.client.channels.fetch(moderationChannelId).catch(() => null);
        if (!moderationChannel) {
            await this.safeReply(interaction, 'moderation.report.service.errors.channel_not_found', lang, {}, true);
            return null;
        }

        if (!messageId) {
            return { moderationChannel };
        }

        const reportMessage = await moderationChannel.messages.fetch(messageId).catch(() => null);
        if (!reportMessage) {
            await this.safeReply(interaction, 'moderation.report.service.errors.report_not_found', lang, {}, true);
            return null;
        }

        if (!reportMessage.embeds || reportMessage.embeds.length === 0) {
            await this.safeReply(interaction, 'moderation.report.service.errors.report_no_embed', lang, {}, true);
            return null;
        }

        const currentEmbed = EmbedBuilder.from(reportMessage.embeds[0]);
        const fields = currentEmbed.data && Array.isArray(currentEmbed.data.fields) ? currentEmbed.data.fields : [];

        return { moderationChannel, reportMessage, currentEmbed, fields };
    }

    static _buildButtons(messageId, targetUserId, disableModActions = false, lang = 'ru') {
        const modButtonsRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`modAction_accept_${messageId}`)
                    .setLabel(localeManager.get('moderation.report.service.labels.accept', lang))
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disableModActions),
                new ButtonBuilder()
                    .setCustomId(`modAction_decline_${messageId}`)
                    .setLabel(localeManager.get('moderation.report.service.labels.decline', lang))
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(disableModActions),
                new ButtonBuilder()
                    .setCustomId(`modAction_inProgress_${messageId}`)
                    .setLabel(localeManager.get('moderation.report.service.labels.in_progress', lang))
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disableModActions),
                new ButtonBuilder()
                    .setCustomId(`modAction_reply_${messageId}`)
                    .setLabel(localeManager.get('moderation.report.service.labels.reply', lang))
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disableModActions),
                new ButtonBuilder()
                    .setCustomId(`modAction_resolved_${messageId}`)
                    .setLabel(localeManager.get('moderation.report.service.labels.resolved', lang))
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disableModActions)
            );

        const utilityButtonsRow = new ActionRowBuilder();
        if (targetUserId) {
            utilityButtonsRow.addComponents(
                new ButtonBuilder()
                    .setURL(`https://discord.com/users/${targetUserId}`)
                    .setLabel(localeManager.get('moderation.report.service.labels.profile', lang))
                    .setStyle(ButtonStyle.Link)
            );
        }
        utilityButtonsRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`modAction_addNote_${messageId}`)
                .setLabel(localeManager.get('moderation.report.service.labels.add_note', lang))
                .setStyle(ButtonStyle.Secondary)
        );

        return [modButtonsRow, utilityButtonsRow];
    }

    static _updateHistory(currentEmbed, fields, actionDescription, lang = 'ru') {
        const historyLabel = localeManager.get('moderation.report.service.labels.history', lang);
        const historyFieldIndex = fields.findIndex(f => f.name === historyLabel);
        if (historyFieldIndex === -1) {
            currentEmbed.addFields({ name: historyLabel, value: actionDescription, inline: false });
        } else {
            const existingHistory = fields[historyFieldIndex].value.split('\n');
            const newHistory = [actionDescription, ...existingHistory].slice(0, 5);
            currentEmbed.spliceFields(historyFieldIndex, 1, { name: historyLabel, value: newHistory.join('\n'), inline: false });
        }
    }

    static _updateStatus(currentEmbed, fields, newStatus, lang = 'ru') {
        const statusLabel = localeManager.get('moderation.report.service.labels.status', lang);
        const statusFieldIndex = fields.findIndex(f => f.name === statusLabel);
        if (statusFieldIndex !== -1) {
            currentEmbed.spliceFields(statusFieldIndex, 1, { name: statusLabel, value: newStatus, inline: true });
        } else {
            currentEmbed.addFields({ name: statusLabel, value: newStatus, inline: true });
        }
    }

    static async _notifyReporter(interaction, fields, title, description, color, footerText, lang = 'ru') {
        const fromLabel = localeManager.get('moderation.report.service.labels.from', lang);
        const typeLabel = localeManager.get('moderation.report.service.labels.type', lang);
        const textLabel = localeManager.get('moderation.report.service.labels.text', lang);

        const reporterIdMatch = fields.find(f => f.name === fromLabel)?.value.match(/<@(\d+)>/);
        if (!reporterIdMatch || !reporterIdMatch[1]) return false;

        const reporterUser = await interaction.client.users.fetch(reporterIdMatch[1]).catch(() => null);
        if (!reporterUser) return false;

        const dmEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .addFields(
                { name: typeLabel, value: fields.find(f => f.name === typeLabel)?.value || '???', inline: true },
                { name: textLabel, value: fields.find(f => f.name === textLabel)?.value.substring(0, 1024) || '???' }
            )
            .setFooter({ text: footerText })
            .setTimestamp();

        try {
            await reporterUser.send({ embeds: [dmEmbed] });
            return true;
        } catch (dmError) {
            console.error(`[ОШИБКА] Ошибка отправки DM пользователю ${reporterUser.tag}:`, dmError);
            return false;
        }
    }


    static async handleContextMenuReport(interaction) {
        const lang = interaction.guildLocale || 'ru';
        try {
            const targetMessage = interaction.targetMessage;

            const modal = new ModalBuilder()
                .setCustomId(`submitReportModal_message_${targetMessage.id}`)
                .setTitle(localeManager.get('moderation.report.service.modals.report_title', lang));

            const descriptionInput = new TextInputBuilder()
                .setCustomId('reportDescription')
                .setLabel(localeManager.get('moderation.report.service.modals.description_label', lang))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder(localeManager.get('moderation.report.service.modals.description_placeholder', lang));

            const messageAuthorInput = new TextInputBuilder()
                .setCustomId('messageAuthorInfo')
                .setLabel(localeManager.get('moderation.report.service.modals.author_label', lang))
                .setStyle(TextInputStyle.Short)
                .setValue(`${targetMessage.author.tag} (${targetMessage.author.id})`)
                .setRequired(false)
                .setDisabled(true);

            const messageLinkInput = new TextInputBuilder()
                .setCustomId('messageLinkInfo')
                .setLabel(localeManager.get('moderation.report.service.modals.link_info_label', lang))
                .setStyle(TextInputStyle.Short)
                .setValue(targetMessage.url)
                .setRequired(false)
                .setDisabled(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(descriptionInput),
                new ActionRowBuilder().addComponents(messageAuthorInput),
                new ActionRowBuilder().addComponents(messageLinkInput)
            );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Ошибка при создании модального окна из контекстного меню:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }

    static async handleReportButton(interaction, reportType) {
        const lang = interaction.guildLocale || 'ru';
        try {
            const reportTypeKey = `moderation.report.service.modals.report_on_${reportType === 'message' ? 'msg' : reportType === 'user' ? 'user' : reportType === 'moderator' ? 'mod' : 'other'}`;
            const modalTitle = `${localeManager.get('moderation.report.service.modals.report_title', lang)}: ${localeManager.get(reportTypeKey, lang)}`;

            const modal = new ModalBuilder()
                .setCustomId(`submitReportModal_${reportType}`)
                .setTitle(modalTitle.substring(0, 45));

            const descriptionInput = new TextInputBuilder()
                .setCustomId('reportDescription')
                .setLabel(localeManager.get('moderation.report.service.modals.description_label', lang))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder(localeManager.get('moderation.report.service.modals.description_placeholder', lang));

            const targetInput = new TextInputBuilder()
                .setCustomId('reportTarget')
                .setLabel(localeManager.get('moderation.report.service.modals.target_label', lang))
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder(localeManager.get('moderation.report.service.modals.target_placeholder', lang));

            const linkInput = new TextInputBuilder()
                .setCustomId('reportLink')
                .setLabel(localeManager.get('moderation.report.service.modals.link_label', lang))
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder(localeManager.get('moderation.report.service.modals.link_placeholder', lang));

            modal.addComponents(
                new ActionRowBuilder().addComponents(descriptionInput),
                new ActionRowBuilder().addComponents(targetInput),
                new ActionRowBuilder().addComponents(linkInput)
            );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Ошибка при создании модального окна из кнопки:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }

    static async handleModAction(interaction, actionType, originalReportMessageId) {
        const lang = interaction.guildLocale || 'ru';
        try {
            const context = await this._getReportContext(interaction, originalReportMessageId, true);
            if (!context) return;
            const { reportMessage, currentEmbed, fields } = context;

            const onLabel = localeManager.get('moderation.report.service.labels.on', lang);
            const statusLabel = localeManager.get('moderation.report.service.labels.status', lang);
            const targetField = fields.find(f => f.name === onLabel);
            const targetId = targetField ? this.extractUserId(targetField.value) : null;

            let replyContentForUser = '';
            let actionDescription = '';
            const timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;

            switch (actionType) {
                case 'accept':
                    await interaction.deferUpdate();
                    currentEmbed.setColor('Green').setFooter({ text: localeManager.get('services.report.accepted_by', lang, { user: interaction.user.tag }) });
                    this._updateStatus(currentEmbed, fields, localeManager.get('moderation.report.service.status.accepted', lang), lang);
                    replyContentForUser = localeManager.get('moderation.report.service.notifications.accepted_text', lang);
                    actionDescription = `**${timestamp}** | ${localeManager.get('moderation.report.service.actions.accepted', lang, { user: interaction.user.tag })}`;
                    break;
                case 'decline':
                    const declineModal = new ModalBuilder()
                        .setCustomId(`declineReportModal_${originalReportMessageId}`)
                        .setTitle(localeManager.get('moderation.report.service.modals.decline_title', lang));
                    const declineReasonInput = new TextInputBuilder()
                        .setCustomId('declineReason')
                        .setLabel(localeManager.get('moderation.report.service.modals.decline_reason_label', lang))
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder(localeManager.get('moderation.report.service.modals.decline_reason_placeholder', lang));
                    declineModal.addComponents(new ActionRowBuilder().addComponents(declineReasonInput));
                    await interaction.showModal(declineModal);
                    return;
                case 'inProgress':
                    await interaction.deferUpdate();
                    currentEmbed.setColor('Orange').setFooter({ text: localeManager.get('services.report.under_review_by', lang, { user: interaction.user.tag }) });
                    this._updateStatus(currentEmbed, fields, localeManager.get('moderation.report.service.status.in_progress', lang), lang);
                    replyContentForUser = localeManager.get('moderation.report.service.notifications.in_progress_text', lang);
                    actionDescription = `**${timestamp}** | ${localeManager.get('moderation.report.service.actions.in_progress', lang, { user: interaction.user.tag })}`;
                    break;
                case 'reply':
                    const replyModal = new ModalBuilder()
                        .setCustomId(`sendReplyToUserModal_${originalReportMessageId}`)
                        .setTitle(localeManager.get('moderation.report.service.modals.reply_title', lang));
                    const replyTextInput = new TextInputBuilder()
                        .setCustomId('moderatorReplyText')
                        .setLabel(localeManager.get('moderation.report.service.modals.reply_label', lang))
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder(localeManager.get('moderation.report.service.modals.reply_placeholder', lang));
                    replyModal.addComponents(new ActionRowBuilder().addComponents(replyTextInput));
                    await interaction.showModal(replyModal);
                    return;
                case 'resolved':
                    await interaction.deferUpdate();
                    currentEmbed.setColor('#7289DA').setFooter({ text: localeManager.get('services.report.resolved_by', lang, { user: interaction.user.tag }) });
                    this._updateStatus(currentEmbed, fields, localeManager.get('moderation.report.service.status.resolved', lang), lang);
                    replyContentForUser = localeManager.get('moderation.report.service.notifications.resolved_text', lang);
                    actionDescription = `**${timestamp}** | ${localeManager.get('moderation.report.service.actions.resolved', lang, { user: interaction.user.tag })}`;
                    break;
                case 'addNote':
                    const noteModal = new ModalBuilder()
                        .setCustomId(`addNoteModal_${originalReportMessageId}`)
                        .setTitle(localeManager.get('moderation.report.service.modals.note_title', lang));
                    const noteTextInput = new TextInputBuilder()
                        .setCustomId('moderatorNote')
                        .setLabel(localeManager.get('moderation.report.service.modals.note_label', lang))
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder(localeManager.get('moderation.report.service.modals.note_placeholder', lang));
                    noteModal.addComponents(new ActionRowBuilder().addComponents(noteTextInput));
                    await interaction.showModal(noteModal);
                    return;
            }

            if (actionDescription) {
                this._updateHistory(currentEmbed, fields, actionDescription, lang);
            }

            const disableModActions = (actionType === 'accept' || actionType === 'decline' || actionType === 'resolved');
            const components = this._buildButtons(originalReportMessageId, targetId, disableModActions, lang);

            await reportMessage.edit({ embeds: [currentEmbed], components });
            await this.safeReply(interaction, 'moderation.report.service.feedback.action_performed', lang, { action: actionType }, true);

            if (replyContentForUser) {
                await this._notifyReporter(
                    interaction,
                    fields,
                    localeManager.get('moderation.report.service.notifications.update_title', lang, { guild: interaction.guild.name }),
                    replyContentForUser,
                    currentEmbed.data.color || 'Default',
                    localeManager.get('moderation.report.service.notifications.footer_status', lang, { status: fields.find(f => f.name === statusLabel)?.value || '???' }),
                    lang
                );
            }
        } catch (error) {
            console.error('Ошибка при обработке действия модератора:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }

    static async handleSubmitReport(interaction, reportType, targetMessageId) {
        const lang = interaction.guildLocale || 'ru';
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const description = interaction.fields.getTextInputValue('reportDescription');
            let targetInput = interaction.fields.getTextInputValue('reportTarget');
            let link = interaction.fields.getTextInputValue('reportLink');

            if (reportType === 'message' && targetMessageId) {
                const messageAuthorInfo = interaction.fields.getTextInputValue('messageAuthorInfo');
                const messageLinkInfo = interaction.fields.getTextInputValue('messageLinkInfo');

                if (messageAuthorInfo) {
                    const match = messageAuthorInfo.match(/\((\d+)\)/);
                    if (match) targetInput = match[1];
                }
                if (messageLinkInfo) link = messageLinkInfo;
            }

            const context = await this._getReportContext(interaction, null, false);
            if (!context) return;
            const { moderationChannel } = context;

            const submissionTimestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;

            const reportEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(localeManager.get('moderation.report.service.feedback.new_report_title', lang))
                .addFields(
                    { name: localeManager.get('moderation.report.service.labels.from', lang), value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                    { name: localeManager.get('moderation.report.service.labels.type', lang), value: reportType.charAt(0).toUpperCase() + reportType.slice(1), inline: true },
                    { name: localeManager.get('moderation.report.service.labels.text', lang), value: description },
                    { name: localeManager.get('moderation.report.service.labels.status', lang), value: localeManager.get('moderation.report.service.status.pending', lang), inline: true },
                    { name: localeManager.get('moderation.report.service.labels.history', lang), value: `${submissionTimestamp} | ${localeManager.get('moderation.report.service.actions.submitted', lang)}`, inline: false }
                )
                .setTimestamp();

            let targetUserForEmbed = 'N/A';
            let fetchedTargetUser = null;

            if (targetInput) {
                const targetIdFromInput = this.extractUserId(targetInput);
                if (targetIdFromInput) {
                    fetchedTargetUser = await interaction.client.users.fetch(targetIdFromInput).catch(() => null);
                    if (fetchedTargetUser) {
                        targetUserForEmbed = `<@${fetchedTargetUser.id}> (${fetchedTargetUser.tag})`;
                    } else {
                        targetUserForEmbed = localeManager.get('moderation.report.service.feedback.unknown_user', lang, { target: targetInput });
                    }
                } else {
                    const members = await interaction.guild.members.fetch({ query: targetInput, limit: 1 }).catch(() => null);
                    if (members && members.size > 0) {
                        fetchedTargetUser = members.first().user;
                        targetUserForEmbed = `<@${fetchedTargetUser.id}> (${fetchedTargetUser.tag})`;
                    } else {
                        targetUserForEmbed = localeManager.get('moderation.report.service.feedback.not_found_user', lang, { target: targetInput });
                    }
                }
            }
            reportEmbed.addFields({ name: localeManager.get('moderation.report.service.labels.on', lang), value: targetUserForEmbed, inline: true });

            if (link) {
                reportEmbed.addFields({ name: localeManager.get('moderation.report.service.labels.evidence', lang), value: `${localeManager.get('moderation.report.service.labels.evidence_link', lang)}(${link})` });
            }

            const placeholderComponents = this._buildButtons('PLACEHOLDER_ID', fetchedTargetUser ? fetchedTargetUser.id : null, false, lang);

            const sentReportMessage = await moderationChannel.send({
                embeds: [reportEmbed],
                components: placeholderComponents
            });

            const finalComponents = this._buildButtons(sentReportMessage.id, fetchedTargetUser ? fetchedTargetUser.id : null, false, lang);
            await sentReportMessage.edit({ components: finalComponents });

            await this.safeReply(interaction, 'moderation.report.service.feedback.report_sent', lang, { id: sentReportMessage.id }, true);
        } catch (error) {
            console.error('Ошибка при отправке жалобы через модальное окно:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }

    static async handleReplyToUser(interaction, originalReportMessageId) {
        const lang = interaction.guildLocale || 'ru';
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const moderatorReplyText = interaction.fields.getTextInputValue('moderatorReplyText');

            const context = await this._getReportContext(interaction, originalReportMessageId, false);
            if (!context) return;
            const { reportMessage, currentEmbed, fields } = context;

            const onLabel = localeManager.get('moderation.report.service.labels.on', lang);
            const statusLabel = localeManager.get('moderation.report.service.labels.status', lang);

            const targetField = fields.find(f => f.name === onLabel);
            const targetId = targetField ? this.extractUserId(targetField.value) : null;

            this._updateStatus(currentEmbed, fields, localeManager.get('moderation.report.service.status.replied', lang), lang);
            currentEmbed.setColor('Blue').setFooter({ text: localeManager.get('services.report.replied_by', lang, { user: interaction.user.tag }) });

            const timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;
            this._updateHistory(currentEmbed, fields, `**${timestamp}** | ${localeManager.get('moderation.report.service.actions.replied', lang, { user: interaction.user.tag })}`, lang);

            const components = this._buildButtons(originalReportMessageId, targetId, true, lang);
            await reportMessage.edit({ embeds: [currentEmbed], components });

            const notified = await this._notifyReporter(
                interaction,
                fields,
                localeManager.get('moderation.report.service.notifications.reply_title', lang, { guild: interaction.guild.name }),
                moderatorReplyText,
                'Blue',
                localeManager.get('moderation.report.service.notifications.footer_reply', lang, { user: interaction.user.tag }),
                lang
            );

            if (notified) {
                await this.safeReply(interaction, 'moderation.report.service.feedback.reply_sent', lang, {}, true);
            } else {
                await this.safeReply(interaction, 'moderation.report.service.feedback.reply_error', lang, {}, true);
            }
        } catch (error) {
            console.error('Ошибка при отправке ответа модератора:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }

    static async handleDeclineReport(interaction, originalReportMessageId) {
        const lang = interaction.guildLocale || 'ru';
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const declineReason = interaction.fields.getTextInputValue('declineReason');

            const context = await this._getReportContext(interaction, originalReportMessageId, false);
            if (!context) return;
            const { reportMessage, currentEmbed, fields } = context;

            const onLabel = localeManager.get('moderation.report.service.labels.on', lang);

            const targetField = fields.find(f => f.name === onLabel);
            const targetId = targetField ? this.extractUserId(targetField.value) : null;

            this._updateStatus(currentEmbed, fields, localeManager.get('moderation.report.service.status.declined', lang), lang);
            currentEmbed.setColor('Red').setFooter({ text: localeManager.get('services.report.declined_by', lang, { user: interaction.user.tag }) });

            const timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;
            this._updateHistory(currentEmbed, fields, `**${timestamp}** | ${localeManager.get('moderation.report.service.actions.declined', lang, { user: interaction.user.tag })}`, lang);

            const components = this._buildButtons(originalReportMessageId, targetId, true, lang);
            await reportMessage.edit({ embeds: [currentEmbed], components });

            await this._notifyReporter(
                interaction,
                fields,
                localeManager.get('moderation.report.service.notifications.decline_title', lang, { guild: interaction.guild.name }),
                localeManager.get('moderation.report.service.notifications.decline_text', lang, { reason: declineReason }),
                'Red',
                localeManager.get('moderation.report.service.notifications.footer_decline', lang),
                lang
            );

            await this.safeReply(interaction, 'moderation.report.service.feedback.decline_done', lang, {}, true);
        } catch (error) {
            console.error('Ошибка при отклонении жалобы:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }

    static async handleAddNote(interaction, originalReportMessageId) {
        const lang = interaction.guildLocale || 'ru';
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const moderatorNote = interaction.fields.getTextInputValue('moderatorNote');

            const context = await this._getReportContext(interaction, originalReportMessageId, false);
            if (!context) return;
            const { reportMessage, currentEmbed, fields } = context;

            const timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;
            const noteEntry = localeManager.get('moderation.report.service.actions.note_added', lang, { user: interaction.user.tag, note: moderatorNote.substring(0, 500) });

            const notesLabel = localeManager.get('moderation.report.service.labels.notes', lang);
            const notesFieldIndex = fields.findIndex(f => f.name === notesLabel);
            if (notesFieldIndex === -1) {
                currentEmbed.addFields({ name: notesLabel, value: noteEntry, inline: false });
            } else {
                const existingNotes = fields[notesFieldIndex].value.split('\n');
                const newNotes = [noteEntry, ...existingNotes].slice(0, 5);
                currentEmbed.spliceFields(notesFieldIndex, 1, { name: notesLabel, value: newNotes.join('\n'), inline: false });
            }

            await reportMessage.edit({ embeds: [currentEmbed], components: reportMessage.components });
            await this.safeReply(interaction, 'moderation.report.service.feedback.note_done', lang, {}, true);
        } catch (error) {
            console.error('Ошибка при добавлении заметки:', error);
            await this.safeReply(interaction, 'moderation.report.service.errors.unexpected', lang, {}, true);
        }
    }
}

module.exports = ReportService;
