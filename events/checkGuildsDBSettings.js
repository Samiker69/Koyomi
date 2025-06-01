const { Events } = require('discord.js');
const settings = require('../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.guilds.cache.forEach(guild => {
            console.log(`Проверка настроек для сервера: ${guild.name} (${guild.id})`);
            const currentSettings = Sdb.getSettings(guild.id);
            if (!currentSettings) {
                console.log(`Сервер ${guild.id} не найден в БД, добавляем...`);
                Sdb.addServer(guild.id);
            }
        });
    },
};