const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const getReply = (key, locale, vars = {}) => {
  let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
};

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Команды для получения информации')
    .setDescriptionLocalizations(utility.info.description)
    .addSubcommand(sub =>
      sub
        .setName('userinfo')
        .setDescription('Информация о пользователе')
        .setDescriptionLocalizations(utility.info.subcommands.userinfo.description)
        .addUserOption(opt =>
          opt
            .setName('target')
            .setDescription('Пользователь (необязательно)')
            .setDescriptionLocalizations(utility.info.options.target.description)
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('serverinfo')
        .setDescription('Информация о сервере')
        .setDescriptionLocalizations(utility.info.subcommands.serverinfo.description)
    ),

  async execute(interaction) {
    const loc = interaction.locale;
    const sub = interaction.options.getSubcommand();

    if (sub === 'userinfo') {
      const member = interaction.options.getMember('target') || interaction.member;
      const user = member.user;

      const createdTs = Math.floor(user.createdAt.getTime() / 1000);
      const joinedTs = Math.floor(member.joinedAt.getTime() / 1000);
      const rawStatus = member.presence?.status || 'offline';
      const statusText = getReply(`info_status_${rawStatus}`, loc);

      const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => r.name)
        .join(', ') || '—';

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setAuthor({ name: user.tag, iconURL: user.avatarURL({ dynamic: true }) })
        .setThumbnail(user.avatarURL({ dynamic: true }))
        .setTitle(getReply('info_user_title', loc))
        .addFields(
          { name: getReply('info_id', loc), value: user.id, inline: true },
          { name: getReply('info_account_created', loc), value: `<t:${createdTs}:F> (<t:${createdTs}:R>)`, inline: true },
          { name: getReply('info_joined_server', loc), value: `<t:${joinedTs}:F> (<t:${joinedTs}:R>)`, inline: true },
          { name: getReply('info_status', loc), value: statusText, inline: true },
          { name: getReply('info_roles', loc), value: roles, inline: false }
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
        .setTitle(getReply('info_server_title', loc))
        .addFields(
          { name: getReply('info_id', loc), value: guild.id, inline: true },
          { name: getReply('info_created', loc), value: `<t:${createdTs}:F> (<t:${createdTs}:R>)`, inline: true },
          { name: getReply('info_owner', loc), value: `<@${guild.ownerId}>`, inline: true },
          { name: getReply('info_members_count', loc), value: `${guild.memberCount}`, inline: true },
          { name: getReply('info_roles_count', loc), value: `${guild.roles.cache.size}`, inline: true },
          { name: getReply('info_channels_count', loc), value: `${guild.channels.cache.size}`, inline: true },
          { name: getReply('info_locale', loc), value: guild.preferredLocale, inline: true }
        );

      return await interaction.reply({ embeds: [embed] });
    }

    return await interaction.reply({ content: getReply('unknown_subcommand', loc), flags: MessageFlags.Ephemeral });
  }
};
