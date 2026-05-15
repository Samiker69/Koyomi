const { Events } = require('discord.js');
const DatabaseService = require('../../services/DatabaseService');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`[INFO]: Бот добавлен на сервер: ${guild.name} (${guild.id})`);
        try {
            await DatabaseService.addServer(guild.id);

        } catch (error) {
             console.error(`[ERROR]: Не удалось добавить сервер ${guild.id} в БД:`, error);
        }
    },
};