// commands/room.js
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Settings = require('../../functions/db/settings');
const Sdb = new Settings();

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
            .setMinValue(0) // Добавлено минимальное значение для ясности
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('lock')
        .setDescription('Закрыть комнату (запретить подключение для @everyone)')
    )
    .addSubcommand(sub =>
      sub
        .setName('unlock')
        .setDescription('Открыть комнату (разрешить подключение для @everyone)')
    )
    .addSubcommand(sub =>
      sub
        .setName('private')
        .setDescription('Сделать комнату приватной (видимой только для роли)')
    )
    .addSubcommand(sub =>
      sub
        .setName('public')
        .setDescription('Сделать комнату публичной (видимой для всех)')
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
        content: 'Эту команду можно использовать только в созданной вами динамической комнате.',
        flags: MessageFlags.Ephemeral
      });
    }

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
            content: num === 0 ? 'Лимит участников снят.' : `Лимит участников установлен: ${num}.`,
            flags: MessageFlags.Ephemeral
          });
        }
        case 'lock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: false
          });
          return await interaction.reply({
            content: 'Комната закрыта. Никто (кроме вас) не сможет подключиться.',
            flags: MessageFlags.Ephemeral
          });
        }
        case 'unlock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: true
          });
          return await interaction.reply({
            content: 'Комната открыта для подключения.',
            flags: MessageFlags.Ephemeral
          });
        }
        case 'private': {
          if (!cfg.allowedRoleId) {
            return await interaction.reply({
              content: 'Ошибка: Приватная роль не настроена в конфигурации бота.',
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
            content: 'Комната сделана приватной и видна только избранной роли.',
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
            content: 'Комната сделана публичной и видна всем.',
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
      console.error('[ERROR] /room command failed:', err);
      if (interaction.replied || interaction.deferred) {
        return await interaction.followUp({
            content: 'Произошла ошибка при выполнении команды.',
            flags: MessageFlags.Ephemeral
        });
      }
      return await interaction.reply({
        content: 'Произошла ошибка при выполнении команды.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};