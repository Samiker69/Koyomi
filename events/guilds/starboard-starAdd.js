const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const DatabaseService = require('../../database/repositories');

const STAR_EMOJI_NAME = '⭐';
const EMBED_COLOR = 0xFFD700; // типо золотой

const activeOperations = new Set();

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        const { message } = reaction;
        const guild = message.guild;

        if (!guild) return;

        if (reaction.partial) {
            try {
                await reaction.fetch();
                await message.fetch();
            } catch (error) {
                console.error('Ошибка при загрузке частичной реакции или сообщения:', error);
                return;
            }
        }

        if (reaction.emoji.name !== STAR_EMOJI_NAME) return;
        if (message.author.bot) return;

        const guildCfg = await DatabaseService.getSettings(guild.id) || {};
        const lang = guildCfg.language || guild.preferredLocale || 'ru';

        const settings = await DatabaseService.getStarboardSettings(guild.id);
        if (!settings || !settings.enabled || !settings.starboardChannelId) return;

        if (settings.starboardChannelId === message.channel.id) return;

        const minReactions = settings.minReactions || 5;
        const currentReactionCount = reaction.count;

        if (currentReactionCount < minReactions) return;

        const opKey = `${guild.id}-${message.id}`;
        if (activeOperations.has(opKey)) return;
        activeOperations.add(opKey);

        try {
            let boardChannel;
            try {
                boardChannel = await guild.channels.fetch(settings.starboardChannelId);
                if (!boardChannel) {
                    console.error(`Канал старборда с ID ${settings.starboardChannelId} не найден в гильдии ${guild.name}.`);
                    return;
                }
                if (boardChannel.type !== ChannelType.GuildText) {
                    console.error(`Канал старборда ${settings.starboardChannelId} не является текстовым каналом в гильдии ${guild.name}.`);
                    return;
                }
            } catch (error) {
                console.error(`Ошибка при получении канала старборда ${settings.starboardChannelId}:`, error);
                return;
            }

            const starEmoji = STAR_EMOJI_NAME;

            if (await DatabaseService.isMessageOnStarboard(guild.id, message.id)) {
                const starMessageId = await DatabaseService.getStarboardMessageId(guild.id, message.id);
                if (!starMessageId) {
                    console.error(`Запись о сообщении ${message.id} на старборде есть, но ID сообщения старборда отсутствует.`);
                    return;
                }

                try {
                    const starMessage = await boardChannel.messages.fetch(starMessageId);
                    if (!starMessage) {
                        console.warn(`Сообщение старборда ${starMessageId} не найдено. Удаляю запись из БД.`);
                        await DatabaseService.deleteStarboardEntry(guild.id, message.id);
                        return;
                    }

                    const updatedContent = `${starEmoji} **${currentReactionCount}** | <#${message.channel.id}>`;

                    // GIGANTIC OPTIMIZATION: Only update the content string!
                    // This is instantly completed by Discord because it does not have to rebuild, re-validate, or re-render any embeds or attachments!
                    await starMessage.edit({
                        content: updatedContent
                    });
                } catch (error) {
                    console.error(`Ошибка при обновлении сообщения старборда ${starMessageId} для сообщения ${message.id}:`, error);
                }
            } else {
                let image = null;
                const files = [];
                if (message.attachments.size > 0) {
                    const attachment = message.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
                    if (attachment) {
                        // Optimizing image loading time and caching: pass attachment object directly so Discord attaches it natively!
                        files.push(attachment);
                        image = `attachment://${attachment.name}`;
                    }
                } else if (message.embeds.length > 0) {
                    const embedImage = message.embeds.find(e => e.image && e.image.url);
                    if (embedImage) {
                        image = embedImage.image.url;
                    }
                }

                const description = message.content || (lang === 'ru' ? '*Без текста (вложение)*' : '*No content (attachment)*');

                const board = new EmbedBuilder()
                    .setAuthor({
                        name: `${message.author.globalName || message.author.username} (${message.author.id})`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
                    })
                    .setColor(EMBED_COLOR)
                    .setDescription(description)
                    .setImage(image)
                    .setFooter({ text: `${STAR_EMOJI_NAME} | ${message.id}` })
                    .setTimestamp(message.createdAt);

                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel(lang === 'ru' ? 'Перейти к сообщению' : 'Jump to Message')
                        .setURL(message.url)
                        .setStyle(ButtonStyle.Link)
                );

                try {
                    const response = await boardChannel.send({
                        content: `${starEmoji} **${currentReactionCount}** | <#${message.channel.id}>`,
                        embeds: [board],
                        components: [row],
                        files: files
                    });
                    await DatabaseService.addStarboardEntry(guild.id, message.id, response.id);
                } catch (error) {
                    console.error(`Ошибка при отправке сообщения на старборд в канал ${settings.starboardChannelId}:`, error);
                }
            }
        } finally {
            activeOperations.delete(opKey);
        }
    },
};