// commands/room.js
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Settings = require('../../functions/db/settings');
const LocaleManager = require('../../locales/localesManager');

const Sdb = new Settings();
const localeManager = new LocaleManager();

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName(localeManager.getString('commands.room.name'))
    .setDescription(localeManager.getString('commands.room.description'))
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.room.options.rename.name'))
        .setDescription(localeManager.getString('commands.room.options.rename.description'))
        .addStringOption(opt =>
          opt
            .setName(localeManager.getString('commands.room.options.rename.options.name.name'))
            .setDescription(localeManager.getString('commands.room.options.rename.options.name.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.room.options.limit.name'))
        .setDescription(localeManager.getString('commands.room.options.limit.description'))
        .addIntegerOption(opt =>
          opt
            .setName(localeManager.getString('commands.room.options.limit.options.number.name'))
            .setDescription(localeManager.getString('commands.room.options.limit.options.number.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.room.options.lock.name'))
        .setDescription(localeManager.getString('commands.room.options.lock.description'))
    )
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.room.options.unlock.name'))
        .setDescription(localeManager.getString('commands.room.options.unlock.description'))
    )
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.room.options.private.name'))
        .setDescription(localeManager.getString('commands.room.options.private.description'))
    )
    .addSubcommand(sub =>
      sub
        .setName(localeManager.getString('commands.room.options.public.name'))
        .setDescription(localeManager.getString('commands.room.options.public.description'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const cfg = Sdb.getSettings(guildId);
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return await interaction.reply({
        content: 'Вы не находитесь в голосовом канале.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (channel.parentId !== cfg.voiceCategoryId || channel.id === cfg.mainVoiceChannelId) {
      return await interaction.reply({
        content: 'Это не динамическая комната.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Проверяем, что пользователь — тот, кому бот выдал право ManageChannels при создании
    if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({
        content: 'Только создатель этой комнаты может управлять её настройками.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      switch (sub) {
        case 'rename': {
          const newName = interaction.options.getString('name');
          await channel.setName(newName);
          return await interaction.reply({
            content: `Название комнаты изменено на «${newName}».`,
            flags: MessageFlags.Ephemeral
          });
        }
        case 'limit': {
          const num = interaction.options.getInteger('number');
          await channel.setUserLimit(num);
          return await interaction.reply({
            content: `Лимит участников установлен: ${num}.`,
            flags: MessageFlags.Ephemeral
          });
        }
        case 'lock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: false,
            ViewChannel: false
          });
          return await interaction.reply({
            content: 'Комната закрыта для всех, кроме вас.',
            flags: MessageFlags.Ephemeral
          });
        }
        case 'unlock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: true,
            ViewChannel: true
          });
          return await interaction.reply({
            content: 'Комната открыта для всех.',
            flags: MessageFlags.Ephemeral
          });
        }
        case 'private': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: false,
            ViewChannel: false
          });
          if (cfg.allowedRoleId) {
            await channel.permissionOverwrites.create(cfg.allowedRoleId, {
              Connect: true,
              ViewChannel: true
            });
          }
          return await interaction.reply({
            content: 'Комната сделана приватной для указанной роли.',
            flags: MessageFlags.Ephemeral
          });
        }
        case 'public': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: true,
            ViewChannel: true
          });
          return await interaction.reply({
            content: 'Комната сделана публичной.',
            flags: MessageFlags.Ephemeral
          });
        }
        default:
          return await interaction.reply({
            content: 'Неизвестная подкоманда.',
            flags: MessageFlags.Ephemeral
          });
      }
    } catch (err) {
      console.error('[ERROR] room command:', err);
      return await interaction.reply({
        content: 'Произошла ошибка при выполнении команды.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
