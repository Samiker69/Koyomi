const { PermissionFlagsBits } = require('discord.js');
const CacheService = require('./CacheService');
const DatabaseService = require('./DatabaseService');
const ModerationService = require('./ModerationService');

const DEFAULT_CONFIG = {
    action: 'mute',
    threshold: 18.0,
    muteDuration: 10 * 60 * 1000,
    decayRate: 1.0,               // Снижено затухание для более долгого удержания очков
    baseMsgWeight: 2.0,           // Слегка увеличен базовый вес
    channelHopWeight: 3.5,
    similarityThreshold: 0.8,
    similarityWeight: 4.5,
    mentionWeight: 1.0,
    maxMentionWeight: 5.0,
    linkWeight: 2.0,
    historyLifetime: 15000
};

class AntiSpamService {
    static getLevenshteinDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    static getSimilarity(s1, s2) {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        const longerLength = longer.length;
        if (longerLength === 0) return 1.0;
        return (longerLength - this.getLevenshteinDistance(longer, shorter)) / parseFloat(longerLength);
    }

    static async handleViolation(msg, score, config, lang, recentMessages) {
        const member = msg.member;
        const guildId = msg.guild.id;
        const userId = msg.author.id;
        const channelsMap = new Map();

        for (const recent of recentMessages) {
            if (!channelsMap.has(recent.channelId)) {
                channelsMap.set(recent.channelId, []);
            }
            channelsMap.get(recent.channelId).push(recent.id);
        }

        if (!channelsMap.has(msg.channel.id)) {
            channelsMap.set(msg.channel.id, [msg.id]);
        } else if (!channelsMap.get(msg.channel.id).includes(msg.id)) {
            channelsMap.get(msg.channel.id).push(msg.id);
        }

        for (const [chanId, msgIds] of channelsMap.entries()) {
            try {
                const channel = msg.guild.channels.cache.get(chanId) || await msg.guild.channels.fetch(chanId).catch(() => null);
                if (channel && channel.isTextBased()) {
                    if (msgIds.length > 1) {
                        // Пытаемся удалить скопом без лишних запросов fetch
                        await channel.bulkDelete(msgIds, true).catch(async () => {
                            // Если bulkDelete не сработал, удаляем поштучно, минимизируя fetch
                            for (const id of msgIds) {
                                const m = channel.messages.cache.get(id) || await channel.messages.fetch(id).catch(() => null);
                                if (m) await m.delete().catch(() => {});
                            }
                        });
                    } else {
                        const m = channel.messages.cache.get(msgIds[0]) || await channel.messages.fetch(msgIds[0]).catch(() => null);
                        if (m) await m.delete().catch(() => {});
                    }
                }
            } catch (err) {
                console.error(`[AntiSpam] Не удалось очистить сообщения спамера в канале ${chanId}:`, err.message);
            }
        }

        const action = config.action || 'mute';
        const reason = `[System Anti-Spam] Penalty score exceeded limit (${score.toFixed(1)}/${config.threshold})`;
        const mockInteraction = {
            guild: msg.guild,
            client: msg.client,
            user: msg.client.user,
            guildLocale: lang
        };

        CacheService.delete(`spam:user:${guildId}:${userId}`);

        try {
            if (action === 'warn') {
                const caseData = await DatabaseService.addModCase({
                    serverId: guildId,
                    targetId: userId,
                    moderatorId: msg.client.user.id,
                    action: 'warn',
                    reason: reason,
                    timestamp: new Date()
                });
                await ModerationService.sendVerdict(mockInteraction, 'warn', msg.author, caseData, reason);
            }
            else if (action === 'mute') {
                const duration = config.muteDuration || DEFAULT_CONFIG.muteDuration;
                await member.timeout(duration, reason);
                const caseData = await DatabaseService.addModCase({
                    serverId: guildId,
                    targetId: userId,
                    moderatorId: msg.client.user.id,
                    action: 'mute',
                    reason: reason,
                    timestamp: new Date()
                });
                await ModerationService.sendVerdict(
                    mockInteraction,
                    'mute',
                    msg.author,
                    caseData,
                    reason,
                    `${duration / 60000}m`
                );
            }
            else if (action === 'kick') {
                await member.kick(reason);
                const caseData = await DatabaseService.addModCase({
                    serverId: guildId,
                    targetId: userId,
                    moderatorId: msg.client.user.id,
                    action: 'kick',
                    reason: reason,
                    timestamp: new Date()
                });
                await ModerationService.sendVerdict(mockInteraction, 'kick', msg.author, caseData, reason);
            }
            else if (action === 'ban') {
                await member.ban({ reason });
                const caseData = await DatabaseService.addModCase({
                    serverId: guildId,
                    targetId: userId,
                    moderatorId: msg.client.user.id,
                    action: 'ban',
                    reason: reason,
                    timestamp: new Date()
                });
                await ModerationService.sendVerdict(mockInteraction, 'ban', msg.author, caseData, reason);
            }
        } catch (err) {
            console.error(`[AntiSpam] Не удалось применить модерационное наказание (${action}):`, err);
        }
    }

    static async processMessage(msg) {
        if (msg.author.bot || !msg.guild) return;

        const guildId = msg.guild.id;
        const settings = await DatabaseService.getSettings(guildId) || {};
        if (!settings.antiSpamEnabled) {
            return;
        }

        const member = msg.member || await msg.guild.members.fetch(msg.author.id).catch(() => null);
        if (!member) return;

        if (member.permissions.has(PermissionFlagsBits.Administrator) || member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return;
        }

        let dbConfig = settings.antiSpamConfig || {};
        if (typeof dbConfig === 'string') {
            try { dbConfig = JSON.parse(dbConfig); } catch(e) { dbConfig = {}; }
        }

        const config = {
            action: dbConfig.action || DEFAULT_CONFIG.action,
            threshold: dbConfig.threshold !== undefined ? dbConfig.threshold : DEFAULT_CONFIG.threshold,
            muteDuration: dbConfig.muteDuration !== undefined ? dbConfig.muteDuration : DEFAULT_CONFIG.muteDuration,
            decayRate: dbConfig.decayRate !== undefined ? dbConfig.decayRate : DEFAULT_CONFIG.decayRate,
            baseMsgWeight: dbConfig.baseMsgWeight !== undefined ? dbConfig.baseMsgWeight : DEFAULT_CONFIG.baseMsgWeight,
            channelHopWeight: dbConfig.channelHopWeight !== undefined ? dbConfig.channelHopWeight : DEFAULT_CONFIG.channelHopWeight,
            similarityThreshold: dbConfig.similarityThreshold !== undefined ? dbConfig.similarityThreshold : DEFAULT_CONFIG.similarityThreshold,
            similarityWeight: dbConfig.similarityWeight !== undefined ? dbConfig.similarityWeight : DEFAULT_CONFIG.similarityWeight,
            mentionWeight: dbConfig.mentionWeight !== undefined ? dbConfig.mentionWeight : DEFAULT_CONFIG.mentionWeight,
            maxMentionWeight: dbConfig.maxMentionWeight !== undefined ? dbConfig.maxMentionWeight : DEFAULT_CONFIG.maxMentionWeight,
            linkWeight: dbConfig.linkWeight !== undefined ? dbConfig.linkWeight : DEFAULT_CONFIG.linkWeight,
            historyLifetime: DEFAULT_CONFIG.historyLifetime
        };

        const userId = msg.author.id;
        const channelId = msg.channel.id;
        const now = Date.now();
        const lang = settings.language || 'ru';
        const cacheKey = `spam:user:${guildId}:${userId}`;

        let userData = CacheService.get(cacheKey) || {
            score: 0,
            lastMessageTimestamp: now,
            lastChannelId: channelId,
            recentMessages: []
        };

        const elapsedMs = now - userData.lastMessageTimestamp;
        const elapsedSeconds = elapsedMs / 1000;
        
        // 1. Вычитаем затухание очков
        const decay = elapsedSeconds * config.decayRate;
        userData.score = Math.max(0, userData.score - decay);

        // 2. Фильтруем историю сообщений строго по времени (historyLifetime)
        userData.recentMessages = userData.recentMessages.filter(
            m => now - m.timestamp < config.historyLifetime
        );

        // 3. Вычисляем базовый штраф
        let penalty = config.baseMsgWeight;

        // НОВОЕ: Штраф за высокую скорость (Burst Penalty)
        // Если сообщения отправляются быстрее чем раз в 2 секунды, начисляем прогрессивный штраф
        if (elapsedMs < 2000) {
            const speedFactor = (2000 - elapsedMs) / 2000; // От 0.0 до 1.0 (чем быстрее, тем ближе к 1)
            penalty += speedFactor * 4.5; // Дополнительно до +4.5 очков за моментальный флуд
        }

        if (channelId !== userData.lastChannelId && elapsedMs < 5000) {
            penalty += config.channelHopWeight;
        }

        const uniqueMentions = msg.mentions.users.size + msg.mentions.roles.size;
        if (uniqueMentions > 0) {
            penalty += Math.min(uniqueMentions * config.mentionWeight, config.maxMentionWeight);
        }

        if (msg.content && /(https?:\/\/[^\s]+)/gi.test(msg.content)) {
            penalty += config.linkWeight;
        }

        const currentAttachments = Array.from(msg.attachments.values()).map(a => ({
            url: a.url,
            name: a.name,
            size: a.size
        }));

        let highestSimilarity = 0;
        let isImageDuplicate = false;

        for (const recent of userData.recentMessages) {
            if (msg.content && msg.content.length > 0 && recent.content) {
                const sim = this.getSimilarity(msg.content, recent.content);
                if (sim > highestSimilarity) {
                    highestSimilarity = sim;
                }
            }

            if (currentAttachments.length > 0 && recent.attachments && recent.attachments.length > 0) {
                for (const currentAtt of currentAttachments) {
                    for (const recentAtt of recent.attachments) {
                        const currentCleanUrl = currentAtt.url ? currentAtt.url.split('?')[0] : '';
                        const recentCleanUrl = recentAtt.url ? recentAtt.url.split('?')[0] : '';
                        const urlMatch = currentCleanUrl && recentCleanUrl && (currentCleanUrl === recentCleanUrl);
                        const metaMatch = currentAtt.name === recentAtt.name && currentAtt.size === recentAtt.size;
                        if (urlMatch || metaMatch) {
                            isImageDuplicate = true;
                            break;
                        }
                    }
                    if (isImageDuplicate) break;
                }
            }
        }

        if (isImageDuplicate || highestSimilarity >= config.similarityThreshold) {
            penalty += config.similarityWeight;
        } else if (highestSimilarity > 0.5) {
            penalty += config.similarityWeight / 2;
        }

        // Обновляем данные пользователя
        userData.score += penalty;
        userData.lastMessageTimestamp = now;
        userData.lastChannelId = channelId;

        userData.recentMessages.push({
            id: msg.id,
            channelId: channelId,
            content: msg.content || '',
            attachments: currentAttachments,
            timestamp: now
        });

        // Безопасный ограничитель размера кэша для защиты оперативной памяти от ботов-кликеров
        if (userData.recentMessages.length > 100) {
            userData.recentMessages.shift();
        }

        CacheService.set(cacheKey, userData);

        if (userData.score >= config.threshold) {
            await this.handleViolation(msg, userData.score, config, lang, userData.recentMessages);
        }
    }
}

module.exports = AntiSpamService;