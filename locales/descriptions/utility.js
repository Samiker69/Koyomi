const utility = {
  "botstatus": {
    "description": {
      "en-US": "Shows bot status",
      "ru": "Показывает статус бота",
      "uk": "Показує статус бота"
    },
    "options": {}
  },
  "guild": {
    "description": {
      "en-US": "Guild admin command",
      "ru": "guild admin command",
      "uk": "Адмін-команда для сервера"
    },
    "options": {
      "value": {
        "description": {
          "en-US": "Content Filter Level",
          "ru": "choice Content Filter Level",
          "uk": "Рівень фільтра контенту"
        }
      },
      "image": {
        "description": {
          "en-US": "Set server icon image",
          "ru": "set image for server icon",
          "uk": "Змінити іконку сервера"
        }
      },
      "text": {
        "description": {
          "en-US": "Set server name",
          "ru": "set server name",
          "uk": "Змінити назву сервера"
        }
      },
      "input": {
        "description": {
          "en-US": "Set level: 0 - none, 4 - very high",
          "ru": "set level. 0 - none, 4 - very high",
          "uk": "Встановити рівень: 0 — немає, 4 — дуже високий"
        }
      }
    }
  },
  "help": {
    "description": {
      "en-US": "Show command list with pagination and subcommands",
      "ru": "Показать список команд с пагинацией и учётом подкоманд",
      "uk": "Показати список команд з пагінацією та підкомандами"
    },
    "options": {}
  },
  "info": {
    "description": {
      "en-US": "Commands to retrieve information",
      "ru": "Команды для получения информации",
      "uk": "Команди для отримання інформації"
    },
    "options": {
      "target": {
        "description": {
          "en-US": "User (optional)",
          "ru": "Пользователь (необязательно)",
          "uk": "Користувач (необов’язково)"
        }
      }
    }
  },
  "role": {
    "description": {
      "en-US": "Role editor command",
      "ru": "role editor command",
      "uk": "Команда для редагування ролей"
    },
    "options": {
      "role": {
        "description": {
          "en-US": "Select role or enter role ID",
          "ru": "Select role or text role id",
          "uk": "Виберіть роль або введіть ID"
        }
      },
      "reason": {
        "description": {
          "en-US": "Reason for role editing",
          "ru": "The reason for editing this role",
          "uk": "Причина редагування ролі"
        }
      },
      "color": {
        "description": {
          "en-US": "Role color (hex or decimal)",
          "ru": "The color of the role, either a hex string or a base 10 number",
          "uk": "Колір ролі (hex або десятковий)"
        }
      },
      "hoist": {
        "description": {
          "en-US": "Display role separately",
          "ru": "Whether or not the role should be hoisted",
          "uk": "Відображати роль окремо"
        }
      },
      "icon": {
        "description": {
          "en-US": "Icon for the role",
          "ru": "The icon for the role",
          "uk": "Іконка ролі"
        }
      },
      "mentionable": {
        "description": {
          "en-US": "Allow mentioning the role",
          "ru": "Whether or not the role should be mentionable",
          "uk": "Чи можна згадувати роль"
        }
      },
      "name": {
        "description": {
          "en-US": "Role name",
          "ru": "The name of the role",
          "uk": "Назва ролі"
        }
      },
      "permissions": {
        "description": {
          "en-US": "Role permissions",
          "ru": "The permissions of the role",
          "uk": "Права ролі"
        }
      },
      "position": {
        "description": {
          "en-US": "Position in role hierarchy",
          "ru": "The position of the role",
          "uk": "Позиція в ієрархії ролей"
        }
      },
      "unicodeemoji": {
        "description": {
          "en-US": "Unicode emoji for the role",
          "ru": "The unicode emoji for the role",
          "uk": "Юнікод емодзі для ролі"
        }
      }
    }
  },
  "room": {
    "description": {
      "en-US": "Manage your dynamic voice room",
      "ru": "Управление вашей динамической голосовой комнатой",
      "uk": "Керування вашою динамічною голосовою кімнатою"
    },
    "options": {
      "name": {
        "description": {
          "en-US": "New room name",
          "ru": "Новое название",
          "uk": "Нова назва кімнати"
        }
      },
      "number": {
        "description": {
          "en-US": "Max number of participants (0 = unlimited)",
          "ru": "Максимальное число участников (0 — без лимита)",
          "uk": "Максимальна кількість учасників (0 — без обмежень)"
        }
      }
    }
  },
  "settings": {
    "description": {
      "en-US": "Change bot settings",
      "ru": "Изменить настройки бота",
      "uk": "Змінити налаштування бота"
    },
    "options": {
      "channel": {
        "description": {
          "en-US": "Main voice channel",
          "ru": "Основной войс",
          "uk": "Основний голосовий канал"
        }
      },
      "bool": {
        "description": {
          "en-US": "Enable/disable",
          "ru": "включить/выключить",
          "uk": "Увімкнути / вимкнути"
        }
      },
      "category": {
        "description": {
          "en-US": "Category",
          "ru": "Категория",
          "uk": "Категорія"
        }
      }
    }
  },
  "user": {
    "description": {
      "en-US": "Info about user",
      "ru": "info about target",
      "uk": "Інформація про користувача"
    },
    "options": {
      "target": {
        "description": {
          "en-US": "Select a user",
          "ru": "select a user",
          "uk": "Виберіть користувача"
        }
      },
      "channel": {
        "description": {
          "en-US": "Move user to another voice channel",
          "ru": "Moves the member to a different channel",
          "uk": "Перемістити користувача до іншого каналу"
        }
      },
      "deaf": {
        "description": {
          "en-US": "Deafen/undeafen the user",
          "ru": "Deafens/undeafens the member of this voice state.",
          "uk": "Заглушити / зняти заглушення користувача"
        }
      },
      "mute": {
        "description": {
          "en-US": "Mute/unmute the user",
          "ru": "Mutes/unmutes the member of this voice state.",
          "uk": "Увімкнути / вимкнути мікрофон користувача"
        }
      },
      "kick": {
        "description": {
          "en-US": "Kick user from voice",
          "ru": "Кикает участника из войса",
          "uk": "Викинути користувача з голосового"
        }
      },
      "role": {
        "description": {
          "en-US": "Select a role",
          "ru": "select a role",
          "uk": "Вибрати роль"
        }
      }
    }
  }
}

module.exports = {
	utility
}