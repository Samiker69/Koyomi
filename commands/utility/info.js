const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('info')
    .setNameLocalizations(localeManager.getLocalizations('utility.info.name'))
    .setDescription(localeManager.get('utility.info.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.info.description'))
    .addSubcommand(sub =>
      sub
        .setName('userinfo')
        .setNameLocalizations(localeManager.getLocalizations('utility.info.options.userinfo.name'))
        .setDescription(localeManager.get('utility.info.options.userinfo.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.info.options.userinfo.description'))
        .addUserOption(opt =>
          opt
            .setName('target')
            .setNameLocalizations(localeManager.getLocalizations('utility.info.options.userinfo.options.target.name'))
            .setDescription(localeManager.get('utility.info.options.userinfo.options.target.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.info.options.userinfo.options.target.description'))
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('serverinfo')
        .setNameLocalizations(localeManager.getLocalizations('utility.info.options.serverinfo.name'))
        .setDescription(localeManager.get('utility.info.options.serverinfo.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.info.options.serverinfo.description'))
    ),

  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sub = interaction.options.getSubcommand();

    if (sub === 'userinfo') {
      const member = interaction.options.getMember('target') || interaction.member;
      const user = member.user;

      const createdTs = Math.floor(user.createdAt.getTime() / 1000);
      const joinedTs  = Math.floor(member.joinedAt.getTime() / 1000);
      const rawStatus = member.presence?.status || 'offline';
      const statusText = localeManager.get(`utility.info.messages.status.${rawStatus}`, lang);

      const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => r.name)
        .join(', ') || '—';

      const embed = EmbedService.createBaseEmbed(interaction)
        .setAuthor({ name: user.tag, iconURL: user.avatarURL({ dynamic: true }) })
        .setThumbnail(user.avatarURL({ dynamic: true }))
        .setTitle(localeManager.get('utility.info.messages.user_title', lang))
        .addFields(
          { name: localeManager.get('utility.info.messages.id', lang),         value: user.id,                              inline: true },
          { name: localeManager.get('utility.info.messages.created_at', lang), value: `<t:${createdTs}:F> (<t:${createdTs}:R>)`, inline: true },
          { name: localeManager.get('utility.info.messages.joined_at', lang),  value: `<t:${joinedTs}:F> (<t:${joinedTs}:R>)`,  inline: true },
          { name: localeManager.get('utility.info.messages.status_label', lang), value: statusText,           inline: true },
          { name: localeManager.get('utility.info.messages.roles', lang),       value: roles,                                 inline: false }
        );

      return await interaction.reply({ embeds: [embed] });
    }

    if (sub === 'serverinfo') {
      const guild = interaction.guild;
      const createdTs = Math.floor(guild.createdAt.getTime() / 1000);

      const embed = EmbedService.createBaseEmbed(interaction)
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTitle(localeManager.get('utility.info.messages.server_title', lang))
        .addFields(
          { name: localeManager.get('utility.info.messages.id', lang),           value: guild.id,                             inline: true },
          { name: localeManager.get('utility.info.messages.server_created', lang), value: `<t:${createdTs}:F> (<t:${createdTs}:R>)`, inline: true },
          { name: localeManager.get('utility.info.messages.owner', lang),      value: `<@${guild.ownerId}>`,                 inline: true },
          { name: localeManager.get('utility.info.messages.members', lang),    value: `${guild.memberCount}`,                 inline: true },
          { name: localeManager.get('utility.info.messages.roles', lang),      value: `${guild.roles.cache.size}`,            inline: true },
          { name: localeManager.get('utility.info.messages.channels', lang),   value: `${guild.channels.cache.size}`,         inline: true },
          { name: localeManager.get('utility.info.messages.locale', lang),     value: guild.preferredLocale,                 inline: true }
        );

      return await interaction.reply({ embeds: [embed] });
    }

    return await interaction.reply({ content: localeManager.get('utility.info.messages.unknown_sub', lang), flags: MessageFlags.Ephemeral });
  }
};
