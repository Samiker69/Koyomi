const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { ModCase, GeminiToken, UserPunishment } = require('../../utils/db/models');

module.exports = (botIPC) => {
    const router = express.Router();

    // Общая статистика
    router.get('/stats', requireAuth, async (req, res) => {
        try {
            const totalCases = await ModCase.count();
            const totalTokens = await GeminiToken.count();
            const totalPunishments = await UserPunishment.count();
            const totalServers = await ModCase.count({ distinct: true, col: 'serverId' });
            res.json({ totalServers, totalCases, totalTokens, totalPunishments });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/bot-stats', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        res.json(await botIPC.getBotStats());
    });

    router.get('/guilds', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.json([{ id: 'mock', name: 'Mock Server', iconURL: null, memberCount: 0 }]);
        res.json(await botIPC.getGuilds());
    });

    // --- API Конкретного сервера ---
    router.get('/server/:serverId/stats', requireAuth, async (req, res) => {
        const serverId = req.params.serverId;
        try {
            const totalCases = await ModCase.count({ where: { serverId } });
            const totalPunishments = await UserPunishment.count({ where: { guild_id: serverId } });
            const bansCount = await ModCase.count({ where: { serverId, action: 'ban' } });
            const warnsCount = await ModCase.count({ where: { serverId, action: 'warn' } });
            
            let serverName = `Server ${serverId}`;
            if (botIPC.connected) {
                try {
                    const guildInfo = await botIPC.getGuildInfo(serverId);
                    serverName = guildInfo.name || serverName;
                } catch (e) {}
            }
            res.json({ success: true, serverName, totalCases, totalPunishments, bansCount, warnsCount });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/server/:serverId/cases', requireAuth, async (req, res) => {
        try {
            const cases = await ModCase.findAll({
                where: { serverId: req.params.serverId },
                order: [['timestamp', 'DESC']],
                limit: parseInt(req.query.limit) || 50
            });
            res.json(cases);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/server/:serverId/export', requireAuth, async (req, res) => {
        const serverId = req.params.serverId;
        try {
            const cases = await ModCase.findAll({ where: { serverId } });
            const punishments = await UserPunishment.findAll({ where: { guild_id: serverId } });
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="server_${serverId}_data.json"`);
            res.send(JSON.stringify({ serverId, exportDate: new Date().toISOString(), cases, punishments }, null, 2));
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.delete('/server/:serverId/clear', requireAuth, async (req, res) => {
        try {
            const deletedCases = await ModCase.destroy({ where: { serverId: req.params.serverId } });
            const deletedPunishments = await UserPunishment.destroy({ where: { guild_id: req.params.serverId } });
            res.json({ success: true, deletedCases, deletedPunishments });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // --- Маршруты обращающиеся к BotIPC ---
    router.get('/server/:serverId/members', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.json([]);
        res.json(await botIPC.getGuildMembers(req.params.serverId, parseInt(req.query.limit) || 100));
    });

    router.get('/server/:serverId/info', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        res.json(await botIPC.getGuildInfo(req.params.serverId));
    });

    router.get('/server/:serverId/roles', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        res.json(await botIPC.getGuildRoles(req.params.serverId));
    });

    router.get('/server/:serverId/members/:userId', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        res.json(await botIPC.getMember(req.params.serverId, req.params.userId));
    });

    router.post('/server/:serverId/members/:userId', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        try {
            const { action, reason, duration, roleId, type } = req.body;
            const result = await botIPC.request('executeAction', {
                guildId: req.params.serverId,
                actionType: action === 'role' ? 'roleAction' : action,
                params: { userId: req.params.userId, reason, duration, roleId, type, moderatorId: req.user.id }
            });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/server/:serverId/channels/:channelId', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        try {
            const { action, name, avatar } = req.body;
            res.json(await botIPC.channelAction(req.params.serverId, req.params.channelId, { action, name, avatar }));
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/server/:serverId/message', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        try {
            const { channelId, content, embed } = req.body;
            res.json(await botIPC.sendMessage(req.params.serverId, channelId, content, embed));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/server/:serverId/channels', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        try {
            const useCache = req.query.cache === 'true';
            let channels = useCache ? await botIPC.getCache('channels', null, req.params.serverId) : await botIPC.getServerChannels(req.params.serverId);
            if (useCache && (!channels || channels.length === 0)) channels = await botIPC.getServerChannels(req.params.serverId);
            res.json({ data: channels || [], source: useCache ? 'cache' : 'api' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get('/server/:serverId/channel/:channelId/messages', requireAuth, async (req, res) => {
        if (!botIPC.connected) return res.status(503).json({ error: 'Bot not available' });
        try {
            const { serverId, channelId } = req.params;
            const useCache = req.query.cache === 'true';
            let response = useCache ? await botIPC.getCache('messages', channelId) : await botIPC.getChannelMessages(serverId, channelId);
            if (useCache && (!response || response.messages?.length === 0)) response = await botIPC.getChannelMessages(serverId, channelId);
            
            if (response?.messages) response.messages = response.messages.sort((a, b) => a.timestamp - b.timestamp);
            res.json({ data: response || [], source: useCache ? 'cache' : 'api' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};