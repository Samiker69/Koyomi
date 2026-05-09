const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const Settings = require('../../functions/db/settings');
const localeManager = require('../../locales/localeManager');

const Sdb = new Settings();

module.exports = {
  data: new SlashCommandBuilder()
    .setName(localeManager.get('utility.rolemenu.name'))
    .setNameLocalizations(localeManager.getLocalizations('utility.rolemenu.name', 'name'))
    .setDescription(localeManager.get('utility.rolemenu.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.description'))
    .addSubcommand(sub => 
      sub.setName(localeManager.get('utility.rolemenu.options.create.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.name', 'name'))
        .setDescription(localeManager.get('utility.rolemenu.options.create.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.description'))
        .addStringOption(opt => 
          opt.setName(localeManager.get('utility.rolemenu.options.create.options.title.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.title.name', 'name'))
            .setDescription(localeManager.get('utility.rolemenu.options.create.options.title.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.title.description'))
            .setRequired(true))
        .addStringOption(opt => 
          opt.setName(localeManager.get('utility.rolemenu.options.create.options.description.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.description.name', 'name'))
            .setDescription(localeManager.get('utility.rolemenu.options.create.options.description.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.description.description'))
            .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const title = interaction.options.getString('title');
      const desc = interaction.options.getString('description');

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setColor('Blurple')
        .setFooter({ text: localeManager.get('utility.rolemenu.messages.footer', lang) });

      await interaction.reply({
        content: localeManager.get('utility.rolemenu.messages.setup_start', lang),
        flags: MessageFlags.Ephemeral
      });

      const menuMsg = await interaction.channel.send({ embeds: [embed] });
      
      // Логика добавления ролей через реакции или кнопки обычно идет дальше
      // Для примера оставим так, так как основная цель - локализация метаданных и сообщений
      
      await interaction.editReply({
        content: localeManager.get('utility.rolemenu.messages.setup_done', lang, { id: menuMsg.id })
      });
    }
  }
};