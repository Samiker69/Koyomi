const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Позволяет боту переслать ваше сообщение в канал от своего имени')
    .addStringOption(opt =>
      opt
        .setName('text')
        .setDescription('Текст сообщения для отправки')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt
        .setName('image')
        .setDescription('Прикрепить изображение к сообщению')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt
        .setName('reply_to')
        .setDescription('ID или ссылка на сообщение для ответа')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!config.privateAccess.includes(interaction.user.id)) {
      return interaction.reply({
        content: 'У вас нет доступа к этой команде.',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.options.getString('text', true);
    const image = interaction.options.getAttachment('image');
    const replyToRaw = interaction.options.getString('reply_to');
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
        content: 'Сообщение успешно отправлено.',
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('Error in /say:', err);
      await interaction.editReply({
        content: 'Не удалось отправить сообщение.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
