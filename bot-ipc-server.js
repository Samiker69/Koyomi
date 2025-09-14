const WebSocket = require('ws');
const fs = require('fs');
const { ChannelType } = require('discord.js');

class BotIPCServer {
    constructor(client, port = 8765) {
        this.client = client;
        this.server = null;
        this.port = port;
        this.connections = new Set();
    }

    start() {
        this.server = new WebSocket.Server({ 
            port: this.port,
            perMessageDeflate: false // Отключаем сжатие для лучшей производительности с большими данными
        });

        this.server.on('connection', (ws) => {
            console.log('[WebSocket] Admin panel connected');
            this.connections.add(ws);
            
            ws.on('message', async (data) => {
                let request;
                try {
                    request = JSON.parse(data.toString());
                    const response = await this.handleRequest(request);
                    // Важно: добавляем requestId в ответ для правильной обработки
                    response.requestId = request.requestId;
                    ws.send(JSON.stringify(response));
                } catch (error) {
                    console.error('[WebSocket] Error handling request:', error);
                    const errorResponse = { 
                        error: 'Internal server error',
                        requestId: request?.requestId // Возвращаем requestId даже при ошибке
                    };
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(errorResponse));
                    }
                }
            });
            
            ws.on('error', (error) => {
                console.error('[WebSocket] Socket error:', error);
            });

            ws.on('close', () => {
                console.log('[WebSocket] Admin panel disconnected');
                this.connections.delete(ws);
            });
        });

        this.server.on('listening', () => {
            console.log(`[WebSocket] Bot WebSocket server listening on port ${this.port}`);
        });

        this.server.on('error', (error) => {
            console.error('[WebSocket] Server error:', error);
        });
    }

    async handleRequest(request) {
        const { action, data } = request;

        switch (action) {
            case 'getGuilds':
                return await this.getGuilds();
            
            case 'getGuildInfo':
                return await this.getGuildInfo(data.guildId);
            
            case 'getGuildMembers':
                return await this.getGuildMembers(data.guildId);

            case 'getGuildRoles':
                return await this.getGuildRoles(data.guildId);

            case 'getMember':
                return await this.getMember(data.guildId, data.userId);

            case 'channelAction':
                return await this.channelAction(data.guildId, data.channelId, data.data);
            
            case 'getBotStats':
                return await this.getBotStats();
            
            case 'executeAction':
                return await this.executeAction(data.guildId, data.actionType, data.params);

            case 'getChannels':
                return await this.getGuildChannels(data.guildId);

            case 'getMessages': 
                return await this.getChannelMessages(data.guildId, data.channelId)

            case 'getCache': {
                return await this.getCache(data.type, data.channelId, data.guildId)
            }
            
            default:
                return { error: 'Unknown action' };
        }
    }

    async getGuilds() {
        try {
            const guilds = this.client.guilds.cache.map(guild => ({
                id: guild.id,
                name: guild.name,
                iconURL: guild.iconURL({ extension: 'png', size: 128 }) || null,
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                features: guild.features,
                joined: guild.joinedAt.toISOString()
            }));
            
            return { success: true, guilds };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getGuildInfo(guildId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return { error: 'Guild not found' };
            }

            const channelsCollection = guild.channels.cache;
            const allChannelsArray = Array.from(channelsCollection.values());
            
            const uncategorizedChannels = allChannelsArray
                .filter(c => c.type !== ChannelType.GuildCategory && !c.parentId);
            
            const categories = allChannelsArray
                .filter(c => c.type === ChannelType.GuildCategory);
            
            const categorizedTextAndVoiceChannels = allChannelsArray
                .filter(c => c.type !== ChannelType.GuildCategory && c.parentId);
            
            const sortedUncategorized = uncategorizedChannels.sort((a, b) => a.position - b.position);
            const sortedCategories = categories.sort((a, b) => a.position - b.position);
            
            let finalSortedChannels = [];
            
            finalSortedChannels.push(...sortedUncategorized);
            
            for (const category of sortedCategories) {
                finalSortedChannels.push(category);
            
                const children = categorizedTextAndVoiceChannels
                    .filter(c => c.parentId === category.id)
                    .sort((a, b) => a.position - b.position);
                finalSortedChannels.push(...children);
            }
            
            const channels = finalSortedChannels.map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position,
                parentId: channel.parentId || null // Добавляем parentId
            }));

            const roles = guild.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                permissions: role.permissions.toArray(),
                position: role.position
            }));

            let webhooks = [];
            const fetchedWebhooks = await guild.fetchWebhooks();
            webhooks = fetchedWebhooks.map(webhook => ({
                id: webhook.id,
                name: webhook.name,
                url: webhook.url,
                avatarURL: webhook.avatarURL({ extension: 'png', size: 128 })
            }));

            return {
                success: true,
                guild: {
                    id: guild.id,
                    name: guild.name,
                    iconURL: guild.iconURL({ extension: 'png', size: 128 }) || null,
                    memberCount: guild.memberCount,
                    ownerId: guild.ownerId,
                    channels,
                    roles,
                    webhooks,
                    features: guild.features
                }
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getGuildMembers(guildId, limit = 100) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return { error: 'Guild not found' };
            }
            
            const members = (await guild.members.fetch({ limit }))
                .first(limit)
                .map(member => ({
                    id: member.id,
                    username: member.user.username,
                    displayName: member.displayName,
                    avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 64 }),
                    roles: member.roles.cache.map(role => ({
                        id: role.id,
                        name: role.name,
                        color: role.hexColor
                    })),
                    joinedAt: member.joinedAt?.toISOString(),
                    premiumSince: member.premiumSince?.toISOString(),
                    permissions: member.permissions.toArray()
                }));

            return { success: true, members: members };
        } catch (error) {
            console.error(error)
            return { error: error.message };
        }
    }

    async getGuildRoles(guildId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return { error: 'Guild not found' };
            }

            const roles = guild.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor
            }))
            return { success: true, roles: roles };
        } catch (error) {
            console.error(error)
            return { error: error.message };
        }
    }

    async getMember(guildId, userId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return { success: false, error: 'Guild not found' };
            }
            const member = guild.members.cache.get(userId);
            if (!member) {
                return { success: false, error: 'Member not found' };
            }
            return { 
                success: true,
                member: {
                    "id": member.user.id,
                    "displayName": member.displayName,
                    "avatarURL": member.avatarURL({ extension: 'png', size: 64 }),
                    roles: member.roles.cache.map(role => ({
                        id: role.id,
                        name: role.name,
                        color: role.hexColor
                    })),
                    "joinedAt": member.joinedAt
                }
            }
        } catch (error) {
            console.error(error)
            return { error: error.message };
        }
    }

    async channelAction(guildId, channelId, { action, name, avatar }) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) {
            return { success: false, error: 'Guild not found' };
        }
        const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId);
        if (!channel) {
            return { success: false, error: 'Channel not found' };
        }
        try {
            switch (action) {
                case 'createWebhook':
                    const wh = await channel.createWebhook({
                        name,
                        avatar,
                    });
                    return { success: true, data: { url: wh.url, name: wh.name, avatar: wh.avatarURL() } };
    
                case 'rename':
                    const editedChannel = await channel.edit({ name });
                    return { success: true, message: "Channel deleted", data: { name: editedChannel.name } };
    
                case 'delete':
                    await channel.delete();
                    return { success: true, message: "Channel deleted" };
            
                default:
                    return { success: false, error: 'Unknown channel action' };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    async getBotStats() {
        try {
            const stats = {
                guilds: this.client.guilds.cache.size,
                users: this.client.users.cache.size,
                channels: this.client.channels.cache.size,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                ping: this.client.ws.ping,
                readyAt: this.client.readyAt?.toISOString(),
                version: require('./package.json').version
            };

            return { success: true, stats };
        } catch (error) {
            return { error: error.message };
        }
    }

    async executeAction(guildId, actionType, params) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return { error: 'Guild not found' };
            }

            switch (actionType) {
                case 'kick':
                    return await this.kickMember(guild, params);
                
                case 'ban':
                    return await this.banMember(guild, params);
            
                case 'mute':
                    return await this.muteMember(guild, params);
                
                case 'unban':
                    return await this.unbanMember(guild, params);

                case 'roleAction':
                    return await this.roleAction(guild, params);
                
                case 'createRole':
                    return await this.createRole(guild, params);
                
                case 'deleteRole':
                    return await this.deleteRole(guild, params);
                
                case 'sendMessage':
                    return await this.sendMessage(guild, params);
                
                default:
                    return { error: 'Unknown action type' };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    async kickMember(guild, { userId, reason }) {
        const member = guild.members.cache.get(userId);
        if (!member) {
            return { error: 'Member not found' };
        }

        await member.kick(reason);
        return { success: true, message: `Member ${member.user.tag} kicked` };
    }

    async banMember(guild, { userId, reason, deleteMessageDays = 0 }) {
        const member = guild.members.cache.get(userId);
        if (!member) {
            return { error: 'Member not found' };
        }

        await member.ban({ reason, deleteMessageDays });
        return { success: true, message: `Member ${member.user.tag} banned` };
    }

    async unbanMember(guild, { userId, reason }) {
        try {
            await guild.members.unban(userId, reason);
            return { success: true, message: `User ${userId} unbanned` };
        } catch (error) {
            return { error: `Failed to unban: ${error.message}` };
        }
    }

    async muteMember(guild, { userId, reason, duration }) {
        try {
            const member = guild.members.cache.get(userId);
            if (!member) {
                return { error: 'Member not found' };
            }

            await member.timeout(duration, reason);
            return { success: true, message: `User ${member?.username} timeouted to ${duration}` };
        } catch (error) {
            return { error: `Failed to timeout: ${error.message}` };
        }
    }

    async roleAction(guild, { userId, roleId, type }) {
        try {
            const member = guild.members.cache.get(userId);
            if (!member) {
                return { error: 'Member not found' };
            }

            type === 'add' ? await member.roles.add(roleId) : await member.roles.remove(roleId);
            return { success: true, message: `${type === 'add' ? 'Added' : 'Removed'} role ${roleId} to ${member?.username}` };
        } catch (error) {
            return { error: `Failed to ${type} role: ${error.message}` };
        }
    }

    async createRole(guild, { name, color, permissions }) {
        const role = await guild.roles.create({
            name,
            color,
            permissions,
            reason: 'Created via admin panel'
        });

        return { success: true, role: { id: role.id, name: role.name } };
    }

    async deleteRole(guild, { roleId }) {
        const role = guild.roles.cache.get(roleId);
        if (!role) {
            return { error: 'Role not found' };
        }

        await role.delete('Deleted via admin panel');
        return { success: true, message: `Role ${role.name} deleted` };
    }

    async sendMessage(guild, { channelId, content, embed }) {
        const channel = guild.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) {
            return { error: 'Channel not found or not text-based' };
        }

        const messageOptions = { content };
        if (embed) {
            messageOptions.embeds = [embed];
        }

        const message = await channel.send(messageOptions);
        return { success: true, messageId: message.id };
    }

    async getGuildChannels(guildId) {
        const guild = this.client.guilds.cache.get(guildId)
        if (!guild) {
            return { success: false, error: 'Guild not found' };
        }
        const channelsCollection = await guild.channels.fetch();
        const channelsArray = Array.from(channelsCollection.values()).map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            lastMessage: channel.lastMessage
        }));
        this.client.lastChannels.set(guild.id, channelsArray);
        
        return { success: true, channels: channelsArray };
    }

    async getChannelMessages(guildId, channelId) {
        const guild = this.client.guilds.cache.get(guildId)
        if (!guild) {
            return { success: false, error: 'Guild not found' };
        }
        const channel = await guild.channels.fetch(channelId);
        const messages = await channel.messages.fetch();
        const messagesArray = Array.from(messages.values()).map(msg => ({
            id: msg.id,
            content: processMessageContent(msg), // cleanContent + обработка эмодзи
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
        }));
        this.client.lastMessages.set(channel.id, messagesArray);

        return { success: true, messages: messagesArray };
    }

    async getCache(type = 'all', channelId = null, guildId = null) {
        switch (type) {
            case 'channels':
                if (guildId) {
                    return { success: true, channels: this.client.lastChannels.get(guildId) || [] };
                } else {
                    return { success: true, channels: Array.from(this.client.lastChannels.values()).flat() };
                }
            
            case 'messages':
                if (channelId) {
                    return { success: true, messages: this.client.lastMessages.get(channelId) || [] };
                } else {
                    return { success: true, messages: Array.from(this.client.lastMessages.values()).flat() };
                }
        
            default:
                return { 
                    success: true, 
                    channels: Array.from(this.client.lastChannels.values()).flat(),
                    messages: Array.from(this.client.lastMessages.values()).flat()
                };
        }
    }

    stop() {
        if (this.server) {
            // Закрываем все активные соединения
            this.connections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            });
            this.connections.clear();
            
            // Закрываем сервер
            this.server.close(() => {
                console.log('[WebSocket] Server closed');
            });
        }
    }
}

function processMessageContent(msg) {
    let processedContent = msg.content;
    
    // 1. Сначала заменяем пользовательские эмодзи на HTML
    processedContent = processedContent.replace(/<(a?):(\w+):(\d+)>/g, (match, animated, name, id) => {
        const extension = animated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${id}.${extension}`;
        return `<img src="${url}" alt=":${name}:" class="emoji" title=":${name}:">`;
    });
    
    // 2. Заменяем упоминания пользователей
    processedContent = processedContent.replace(/<@!?(\d+)>/g, (match, userId) => {
        const user = msg.mentions.users.get(userId);
        return user ? `@${user.displayName}` : match;
    });
    
    // 3. Заменяем упоминания ролей
    processedContent = processedContent.replace(/<@&(\d+)>/g, (match, roleId) => {
        const role = msg.mentions.roles.get(roleId);
        return role ? `@${role.name}` : match;
    });
    
    // 4. Заменяем упоминания каналов
    processedContent = processedContent.replace(/<#(\d+)>/g, (match, channelId) => {
        const channel = msg.mentions.channels.get(channelId);
        return channel ? `#${channel.name}` : match;
    });
    
    return processedContent;
}

module.exports = BotIPCServer;