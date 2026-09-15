const { SlashCommandBuilder } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const EmbedService = require('../../services/EmbedService');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription(localeManager.get('forFunOnly.minecraft.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.minecraft.description'))
    .addStringOption(opt =>
      opt
        .setName('player')
        .setDescription(localeManager.get('forFunOnly.minecraft.options.player.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.minecraft.options.player.description'))
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = interaction.options.getString('player', true);

    await interaction.deferReply();

    try {
      const res = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(player)}`
      );
      if (res.status === 204) {
        return interaction.editReply(localeManager.get('forFunOnly.minecraft.messages.player_not_found', interaction.guildLocale || 'ru', { player }));
      }

      if (!res.ok) {
        return interaction.editReply(localeManager.get('forFunOnly.minecraft.messages.error', interaction.guildLocale || 'ru'));
      }

      const { id: uuid } = await res.json();

      const skinRenderUrl   = `https://mc-heads.net/body/${uuid}/left/4`;
      const skinDownloadUrl = `https://mc-heads.net/download/${uuid}`;
      const profileUrl      = `https://namemc.com/profile/${player}`;

      const embed = EmbedService.createBaseEmbed(interaction)
        .setTitle(localeManager.get('forFunOnly.minecraft.messages.info_title', interaction.guildLocale || 'ru', { player }))
        .setThumbnail(skinRenderUrl)
        .addFields(
          { name: localeManager.get('forFunOnly.minecraft.messages.label_skin_render', interaction.guildLocale || 'ru'), value: `[${localeManager.get('forFunOnly.minecraft.messages.link_view', interaction.guildLocale || 'ru')}](${skinRenderUrl})`, inline: true },
          { name: localeManager.get('forFunOnly.minecraft.messages.label_skin_download', interaction.guildLocale || 'ru'), value: `[${localeManager.get('forFunOnly.minecraft.messages.link_download', interaction.guildLocale || 'ru')}](${skinDownloadUrl})`, inline: true },
          { name: localeManager.get('forFunOnly.minecraft.messages.label_namemc', interaction.guildLocale || 'ru'), value: `[${localeManager.get('forFunOnly.minecraft.messages.link_go', interaction.guildLocale || 'ru')}](${profileUrl})`, inline: true },
          { name: 'UUID', value: uuid, inline: true }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /minecraft command:', err);
      try {
        await interaction.editReply(localeManager.get('events.errors.generic_error', interaction.guildLocale || 'ru'));
      } catch {
      }
    }
  }
};
