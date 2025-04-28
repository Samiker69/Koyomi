const { Events } = require('discord.js');
const settings = require('../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`[INFO]: Бот добавлен на сервер: ${guild.name} (${guild.id})`);
        try {
            Sdb.addServer(guild.id);
        } catch (error) {
             console.error(`[ERROR]: Не удалось добавить сервер ${guild.id} в БД:`, error);
        }
    },
};