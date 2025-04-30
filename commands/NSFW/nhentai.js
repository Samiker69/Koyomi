const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require('discord.js');
  const { fetchDoujin } = require('../../functions/fetchDoujin');
  
  module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
      .setName('hentai')
      .setDescription('Случайная галерея с nhentai'),
  
    async execute(interaction) {
      if (!interaction.channel.nsfw) return await interaction.reply({content: 'Это не NSFW канал, чертов дрочун малолетний', flags: MessageFlags.Ephemeral});
      await interaction.deferReply();
  
      const id = Math.floor(Math.random() * 500_000) + 1;
      const page = 1;
  
      const result = await fetchDoujin(id, page);
      if (!result) return await interaction.editReply('Не удалось получить случайную галерею. Попробуй ещё раз.');
  
      const ownerId = interaction.user.id;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`prev_${ownerId}_${id}_${page}`)
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`next_${ownerId}_${id}_${page}`)
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === result.totalPages)
      );
  
      return await interaction.editReply({
        embeds:     [result.embed],
        files:      [result.attachment],
        components: [row]
      });
    }
  };