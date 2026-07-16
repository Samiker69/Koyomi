const { Events } = require('discord.js');
const CacheService = require('../../services/CacheService');

module.exports = {
    name: Events.MessageCreate,
    async execute(msg) {
        if (!msg.guild) return;
        const channel = msg.channel;

        CacheService.addMessage(channel.id, {
            id: msg.id,
            content: processMessageContent(msg),
            embeds: msg.embeds && msg.embeds.length > 0 ? msg.embeds.map(embed => ({
                author: embed.author ? { name: embed.author.name, iconURL: embed.author.iconURL || null } : null,
                thumbnail: embed.thumbnail ? { url: embed.thumbnail.url } : null,
                title: embed.title || null,
                url: embed.url || null,
                description: embed.description || null,
                fields: embed.fields ? embed.fields.map(f => ({ name: f.name, value: f.value, inline: f.inline })) : [],
                image: embed.image ? { url: embed.image.url } : null,
                footer: embed.footer ? { text: embed.footer.text, iconURL: embed.footer.iconURL || null } : null,
                timestamp: embed.timestamp || null,
                color: embed.color || null
            })) : [],
            attachments: msg.attachments.size > 0 ? Array.from(msg.attachments.values()).map(attachment => ({
                id: attachment.id,
                filename: attachment.name,
                size: attachment.size,
                url: attachment.url,
                contentType: attachment.contentType,
                height: attachment.height || null,
                width: attachment.width || null
            })) : [],
            stickers: msg.stickers.size > 0 ? Array.from(msg.stickers.values()).map(sticker => ({
                id: sticker.id,
                name: sticker.name,
                description: sticker.description,
                url: sticker.url,
                format: sticker.format
            })) : [],
            timestamp: msg.createdTimestamp,
            author: {
                displayName: msg.author.displayName,
                avatarURL: msg.author.avatarURL(),
                id: msg.author.id
            }
        });

        CacheService.addChannel(msg.guild.id, {
            id: channel.id,
            name: channel.name,
            type: channel.type,
            lastMessage: {
                id: msg.id,
                content: msg.content ? msg.content.slice(0, 100) : '',
                createdTimestamp: msg.createdTimestamp
            }
        });

        function processMessageContent(msg) {
            let processedContent = msg.content;
            processedContent = processedContent.replace(/<(a?):(\w+):(\d+)>/g, (match, animated, name, id) => {
                const extension = animated ? 'gif' : 'png';
                const url = `https://cdn.discordapp.com/emojis/${id}.${extension}`;
                return `<img src="${url}" alt=":${name}:" class="emoji" title=":${name}:">`;
            });
            processedContent = processedContent.replace(/<@!?(\d+)>/g, (match, userId) => {
                const user = msg.mentions.users.get(userId);
                return user ? `@${user.displayName}` : match;
            });
            processedContent = processedContent.replace(/<@&(\d+)>/g, (match, roleId) => {
                const role = msg.mentions.roles.get(roleId);
                return role ? `@${role.name}` : match;
            });
            processedContent = processedContent.replace(/<#(\d+)>/g, (match, channelId) => {
                const channel = msg.mentions.channels.get(channelId);
                return channel ? `#${channel.name}` : match;
            });
            return processedContent;
        }
    },
};