const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags
  } = require('discord.js');
  const path = require('path');
const TagsDB = require('../../functions/db/tags');

const tags = new TagsDB(path.resolve(__dirname, '../../database/tags.db'))
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('tag')
      .setDescription('Управление тегами (мини-справочник)')
      .addSubcommand(sub =>
        sub
          .setName('add')
          .setDescription('Создать новый тег')
          .addStringOption(o =>
            o.setName('name')
             .setDescription('Уникальное имя тега')
             .setRequired(true)
          )
          .addStringOption(o =>
            o.setName('content')
             .setDescription('Содержимое тега')
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('remove')
          .setDescription('Удалить существующий тег')
          .addStringOption(o =>
            o.setName('name')
             .setDescription('Имя тега для удаления')
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('edit')
          .setDescription('Изменить содержимое тега')
          .addStringOption(o =>
            o.setName('name')
             .setDescription('Имя тега для редактирования')
             .setRequired(true)
          )
          .addStringOption(o =>
            o.setName('content')
             .setDescription('Новое содержимое тега')
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('get')
          .setDescription('Показать содержимое тега')
          .addStringOption(o =>
            o.setName('name')
             .setDescription('Имя тега')
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('list')
          .setDescription('Показать все теги сервера')
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
    async execute(interaction) {
      const sub = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
  
      try {
        switch (sub) {
          case 'add': {
            const name = interaction.options.getString('name').toLowerCase();
            const content = interaction.options.getString('content');
  
            const exists = tags.add(guildId, name, content)
  
            if (!exists) {
              return await interaction.reply({
                content: `Тег \`${name}\` уже существует.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            return await interaction.reply({
              content: `Тег \`${name}\` создан.`,
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'remove': {
            const name = interaction.options.getString('name').toLowerCase();
            const result = tags.remove(guildId, name)
  
            if (!result) {
              return await interaction.reply({
                content: `Тег \`${name}\` не найден.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            return await interaction.reply({
              content: `Тег \`${name}\` удалён.`,
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'edit': {
            const name = interaction.options.getString('name').toLowerCase();
            const newContent = interaction.options.getString('content');
            const result = tags.edit(guildId, name, { content: newContent} )
  
            if (!result) {
              return await interaction.reply({
                content: `Тег \`${name}\` не найден или ничего не изменено.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            return await interaction.reply({
              content: `Содержимое тега \`${name}\` обновлено.`,
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'get': {
            const name = interaction.options.getString('name').toLowerCase();
            const row = tags.get(guildId, name)
  
            if (!row) {
              return await interaction.reply({
                content: `Тег \`${name}\` не найден.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            const embed = new EmbedBuilder()
              .setTitle(`Тег: ${name}`)
              .setDescription(row.content)
              .setColor(0x9B59B6);
  
            return await interaction.reply({ embeds: [embed] });
          }
  
          case 'list': {
            const rows = tags.db
              .prepare('SELECT name, content FROM tags WHERE serverId = ? ORDER BY name')
              .all(guildId);
          
            if (rows.length === 0) {
              return interaction.reply({
                content: 'На этом сервере нет тегов.',
                flags: MessageFlags.Ephemeral
              });
            }
          
            const description = rows
              .map(r => {
                const preview = r.content.length > 50
                  ? r.content.slice(0, 47) + '...'
                  : r.content;
                return `\`${r.name}\` — ${preview}`;
              })
              .join('\n');
          
            const embed = new EmbedBuilder()
              .setTitle('Список тегов')
              .setDescription(description)
              .setColor(0x9B59B6);
          
            return interaction.reply({ embeds: [embed] });
          }          
  
          default:
            return await interaction.reply({
              content: 'Неизвестная подкоманда.',
              flags: MessageFlags.Ephemeral
            });
        }
      } catch (err) {
        console.error('[ERROR] /tag:', err);
        return interaction.reply({
          content: 'Произошла ошибка при выполнении команды.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  };
  