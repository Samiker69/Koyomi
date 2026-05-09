const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const Settings = require('../../functions/db/settings');
const localeManager = require('../../locales/localeManager');

const Sdb = new Settings();

module.exports = {
  data: new SlashCommandBuilder()
    .setName(localeManager.get('utility.starboard.name'))
    .setNameLocalizations(localeManager.getLocalizations('utility.starboard.name', 'name'))
    .setDescription(localeManager.get('utility.starboard.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.starboard.description'))
    .addSubcommand(sub => 
      sub.setName(localeManager.get('utility.starboard.options.setup.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.starboard.options.setup.name', 'name'))
        .setDescription(localeManager.get('utility.starboard.options.setup.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.starboard.options.setup.description'))
        .addChannelOption(opt => 
          opt.setName(localeManager.get('utility.starboard.options.setup.options.channel.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.starboard.options.setup.options.channel.name', 'name'))
            .setDescription(localeManager.get('utility.starboard.options.setup.options.channel.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.starboard.options.setup.options.channel.description'))
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        .addIntegerOption(opt => 
          opt.setName(localeManager.get('utility.starboard.options.setup.options.min.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.starboard.options.setup.options.min.name', 'name'))
            .setDescription(localeManager.get('utility.starboard.options.setup.options.min.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.starboard.options.setup.options.min.description'))
            .setMinValue(1)
            .setMaxValue(50))
    )
    .addSubcommand(sub => 
      sub.setName(localeManager.get('utility.starboard.options.disable.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.starboard.options.disable.name', 'name'))
        .setDescription(localeManager.get('utility.starboard.options.disable.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.starboard.options.disable.description'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

   async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const min = interaction.options.getInteger('min') || 3;

      Sdb.updateSetting(guildId, 'starboardChannelId', channel.id);
      Sdb.updateSetting(guildId, 'starboardMinStars', min);
      Sdb.updateSetting(guildId, 'starboardEnabled', true);

      return await interaction.reply({
        content: localeManager.get('utility.starboard.messages.setup_done', lang, { channel: channel.toString(), min }),
        flags: MessageFlags.Ephemeral
      });
    }

    if (sub === 'disable') {
      Sdb.updateSetting(guildId, 'starboardEnabled', false);
      return await interaction.reply({
        content: localeManager.get('utility.starboard.messages.disabled_done', lang),
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
