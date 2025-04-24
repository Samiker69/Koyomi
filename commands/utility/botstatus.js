const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('botstatus')
		.setDescription('Показывает статус бота'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Подождите...', withResponse: true });
		let uptimeall = process.uptime();
		let days = Math.floor(uptimeall / 86400);
		uptimeall %= 86400;
		let hours = Math.floor(uptimeall / 3600);
		uptimeall %= 3600;
		let minutes = Math.floor(uptimeall / 60);
		let seconds = Math.floor(uptimeall % 60);
		const status = new EmbedBuilder()
			.setAuthor({name: `${interaction.client.user.tag}`, iconURL: `${interaction.client.user.avatarURL()}`})
			.setColor(0x9B59B6)
			.setTitle('Текущий статус бота')
            .setDescription(
                `Время обработки команды: ${sent.resource.message.createdTimestamp - interaction.createdTimestamp}ms\n`+
                `Cредний пинг: ${sent.resource.message.client.ws.ping}ms\n`+
                `Время в сети: ${days}д ${hours}ч ${minutes}мин ${seconds}сек\n\n`+
				`Потребление ресурсов\n`+
				`RAM: Занято всего процессом ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB"}\n`+
				`RAM: Используется сейчас ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB"}\n`+
				`arch: ${process.arch}\n`+
				`OS: ${process.platform}`
            );

			await interaction.editReply({ content: null, embeds: [status] });
		},
};