const utility = {
  "botstatus": {
    "description": {
      "en-US": "Shows the bot's status",
      "ru": "Показывает статус бота",
      "uk": "Показує статус бота"
    }
  },
  "guild": {
    "description": {
      "en-US": "Guild admin command",
      "ru": "Админ-команда для сервера",
      "uk": "Адмін-команда для сервера"
    },
    "subcommands": {
      "invites": {
        "description": {
          "en-US": "Disable or enable invites for the guild",
          "ru": "Отключить или включить приглашения на сервер",
          "uk": "Вимкнути або увімкнути запрошення на сервер"
        }
      },
      "banner": {
        "description": {
          "en-US": "Change the server banner",
          "ru": "Изменить баннер сервера",
          "uk": "Змінити банер сервера"
        }
      },
      "icon": {
        "description": {
          "en-US": "Change the server icon",
          "ru": "Изменить иконку сервера",
          "uk": "Змінити іконку сервера"
        }
      },
      "contentfilterlevel": {
        "description": {
          "en-US": "Change the server Content Filter Level",
          "ru": "Изменить уровень фильтра откровенного контента на сервере",
          "uk": "Змінити рівень фільтра відвертого контенту на сервері"
        }
      },
      "name": {
        "description": {
          "en-US": "Change the server name",
          "ru": "Изменить название сервера",
          "uk": "Змінити назву сервера"
        }
      },
      "rulechannel": {
        "description": {
          "en-US": "Change the server rule channel",
          "ru": "Изменить канал для правил сервера (только Community)",
          "uk": "Змінити канал для правил сервера (тільки Community)"
        }
      },
      "safetyalerts": {
        "description": {
          "en-US": "Change the server safety alerts channel",
          "ru": "Изменить канал оповещений безопасности (только Community)",
          "uk": "Змінити канал сповіщень безпеки (тільки Community)"
        }
      },
      "systemchannel": {
        "description": {
          "en-US": "Change the server system channel",
          "ru": "Изменить системный канал сервера",
          "uk": "Змінити системний канал сервера"
        }
      },
      "verificationlevel": {
        "description": {
          "en-US": "Change the server verification level",
          "ru": "Изменить уровень верификации на сервере",
          "uk": "Змінити рівень верифікації на сервері"
        }
      }
    },
    "options": {
      "value_invites": {
        "description": {
          "en-US": "true - disable, false - enable",
          "ru": "true - отключить, false - включить",
          "uk": "true - вимкнути, false - увімкнути"
        }
      },
      "value_cfl": {
        "description": {
          "en-US": "Content Filter Level",
          "ru": "Уровень фильтра контента",
          "uk": "Рівень фільтра контенту"
        }
      },
      "image": {
        "description": {
          "en-US": "Set server image",
          "ru": "Изображение для сервера",
          "uk": "Зображення для сервера"
        }
      },
      "text": {
        "description": {
          "en-US": "Set server text",
          "ru": "Текст (название) для сервера",
          "uk": "Текст (назва) для сервера"
        }
      },
      "input_channel": {
        "description": {
          "en-US": "Select channel",
          "ru": "Укажите канал",
          "uk": "Вкажіть канал"
        }
      },
      "input_level": {
        "description": {
          "en-US": "Set level: 0 - none, 4 - very high",
          "ru": "Уровень от 0 (нет) до 4 (очень высокий)",
          "uk": "Рівень від 0 (немає) до 4 (дуже високий)"
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
  info: {
    description: {
      "en-US": "Commands to retrieve information",
      ru: "Команды для получения информации",
      uk: "Команди для отримання інформації"
    },
    subcommands: {
      userinfo: {
        description: {
          "en-US": "User information",
          ru: "Информация о пользователе",
          uk: "Інформація про користувача"
        }
      },
      serverinfo: {
        description: {
          "en-US": "Server information",
          ru: "Информация о сервере",
          uk: "Інформація про сервер"
        }
      }
    },
    options: {
      target: {
        description: {
          "en-US": "User (optional)",
          ru: "Пользователь (необязательно)",
          uk: "Користувач (необов’язково)"
        }
      }
    }
  },
  "role": {
    "description": {
      "en-US": "Role editor command",
      "ru": "Команда для редактирования ролей",
      "uk": "Команда для редагування ролей"
    },
    "subcommands": {
      "delete": {
        "description": {
          "en-US": "Deletes the role",
          "ru": "Удаляет роль",
          "uk": "Видаляє роль"
        }
      },
      "edit": {
        "description": {
          "en-US": "Create or edit the role",
          "ru": "Создать или изменить роль",
          "uk": "Створити або змінити роль"
        }
      },
      "create": {
        "description": {
          "en-US": "Create the role",
          "ru": "Создать роль",
          "uk": "Створити роль"
        }
      },
      "info": {
        "description": {
          "en-US": "send embed-message about role",
          "ru": "Отправить эмбед с информацией о роли",
          "uk": "Відправити ембед з інформацією про роль"
        }
      }
    },
    "options": {
      "role": {
        "description": {
          "en-US": "Select role or enter role ID",
          "ru": "Выберите роль или введите ID роли",
          "uk": "Виберіть роль або введіть ID ролі"
        }
      },
      "reason": {
        "description": {
          "en-US": "Reason for role editing",
          "ru": "Причина изменения роли",
          "uk": "Причина зміни ролі"
        }
      },
      "color": {
        "description": {
          "en-US": "Role color (hex or decimal)",
          "ru": "Цвет роли (hex строка или число)",
          "uk": "Колір ролі (hex рядок або число)"
        }
      },
      "hoist": {
        "description": {
          "en-US": "Display role separately",
          "ru": "Отображать роль отдельно от других",
          "uk": "Відображати роль окремо від інших"
        }
      },
      "icon": {
        "description": {
          "en-US": "Icon for the role",
          "ru": "Иконка для роли",
          "uk": "Іконка для ролі"
        }
      },
      "mentionable": {
        "description": {
          "en-US": "Allow mentioning the role",
          "ru": "Разрешить всем упоминать роль",
          "uk": "Дозволити всім згадувати роль"
        }
      },
      "name": {
        "description": {
          "en-US": "Role name",
          "ru": "Название роли",
          "uk": "Назва ролі"
        }
      },
      "permissions": {
        "description": {
          "en-US": "Role permissions",
          "ru": "Права роли",
          "uk": "Права ролі"
        }
      },
      "position": {
        "description": {
          "en-US": "Position in role hierarchy",
          "ru": "Позиция роли в иерархии",
          "uk": "Позиція ролі в ієрархії"
        }
      },
      "unicodeemoji": {
        "description": {
          "en-US": "Unicode emoji for the role",
          "ru": "Unicode эмодзи для роли",
          "uk": "Unicode емодзі для ролі"
        }
      }
    }
  },
  "rolemenu": {
    "description": {
      "en-US": "Create or update a role selection menu message.",
      "ru": "Создать или обновить сообщение с меню выбора ролей.",
      "uk": "Створити або оновити повідомлення з меню вибору ролей."
    },
    "subcommands": {
      "create-select": {
        "description": {
          "en-US": "Create a new role selection Select Menu message.",
          "ru": "Создать новое сообщение с Select Menu выбора ролей.",
          "uk": "Створити нове повідомлення з Select Menu вибору ролей."
        }
      },
      "create-buttons": {
        "description": {
          "en-US": "Create a new role assignment buttons message.",
          "ru": "Создать новое сообщение с кнопками для выдачи ролей.",
          "uk": "Створити нове повідомлення з кнопками для видачі ролей."
        }
      },
      "add-role": {
        "description": {
          "en-US": "Add a role to an existing menu.",
          "ru": "Добавить роль в существующее меню.",
          "uk": "Додати роль в існуюче меню."
        }
      },
      "remove-role": {
        "description": {
          "en-US": "Remove a role from an existing menu.",
          "ru": "Удалить роль из существующего меню.",
          "uk": "Видалити роль з існуючого меню."
        }
      },
      "delete": {
        "description": {
          "en-US": "Delete a role selection menu message.",
          "ru": "Удалить сообщение с меню выбора ролей.",
          "uk": "Видалити повідомлення з меню вибору ролей."
        }
      }
    },
    "options": {
      "channel": {
        "description": {
          "en-US": "Target channel for the menu.",
          "ru": "Канал, куда будет отправлено сообщение с меню.",
          "uk": "Канал, куди буде відправлено повідомлення з меню."
        }
      },
      "title": {
        "description": {
          "en-US": "Menu embed title.",
          "ru": "Заголовок для эмбеда сообщения с меню.",
          "uk": "Заголовок для ембеда повідомлення з меню."
        }
      },
      "description": {
        "description": {
          "en-US": "Menu embed description.",
          "ru": "Описание для эмбеда сообщения с меню.",
          "uk": "Опис для ембеда повідомлення з меню."
        }
      },
      "placeholder": {
        "description": {
          "en-US": "Placeholder text for Select Menu.",
          "ru": "Текст-заглушка для Select Menu.",
          "uk": "Текст-заглушка для Select Menu."
        }
      },
      "message_id": {
        "description": {
          "en-US": "Role menu message ID.",
          "ru": "ID сообщения с меню выбора ролей.",
          "uk": "ID повідомлення з меню вибору ролей."
        }
      },
      "role": {
        "description": {
          "en-US": "Role to add/remove.",
          "ru": "Роль, которую нужно добавить/удалить.",
          "uk": "Роль, яку потрібно додати/видалити."
        }
      },
      "label": {
        "description": {
          "en-US": "Display name of the role.",
          "ru": "Отображаемое имя роли в меню.",
          "uk": "Відображуване ім'я ролі в меню."
        }
      },
      "rm_description": {
        "description": {
          "en-US": "Description of the role in Select Menu.",
          "ru": "Описание роли в Select Menu.",
          "uk": "Опис ролі в Select Menu."
        }
      },
      "emoji": {
        "description": {
          "en-US": "Emoji for the role.",
          "ru": "Emoji для отображения рядом с ролью.",
          "uk": "Emoji для відображення поруч з роллю."
        }
      }
    }
  },
  "play": {
    "description": {
      "en-US": "Plays audio from a direct link or uploaded file.",
      "ru": "Воспроизводит аудио по прямой ссылке или из загруженного файла.",
      "uk": "Відтворює аудіо за прямим посиланням або із завантаженого файлу."
    },
    "options": {
      "url": {
        "description": {
          "en-US": "Direct link to audio file (mp3, ogg, wav, flac, m4a, opus).",
          "ru": "Прямая ссылка на аудиофайл (mp3, ogg, wav, flac, m4a, opus).",
          "uk": "Пряме посилання на аудіофайл (mp3, ogg, wav, flac, m4a, opus)."
        }
      },
      "attachment": {
        "description": {
          "en-US": "Upload an audio file (mp3, ogg, wav, flac, m4a, opus).",
          "ru": "Загрузите аудиофайл (mp3, ogg, wav, flac, m4a, opus).",
          "uk": "Завантажте аудіофайл (mp3, ogg, wav, flac, m4a, opus)."
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
  },
  "starboard": {
    "description": {
      "en-US": "Open the Starboard control panel",
      "ru": "Открыть панель управления доской звёзд (Starboard)",
      "uk": "Відкрити панель управління дошкою зірок (Starboard)"
    },
    "options": {}
  }
}

module.exports = {
  utility
}