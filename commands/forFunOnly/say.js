const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const localeManager = require('../../locales/localeManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setNameLocalizations(localeManager.getLocalizations('forFunOnly.say.name'))
    .setDescription(localeManager.get('forFunOnly.say.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.say.description'))
    .addStringOption(opt =>
      opt
        .setName('text')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.say.options.text.name'))
        .setDescription(localeManager.get('forFunOnly.say.options.text.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.say.options.text.description'))
        .setRequired(false)
    )
    .addAttachmentOption(opt =>
      opt
        .setName('image')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.say.options.image.name'))
        .setDescription(localeManager.get('forFunOnly.say.options.image.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.say.options.image.description'))
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt
        .setName('reply_to')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.say.options.reply_to.name'))
        .setDescription(localeManager.get('forFunOnly.say.options.reply_to.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.say.options.reply_to.description'))
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!config.privateAccess.includes(interaction.user.id)) {
      return await interaction.reply({
        content: localeManager.get('forFunOnly.say.messages.no_access', interaction.guildLocale || 'ru'),
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.options.getString('text', false);
    const image = interaction.options.getAttachment('image');
    const replyToRaw = interaction.options.getString('reply_to');
    if (!text && !image) return await interaction.editReply({ content: localeManager.get('forFunOnly.say.messages.text_or_image_required', interaction.guildLocale || 'ru'), flags: MessageFlags.Ephemeral });
    let messageReference;

    if (replyToRaw) {
      const match = replyToRaw.match(/(\d{17,19})$/);
      if (match) messageReference = match[1];
    }

    const sendOptions = { content: text };
    if (image) sendOptions.files = [image.url];
    if (messageReference) sendOptions.reply = { messageReference };

    try {
      await interaction.channel.send(sendOptions);
      await interaction.editReply({
        content: localeManager.get('forFunOnly.say.messages.success', interaction.guildLocale || 'ru'),
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('Error in /say:', err);
      await interaction.editReply({
        content: localeManager.get('forFunOnly.say.messages.error', interaction.guildLocale || 'ru'),
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
