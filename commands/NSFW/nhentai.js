const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
  } = require('discord.js');
  const { fetchDoujin } = require('../../functions/fetchDoujin');
  const localeManager = require('../../locales/localeManager');
  
  module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
      .setName('nhentai')
      .setDescription(localeManager.get('nsfw.nhentai.description'))
      .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.nhentai.description')),
  
    async execute(interaction) {
      const lang = interaction.guildLocale || 'ru';
      if (!interaction.channel.nsfw) return await interaction.reply({ content: localeManager.get('nsfw.nhentai.messages.not_nsfw', lang), flags: MessageFlags.Ephemeral });
      await interaction.deferReply();
  
      const id = Math.floor(Math.random() * 500_000) + 1;
      const page = 1;
  
      const result = await fetchDoujin(id, page);
      if (!result) return await interaction.editReply(localeManager.get('nsfw.nhentai.messages.fetch_error', lang));
  
      const ownerId = interaction.user.id;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`nhentai_prev_${ownerId}_${id}_${page}`)
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`nhentai_next_${ownerId}_${id}_${page}`)
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