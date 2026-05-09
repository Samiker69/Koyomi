const { Events } = require('discord.js');
const MojoTestService = require('../../services/MojoTestService');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Проверяем, проходит ли этот пользователь тест прямо сейчас
        if (MojoTestService.activeTests.has(message.author.id)) {
            // Если да, мгновенно удаляем его сообщение
            try {
                await message.delete();
            } catch (error) {
                console.error(`[MojoTest] Не удалось удалить сообщение от ${message.author.tag}:`, error);
            }
        }
    },
};
