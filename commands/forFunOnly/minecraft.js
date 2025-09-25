const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');



module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription('someкостыль_69')
    
    .addStringOption(opt =>
      opt
        .setName('player')
        .setDescription('someкостыль_69')
        
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

      const embed = new EmbedBuilder()
        .setTitle(`Информация по игроку ${player}`)
        .setColor(0x9B59B6)
        .setThumbnail(skinRenderUrl)
        .addFields(
          { name: 'Рендер скина',       value: `[Посмотреть](${skinRenderUrl})`,   inline: true },
          { name: 'Скачать скин',       value: `[Скачать](${skinDownloadUrl})`,    inline: true },
          { name: 'Профиль на NameMC',  value: `[Перейти](${profileUrl})`,         inline: true },
          { name: 'UUID',               value: uuid,                                inline: true }
        )
        .setTimestamp();

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
