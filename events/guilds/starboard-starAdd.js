const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const starDB = require('../../functions/db/starboard');
const db = new starDB();

const STAR_EMOJI_NAME = '⭐';
const EMBED_COLOR = 'Gold';

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        const { message } = reaction;
        const guild = message.guild;

        if (reaction.partial) {
            try {
                await reaction.fetch();
                await message.fetch();
            } catch (error) {
                console.error('Ошибка при загрузке частичной реакции или сообщения:', error);
                return;
            }
        }

        if (!guild) return;

        if (reaction.emoji.name !== STAR_EMOJI_NAME) return;

        if (message.author.bot) return;

        const settings = db.getSettings(guild.id);

        if (!settings || !settings.enabled || !settings.starboardChannelId || !settings.minReactions) return;

        if (settings.starboardChannelId === message.channel.id) return;

        const currentReactionCount = reaction.count;

        if (currentReactionCount < settings.minReactions) return;

        let boardChannel;
        try {
            boardChannel = await guild.channels.fetch(settings.starboardChannelId);
            if (!boardChannel) {
                console.error(`Канал старборда с ID ${settings.starboardChannelId} не найден в гильдии ${guild.name}.`);
                return;
            }
            if (boardChannel.type !== ChannelType.GuildText) {
                console.error(`Канал старборда ${settings.starboardChannelId} не является текстовым каналом в гильгии ${guild.name}.`);
                return;
            }
        } catch (error) {
            console.error(`Ошибка при получении канала старборда ${settings.starboardChannelId}:`, error);
            return;
        }

        if (db.isMessageOnStarboard(guild.id, message.id)) {
            const starMessageId = db.getStarboardMessageId(guild.id, message.id);
            if (!starMessageId) {
                console.error(`Запись о сообщении ${message.id} на старборде есть, но ID сообщения старборда отсутствует.`);
                return;
            }

            try {
                const starMessage = await boardChannel.messages.fetch(starMessageId);
                if (!starMessage) {
                    console.warn(`Сообщение старборда ${starMessageId} не найдено. Удаляю запись из БД.`);
                    db.deleteStarboardEntry(guild.id, message.id);
                    return;
                }

                const updatedContent = `${STAR_EMOJI_NAME} **${currentReactionCount}** | <#${message.channel.id}>`;
                
                const existingEmbed = starMessage.embeds[0];
                const updatedEmbed = new EmbedBuilder(existingEmbed.toJSON())
                    .setFooter({ text: `${STAR_EMOJI_NAME} | ${message.id}` })
                    .setTimestamp(message.createdAt);
                await starMessage.edit({
                    content: updatedContent,
                    embeds: [updatedEmbed]
                });
            } catch (error) {
                console.error(`Ошибка при обновлении сообщения старборда ${starMessageId} для сообщения ${message.id}:`, error);
            }
        } else {
            let image = null;
            if (message.attachments.size > 0) {
                const attachment = message.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
                if (attachment) {
                    image = attachment.url;
                }
            } else if (message.embeds.length > 0) {
                const embedImage = message.embeds.find(e => e.image && e.image.url);
                if (embedImage) {
                    image = embedImage.image.url;
                }
            }

            const board = new EmbedBuilder()
                .setAuthor({
                    name: `${message.author.globalName || message.author.username} (${message.author.id})`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
                })
                .setColor(EMBED_COLOR)
                .setTitle("Source")
                .setDescription(message.content)
                .setImage(image)
                .setURL(message.url)
                .setFooter({ text: `${STAR_EMOJI_NAME} | ${message.id}` })
                .setTimestamp(message.createdAt);

            try {
                const response = await boardChannel.send({
                    content: `${STAR_EMOJI_NAME} **${currentReactionCount}** | <#${message.channel.id}>`,
                    embeds: [board]
                });
                db.addStarboardEntry(guild.id, message.id, response.id);
            } catch (error) {
                console.error(`Ошибка при отправке сообщения на старборд в канал ${settings.starboardChannelId}:`, error);
            }
        }
    },
};