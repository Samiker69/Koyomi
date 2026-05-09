const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Settings = require('../../functions/db/settings');
const localeManager = require('../../locales/localeManager');
const Sdb = new Settings();

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('room')
    .setNameLocalizations(localeManager.getLocalizations('utility.room.name'))
    .setDescription(localeManager.get('utility.room.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.description'))
    .addSubcommand(sub =>
      sub
        .setName('rename')
        .setNameLocalizations(localeManager.getLocalizations('utility.room.options.rename.name'))
        .setDescription(localeManager.get('utility.room.options.rename.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.rename.description'))
        .addStringOption(opt =>
          opt
            .setName('name')
            .setNameLocalizations(localeManager.getLocalizations('utility.room.options.rename.options.name.name'))
            .setDescription(localeManager.get('utility.room.options.rename.options.name.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.rename.options.name.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('limit')
        .setNameLocalizations(localeManager.getLocalizations('utility.room.options.limit.name'))
        .setDescription(localeManager.get('utility.room.options.limit.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.limit.description'))
        .addIntegerOption(opt =>
          opt
            .setName('number')
            .setNameLocalizations(localeManager.getLocalizations('utility.room.options.limit.options.number.name'))
            .setDescription(localeManager.get('utility.room.options.limit.options.number.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.limit.options.number.description'))
            .setRequired(true)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('lock')
        .setNameLocalizations(localeManager.getLocalizations('utility.room.options.lock.name'))
        .setDescription(localeManager.get('utility.room.options.lock.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.lock.description'))
    )
    .addSubcommand(sub =>
      sub
        .setName('unlock')
        .setNameLocalizations(localeManager.getLocalizations('utility.room.options.unlock.name'))
        .setDescription(localeManager.get('utility.room.options.unlock.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.unlock.description'))
    )
    .addSubcommand(sub =>
      sub
        .setName('private')
        .setNameLocalizations(localeManager.getLocalizations('utility.room.options.private.name'))
        .setDescription(localeManager.get('utility.room.options.private.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.private.description'))
    )
    .addSubcommand(sub =>
      sub
        .setName('public')
        .setNameLocalizations(localeManager.getLocalizations('utility.room.options.public.name'))
        .setDescription(localeManager.get('utility.room.options.public.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.room.options.public.description'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const cfg = Sdb.getSettings(guildId);
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return await interaction.reply({
        content: localeManager.get('utility.room.messages.not_in_voice', lang),
        flags: MessageFlags.Ephemeral
      });
    }

    if (channel.parentId !== cfg.voiceCategoryId || channel.id === cfg.mainVoiceChannelId) {
      return await interaction.reply({
        content: localeManager.get('utility.room.messages.not_dynamic', lang),
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({
        content: localeManager.get('utility.room.messages.not_creator', lang),
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      switch (sub) {
        case 'rename': {
          const newName = interaction.options.getString('name');
          await channel.setName(newName);
          return await interaction.reply({
            content: localeManager.get('utility.room.messages.renamed', lang, { newName }),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'limit': {
          const num = interaction.options.getInteger('number');
          await channel.setUserLimit(num);
          const content = num === 0 
            ? localeManager.get('utility.room.messages.limit_reset', lang)
            : localeManager.get('utility.room.messages.limit_set', lang, { num });
          return await interaction.reply({
            content: content,
            flags: MessageFlags.Ephemeral
          });
        }
        case 'lock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: false
          });
          return await interaction.reply({
            content: localeManager.get('utility.room.messages.locked', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'unlock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: true
          });
          return await interaction.reply({
            content: localeManager.get('utility.room.messages.unlocked', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'private': {
          if (!cfg.allowedRoleId) {
            return await interaction.reply({
              content: localeManager.get('utility.room.messages.private_role_not_set', lang),
              flags: MessageFlags.Ephemeral
            });
          }
          // Сначала скрываем ото всех
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            ViewChannel: false,
            Connect: false
          });
          // Затем даем доступ нужной роли
          await channel.permissionOverwrites.create(cfg.allowedRoleId, {
            ViewChannel: true,
            Connect: true
          });
          return await interaction.reply({
            content: localeManager.get('utility.room.messages.made_private', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'public': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            ViewChannel: true,
            Connect: true
          });
          
          if (cfg.allowedRoleId) {
            const roleOverwrite = channel.permissionOverwrites.cache.get(cfg.allowedRoleId);
            if (roleOverwrite) {
              await roleOverwrite.delete();
            }
          }
          
          return await interaction.reply({
            content: localeManager.get('utility.room.messages.made_public', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        default:
          return await interaction.reply({
            content: localeManager.get('utility.room.messages.unknown_sub', lang),
            flags: MessageFlags.Ephemeral
          });
      }
    } catch (err) {
      console.error('[ERROR] /room command failed:', err);
      const errorMsg = localeManager.get('utility.room.messages.error', lang);
      if (interaction.replied || interaction.deferred) {
        return await interaction.followUp({
            content: errorMsg,
            flags: MessageFlags.Ephemeral
        });
      }
      return await interaction.reply({
        content: errorMsg,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};