const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json')
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const getReply = (key, locale, vars = {}) => {
  let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
};

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('botstatus')
    .setDescription('Показывает статус бота')
    .setDescriptionLocalizations(utility.botstatus.description),
  async execute(interaction) {
    const loc = interaction.locale;
    await interaction.reply({ content: getReply('wait', loc) });

    const sent = await interaction.fetchReply();
    let uptimeall = process.uptime();
    let days = Math.floor(uptimeall / 86400);
    uptimeall %= 86400;
    let hours = Math.floor(uptimeall / 3600);
    uptimeall %= 3600;
    let minutes = Math.floor(uptimeall / 60);
    let seconds = Math.floor(uptimeall % 60);

    const status = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.client.user.tag}`,
        iconURL: interaction.client.user.displayAvatarURL({ extension: 'png' })
      })
      .setColor(0x9B59B6)
      .setTitle(getReply('botstatus_title', loc))
      .setFields(
        { name: getReply('botstatus_processing', loc), value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
        { name: getReply('botstatus_ping', loc), value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: getReply('botstatus_uptime', loc), value: getReply('botstatus_uptime_value', loc, { days, hours, minutes, seconds }), inline: true },
        { name: getReply('botstatus_process', loc), value: ' ', inline: false },
        { name: 'RAM', value: getReply('botstatus_ram_total', loc, { mb: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) }), inline: true },
        { name: 'RAM', value: getReply('botstatus_ram_used', loc, { mb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) }), inline: true },
        { name: '\u200B', value: ' ', inline: false },
        { name: 'arch', value: process.arch, inline: true },
        { name: 'OS', value: process.platform, inline: true },
        { name: getReply('botstatus_additional', loc), value: '\u200B', inline: false },
        { name: getReply('botstatus_events', loc), value: `${interaction.client.eventscount}`, inline: true },
        { name: getReply('botstatus_commands', loc), value: `${interaction.client.commandscount}`, inline: true },
        { name: '\u200B', value: ' ', inline: false }
      )
      .setFooter({ text: getReply('botstatus_version', loc, { version }) })

    await interaction.editReply({ content: null, embeds: [status] });
  },
};
