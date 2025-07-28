const { Events, MessageFlags, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ApplicationCommandType } = require('discord.js');
const SettingsDB = require('../../functions/db/settings'); 

const Sdb = new SettingsDB();

async function safeReply(interaction, content, isEphemeral = true) {
    const options = { content, flags: isEphemeral ? MessageFlags.Ephemeral : undefined };
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(options);
        } else {
            await interaction.reply(options);
        }
    } catch (e) {
        console.error(`[SafeReply Error] Не удалось ответить/продолжить взаимодействие. Содержимое: "${content}". Ошибка:`, e);
    }
}

function extractUserId(text) {
    if (!text) return null;
    const mentionMatch = text.match(/<@!?(\d+)>/); 
    if (mentionMatch) return mentionMatch[1];
    if (text.match(/^\d+$/)) return text; 
    return null;
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isMessageContextMenuCommand()) {
            return;
        }

        const customId = interaction.isButton() || interaction.isModalSubmit() ? interaction.customId : null;

        if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Пожаловаться на сообщение') {
            try {
                const targetMessage = interaction.targetMessage;

                const modal = new ModalBuilder()
                    .setCustomId(`submitReportModal_message_${targetMessage.id}`) 
                    .setTitle('Подать жалобу на сообщение');

                const descriptionInput = new TextInputBuilder()
                    .setCustomId('reportDescription')
                    .setLabel('Опишите проблему подробно')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('Например: "Спам", "Оскорбления".');

                const messageAuthorInput = new TextInputBuilder()
                    .setCustomId('messageAuthorInfo')
                    .setLabel('Автор сообщения')
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${targetMessage.author.tag} (${targetMessage.author.id})`)
                    .setRequired(false)
                    .setDisabled(true); 

                const messageLinkInput = new TextInputBuilder()
                    .setCustomId('messageLinkInfo')
                    .setLabel('Ссылка на сообщение')
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
                await safeReply(interaction, 'Произошла ошибка при подготовке формы жалобы. Пожалуйста, попробуйте еще раз.', true);
            }
            return;
        }


        if (interaction.isButton() && customId.startsWith('report_')) {
            try {
                const reportType = customId.split('_')[1]; 

                const modal = new ModalBuilder()
                    .setCustomId(`submitReportModal_${reportType}`) 
                    .setTitle(`Подать жалобу: ${
                        reportType === 'message' ? 'На сообщение' :
                        reportType === 'user' ? 'На участника' :
                        reportType === 'moderator' ? 'На модератора' :
                        'Другое'
                    }`);

                const descriptionInput = new TextInputBuilder()
                    .setCustomId('reportDescription')
                    .setLabel('Опишите проблему подробно')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('Например: "Спам", "Оскорбления".');

                const targetInput = new TextInputBuilder()
                    .setCustomId('reportTarget')
                    .setLabel('Кто нарушитель? (ID, упоминание, никнейм)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setPlaceholder('Например: 123456789012345678, @нарушитель или Nickname');

                const linkInput = new TextInputBuilder()
                    .setCustomId('reportLink')
                    .setLabel('Ссылка на доказательства (необязательно)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setPlaceholder('Например: discord.com/channels/...');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(targetInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );

                await interaction.showModal(modal);
            } catch (error) {
                console.error('Ошибка при создании модального окна из кнопки:', error); 
                await safeReply(interaction, 'Произошла ошибка при подготовке формы жалобы. Пожалуйста, попробуйте еще раз.', true);
            }
            return;
        }

        if (interaction.isButton() && customId.startsWith('modAction_')) {
            try {
                const parts = customId.split('_');
                const actionType = parts[1]; 
                const originalReportMessageId = parts[2]; 

                if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && 
                    !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return await safeReply(interaction, 'У вас нет прав для выполнения этого действия.', true);
                }

                const guildSettings = await Sdb.getSettings(interaction.guild.id);
                const moderationChannelId = guildSettings?.reportsModerationChannelId;

                if (!moderationChannelId) {
                    return await safeReply(interaction, 'Канал для модерации жалоб не настроен для этого сервера. Обратитесь к администратору.', true);
                }

                const moderationChannel = await interaction.client.channels.fetch(moderationChannelId).catch(() => null);
                if (!moderationChannel) {
                    return await safeReply(interaction, 'Модераторский канал жалоб не найден или недоступен. Возможно, он был удален или бот не имеет к нему доступа.', true);
                }

                const reportMessage = await moderationChannel.messages.fetch(originalReportMessageId).catch(() => null);
                if (!reportMessage) {
                    return await safeReply(interaction, 'Исходное сообщение с жалобой не найдено. Возможно, оно было удалено или уже обработано.', true);
                }
                
                if (!reportMessage.embeds || reportMessage.embeds.length === 0) {
                    return await safeReply(interaction, 'Сообщение с жалобой не содержит информации (эмбеда) для обработки.', true);
                }

                const currentEmbed = EmbedBuilder.from(reportMessage.embeds[0]);
                let fields = currentEmbed.data && Array.isArray(currentEmbed.data.fields) ? currentEmbed.data.fields : [];

                const originalComponents = reportMessage.components;
                
                const newModerationButtonsRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`modAction_accept_${originalReportMessageId}`)
                            .setLabel('Принять')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(actionType === 'accept' || actionType === 'decline' || actionType === 'resolved'),
                        new ButtonBuilder()
                            .setCustomId(`modAction_decline_${originalReportMessageId}`)
                            .setLabel('Отклонить')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(actionType === 'accept' || actionType === 'decline' || actionType === 'resolved'),
                        new ButtonBuilder()
                            .setCustomId(`modAction_inProgress_${originalReportMessageId}`)
                            .setLabel('В процессе')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(actionType === 'accept' || actionType === 'decline' || actionType === 'resolved'),
                        new ButtonBuilder()
                            .setCustomId(`modAction_reply_${originalReportMessageId}`)
                            .setLabel('Ответить')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(actionType === 'accept' || actionType === 'decline' || actionType === 'resolved'),
                        new ButtonBuilder()
                            .setCustomId(`modAction_resolved_${originalReportMessageId}`)
                            .setLabel('Закрыть')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(actionType === 'accept' || actionType === 'decline' || actionType === 'resolved')
                    );
                
                const utilityButtonsRow = new ActionRowBuilder();
                
                const targetField = fields.find(f => f.name === 'На:');
                const targetId = targetField ? extractUserId(targetField.value) : null;
                if (targetId) {
                    utilityButtonsRow.addComponents(
                        new ButtonBuilder()
                            .setURL(`https://discord.com/users/${targetId}`) 
                            .setLabel('Профиль нарушителя')
                            .setStyle(ButtonStyle.Link)
                    );
                }

                utilityButtonsRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`modAction_addNote_${originalReportMessageId}`)
                        .setLabel('Добавить заметку')
                        .setStyle(ButtonStyle.Secondary)
                );

                let replyContentForUser = ''; 
                let actionDescription = ''; 

                let statusFieldIndex = fields.findIndex(f => f.name === 'Статус:');
                if (statusFieldIndex === -1) {
                    currentEmbed.addFields({ name: 'Статус:', value: 'Неизвестен', inline: true });
                    fields = currentEmbed.data.fields; 
                    statusFieldIndex = fields.findIndex(f => f.name === 'Статус:');
                }

                let historyFieldIndex = fields.findIndex(f => f.name === 'История действий:');
                const now = new Date();
                const timestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`; 

                switch (actionType) {
                    case 'accept':
                        await interaction.deferUpdate(); 
                        currentEmbed.setColor('Green').setFooter({ text: `Принято модератором: ${interaction.user.tag}` });
                        currentEmbed.spliceFields(statusFieldIndex, 1, { name: 'Статус:', value: 'Принята (меры приняты)', inline: true }); 
                        replyContentForUser = 'Ваша жалоба была принята модераторами, и по ней приняты меры. Спасибо за ваше обращение!';
                        actionDescription = `**${timestamp}** | Принята (${interaction.user.tag})`;
                        break;
                    case 'decline':
                        const declineModal = new ModalBuilder()
                            .setCustomId(`declineReportModal_${originalReportMessageId}`) 
                            .setTitle('Причина отклонения');

                        const declineReasonInput = new TextInputBuilder()
                            .setCustomId('declineReason')
                            .setLabel('Причина отклонения жалобы') 
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setPlaceholder('Например: "Недостаточно доказательств", "Нарушение не выявлено".');

                        declineModal.addComponents(new ActionRowBuilder().addComponents(declineReasonInput));
                        await interaction.showModal(declineModal);
                        return; 
                    case 'inProgress':
                        await interaction.deferUpdate(); 
                        currentEmbed.setColor('Orange').setFooter({ text: `Взято в работу: ${interaction.user.tag}` });
                        currentEmbed.spliceFields(statusFieldIndex, 1, { name: 'Статус:', value: 'В процессе рассмотрения', inline: true }); 
                        replyContentForUser = 'Ваша жалоба сейчас находится на рассмотрении. Ожидайте дальнейших действий.';
                        actionDescription = `**${timestamp}** | В процессе (${interaction.user.tag})`;
                        break;
                    case 'reply':
                        const replyModal = new ModalBuilder()
                            .setCustomId(`sendReplyToUserModal_${originalReportMessageId}`) 
                            .setTitle('Отправить ответ пользователю');

                        const replyTextInput = new TextInputBuilder()
                            .setCustomId('moderatorReplyText')
                            .setLabel('Текст ответа пользователю')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setPlaceholder('Например: "Мы рассмотрели вашу жалобу и приняли меры."');

                        replyModal.addComponents(new ActionRowBuilder().addComponents(replyTextInput));
                        await interaction.showModal(replyModal);
                        return; 
                    case 'resolved':
                        await interaction.deferUpdate(); 
                        currentEmbed.setColor('#7289DA').setFooter({ text: `Закрыто модератором: ${interaction.user.tag}` });
                        currentEmbed.spliceFields(statusFieldIndex, 1, { name: 'Статус:', value: 'Закрыта (решена)', inline: true });
                        replyContentForUser = 'Ваша жалоба была успешно рассмотрена и закрыта.';
                        actionDescription = `**${timestamp}** | Закрыта (${interaction.user.tag})`;
                        break;
                    case 'addNote': 
                        const noteModal = new ModalBuilder()
                            .setCustomId(`addNoteModal_${originalReportMessageId}`)
                            .setTitle('Добавить заметку к жалобе');

                        const noteTextInput = new TextInputBuilder()
                            .setCustomId('moderatorNote')
                            .setLabel('Текст заметки')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setPlaceholder('Добавьте информацию, видимую только модераторам.');

                        noteModal.addComponents(new ActionRowBuilder().addComponents(noteTextInput));
                        await interaction.showModal(noteModal);
                        return; 
                }

                if (actionDescription) {
                    if (historyFieldIndex === -1) {
                        currentEmbed.addFields({ name: 'История действий:', value: actionDescription, inline: false });
                    } else {
                        const existingHistory = fields[historyFieldIndex].value.split('\n');
                        const newHistory = [actionDescription, ...existingHistory].slice(0, 5); 
                        currentEmbed.spliceFields(historyFieldIndex, 1, { name: 'История действий:', value: newHistory.join('\n'), inline: false });
                    }
                }
                
                await reportMessage.edit({ embeds: [currentEmbed], components: [newModerationButtonsRow, utilityButtonsRow] }); 
                await safeReply(interaction, `Действие "${actionType}" выполнено для жалобы. Статус обновлен.`, true);

                const reporterIdMatch = fields.find(f => f.name === 'От:')?.value.match(/<@(\d+)>/); 
                if (reporterIdMatch && reporterIdMatch[1]) {
                    const reporterUser = await interaction.client.users.fetch(reporterIdMatch[1]).catch(() => null);
                    if (reporterUser && replyContentForUser) {
                         const dmEmbed = new EmbedBuilder()
                            .setColor(currentEmbed.data.color || 'Default')
                            .setTitle(`Обновление по вашей жалобе на сервере ${interaction.guild.name}`)
                            .setDescription(replyContentForUser)
                            .addFields(
                                { name: 'Тип жалобы:', value: fields.find(f => f.name === 'Тип жалобы:')?.value || 'Неизвестен', inline: true },
                                { name: 'Ваша жалоба:', value: fields.find(f => f.name === 'Текст жалобы:')?.value.substring(0, 1024) || 'Н/Д' }
                            )
                            .setFooter({ text: `Текущий статус: ${fields.find(f => f.name === 'Статус:')?.value || 'Неизвестен'}` })
                            .setTimestamp();

                        await reporterUser.send({ embeds: [dmEmbed] })
                            .catch(dmError => console.error(`[ОШИБКА] Ошибка отправки DM пользователю ${reporterUser.tag}:`, dmError));
                    }
                }
            } catch (error) {
                console.error('Ошибка при обработке действия модератора:', error);
                await safeReply(interaction, 'Произошла ошибка при обработке действия модератора.', true);
            }
            return;
        }

        if (interaction.isModalSubmit()) {
            const [action, ...args] = interaction.customId.split('_');

            if (action === 'submitReportModal') {
                try {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral }); 

                    const reportType = args[0]; 
                    const targetMessageId = args.length > 1 ? args[1] : null; 

                    const description = interaction.fields.getTextInputValue('reportDescription');
                    let targetInput = interaction.fields.getTextInputValue('reportTarget');
                    let link = interaction.fields.getTextInputValue('reportLink');

                    if (reportType === 'message' && targetMessageId) {
                        const messageAuthorInfo = interaction.fields.getTextInputValue('messageAuthorInfo');
                        const messageLinkInfo = interaction.fields.getTextInputValue('messageLinkInfo');
                        
                        if (messageAuthorInfo) {
                            const match = messageAuthorInfo.match(/\((\d+)\)/);
                            if (match) {
                                targetInput = match[1]; 
                            }
                        }
                        if (messageLinkInfo) {
                            link = messageLinkInfo; 
                        }
                    }

                    const guildSettings = await Sdb.getSettings(interaction.guild.id);
                    const moderationChannelId = guildSettings?.reportsModerationChannelId;

                    if (!moderationChannelId) {
                        return await safeReply(interaction, 'Ошибка: Канал для модерации жалоб не настроен для этого сервера. Обратитесь к администратору.', true);
                    }

                    const moderationChannel = await interaction.client.channels.fetch(moderationChannelId).catch(() => null);
                    if (!moderationChannel) {
                        return await safeReply(interaction, 'Ошибка: Модераторский канал жалоб не найден. Возможно, он был удален.', true);
                    }

                    const now = new Date();
                    const submissionTimestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`;

                    const reportEmbed = new EmbedBuilder()
                        .setColor('#FFD700') 
                        .setTitle('Новая жалоба')
                        .addFields(
                            { name: 'От:', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true }, 
                            { name: 'Тип жалобы:', value: reportType.charAt(0).toUpperCase() + reportType.slice(1), inline: true },
                            { name: 'Текст жалобы:', value: description },
                            { name: 'Статус:', value: 'В ожидании', inline: true },
                            { name: 'История действий:', value: `${submissionTimestamp} | Подана пользователем`, inline: false } 
                        )
                        .setTimestamp();
                    
                    let targetUserForEmbed = 'Н/Д';
                    let fetchedTargetUser = null;

                    if (targetInput) {
                        const targetIdFromInput = extractUserId(targetInput);
                        
                        if (targetIdFromInput) {
                            fetchedTargetUser = await interaction.client.users.fetch(targetIdFromInput).catch(() => null);
                            if (fetchedTargetUser) {
                                targetUserForEmbed = `<@${fetchedTargetUser.id}> (${fetchedTargetUser.tag})`;
                            } else {
                                targetUserForEmbed = `Неизвестный пользователь: \`${targetInput}\` (ID не найден)`;
                            }
                        } else {
                            const members = await interaction.guild.members.fetch({ query: targetInput, limit: 1 }).catch(() => null);
                            if (members && members.size > 0) {
                                fetchedTargetUser = members.first().user;
                                targetUserForEmbed = `<@${fetchedTargetUser.id}> (${fetchedTargetUser.tag})`;
                            } else {
                                targetUserForEmbed = `Не удалось найти: \`${targetInput}\``;
                            }
                        }
                    }
                    reportEmbed.addFields({ name: 'На:', value: targetUserForEmbed, inline: true });

                    if (link) {
                        reportEmbed.addFields({ name: 'Доказательства:', value: `[Нажмите для просмотра](${link})` });
                    }
                    
                    const moderationButtonsRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('modAction_accept_PLACEHOLDER_ID')
                                .setLabel('Принять')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('modAction_decline_PLACEHOLDER_ID')
                                .setLabel('Отклонить')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('modAction_inProgress_PLACEHOLDER_ID')
                                .setLabel('В процессе')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('modAction_reply_PLACEHOLDER_ID')
                                .setLabel('Ответить')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('modAction_resolved_PLACEHOLDER_ID')
                                .setLabel('Закрыть')
                                .setStyle(ButtonStyle.Success)
                        );

                    const utilityButtonsRow = new ActionRowBuilder();
                    if (fetchedTargetUser) {
                        utilityButtonsRow.addComponents(
                            new ButtonBuilder()
                                .setURL(`https://discord.com/users/${fetchedTargetUser.id}`) 
                                .setLabel('Профиль нарушителя')
                                .setStyle(ButtonStyle.Link)
                        );
                    }
                    utilityButtonsRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId('modAction_addNote_PLACEHOLDER_ID')
                            .setLabel('Добавить заметку')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    
                    const sentReportMessage = await moderationChannel.send({
                        embeds: [reportEmbed],
                        components: [moderationButtonsRow, utilityButtonsRow] 
                    });

                    const finalModerationButtonsRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`modAction_accept_${sentReportMessage.id}`)
                                .setLabel('Принять')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`modAction_decline_${sentReportMessage.id}`)
                                .setLabel('Отклонить')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId(`modAction_inProgress_${sentReportMessage.id}`)
                                .setLabel('В процессе')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(`modAction_reply_${sentReportMessage.id}`)
                                .setLabel('Ответить')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(`modAction_resolved_${sentReportMessage.id}`)
                                .setLabel('Закрыть')
                                .setStyle(ButtonStyle.Success)
                        );

                    const finalUtilityButtonsRow = new ActionRowBuilder();
                    if (fetchedTargetUser) {
                        finalUtilityButtonsRow.addComponents(
                            new ButtonBuilder()
                                .setURL(`https://discord.com/users/${fetchedTargetUser.id}`) 
                                .setLabel('Профиль нарушителя')
                                .setStyle(ButtonStyle.Link)
                        );
                    }
                    finalUtilityButtonsRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`modAction_addNote_${sentReportMessage.id}`)
                            .setLabel('Добавить заметку')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    
                    await sentReportMessage.edit({ components: [finalModerationButtonsRow, finalUtilityButtonsRow] }); 

                    await safeReply(interaction, `Ваша жалоба успешно отправлена модераторам! ID вашей жалобы: \`${sentReportMessage.id}\`.`, true);
                } catch (error) {
                    console.error('Ошибка при отправке жалобы через модальное окно:', error);
                    await safeReply(interaction, 'Произошла ошибка при отправке вашей жалобы.', true);
                }
                return;
            }

            else if (action === 'sendReplyToUserModal') {
                try {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral }); 
                    const originalReportMessageId = args[0]; 
                    const moderatorReplyText = interaction.fields.getTextInputValue('moderatorReplyText');

                    const guildSettings = await Sdb.getSettings(interaction.guild.id);
                    const moderationChannelId = guildSettings?.reportsModerationChannelId;

                    const moderationChannel = await interaction.client.channels.fetch(moderationChannelId).catch(() => null);
                    if (!moderationChannel) {
                        return await safeReply(interaction, 'Модераторский канал жалоб не найден.', true);
                    }

                    const reportMessage = await moderationChannel.messages.fetch(originalReportMessageId).catch(() => null);
                    if (!reportMessage) {
                        return await safeReply(interaction, 'Исходное сообщение с жалобой не найдено.', true);
                    }

                    if (!reportMessage.embeds || reportMessage.embeds.length === 0) {
                        return await safeReply(interaction, 'Сообщение с жалобой не содержит информации (эмбеда) для обработки ответа.', true);
                    }

                    const currentEmbed = EmbedBuilder.from(reportMessage.embeds[0]);
                    let fields = currentEmbed.data && Array.isArray(currentEmbed.data.fields) ? currentEmbed.data.fields : [];
                    const reporterIdMatch = fields.find(f => f.name === 'От:')?.value.match(/<@(\d+)>/);


                    if (reporterIdMatch && reporterIdMatch[1]) {
                        const reporterUser = await interaction.client.users.fetch(reporterIdMatch[1]).catch(() => null);
                        if (reporterUser) {
                            const dmEmbed = new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle(`Ответ модератора по вашей жалобе на сервере ${interaction.guild.name}`)
                                .setDescription(moderatorReplyText)
                                .addFields(
                                    { name: 'Ваша жалоба:', value: fields.find(f => f.name === 'Текст жалобы:')?.value.substring(0, 1024) || 'Н/Д' }
                                )
                                .setFooter({ text: `Ответ от модератора: ${interaction.user.tag}` })
                                .setTimestamp();

                            await reporterUser.send({ embeds: [dmEmbed] })
                                .catch(dmError => console.error(`[ОШИБКА] Ошибка отправки DM пользователю ${reporterUser.tag}:`, dmError));

                            const statusFieldIndexReply = fields.findIndex(f => f.name === 'Статус:');
                            if (statusFieldIndexReply !== -1) {
                                currentEmbed.spliceFields(statusFieldIndexReply, 1, { name: 'Статус:', value: 'Отвечено', inline: true });
                            } else {
                                currentEmbed.addFields({ name: 'Статус:', value: 'Отвечено', inline: true });
                            }
                            currentEmbed.setColor('Blue').setFooter({ text: `Отвечено модератором: ${interaction.user.tag}` });
                            
                            const now = new Date();
                            const timestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`;
                            let historyFieldIndex = fields.findIndex(f => f.name === 'История действий:');
                            const actionDescription = `**${timestamp}** | Отвечено пользователю (${interaction.user.tag})`;
                            
                            if (historyFieldIndex === -1) {
                                currentEmbed.addFields({ name: 'История действий:', value: actionDescription, inline: false });
                            } else {
                                const existingHistory = fields[historyFieldIndex].value.split('\n');
                                const newHistory = [actionDescription, ...existingHistory].slice(0, 5);
                                currentEmbed.spliceFields(historyFieldIndex, 1, { name: 'История действий:', value: newHistory.join('\n'), inline: false });
                            }

                            const newModerationButtonsRow = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`modAction_accept_${originalReportMessageId}`)
                                        .setLabel('Принять')
                                        .setStyle(ButtonStyle.Success)
                                        .setDisabled(true), 
                                    new ButtonBuilder()
                                        .setCustomId(`modAction_decline_${originalReportMessageId}`)
                                        .setLabel('Отклонить')
                                        .setStyle(ButtonStyle.Danger)
                                        .setDisabled(true), 
                                    new ButtonBuilder()
                                        .setCustomId(`modAction_inProgress_${originalReportMessageId}`)
                                        .setLabel('В процессе')
                                        .setStyle(ButtonStyle.Secondary)
                                        .setDisabled(true), 
                                    new ButtonBuilder()
                                        .setCustomId(`modAction_reply_${originalReportMessageId}`)
                                        .setLabel('Ответить')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(true), 
                                    new ButtonBuilder()
                                        .setCustomId(`modAction_resolved_${originalReportMessageId}`)
                                        .setLabel('Закрыть')
                                        .setStyle(ButtonStyle.Success)
                                        .setDisabled(true) 
                                );
                            
                            const utilityButtonsRow = new ActionRowBuilder();
                            const targetField = fields.find(f => f.name === 'На:');
                            const targetId = targetField ? extractUserId(targetField.value) : null;
                            if (targetId) {
                                utilityButtonsRow.addComponents(
                                    new ButtonBuilder()
                                        .setURL(`https://discord.com/users/${targetId}`) 
                                        .setLabel('Профиль нарушителя')
                                        .setStyle(ButtonStyle.Link)
                                );
                            }
                            utilityButtonsRow.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`modAction_addNote_${originalReportMessageId}`)
                                    .setLabel('Добавить заметку')
                                    .setStyle(ButtonStyle.Secondary)
                            );

                            await reportMessage.edit({ embeds: [currentEmbed], components: [newModerationButtonsRow, utilityButtonsRow] }); 
                            await safeReply(interaction, 'Ответ пользователю успешно отправлен!', true);
                        } else {
                            await safeReply(interaction, 'Не удалось найти пользователя, подавшего жалобу, чтобы отправить ответ. Возможно, он покинул сервер или отключил личные сообщения.', true);
                        }
                    } else {
                        await safeReply(interaction, 'Не удалось извлечь ID пользователя, подавшего жалобу из эмбеда.', true);
                    }
                } catch (error) {
                    console.error('Ошибка при отправке ответа модератора:', error);
                    await safeReply(interaction, 'Произошла ошибка при отправке ответа модератора.', true);
                }
                return;
            }

            else if (action === 'declineReportModal') {
                try {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral }); 
                    const originalReportMessageId = args[0]; 
                    const declineReason = interaction.fields.getTextInputValue('declineReason');

                    const guildSettings = await Sdb.getSettings(interaction.guild.id);
                    const moderationChannelId = guildSettings?.reportsModerationChannelId;

                    const moderationChannel = await interaction.client.channels.fetch(moderationChannelId).catch(() => null);
                    if (!moderationChannel) {
                        return await safeReply(interaction, 'Модераторский канал жалоб не найден.', true);
                    }

                    const reportMessage = await moderationChannel.messages.fetch(originalReportMessageId).catch(() => null);
                    if (!reportMessage) {
                        return await safeReply(interaction, 'Исходное сообщение с жалобой не найдено.', true);
                    }

                    if (!reportMessage.embeds || reportMessage.embeds.length === 0) {
                        return await safeReply(interaction, 'Сообщение с жалобой не содержит информации (эмбеда) для обработки отклонения.', true);
                    }

                    const currentEmbed = EmbedBuilder.from(reportMessage.embeds[0]);
                    let fields = currentEmbed.data && Array.isArray(currentEmbed.data.fields) ? currentEmbed.data.fields : [];
                    const reporterIdMatch = fields.find(f => f.name === 'От:')?.value.match(/<@(\d+)>/);

                    let statusFieldIndex = fields.findIndex(f => f.name === 'Статус:');
                    if (statusFieldIndex !== -1) {
                        currentEmbed.spliceFields(statusFieldIndex, 1, { name: 'Статус:', value: `Отклонена`, inline: true });
                    } else {
                        currentEmbed.addFields({ name: 'Статус:', value: 'Отклонена', inline: true });
                    }
                    currentEmbed.addFields({ name: 'Причина отклонения:', value: declineReason.substring(0, 1024) });
                    currentEmbed.setColor('Red').setFooter({ text: `Отклонено модератором: ${interaction.user.tag}` });

                    const now = new Date();
                    const timestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`;
                    let historyFieldIndex = fields.findIndex(f => f.name === 'История действий:');
                    const actionDescription = `**${timestamp}** | Отклонена (${interaction.user.tag}) - Причина: ${declineReason.substring(0, Math.min(declineReason.length, 100))}...`; 

                    if (historyFieldIndex === -1) {
                        currentEmbed.addFields({ name: 'История действий:', value: actionDescription, inline: false });
                    } else {
                        const existingHistory = fields[historyFieldIndex].value.split('\n');
                        const newHistory = [actionDescription, ...existingHistory].slice(0, 5);
                        currentEmbed.spliceFields(historyFieldIndex, 1, { name: 'История действий:', value: newHistory.join('\n'), inline: false });
                    }

                    const newModerationButtonsRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`modAction_accept_${originalReportMessageId}`)
                                .setLabel('Принять')
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`modAction_decline_${originalReportMessageId}`)
                                .setLabel('Отклонить')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`modAction_inProgress_${originalReportMessageId}`)
                                .setLabel('В процессе')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`modAction_reply_${originalReportMessageId}`)
                                .setLabel('Ответить')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId(`modAction_resolved_${originalReportMessageId}`)
                                .setLabel('Закрыть')
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(true)
                        );
                    
                    const utilityButtonsRow = new ActionRowBuilder();
                    const targetField = fields.find(f => f.name === 'На:');
                    const targetId = targetField ? extractUserId(targetField.value) : null;
                    if (targetId) {
                        utilityButtonsRow.addComponents(
                            new ButtonBuilder()
                                .setURL(`https://discord.com/users/${targetId}`) 
                                .setLabel('Профиль нарушителя')
                                .setStyle(ButtonStyle.Link)
                        );
                    }
                    utilityButtonsRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`modAction_addNote_${originalReportMessageId}`)
                            .setLabel('Добавить заметку')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    await reportMessage.edit({ embeds: [currentEmbed], components: [newModerationButtonsRow, utilityButtonsRow] });

                    if (reporterIdMatch && reporterIdMatch[1]) {
                        const reporterUser = await interaction.client.users.fetch(reporterIdMatch[1]).catch(() => null);
                        if (reporterUser) {
                            const dmEmbed = new EmbedBuilder()
                                .setColor('Red')
                                .setTitle(`Ваша жалоба отклонена на сервере ${interaction.guild.name}`)
                                .setDescription(`К сожалению, ваша жалоба была отклонена модераторами.\n\n**Причина:**\n${declineReason}`)
                                .addFields(
                                    { name: 'Тип жалобы:', value: fields.find(f => f.name === 'Тип жалобы:')?.value || 'Неизвестен', inline: true },
                                    { name: 'Ваша жалоба:', value: fields.find(f => f.name === 'Текст жалобы:')?.value.substring(0, 1024) || 'Н/Д' }
                                )
                                .setFooter({ text: 'Если у вас есть вопросы, свяжитесь с поддержкой сервера.' })
                                .setTimestamp();

                            await reporterUser.send({ embeds: [dmEmbed] })
                                .catch(dmError => console.error(`[ОШИБКА] Ошибка отправки DM пользователю ${reporterUser.tag}:`, dmError));
                        }
                    }
                    await safeReply(interaction, 'Жалоба успешно отклонена, и причина отправлена пользователю!', true);

                } catch (error) {
                    console.error('Ошибка при отклонении жалобы:', error);
                    await safeReply(interaction, 'Произошла ошибка при отклонении жалобы.', true);
                }
                return;
            }

            else if (action === 'addNoteModal') { 
                try {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    const originalReportMessageId = args[0];
                    const moderatorNote = interaction.fields.getTextInputValue('moderatorNote');

                    const guildSettings = await Sdb.getSettings(interaction.guild.id);
                    const moderationChannelId = guildSettings?.reportsModerationChannelId;

                    const moderationChannel = await interaction.client.channels.fetch(moderationChannelId).catch(() => null);
                    if (!moderationChannel) {
                        return await safeReply(interaction, 'Модераторский канал жалоб не найден.', true);
                    }

                    const reportMessage = await moderationChannel.messages.fetch(originalReportMessageId).catch(() => null);
                    if (!reportMessage) {
                        return await safeReply(interaction, 'Исходное сообщение с жалобой не найдено.', true);
                    }

                    if (!reportMessage.embeds || reportMessage.embeds.length === 0) {
                        return await safeReply(interaction, 'Сообщение с жалобой не содержит информации (эмбеда) для добавления заметки.', true);
                    }

                    const currentEmbed = EmbedBuilder.from(reportMessage.embeds[0]);
                    let fields = currentEmbed.data && Array.isArray(currentEmbed.data.fields) ? currentEmbed.data.fields : [];
                    
                    const now = new Date();
                    const timestamp = `<t:${Math.floor(now.getTime() / 1000)}:f>`;
                    
                    let notesFieldIndex = fields.findIndex(f => f.name === 'Заметки модераторов:');
                    const noteEntry = `**${timestamp}** | ${interaction.user.tag}: ${moderatorNote.substring(0, 500)}`; 

                    if (notesFieldIndex === -1) {
                        currentEmbed.addFields({ name: 'Заметки модераторов:', value: noteEntry, inline: false });
                    } else {
                        const existingNotes = fields[notesFieldIndex].value.split('\n');
                        const newNotes = [noteEntry, ...existingNotes].slice(0, 5); 
                        currentEmbed.spliceFields(notesFieldIndex, 1, { name: 'Заметки модераторов:', value: newNotes.join('\n'), inline: false });
                    }
                    
                    await reportMessage.edit({ embeds: [currentEmbed], components: reportMessage.components }); 
                    await safeReply(interaction, 'Заметка успешно добавлена к жалобе!', true);

                } catch (error) {
                    console.error('Ошибка при добавлении заметки:', error);
                    await safeReply(interaction, 'Произошла ошибка при добавлении заметки.', true);
                }
                return;
            }
        }
    },
};