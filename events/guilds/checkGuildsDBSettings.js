const { Events } = require('discord.js');
const DatabaseService = require('../../services/DatabaseService');


module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.guilds.cache.forEach(guild => {
            console.log(`Проверка настроек для сервера: ${guild.name} (${guild.id})`);
            const currentSettings = DatabaseService.getSettings(guild.id);
            if (!currentSettings) {
                console.log(`Сервер ${guild.id} не найден в БД, добавляем...`);
                DatabaseService.addServer(guild.id);
            }
        });
    },
};