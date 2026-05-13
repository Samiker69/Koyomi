const events = {
  "errors": {
    "no_permissions": {
      "ru": "У меня нет достаточных прав для выполнения этого действия.",
      "en-US": "I do not have sufficient permissions to perform this action.",
      "uk": "У мене немає достатніх прав для виконання цієї дії."
    },
    "unexpected": {
      "ru": "Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.",
      "en-US": "An unexpected error occurred. Please try again later.",
      "uk": "Сталася непередбачена помилка. Будь ласка, спробуйте пізніше."
    },
    "command_error": {
      "ru": "Произошла ошибка при обработке команды!",
      "en-US": "An error occurred while processing the command!",
      "uk": "Сталася помилка під час обробки команди!"
    },
    "command_disabled": {
      "ru": "Команда `{commandName}` запрещена для вас на этом сервере.",
      "en-US": "The command `{commandName}` is disabled for you on this server.",
      "uk": "Команда `{commandName}` заборонена для вас на цьому сервері."
    },
    "cooldown": {
      "ru": "Не так быстро! Вы слишком часто использовали `{commandName}`. Ты снова сможешь использовать её <t:{timestamp}:R>.",
      "en-US": "Not so fast! You've used `{commandName}` too often. You can use it again <t:{timestamp}:R>.",
      "uk": "Не так швидко! Ви занадто часто використовували `{commandName}`. Ви знову зможете використовувати її <t:{timestamp}:R>."
    },
    "interaction_log": {
      "title": {
        "ru": "Ошибка при обработке команды",
        "en-US": "Command Processing Error",
        "uk": "Помилка при обробці команди"
      },
      "command_label": {
        "ru": "Команда",
        "en-US": "Command",
        "uk": "Команда"
      },
      "error_label": {
        "ru": "Ошибка",
        "en-US": "Error",
        "uk": "Помилка"
      }
    }
  },
  "role_menu": {
    "error_not_found": {
      "ru": "Ошибка: Не удалось найти данные для этого меню ролей.",
      "en-US": "Error: Could not find data for this role menu.",
      "uk": "Помилка: Не вдалося знайти дані для цього меню ролей."
    },
    "role_not_available": {
      "ru": "Эта роль больше не доступна в этом меню.",
      "en-US": "This role is no longer available in this menu.",
      "uk": "Ця роль більше не доступна в цьому меню."
    },
    "role_not_found": {
      "ru": "Ошибка: Роль не найдена на сервере.",
      "en-US": "Error: Role not found on the server.",
      "uk": "Помилка: Роль не знайдена на сервері."
    },
    "role_too_high": {
      "ru": "Ошибка: Я не могу управлять этой ролью, так как она находится на той же или более высокой позиции, чем моя высшая роль.",
      "en-US": "Error: I cannot manage this role as it is at the same or higher position than my highest role.",
      "uk": "Помилка: Я не можу керувати цією роллю, оскільки вона знаходиться на тій же або вищій позиції, ніж моя найвища роль."
    },
    "role_managed": {
      "ru": "Ошибка: Я не могу управлять этой ролью, так как она является управляемой (например, роль бота).",
      "en-US": "Error: I cannot manage this role as it is a managed role (e.g., bot role).",
      "uk": "Помилка: Я не можу керувати цією роллю, оскільки вона є керованою (наприклад, роль бота)."
    },
    "role_removed": {
      "ru": "Роль **{roleName}** убрана.",
      "en-US": "Role **{roleName}** removed.",
      "uk": "Роль **{roleName}** видалена."
    },
    "role_added": {
      "ru": "Роль **{roleName}** выдана!",
      "en-US": "Role **{roleName}** added!",
      "uk": "Роль **{roleName}** видана!"
    },
    "no_roles": {
      "ru": "Пока нет ролей для выбора.",
      "en-US": "No roles to choose from yet.",
      "uk": "Поки немає ролей для вибору."
    },
    "roles_updated": {
      "ru": "Ваши роли обновлены.",
      "en-US": "Your roles have been updated.",
      "uk": "Ваші ролі оновлено."
    },
    "roles_no_change": {
      "ru": "Ваши роли не изменились.",
      "en-US": "Your roles have not changed.",
      "uk": "Ваші ролі не змінилися."
    },
    "role_add_success": {
      "ru": "Выдана: **{roleName}**",
      "en-US": "Added: **{roleName}**",
      "uk": "Видана: **{roleName}**"
    },
    "role_add_error": {
      "ru": "Ошибка при выдаче: **{roleName}** (проверьте права бота/роль).",
      "en-US": "Error adding: **{roleName}** (check bot permissions/role).",
      "uk": "Помилка при видачі: **{roleName}** (перевірте права бота/роль)."
    },
    "role_remove_success": {
      "ru": "Убрана: **{roleName}**",
      "en-US": "Removed: **{roleName}**",
      "uk": "Прибрана: **{roleName}**"
    },
    "role_remove_error": {
      "ru": "Ошибка при убирании: **{roleName}** (проверьте права бота/роль).",
      "en-US": "Error removing: **{roleName}** (check bot permissions/role).",
      "uk": "Помилка при прибиранні: **{roleName}** (перевірте права бота/роль)."
    },
    "insufficient_permissions_hierarchy": {
      "ru": "У меня нет достаточных прав для выдачи/снятия этой роли. Убедитесь, что моя роль находится выше роли, которую вы пытаетесь выдать/снять.",
      "en-US": "I do not have sufficient permissions to add/remove this role. Ensure my role is above the role you are trying to add/remove.",
      "uk": "У мене немає достатніх прав для видачі/зняття цієї ролі. Переконайтеся, що моя роль знаходиться вище ролі, яку ви намагаєтеся видати/зняти."
    }
  },
  "honeypot": {
    "title": {
      "en-US": "Honeypot Triggered",
      "ru": "Honeypot сработал",
      "uk": "Honeypot спрацював"
    },
    "labels": {
      "target": {
        "en-US": "Offender",
        "ru": "Нарушитель",
        "uk": "Порушник"
      },
      "result": {
        "en-US": "Result",
        "ru": "Результат",
        "uk": "Результат"
      },
      "channel": {
        "en-US": "Trap Channel",
        "ru": "Канал-ловушка",
        "uk": "Канал-пастка"
      },
      "created": {
        "en-US": "Account Created",
        "ru": "Аккаунт создан",
        "uk": "Акаунт створено"
      },
      "message": {
        "en-US": "Message",
        "ru": "Сообщение",
        "uk": "Повідомлення"
      },
      "guild": {
        "en-US": "Server",
        "ru": "Сервер",
        "uk": "Сервер"
      },
      "banned": {
        "en-US": "Banned",
        "ru": "Забанен",
        "uk": "Забанений"
      },
      "ban_failed": {
        "en-US": "Failed to ban",
        "ru": "Не удалось забанить",
        "uk": "Не вдалося забанити"
      },
      "dm_message": {
        "en-US": "You have been softbanned from **{guildName}** for writing in the trap channel #{channelName}. All your messages from the last 10 minutes have been deleted. You can rejoin using an invite link.",
        "ru": "Вы были исключены (softban) с сервера **{guildName}** за сообщение в канале-ловушке #{channelName}. Ваши сообщения за последние 10 минут были удалены. Вы можете зайти обратно по ссылке-приглашению.",
        "uk": "Ви були виключені (softban) з сервера **{guildName}** за повідомлення в каналі-пастці #{channelName}. Ваші повідомлення за останні 10 хвилин були видалені. Ви можете зайти назад за посиланням-запрошенням."
      }
    }
  },
  "member_add": {
    "title": {
      "ru": "Новый участник!",
      "en-US": "New Member!",
      "uk": "Новий учасник!"
    },
    "description": {
      "ru": "Пользователь: {displayName} (id: `{id}`)\nusername: `{username}`\nПрисоединился к серверу <t:{joinedTimestamp}:F>\nЗарегистрировался <t:{createdTimestamp}:F>",
      "en-US": "User: {displayName} (id: `{id}`)\nusername: `{username}`\nJoined the server <t:{joinedTimestamp}:F>\nRegistered <t:{createdTimestamp}:F>",
      "uk": "Користувач: {displayName} (id: `{id}`)\nusername: `{username}`\nПриєднався до сервера <t:{joinedTimestamp}:F>\nЗареєструвався <t:{createdTimestamp}:F>"
    },
    "invite_used": {
      "ru": "{member} был приглашён по ссылке {code}. Общее использование ссылки: **{uses}**",
      "en-US": "{member} was invited using code {code}. Total uses: **{uses}**",
      "uk": "{member} був запрошений за посиланням {code}. Загальне використання посилання: **{uses}**"
    },
    "invite_unknown": {
      "ru": "{member} был приглашён по неизвестной ссылке. Возможно, его кто-то пригласил",
      "en-US": "{member} was invited using an unknown link. Perhaps someone invited them.",
      "uk": "{member} був запрошений за невідомим посиланням. Можливо, його хтось запросив"
    }
  },
  "member_leave": {
    "title": {
      "ru": "Участник покинул сервер",
      "en-US": "Member Left the Server",
      "uk": "Учасник покинув сервер"
    },
    "description": {
      "ru": "Пользователь: {displayName} (id: `{id}`)\nusername: `{username}`\nПрисоединился к серверу <t:{joinedTimestamp}:F>\nЗарегистрировался <t:{createdTimestamp}:F>\nПокинул сервер <t:{timestamp}:F>",
      "en-US": "User: {displayName} (id: `{id}`)\nusername: `{username}`\nJoined the server <t:{joinedTimestamp}:F>\nRegistered <t:{createdTimestamp}:F>\nLeft the server <t:{timestamp}:F>",
      "uk": "Користувач: {displayName} (id: `{id}`)\nusername: `{username}`\nПриєднався до сервера <t:{joinedTimestamp}:F>\nЗареєструвався <t:{createdTimestamp}:F>\nПокинув сервер <t:{timestamp}:F>"
    }
  },
  "voiceroom": {
    "channel_name": {
      "ru": "Комната {displayName}",
      "en-US": "{displayName}'s Room",
      "uk": "Кімната {displayName}"
    }
  },
  "starboard": {
    "source_title": {
      "ru": "Источник",
      "en-US": "Source",
      "uk": "Джерело"
    }
  }
};

module.exports = { events };
