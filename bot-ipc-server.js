const WebSocket = require('ws');
const { ChannelType } = require('discord.js');
const ModerationService = require('./services/ModerationService'); // Укажите правильный путь к вашим сервисам

class BotIPCServer {
    constructor(client, port = 8765) {
        this.client = client;
        this.port = port;
        this.connections = new Set();
    }

    start() {
        this.server = new WebSocket.Server({ port: this.port, perMessageDeflate: false });

        this.server.on('connection', (ws) => {
            console.log('[WebSocket] Admin panel connected');
            this.connections.add(ws);
            
            ws.on('message', async (data) => {
                let request;
                try {
                    request = JSON.parse(data.toString());
                    const response = await this.handleRequest(request);
                    response.requestId = request.requestId;
                    ws.send(JSON.stringify(response));
                } catch (error) {
                    console.error('[WebSocket] Error:', error);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ error: 'Internal server error', requestId: request?.requestId }));
                    }
                }
            });

            ws.on('close', () => this.connections.delete(ws));
        });

        this.server.on('listening', () => console.log(`[WebSocket] Server listening on port ${this.port}`));
    }

    async handleRequest({ action, data }) {
        try {
            switch (action) {
                case 'getGuilds': return this.getGuilds();
                case 'getGuildInfo': return await this.getGuildInfo(data.guildId);
                case 'getGuildMembers': return await this.getGuildMembers(data.guildId);
                case 'getGuildRoles': return this.getGuildRoles(data.guildId);
                case 'getMember': return this.getMember(data.guildId, data.userId);
                case 'channelAction': return await this.channelAction(data.guildId, data.channelId, data.data);
                case 'getBotStats': return this.getBotStats();
                case 'executeAction': return await this.executeAction(data.guildId, data.actionType, data.params);
                case 'getChannels': return await this.getGuildChannels(data.guildId);
                case 'getMessages': return await this.getChannelMessages(data.guildId, data.channelId);
                case 'getCache': return this.getCache(data.type, data.channelId, data.guildId);
                default: return { error: 'Unknown action' };
            }
        } catch (error) {
            return { error: error.message || 'Action failed' };
        }
    }

    getGuilds() {
        return { success: true, guilds: this.client.guilds.cache.map(g => ({
            id: g.id, name: g.name, iconURL: g.iconURL({ size: 128 }),
            memberCount: g.memberCount, ownerId: g.ownerId, features: g.features, joined: g.joinedAt.toISOString()
        }))};
    }

    async getGuildInfo(guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return { error: 'Guild not found' };

        const channels = [...guild.channels.cache.values()]
            .sort((a, b) => a.position - b.position)
            .map(c => ({ id: c.id, name: c.name, type: c.type, position: c.position, parentId: c.parentId }));

        const roles = guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor, permissions: r.permissions.toArray(), position: r.position }));
        const webhooks = (await guild.fetchWebhooks()).map(w => ({ id: w.id, name: w.name, url: w.url, avatarURL: w.avatarURL() }));

        return { success: true, guild: { id: guild.id, name: guild.name, iconURL: guild.iconURL({ size: 128 }), memberCount: guild.memberCount, ownerId: guild.ownerId, channels, roles, webhooks, features: guild.features }};
    }

    async getGuildMembers(guildId, limit = 100) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return { error: 'Guild not found' };
        
        const members = (await guild.members.fetch({ limit })).map(m => ({
            id: m.id, username: m.user.username, displayName: m.displayName, avatarURL: m.user.displayAvatarURL(),
            roles: m.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
            joinedAt: m.joinedAt?.toISOString(), permissions: m.permissions.toArray()
        }));
        return { success: true, members };
    }

    getGuildRoles(guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        return guild ? { success: true, roles: guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })) } : { error: 'Guild not found' };
    }

    getMember(guildId, userId) {
        const member = this.client.guilds.cache.get(guildId)?.members.cache.get(userId);
        if (!member) return { success: false, error: 'Member not found' };
        return { success: true, member: { id: member.id, displayName: member.displayName, avatarURL: member.displayAvatarURL(), roles: member.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })), joinedAt: member.joinedAt }};
    }

    async channelAction(guildId, channelId, { action, name, avatar }) {
        const channel = await this.client.guilds.cache.get(guildId)?.channels.fetch(channelId);
        if (!channel) return { success: false, error: 'Channel not found' };

        if (action === 'createWebhook') {
            const wh = await channel.createWebhook({ name, avatar });
            return { success: true, data: { url: wh.url, name: wh.name, avatar: wh.avatarURL() } };
        }
        if (action === 'rename') return { success: true, data: { name: (await channel.edit({ name })).name } };
        if (action === 'delete') return { success: true, ...(await channel.delete()) };
        return { success: false, error: 'Unknown action' };
    }

    getBotStats() {
        return { success: true, stats: { guilds: this.client.guilds.cache.size, users: this.client.users.cache.size, channels: this.client.channels.cache.size, uptime: process.uptime(), memoryUsage: process.memoryUsage(), ping: this.client.ws.ping, readyAt: this.client.readyAt?.toISOString() }};
    }

    // Вспомогательный метод для создания фейкового interaction
    async _createMockInteraction(guild, moderatorId) {
        const modId = moderatorId || this.client.user.id;
        const modMember = await guild.members.fetch(modId).catch(() => guild.members.me);
        return {
            client: this.client, guild, user: modMember.user, member: modMember,
            guildLocale: guild.preferredLocale || 'ru',
            memberPermissions: modMember.permissions
        };
    }

    async executeAction(guildId, actionType, params) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return { error: 'Guild not found' };

        // Имитируем interaction для ModerationService
        const interaction = await this._createMockInteraction(guild, params.moderatorId);
        const targetUser = params.userId ? await this.client.users.fetch(params.userId).catch(() => ({ id: params.userId })) : null;

        switch (actionType) {
            case 'kick': return await ModerationService.kickUser(interaction, targetUser, params.reason);
            case 'ban': return await ModerationService.banUser(interaction, targetUser, params.reason);
            case 'mute': return await ModerationService.muteUser(interaction, targetUser, params.duration, params.reason);
            case 'unban': return await ModerationService.unbanUser(interaction, params.userId, params.reason);
            case 'warn': return await ModerationService.warnUser(interaction, targetUser, params.reason);
            case 'unwarn': return await ModerationService.unwarnUser(interaction, targetUser, params.caseNum, params.reason);
            
            case 'roleAction':
                const member = await guild.members.fetch(params.userId);
                params.type === 'add' ? await member.roles.add(params.roleId) : await member.roles.remove(params.roleId);
                return { success: true, message: `Role ${params.type}ed` };
            
            case 'createRole':
                const role = await guild.roles.create({ name: params.name, color: params.color, permissions: params.permissions });
                return { success: true, role: { id: role.id, name: role.name } };
            
            case 'deleteRole':
                await guild.roles.cache.get(params.roleId)?.delete('Deleted via admin panel');
                return { success: true };
            
            case 'sendMessage':
                const msg = await guild.channels.cache.get(params.channelId)?.send({ content: params.content, embeds: params.embed ? [params.embed] : [] });
                return { success: true, messageId: msg?.id };
            
            default: return { error: 'Unknown action type' };
        }
    }

    async getGuildChannels(guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return { success: false, error: 'Guild not found' };

        const channels = [...guild.channels.cache.values()].map(c => ({ 
            id: c.id, 
            name: c.name, 
            type: c.type, 
            lastMessage: c.lastMessage ? {
                id: c.lastMessage.id,
                content: c.lastMessage.content ? c.lastMessage.content.slice(0, 100) : '',
                createdTimestamp: c.lastMessage.createdTimestamp
            } : null
        }));
        this.client.lastChannels.set(guildId, channels);
        return { success: true, channels };
    }

    async getChannelMessages(guildId, channelId) {
        const channel = await this.client.guilds.cache.get(guildId)?.channels.fetch(channelId);
        if (!channel) return { success: false, error: 'Channel not found' };

        const messages = [...(await channel.messages.fetch()).values()].map(msg => ({
            id: msg.id,
            content: this._processMessageContent(msg),
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
            timestamp: msg.createdTimestamp,
            author: { displayName: msg.author.displayName, avatarURL: msg.author.avatarURL(), id: msg.author.id },
            attachments: msg.attachments.map(a => ({ id: a.id, filename: a.name, url: a.url, contentType: a.contentType })),
            stickers: msg.stickers.map(s => ({ id: s.id, name: s.name, url: s.url }))
        }));
        this.client.lastMessages.set(channelId, messages);
        return { success: true, messages };
    }

    getCache(type, channelId, guildId) {
        if (type === 'channels') return { success: true, channels: guildId ? (this.client.lastChannels.get(guildId) || []) : [...this.client.lastChannels.values()].flat() };
        if (type === 'messages') return { success: true, messages: channelId ? (this.client.lastMessages.get(channelId) || []) : [...this.client.lastMessages.values()].flat() };
        return { success: true, channels: [...this.client.lastChannels.values()].flat(), messages: [...this.client.lastMessages.values()].flat() };
    }

    _processMessageContent(msg) {
        let content = msg.content
            .replace(/<(a?):(\w+):(\d+)>/g, (m, a, name, id) => `<img src="https://cdn.discordapp.com/emojis/${id}.${a ? 'gif' : 'png'}" alt=":${name}:" class="emoji">`)
            .replace(/<@!?(\d+)>/g, (m, id) => msg.mentions.users.get(id) ? `@${msg.mentions.users.get(id).displayName}` : m)
            .replace(/<@&(\d+)>/g, (m, id) => msg.mentions.roles.get(id) ? `@${msg.mentions.roles.get(id).name}` : m)
            .replace(/<#(\d+)>/g, (m, id) => msg.mentions.channels.get(id) ? `#${msg.mentions.channels.get(id).name}` : m);
        return content;
    }

    stop() {
        this.connections.forEach(ws => ws.close());
        this.connections.clear();
        this.server?.close(() => console.log('[WebSocket] Server closed'));
    }
}

module.exports = BotIPCServer;