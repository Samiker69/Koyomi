const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(msg) {
		if (!msg.guild) return;
        const channel = msg.channel;

        const MessagesCache = msg.client.lastMessages.get(channel.id) || [];
        if (!MessagesCache.some(cached => cached.id === msg.id)) {
            MessagesCache.unshift({
                id: msg.id,
                content: msg.content,
                embeds: msg.embeds,
                attachments: msg.attachments.size > 0 ? Array.from(msg.attachments.values()).map(attachment => ({
                    id: attachment.id,
                    filename: attachment.name,
                    size: attachment.size,
                    url: attachment.url,
                    contentType: attachment.contentType,
                    height: attachment.height || null,
                    width: attachment.width || null
                })) : [],
                timestamp: msg.createdTimestamp,
                author: { 
                    displayName: msg.author.displayName, 
                    avatarURL: msg.author.avatarURL(), 
                    id: msg.author.id 
                }
            });
          }

        const channelsCache = msg.client.lastChannels.get(msg.guild.id) || [];
        if (!channelsCache.some(cached => cached.id === channel.id)) {
            channelsCache.unshift({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                lastMessage: channel.lastMessage
            })
        }


        // Ограничиваем размер кэша (например, последние 50 сообщений)
        if (MessagesCache.length > 50) {
            MessagesCache.pop();
        }

        msg.client.lastMessages.set(channel.id, MessagesCache);
        msg.client.lastChannels.set(msg.guild.id, channelsCache);
	},
};