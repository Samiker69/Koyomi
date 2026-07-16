const { Events } = require('discord.js');
const AntiSpamService = require('../../services/AntiSpamService');

module.exports = {
    name: Events.MessageCreate,
    async execute(msg) {
        if (!msg.guild || msg.author.bot) return;
        try {
            await AntiSpamService.processMessage(msg);
        } catch (error) {
            console.error('[Anti-Spam Event Error]:', error);
        }
    },
};