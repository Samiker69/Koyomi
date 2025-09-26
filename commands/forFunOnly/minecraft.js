const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName(localeManager.getString('commands.minecraft.name'))
    .setDescription(localeManager.getString('commands.minecraft.description'))
    
    .addStringOption(opt =>
      opt
        .setName(localeManager.getString('commands.minecraft.options.player.name'))
        .setDescription(localeManager.getString('commands.minecraft.options.player.description'))
        
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = interaction.options.getString('player', true);

    await interaction.deferReply();

    try {
      const res = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(player)}`
      );
      if (!res.ok) {
        return interaction.editReply(localeManager.getString('commands.minecraft.player_not_found', { player: player }));
      }
      const { id: uuid } = await res.json();

      const skinRenderUrl   = `https://mc-heads.net/body/${uuid}/left/4`;
      const skinDownloadUrl = `https://mc-heads.net/download/${uuid}`;
      const profileUrl      = `https://namemc.com/profile/${player}`;

      const embed = new EmbedBuilder()
        .setTitle(localeManager.getString('commands.minecraft.embed_title', { player: player }))
        .setColor(0x9B59B6)
        .setThumbnail(skinRenderUrl)
        .addFields(
          { name: localeManager.getString('commands.minecraft.skin_render_field'),       value: `[${localeManager.getString('commands.minecraft.view_button')}](${skinRenderUrl})`,   inline: true },
          { name: localeManager.getString('commands.minecraft.download_skin_field'),       value: `[${localeManager.getString('commands.minecraft.download_button')}](${skinDownloadUrl})`,    inline: true },
          { name: localeManager.getString('commands.minecraft.namemc_profile_field'),  value: `[${localeManager.getString('commands.minecraft.go_button')}](${profileUrl})`,         inline: true },
          { name: localeManager.getString('commands.minecraft.uuid_field'),               value: uuid,                                inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /minecraft command:', err);
      try {
        await interaction.editReply(localeManager.getString('commands.minecraft.error_fetching_data'));
      } catch {
      }
    }
  }
};
