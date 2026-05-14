const { Events } = require('discord.js');
const DatabaseService = require('../../services/DatabaseService');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        console.log(`[INFO]: Бот удален с сервера: ${guild.name} (${guild.id})`);
        try {
            DatabaseService.removeServer(guild.id);

       } catch (error) {
            console.error(`[ERROR]: Не удалось удалить сервер ${guild.id} из БД:`, error);
       }
    },
};