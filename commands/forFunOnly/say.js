const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();


module.exports = {
  data: new SlashCommandBuilder()
    .setName(localeManager.getString('commands.say.name'))
    .setDescription(localeManager.getString('commands.say.description'))
    
    .addStringOption(opt =>
      opt
        .setName(localeManager.getString('commands.say.text.name'))
        .setDescription(localeManager.getString('commands.say.text.description'))
        
        .setRequired(false)
    )
    .addAttachmentOption(opt =>
      opt
        .setName(localeManager.getString('commands.say.image.name'))
        .setDescription(localeManager.getString('commands.say.image.description'))
        
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt
        .setName(localeManager.getString('commands.say.reply_to.name'))
        .setDescription(localeManager.getString('commands.say.reply_to.description'))
        
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!config.privateAccess.includes(interaction.user.id)) {
      return await interaction.reply({
        content: localeManager.getString('commands.say.no_permissions'),
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.options.getString('text', false);
    const image = interaction.options.getAttachment('image');
    const replyToRaw = interaction.options.getString('reply_to');
    if (!text && !image) return await interaction.editReply({ content: localeManager.getString('commands.say.text_or_image_required'), flags: MessageFlags.Ephemeral });
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
        content: localeManager.getString('commands.say.message_sent_success'),
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('Error in /say:', err);
      await interaction.editReply({
        content: localeManager.getString('commands.say.message_sent_failure'),
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
