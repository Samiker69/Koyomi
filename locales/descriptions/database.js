const database = {
  "settings": {
    "errors": {
      "init": {
        "en-US": "Database initialization error:",
        "ru": "Ошибка инициализации базы данных:",
        "uk": "Помилка ініціалізації бази даних:"
      },
      "invalid_guild_id": {
        "en-US": "{method}: invalid guildId provided:",
        "ru": "{method}: Предоставлен неверный guildId:",
        "uk": "{method}: Надано некоректний guildId:"
      },
      "get_settings": {
        "en-US": "Error getting settings for guild {guildId}:",
        "ru": "Ошибка получения настроек для сервера {guildId}:",
        "uk": "Помилка отримання налаштувань для сервера {guildId}:"
      },
      "guild_id_required": {
        "en-US": "{method}: guildId must be a non-empty string.",
        "ru": "{method}: guildId должен быть непустой строкой.",
        "uk": "{method}: guildId має бути непорожнім рядком."
      },
      "add_server": {
        "en-US": "Error adding guild {guildId}:",
        "ru": "Ошибка добавления сервера {guildId}:",
        "uk": "Помилка додавання сервера {guildId}:"
      },
      "remove_server": {
        "en-US": "Error deleting guild {guildId}:",
        "ru": "Ошибка удаления сервера {guildId}:",
        "uk": "Помилка видалення сервера {guildId}:"
      },
      "invalid_setting": {
        "en-US": "Invalid setting name: {settingName}. Allowed: {allowed}",
        "ru": "Недопустимое имя настройки: {settingName}. Допустимые: {allowed}",
        "uk": "Неприпустима назва налаштування: {settingName}. Доступні: {allowed}"
      },
      "statement_not_found": {
        "en-US": "Prepared statement for '{settingName}' was not found.",
        "ru": "Подготовленный запрос для '{settingName}' не найден.",
        "uk": "Підготовлений запит для '{settingName}' не знайдено."
      },
      "update_setting": {
        "en-US": "Error updating setting '{settingName}' for guild {guildId}:",
        "ru": "Ошибка обновления настройки '{settingName}' для сервера {guildId}:",
        "uk": "Помилка оновлення налаштування '{settingName}' для сервера {guildId}:"
      }
    }
  }
};

module.exports = {
  database
};
