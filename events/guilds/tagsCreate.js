// events/messageCreate.js
const { Events } = require('discord.js');
const Database = require('better-sqlite3');
const SettingsDatabase = require('../../functions/db/settings');

const settings = new SettingsDatabase()

const db = new Database('./database/settings.db');
db.pragma('journal_mode = WAL');


module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Игнорируем ботов и DMs
    if (message.author.bot || !message.guild) return;

    const PREFIX = settings.getSettings(message.guild.id).prefix
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
        return await message.channel.send(row.content);
      }
    } catch (err) {
      console.error('[ERROR] messageCreate tag lookup:', err);
    }
  }
};
