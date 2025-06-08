const { Events, EmbedBuilder, WebhookClient } = require('discord.js');
const SettingsDB = require('../functions/db/settings');

const Sdb = new SettingsDB('./database/settings.db');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (newMessage.author && newMessage.author.bot) return;

        const guildSettings = Sdb.getSettings(newMessage.guild.id);

        if (!guildSettings.enableWebhookLogging || !guildSettings.webhookLogId || !guildSettings.webhookLogToken) {
            return;
        }

        // newMessages всегда должен быть полным объектом при получении события messageUpdate
        // oldMessage будет частичным, если его не было в кэше (т.е. сообщение отправлено до перезапуска бота)
        let oldContent = oldMessage.content || '';
        let oldAttachmentCount = oldMessage.attachments?.size || 0;
        let oldUrl = oldMessage.url || '';

        // Если oldMessage является частичным, мы не можем получить его предыдущее содержимое
        // Discord API не хранит "историю" содержимого сообщений для fetch()
        if (oldMessage.partial) {
            console.warn(`[messageUpdate] Старое сообщение (${oldMessage.id}) было частичным. Предыдущее содержимое недоступно.`);
            oldContent = '[Содержимое до изменения неизвестно (сообщение было частичным)]';
            oldAttachmentCount = '[Неизвестно]';
            oldUrl = '[Неизвестно]';
            // Мы все равно можем попробовать fetch, чтобы получить доступ к другим свойствам (автор, канал),
            // если они тоже были частичными, но для контента это бесполезно.
            try {
                await oldMessage.fetch(); // Попытка получить метаданные
            } catch (error) {
                console.warn(`[messageUpdate] Не удалось получить метаданные старого частичного сообщения (${oldMessage.id}): ${error.message}`);
            }
        }
        // newMessage всегда должен быть полным, но на всякий случай можно fetch, если вдруг partial
        if (newMessage.partial) {
             try {
                newMessage = await newMessage.fetch();
            } catch (error) {
                console.warn(`[messageUpdate] Не удалось получить полное новое сообщение (${newMessage.id}): ${error.message}`);
                return; // Если новое сообщение не можем получить, нет смысла продолжать
            }
        }

        const newContent = newMessage.content || '';
        const newAttachmentCount = newMessage.attachments?.size || 0;
        const newUrl = newMessage.url || '';

        const contentChanged = oldContent !== newContent;
        const attachmentsChanged = oldAttachmentCount !== newAttachmentCount;
        const urlChanged = oldUrl !== newUrl;

        // Если ни одно из этих ключевых свойств не изменилось, игнорируем.
        // Учитывая, что oldContent может быть теперь заглушкой,
        // эта проверка все равно будет работать для реально измененного контента.
        if (!contentChanged && !attachmentsChanged && !urlChanged) {
            return;
        }

        const authorName = newMessage.author?.username || 'Неизвестный пользователь';
        const authorId = newMessage.author?.id || 'Неизвестно';
        const authorAvatar = newMessage.author?.displayAvatarURL({ dynamic: true }) || newMessage.client.user.displayAvatarURL();
        const channelName = newMessage.channel?.name || 'Неизвестно';
        const channelId = newMessage.channel?.id || 'Неизвестно';


        const displayOldContent = oldContent.substring(0, 500) + (oldContent.length > 500 ? '...' : '');
        const displayNewContent = newContent.substring(0, 500) + (newContent.length > 500 ? '...' : '');

        try {
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Сообщение изменено')
                 .setAuthor({
                    name: `${authorName} (${authorId})`,
                    iconURL: authorAvatar
                 })
                .addFields(
                    { name: 'Канал', value: `${channelName} (<#${channelId}>)`, inline: true },
                    { name: 'Автор', value: `${authorName} (${authorId})`, inline: true },
                    { name: 'ID сообщения', value: newMessage.id, inline: false }
                )
                 .setURL(newMessage.url)
                .setTimestamp();

            if (contentChanged) {
                embed.addFields(
                    { name: 'Было (контент)', value: displayOldContent }, // Здесь oldContent может быть заглушкой
                    { name: 'Стало (контент)', value: displayNewContent }
                );
            }

            if (attachmentsChanged) {
                embed.addFields({ name: 'Вложения', value: `Было: ${oldAttachmentCount}, Стало: ${newAttachmentCount}`, inline: true });
                if (newAttachmentCount > oldAttachmentCount && newMessage.attachments && newMessage.attachments.size > 0) {
                    const firstNewImageAttachment = newMessage.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
                    if (firstNewImageAttachment) {
                        embed.setImage(firstNewImageAttachment.url);
                    }
                }
            }

            if (urlChanged) {
                embed.addFields(
                    { name: 'Ссылка (Было)', value: oldUrl ? `[Перейти](${oldUrl})` : 'Нет', inline: true },
                    { name: 'Ссылка (Стало)', value: newUrl ? `[Перейти](${newUrl})` : 'Нет', inline: true }
                );
            }

            try {
                const webhookClient = new WebhookClient({ id: guildSettings.webhookLogId, token: guildSettings.webhookLogToken });
                await webhookClient.send({
                    embeds: [embed],
                    username: `${newMessage.client.user.username} Logs`,
                    avatarURL: newMessage.client.user.displayAvatarURL(),
                });
            } catch (webhookError) {
                console.error(`[messageUpdate] Ошибка при отправке через вебхук (ID: ${guildSettings.webhookLogId}): ${webhookError.message}`);
            }

        } catch (error) {
            console.error(`Ошибка при логировании изменения сообщения: ${error.message}`);
        }
    },
};