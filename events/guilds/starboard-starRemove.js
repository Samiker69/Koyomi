const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const DatabaseService = require('../../database/repositories');

const STAR_EMOJI_NAME = '⭐';

const activeOperations = new Set();

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction) {
        const { message } = reaction;
        const guild = message.guild;
        if (!guild) return;

        if (reaction.partial) {
            try {
                await reaction.fetch();
                await message.fetch();
            } catch (error) {
                console.error('Ошибка при загрузке частичной реакции или сообщения при удалении:', error);
                return;
            }
        }

        if (reaction.emoji.name !== STAR_EMOJI_NAME) return;

        const settings = await DatabaseService.getStarboardSettings(guild.id);
        if (!settings || !settings.enabled || !settings.starboardChannelId) return;

        const messageId = message.id;
        const currentReactionCount = reaction.count;

        if (!await DatabaseService.isMessageOnStarboard(guild.id, messageId)) return;

        const starMessageId = await DatabaseService.getStarboardMessageId(guild.id, messageId);
        if (!starMessageId) {
            console.warn(`Запись о сообщении ${messageId} на старборде найдена, но ID сообщения старборда отсутствует. Удаляю запись.`);
            await DatabaseService.deleteStarboardEntry(guild.id, messageId);
            return;
        }

        const opKey = `${guild.id}-${message.id}`;
        if (activeOperations.has(opKey)) return;
        activeOperations.add(opKey);

        try {
            let starboardChannel;
            try {
                starboardChannel = await guild.channels.fetch(settings.starboardChannelId);
                if (!starboardChannel) {
                    console.warn(`Канал старборда с ID ${settings.starboardChannelId} не найден в гильдии ${guild.name}. Удаляю связанные записи.`);
                    await DatabaseService.deleteStarboardEntry(guild.id, messageId);
                    return;
                }
                if (starboardChannel.type !== ChannelType.GuildText) {
                    console.warn(`Канал старборда ${settings.starboardChannelId} не является текстовым каналом в гильдии ${guild.name}.`);
                    return;
                }
            } catch (error) {
                console.error(`Ошибка при получении канала старборда ${settings.starboardChannelId} для гильдии ${guild.name}:`, error);
                return;
            }

            let starMessage;
            try {
                starMessage = await starboardChannel.messages.fetch(starMessageId);
            } catch (error) {
                console.warn(`Сообщение старборда ${starMessageId} не найдено в канале ${starboardChannel.name}. Удаляю запись из БД.`);
                await DatabaseService.deleteStarboardEntry(guild.id, messageId);
                return;
            }

            const minReactions = settings.minReactions || 5;

            if (currentReactionCount < minReactions) {
                try {
                    await starMessage.delete();
                    await DatabaseService.deleteStarboardEntry(guild.id, messageId);
                } catch (error) {
                    console.error(`Ошибка при удалении сообщения старборда ${starMessageId} для сообщения ${messageId} в гильдии ${guild.name}:`, error);
                }
            } else {
                try {
                    const starEmoji = STAR_EMOJI_NAME;
                    const updatedContent = `${starEmoji} **${currentReactionCount}** | <#${message.channel.id}>`;

                    await starMessage.edit({
                        content: updatedContent
                    });
                } catch (error) {
                    console.error(`Ошибка при обновлении сообщения старборда ${starMessageId} для сообщения ${messageId} в гильдии ${guild.name}:`, error);
                }
            }
        } finally {
            activeOperations.delete(opKey);
        }
    },
};