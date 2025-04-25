const { Events, REST, Routes } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`[INFO] ${client.user.tag} запущен`);

		const rest = new REST().setToken(process.env.token);

		try {
			console.log(`[INFO] Регистрация ${commandsForRegister.length} глобальных слэш-команд...`);
			await rest.put(
				Routes.applicationCommands(process.env.clientId),
				{ body: commandsForRegister }
			);
			console.log('[INFO] Глобальные слэш-команды успешно зарегистрированы.');
		} catch (error) {
			console.error('[ERROR] Ошибка при регистрации команд:', error);
		}
	},
};