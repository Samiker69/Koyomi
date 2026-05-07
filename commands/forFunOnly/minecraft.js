const { SlashCommandBuilder } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly');
const EmbedService = require('../../services/EmbedService');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription(forFunOnly.minecraft.description.ru)
    .setDescriptionLocalizations(forFunOnly.minecraft.description)
    .addStringOption(opt =>
      opt
        .setName('player')
        .setDescription(forFunOnly.minecraft.options.player.description.ru)
        .setDescriptionLocalizations(forFunOnly.minecraft.options.player.description)
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
        return interaction.editReply(`Игрок \`${player}\` не найден.`);
      }
      const { id: uuid } = await res.json();

      const skinRenderUrl   = `https://mc-heads.net/body/${uuid}/left/4`;
      const skinDownloadUrl = `https://mc-heads.net/download/${uuid}`;
      const profileUrl      = `https://namemc.com/profile/${player}`;

      const embed = EmbedService.createBaseEmbed(interaction)
        .setTitle(`Информация по игроку ${player}`)
        .setThumbnail(skinRenderUrl)
        .addFields(
          { name: 'Рендер скина',       value: `[Посмотреть](${skinRenderUrl})`,   inline: true },
          { name: 'Скачать скин',       value: `[Скачать](${skinDownloadUrl})`,    inline: true },
          { name: 'Профиль на NameMC',  value: `[Перейти](${profileUrl})`,         inline: true },
          { name: 'UUID',               value: uuid,                                inline: true }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('Error in /minecraft command:', err);
      try {
        await interaction.editReply('Произошла ошибка при получении данных.');
      } catch {
      }
    }
  }
};
