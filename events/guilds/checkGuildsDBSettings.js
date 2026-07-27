const { Events } = require('discord.js');
const DatabaseService = require('../../database/repositories');


module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        for (const [guildId, guild] of client.guilds.cache) {
            console.log(`Проверка настроек для сервера: ${guild.name} (${guildId})`);
            const currentSettings = await DatabaseService.getSettings(guildId);
            
            if (!currentSettings) {
                console.log(`Сервер ${guildId} не найден в БД, добавляем...`);
                await DatabaseService.addServer(guildId); 
            }
        }
        console.log('✅ Синхронизация серверов завершена.');
    },
};