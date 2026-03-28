const replies = {
    "no_access": {
        "ru": "Вы не можете использовать эту команду",
        "en-US": "",
        "uk": ""
    },
    "unknown_subcommand": {
        "ru": "Кажется, такой сабкоманды не существует",
        "en-US": "",
        "uk": ""
    },
    "starboard_title": {
        "ru": "Настройки Starboard: {guildName}",
        "en-US": "Starboard Settings: {guildName}",
        "uk": "Налаштування Starboard: {guildName}"
    },
    "starboard_desc": {
        "ru": "Настройте доску звёзд, используя меню ниже.",
        "en-US": "Configure the Starboard using the menu below.",
        "uk": "Налаштуйте дошку зірок, використовуючи меню нижче."
    },
    "starboard_status": {
        "ru": "Статус модуля",
        "en-US": "Module Status",
        "uk": "Статус модуля"
    },
    "starboard_min": {
        "ru": "Мин. реакций",
        "en-US": "Min. Reactions",
        "uk": "Мін. реакцій"
    },
    "starboard_channel": {
        "ru": "Канал публикации",
        "en-US": "Publish Channel",
        "uk": "Канал публікації"
    },
    "starboard_enabled": {
        "ru": "Включено",
        "en-US": "Enabled",
        "uk": "Увімкнено"
    },
    "starboard_disabled": {
        "ru": "Выключено",
        "en-US": "Disabled",
        "uk": "Вимкнено"
    },
    "starboard_notset": {
        "ru": "Не задан",
        "en-US": "Not set",
        "uk": "Не задано"
    },
    "starboard_inst": {
        "ru": "Настройки применяются мгновенно",
        "en-US": "Settings are applied instantly",
        "uk": "Налаштування застосовуються миттєво"
    },
    "starboard_err": {
        "ru": "Произошла ошибка при сохранении настроек.",
        "en-US": "An error occurred while saving settings.",
        "uk": "Виникла помилка під час збереження налаштувань."
    },
    "starboard_ph1": {
        "ru": "Выберите канал для Starboard",
        "en-US": "Select channel for Starboard",
        "uk": "Виберіть канал для Starboard"
    },
    "starboard_ph2": {
        "ru": "Выберите мин. кол-во реакций",
        "en-US": "Select min amount of reactions",
        "uk": "Виберіть мін. кількість реакцій"
    },
    "starboard_btn_on": {
        "ru": "Включить Starboard",
        "en-US": "Enable Starboard",
        "uk": "Увімкнути Starboard"
    },
    "starboard_btn_off": {
        "ru": "Выключить Starboard",
        "en-US": "Disable Starboard",
        "uk": "Вимкнути Starboard"
    },
    "wait": {
        "ru": "Подождите...",
        "en-US": "Please wait...",
        "uk": "Зачекайте..."
    },
    "botstatus_title": {
        "ru": "Текущий статус бота",
        "en-US": "Current bot status",
        "uk": "Поточний статус бота"
    },
    "botstatus_processing": {
        "ru": "Время обработки",
        "en-US": "Processing time",
        "uk": "Час обробки"
    },
    "botstatus_ping": {
        "ru": "Средний пинг",
        "en-US": "Average ping",
        "uk": "Середній пінг"
    },
    "botstatus_uptime": {
        "ru": "Время в сети",
        "en-US": "Uptime",
        "uk": "Час у мережі"
    },
    "botstatus_uptime_value": {
        "ru": "{days}д {hours}ч {minutes}мин {seconds}сек",
        "en-US": "{days}d {hours}h {minutes}m {seconds}s",
        "uk": "{days}д {hours}г {minutes}хв {seconds}с"
    },
    "botstatus_process": {
        "ru": "О процессе",
        "en-US": "Process info",
        "uk": "Про процес"
    },
    "botstatus_ram_total": {
        "ru": "Занято процессом всего {mb}MB",
        "en-US": "Total memory allocated {mb}MB",
        "uk": "Зайнято процесом всього {mb}MB"
    },
    "botstatus_ram_used": {
        "ru": "Используется сейчас {mb}MB",
        "en-US": "Currently used {mb}MB",
        "uk": "Використовується зараз {mb}MB"
    },
    "botstatus_additional": {
        "ru": "Дополнительно",
        "en-US": "Additional",
        "uk": "Додатково"
    },
    "botstatus_events": {
        "ru": "Кол-во загруженных ивентов",
        "en-US": "Loaded events count",
        "uk": "Кількість завантажених івентів"
    },
    "botstatus_commands": {
        "ru": "Кол-во загруженных команд",
        "en-US": "Loaded commands count",
        "uk": "Кількість завантажених команд"
    },
    "botstatus_version": {
        "ru": "Версия бота {version}",
        "en-US": "Bot version {version}",
        "uk": "Версія бота {version}"
    },
    "no_permission": {
        "ru": "У вас недостаточно прав для данного действия",
        "en-US": "You don't have permission for this action",
        "uk": "У вас недостатньо прав для цієї дії"
    },
    "bot_no_permission": {
        "ru": "У меня недостаточно прав для использования этой команды",
        "en-US": "I don't have enough permissions to use this command",
        "uk": "У мене недостатньо прав для використання цієї команди"
    },
    "something_went_wrong": {
        "ru": "Что-то пошло не так. Ошибка:\n{error}",
        "en-US": "Something went wrong. Error:\n{error}",
        "uk": "Щось пішло не так. Помилка:\n{error}"
    },
    "guild_invites_paused": {
        "ru": "Приглашения на этот сервер приостановлены",
        "en-US": "Invites for this server have been paused",
        "uk": "Запрошення на цей сервер призупинено"
    },
    "guild_invites_resumed": {
        "ru": "Приглашения на этот сервер возобновлены",
        "en-US": "Invites for this server have been resumed",
        "uk": "Запрошення на цей сервер відновлено"
    },
    "guild_banner_changed": {
        "ru": "Баннер сервера изменён",
        "en-US": "Server banner has been changed",
        "uk": "Банер сервера змінено"
    },
    "guild_banner_level_fail": {
        "ru": "Баннер не изменён, потому что сервер не достиг 2 уровня",
        "en-US": "Banner not changed because the server has not reached level 2",
        "uk": "Банер не змінено, тому що сервер не досяг 2 рівня"
    },
    "guild_icon_changed": {
        "ru": "Аватар сервера изменён",
        "en-US": "Server icon has been changed",
        "uk": "Іконку сервера змінено"
    },
    "guild_cfl_comm_fail": {
        "ru": "На серверах сообществах нельзя изменить уровень фильтрации!",
        "en-US": "Content filter level cannot be changed on community servers!",
        "uk": "На серверах спільнот не можна змінити рівень фільтрації!"
    },
    "guild_cfl_disabled": {
        "ru": "Уровень проверки на откровенный контент отключен",
        "en-US": "Explicit content filter level disabled",
        "uk": "Рівень перевірки на відвертий контент вимкнено"
    },
    "guild_cfl_no_role": {
        "ru": "Уровень проверки на откровенный контент включен только для участников без ролей",
        "en-US": "Explicit content filter enabled for members without roles only",
        "uk": "Рівень перевірки на відвертий контент увімкнено тільки для учасників без ролей"
    },
    "guild_cfl_all_members": {
        "ru": "Уровень проверки на откровенный контент включен для всех участников",
        "en-US": "Explicit content filter enabled for all members",
        "uk": "Рівень перевірки на відвертий контент увімкнено для всіх учасників"
    },
    "guild_name_changed": {
        "ru": "Название сервера изменено на `{name}`",
        "en-US": "Server name changed to `{name}`",
        "uk": "Назву сервера змінено на `{name}`"
    },
    "guild_rule_comm_fail": {
        "ru": "На серверах не являющихся сообществом нельзя изменить канал для правил!",
        "en-US": "Cannot change rule channel on non-community servers!",
        "uk": "На серверах, що не є спільнотою, не можна змінити канал для правил!"
    },
    "guild_rule_changed": {
        "ru": "{channel} выбран как канал для правил",
        "en-US": "{channel} set as rules channel",
        "uk": "{channel} обрано як канал для правил"
    },
    "guild_safety_comm_fail": {
        "ru": "На серверах не являющихся сообществом нельзя изменить канал для оповещений безопастности!",
        "en-US": "Cannot change safety alerts channel on non-community servers!",
        "uk": "На серверах, що не є спільнотою, не можна змінити канал для сповіщень безпеки!"
    },
    "guild_safety_changed": {
        "ru": "{channel} выбран как канал для оповещений безопасности",
        "en-US": "{channel} set as safety alerts channel",
        "uk": "{channel} обрано як канал для сповіщень безпеки"
    },
    "guild_invalid_value": {
        "ru": "Неверное значение!",
        "en-US": "Invalid value!",
        "uk": "Неправильне значення!"
    },
    "guild_verification_level_fail": {
        "ru": "Неверное значение!",
        "en-US": "Invalid value!",
        "uk": "Неправильне значення!"
    },
    "guild_verification_changed": {
        "ru": "Уровень верификации пользователя установлен на {level}",
        "en-US": "Verification level set to {level}",
        "uk": "Рівень верифікації користувача встановлено на {level}"
    },
    "guild_system_changed": {
        "ru": "{channel} выбран как системный канал",
        "en-US": "{channel} set as system channel",
        "uk": "{channel} обрано як системний канал"
    },
    "help_not_found": {
        "ru": "Команды не найдены.",
        "en-US": "No commands found.",
        "uk": "Команди не знайдено."
    },
    "help_empty_category": {
        "ru": "В этой категории пока нет команд.",
        "en-US": "There are no commands in this category yet.",
        "uk": "У цій категорії поки немає команд."
    },
    "help_no_desc": {
        "ru": "описание отсутствует",
        "en-US": "no description",
        "uk": "опис відсутній"
    },
    "help_group": {
        "ru": "(группа)",
        "en-US": "(group)",
        "uk": "(група)"
    },
    "help_invalid_user": {
        "ru": "Только тот, кто вызвал команду, может взаимодействовать с этим сообщением.",
        "en-US": "Only the user who executed the command can interact with this message.",
        "uk": "Тільки той, хто викликав команду, може взаємодіяти з цим повідомленням."
    },
    "help_title": {
        "ru": "Список команд: {category}",
        "en-US": "Command list: {category}",
        "uk": "Список команд: {category}"
    },
    "help_page": {
        "ru": "Страница {page} из {total}",
        "en-US": "Page {page} of {total}",
        "uk": "Сторінка {page} із {total}"
    },
    "help_page_timeout": {
        "ru": "Страница {page} из {total} (время вышло)",
        "en-US": "Page {page} of {total} (timed out)",
        "uk": "Сторінка {page} із {total} (час вийшов)"
    },
    "help_btn_prev": {
        "ru": "⬅️ Пред.",
        "en-US": "⬅️ Prev",
        "uk": "⬅️ Попер."
    },
    "help_btn_next": {
        "ru": "След. ➡️",
        "en-US": "Next ➡️",
        "uk": "Наступ. ➡️"
    },
    "help_select_ph": {
        "ru": "Выберите категорию команд",
        "en-US": "Select command category",
        "uk": "Виберіть категорію команд"
    },
    "help_cat_all": {
        "ru": "Все команды",
        "en-US": "All commands",
        "uk": "Всі команди"
    },
    "help_cat_all_desc": {
        "ru": "Показать все доступные команды.",
        "en-US": "Show all available commands.",
        "uk": "Показати всі доступні команди."
    },
    "role_pos_lower": {
        "ru": "Ваша позиция роли ниже выбранной",
        "en-US": "Your role position is lower than the selected one",
        "uk": "Ваша позиція ролі нижча за обрану"
    },
    "role_deleted": {
        "ru": "{role} была удалена по причине {reason}",
        "en-US": "{role} was deleted: {reason}",
        "uk": "{role} була видалена, причина: {reason}"
    },
    "role_edited": {
        "ru": "{role} была изменена",
        "en-US": "{role} has been edited",
        "uk": "{role} була змінена"
    },
    "role_no_admin": {
        "ru": "Недостаточно прав для данного действия",
        "en-US": "Not enough permissions for this action",
        "uk": "Недостатньо прав для цієї дії"
    },
    "role_created": {
        "ru": "Роль {name} была создана",
        "en-US": "Role {name} has been created",
        "uk": "Роль {name} була створена"
    },
    "role_yes": {
        "ru": "да",
        "en-US": "yes",
        "uk": "так"
    },
    "role_no": {
        "ru": "нет",
        "en-US": "no",
        "uk": "ні"
    },
    "role_no_perms": {
        "ru": "Нет прав",
        "en-US": "No permissions",
        "uk": "Немає прав"
    },
    "role_info_title": {
        "ru": "О роли",
        "en-US": "About role",
        "uk": "Про роль"
    },
    "role_info_visual": {
        "ru": "Визуальная информация",
        "en-US": "Visual information",
        "uk": "Візуальна інформація"
    },
    "role_info_name": {
        "ru": "Название",
        "en-US": "Name",
        "uk": "Назва"
    },
    "role_info_id": {
        "ru": "ID",
        "en-US": "ID",
        "uk": "ID"
    },
    "role_info_color": {
        "ru": "HEX цвет роли",
        "en-US": "Role HEX color",
        "uk": "HEX колір ролі"
    },
    "role_info_tech": {
        "ru": "Техническая информация",
        "en-US": "Technical information",
        "uk": "Технічна інформація"
    },
    "role_info_created": {
        "ru": "Дата создания роли",
        "en-US": "Role creation date",
        "uk": "Дата створення ролі"
    },
    "role_info_guild": {
        "ru": "Создана в",
        "en-US": "Created in",
        "uk": "Створена в"
    },
    "role_info_hoisted": {
        "ru": "Отображается отдельно?",
        "en-US": "Hoisted?",
        "uk": "Відображається окремо?"
    },
    "role_info_managed": {
        "ru": "Создана внешним сервисом?",
        "en-US": "Managed by integration?",
        "uk": "Створена зовнішнім сервісом?"
    },
    "role_info_mentionable": {
        "ru": "Все могут упоминать?",
        "en-US": "Mentionable?",
        "uk": "Усі можуть згадувати?"
    },
    "role_info_position": {
        "ru": "Позиция роли",
        "en-US": "Role position",
        "uk": "Позиція ролі"
    },
    "role_info_permissions": {
        "ru": "Права роли",
        "en-US": "Role permissions",
        "uk": "Права ролі"
    },
    "rm_no_channel": {
        "ru": "Вы должны указать текстовый канал!",
        "en-US": "You must specify a text channel!",
        "uk": "Ви повинні вказати текстовий канал!"
    },
    "rm_no_perms": {
        "ru": "У вас нет разрешения \"Управление ролями\" для использования этой команды.",
        "en-US": "You do not have 'Manage Roles' permission to use this command.",
        "uk": "Ви не маєте дозволу \"Керування ролями\" для використання цієї команди."
    },
    "rm_desc_select": {
        "ru": "Выберите роли, которые вы хотите получить или убрать.",
        "en-US": "Select roles you want to get or remove.",
        "uk": "Виберіть ролі, які ви хочете отримати або прибрати."
    },
    "rm_placeholder": {
        "ru": "Выберите ваши роли...",
        "en-US": "Select your roles...",
        "uk": "Виберіть ваші ролі..."
    },
    "rm_available_roles": {
        "ru": "Доступные роли:",
        "en-US": "Available roles:",
        "uk": "Доступні ролі:"
    },
    "rm_no_roles_yet": {
        "ru": "Пока нет доступных ролей",
        "en-US": "No available roles yet",
        "uk": "Поки немає доступних ролей"
    },
    "rm_footer_select": {
        "ru": "Используйте меню ниже для выбора ролей.",
        "en-US": "Use the menu below to select roles.",
        "uk": "Використовуйте меню нижче для вибору ролей."
    },
    "rm_no_roles_in_menu": {
        "ru": "Нет ролей в меню.",
        "en-US": "No roles in the menu.",
        "uk": "Немає ролей у меню."
    },
    "rm_add_hint": {
        "ru": "Используйте команду /rolemenu add-role, чтобы добавить роли.",
        "en-US": "Use the /rolemenu add-role command to add roles.",
        "uk": "Використовуйте команду /rolemenu add-role, щоб додати ролі."
    },
    "rm_channel_fail": {
        "ru": "Указанный канал не является текстовым каналом или недоступен.",
        "en-US": "The specified channel is not a text channel or is unavailable.",
        "uk": "Вказаний канал не є текстовим каналом або недоступний."
    },
    "rm_select_success": {
        "ru": "Сообщение с **Select Menu** выбора ролей успешно создано в {channel}! Его ID: `{id}`. Теперь используйте `/rolemenu add-role` для добавления ролей.",
        "en-US": "A role selection **Select Menu** message was successfully created in {channel}! Its ID: `{id}`. Now use `/rolemenu add-role` to add roles.",
        "uk": "Повідомлення з **Select Menu** вибору ролей успішно створено у {channel}! Його ID: `{id}`. Тепер використовуйте `/rolemenu add-role` для додавання ролей."
    },
    "rm_select_error": {
        "ru": "Произошла ошибка при создании сообщения с Select Menu. Проверьте права бота.",
        "en-US": "An error occurred while creating the Select Menu message. Check bot permissions.",
        "uk": "Виникла помилка під час створення повідомлення з Select Menu. Перевірте дозволи бота."
    },
    "rm_no_send_perms": {
        "ru": " У меня нет достаточных прав для отправки сообщений в этом канале.",
        "en-US": " I do not have sufficient permissions to send messages in this channel.",
        "uk": " Я не маю достатніх дозволів для надсилання повідомлень у цьому каналі."
    },
    "rm_desc_buttons": {
        "ru": "Нажмите кнопку, чтобы получить/убрать роль.",
        "en-US": "Click a button to get/remove a role.",
        "uk": "Натисніть кнопку, щоб отримати/прибрати роль."
    },
    "rm_footer_buttons": {
        "ru": "Нажмите на кнопку, чтобы управлять ролью.",
        "en-US": "Click a button to manage a role.",
        "uk": "Натисніть на кнопку, щоб керувати роллю."
    },
    "rm_buttons_success": {
        "ru": "Сообщение с **кнопками** для ролей успешно создано в {channel}! Его ID: `{id}`. Теперь используйте `/rolemenu add-role` для добавления ролей (до 25 кнопок).",
        "en-US": "A role **buttons** message was successfully created in {channel}! Its ID: `{id}`. Now use `/rolemenu add-role` to add roles (up to 25 buttons).",
        "uk": "Повідомлення з **кнопками** для ролей успішно створено у {channel}! Його ID: `{id}`. Тепер використовуйте `/rolemenu add-role` для додавання ролей (до 25 кнопок)."
    },
    "rm_buttons_error": {
        "ru": "Произошла ошибка при создании сообщения с кнопками ролей. Проверьте права бота.",
        "en-US": "An error occurred while creating the role buttons message. Check bot permissions.",
        "uk": "Виникла помилка під час створення повідомлення з кнопками ролей. Перевірте дозволи бота."
    },
    "rm_invalid_id": {
        "ru": "Указанный ID сообщения не является действительным ID сообщения с меню ролей на этом сервере.",
        "en-US": "The specified message ID is not a valid role menu message ID on this server.",
        "uk": "Вказаний ID повідомлення не є дійсним ID повідомлення з меню ролей на цьому сервері."
    },
    "rm_role_no_edit": {
        "ru": "Я не могу управлять этой ролью (возможно, она выше моей в иерархии или является встроенной).",
        "en-US": "I cannot manage this role (it may be higher than mine in the hierarchy or built-in).",
        "uk": "Я не можу керувати цією роллю (можливо, вона вище моєї в ієрархії або є вбудованою)."
    },
    "rm_managed_role": {
        "ru": "Я не могу добавить управляемые роли (например, роли ботов или интеграций).",
        "en-US": "I cannot add managed roles (e.g., bot or integration roles).",
        "uk": "Я не можу додати керовані ролі (наприклад, ролі ботів або інтеграцій)."
    },
    "rm_max_roles": {
        "ru": "Вы достигли максимального количества ролей (25) для этого меню.",
        "en-US": "You have reached the maximum number of roles (25) for this menu.",
        "uk": "Ви досягли максимальної кількості ролей (25) для цього меню."
    },
    "rm_invalid_emoji": {
        "ru": "Неверный формат эмодзи. Используйте стандартный эмодзи или кастомный эмодзи в формате `<:name:id>` (для анимированных `<a:name:id>`).",
        "en-US": "Invalid emoji format. Use a standard emoji or custom emoji in `<:name:id>` format (for animated `<a:name:id>`).",
        "uk": "Неправильний формат емодзі. Використовуйте стандартний емодзі або кастомний емодзі у форматі `<:name:id>` (для анімованих `<a:name:id>`)."
    },
    "rm_role_exists": {
        "ru": "Роль **{roleName}** уже есть в этом меню.",
        "en-US": "Role **{roleName}** is already in this menu.",
        "uk": "Роль **{roleName}** вже є в цьому меню."
    },
    "rm_role_added_wait": {
        "ru": "Роль **{roleName}** добавлена в меню. Обновляю сообщение...",
        "en-US": "Role **{roleName}** added to the menu. Updating message...",
        "uk": "Роль **{roleName}** додана в меню. Оновлюю повідомлення..."
    },
    "rm_role_not_found": {
        "ru": "Роль **{roleName}** не найдена в этом меню.",
        "en-US": "Role **{roleName}** not found in this menu.",
        "uk": "Роль **{roleName}** не знайдена в цьому меню."
    },
    "rm_role_removed_wait": {
        "ru": "Роль **{roleName}** удалена из меню. Обновляю сообщение...",
        "en-US": "Role **{roleName}** removed from the menu. Updating message...",
        "uk": "Роль **{roleName}** видалена з меню. Оновлюю повідомлення..."
    },
    "rm_msg_deleted_channel": {
        "ru": "Канал для этого меню не найден или не является текстовым. Данные меню были удалены.",
        "en-US": "Channel for this menu not found or is not a text channel. Menu data has been deleted.",
        "uk": "Канал для цього меню не знайдено або він не є текстовим. Дані меню були видалені."
    },
    "rm_msg_deleted_not_found": {
        "ru": "Сообщение для этого меню не найдено. Данные меню были удалены.",
        "en-US": "Message for this menu not found. Menu data has been deleted.",
        "uk": "Повідомлення для цього меню не знайдено. Дані меню були видалені."
    },
    "rm_last_update": {
        "ru": "Последнее обновление",
        "en-US": "Last update",
        "uk": "Останнє оновлення"
    },
    "rm_update_success": {
        "ru": "Сообщение с меню ролей успешно обновлено!",
        "en-US": "Role menu message has been updated successfully!",
        "uk": "Повідомлення з меню ролей успішно оновлено!"
    },
    "rm_update_error": {
        "ru": "Произошла ошибка при обновлении сообщения с меню ролей. Проверьте права бота.",
        "en-US": "Error occurred while updating role menu message. Check bot permissions.",
        "uk": "Виникла помилка під час оновлення повідомлення з меню ролей. Перевірте дозволи бота."
    },
    "rm_edit_perms_error": {
        "ru": " У меня нет достаточных прав для редактирования этого сообщения или оно было удалено.",
        "en-US": " I don't have enough permissions to edit this message or it was deleted.",
        "uk": " У мене немає достатніх прав для редагування цього повідомлення або воно було видалено."
    },
    "rm_msg_deleted2": {
        "ru": " Сообщение не найдено или было удалено. Данные меню были удалены.",
        "en-US": " Message not found or was deleted. Menu data has been deleted.",
        "uk": " Повідомлення не знайдено або було видалено. Дані меню були видалені."
    },
    "rm_delete_success": {
        "ru": "Сообщение с меню ролей и его данные успешно удалены.",
        "en-US": "Role menu message and its data were successfully deleted.",
        "uk": "Повідомлення з меню ролей та його дані успішно видалено."
    },
    "rm_delete_error": {
        "ru": "Произошла ошибка при удалении сообщения с меню ролей.",
        "en-US": "An error occurred while deleting the role menu message.",
        "uk": "Виникла помилка під час видалення повідомлення з меню ролей."
    },
    "rm_delete_perms_error": {
        "ru": " У меня нет достаточных прав для удаления этого сообщения. Проверьте разрешения \"Управление сообщениями\".",
        "en": " I do not have sufficient permissions to delete this message. Check the \"Manage messages\" permissions.",
        "uk": " У мене немає достатніх прав для видалення цього повідомлення. Перевірте дозволи \"Керування повідомленнями\"."
    },
    "room_not_in_voice": {
        "ru": "Вы не находитесь в голосовом канале.",
        "en": "You are not in a voice channel.",
        "uk": "Ви не знаходитесь у голосовому каналі."
    },
    "room_not_yours": {
        "ru": "Эту команду можно использовать только в созданной вами динамической комнате.",
        "en": "This command can only be used in a dynamic room you created.",
        "uk": "Цю команду можна використовувати лише у створеній вами динамічній кімнаті."
    },
    "room_not_creator": {
        "ru": "Только создатель этой комнаты может управлять её настройками.",
        "en": "Only the creator of this room can manage its settings.",
        "uk": "Тільки творець цієї кімнати може керувати її налаштуваннями."
    },
    "room_renamed": {
        "ru": "Название комнаты изменено на «{newName}».",
        "en": "Room name changed to \"{newName}\".",
        "uk": "Назву кімнати змінено на \"{newName}\"."
    },
    "room_limit_removed": {
        "ru": "Лимит участников снят.",
        "en": "Participant limit removed.",
        "uk": "Ліміт учасників знято."
    },
    "room_limit_set": {
        "ru": "Лимит участников установлен: {num}.",
        "en": "Participant limit set: {num}.",
        "uk": "Ліміт учасників встановлено: {num}."
    },
    "room_locked": {
        "ru": "Комната закрыта. Никто (кроме вас) не сможет подключиться.",
        "en": "Room locked. No one (except you) can connect.",
        "uk": "Кімнату закрито. Ніхто (крім вас) не зможе підключитися."
    },
    "room_unlocked": {
        "ru": "Комната открыта для подключения.",
        "en": "Room unlocked for connection.",
        "uk": "Кімнату відкрито для підключення."
    },
    "room_no_private_role": {
        "ru": "Ошибка: Приватная роль не настроена в конфигурации бота.",
        "en": "Error: Private role is not configured in the bot settings.",
        "uk": "Помилка: Приватна роль не налаштована в конфігурації бота."
    },
    "room_made_private": {
        "ru": "Комната сделана приватной и видна только избранной роли.",
        "en": "The room was made private and is visible only to the selected role.",
        "uk": "Кімнату зроблено приватною та її видно лише вибраній ролі."
    },
    room_made_public: {
        ru: 'Комната сделана публичной и видна всем.',
        en: 'The room was made public and is visible to everyone.',
        uk: 'Кімнату зроблено публічною та її видно всім.'
    },
    setting_enabled: {
        ru: 'Включено',
        en: 'Enabled',
        uk: 'Увімкнено'
    },
    setting_disabled: {
        ru: 'Выключено',
        en: 'Disabled',
        uk: 'Вимкнено'
    },
    setting_not_set: {
        ru: 'Не задан(а)',
        en: 'Not set',
        uk: 'Не задано'
    },
    setting_title: {
        ru: 'Настройки сервера {guildName}',
        en: 'Server settings for {guildName}',
        uk: 'Налаштування сервера {guildName}'
    },
    setting_desc: {
        ru: 'Используйте меню и кнопки ниже для изменения параметров.',
        en: 'Use the menus and buttons below to change the settings.',
        uk: 'Використовуйте меню та кнопки нижче для зміни параметрів.'
    },
    setting_welcome_logs: {
        ru: 'Приветствия и Логи',
        en: 'Welcome and Logs',
        uk: 'Привітання та Логи'
    },
    setting_welcome_logs_val: {
        ru: '> **Канал приветствий:** {valWelcome}\n> **Лог приглашений:** {valInvites}\n> **Уведомлять о входе/выходе:** {statusMembers}\n> **Уведомлять о ссылках:** {statusInvites}',
        en: '> **Welcome channel:** {valWelcome}\n> **Invite logs:** {valInvites}\n> **Notify on join/leave:** {statusMembers}\n> **Notify on links:** {statusInvites}',
        uk: '> **Канал привітань:** {valWelcome}\n> **Лог запрошень:** {valInvites}\n> **Сповіщати про вхід/вихід:** {statusMembers}\n> **Сповіщати про посилання:** {statusInvites}'
    },
    setting_private_voice: {
        ru: 'Приватные комнаты',
        en: 'Private Voice',
        uk: 'Приватні кімнати'
    },
    setting_private_voice_val: {
        ru: '> **Категория:** {valVoiceCat}\n> **Создать Комнату:** {valVoiceMain}',
        en: '> **Category:** {valVoiceCat}\n> **Create Room:** {valVoiceMain}',
        uk: '> **Категорія:** {valVoiceCat}\n> **Створити Кімнату:** {valVoiceMain}'
    },
    setting_support_reports: {
        ru: 'Поддержка и Жалобы',
        en: 'Support and Reports',
        uk: 'Підтримка та Скарги'
    },
    setting_support_reports_val: {
        ru: '> **Канал поддержки:** {valSupport}\n> **Канал жалоб:** {valReports}',
        en: '> **Support channel:** {valSupport}\n> **Reports channel:** {valReports}',
        uk: '> **Канал підтримки:** {valSupport}\n> **Канал скарг:** {valReports}'
    },
    setting_footer: {
        ru: 'Настройки обновляются в реальном времени',
        en: 'Settings are updated in real-time',
        uk: 'Налаштування оновлюються в режимі реального часу'
    },
    setting_select_welcome: {
        ru: 'Выбрать канал приветствий',
        en: 'Select welcome channel',
        uk: 'Вибрати канал привітань'
    },
    setting_select_voice: {
        ru: 'Выбрать канал "Создать комнату"',
        en: 'Select "Create Voice" channel',
        uk: 'Вибрати канал "Створити кімнату"'
    },
    setting_menu_actions: {
        ru: 'Дополнительные настройки каналов...',
        en: 'Additional channel settings...',
        uk: 'Додаткові налаштування каналів...'
    },
    setting_act_cat_label: {
        ru: 'Задать категорию войсов',
        en: 'Set voice category',
        uk: 'Задати категорію войсів'
    },
    setting_act_cat_desc: {
        ru: 'Где будут создаваться личные комнаты',
        en: 'Where personal rooms will be created',
        uk: 'Де будуть створюватися особисті кімнати'
    },
    setting_act_log_label: {
        ru: 'Задать канал логов',
        en: 'Set log channel',
        uk: 'Задати канал логів'
    },
    setting_act_log_desc: {
        ru: 'Куда писать о приглашениях',
        en: 'Where to post invite logs',
        uk: 'Куди писати про запрошення'
    },
    setting_act_sup_label: {
        ru: 'Задать канал поддержки',
        en: 'Set support channel',
        uk: 'Задати канал підтримки'
    },
    setting_act_sup_desc: {
        ru: 'Куда приходят тикеты',
        en: 'Where tickets arrive',
        uk: 'Куди надходять тікети'
    },
    setting_act_rep_label: {
        ru: 'Задать канал жалоб',
        en: 'Set reports channel',
        uk: 'Задати канал скарг'
    },
    setting_act_rep_desc: {
        ru: 'Куда приходят репорты',
        en: 'Where reports arrive',
        uk: 'Куди надходять репорти'
    },
    setting_act_reset_label: {
        ru: 'СБРОСИТЬ ВСЁ',
        en: 'RESET ALL',
        uk: 'СКИНУТИ ВСЕ'
    },
    setting_act_reset_desc: {
        ru: 'Удалить все настройки (Опасно!)',
        en: 'Delete all settings (Dangerous!)',
        uk: 'Видалити всі налаштування (Небезпечно!)'
    },
    setting_toggle_invites: {
        ru: 'Лог ссылок:',
        en: 'Link Logs:',
        uk: 'Лог посилань:'
    },
    setting_toggle_members: {
        ru: 'Лог входа:',
        en: 'Join Logs:',
        uk: 'Лог входу:'
    },
    setting_toggle_on: {
        ru: 'ВКЛ',
        en: 'ON',
        uk: 'УВІМК'
    },
    setting_toggle_off: {
        ru: 'ВЫКЛ',
        en: 'OFF',
        uk: 'ВИМК'
    },
    setting_prompt_text: {
        ru: 'Выберите текстовый канал:',
        en: 'Select a text channel:',
        uk: 'Виберіть текстовий канал:'
    },
    setting_prompt_cat: {
        ru: 'Выберите категорию для войсов:',
        en: 'Select a voice category:',
        uk: 'Виберіть категорію для войсів:'
    },
    setting_saved: {
        ru: 'Сохранено!',
        en: 'Saved!',
        uk: 'Збережено!'
    },
    setting_timeout: {
        ru: 'Время ожидания выбора истекло.',
        en: 'Selection timeout.',
        uk: 'Час очікування вибору минув.'
    },
    setting_save_error: {
        ru: 'Произошла ошибка при сохранении.',
        en: 'An error occurred while saving.',
        uk: 'Сталася помилка під час збереження.'
    },
    user_no_perms: {
        ru: 'У вас недостаточно прав для выполнения действия',
        en: 'You do not have enough permissions to perform this action',
        uk: 'У вас недостатньо прав для виконання дії'
    },
    user_not_in_voice: {
        ru: 'Участник не находится в голосовом канале!',
        en: 'The member is not in a voice channel!',
        uk: 'Учасник не знаходиться в голосовому каналі!'
    },
    user_kicked_from_voice: {
        ru: '{member} кикнут из {channel}.',
        en: '{member} kicked from {channel}.',
        uk: '{member} вигнаний з {channel}.'
    },
    user_voice_deafened: {
        ru: '\n+ Выключен звук',
        en: '\n+ Deafened',
        uk: '\n+ Вимкнено звук'
    },
    user_voice_muted: {
        ru: '\n+ Выключен микрофон',
        en: '\n+ Muted',
        uk: '\n+ Вимкнено мікрофон'
    },
    user_voice_undeafened: {
        ru: '\n+ Включен звук',
        en: '\n+ Undeafened',
        uk: '\n+ Увімкнено звук'
    },
    user_voice_unmuted: {
        ru: '\n+ Включен микрофон',
        en: '\n+ Unmuted',
        uk: '\n+ Увімкнено мікрофон'
    },
    user_moved: {
        ru: '{member} перемещён из {oldChannel} в {newChannel}.',
        en: '{member} moved from {oldChannel} to {newChannel}.',
        uk: '{member} переміщений з {oldChannel} в {newChannel}.'
    },
    user_voice_changed: {
        ru: '{member} изменён',
        en: '{member} modified',
        uk: '{member} змінений'
    },
    user_voice_debug: {
        ru: 'Ничего не произошло. Доп информация:\nканал не выбран и `kick=true`?: {channel} {kick}. ожидаемое действие, если оба true: исключение {member}.\nканал выбран и `kick=false`?: {channel} {kick}. ожидаемое действие, если оба true: перемещение из {oldChannel} в {channel}.\nканал не выбран и `kick=false`, `deaf` или `mute`= true?: {channel} {kick} {deaf} {mute}. ожидаемое действие, если хотя бы три = true: мут/размут, выключение/включение звука.\nЕсли вы ничего не понимаете, сделайте скриншот этого сообщения и отправьте куда-нибудь бог знает куда',
        en: 'Nothing happened. Additional info:\nchannel not selected and `kick=true`?: {channel} {kick}. expected action if both true: kick {member}.\nchannel selected and `kick=false`?: {channel} {kick}. expected action if both true: move from {oldChannel} to {channel}.\nchannel not selected and `kick=false`, `deaf` or `mute`= true?: {channel} {kick} {deaf} {mute}. expected action if at least three = true: mute/unmute, deafen/undeafen.\nIf you don\'t understand anything, take a screenshot of this message and send it god knows where',
        uk: 'Нічого не сталося. Дод. інформація:\nканал не вибрано та `kick=true`?: {channel} {kick}. очікувана дія, якщо обидва true: вигнання {member}.\nканал вибрано та `kick=false`?: {channel} {kick}. очікувана дія, якщо обидва true: переміщення з {oldChannel} в {channel}.\nканал не вибрано та `kick=false`, `deaf` або `mute`= true?: {channel} {kick} {deaf} {mute}. очікувана дія, якщо хоча б три = true: мут/розмут, вимкнення/увімкнення звуку.\nЯкщо ви нічого не розумієте, зробіть скріншот цього повідомлення та відправте кудись бог знає куди'
    },
    user_invalid: {
        ru: 'Неверный участник!',
        en: 'Invalid member!',
        uk: 'Невірний учасник!'
    },
    user_bot_role_lower: {
        ru: 'Моя позиция роли ниже выбранной роли',
        en: 'My role position is lower than the selected role',
        uk: 'Моя позиція ролі нижча за вибрану роль'
    },
    user_role_added: {
        ru: 'Роль {roleName} выдана {member}({username})',
        en: 'Role {roleName} added to {member}({username})',
        uk: 'Роль {roleName} видана {member}({username})'
    },
    user_role_removed: {
        ru: 'Роль {roleName} убрана у {member}({username})',
        en: 'Role {roleName} removed from {member}({username})',
        uk: 'Роль {roleName} прибрана у {member}({username})'
    }
}