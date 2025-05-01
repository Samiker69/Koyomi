const moderation = {
  "case": {
    "description": {
      "en-US": "Moderation case actions",
      "ru": "ъ",
      "uk": "Дії з модераційними кейсами"
    },
    "options": {
      "num": {
        "description": {
          "en-US": "Case number",
          "ru": "Номер кейса",
          "uk": "Номер кейсу"
        }
      },
      "reason": {
        "description": {
          "en-US": "Specify the reason",
          "ru": "Укажите причину",
          "uk": "Вкажіть причину"
        }
      },
      "user": {
        "description": {
          "en-US": "User to check punishments for",
          "ru": "Пользователь для проверки наказаний",
          "uk": "Користувач для перевірки покарань"
        }
      }
    }
  },
  "message": {
    "description": {
      "en-US": "Moderation command for managing messages",
      "ru": "Команда для управления сообщениями",
      "uk": "Модераційна команда для роботи з повідомленнями"
    },
    "options": {
      "amount": {
        "description": {
          "en-US": "Number of messages to delete (1 to 100)",
          "ru": "Количество сообщений для удаления (от 1 до 100)",
          "uk": "Кількість повідомлень для видалення (від 1 до 100)"
        }
      },
      "id": {
        "description": {
          "en-US": "Message ID",
          "ru": "Айди сообщения",
          "uk": "ID повідомлення"
        }
      },
      "emoji": {
        "description": {
          "en-US": "Emoji to react with",
          "ru": "Эмодзи для реакции",
          "uk": "Емодзі для реакції"
        }
      },
      "target": {
        "description": {
          "en-US": "User whose messages should be deleted",
          "ru": "Пользователь, чьи сообщения нужно удалить",
          "uk": "Користувач, чиї повідомлення потрібно видалити"
        }
      }
    }
  },
  "moderation": {
    "description": {
      "en-US": "All moderation-related commands",
      "ru": "all mod-type command",
      "uk": "Усі команди для модерації"
    },
    "options": {
      "user": {
        "description": {
          "en-US": "User to unmute",
          "ru": "Пользователь, у которого снимают мут",
          "uk": "Користувач, якого потрібно розглушити"
        }
      },
      "reason": {
        "description": {
          "en-US": "Reason for unmute or unban",
          "ru": "Причина снятия мута",
          "uk": "Причина зняття мута"
        }
      },
      "evidence": {
        "description": {
          "en-US": "Attach evidence (if available)",
          "ru": "Прикрепите доказательства (если есть)",
          "uk": "Додайте докази (якщо є)"
        }
      },
      "time": {
        "description": {
          "en-US": "Mute duration in minutes (max 40320 = 28 days)",
          "ru": "Длительность мута в минутах (макс. 40320, то есть 28 дней)",
          "uk": "Тривалість мута в хвилинах (макс. 40320 = 28 днів)"
        }
      },
      "userid": {
        "description": {
          "en-US": "User ID to unban",
          "ru": "ID пользователя для разбанивания",
          "uk": "ID користувача для розбану"
        }
      }
    }
  },
  "tag": {
    "description": {
      "en-US": "Manage mini-reference tags",
      "ru": "Управление тегами (мини-справочник)",
      "uk": "Керування тегами (мінідовідник)"
    },
    "options": {
      "name": {
        "description": {
          "en-US": "Tag name",
          "ru": "Имя тега",
          "uk": "Назва тега"
        }
      },
      "content": {
        "description": {
          "en-US": "New content of the tag",
          "ru": "Новое содержимое тега",
          "uk": "Нове наповнення тега"
        }
      }
    }
  }
}

module.exports = {
	moderation
}