class CacheService {
    constructor() {
        this.store = new Map();
    }

    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        this.store.set(key, value);
        return true;
    }

    delete(key) {
        return this.store.delete(key);
    }

    has(key) {
        return this.store.has(key);
    }

    clear() {
        this.store.clear();
    }

    // Удаление группы ключей по префиксу (например, при сбросе настроек сервера)
    deleteByPrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }

    // --- Специализированные методы кэша сообщений (Discord Cache) ---
    getMessages(channelId) {
        return this.get(`discord:messages:${channelId}`) || [];
    }

    addMessage(channelId, messageData, maxLimit = 50) {
        const messages = this.getMessages(channelId);
        if (!messages.some(m => m.id === messageData.id)) {
            messages.unshift(messageData);
            if (messages.length > maxLimit) {
                messages.pop();
            }
            this.set(`discord:messages:${channelId}`, messages);
        }
    }

    pruneMessages(cutoff) {
        for (const key of this.store.keys()) {
            if (key.startsWith('discord:messages:')) {
                const messages = this.get(key) || [];
                const filtered = messages.filter(msg => msg.timestamp > cutoff);
                if (filtered.length === 0) {
                    this.store.delete(key);
                } else {
                    this.set(key, filtered);
                }
            }
        }
    }

    // --- Специализированные методы кэша каналов (Discord Cache) ---
    getChannels(guildId) {
        return this.get(`discord:channels:${guildId}`) || [];
    }

    addChannel(guildId, channelData) {
        const channels = this.getChannels(guildId);
        if (!channels.some(c => c.id === channelData.id)) {
            channels.unshift(channelData);
            this.set(`discord:channels:${guildId}`, channels);
        }
    }

    pruneChannels(cutoff) {
        for (const key of this.store.keys()) {
            if (key.startsWith('discord:channels:')) {
                const channels = this.get(key) || [];
                const filtered = channels.filter(channel => (channel.lastMessage?.createdTimestamp || 0) > cutoff);
                if (filtered.length === 0) {
                    this.store.delete(key);
                } else {
                    this.set(key, filtered);
                }
            }
        }
    }
}

module.exports = new CacheService();