const express = require('express');
const { requireGeminiAccess } = require('../middlewares/auth');
const DatabaseService = require('../../utils/db/DatabaseService');

module.exports = (botIPC) => {
    const router = express.Router();

    router.get('/gemini-settings', requireGeminiAccess, async (req, res) => {
        try {
            const userSettings = await DatabaseService.getUserGeminiConfig(req.user.id);
            const safetySettings = await DatabaseService.getSafetySettings(req.user.id);
            res.render('gemini-settings', { userSettings, safetySettings });
        } catch (error) {
            res.status(500).send('Ошибка загрузки настроек');
        }
    });

    router.get('/api/gemini/models', requireGeminiAccess, async (req, res) => {
        try {
            const tokens = await DatabaseService.getAllUserTokens(req.user.id);
            if (!tokens[0] || tokens[0].length === 0) return res.status(400).send("Нет токенов");
            res.send(Object.fromEntries(await botIPC.getGeminiModels(tokens[0][0])));
        } catch (error) {
            res.status(500).send("Ошибка получения моделей");
        }
    });

    router.post('/api/gemini/user-settings', requireGeminiAccess, async (req, res) => {
        try {
            const { model, system_instructions, max_output_tokens, temperature, top_p, top_k, history_limit } = req.body;
            await DatabaseService.addUserConfig(req.user.id, {
                model, system_instructions, 
                max_output_tokens: parseInt(max_output_tokens),
                temperature: parseFloat(temperature),
                top_p: top_p ? parseFloat(top_p) : null,
                top_k: top_k ? parseInt(top_k) : null,
                history_limit: parseInt(history_limit)
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/api/gemini/safety-settings', requireGeminiAccess, async (req, res) => {
        try {
            await DatabaseService.updateSafetySettings(req.user.id, req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};