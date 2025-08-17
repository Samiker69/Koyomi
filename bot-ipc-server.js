const net = require('net');
const fs = require('fs');
const path = require('path');
const os = require('os');

class BotIPCServer {
    constructor(client) {
        this.client = client;
        this.server = null;
        this.socketPath = this.getSocketPath();
    }

    getSocketPath() {
        if (process.platform === 'win32') {
            // На Windows используем именованные каналы (named pipes)
            return '\\\\.\\pipe\\discord-bot-ipc';
        } else {
            // На Linux/Mac используем Unix-сокеты
            return path.join(os.tmpdir(), 'discord-bot.sock');
        }
    }

    start() {
        // Удаляем старый сокет-файл, если он существует (только для Unix-систем)
        if (process.platform !== 'win32' && fs.existsSync(this.socketPath)) {
            try {
                fs.unlinkSync(this.socketPath);
            } catch (error) {
                console.error('[IPC] Error removing old socket file:', error);
            }
        }
        
        this.server = net.createServer((socket) => {
            console.log('[IPC] Admin panel connected');
            
            socket.on('data', async (data) => {
                let request;
                try {
                    request = JSON.parse(data.toString());
                    const response = await this.handleRequest(request);
                    // Важно: добавляем requestId в ответ для правильной обработки
                    response.requestId = request.requestId;
                    socket.write(JSON.stringify(response) + '\n');
                } catch (error) {
                    console.error('[IPC] Error handling request:', error);
                    const errorResponse = { 
                        error: 'Internal server error',
                        requestId: request?.requestId // Возвращаем requestId даже при ошибке
                    };
                    socket.write(JSON.stringify(errorResponse) + '\n');
                }
            });
            
            socket.on('error', (error) => {
                console.error('[IPC] Socket error:', error);
            });

            socket.on('close', () => {
                console.log('[IPC] Admin panel disconnected');
            });
        });

        this.server.listen(this.socketPath, () => {
            console.log(`[IPC] Bot IPC server listening on ${this.socketPath}`);
        });

        this.server.on('error', (error) => {
            console.error('[IPC] Server error:', error);
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

            const channels = guild.channels.cache.map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position
            }));

            const roles = guild.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
                color: role.hexColor,
                permissions: role.permissions.toArray(),
                position: role.position
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

            await guild.members.fetch({ limit });
            
            const members = guild.members.cache
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

            return { success: true, members };
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
                
                case 'unban':
                    return await this.unbanMember(guild, params);
                
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

        return { success: true, messages: messagesArray.reverse() };
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
                    return { success: true, messages: Array.from(this.client.lastMessages.values()).flat().reverse() };
                }
        
            default:
                return { 
                    success: true, 
                    channels: Array.from(this.client.lastChannels.values()).flat(),
                    messages: Array.from(this.client.lastMessages.values()).flat().reverse()
                };
        }
    }

    stop() {
        if (this.server) {
            this.server.close();
            // Удаляем socket-файл только на Unix-системах, т.к. на Windows его нет
            if (process.platform !== 'win32') {
                try {
                    fs.unlinkSync(this.socketPath);
                } catch (error) {
                    // Игнорируем ошибки, т.к. файл мог быть уже удален
                }
            }
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