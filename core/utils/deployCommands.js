const { REST, Routes } = require('discord.js');

class CommandDeployer {
    constructor() {
        this.token = process.env.token || process.env.TOKEN || '';
        this.clientId = process.env.clientId || process.env.CLIENT_ID || '';
        this.guildId = process.env.DEV_SERVER_ID || '';
        this.isDev = process.env.DEV === 'true';

        this.validateConfig();
    }

    validateConfig() {
        if (!this.token || !this.clientId) {
            throw new Error('[DEPLOY] Отсутствует TOKEN или CLIENT_ID в .env');
        }
        if (this.isDev && !this.guildId) {
            throw new Error('[DEPLOY] Включен режим DEV, но DEV_SERVER_ID отсутствует.');
        }
    }

    async deploy(commands) {
        // Преобразуем Collection в массив JSON
        const commandsJSON = commands.map(command => command.data.toJSON());
        const rest = new REST().setToken(this.token);

        try {
            if (this.isDev) {
                console.log(`[DEPLOY] Обновление ${commandsJSON.length} локальных (/) команд...`);
                await rest.put(
                    Routes.applicationGuildCommands(this.clientId, this.guildId),
                    { body: commandsJSON }
                );
                console.log('[DEPLOY] Команды для DEV сервера успешно обновлены.');
            } else {
                console.log(`[DEPLOY] Обновление ${commandsJSON.length} глобальных (/) команд...`);
                await rest.put(
                    Routes.applicationCommands(this.clientId),
                    { body: commandsJSON }
                );
                console.log('[DEPLOY] Глобальные команды успешно обновлены.');
            }
        } catch (error) {
            console.error('[DEPLOY] Ошибка при деплое команд:', error);
        }
    }
}

module.exports = CommandDeployer;