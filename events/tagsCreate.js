// events/messageCreate.js
const { Events } = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

const PREFIX = '?';  // префикс

// Инициализация БД (тот же файл, что и в slash-команде)
const dbPath = path.resolve(__dirname, '../database/tags.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Игнорируем ботов и DMs
    if (message.author.bot || !message.guild) return;

    const content = message.content.trim();
    if (!content.startsWith(PREFIX)) return;

    const [ rawTagName, ...rest ] = content.slice(PREFIX.length).split(/\s+/);
    const tagName = rawTagName.toLowerCase();
    if (!tagName) return;

    // Пытаемся найти тег в БД
    try {
      const row = db.prepare(
        'SELECT content FROM tags WHERE serverId = ? AND name = ?'
      ).get(message.guild.id, tagName);

      if (row) {
        // Если тег найден — выводим его содержимое
        return message.channel.send(row.content);
      }
      // Если тега нет — ничего не отвечаем (или можно выводить ошибку)
      // return message.channel.send(`❗ Тег \`${tagName}\` не найден.`);
    } catch (err) {
      console.error('[ERROR] messageCreate tag lookup:', err);
    }
  }
};
