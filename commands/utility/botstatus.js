const { SlashCommandBuilder } = require('discord.js');
const { version } = require('../../package.json');
const EmbedService = require('../../services/EmbedService');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('botstatus')
    .setDescription('Показывает статус бота'),
  async execute(interaction) {
    await interaction.reply({ content: 'Подождите...' });

    const sent = await interaction.fetchReply();
    let uptimeall = process.uptime();
    let days = Math.floor(uptimeall / 86400);
    uptimeall %= 86400;
    let hours = Math.floor(uptimeall / 3600);
    uptimeall %= 3600;
    let minutes = Math.floor(uptimeall / 60);
    let seconds = Math.floor(uptimeall % 60);

    const status = EmbedService.createBaseEmbed(interaction)
      .setAuthor({
        name: `${interaction.client.user.tag}`,
        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png' })
      })
      .setTitle('Текущий статус бота')
      .setFields(
        { name: "Время обработки команды", value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
        { name: "Средний пинг", value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: "Время в сети", value: `${days}д ${hours}ч ${minutes}мин ${seconds}сек`, inline: true },
        { name: 'О процессе', value: ' ', inline: false },
        { name: 'RAM', value: `Занято процессом всего ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`, inline: true },
        { name: 'RAM', value: `Используется сейчас ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, inline: true },
        { name: '', value: ' ', inline: false },
        { name: 'arch', value: process.arch, inline: true },
        { name: 'OS', value: process.platform, inline: true },
        { name: 'Дополнительно', value: '', inline: false },
        { name: 'Кол-во загруженных ивентов', value: `${interaction.client.eventscount}`, inline: true },
        { name: 'Кол-во загруженных команд', value: `${interaction.client.commandscount}`, inline: true },
        { name: '', value: ' ', inline: false }
      )
      .setFooter({ text: `Версия бота ${version}`})

    await interaction.editReply({ content: null, embeds: [status] });
  },
};
