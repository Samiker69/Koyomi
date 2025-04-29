const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags
  } = require('discord.js');
  const Database = require('better-sqlite3');
  const path = require('path');
  
  // Инициализация БД и таблицы
  const dbPath = path.resolve(__dirname, '../../database/tags.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = "WAL"');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      serverId TEXT NOT NULL,
      name     TEXT NOT NULL,
      content  TEXT NOT NULL,
      PRIMARY KEY (serverId, name)
    );
  `);
  
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
  
            const exists = db.prepare(
              'SELECT 1 FROM tags WHERE serverId = ? AND name = ?'
            ).get(guildId, name);
  
            if (exists) {
              return interaction.reply({
                content: `Тег \`${name}\` уже существует.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            db.prepare(
              'INSERT INTO tags(serverId, name, content) VALUES(?, ?, ?)'
            ).run(guildId, name, content);
  
            return interaction.reply({
              content: `Тег \`${name}\` создан.`,
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'remove': {
            const name = interaction.options.getString('name').toLowerCase();
            const result = db.prepare(
              'DELETE FROM tags WHERE serverId = ? AND name = ?'
            ).run(guildId, name);
  
            if (result.changes === 0) {
              return interaction.reply({
                content: `Тег \`${name}\` не найден.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            return interaction.reply({
              content: `Тег \`${name}\` удалён.`,
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'edit': {
            const name = interaction.options.getString('name').toLowerCase();
            const newContent = interaction.options.getString('content');
            const result = db.prepare(
              'UPDATE tags SET content = ? WHERE serverId = ? AND name = ?'
            ).run(newContent, guildId, name);
  
            if (result.changes === 0) {
              return interaction.reply({
                content: `Тег \`${name}\` не найден.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            return interaction.reply({
              content: `Содержимое тега \`${name}\` обновлено.`,
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'get': {
            const name = interaction.options.getString('name').toLowerCase();
            const row = db.prepare(
              'SELECT content FROM tags WHERE serverId = ? AND name = ?'
            ).get(guildId, name);
  
            if (!row) {
              return interaction.reply({
                content: `Тег \`${name}\` не найден.`,
                flags: MessageFlags.Ephemeral
              });
            }
  
            const embed = new EmbedBuilder()
              .setTitle(`Тег: ${name}`)
              .setDescription(row.content)
              .setColor(0x9B59B6);
  
            return interaction.reply({ embeds: [embed] });
          }
  
          case 'list': {
            const rows = db.prepare(
              'SELECT name FROM tags WHERE serverId = ? ORDER BY name'
            ).all(guildId);
  
            if (rows.length === 0) {
              return interaction.reply({
                content: 'На этом сервере нет тегов.',
                flags: MessageFlags.Ephemeral
              });
            }
  
            const embed = new EmbedBuilder()
              .setTitle('Список тегов')
              .setDescription(rows.map(r => `\`${r.name}\``).join(', '))
              .setColor(0x9B59B6);
  
            return interaction.reply({ embeds: [embed] });
          }
  
          default:
            return interaction.reply({
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
  