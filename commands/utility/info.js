const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

const statusMap = {
  online: 'В сети',
  idle: 'Не активен',
  dnd: 'Не беспокоить',
  offline: 'Не в сети'
};

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName(localeManager.getString('commands.info.name'))
    .setDescription(localeManager.getString('commands.info.description'))
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.info.options.userinfo.name'))
        .setDescription(localeManager.getString('commands.info.options.userinfo.description'))
        .addUserOption(opt =>
          opt
            .setName(localeManager.getString('commands.info.options.userinfo.options.target.name'))
            .setDescription(localeManager.getString('commands.info.options.userinfo.options.target.description'))
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.info.options.serverinfo.name'))
        .setDescription(localeManager.getString('commands.info.options.serverinfo.description'))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'userinfo') {
      const member = interaction.options.getMember('target') || interaction.member;
      const user = member.user;

      const createdTs = Math.floor(user.createdAt.getTime() / 1000);
      const joinedTs  = Math.floor(member.joinedAt.getTime() / 1000);
      const rawStatus = member.presence?.status || 'offline';
      const statusText = statusMap[rawStatus] || rawStatus;

      const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => r.name)
        .join(', ') || '—';

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setAuthor({ name: user.tag, iconURL: user.avatarURL({ dynamic: true }) })
        .setThumbnail(user.avatarURL({ dynamic: true }))
        .setTitle('Информация о пользователе')
        .addFields(
          { name: 'ID',                 value: user.id,                              inline: true },
          { name: 'Аккаунт создан',     value: `<t:${createdTs}:F> (<t:${createdTs}:R>)`, inline: true },
          { name: 'Вступил на сервер',  value: `<t:${joinedTs}:F> (<t:${joinedTs}:R>)`,  inline: true },
          { name: 'Статус',             value: statusText,                            inline: true },
          { name: 'Роли',               value: roles,                                 inline: false }
        );

      return await interaction.reply({ embeds: [embed] });
    }

    if (sub === 'serverinfo') {
      const guild = interaction.guild;
      const createdTs = Math.floor(guild.createdAt.getTime() / 1000);

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTitle('Информация о сервере')
        .addFields(
          { name: 'ID',           value: guild.id,                             inline: true },
          { name: 'Создан',      value: `<t:${createdTs}:F> (<t:${createdTs}:R>)`, inline: true },
          { name: 'Владелец',    value: `<@${guild.ownerId}>`,                 inline: true },
          { name: 'Участников',  value: `${guild.memberCount}`,                 inline: true },
          { name: 'Ролей',       value: `${guild.roles.cache.size}`,            inline: true },
          { name: 'Каналов',     value: `${guild.channels.cache.size}`,         inline: true },
          { name: 'Локаль',      value: guild.preferredLocale,                 inline: true }
        );

      return await interaction.reply({ embeds: [embed] });
    }

    return await interaction.reply({ content: 'Неизвестная подкоманда.', flags: MessageFlags.Ephemeral });
  }
};
