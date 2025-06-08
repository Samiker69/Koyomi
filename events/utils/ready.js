const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`[INFO] ${client.user.tag} запущен`);
	},
};