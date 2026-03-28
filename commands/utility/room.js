const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Settings = require('../../functions/db/settings');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const Sdb = new Settings();

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
    .setName('room')
    .setDescription('Управление вашей динамической голосовой комнатой')
    .setDescriptionLocalizations(utility.room.description)
    .addSubcommand(sub =>
      sub
        .setName('rename')
        .setDescription('Переименовать комнату')
        .setDescriptionLocalizations(utility.room.subcommands.rename.description)
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('Новое название')
            .setDescriptionLocalizations(utility.room.options.name.description)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('limit')
        .setDescription('Установить лимит участников')
        .setDescriptionLocalizations(utility.room.subcommands.limit.description)
        .addIntegerOption(opt =>
          opt
            .setName('number')
            .setDescription('Максимальное число участников (0 — без лимита)')
            .setDescriptionLocalizations(utility.room.options.number.description)
            .setRequired(true)
            .setMinValue(0) // Добавлено минимальное значение для ясности
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('lock')
        .setDescription('Закрыть комнату (запретить подключение для @everyone)')
        .setDescriptionLocalizations(utility.room.subcommands.lock.description)
    )
    .addSubcommand(sub =>
      sub
        .setName('unlock')
        .setDescription('Открыть комнату (разрешить подключение для @everyone)')
        .setDescriptionLocalizations(utility.room.subcommands.unlock.description)
    )
    .addSubcommand(sub =>
      sub
        .setName('private')
        .setDescription('Сделать комнату приватной (видимой только для роли)')
        .setDescriptionLocalizations(utility.room.subcommands.private.description)
    )
    .addSubcommand(sub =>
      sub
        .setName('public')
        .setDescription('Сделать комнату публичной (видимой для всех)')
        .setDescriptionLocalizations(utility.room.subcommands.public.description)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const cfg = Sdb.getSettings(guildId);
    const channel = interaction.member.voice.channel;
    const loc = interaction.locale;

    if (!channel) {
      return await interaction.reply({
        content: getReply('room_not_in_voice', loc),
        flags: MessageFlags.Ephemeral
      });
    }

    if (channel.parentId !== cfg.voiceCategoryId || channel.id === cfg.mainVoiceChannelId) {
      return await interaction.reply({
        content: getReply('room_not_yours', loc),
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
      return await interaction.reply({
        content: getReply('room_not_creator', loc),
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      switch (sub) {
        case 'rename': {
          const newName = interaction.options.getString('name');
          await channel.setName(newName);
          return await interaction.reply({
            content: getReply('room_renamed', loc, { newName: newName }),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'limit': {
          const num = interaction.options.getInteger('number');
          await channel.setUserLimit(num);
          return await interaction.reply({
            content: num === 0 ? getReply('room_limit_removed', loc) : getReply('room_limit_set', loc, { num: num }),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'lock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: false
          });
          return await interaction.reply({
            content: getReply('room_locked', loc),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'unlock': {
          await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: true
          });
          return await interaction.reply({
            content: getReply('room_unlocked', loc),
            flags: MessageFlags.Ephemeral
          });
        }
        case 'private': {
          if (!cfg.allowedRoleId) {
            return await interaction.reply({
              content: getReply('room_no_private_role', loc),
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
            content: getReply('room_made_private', loc),
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
            content: getReply('room_made_public', loc),
            flags: MessageFlags.Ephemeral
          });
        }
        default:
          return await interaction.reply({
            content: getReply('unknown_subcommand', loc),
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