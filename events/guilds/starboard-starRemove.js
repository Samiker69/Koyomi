const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const starDB = require('../../utils/db/starboard');
const db = new starDB();

const STAR_EMOJI_NAME = '⭐';

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction) {
        const { message } = reaction;
        const guild = message.guild;

        if (reaction.partial) {
            try {
                await reaction.fetch();
                await message.fetch();
            } catch (error) {
                console.error('Ошибка при загрузке частичной реакции или сообщения при удалении:', error);
                return;
            }
        }

        if (!guild) return;

        if (reaction.emoji.name !== STAR_EMOJI_NAME) return;

        const settings = db.getSettings(guild.id);

        if (!settings || !settings.enabled || !settings.starboardChannelId || !settings.minReactions) return;

        const messageId = message.id;
        const currentReactionCount = reaction.count;

        if (!db.isMessageOnStarboard(guild.id, messageId)) return;

        const starMessageId = db.getStarboardMessageId(guild.id, messageId);

        if (!starMessageId) {
            console.warn(`Запись о сообщении ${messageId} на старборде найдена, но ID сообщения старборда отсутствует. Удаляю запись.`);
            db.deleteStarboardEntry(guild.id, messageId);
            return;
        }

        let starboardChannel;
        try {
            starboardChannel = await guild.channels.fetch(settings.starboardChannelId);
            if (!starboardChannel) {
                console.warn(`Канал старборда с ID ${settings.starboardChannelId} не найден в гильдии ${guild.name}. Удаляю связанные записи.`);
                db.deleteStarboardEntry(guild.id, messageId);
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
            db.deleteStarboardEntry(guild.id, messageId);
            return;
        }

        if (currentReactionCount < settings.minReactions) {
            try {
                await starMessage.delete();
                db.deleteStarboardEntry(guild.id, messageId);
            } catch (error) {
                console.error(`Ошибка при удалении сообщения старборда ${starMessageId} для сообщения ${messageId} в гильдии ${guild.name}:`, error);
            }
        } else {
            try {
                const updatedContent = `${STAR_EMOJI_NAME} **${currentReactionCount}** | <#${message.channel.id}>`;
                
                const existingEmbed = starMessage.embeds[0];
                const updatedEmbed = new EmbedBuilder(existingEmbed.toJSON())
                    .setFooter({ text: `${STAR_EMOJI_NAME} | ${messageId}` })
                    .setTimestamp(message.createdAt);

                await starMessage.edit({
                    content: updatedContent,
                    embeds: [updatedEmbed]
                });
            } catch (error) {
                console.error(`Ошибка при обновлении сообщения старборда ${starMessageId} для сообщения ${messageId} в гильдии ${guild.name}:`, error);
            }
        }
    },
};