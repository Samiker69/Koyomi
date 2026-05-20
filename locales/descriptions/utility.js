const utility = {
  "help": {
    "name": { "en-US": "help", "ru": "помощь", "uk": "допомога" },
    "description": { "en-US": "Show command list", "ru": "Показать список команд", "uk": "Показати список команд" },
    "messages": {
      "not_found": { "ru": "Команды не найдены.", "en-US": "Commands not found.", "uk": "Команди не знайдені." },
      "all_commands": { "ru": "Все команды", "en-US": "All commands", "uk": "Всі команди" },
      "no_commands_in_category": { "ru": "В этой категории пока нет команд.", "en-US": "No commands in this category yet.", "uk": "У цій категорії поки немає команд." },
      "no_description": { "ru": "описание отсутствует", "en-US": "no description available", "uk": "опис відсутній" },
      "no_name": { "ru": "Команда без имени", "en-US": "Command without name", "uk": "Команда без імені" },
      "page_info": { "ru": "Страница {current} из {total}", "en-US": "Page {current} of {total}", "uk": "Сторінка {current} з {total}" },
      "timeout_short": { "ru": "(время вышло)", "en-US": "(timeout)", "uk": "(час вийшов)" },
      "prev": { "ru": "⬅️ Пред.", "en-US": "⬅️ Prev", "uk": "⬅️ Поперед." },
      "next": { "ru": "След. ➡️", "en-US": "Next ➡️", "uk": "Наст. ➡️" },
      "select_category": { "ru": "Выберите категорию команд", "en-US": "Select command category", "uk": "Оберіть категорію команд" },
      "all_commands_desc": { "ru": "Показать все доступные команды.", "en-US": "Show all available commands.", "uk": "Показати всі доступні команди." },
      "only_author": { "ru": "Только тот, кто вызвал команду, может взаимодействовать с этим сообщением.", "en-US": "Only the command caller can interact with this message.", "uk": "Тільки той, хто викликав команду, може взаємодіяти з цим повідомленням." },
      "group_label": { "ru": "(группа)", "en-US": "(group)", "uk": "(група)" }
    }
  },
  "info": {
    "name": { "en-US": "info", "ru": "инфо", "uk": "інфо" },
    "description": { "en-US": "Information commands", "ru": "Команды для получения информации", "uk": "Команди для отримання інформації" },
    "options": {
      "userinfo": {
        "name": { "en-US": "userinfo", "ru": "юзеринфо", "uk": "юзерінфо" },
        "description": { "en-US": "User information", "ru": "Информация о пользователе", "uk": "Інформація про користувача" },
        "options": {
          "target": {
            "name": { "en-US": "target", "ru": "цель", "uk": "ціль" },
            "description": { "en-US": "User (optional)", "ru": "Пользователь (необязательно)", "uk": "Користувач (необов'язково)" }
          }
        }
      },
      "serverinfo": {
        "name": { "en-US": "serverinfo", "ru": "серверинфо", "uk": "серверінфо" },
        "description": { "en-US": "Server information", "ru": "Информация о сервере", "uk": "Інформація про сервер" }
      }
    },
    "messages": {
      "status": {
        "online": { "ru": "В сети", "en-US": "Online", "uk": "В мережі" },
        "idle": { "ru": "Не активен", "en-US": "Idle", "uk": "Не активний" },
        "dnd": { "ru": "Не беспокоить", "en-US": "Do Not Disturb", "uk": "Не турбувати" },
        "offline": { "ru": "Не в сети", "en-US": "Offline", "uk": "Не в мережі" }
      },
      "status_label": { "ru": "Статус", "en-US": "Status", "uk": "Статус" },
      "user_title": { "ru": "Информация о пользователе", "en-US": "User Information", "uk": "Інформація про користувача" },
      "server_title": { "ru": "Информация о сервере", "en-US": "Server Information", "uk": "Інформація про сервер" },
      "id": { "ru": "ID", "en-US": "ID", "uk": "ID" },
      "created_at": { "ru": "Аккаунт создан", "en-US": "Account created", "uk": "Акаунт створено" },
      "joined_at": { "ru": "Вступил на сервер", "en-US": "Joined server", "uk": "Приєднався до сервера" },
      "server_created": { "ru": "Создан", "en-US": "Created", "uk": "Створено" },
      "owner": { "ru": "Владелец", "en-US": "Owner", "uk": "Власник" },
      "members": { "ru": "Участников", "en-US": "Members", "uk": "Учасників" },
      "roles": { "ru": "Роли", "en-US": "Roles", "uk": "Ролі" },
      "channels": { "ru": "Каналы", "en-US": "Channels", "uk": "Канали" },
      "locale": { "ru": "Локаль", "en-US": "Locale", "uk": "Локаль" },
      "unknown_sub": { "ru": "Неизвестная подкоманда.", "en-US": "Unknown subcommand.", "uk": "Невідома підкоманда." }
    }
  },
  "botstatus": {
    "name": { "en-US": "botstatus", "ru": "статусбота", "uk": "статусбота" },
    "description": { "en-US": "Shows bot status", "ru": "Показывает статус бота", "uk": "Показує статус бота" },
    "messages": {
      "wait": { "ru": "Подождите...", "en-US": "Wait...", "uk": "Зачекайте..." },
      "title": { "ru": "Текущий статус бота", "en-US": "Current Bot Status", "uk": "Поточний статус бота" },
      "process_time": { "ru": "Время обработки команды", "en-US": "Process time", "uk": "Час обробки команди" },
      "ping": { "ru": "Средний пинг", "en-US": "Average ping", "uk": "Середній пінг" },
      "uptime": { "ru": "Время в сети", "en-US": "Uptime", "uk": "Час у мережі" },
      "uptime_format": { "ru": "{d}д {h}ч {m}мин {s}сек", "en-US": "{d}d {h}h {m}m {s}s", "uk": "{d}д {h}г {m}хв {s}сек" },
      "about_process": { "ru": "О процессе", "en-US": "About process", "uk": "Про процес" },
      "ram_total": { "ru": "Занято процессом всего {mb}MB", "en-US": "Total RAM used {mb}MB", "uk": "Зайнято процесом всього {mb}MB" },
      "ram_heap": { "ru": "Используется сейчас {mb}MB", "en-US": "Heap used now {mb}MB", "uk": "Використовується зараз {mb}MB" },
      "additional": { "ru": "Дополнительно", "en-US": "Additional", "uk": "Додатково" },
      "events_count": { "ru": "Кол-во загруженных ивентов", "en-US": "Events count", "uk": "Кількість завантажених івентів" },
      "commands_count": { "ru": "Кол-во загруженных команд", "en-US": "Commands count", "uk": "Кількість завантажених команд" },
      "version": { "ru": "Версия бота {v}", "en-US": "Bot version {v}", "uk": "Версія бота {v}" }
    }
  },
  "prefix": {
    "name": { "en-US": "prefix", "ru": "префикс", "uk": "префікс" },
    "description": { "en-US": "View or change the command prefix on this server", "ru": "Посмотреть или изменить префикс команд на этом сервере", "uk": "Переглянути або змінити префікс команд на цьому сервері" },
    "options": {
      "new_prefix": {
        "name": { "en-US": "new_prefix", "ru": "новый_префикс", "uk": "новий_префікс" },
        "description": { "en-US": "New prefix for commands (max 5 chars)", "ru": "Новый префикс для команд (макс. 5 символов)", "uk": "Новий префікс для команд (макс. 5 символів)" }
      }
    },
    "messages": {
      "current": { 
        "ru": "Текущий префикс команд на этом сервере: `{prefix}`\nВы можете изменить его с помощью: `/prefix [новый_префикс]` или `{prefix}prefix [новый_префикс]`", 
        "en-US": "The current command prefix on this server is: `{prefix}`\nYou can change it using: `/prefix [new_prefix]` or `{prefix}prefix [new_prefix]`", 
        "uk": "Поточний префікс команд на цьому сервері: `{prefix}`\nВи можете змінити його за допомогою: `/prefix [новий_префікс]` или `{prefix}prefix [новий_префікс]`" 
      },
      "too_long": {
        "ru": "Префикс не должен быть длиннее 5 символов!",
        "en-US": "Prefix cannot be longer than 5 characters!",
        "uk": "Префікс не повинен бути довшим за 5 символів!"
      },
      "success": {
        "ru": "Префикс команд успешно изменен на: `{prefix}`\nТеперь вы можете вызывать команды с новым префиксом: например, `{prefix}botstatus`",
        "en-US": "Command prefix successfully changed to: `{prefix}`\nYou can now run commands using the new prefix: e.g. `{prefix}botstatus`",
        "uk": "Префікс команд успішно змінено на: `{prefix}`\nТепер ви можете викликати команди з новим префіксом: наприклад, `{prefix}botstatus`"
      }
    }
  },
  "room": {
    "name": { "en-US": "room", "ru": "комната", "uk": "кімната" },
    "description": { "en-US": "Manage your dynamic voice room", "ru": "Управление вашей динамической голосовой комнатой", "uk": "Керування вашою динамічною голосовою кімнатою" },
    "options": {
      "rename": {
        "name": { "en-US": "rename", "ru": "переименовать", "uk": "перейменувати" },
        "description": { "en-US": "Rename the room", "ru": "Переименовать комнату", "uk": "Перейменувати кімнату" },
        "options": {
          "name": { "name": { "en-US": "name", "ru": "название", "uk": "назва" }, "description": { "en-US": "New name", "ru": "Новое название", "uk": "Нова назва" } }
        }
      },
      "limit": {
        "name": { "en-US": "limit", "ru": "лимит", "uk": "ліміт" },
        "description": { "en-US": "Set participant limit", "ru": "Установить лимит участников", "uk": "Встановити ліміт учасників" },
        "options": {
          "number": { "name": { "en-US": "number", "ru": "число", "uk": "число" }, "description": { "en-US": "Maximum number of participants (0 - no limit)", "ru": "Максимальное число участников (0 - без лимита)", "uk": "Максимальна кількість учасників (0 - без ліміту)" } }
        }
      },
      "lock": {
        "name": { "en-US": "lock", "ru": "закрыть", "uk": "закрити" },
        "description": { "en-US": "Close the room", "ru": "Закрыть комнату", "uk": "Закрити кімнату" }
      },
      "unlock": {
        "name": { "en-US": "unlock", "ru": "открыть", "uk": "відкрити" },
        "description": { "en-US": "Open the room", "ru": "Открыть комнату", "uk": "Відкрити кімнату" }
      },
      "private": {
        "name": { "en-US": "private", "ru": "приватная", "uk": "приватна" },
        "description": { "en-US": "Make private", "ru": "Сделать приватной", "uk": "Зробити приватною" }
      },
      "public": {
        "name": { "en-US": "public", "ru": "публичная", "uk": "публічна" },
        "description": { "en-US": "Make public", "ru": "Сделать публичной", "uk": "Зробити публічною" }
      }
    },
    "messages": {
      "not_in_voice": { "ru": "Вы не находитесь в голосовом канале.", "en-US": "You are not in a voice channel.", "uk": "Ви не перебуваєте в голосовому каналі." },
      "not_dynamic": { "ru": "Эту команду можно использовать только в созданной вами динамической комнате.", "en-US": "This command can only be used in a dynamic room you created.", "uk": "Цю команду можна використовувати тільки в створеній вами динамічній кімнаті." },
      "not_creator": { "ru": "Только создатель этой комнаты может управлять её настройками.", "en-US": "Only the creator of this room can manage its settings.", "uk": "Тільки творець цієї кімнати може керувати її налаштуваннями." },
      "renamed": { "ru": "Название комнаты изменено на «{newName}».", "en-US": "Room name changed to \"{newName}\".", "uk": "Назва кімнати змінена на «{newName}»." },
      "limit_reset": { "ru": "Лимит участников снят.", "en-US": "Participant limit removed.", "uk": "Ліміт учасників знято." },
      "limit_set": { "ru": "Лимит участников установлен: {num}.", "en-US": "Participant limit set: {num}.", "uk": "Ліміт учасників встановлено: {num}." },
      "locked": { "ru": "Комната закрыта. Никто (кроме вас) не сможет подключиться.", "en-US": "Room locked. No one (except you) can connect.", "uk": "Кімната закрита. Ніхто (крім вас) не зможе підключитися." },
      "unlocked": { "ru": "Комната открыта для подключения.", "en-US": "Room unlocked for connection.", "uk": "Кімната відкрита для підключення." },
      "private_role_not_set": { "ru": "Ошибка: Приватная роль не настроена в конфигурации бота.", "en-US": "Error: Private role is not configured.", "uk": "Помилка: Приватна роль не налаштована." },
      "made_private": { "ru": "Комната сделана приватной и видна только избранной роли.", "en-US": "Room made private.", "uk": "Кімната зроблена приватною." },
      "made_public": { "ru": "Комната сделана публичной и видна всем.", "en-US": "Room made public.", "uk": "Кімната зроблена публічною." },
      "unknown_sub": { "ru": "Неизвестная подкоманда.", "en-US": "Unknown subcommand.", "uk": "Невідома підкоманда." },
      "error": { "ru": "Произошла ошибка при выполнении команды.", "en-US": "An error occurred.", "uk": "Сталася помилка." }
    }
  },
  "user": {
    "name": { "en-US": "user", "ru": "юзер", "uk": "юзер" },
    "description": { "en-US": "User management commands", "ru": "Команды управления пользователями", "uk": "Команди управління користувачами" },
    "options": {
      "voice": {
        "name": { "en-US": "voice", "ru": "войс", "uk": "войс" },
        "description": { "en-US": "Manage user in voice", "ru": "Управление пользователем в голосовом канале", "uk": "Керування користувачем у голосовому каналі" },
        "options": {
          "target": { "name": { "en-US": "target", "ru": "цель", "uk": "ціль" }, "description": { "en-US": "The user", "ru": "Пользователь", "uk": "Користувач" } },
          "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Move to channel", "ru": "Переместить в канал", "uk": "Перемістити в канал" } },
          "deaf": { "name": { "en-US": "deaf", "ru": "деф", "uk": "деф" }, "description": { "en-US": "Deafen user", "ru": "Выключить звук пользователю", "uk": "Вимкнути звук користувачу" } },
          "mute": { "name": { "en-US": "mute", "ru": "мут", "uk": "мут" }, "description": { "en-US": "Mute user", "ru": "Выключить микрофон пользователю", "uk": "Вимкнути мікрофон користувачу" } },
          "kick": { "name": { "en-US": "kick", "ru": "кик", "uk": "кик" }, "description": { "en-US": "Kick from voice", "ru": "Исключить из голосового канала", "uk": "Виключити з голосового каналу" } }
        }
      },
      "addrole": {
        "name": { "en-US": "addrole", "ru": "датьроль", "uk": "датироль" },
        "description": { "en-US": "Add role to user", "ru": "Выдать роль пользователю", "uk": "Видати роль користувачу" },
        "options": {
          "target": { "name": { "en-US": "target", "ru": "цель", "uk": "ціль" }, "description": { "en-US": "The user", "ru": "Пользователь", "uk": "Користувач" } },
          "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Role to add", "ru": "Роль для выдачи", "uk": "Роль для видачі" } }
        }
      },
      "removerole": {
        "name": { "en-US": "removerole", "ru": "забратьроль", "uk": "забратироль" },
        "description": { "en-US": "Remove role from user", "ru": "Забрать роль у пользователя", "uk": "Забрати роль у користувача" },
        "options": {
          "target": { "name": { "en-US": "target", "ru": "цель", "uk": "ціль" }, "description": { "en-US": "The user", "ru": "Пользователь", "uk": "Користувач" } },
          "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Role to remove", "ru": "Роль для снятия", "uk": "Роль для зняття" } }
        }
      }
    },
    "messages": {
      "no_perms": { "ru": "У вас недостаточно прав для выполнения действия", "en-US": "You don't have enough permissions to perform this action", "uk": "У вас недостатньо прав для виконання дії" },
      "no_perms_short": { "ru": "У вас недостаточно прав", "en-US": "Insufficient permissions", "uk": "Недостатньо прав" },
      "not_in_voice": { "ru": "Участник не находится в голосовом канале!", "en-US": "The member is not in a voice channel!", "uk": "Учасник не перебуває в голосовому каналі!" },
      "voice_kicked": { "ru": "{member} кикнут из {channel}.", "en-US": "{member} kicked from {channel}.", "uk": "{member} кікнутий з {channel}." },
      "voice_moved": { "ru": "{member} перемещён из {old} в {new}.", "en-US": "{member} moved from {old} to {new}.", "uk": "{member} переміщений з {old} в {new}." },
      "voice_changed": { "ru": "{member} изменён", "en-US": "{member} settings updated", "uk": "{member} змінений" },
      "sound_off": { "ru": "+ Выключен звук", "en-US": "+ Sound disabled", "uk": "+ Вимкнено звук" },
      "sound_on": { "ru": "+ Включен звук", "en-US": "+ Sound enabled", "uk": "+ Увімкнено звук" },
      "mic_off": { "ru": "+ Выключен микрофон", "en-US": "+ Mic muted", "uk": "+ Вимкнено мікрофон" },
      "mic_on": { "ru": "+ Включен микрофон", "en-US": "+ Mic unmuted", "uk": "+ Увімкнено мікрофон" },
      "nothing_happened": { "ru": "Ничего не произошло.", "en-US": "Nothing happened.", "uk": "Нічого не сталося." },
      "invalid_member": { "ru": "Неверный участник!", "en-US": "Invalid member!", "uk": "Невірний учасник!" },
      "role_pos_low_me": { "ru": "Моя позиция роли ниже выбранной роли", "en-US": "My role position is lower than the selected role", "uk": "Моя позиція ролі нижча за обрану роль" },
      "role_pos_low_you": { "ru": "Ваша позиция роли ниже выбранной", "en-US": "Your role position is lower than the selected role", "uk": "Ваша позиція ролі нижча за обрану" },
      "role_added": { "ru": "Роль {role} выдана {member}", "en-US": "Role {role} given to {member}", "uk": "Роль {role} видана {member}" },
      "role_removed": { "ru": "Роль {role} убрана у {member}", "en-US": "Role {role} removed from {member}", "uk": "Роль {role} забрана у {member}" },
      "unknown_sub": { "ru": "Кажется, такой саб-команды не существует", "en-US": "It seems such a sub-command does not exist", "uk": "Здається, такої саб-команди не існує" }
    }
  },
  "role": {
    "name": { "en-US": "role", "ru": "роль", "uk": "роль" },
    "description": { "en-US": "Role management", "ru": "Управление ролями", "uk": "Керування ролями" },
    "options": {
      "delete": {
        "name": { "en-US": "delete", "ru": "удалить", "uk": "видалити" },
        "description": { "en-US": "Delete role", "ru": "Удалить роль", "uk": "Видалити роль" },
        "options": {
          "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Target role", "ru": "Целевая роль", "uk": "Цільова роль" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason", "ru": "Причина", "uk": "Причина" } }
        }
      },
      "edit": {
        "name": { "en-US": "edit", "ru": "изменить", "uk": "змінити" },
        "description": { "en-US": "Edit role", "ru": "Изменить роль", "uk": "Змінити роль" },
        "options": {
          "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Target role", "ru": "Целевая роль", "uk": "Цільова роль" } },
          "color": { "name": { "en-US": "color", "ru": "цвет", "uk": "колір" }, "description": { "en-US": "Hex color", "ru": "Hex цвет", "uk": "Hex колір" } },
          "hoist": { "name": { "en-US": "hoist", "ru": "отображать", "uk": "відображати" }, "description": { "en-US": "Show separately?", "ru": "Отображать отдельно?", "uk": "Відображати окремо?" } },
          "icon": { "name": { "en-US": "icon", "ru": "иконка", "uk": "іконка" }, "description": { "en-US": "Role icon", "ru": "Иконка роли", "uk": "Іконка ролі" } },
          "mentionable": { "name": { "en-US": "mentionable", "ru": "упоминаемая", "uk": "згадувана" }, "description": { "en-US": "Mentionable?", "ru": "Упоминаемая?", "uk": "Згадувана?" } },
          "name": { "name": { "en-US": "name", "ru": "название", "uk": "назва" }, "description": { "en-US": "Role name", "ru": "Название роли", "uk": "Назва ролі" } },
          "permissions": { "name": { "en-US": "permissions", "ru": "права", "uk": "права" }, "description": { "en-US": "Permissions string", "ru": "Строка прав", "uk": "Рядок прав" } },
          "position": { "name": { "en-US": "position", "ru": "позиция", "uk": "позиція" }, "description": { "en-US": "Role position", "ru": "Позиция роли", "uk": "Позиція ролі" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason", "ru": "Причина", "uk": "Причина" } },
          "unicodeemoji": { "name": { "en-US": "unicodeemoji", "ru": "эмодзи", "uk": "емодзі" }, "description": { "en-US": "Unicode emoji", "ru": "Unicode эмодзи", "uk": "Unicode емодзі" } }
        }
      },
      "create": {
        "name": { "en-US": "create", "ru": "создать", "uk": "створити" },
        "description": { "en-US": "Create role", "ru": "Создать роль", "uk": "Створити роль" },
        "options": {
          "color": { "name": { "en-US": "color", "ru": "цвет", "uk": "колір" }, "description": { "en-US": "Hex color", "ru": "Hex цвет", "uk": "Hex колір" } },
          "hoist": { "name": { "en-US": "hoist", "ru": "отображать", "uk": "відображати" }, "description": { "en-US": "Show separately?", "ru": "Отображать отдельно?", "uk": "Відображати окремо?" } },
          "mentionable": { "name": { "en-US": "mentionable", "ru": "упоминаемая", "uk": "згадувана" }, "description": { "en-US": "Mentionable?", "ru": "Упоминаемая?", "uk": "Згадувана?" } },
          "name": { "name": { "en-US": "name", "ru": "название", "uk": "назва" }, "description": { "en-US": "Role name", "ru": "Название роли", "uk": "Назва ролі" } },
          "permissions": { "name": { "en-US": "permissions", "ru": "права", "uk": "права" }, "description": { "en-US": "Permissions string", "ru": "Строка прав", "uk": "Рядок прав" } },
          "position": { "name": { "en-US": "position", "ru": "позиция", "uk": "позиція" }, "description": { "en-US": "Role position", "ru": "Позиция роли", "uk": "Позиція ролі" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason", "ru": "Причина", "uk": "Причина" } },
          "unicodeemoji": { "name": { "en-US": "unicodeemoji", "ru": "эмодзи", "uk": "емодзі" }, "description": { "en-US": "Unicode emoji", "ru": "Unicode эмодзи", "uk": "Unicode емодзі" } }
        }
      },
      "info": {
        "name": { "en-US": "info", "ru": "инфо", "uk": "інфо" },
        "description": { "en-US": "Role info", "ru": "Информация о роли", "uk": "Інформація про роль" },
        "options": {
          "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Target role", "ru": "Целевая роль", "uk": "Цільова роль" } }
        }
      }
    },
    "messages": {
      "no_perms": { "ru": "У вас недостаточно прав для данного действия", "en-US": "Insufficient permissions for this action", "uk": "Недостатньо прав для цієї дії" },
      "role_pos_low": { "ru": "Ваша позиция роли ниже выбранной", "en-US": "Your role position is lower than selected", "uk": "Ваша позиція ролі нижча за обрану" },
      "no_reason": { "ru": "не указано", "en-US": "not specified", "uk": "не вказано" },
      "role_deleted": { "ru": "{role} была удалена по причине {reason}", "en-US": "{role} deleted for reason: {reason}", "uk": "{role} була видалена з причини {reason}" },
      "role_edited": { "ru": "{role} была изменена", "en-US": "{role} updated", "uk": "{role} була змінена" },
      "role_created": { "ru": "Роль {name} была создана", "en-US": "Role {name} created", "uk": "Роль {name} була створена" },
      "yes": { "ru": "да", "en-US": "yes", "uk": "так" },
      "no": { "ru": "нет", "en-US": "no", "uk": "ні" },
      "none": { "ru": "Нет", "en-US": "None", "uk": "Немає" },
      "no_perms_list": { "ru": "Нет прав", "en-US": "No permissions", "uk": "Немає прав" },
      "info_title": { "ru": "О роли", "en-US": "About Role", "uk": "Про роль" },
      "visual_info": { "ru": "Визуальная информация", "en-US": "Visual info", "uk": "Візуальна інформація" },
      "tech_info": { "ru": "Техническая информация", "en-US": "Technical info", "uk": "Технічна інформація" },
      "name_label": { "ru": "Название", "en-US": "Name", "uk": "Назва" },
      "hex_label": { "ru": "HEX цвет роли", "en-US": "HEX color", "uk": "HEX колір" },
      "created_label": { "ru": "Дата создания роли", "en-US": "Creation date", "uk": "Дата створення ролі" },
      "guild_label": { "ru": "Создана в", "en-US": "Created in", "uk": "Створена в" },
      "hoist_label": { "ru": "Отображается отдельно?", "en-US": "Hoisted?", "uk": "Відображається окремо?" },
      "managed_label": { "ru": "Создана внешним сервисом?", "en-US": "Managed?", "uk": "Створена зовнішнім сервісом?" },
      "mention_label": { "ru": "Все могут упоминать?", "en-US": "Mentionable?", "uk": "Всі можуть згадувати?" },
      "pos_label": { "ru": "Позиция роли", "en-US": "Position", "uk": "Позиція ролі" },
      "perms_label": { "ru": "Права роли", "en-US": "Role permissions", "uk": "Права ролі" },
      "unknown_sub": { "ru": "Кажется, такой саб-команды не существует", "en-US": "Unknown sub-command", "uk": "Здається, такої саб-команди не існує" }
    }
  },
  "guild": {
    "name": { "en-US": "guild", "ru": "сервер", "uk": "сервер" },
    "description": { "en-US": "Server management", "ru": "Управление сервером", "uk": "Керування сервером" },
    "options": {
      "invites": {
        "name": { "en-US": "invites", "ru": "приглашения", "uk": "запрошення" },
        "description": { "en-US": "Manage invites", "ru": "Управление приглашениями", "uk": "Керування запрошеннями" },
        "options": {
          "value": { "name": { "en-US": "value", "ru": "значение", "uk": "значення" }, "description": { "en-US": "true - disable, false - enable", "ru": "true - выкл, false - вкл", "uk": "true - вимк, false - увімк" } }
        }
      },
      "banner": {
        "name": { "en-US": "banner", "ru": "баннер", "uk": "банер" },
        "description": { "en-US": "Change banner", "ru": "Сменить баннер", "uk": "Змінити банер" },
        "options": {
          "image": { "name": { "en-US": "image", "ru": "изображение", "uk": "зображення" }, "description": { "en-US": "Image (level 2 required)", "ru": "Изображение (нужен 2 уровень)", "uk": "Зображення (потрібен 2 рівень)" } }
        }
      },
      "icon": {
        "name": { "en-US": "icon", "ru": "иконка", "uk": "іконка" },
        "description": { "en-US": "Change icon", "ru": "Сменить иконку", "uk": "Змінити іконку" },
        "options": {
          "image": { "name": { "en-US": "image", "ru": "изображение", "uk": "зображення" }, "description": { "en-US": "Image file", "ru": "Файл изображения", "uk": "Файл зображення" } }
        }
      },
      "contentfilterlevel": {
        "name": { "en-US": "contentfilterlevel", "ru": "фильтрконтента", "uk": "фільтрконтенту" },
        "description": { "en-US": "Change Content Filter", "ru": "Сменить уровень фильтрации", "uk": "Змінити рівень фільтрації" },
        "options": {
          "value": { 
            "name": { "en-US": "value", "ru": "значение", "uk": "значення" }, 
            "description": { "en-US": "Level", "ru": "Уровень", "uk": "Рівень" },
            "choices": {
              "disabled": { "en-US": "Disabled", "ru": "Отключено", "uk": "Вимкнено" },
              "members_without_roles": { "en-US": "Members without roles", "ru": "Участники без ролей", "uk": "Учасники без ролей" },
              "all_members": { "en-US": "All members", "ru": "Все участники", "uk": "Всі учасники" }
            }
          }
        }
      },
      "name": {
        "name": { "en-US": "name", "ru": "название", "uk": "назва" },
        "description": { "en-US": "Change name", "ru": "Сменить название", "uk": "Змінити назву" },
        "options": {
          "text": { "name": { "en-US": "text", "ru": "текст", "uk": "текст" }, "description": { "en-US": "New name", "ru": "Новое название", "uk": "Нова назва" } }
        }
      },
      "rulechannel": {
        "name": { "en-US": "rulechannel", "ru": "каналправил", "uk": "каналправил" },
        "description": { "en-US": "Set rule channel", "ru": "Задать канал правил", "uk": "Встановити канал правил" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel", "ru": "Канал", "uk": "Канал" } }
        }
      },
      "safetyalerts": {
        "name": { "en-US": "safetyalerts", "ru": "оповещениябезопасности", "uk": "оповіщеннябезпеки" },
        "description": { "en-US": "Set safety alerts channel", "ru": "Задать канал оповещений безопасности", "uk": "Встановити канал оповіщень безпеки" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel", "ru": "Канал", "uk": "Канал" } }
        }
      },
      "systemchannel": {
        "name": { "en-US": "systemchannel", "ru": "системныйканал", "uk": "системнийканал" },
        "description": { "en-US": "Set system channel", "ru": "Задать системный канал", "uk": "Встановити системний канал" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel", "ru": "Канал", "uk": "Канал" } }
        }
      },
      "verificationlevel": {
        "name": { "en-US": "verificationlevel", "ru": "уровеньверификации", "uk": "рівеньверифікації" },
        "description": { "en-US": "Set verification level", "ru": "Задать уровень верификации", "uk": "Встановити рівень верифікації" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "уровень", "uk": "рівень" }, "description": { "en-US": "0-4", "ru": "0-4", "uk": "0-4" } }
        }
      }
    },
    "messages": {
      "me_no_perms": { "ru": "У меня недостаточно прав для использования этой команды", "en-US": "I don't have enough permissions to use this command", "uk": "У мене недостатньо прав для використання цієї команди" },
      "no_perms": { "ru": "У вас недостаточно прав для данного действия", "en-US": "You don't have enough permissions for this action", "uk": "У вас недостатньо прав для цієї дії" },
      "invites_paused": { "ru": "Приглашения на этот сервер приостановлены", "en-US": "Invites paused", "uk": "Запрошення призупинені" },
      "invites_resumed": { "ru": "Приглашения на этот сервер возобновлены", "en-US": "Invites resumed", "uk": "Запрошення відновлені" },
      "banner_changed": { "ru": "Баннер сервера изменён", "en-US": "Banner updated", "uk": "Банер змінено" },
      "banner_low_level": { "ru": "Баннер не изменён, потому что сервер не достиг 2 уровня", "en-US": "Banner not changed, server level 2 required", "uk": "Банер не змінено, потрібен 2 рівень сервера" },
      "icon_changed": { "ru": "Аватар сервера изменён", "en-US": "Icon updated", "uk": "Аватар змінено" },
      "community_filter_error": { "ru": "На серверах сообществах нельзя изменить уровень фильтрации!", "en-US": "Cannot change filter level on Community servers!", "uk": "На серверах спільнотах не можна змінити рівень фільтрації!" },
      "filter_disabled": { "ru": "Уровень проверки на откровенный контент отключен", "en-US": "Explicit content filter disabled", "uk": "Фільтр відвертого контенту вимкнено" },
      "filter_no_role": { "ru": "Уровень проверки на откровенный контент включен только для участников без ролей", "en-US": "Explicit content filter enabled for members without roles", "uk": "Фільтр відвертого контенту увімкнено для учасників без ролей" },
      "filter_all": { "ru": "Уровень проверки на откровенный контент включен для всех участников", "en-US": "Explicit content filter enabled for all members", "uk": "Фільтр відвертого контенту увімкнено для всіх учасників" },
      "name_changed": { "ru": "Название сервера изменено на `{name}`", "en-US": "Server name changed to `{name}`", "uk": "Назва сервера змінена на `{name}`" },
      "rule_channel_error": { "ru": "На серверах не являющихся сообществом нельзя изменить канал для правил!", "en-US": "Cannot change rule channel on non-community servers!", "uk": "На серверах, що не є спільнотою, не можна змінити канал правил!" },
      "rule_channel_set": { "ru": "{channel} выбран как канал для правил", "en-US": "{channel} set as rule channel", "uk": "{channel} обраний як канал правил" },
      "safety_alerts_error": { "ru": "На серверах не являющихся сообществом нельзя изменить канал для оповещений безопастности!", "en-US": "Cannot change safety alerts on non-community servers!", "uk": "На серверах, що не є спільнотою, не можна змінити канал оповіщень безпеки!" },
      "safety_alerts_set": { "ru": "{channel} выбран как канал для оповещений безопасности", "en-US": "{channel} set as safety alerts channel", "uk": "{channel} обраний як канал оповіщень безпеки" },
      "verification_level_error": { "ru": "Неверное значение!", "en-US": "Invalid value!", "uk": "Невірне значення!" },
      "verification_level_set": { "ru": "Уровень верификации пользователя установлен на {level}", "en-US": "Verification level set to {level}", "uk": "Рівень верифікації встановлено на {level}" },
      "error_occurred": { "ru": "Что-то пошло не так. ошибка:\n{error}", "en-US": "Something went wrong. error:\n{error}", "uk": "Щось пішло не так. помилка:\n{error}" },
      "unknown_sub": { "ru": "Кажется, такой саб-команды не существует", "en-US": "Unknown sub-command", "uk": "Здається, такої саб-команди не існує" }
    }
  },
  "settings": {
    "name": { "en-US": "settings", "ru": "настройки", "uk": "налаштування" },
    "description": { "en-US": "Open settings panel", "ru": "Открыть панель управления настройками сервера", "uk": "Відкрити панель керування налаштуваннями сервера" },
    "messages": {
      "dashboard_title": { "ru": "Настройки сервера {name}", "en-US": "Server Settings: {name}", "uk": "Налаштування сервера {name}" },
      "dashboard_desc": { "ru": "Используйте меню и кнопки ниже для изменения параметров.", "en-US": "Use menus and buttons below to change parameters.", "uk": "Використовуйте меню та кнопки нижче для зміни параметрів." },
      "enabled": { "ru": "Включено", "en-US": "Enabled", "uk": "Увімкнено" },
      "disabled": { "ru": "Выключено", "en-US": "Disabled", "uk": "Вимкнено" },
      "not_set": { "ru": "Не задан", "en-US": "Not set", "uk": "Не задано" },
      "not_set_fem": { "ru": "Не задана", "en-US": "Not set", "uk": "Не задана" },
      "prefix_label": { "ru": "Префикс команд", "en-US": "Command Prefix", "uk": "Префікс команд" },
      "welcome_logs": { "ru": "Приветствия и Логи", "en-US": "Welcome & Logs", "uk": "Привітання та Логи" },
      "welcome_channel": { "ru": "Канал приветствий", "en-US": "Welcome channel", "uk": "Канал привітань" },
      "invite_log": { "ru": "Лог приглашений", "en-US": "Invite log", "uk": "Лог запрошень" },
      "notify_join": { "ru": "Уведомлять о входе/выходе", "en-US": "Notify join/leave", "uk": "Повідомляти про вхід/вихід" },
      "notify_invites": { "ru": "Уведомлять о ссылках", "en-US": "Notify invites", "uk": "Повідомляти про посилання" },
      "voice_rooms": { "ru": "Приватные комнаты", "en-US": "Voice Rooms", "uk": "Приватні кімнати" },
      "category": { "ru": "Категория", "en-US": "Category", "uk": "Категорія" },
      "create_room": { "ru": "Создать Комнату", "en-US": "Create Room", "uk": "Створити Кімнату" },
      "support_reports": { "ru": "Поддержка и Жалобы", "en-US": "Support & Reports", "uk": "Підтримка та Скарги" },
      "support_channel": { "ru": "Канал поддержки", "en-US": "Support channel", "uk": "Канал підтримки" },
      "reports_channel": { "ru": "Канал жалоб", "en-US": "Reports channel", "uk": "Канал скарг" },
      "verdict_channel": { "ru": "Канал наказаний", "en-US": "Verdict channel", "uk": "Канал покарань" },
      "honeypot": { "ru": "Honeypot", "en-US": "Honeypot", "uk": "Honeypot" },
      "trap_channel": { "ru": "Канал-ловушка", "en-US": "Trap channel", "uk": "Канал-пастка" },
      "log_channel": { "ru": "Лог-канал", "en-US": "Log channel", "uk": "Лог-канал" },
      "status": { "ru": "Статус", "en-US": "Status", "uk": "Статус" },
      "footer": { "ru": "Настройки обновляются в реальном времени", "en-US": "Settings update in real-time", "uk": "Налаштування оновлюються в реальному часі" },
      "placeholder_welcome": { "ru": "Выбрать канал приветствий", "en-US": "Select welcome channel", "uk": "Обрати канал привітань" },
      "placeholder_voice": { "ru": "Выбрать канал \"Создать комнату\"", "en-US": "Select \"Create Room\" channel", "uk": "Обрати канал \"Створити кімнату\"" },
      "placeholder_extra": { "ru": "Дополнительные настройки каналов...", "en-US": "Extra channel settings...", "uk": "Додаткові налаштування каналів..." },
      "act_cat": { 
        "label": { "ru": "Задать категорию войсов", "en-US": "Set voice category", "uk": "Встановити категорію войсів" },
        "description": { "ru": "Где будут создаваться личные комнаты", "en-US": "Where private rooms will be created", "uk": "Де будуть створюватися особисті кімнати" }
      },
      "act_log": { 
        "label": { "ru": "Задать канал логов", "en-US": "Set log channel", "uk": "Задати канал логів" },
        "description": { "ru": "Куда писать о приглашениях", "en-US": "Where to log invites", "uk": "Куди писати про запрошення" }
      },
      "act_sup": { 
        "label": { "ru": "Задать канал поддержки", "en-US": "Set support channel", "uk": "Задати канал підтримки" },
        "description": { "ru": "Куда приходят тикеты", "en-US": "Where tickets arrive", "uk": "Куди приходять тікети" }
      },
      "act_rep": { 
        "label": { "ru": "Задать канал жалоб", "en-US": "Set reports channel", "uk": "Задати канал скарг" },
        "description": { "ru": "Куда приходят репорты", "en-US": "Where reports arrive", "uk": "Куди приходять репорти" }
      },
      "act_verdict": { 
        "label": { "ru": "Задать канал наказаний (Verdict)", "en-US": "Set verdict channel", "uk": "Задати канал покарань (Verdict)" },
        "description": { "ru": "Лог банов, мютов, киков и т.д.", "en-US": "Log of bans, mutes, kicks, etc.", "uk": "Лог банів, мютів, кіків і т.д." }
      },
      "act_honeypot": { 
        "label": { "ru": "Honeypot: задать канал-ловушку", "en-US": "Honeypot: set trap channel", "uk": "Honeypot: задати канал-пастку" },
        "description": { "ru": "Сообщения в этот канал → мгновенный бан", "en-US": "Messages in this channel → instant ban", "uk": "Повідомлення в цей канал → миттєвий бан" }
      },
      "act_honeypot_log": { 
        "label": { "ru": "Honeypot: задать лог-канал", "en-US": "Honeypot: set log channel", "uk": "Honeypot: задати лог-канал" },
        "description": { "ru": "Куда отправлять уведомления о срабатывании", "en-US": "Where to send trigger notifications", "uk": "Куди надсилати сповіщення про спрацювання" }
      },
      "act_prefix": { 
        "label": { "ru": "Задать префикс команд", "en-US": "Set command prefix", "uk": "Задати префікс команд" },
        "description": { "ru": "Изменить префикс для текстовых команд сервера", "en-US": "Change prefix for server text commands", "uk": "Змінити префікс для текстових команд сервера" }
      },
      "act_reset": { 
        "label": { "ru": "СБРОСИТЬ ВСЁ", "en-US": "RESET ALL", "uk": "СКИНУТИ ВСЕ" },
        "description": { "ru": "Удалить все настройки (Опасно!)", "en-US": "Delete all settings (Dangerous!)", "uk": "Видалити всі налаштування (Небезпечно!)" }
      },
      "toggle_invites": { "ru": "Лог ссылок: {state}", "en-US": "Invite log: {state}", "uk": "Лог посилань: {state}" },
      "toggle_members": { "ru": "Лог входа: {state}", "en-US": "Join log: {state}", "uk": "Лог входу: {state}" },
      "toggle_honeypot": { "ru": "Honeypot: {state}", "en-US": "Honeypot: {state}", "uk": "Honeypot: {state}" },
      "on": { "ru": "ВКЛ", "en-US": "ON", "uk": "УВІМК" },
      "off": { "ru": "ВЫКЛ", "en-US": "OFF", "uk": "ВИМК" },
      "saved": { "ru": "Сохранено!", "en-US": "Saved!", "uk": "Збережено!" },
      "select_timeout": { "ru": "Время ожидания выбора истекло.", "en-US": "Selection timeout expired.", "uk": "Час очікування вибору вичерпано." },
      "honeypot_trap_required": { "ru": "Сначала задайте канал-ловушку через меню выше.", "en-US": "Set trap channel first.", "uk": "Спочатку встановіть канал-пастку." },
      "placeholder_lang": { "ru": "Выбрать язык", "en-US": "Select language", "uk": "Обрати мову" },
      "lang_ru": { "ru": "Русский", "en-US": "Russian", "uk": "Російська" },
      "lang_en": { "ru": "Английский (США)", "en-US": "English (US)", "uk": "Англійська (США)" },
      "lang_uk": { "ru": "Украинский", "en-US": "Ukrainian", "uk": "Українська" },
      "lang_title": { "ru": "Выберите язык", "en-US": "Select language", "uk": "Оберіть мову" },
      "error_saving": { "ru": "Произошла ошибка при сохранении.", "en-US": "Error while saving.", "uk": "Сталася помилка при збереженні." },
      "modal_prefix_title": { "ru": "Префикс команд", "en-US": "Command Prefix", "uk": "Префікс команд" },
      "modal_prefix_input": { "ru": "Новый префикс (макс. 5 символов)", "en-US": "New prefix (max 5 chars)", "uk": "Новий префікс (макс. 5 символів)" }
    }
  },
  "starboard": {
    "name": { "en-US": "starboard", "ru": "старборд", "uk": "старборд" },
    "description": { "en-US": "Starboard management", "ru": "Управление старбордом", "uk": "Керування старбордом" },
    "options": {
      "setup": {
        "name": { "en-US": "setup", "ru": "настроить", "uk": "налаштувати" },
        "description": { "en-US": "Set up starboard", "ru": "Настроить старборд", "uk": "Налаштувати старборд" },
        "options": {
          "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Starboard channel", "ru": "Канал старборда", "uk": "Канал старборда" } },
          "min": { "name": { "en-US": "min", "ru": "минимум", "uk": "мінімум" }, "description": { "en-US": "Minimum stars", "ru": "Минимум звезд", "uk": "Мінімум зірок" } }
        }
      },
      "disable": {
        "name": { "en-US": "disable", "ru": "выключить", "uk": "вимкнути" },
        "description": { "en-US": "Disable starboard", "ru": "Выключить старборд", "uk": "Вимкнути старборд" }
      },
      "channel": {
        "name": { "en-US": "channel", "ru": "канал", "uk": "канал" },
        "description": { "en-US": "Set starboard channel", "ru": "Установить канал старборда", "uk": "Встановити канал старборда" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel", "ru": "Канал", "uk": "Канал" } }
        }
      },
      "emoji": {
        "name": { "en-US": "emoji", "ru": "эмодзи", "uk": "емодзі" },
        "description": { "en-US": "Set starboard emoji", "ru": "Установить эмодзи старборда", "uk": "Встановити емодзі старборда" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "эмодзи", "uk": "емодзі" }, "description": { "en-US": "Emoji", "ru": "Эмодзи", "uk": "Емодзі" } }
        }
      },
      "threshold": {
        "name": { "en-US": "threshold", "ru": "порог", "uk": "поріг" },
        "description": { "en-US": "Set star threshold", "ru": "Установить порог звезд", "uk": "Встановити поріг зірок" },
        "options": {
          "input": { "name": { "en-US": "input", "ru": "число", "uk": "число" }, "description": { "en-US": "Number of stars", "ru": "Количество звезд", "uk": "Кількість зірок" } }
        }
      }
    }
  },
  "rolemenu": {
    "name": { "en-US": "rolemenu", "ru": "рольменю", "uk": "рольменю" },
    "description": { "en-US": "Create interactive role menu", "ru": "Создать интерактивное меню ролей", "uk": "Створити інтерактивне меню ролей" },
    "options": {
      "create": {
        "name": { "en-US": "create", "ru": "создать", "uk": "створити" },
        "description": { "en-US": "Create a new role menu", "ru": "Создать новое меню ролей", "uk": "Створити нове меню ролей" },
        "options": {
          "title": { "name": { "en-US": "title", "ru": "заголовок", "uk": "заголовок" }, "description": { "en-US": "Menu title", "ru": "Заголовок меню", "uk": "Заголовок меню" } },
          "description": { "name": { "en-US": "description", "ru": "описание", "uk": "опис" }, "description": { "en-US": "Menu description", "ru": "Описание меню", "uk": "Опис меню" } },
          "type": { 
            "name": { "en-US": "type", "ru": "тип", "uk": "тип" }, 
            "description": { "en-US": "Buttons or Select Menu", "ru": "Кнопки или выпадающее меню", "uk": "Кнопки або випадаюче меню" },
            "choices": {
              "buttons": { "en-US": "Buttons", "ru": "Кнопки", "uk": "Кнопки" },
              "select": { "en-US": "Select Menu", "ru": "Выпадающее меню", "uk": "Випадаюче меню" }
            }
          }
        }
      },
      "addrole": {
        "name": { "en-US": "addrole", "ru": "добавитьроль", "uk": "додатироль" },
        "description": { "en-US": "Add a role to an existing role menu", "ru": "Добавить роль в существующее меню", "uk": "Додати роль в існуюче меню" },
        "options": {
          "message_id": { "name": { "en-US": "message_id", "ru": "айди_сообщения", "uk": "айді_повідомлення" }, "description": { "en-US": "ID of the role menu message", "ru": "ID сообщения с меню ролей", "uk": "ID повідомлення з меню ролей" } },
          "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Role to add", "ru": "Роль для добавления", "uk": "Роль для додавання" } },
          "label": { "name": { "en-US": "label", "ru": "название", "uk": "назва" }, "description": { "en-US": "Button label", "ru": "Название кнопки", "uk": "Назва кнопки" } },
          "emoji": { "name": { "en-US": "emoji", "ru": "эмодзи", "uk": "емодзі" }, "description": { "en-US": "Button emoji (optional)", "ru": "Эмодзи кнопки (необязательно)", "uk": "Емодзі кнопки (необов'язково)" } }
        }
      }
    },
    "messages": {
      "setup_start": { "ru": "Начинаю создание меню ролей...", "en-US": "Starting role menu creation...", "uk": "Починаю створення меню ролей..." },
      "setup_done": { "ru": "Меню ролей создано! ID сообщения: `{id}`. Теперь вы можете добавить в него роли командой `/rolemenu addrole`.", "en-US": "Role menu created! Message ID: `{id}`. You can now add roles using `/rolemenu addrole`.", "uk": "Меню ролей створено! ID повідомлення: `{id}`. Тепер ви можете додати в нього ролі командою `/rolemenu addrole`." },
      "footer": { "ru": "Выберите роли ниже", "en-US": "Select roles below", "uk": "Оберіть ролі нижче" },
      "msg_not_found": { "ru": "Сообщение с ID `{id}` не найдено в этом канале.", "en-US": "Message with ID `{id}` not found in this channel.", "uk": "Повідомлення з ID `{id}` не знайдено в цьому каналі." },
      "not_role_menu": { "ru": "Это сообщение не является меню ролей или у бота нет прав на его редактирование.", "en-US": "This message is not a role menu or the bot cannot edit it.", "uk": "Це повідомлення не є меню ролей або бот не може його редагувати." },
      "role_added_to_menu": { "ru": "Роль {role} успешно добавлена в меню!", "en-US": "Role {role} successfully added to the menu!", "uk": "Роль {role} успішно додана в меню!" },
      "role_removed_from_menu": { "ru": "Роль {role} успешно удалена из меню!", "en-US": "Role {role} successfully removed from the menu!", "uk": "Роль {role} успішно видалена з меню!" },
      "role_given": { "ru": "Вам выдана роль {role}.", "en-US": "You have been given the role {role}.", "uk": "Вам видано роль {role}." },
      "role_taken": { "ru": "У вас забрана роль {role}.", "en-US": "The role {role} has been removed from you.", "uk": "У вас забрано роль {role}." },
      "error_perm": { "ru": "У меня недостаточно прав, чтобы выдать вам эту роль.", "en-US": "I don't have enough permissions to give you this role.", "uk": "У мене недостатньо прав, щоб видати вам цю роль." }
    }
  },
  "log_parse": {
    "title": { "en-US": "Minecraft Log Information", "ru": "Информация о логе Minecraft", "uk": "Інформація про лог Minecraft" },
    "system_info": { "en-US": "System Information", "ru": "Информация о системе", "uk": "Інформація про систему" },
    "crash_desc": { "en-US": "Crash Description", "ru": "Описание краша", "uk": "Опис краша" },
    "exception": { "en-US": "Exception", "ru": "Исключение", "uk": "Виняток" },
    "reason": { "en-US": "Reason", "ru": "Причина", "uk": "Причина" },
    "solutions": { "en-US": "Solutions", "ru": "Решения", "uk": "Рішення" },
    "install_mod": { "en-US": "{counter}. Install this mod: [{mod}]({link})", "ru": "{counter}. Установите данный мод: [{mod}]({link})", "uk": "{counter}. Встановіть цей мод: [{mod}]({link})" },
    "link_not_found": { "en-US": "link not found", "ru": "ссылка не найдена", "uk": "посилання не знайдено" },
    "lwjgl_fix": { "en-US": "{counter}. Solution found: Insert argument `-Dsodium.checks.issue2561=false`", "ru": "{counter}. Найдено решение: Вставьте аргумент `-Dsodium.checks.issue2561=false`", "uk": "{counter}. Знайдено рішення: Вставте аргумент `-Dsodium.checks.issue2561=false`" },
    "instruction_desc": { "en-US": "Instruction: attach `latestlog.txt`. Below is an image showing where to find it.", "ru": "Инструкция: прикрепите файл `latestlog.txt`. Ниже изображение, где его можно найти.", "uk": "Інструкція: прикріпіть файл `latestlog.txt`. Нижче зображення, де його можна знайти." },
    "instruction_footer": { "en-US": "Attaching the file will help solve the problem faster.", "ru": "Прикрепление файла поможет быстрее решить проблему.", "uk": "Прикріплення файла допоможе швидше вирішити проблему." },
    "instruction_content": { "en-US": "Please attach `latestlog.txt` to speed up solving your problem.", "ru": "Пожалуйста, прикрепите файл `latestlog.txt` для ускорения решения вашей проблемы.", "uk": "Будь ласка, прикріпіть файл `latestlog.txt` для прискорення вирішення вашої проблеми." },
    "read_error": { "en-US": "Failed to read the log file. Please try sending it again.", "ru": "Не удалось прочитать файл лога. Попробуйте отправить его снова.", "uk": "Не вдалося прочитати файл логу. Спробуйте надіслати його знову." },
    "collector_end": { "en-US": "Collector ended. If you want to send a log file, create a new thread.", "ru": "Коллектор завершил работу. Если хотите отправить лог-файл, создайте новый тред.", "uk": "Колектор завершив роботу. Якщо хочете надіслати лог-файл, створіть новий тред." },
    "process_error": { "en-US": "An error occurred while analyzing the log. Please try again or contact an admin.", "ru": "Произошла ошибка при анализе лога. Пожалуйста, попробуйте еще раз или свяжитесь с администратором.", "uk": "Сталася помилка при аналізі логу. Будь ласка, спробуйте ще раз або зв'яжіться з адміністратором." },
    "keys": {
      "Launcher version": { "en-US": "Launcher version", "ru": "Версия лаунчера", "uk": "Версія лаунчера" },
      "Architecture": { "en-US": "Architecture", "ru": "Архитектура", "uk": "Архітектура" },
      "Device model": { "en-US": "Device model", "ru": "Модель устройства", "uk": "Модель пристрою" },
      "API version": { "en-US": "API version", "ru": "Версия API", "uk": "Версія API" },
      "Selected Minecraft version": { "en-US": "Minecraft version", "ru": "Версия Minecraft", "uk": "Версія Minecraft" },
      "Custom Java arguments": { "en-US": "Java arguments", "ru": "Аргументы Java", "uk": "Аргументи Java" },
      "RAM allocated": { "en-US": "RAM allocated", "ru": "Выделено RAM", "uk": "Виділено RAM" },
      "Graphics device": { "en-US": "Graphics device", "ru": "Графическое устройство", "uk": "Графічний пристрій" },
      "MOJO_RENDERER": { "en-US": "MOJO_RENDERER", "ru": "MOJO_RENDERER", "uk": "MOJO_RENDERER" },
      "JAVA_HOME": { "en-US": "JAVA_HOME", "ru": "JAVA_HOME", "uk": "JAVA_HOME" }
    },
    "potential_solutions": {
      "update_java": { "en-US": "Update Java. Failed to determine exact version.", "ru": "Обновите Java. Не удалось определить точную версию.", "uk": "Оновіть Java. Не вдалося визначити точну версію." },
      "use_java": { "en-US": "Use Java {v}", "ru": "Используйте Java {v}", "uk": "Використовуйте Java {v}" },
      "unknown_class_version": { "en-US": "Unknown class file version: {v}", "ru": "Неизвестная версия class file: {v}", "uk": "Невідома версія class file: {v}" },
      "ely_by_error": { "en-US": "ely.by skin system is temporarily unavailable. Use another account type or wait.", "ru": "Система скинов ely.by временно недоступна. Используйте другой тип аккаунта либо подождите, пока всё не придёт в норму", "uk": "Система скінів ely.by тимчасово недоступна. Використовуйте інший тип акаунту або зачекайте, поки все не прийде в норму" },
      "framebuffer_error": { "en-US": "Change renderer to LTW", "ru": "Смените визуализатор на LTW", "uk": "Змініть візуалізатор на LTW" },
      "zink_error": { "en-US": "Change renderer from Zink to another one", "ru": "Смените визуализатор с Zink на другой", "uk": "Змініть візуалізатор з Zink на інший" },
      "driver_problem": { "en-US": "Driver problem. For Adreno, try toggling Turnip in launcher settings. Otherwise, don't use shaders or change renderer.", "ru": "Не точно: проблема драйвера. В случае Adreno попробуйте включить/выключить использование Turnip в настройках графики лаунчера. В ином случае не используйте шейдеры или попробуйте сменить визуализатор.", "uk": "Не точно: проблема драйвера. У випадку Adreno спробуйте увімкнути/вимкнути використання Turnip у налаштуваннях графіки лаунчера. В іншому випадку не використовуйте шейдери або спробуйте змінити візуалізатор." },
      "sodium_gl4es": { "en-US": "Change renderer to LTW", "ru": "Смените визуализатор на LTW", "uk": "Змініть візуализатор на LTW" },
      "shader_compile_error": { "en-US": "Most likely: Shader compilation error. Occurs when resourcepacks/shaders use unsupported features. Also occurs with some mods like Create. No exact solution, don't play on trashy servers.", "ru": "Вероятнее всего: Ошибка компиляции шейдеров. Это может возникать при попытке ресурпака (включая серверного) или шейдера использовать неподдерживаемые функции вашего устройства. Это также может возникать при использовании некоторых модов, например, Create. Точного решения нет, не играйте на хламных серверах.", "uk": "Найімовірніше: Помилка компіляції шейдерів. Це може виникати при спробі ресурспаку (включаючи серверний) або шейдера використовувати непідтримувані функції вашого пристрою. Це також може виникати при використанні деяких модів, наприклад, Create. Точного рішення немає, не грайте на поганих серверах." }
    }
  }
};

module.exports = utility;
