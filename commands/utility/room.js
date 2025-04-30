// commands/room.js
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Settings = require('../../functions/db/settings');
const Sdb = new Settings('./database/settings.db');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('room')
    .setDescription('Управление вашей динамической голосовой комнатой')
    .addSubcommand(sub =>
      sub
        .setName('rename')
        .setDescription('Переименовать комнату')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('Новое название')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('limit')
        .setDescription('Установить лимит участников')
        .addIntegerOption(opt =>
          opt
            .setName('number')
            .setDescription('Максимальное число участников (0 — без лимита)')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('lock')
        .setDescription('Закрыть комнату для всех')
    )
    .addSubcommand(sub =>
      sub
        .setName('unlock')
        .setDescription('Открыть комнату для всех')
    )
    .addSubcommand(sub =>
      sub
        .setName('private')
        .setDescription('Сделать комнату приватной (только для роли)')
    )
    .addSubcommand(sub =>
      sub
        .setName('public')
        .setDescription('Сделать комнату публичной')
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
