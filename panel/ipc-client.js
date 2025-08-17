const WebSocket = require('ws');
const { EventEmitter } = require('events');
const { GoogleGenAI } = require('@google/genai');
const getTextModelOutputLimitsMap = require('../functions/geminiutils');

class BotIPCClient extends EventEmitter {
    constructor(host = 'localhost', port = 8765) {
        super();
        this.socket = null;
        this.connected = false;
        this.reconnectInterval = 5000;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.host = host;
        this.port = port;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(`ws://${this.host}:${this.port}`);
            
            this.socket.on('open', () => {
                console.log('[WebSocket] Connected to Discord bot');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
                resolve();
            });

            this.socket.on('message', (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    this.handleResponse(response);
                } catch (error) {
                    console.error('[WebSocket] Error parsing response:', error);
                }
            });

            this.socket.on('error', (error) => {
                console.error('[WebSocket] Connection error:', error);
                this.connected = false;
                this.emit('error', error);
                
                // Переподключение с экспоненциальной задержкой
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                    this.reconnectAttempts++;
                    
                    setTimeout(() => {
                        console.log(`[WebSocket] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                        this.connect().catch(() => {});
                    }, delay);
                } else {
                    console.error('[WebSocket] Max reconnection attempts reached');
                }
                
                reject(error);
            });

            this.socket.on('close', () => {
                console.log('[WebSocket] Connection closed');
                this.connected = false;
                this.emit('disconnected');
                
                // Отклоняем все pending запросы
                this.pendingRequests.forEach(({ reject }) => {
                    reject(new Error('Connection closed'));
                });
                this.pendingRequests.clear();
                
                // Попытка переподключения при обычном закрытии соединения
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.connect().catch(() => {});
                    }, this.reconnectInterval);
                }
            });
        });
    }

    handleResponse(response) {
        if (response.requestId && this.pendingRequests.has(response.requestId)) {
            const { resolve, reject } = this.pendingRequests.get(response.requestId);
            this.pendingRequests.delete(response.requestId);
            
            if (response.error) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        }
    }

    async request(action, data = {}) {
        if (!this.connected) {
            throw new Error('Not connected to bot');
        }

        return new Promise((resolve, reject) => {
            const requestId = ++this.requestId;
            const request = { requestId, action, data };
            
            this.pendingRequests.set(requestId, { resolve, reject });
            
            // Таймаут для запроса (30 секунд)
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
            
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(request));
            } else {
                this.pendingRequests.delete(requestId);
                reject(new Error('WebSocket not ready'));
            }
        });
    }

    // Удобные методы для различных действий
    async getGuilds() {
        const response = await this.request('getGuilds');
        return response.guilds;
    }

    async getGuildInfo(guildId) {
        const response = await this.request('getGuildInfo', { guildId });
        return response.guild;
    }

    async getGuildMembers(guildId, limit = 100) {
        const response = await this.request('getGuildMembers', { guildId, limit });
        return response.members;
    }

    async getBotStats() {
        const response = await this.request('getBotStats');
        return response.stats;
    }

    async kickMember(guildId, userId, reason) {
        return await this.request('executeAction', {
            guildId,
            actionType: 'kick',
            params: { userId, reason }
        });
    }

    async banMember(guildId, userId, reason, deleteMessageDays = 0) {
        return await this.request('executeAction', {
            guildId,
            actionType: 'ban',
            params: { userId, reason, deleteMessageDays }
        });
    }

    async unbanMember(guildId, userId, reason) {
        return await this.request('executeAction', {
            guildId,
            actionType: 'unban',
            params: { userId, reason }
        });
    }

    async createRole(guildId, name, color, permissions) {
        return await this.request('executeAction', {
            guildId,
            actionType: 'createRole',
            params: { name, color, permissions }
        });
    }

    async deleteRole(guildId, roleId) {
        return await this.request('executeAction', {
            guildId,
            actionType: 'deleteRole',
            params: { roleId }
        });
    }

    async sendMessage(guildId, channelId, content, embed = null) {
        return await this.request('executeAction', {
            guildId,
            actionType: 'sendMessage',
            params: { channelId, content, embed }
        });
    }

    async getGeminiModels(apikey) {
        const ai = new GoogleGenAI({apiKey: apikey})
        const modelsPager = await ai.models.list();
        const allFetchedModels = [];
    
        // Итерируем по всем страницам, чтобы собрать все модели в один массив
        for await (const model of modelsPager) {
          allFetchedModels.push(model);
        }
        return getTextModelOutputLimitsMap(allFetchedModels);
    }

    async getServerChannels(guildId) {
        return await this.request('getChannels', {
            guildId
        });
    }

    async getChannelMessages(guildId, channelId) {
        return await this.request('getMessages', {
            guildId,
            channelId
        })
    }

    async getCache(type = 'all', channelId = null, guildId = null) {
        return await this.request('getCache', {
            type,
            channelId,
            guildId
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

module.exports = BotIPCClient;