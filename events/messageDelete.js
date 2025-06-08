const { Events, EmbedBuilder, AuditLogEvent, WebhookClient } = require('discord.js');
const SettingsDB = require('../functions/db/settings');

const Sdb = new SettingsDB('./database/settings.db');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.author && message.author.bot) return;

        const guildSettings = Sdb.getSettings(message.guild.id);

        if (!guildSettings.enableWebhookLogging || !guildSettings.webhookLogId || !guildSettings.webhookLogToken) {
            return;
        }

        // Клонируем исходный частичный объект, чтобы в случае неудачного fetch
        // мы могли использовать доступные из него свойства (ID, channel ID)
        let originalMessage = message;

        // Пытаемся получить полное сообщение, если оно частичное
        if (originalMessage.partial) {
            try {
                message = await originalMessage.fetch(); // Попытка получить полный объект
            } catch (error) {
                console.warn(`[messageDelete] Не удалось получить полное частичное сообщение (${originalMessage.id}). Логирование будет с ограниченной информацией: ${error.message}`);
                // Если fetch не удался, message останется частичным.
                // Мы будем использовать originalMessage для тех свойств, которые в нем гарантированно есть.
                message = originalMessage; // Убеждаемся, что работаем с объектом, который у нас есть.
            }
        }

        // Определяем данные для эмбеда, учитывая, что message может быть частичным/неполным
        const authorName = message.author?.username || 'Неизвестный пользователь';
        const authorId = message.author?.id || (originalMessage.author?.id || 'Неизвестно'); // Пытаемся взять из originalMessage если fetch не дал
        const authorAvatar = message.author?.displayAvatarURL({ dynamic: true }) || message.client.user.displayAvatarURL();
        const channelName = message.channel?.name || originalMessage.channel?.name || 'Неизвестно';
        const channelId = message.channel?.id || originalMessage.channel?.id || 'Неизвестно';
        const messageId = message.id || originalMessage.id;

        // Содержимое сообщения или заглушка
        const messageContent = (message.content || '').length > 0 ?
            message.content :
            (message.attachments && message.attachments.size > 0 ? `[Вложения: ${message.attachments.size}]` : '[Без текстового контента]');
        // Если message.content все еще пуст после fetch, значит, содержимое недоступно
        const displayContent = messageContent === '[Без текстового контента]' && message.partial ?
                             '[Содержимое недоступно (сообщение было старым/частичным)]' :
                             messageContent.substring(0, 1000) + (messageContent.length > 1000 ? '...' : '');


        try {
            let moderator = 'Автор';
            let deleteReason = 'Не указана';

            // Аудиторский лог может быть полезен, даже если сообщение частичное
            if (message.guild) {
                try {
                    const fetchedLogs = await message.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.MessageDelete,
                    });
                    const deleteLog = fetchedLogs.entries.find(
                        auditEntry =>
                            // Проверяем, что цель - это автор сообщения (или его ID, если автора нет в кэше)
                            (auditEntry.target.id === authorId) &&
                            auditEntry.extra?.channel?.id === channelId &&
                            Date.now() - auditEntry.createdTimestamp < 5000 && // Проверяем, что лог свежий
                            auditEntry.extra?.count === 1 // Проверяем, что удалено одно сообщение
                    );

                    if (deleteLog) {
                        moderator = `${deleteLog.executor.username} (${deleteLog.executor.id})`;
                        deleteReason = deleteLog.reason || 'Не указана';
                    }
                } catch (auditError) {
                    console.error(`Ошибка при получении аудиторского лога для удаления сообщения: ${auditError.message}`);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Сообщение удалено')
                .setAuthor({
                    name: `${authorName} (${authorId})`,
                    iconURL: authorAvatar
                })
                .addFields(
                    { name: 'Канал', value: `${channelName} (<#${channelId}>)`, inline: true },
                    { name: 'Автор', value: `${authorName} (${authorId})`, inline: true },
                    { name: 'ID сообщения', value: messageId, inline: false },
                    { name: 'Содержимое', value: displayContent }
                )
                .setTimestamp()
                .setFooter({ text: `Удалено: ${moderator} | Причина: ${deleteReason}` });

            // Вложения могут быть доступны только если fetch() был успешен и message стал полным
            if (message.attachments && message.attachments.size > 0) {
                const attachmentLinks = message.attachments.map(att => `[${att.name}](${att.url})`).join('\n');
                embed.addFields({ name: `Вложения (${message.attachments.size})`, value: attachmentLinks.substring(0, 1024) + (attachmentLinks.length > 1024 ? '...' : ''), inline: false });

                const firstImageAttachment = message.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
                if (firstImageAttachment) {
                    embed.setImage(firstImageAttachment.url);
                }
            } else if (originalMessage.partial) {
                 // Если сообщение было частичным и вложений не удалось получить, указываем это
                 embed.addFields({ name: `Вложения`, value: `[Информация о вложениях недоступна (сообщение было старым/частичным)]`, inline: false });
            }


            try {
                const webhookClient = new WebhookClient({ id: guildSettings.webhookLogId, token: guildSettings.webhookLogToken });
                await webhookClient.send({
                    embeds: [embed],
                    username: `${message.client.user.username} Logs`,
                    avatarURL: message.client.user.displayAvatarURL(),
                });
            } catch (webhookError) {
                console.error(`[messageDelete] Ошибка при отправке через вебхук (ID: ${guildSettings.webhookLogId}): ${webhookError.message}`);
            }

        } catch (error) {
            console.error(`Ошибка при логировании удаления сообщения: ${error.message}`);
        }
    },
};