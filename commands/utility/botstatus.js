const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const { version } = require('../../package.json');
const localeManager = require('../../locales/localeManager');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('botstatus')
    .setNameLocalizations(localeManager.getLocalizations('utility.botstatus.name'))
    .setDescription(localeManager.get('utility.botstatus.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.botstatus.description')),
    
  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sent = await interaction.reply({ 
      content: localeManager.get('utility.botstatus.messages.wait', lang), 
      fetchReply: true, 
      flags: MessageFlags.Ephemeral 
    });
    
    const timeToExec = sent.createdTimestamp - interaction.createdTimestamp;
    const uptimeSeconds = Math.floor(interaction.client.uptime / 1000);
    const d = Math.floor(uptimeSeconds / (3600 * 24));
    const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = Math.floor(uptimeSeconds % 60);

    const uptimeStr = localeManager.get('utility.botstatus.messages.uptime_format', lang, { d, h, m, s });

    const memoryUsage = process.memoryUsage();
    const totalRSS = (memoryUsage.rss / 1024 / 1024).toFixed(2);
    const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

    const embed = EmbedService.createBaseEmbed(interaction)
      .setTitle(localeManager.get('utility.botstatus.messages.title', lang))
      .addFields(
        { name: `⚡ ${localeManager.get('utility.botstatus.messages.process_time', lang)}`, value: `\`${timeToExec}ms\``, inline: true },
        { name: `📡 ${localeManager.get('utility.botstatus.messages.ping', lang)}`, value: `\`${interaction.client.ws.ping}ms\``, inline: true },
        { name: `🕒 ${localeManager.get('utility.botstatus.messages.uptime', lang)}`, value: `\`${uptimeStr}\``, inline: true },
        { 
          name: `💻 ${localeManager.get('utility.botstatus.messages.about_process', lang)}`, 
          value: `> ${localeManager.get('utility.botstatus.messages.ram_total', lang, { mb: totalRSS })}\n` +
                 `> ${localeManager.get('utility.botstatus.messages.ram_heap', lang, { mb: heapUsed })}`, 
          inline: false 
        },
        { 
          name: `📂 ${localeManager.get('utility.botstatus.messages.additional', lang)}`, 
          value: `> ${localeManager.get('utility.botstatus.messages.events_count', lang)}: \`${interaction.client.eventNames().length}\`\n` +
                 `> ${localeManager.get('utility.botstatus.messages.commands_count', lang)}: \`${interaction.client.commands.size}\``, 
          inline: false 
        }
      )
      .setFooter({ text: localeManager.get('utility.botstatus.messages.version', lang, { v: version }) });

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
