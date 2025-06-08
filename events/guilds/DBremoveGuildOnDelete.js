const { Events } = require('discord.js');
const settings = require('../../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        console.log(`[INFO]: Бот удален с сервера: ${guild.name} (${guild.id})`);
        try {
            Sdb.removeServer(guild.id);
       } catch (error) {
            console.error(`[ERROR]: Не удалось удалить сервер ${guild.id} из БД:`, error);
       }
    },
};