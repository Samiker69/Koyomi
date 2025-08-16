const net = require('net');
const { EventEmitter } = require('events');
const path = require('path');
const os = require('os');
const { GoogleGenAI } = require('@google/genai');
const getTextModelOutputLimitsMap = require('../functions/geminiutils');

class BotIPCClient extends EventEmitter {
    constructor() {
        super();
        this.socket = null;
        this.connected = false;
        this.reconnectInterval = 5000;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.socketPath = this.getSocketPath();
    }

    getSocketPath() {
        if (process.platform === 'win32') {
            // На Windows используем named pipe
            return '\\\\.\\pipe\\discord-bot-ipc';
        } else {
            // На Linux/Mac используем Unix socket
            return path.join(os.tmpdir(), 'discord-bot.sock');
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection(this.socketPath);
            
            this.socket.on('connect', () => {
                console.log('[IPC] Connected to Discord bot');
                this.connected = true;
                this.emit('connected');
                resolve();
            });

            this.socket.on('data', (data) => {
                const lines = data.toString().split('\n').filter(line => line.trim());
                
                lines.forEach(line => {
                    try {
                        const response = JSON.parse(line);
                        this.handleResponse(response);
                    } catch (error) {
                        console.error('[IPC] Error parsing response:', error);
                    }
                });
            });

            this.socket.on('error', (error) => {
                console.error('[IPC] Connection error:', error);
                this.connected = false;
                this.emit('error', error);
                
                if (this.socket) {
                    this.socket.destroy();
                }
                
                // Переподключение через 5 секунд
                setTimeout(() => {
                    this.connect().catch(() => {});
                }, this.reconnectInterval);
                
                reject(error);
            });

            this.socket.on('close', () => {
                console.log('[IPC] Connection closed');
                this.connected = false;
                this.emit('disconnected');
                
                // Отклоняем все pending запросы
                this.pendingRequests.forEach(({ reject }) => {
                    reject(new Error('Connection closed'));
                });
                this.pendingRequests.clear();
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
            
            this.socket.write(JSON.stringify(request));
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

    disconnect() {
        if (this.socket) {
            this.socket.destroy();
        }
    }
}

module.exports = BotIPCClient;