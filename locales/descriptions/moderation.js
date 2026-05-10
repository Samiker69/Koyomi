const moderation = {
  "automod-native": {
    "name": { "en-US": "automod-native", "ru": "автомод", "uk": "автомод" },
    "description": { "en-US": "Manage Discord native auto-moderation rules", "ru": "Управление встроенными правилами автомодерации Discord", "uk": "Керування вбудованими правилами автомодерації Discord" },
    "options": {
      "add-keyword": {
        "name": { "en-US": "add-keyword", "ru": "добавить-ключевое-слово", "uk": "додати-ключове-слово" },
        "description": { "en-US": "Add a new keyword filter rule", "ru": "Добавляет новое правило фильтрации слов", "uk": "Додає нове правило фільтрації слів" },
        "options": {
          "name": { "name": { "en-US": "name", "ru": "название", "uk": "назва" }, "description": { "en-US": "Rule name", "ru": "Название правила", "uk": "Назва правила" } },
          "keywords": { "name": { "en-US": "keywords", "ru": "ключевые-слова", "uk": "ключові-слова" }, "description": { "en-US": "Keywords/phrases (comma separated)", "ru": "Слова или фразы (через запятую)", "uk": "Слова або фрази (через кому)" } },
          "action": { "name": { "en-US": "action", "ru": "действие", "uk": "дія" }, "description": { "en-US": "Action on trigger", "ru": "Действие при срабатывании", "uk": "Дія при спрацьовуванні" } },
          "timeout_duration": { "name": { "en-US": "timeout_duration", "ru": "длительность_таймаута", "uk": "тривалість_таймауту" }, "description": { "en-US": "Timeout in seconds", "ru": "Длительность таймаута в секундах", "uk": "Тривалість таймауту в секундах" } },
          "block_message": { "name": { "en-US": "block_message", "ru": "сообщение_блокировки", "uk": "повідомлення_блокування" }, "description": { "en-US": "Custom message when blocked", "ru": "Сообщение при блокировке", "uk": "Повідомлення при блокуванні" } },
          "exempt_roles": { "name": { "en-US": "exempt_roles", "ru": "исключенные_роли", "uk": "виключені_ролі" }, "description": { "en-US": "Roles to exempt", "ru": "Роли-исключения", "uk": "Ролі-виключення" } },
          "exempt_channels": { "name": { "en-US": "exempt_channels", "ru": "исключенные_каналы", "uk": "виключені_канали" }, "description": { "en-US": "Channels to exempt", "ru": "Каналы-исключения", "uk": "Канали-виключення" } }
        }
      },
      "edit": {
        "name": { "en-US": "edit", "ru": "изменить", "uk": "змінити" },
        "description": { "en-US": "Edit an existing rule", "ru": "Редактирует существующее правило", "uk": "Редагує існуюче правило" },
        "options": {
          "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to edit", "ru": "Выберите правило для редактирования", "uk": "Оберіть правило для редагування" } },
          "name": { "name": { "en-US": "name", "ru": "название", "uk": "назва" }, "description": { "en-US": "New name", "ru": "Новое название", "uk": "Нова назва" } },
          "keywords": { "name": { "en-US": "keywords", "ru": "ключевые-слова", "uk": "ключові-слова" }, "description": { "en-US": "New keywords", "ru": "Новые слова", "uk": "Нові слова" } },
          "action": { "name": { "en-US": "action", "ru": "действие", "uk": "дія" }, "description": { "en-US": "New action", "ru": "Новое действие", "uk": "Нова дія" } },
          "timeout_duration": { "name": { "en-US": "timeout_duration", "ru": "длительность_таймаута", "uk": "тривалість_таймауту" }, "description": { "en-US": "New timeout duration", "ru": "Новая длительность таймаута", "uk": "Нова тривалість таймауту" } },
          "block_message": { "name": { "en-US": "block_message", "ru": "сообщение_блокировки", "uk": "повідомлення_блокування" }, "description": { "en-US": "New block message", "ru": "Новое сообщение при блокировке", "uk": "Нове повідомлення при блокуванні" } },
          "exempt_roles": { "name": { "en-US": "exempt_roles", "ru": "исключенные_роли", "uk": "виключені_ролі" }, "description": { "en-US": "New exempt roles", "ru": "Новые роли-исключения", "uk": "Нові ролі-виключення" } },
          "exempt_channels": { "name": { "en-US": "exempt_channels", "ru": "исключенные_каналы", "uk": "виключені_канали" }, "description": { "en-US": "New exempt channels", "ru": "Новые канали-исключения", "uk": "Нові канали-виключення" } },
          "enabled": { "name": { "en-US": "enabled", "ru": "включено", "uk": "увімкнено" }, "description": { "en-US": "Enable/disable rule", "ru": "Включить или отключить правило", "uk": "Увімкнути або вимкнути правило" } }
        }
      },
      "remove": { "name": { "en-US": "remove", "ru": "удалить", "uk": "видалити" }, "description": { "en-US": "Remove a rule", "ru": "Удаляет правило", "uk": "Видаляє правило" }, "options": {
          "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to remove", "ru": "Выберите правило для удаления", "uk": "Оберіть правило для видалення" } }
        }
      },
      "list": { "name": { "en-US": "list", "ru": "список", "uk": "список" }, "description": { "en-US": "List all rules", "ru": "Показывает все правила", "uk": "Показує всі правила" } },
      "view": { "name": { "en-US": "view", "ru": "просмотр", "uk": "перегляд" }, "description": { "en-US": "View rule details", "ru": "Показывает подробности правила", "uk": "Показує подробиці правила" }, "options": {
          "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to view", "ru": "Выберите правило для просмотра", "uk": "Оберіть правило для перегляду" } }
        }
      },
      "toggle": { "name": { "en-US": "toggle", "ru": "переключить", "uk": "переключити" }, "description": { "en-US": "Toggle rule status", "ru": "Включает или отключает правило", "uk": "Увімкнути або вимкнути правило" }, "options": {
          "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to toggle", "ru": "Выберите правило для переключения", "uk": "Оберіть правило для перемикання" } }
        }
      },
      "exempt": { "name": { "en-US": "exempt", "ru": "исключения", "uk": "виключення" }, "description": { "en-US": "Manage exemptions", "ru": "Управление исключениями", "uk": "Керування виключеннями" }, "options": {
          "add-role": { "name": { "en-US": "add-role", "ru": "добавить-роль", "uk": "додати-роль" }, "description": { "en-US": "Add role to exemptions", "ru": "Добавить роль в исключения", "uk": "Додати роль у виключення" }, "options": {
              "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to edit", "ru": "Выберите правило", "uk": "Оберіть правило" } },
              "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Role to add", "ru": "Роль для добавления", "uk": "Роль для додавання" } }
            }
          },
          "remove-role": { "name": { "en-US": "remove-role", "ru": "удалить-роль", "uk": "видалити-роль" }, "description": { "en-US": "Remove role from exemptions", "ru": "Удалить роль из исключений", "uk": "Видалити роль з виключень" }, "options": {
              "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to edit", "ru": "Выберите правило", "uk": "Оберіть правило" } },
              "role": { "name": { "en-US": "role", "ru": "роль", "uk": "роль" }, "description": { "en-US": "Role to remove", "ru": "Роль для удаления", "uk": "Роль для видалення" } }
            }
          },
          "add-channel": { "name": { "en-US": "add-channel", "ru": "добавить-канал", "uk": "додати-канал" }, "description": { "en-US": "Add channel to exemptions", "ru": "Добавить канал в исключения", "uk": "Додати канал у виключення" }, "options": {
              "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to edit", "ru": "Выберите правило", "uk": "Оберіть правило" } },
              "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel to add", "ru": "Канал для добавления", "uk": "Канал для додавання" } }
            }
          },
          "remove-channel": { "name": { "en-US": "remove-channel", "ru": "удалить-канал", "uk": "видалити-канал" }, "description": { "en-US": "Remove channel from exemptions", "ru": "Удалить канал из исключений", "uk": "Видалити канал з виключень" }, "options": {
              "rule_id": { "name": { "en-US": "rule_id", "ru": "айди_правила", "uk": "айді_правила" }, "description": { "en-US": "Rule to edit", "ru": "Выберите правило", "uk": "Оберіть правило" } },
              "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel to remove", "ru": "Канал для удаления", "uk": "Канал для видалення" } }
            }
          }
        }
      },
      "clear-all": { "name": { "en-US": "clear-all", "ru": "очистить-все", "uk": "очистити-все" }, "description": { "en-US": "Remove ALL rules", "ru": "Удаляет ВСЕ правила", "uk": "Видаляє ВСІ правила" } }
    },
    "messages": {
      "not_found": { "ru": "Правило не найдено", "en-US": "Rule not found", "uk": "Правило не знайдено" },
      "not_found_desc": { "ru": "Правило Автомодерации с ID `{id}` не найдено.", "en-US": "Auto-moderation rule with ID `{id}` not found.", "uk": "Правило Автомодерації з ID `{id}` не знайдено." },
      "api_error": { "ru": "Ошибка API", "en-US": "API Error", "uk": "Помилка API" },
      "api_error_desc": { "ru": "Произошла ошибка при получении правила: {error}", "en-US": "An error occurred while fetching the rule: {error}", "uk": "Сталася помилка при отриманні правила: {error}" },
      "no_perms": { "ru": "Недостаточно прав", "en-US": "Insufficient permissions", "uk": "Недостатньо прав" },
      "no_perms_desc": { "ru": "У вас недостаточно прав (ManageGuild) для выполнения этой команды.", "en-US": "You don't have enough permissions (ManageGuild) to perform this command.", "uk": "У вас недостатньо прав (ManageGuild) для виконання цієї команди." },
      "unknown_group": { "ru": "Неизвестная группа", "en-US": "Unknown group", "uk": "Невідома група" },
      "unknown_group_desc": { "ru": "Кажется, такой группы подкоманд не существует.", "en-US": "It seems such a subcommand group does not exist.", "uk": "Здається, такої групи подкоманд не існує." },
      "unknown_sub": { "ru": "Неизвестная подкоманда", "en-US": "Unknown subcommand", "uk": "Невідома підкоманда" },
      "unknown_sub_desc": { "ru": "Кажется, такой подкоманды не существует.", "en-US": "It seems such a subcommand does not exist.", "uk": "Здається, такої підкоманди не існує." },
      "internal_error": { "ru": "Произошла внутренняя ошибка", "en-US": "Internal error occurred", "uk": "Сталася внутрішня помилка" },
      "internal_error_desc": { "ru": "Произошла ошибка при выполнении команды: {error}", "en-US": "An error occurred while executing the command: {error}", "uk": "Сталася помилка при виконанні команди: {error}" },
      "input_error": { "ru": "Ошибка ввода", "en-US": "Input error", "uk": "Помилка введення" },
      "input_error_keywords": { "ru": "Укажите хотя бы одно ключевое слово или фразу.", "en-US": "Specify at least one keyword or phrase.", "uk": "Вкажіть хоча б одне ключове слово або фразу." },
      "action_config_error": { "ru": "Ошибка настройки действия", "en-US": "Action configuration error", "uk": "Помилка налаштування дії" },
      "action_timeout_error": { "ru": "Для действия \"Таймаут\" необходимо указать длительность от 1 до 2419200 секунд (4 недели).", "en-US": "For \"Timeout\" action, specify duration from 1 to 2419200 seconds.", "uk": "Для дії \"Таймаут\" необхідно вказати тривалість від 1 до 2419200 секунд." },
      "action_type_error": { "ru": "Выбран неверный тип действия.", "en-US": "Invalid action type selected.", "uk": "Обрано невірний тип дії." },
      "action_def_error": { "ru": "Не удалось определить действие для правила.", "en-US": "Could not define action for the rule.", "uk": "Не вдалося визначити дію для правила." },
      "rule_added": { "ru": "Правило добавлено", "en-US": "Rule added", "uk": "Правило додано" },
      "rule_added_desc": { "ru": "Создано правило Автомодерации \"{name}\".", "en-US": "Auto-moderation rule \"{name}\" created.", "uk": "Створено правило Автомодерації \"{name}\"." },
      "rule_id_label": { "ru": "ID Правила", "en-US": "Rule ID", "uk": "Rule ID" },
      "trigger_label": { "ru": "Триггер", "en-US": "Trigger", "uk": "Тригер" },
      "keywords_label": { "ru": "Слова/Фразы", "en-US": "Keywords/Phrases", "uk": "Слова/Фрази" },
      "actions_label": { "ru": "Действия", "en-US": "Actions", "uk": "Дії" },
      "exempt_roles_label": { "ru": "Исключенные роли", "en-US": "Exempt roles", "uk": "Виключені ролі" },
      "exempt_channels_label": { "ru": "Исключенные каналы", "en-US": "Exempt channels", "uk": "Виключені канали" },
      "footer_text": { "ru": "Настройка нативного Автомода", "en-US": "Native Automod Setup", "uk": "Налаштування нативного Автомода" },
      "no_changes": { "ru": "Нет изменений", "en-US": "No changes", "uk": "Немає змін" },
      "no_changes_desc": { "ru": "Вы не указали ни одного параметра для изменения правила.", "en-US": "No parameters specified to change the rule.", "uk": "Ви не вказали жодного параметра для зміни правила." },
      "rule_edited": { "ru": "Правило отредактировано", "en-US": "Rule edited", "uk": "Правило відредаговано" },
      "rule_edited_desc": { "ru": "Правило Автомодерации \"{name}\" (ID: `{id}`) успешно отредактировано.", "en-US": "Auto-moderation rule \"{name}\" (ID: `{id}`) successfully edited.", "uk": "Правило Автомодерації \"{name}\" (ID: `{id}`) успішно відредаговано." },
      "updated_data": { "ru": "Обновленные данные", "en-US": "Updated data", "uk": "Оновлені дані" },
      "status_label": { "ru": "Статус", "en-US": "Status", "uk": "Статус" },
      "enabled": { "ru": "Включено", "en-US": "Enabled", "uk": "Увімкнено" },
      "disabled": { "ru": "Отключено", "en-US": "Disabled", "uk": "Вимкнено" },
      "block_msg_action": { "ru": "Блокировать сообщение", "en-US": "Block message", "uk": "Блокувати повідомлення" },
      "timeout_action": { "ru": "Таймаут {sec} сек", "en-US": "Timeout {sec} sec", "uk": "Таймаут {sec} сек" },
      "alert_action": { "ru": "Уведомление в {channel}", "en-US": "Alert in {channel}", "uk": "Сповіщення в {channel}" },
      "rule_deleted": { "ru": "Правило удалено", "en-US": "Rule deleted", "uk": "Правило видалено" },
      "rule_deleted_desc": { "ru": "Правило Автомодерации с ID `{id}` успешно удалено.", "en-US": "Auto-moderation rule with ID `{id}` successfully deleted.", "uk": "Правило Автомодерації з ID `{id}` успішно видалено." },
      "rule_deleted_not_found": { "ru": "Правило Автомодерации с ID `{id}` не найдено или уже было удалено.", "en-US": "Auto-moderation rule with ID `{id}` not found or already deleted.", "uk": "Правило Автомодерації з ID `{id}` не знайдено або вже видалено." },
      "list_title": { "ru": "Список правил Автомодерации", "en-US": "Auto-moderation Rules List", "uk": "Список правил Автомодерації" },
      "list_empty": { "ru": "На этом сервере нет правил Автомодерации.", "en-US": "No auto-moderation rules on this server.", "uk": "На цьому сервері немає правил Автомодерації." },
      "list_total": { "ru": "Всего правил: {count}", "en-US": "Total rules: {count}", "uk": "Всього правил: {count}" },
      "confirm_title": { "ru": "Запрос подтверждения", "en-US": "Confirmation request", "uk": "Запит підтвердження" },
      "confirm_clear_all": { "ru": "Внимание: Вы уверены, что хотите удалить ВСЕ правила нативного Автомода на этом сервере? Это действие нельзя отменить и затронет все правила, даже созданные вручную.", "en-US": "Warning: Are you sure you want to remove ALL native auto-mod rules? This action cannot be undone.", "uk": "Увага: Ви впевнені, що хочете видалити ВСІ правила нативного Автомода на цьому сервері? Цю дію не можна скасувати." },
      "yes_delete_all": { "ru": "Да, удалить ВСЕ", "en-US": "Yes, delete ALL", "uk": "Так, видалити ВСІ" },
      "cancel": { "ru": "Отмена", "en-US": "Cancel", "uk": "Скасувати" },
      "deleting_all": { "ru": "Удаляю все правила...", "en-US": "Deleting all rules...", "uk": "Видаляю всі правила..." },
      "clear_done": { "ru": "Очистка завершена", "en-US": "Cleanup finished", "uk": "Очищення завершено" },
      "clear_done_desc": { "ru": "Запрос на удаление {total} правил отправлен.\nУспешно удалено {deleted}.", "en-US": "Request to delete {total} rules sent.\nSuccessfully deleted {deleted}.", "uk": "Запит на видалення {total} правил відправлено.\nУспішно видалено {deleted}." },
      "failed_deletes": { "ru": "Не удалось удалить следующие правила:", "en-US": "Failed to delete following rules:", "uk": "Не вдалося видалити наступні правила:" },
      "clear_cancelled": { "ru": "Очистка отменена", "en-US": "Cleanup cancelled", "uk": "Очищення скасовано" },
      "clear_cancelled_desc": { "ru": "Отмена удаления правил.", "en-US": "Rule deletion cancelled.", "uk": "Скасування видалення правил." },
      "timeout_or_error": { "ru": "Время истекло или ошибка", "en-US": "Timeout or error", "uk": "Час вийшов або помилка" },
      "timeout_desc": { "ru": "Время ожидания подтверждения истекло или произошла ошибка.", "en-US": "Confirmation timeout expired or an error occurred.", "uk": "Час очікування підтвердження вийшов або сталася помилка." },
      "view_title": { "ru": "Правило Автомодерации: {name}", "en-US": "Auto-moderation Rule: {name}", "uk": "Правило Автомодерації: {name}" },
      "toggle_done": { "ru": "Статус правила обновлен", "en-US": "Rule status updated", "uk": "Статус правила оновлено" },
      "toggle_done_desc": { "ru": "Статус правила \"{name}\" (ID: `{id}`) изменен на **{status}**.", "en-US": "Status of rule \"{name}\" (ID: `{id}`) changed to **{status}**.", "uk": "Статус правила \"{name}\" (ID: `{id}`) змінено на **{status}**." },
      "exempt_updated": { "ru": "Исключения правила обновлены", "en-US": "Rule exemptions updated", "uk": "Виключення правила оновлено" },
      "role_already_exempt": { "ru": "Роль {role} уже в списке исключений для правила \"{name}\".", "en-US": "Role {role} is already in the exemption list for \"{name}\".", "uk": "Роль {role} вже в списку виключень для правила \"{name}\"." },
      "role_not_exempt": { "ru": "Роль {role} не найдена в списке исключений для правила \"{name}\".", "en-US": "Role {role} not found in the exemption list for \"{name}\".", "uk": "Роль {role} не знайдена в списку виключень для правила \"{name}\"." },
      "channel_already_exempt": { "ru": "Канал {channel} уже в списке исключений для правила \"{name}\".", "en-US": "Channel {channel} is already in the exemption list for \"{name}\".", "uk": "Канал {channel} вже в списку виключень для правила \"{name}\"." },
      "channel_not_exempt": { "ru": "Канал {channel} не найдена в списке исключений для правила \"{name}\".", "en-US": "Channel {channel} not found in the exemption list for \"{name}\".", "uk": "Channel {channel} не знайдений в списку виключень для правила \"{name}\"." },
      "role_added_exempt": { "ru": "Роль {role} добавлена в список исключений для правила \"{name}\".", "en-US": "Role {role} added to the exemption list for \"{name}\".", "uk": "Роль {role} додана в список виключень для правила \"{name}\"." },
      "role_removed_exempt": { "ru": "Роль {role} удалена из списка исключений для правила \"{name}\".", "en-US": "Role {role} removed from the exemption list for \"{name}\".", "uk": "Роль {role} видалена з списку виключень для правила \"{name}\"." },
      "channel_added_exempt": { "ru": "Канал {channel} добавлен в список исключений для правила \"{name}\".", "en-US": "Channel {channel} added to the exemption list for \"{name}\".", "uk": "Канал {channel} доданий в список виключень для правила \"{name}\"." },
      "channel_removed_exempt": { "ru": "Канал {channel} удален из списка исключений для правила \"{name}\".", "en-US": "Channel {channel} removed from the exemption list for \"{name}\".", "uk": "Канал {channel} видалений з списку виключень для правила \"{name}\"." },
      "unknown_action": { "ru": "Неизвестное действие", "en-US": "Unknown action", "uk": "Невідома дія" },
      "no_actions": { "ru": "Нет действий", "en-US": "No actions", "uk": "Немає дій" },
      "no_keywords": { "ru": "Нет ключевых слов", "en-US": "No keywords", "uk": "Немає ключових слів" },
      "unknown_trigger": { "ru": "Неизвестный триггер", "en-US": "Unknown trigger", "uk": "Невідомий тригер" },
      "roles_label": { "ru": "Роли", "en-US": "Roles", "uk": "Ролі" },
      "channels_label": { "ru": "Каналы", "en-US": "Channels", "uk": "Канали" },
      "no_exemptions": { "ru": "Нет исключений", "en-US": "No exemptions", "uk": "Немає виключень" },
      "exemptions_label": { "ru": "Исключения", "en-US": "Exemptions", "uk": "Виключення" },
      "spam_trigger": { "ru": "Спам", "en-US": "Spam", "uk": "Спам" },
      "mention_spam_trigger": { "ru": "Спам упоминаниями", "en-US": "Mention Spam", "uk": "Спам згадками" },
      "limit_label": { "ru": "Лимит", "en-US": "Limit", "uk": "Ліміт" },
      "harmful_link_trigger": { "ru": "Вредные ссылки", "en-US": "Harmful Links", "uk": "Шкідливі посилання" },
      "list_desc": { "ru": "Список активных правил автомодерации:", "en-US": "List of active auto-moderation rules:", "uk": "Список активних правил автомодерації:" },
      "rule_label": { "ru": "Правило", "en-US": "Rule", "uk": "Правило" },
      "footer_created_by": { "ru": "Создано пользователем", "en-US": "Created by", "uk": "Створено користувачем" },
      "role_not_specified": { "ru": "Роль не указана.", "en-US": "Role not specified.", "uk": "Роль не вказана." },
      "channel_not_specified": { "ru": "Канал не указан.", "en-US": "Channel not specified.", "uk": "Канал не вказаний." },
      "unknown_exempt_subcommand": { "ru": "Неизвестная подкоманда исключений.", "en-US": "Unknown exemption subcommand.", "uk": "Невідома підкоманда виключень." },
      "exempt_error": { "ru": "Ошибка управления исключениями", "en-US": "Exemption management error", "uk": "Помилка керування виключеннями" },
      "current_exemptions_label": { "ru": "Текущие исключения", "en-US": "Current exemptions", "uk": "Поточні виключення" },
      "and_more": { "ru": "и еще {count}", "en-US": "and {count} more", "uk": "та ще {count}" }
    }
  },
  "case": {
    "name": { "en-US": "case", "ru": "кейс", "uk": "кейс" },
    "description": { "en-US": "Moderation case actions", "ru": "Действия с модерационными кейсами", "uk": "Дії з модераційними кейсами" },
    "options": {
      "remove": { "name": { "en-US": "remove", "ru": "удалить", "uk": "видалити" }, "description": { "en-US": "Remove a moderation case", "ru": "Удаляет модерационный кейс", "uk": "Видаляет модерационный кейс" }, "options": {
          "num": { "name": { "en-US": "num", "ru": "номер", "uk": "номер" }, "description": { "en-US": "Case number", "ru": "Номер кейса", "uk": "Номер кейсу" } }
        }
      },
      "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Change case reason", "ru": "Сменить причину кейса", "uk": "Змінити причину кейса" }, "options": {
          "num": { "name": { "en-US": "num", "ru": "номер", "uk": "номер" }, "description": { "en-US": "Case number", "ru": "Номер кейса", "uk": "Номер кейсу" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Specify the new reason", "ru": "Укажите новую причину", "uk": "Вкажіть нову причину" } }
        }
      },
      "view": { "name": { "en-US": "view", "ru": "просмотр", "uk": "перегляд" }, "description": { "en-US": "Show specified case", "ru": "Показывает указанный кейс", "uk": "Показує вказаний кейс" }, "options": {
          "num": { "name": { "en-US": "num", "ru": "номер", "uk": "номер" }, "description": { "en-US": "Case number", "ru": "Номер кейса", "uk": "Номер кейсу" } }
        }
      },
      "user_punishments": { "name": { "en-US": "user_punishments", "ru": "наказания_пользователя", "uk": "покарання_користувача" }, "description": { "en-US": "Check user punishment history", "ru": "Проверить историю наказаний пользователя", "uk": "Перевірити історію покарань користувача" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to check punishments for", "ru": "Пользователь для проверки наказаний", "uk": "Користувач для перевірки покарань" } }
        }
      }
    },
    "messages": {
      "case_removed": { "ru": "Кейс `#{num}` удалён", "en-US": "Case `#{num}` removed", "uk": "Кейс `#{num}` видалено" },
      "case_remove_error": { "ru": "Кейс `#{num}` не был удалён. Возможно, вы указали неверный номер кейса", "en-US": "Case `#{num}` was not removed. Maybe the case number is invalid", "uk": "Кейс `#{num}` не був видалений. Можливо, ви вказали невірний номер кейсу" },
      "reason_updated": { "ru": "Причина кейса `#{num}` обновлена", "en-US": "Reason for case `#{num}` updated", "uk": "Причину кейса `#{num}` оновлено" },
      "reason_update_error": { "ru": "Причина кейса `#{num}` не обновлена. Возможно, вы указали неверный номер кейса", "en-US": "Reason for case `#{num}` was not updated. Maybe the case number is invalid", "uk": "Причину кейса `#{num}` не оновлено. Можливо, ви вказали невірний номер кейсу" },
      "case_not_found": { "ru": "Кейс не найден!", "en-US": "Case not found!", "uk": "Кейс не знайдено!" },
      "history_title": { "ru": "История наказаний для {user}", "en-US": "Punishment history for {user}", "uk": "Історія покарань для {user}" },
      "history_empty": { "ru": "У **{user}** нет зарегистрированных наказаний на этом сервере.", "en-US": "**{user}** has no registered punishments on this server.", "uk": "У **{user}** немає зареєстрованих покарань на цьому сервері." },
      "history_footer_empty": { "ru": "Пользователь не имеет наказаний", "en-US": "User has no punishments", "uk": "Користувач не має покарань" },
      "history_stats_title": { "ru": "Общая статистика наказаний:", "en-US": "Total punishment statistics:", "uk": "Загальна статистика покарань:" },
      "history_last_title": { "ru": "Последние {count} наказаний:", "en-US": "Last {count} punishments:", "uk": "Останні {count} покарань:" },
      "history_more": { "ru": "Показаны последние {max} наказаний из {total}.", "en-US": "Showing last {max} punishments out of {total}.", "uk": "Показано останні {max} покарань з {total}." },
      "history_footer_total": { "ru": "Всего зарегистрированных наказаний: {count}", "en-US": "Total registered punishments: {count}", "uk": "Всього зареєстрованих покарань: {count}" },
      "history_times": { "ru": "раз(а)", "en-US": "time(s)", "uk": "раз(ів)" }
    }
  },
  "channel": {
    "name": { "en-US": "channel", "ru": "канал", "uk": "канал" },
    "description": { "en-US": "Channel moderation commands", "ru": "Команды для модерации каналов", "uk": "Команди для модерації каналів" },
    "options": {
      "lock": { "name": { "en-US": "lock", "ru": "заблокировать", "uk": "заблокувати" }, "description": { "en-US": "Lock a channel", "ru": "Заблокировать канал", "uk": "Заблокувати канал" }, "options": {
          "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel to lock", "ru": "Канал для блокировки", "uk": "Канал для блокування" } }
        }
      },
      "unlock": { "name": { "en-US": "unlock", "ru": "разблокировать", "uk": "розблокувати" }, "description": { "en-US": "Unlock a channel", "ru": "Разблокировать канал", "uk": "Разблокувати канал" }, "options": {
          "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel to unlock", "ru": "Канал для разблокировки", "uk": "Канал для розблокування" } }
        }
      },
      "slowmode": { "name": { "en-US": "slowmode", "ru": "слоумод", "uk": "слоумод" }, "description": { "en-US": "Set slowmode on a channel", "ru": "Установить слоумод на канале", "uk": "Встановити слоумод на каналі" }, "options": {
          "seconds": { "name": { "en-US": "seconds", "ru": "секунды", "uk": "секунди" }, "description": { "en-US": "Slowmode duration in seconds (0 to disable)", "ru": "Длительность слоумода в секундах (0 = выключить, макс. 21600)", "uk": "Тривалість слоумоду в секундах (0 = вимкнути, макс. 21600)" } },
          "channel": { "name": { "en-US": "channel", "ru": "канал", "uk": "канал" }, "description": { "en-US": "Channel for slowmode", "ru": "Канал для слоумода", "uk": "Канал для слоумоду" } }
        }
      }
    },
    "messages": {
      "no_perms_manage": { "ru": "У вас недостаточно прав для выполнения действия: Управление каналами.", "en-US": "Insufficient permissions: Manage Channels.", "uk": "Недостатньо прав: Керування каналами." },
      "bot_no_perms": { "ru": "У меня недостаточно прав (Управление каналами и/или Управление ролями) для изменения разрешений канала.", "en-US": "I have insufficient permissions (Manage Channels/Roles) to modify channel permissions.", "uk": "У мене недостатньо прав (Керування каналами та/або Ролями) для зміни дозволів каналу." },
      "bot_no_perms_channel": { "ru": "У меня недостаточно прав для управления каналом {channel}.", "en-US": "I have insufficient permissions to manage channel {channel}.", "uk": "У мене недостатньо прав для керування каналом {channel}." },
      "invalid_channel_type": { "ru": "Канал {channel} нельзя блокировать таким способом.", "en-US": "Channel {channel} cannot be locked this way.", "uk": "Канал {channel} не можна заблокувати таким способом." },
      "lock_desc": { "ru": "Канал {channel} заблокирован.", "en-US": "Channel {channel} has been locked.", "uk": "Канал {channel} заблоковано." },
      "mod_label": { "ru": "Модератор", "en-US": "Moderator", "uk": "Модератор" },
      "channel_label": { "ru": "Канал", "en-US": "Channel", "uk": "Канал" },
      "lock_error": { "ru": "Не удалось заблокировать канал {channel}.", "en-US": "Could not lock channel {channel}.", "uk": "Не вдалося заблокувати канал {channel}." },
      "unlock_desc": { "ru": "Канал {channel} разблокирован.", "en-US": "Channel {channel} has been unlocked.", "uk": "Канал {channel} розблоковано." },
      "unlock_error": { "ru": "Не удалось разблокировать канал {channel}.", "en-US": "Could not unlock channel {channel}.", "uk": "Не вдалося розблокувати канал {channel}." },
      "slowmode_invalid_type": { "ru": "На канале {channel} нельзя установить слоумод.", "en-US": "Slowmode cannot be set on channel {channel}.", "uk": "На каналі {channel} не можна встановити слоумод." },
      "slowmode_off": { "ru": "Слоумод отключен на канале {channel}.", "en-US": "Slowmode disabled on channel {channel}.", "uk": "Слоумод вимкнено на каналі {channel}." },
      "slowmode_on": { "ru": "На канале {channel} установлен слоумод: {seconds} секунд.", "en-US": "Slowmode set on channel {channel}: {seconds} seconds.", "uk": "На каналі {channel} встановлено слоумод: {seconds} секунд." },
      "slowmode_duration_label": { "ru": "Длительность", "en-US": "Duration", "uk": "Тривалість" },
      "slowmode_error": { "ru": "Не удалось установить слоумод на канале {channel}.", "en-US": "Could not set slowmode on channel {channel}.", "uk": "Не вдалося встановити слоумод на каналі {channel}." },
      "unknown_sub": { "ru": "Неизвестная подкоманда.", "en-US": "Unknown subcommand.", "uk": "Невідома підкоманда." }
    }
  },
  "message": {
    "name": { "en-US": "message", "ru": "сообщение", "uk": "повідомлення" },
    "description": { "en-US": "Moderation command for managing messages", "ru": "Команда для управления сообщениями", "uk": "Модераційна команда для роботи з повідомленнями" },
    "options": {
      "clear": { "name": { "en-US": "clear", "ru": "очистить", "uk": "очистити" }, "description": { "en-US": "Delete a specified number of messages from users", "ru": "Удаляет указанное количество сообщений от пользователей", "uk": "Видаляє вказану кількість повідомлень від користувачів" }, "options": {
          "amount": { "name": { "en-US": "amount", "ru": "количество", "uk": "кількість" }, "description": { "en-US": "Number of messages to delete (1 to 100)", "ru": "Количество сообщений для удаления (от 1 до 100)", "uk": "Кількість повідомлень для видалення (від 1 до 100)" } }
        }
      },
      "pin": { "name": { "en-US": "pin", "ru": "закрепить", "uk": "закріпити" }, "description": { "en-US": "Pin a message", "ru": "Закрепить сообщение", "uk": "Закріпити повідомлення" }, "options": {
          "id": { "name": { "en-US": "id", "ru": "айди", "uk": "id" }, "description": { "en-US": "Message ID", "ru": "Айди сообщения", "uk": "ID повідомлення" } }
        }
      },
      "unpin": { "name": { "en-US": "unpin", "ru": "открепить", "uk": "відкріпити" }, "description": { "en-US": "Unpin a message", "ru": "Открепить сообщение", "uk": "Відкріпити повідомлення" }, "options": {
          "id": { "name": { "en-US": "id", "ru": "айди", "uk": "id" }, "description": { "en-US": "Message ID", "ru": "Айди сообщения", "uk": "ID повідомлення" } }
        }
      },
      "purge": { "name": { "en-US": "purge", "ru": "очистка", "uk": "очистка" }, "description": { "en-US": "Delete messages from a specific user", "ru": "Удаляет указанное количество сообщений от конкретного пользователя", "uk": "Видаляє вказану кількість повідомлень від конкретного користувача" }, "options": {
          "target": { "name": { "en-US": "target", "ru": "цель", "uk": "ціль" }, "description": { "en-US": "User whose messages should be deleted", "ru": "Пользователь, чьи сообщения нужно удалить", "uk": "Користувач, чиї повідомлення потрібно видалити" } },
          "amount": { "name": { "en-US": "amount", "ru": "количество", "uk": "кількість" }, "description": { "en-US": "Number of messages to delete (1 to 100)", "ru": "Количество сообщений для удаления (от 1 до 100)", "uk": "Кількість повідомлень для видалення (від 1 до 100)" } }
        }
      }
    },
    "messages": {
      "invalid_amount": { "ru": "Укажи количество сообщений от 1 до 100.", "en-US": "Specify message amount from 1 to 100.", "uk": "Вкажіть кількість повідомлень від 1 до 100." },
      "no_messages": { "ru": "Нет сообщений для удаления.", "en-US": "No messages to delete.", "uk": "Немає повідомлень для видалення." },
      "deleted_messages": { "ru": "Удалено {count} сообщений.", "en-US": "Deleted {count} messages.", "uk": "Видалено {count} повідомлень." },
      "clear_error": { "ru": "Произошла ошибка при удалении сообщений.", "en-US": "Error occurred while deleting messages.", "uk": "Сталася помилка при видаленні повідомлень." },
      "id_not_number": { "ru": "`id` не является числом!", "en-US": "`id` is not a number!", "uk": "`id` не є числом!" },
      "message_not_found": { "ru": "Сообщение не найдено!", "en-US": "Message not found!", "uk": "Повідомлення не знайдено!" },
      "pinned": { "ru": "Сообщение было закрепленно ||вы потратили ~3 секунды просто так!!1||", "en-US": "Message pinned ||you wasted ~3 seconds for nothing!!1||", "uk": "Повідомлення было закріплено ||ви витратили ~3 секунди даремно!!1||" },
      "unpinned": { "ru": "Сообщение было открепленно ||вы потратили ~3 секунды просто так!!1||", "en-US": "Message unpinned ||you wasted ~3 seconds for nothing!!1||", "uk": "Повідомлення було відкріплено ||ви витратили ~3 секунди даремно!!1||" },
      "purge_not_found": { "ru": "Не найдено сообщений от {user} среди последних 100 сообщений.", "en-US": "No messages from {user} found among last 100 messages.", "uk": "Не знайдено повідомлень від {user} серед останніх 100 повідомлень." },
      "purge_title": { "ru": "Очистка сообщений", "en-US": "Message Purge", "uk": "Очищення повідомлень" },
      "purge_mod": { "ru": "Модератор", "en-US": "Moderator", "uk": "Модератор" },
      "purge_user": { "ru": "Пользователь", "en-US": "User", "uk": "Користувач" },
      "purge_channel": { "ru": "Канал", "en-US": "Channel", "uk": "Канал" },
      "purge_amount": { "ru": "Удалено сообщений", "en-US": "Messages deleted", "uk": "Видалено повідомлень" },
      "purge_footer": { "ru": "Очистка завершена", "en-US": "Purge completed", "uk": "Очищення завершено" },
      "purge_error": { "ru": "Произошла ошибка при попытке удалить сообщения.", "en-US": "Error occurred while trying to delete messages.", "uk": "Сталася помилка при спробі видалити повідомлення." }
    }
  },
  "modstats": {
    "name": { "en-US": "modstats", "ru": "модстат", "uk": "модстат" },
    "description": { "en-US": "Moderator punishment statistics.", "ru": "Статистика наказаний модераторов.", "uk": "Статистика покарань модераторів." },
    "options": {
      "moderator": { "name": { "en-US": "moderator", "ru": "модератор", "uk": "модератор" }, "description": { "en-US": "Select moderator for statistics.", "ru": "Выберите модератора для статистики.", "uk": "Оберіть модератора для статистики." } }
    },
    "messages": {
      "no_stats_title": { "ru": "Статистика модерации", "en-US": "Moderation Statistics", "uk": "Статистика модерації" },
      "no_stats_desc": { "ru": "На этом сервере пока нет зарегистрированных наказаний. Начните модерировать, чтобы увидеть статистику здесь!", "en-US": "No registered punishments on this server yet. Start moderating to see stats here!", "uk": "На цьому сервері поки немає зареєстрованих покарань. Почніть модерувати, щоб побачити статистику тут!" },
      "no_data_footer": { "ru": "Нет данных для отображения", "en-US": "No data to display", "uk": "Немає даних для відображення" },
      "user_not_mod_title": { "ru": "Статистика модератора", "en-US": "Moderator Statistics", "uk": "Статистика модератора" },
      "user_not_mod_desc": { "ru": "Пользователь **{user}** либо не является модератором, либо ещё не выдавал наказаний на этом сервере.", "en-US": "User **{user}** is either not a moderator or hasn't issued any punishments yet.", "uk": "Користувач **{user}** або не є модератором, або ще не видавав покарань на цьому сервері." },
      "user_not_mod_footer": { "ru": "Проверьте другого пользователя или общую статистику", "en-US": "Check another user or overall stats", "uk": "Перевірте іншого користувача або загальну статистику" },
      "stats_user_title": { "ru": "Статистика: {user}", "en-US": "Statistics: {user}", "uk": "Статистика: {user}" },
      "stats_user_desc": { "ru": "Здесь представлена активность **{user}** по выдаче наказаний.", "en-US": "Here is the punishment activity for **{user}**.", "uk": "Тут представлена активність **{user}** з видачі покарань." },
      "mod_label": { "ru": "Модератор", "en-US": "Moderator", "uk": "Модератор" },
      "total_label": { "ru": "Всего наказаний", "en-US": "Total punishments", "uk": "Всього покарань" },
      "types_label": { "ru": "Типы наказаний:", "en-US": "Punishment types:", "uk": "Типи покарань:" },
      "no_data_label": { "ru": "Нет данных.", "en-US": "No data.", "uk": "Немає даних." },
      "user_footer": { "ru": "Статистика модератора {user}", "en-US": "Moderator statistics for {user}", "uk": "Статистика модератора {user}" },
      "server_title": { "ru": "Общая статистика модераторов", "en-US": "Overall Moderator Statistics", "uk": "Загальна статистика модераторів" },
      "server_desc": { "ru": "Активность модераторов на сервере:\n\u200B", "en-US": "Moderator activity on the server:\n\u200B", "uk": "Активність модераторів на сервері:\n\u200B" },
      "stats_continue": { "ru": "Продолжение статистики", "en-US": "Statistics Continued", "uk": "Продовження статистики" },
      "stats_continue_desc": { "ru": "Показана статистика по {count} модераторам. Для полной информации обратитесь к администратору.", "en-US": "Showing stats for {count} moderators. Contact admin for full info.", "uk": "Показано статистику по {count} модераторам. Для повної інформації зверніться до адміністратора." },
      "total_overall_desc": { "ru": "\n**Общее количество наказаний на сервере: `{total}`**", "en-US": "\n**Total punishments on server: `{total}`**", "uk": "\n**Загальна кількість покарань на сервері: `{total}`**" },
      "server_footer": { "ru": "Общая статистика модерации сервера", "en-US": "Overall server moderation statistics", "uk": "Загальна статистика модерації сервера" },
      "unknown_mod": { "ru": "Неизвестный ({id})", "en-US": "Unknown ({id})", "uk": "Невідомий ({id})" },
      "no_type_details": { "ru": "*Без детализации по типам.*", "en-US": "*No type details.*", "uk": "*Без деталізації по типах.*" }
    }
  },
  "mojotest": {
    "messages": {
      "already_active": { "ru": "Пользователь уже проходит тест!", "en-US": "User is already taking the test!", "uk": "Користувач вже проходить тест!" },
      "remove_roles_error": { "ru": "Не удалось снять роли. Проверьте иерархию бота.", "en-US": "Could not remove roles. Check bot hierarchy.", "uk": "Не вдалося зняти ролі. Перевірте ієрархію бота." },
      "failed_reason": { "ru": "Неверный ответ на MojoTest", "en-US": "Incorrect answer on MojoTest", "uk": "Невірна відповідь на MojoTest" },
      "timeout_reason": { "ru": "Время на ответ в MojoTest вышло", "en-US": "MojoTest time expired", "uk": "Час на відповідь у MojoTest вийшов" },
      "test_title": { "ru": "Проверка Mojo Launcher — Вопрос {current} из {total}", "en-US": "Mojo Launcher Check — Question {current} of {total}", "uk": "Перевірка Mojo Launcher — Питання {current} з {total}" },
      "test_footer": { "ru": "У вас есть 30 секунд. Любая ошибка приведёт к исключению (кик).", "en-US": "You have 30 seconds. Any mistake leads to a kick.", "uk": "У вас є 30 секунд. Будь-яка помилка призведе до виключення (кік)." },
      "test_started": { "ru": "<@{user}>, ваш тест начался! Вы не можете отправлять сообщения.\n**Ошибаться нельзя!**", "en-US": "<@{user}>, your test has started! You cannot send messages.\n**No mistakes allowed!**", "uk": "<@{user}>, ваш тест розпочався! Ви не можете надсилати повідомлення.\n**Помилятися не можна!**" },
      "failed_title": { "ru": "Тест провален", "en-US": "Test Failed", "uk": "Тест провалено" },
      "failed_desc": { "ru": "Пользователь <@{user}> ответил **неверно** и был кикнут с сервера.", "en-US": "User <@{user}> answered **incorrectly** and was kicked from the server.", "uk": "Користувач <@{user}> відповів **невірно** і був виключений з сервера." },
      "fail_msg": { "ru": "<@{user}> провалил тест.", "en-US": "<@{user}> failed the test.", "uk": "<@{user}> провалив тест." },
      "success_title": { "ru": "Тест успешно пройден!", "en-US": "Test Successfully Passed!", "uk": "Тест успішно пройдено!" },
      "success_desc": { "ru": "Пользователь <@{user}> ответил правильно на все 3 вопроса. Ограничения сняты.", "en-US": "User <@{user}> answered all 3 questions correctly. Restrictions removed.", "uk": "Користувач <@{user}> відповів правильно на всі 3 питання. Обмеження знято." },
      "success_msg": { "ru": "Тест пройден!", "en-US": "Test passed!", "uk": "Тест пройдено!" },
      "next_question": { "ru": "<@{user}>, следующий вопрос!", "en-US": "<@{user}>, next question!", "uk": "<@{user}>, наступне питання!" },
      "timeout_title": { "ru": "Время вышло", "en-US": "Time's Up", "uk": "Час вийшов" },
      "timeout_desc": { "ru": "Пользователь <@{user}> не успел ответить на вопрос и был кикнут с сервера.", "en-US": "User <@{user}> did not answer in time and was kicked from the server.", "uk": "Користувач <@{user}> не встиг відповісти на питання і був виключений з сервера." },
      "timeout_msg": { "ru": "Время вышло.", "en-US": "Time's up.", "uk": "Час вийшов." }
    }
  },
  "moderation": {
    "name": { "en-US": "moderation", "ru": "модерация", "uk": "модерація" },
    "description": { "en-US": "All moderation-related commands", "ru": "Все команды модерации", "uk": "Усі команди для модерації" },
    "options": {
      "ban": { "name": { "en-US": "ban", "ru": "бан", "uk": "бан" }, "description": { "en-US": "Ban a user from the server", "ru": "Забанить пользователя на сервере", "uk": "Забанити користувача на сервері" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to ban", "ru": "Пользователь для бана", "uk": "Користувач для бана" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for the ban", "ru": "Причина бана", "uk": "Причина бана" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      },
      "mute": { "name": { "en-US": "mute", "ru": "мут", "uk": "мут" }, "description": { "en-US": "Mute a user", "ru": "Замьютить пользователя", "uk": "Заглушити користувача" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to mute", "ru": "Пользователь для мута", "uk": "Користувач для мута" } },
          "time": { "name": { "en-US": "time", "ru": "время", "uk": "час" }, "description": { "en-US": "Mute duration (e.g., 10m, 1h, 7d). Max 28 days.", "ru": "Длительность мута (например, 10m, 1h, 7d). Макс. 28 дней.", "uk": "Тривалість мута (наприклад, 10m, 1h, 7d). Макс. 28 днів." } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for the mute", "ru": "Причина мута", "uk": "Причина мута" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      },
      "kick": { "name": { "en-US": "kick", "ru": "кик", "uk": "кік" }, "description": { "en-US": "Kick a user from the server", "ru": "Кикнуть пользователя с сервера", "uk": "Викинути користувача з сервера" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to kick", "ru": "Пользователь для кика", "uk": "Користувач для кика" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for the kick", "ru": "Причина кика", "uk": "Причина кика" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      },
      "unmute": { "name": { "en-US": "unmute", "ru": "размут", "uk": "розглушити" }, "description": { "en-US": "Unmute a user", "ru": "Снять мут (таймаут) с пользователя", "uk": "Зняти мут (таймаут) з користувача" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to unmute", "ru": "Пользователь, у которого снимают мут", "uk": "Користувач, з якого знімають мут" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for the unmute", "ru": "Причина снятия мута", "uk": "Причина зняття мута" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      },
      "unban": { "name": { "en-US": "unban", "ru": "разбан", "uk": "розбан" }, "description": { "en-US": "Unban a user by ID", "ru": "Разбанить пользователя по ID", "uk": "Розбанити користувача за ID" }, "options": {
          "userid": { "name": { "en-US": "userid", "ru": "айди-пользователя", "uk": "id-користувача" }, "description": { "en-US": "User ID to unban", "ru": "ID пользователя для разбанивания", "uk": "ID користувача для розбану" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for the unban", "ru": "Причина разбана", "uk": "Причина розбану" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      },
      "warn": { "name": { "en-US": "warn", "ru": "варн", "uk": "варн" }, "description": { "en-US": "Give a warning to a user", "ru": "Выдать предупреждение пользователю", "uk": "Видати попередження користувачеві" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to warn", "ru": "Пользователь для предупреждения", "uk": "Користувач для попередження" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for the warning", "ru": "Причина предупреждения", "uk": "Причина попередження" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      },
      "unwarn": { "name": { "en-US": "unwarn", "ru": "анварн", "uk": "анварн" }, "description": { "en-US": "Remove a warning from a user", "ru": "Снять предупреждение пользователя", "uk": "Зняти попередження користувача" }, "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to remove warning from", "ru": "Пользователь для снятия последнего предупреждения", "uk": "Користувач для зняття останнього попередження" } },
          "case": { "name": { "en-US": "case", "ru": "кейс", "uk": "кейс" }, "description": { "en-US": "Case number of the warning to remove", "ru": "Номер кейса с предупреждением, которое надо снять", "uk": "Номер кейса з попередженням, яке треба зняти" } },
          "reason": { "name": { "en-US": "reason", "ru": "причина", "uk": "причина" }, "description": { "en-US": "Reason for removing the warning", "ru": "Причина снятия предупреждения", "uk": "Причина зняття попередження" } },
          "evidence": { "name": { "en-US": "evidence", "ru": "доказательства", "uk": "докази" }, "description": { "en-US": "Attach evidence (if available)", "ru": "Прикрепите доказательства (если есть)", "uk": "Додайте докази (якщо є)" } }
        }
      }
    },
    "messages": {
      "no_perms": { "ru": "У вас недостаточно прав для выполнения действия", "en-US": "You don't have enough permissions", "uk": "У вас недостатньо прав" },
      "me_no_perms": { "ru": "У меня недостаточно прав для выполнения действия", "en-US": "I don't have enough permissions", "uk": "У мене недостатньо прав" },
      "no_reason": { "ru": "Без причины", "en-US": "No reason", "uk": "Без причини" },
      "ban_done": { "ru": "Бан выполнен", "en-US": "Ban executed", "uk": "Бан виконано" },
      "mute_done": { "ru": "Мут выполнен", "en-US": "Mute executed", "uk": "Мут виконано" },
      "kick_done": { "ru": "Кик выполнен", "en-US": "Kick executed", "uk": "Кик виконано" },
      "unmute_done": { "ru": "Размут выполнен", "en-US": "Unmute executed", "uk": "Розмут виконано" },
      "unban_done": { "ru": "Разбан выполнен", "en-US": "Unban executed", "uk": "Розбан виконано" },
      "warn_done": { "ru": "Предупреждение выдано", "en-US": "Warn executed", "uk": "Попередження видано" },
      "unwarn_done": { "ru": "Предупреждение снято", "en-US": "Warn removed", "uk": "Попередження знято" },
      "unknown_sub": { "ru": "Кажется, такой саб-команды не существует", "en-US": "Unknown subcommand", "uk": "Невідома підкоманда" },
      "self_mod": { "ru": "Ты не можешь применить это действие к самому себе!", "en-US": "You cannot apply this action to yourself!", "uk": "Ти не можеш застосувати цю дію до самого себе!" },
      "owner_mod": { "ru": "Ты не можешь применить это действие к владельцу сервера!", "en-US": "You cannot apply this action to the server owner!", "uk": "Ти не можеш застосувати цю дію до власника сервера!" },
      "user_not_found": { "ru": "Участник не найден на сервере.", "en-US": "Member not found on the server.", "uk": "Учасник не знайдений на сервері." },
      "hierarchy_error": { "ru": "Позиция вашей роли ниже или равна роли выбранного участника.", "en-US": "Your role position is lower or equal to the target's role.", "uk": "Позиція вашої ролі нижче або рівна ролі обраного учасника." },
      "bot_hierarchy_ban": { "ru": "Я не могу забанить этого участника (моя роль ниже).", "en-US": "I cannot ban this member (my role is lower).", "uk": "Я не можу забанити цього учасника (моя роль нижче)." },
      "bot_hierarchy_kick": { "ru": "Я не могу кикнуть этого участника (моя роль ниже).", "en-US": "I cannot kick this member (my role is lower).", "uk": "Я не можу кикнути цього учасника (моя роль нижче)." },
      "bot_hierarchy_mod": { "ru": "Я не могу управлять этим участником (моя роль ниже).", "en-US": "I cannot manage this member (my role is lower).", "uk": "Я не можу керувати цим учасником (моя роль нижче)." },
      "error_ban": { "ru": "Произошла непредвиденная ошибка при попытке забанить пользователя.", "en-US": "Unexpected error occurred while trying to ban user.", "uk": "Сталася непередбачена помилка при спробі забанити користувача." },
      "duration_permanent": { "ru": "постоянно (до 28 дней)", "en-US": "permanent (up to 28 days)", "uk": "постійно (до 28 днів)" },
      "invalid_time": { "ru": "Неверный формат времени. Используйте цифру и единицу (m/h/d/w), например: `10m`, `1h`, `7d`, `2w`.", "en-US": "Invalid time format. Use number and unit (m/h/d/w), e.g., `10m`, `1h`, `7d`, `2w`.", "uk": "Невірний формат часу. Використовуйте цифру та одиницю (m/h/d/w), наприклад: `10m`, `1h`, `7d`, `2w`." },
      "mute_max_duration": { "ru": "Вы не можете замьютить участника на {duration}! Максимальная длительность мута - 28 дней. Превышение: {overflow}.", "en-US": "You cannot mute a member for {duration}! Max duration is 28 days. Overflow: {overflow}.", "uk": "Ви не можете заглушити учасника на {duration}! Максимальна тривалість мута - 28 днів. Перевищення: {overflow}." },
      "mute_positive": { "ru": "Длительность мута должна быть положительной.", "en-US": "Mute duration must be positive.", "uk": "Тривалість мута має бути позитивною." },
      "error_mute": { "ru": "Произошла непредвиденная ошибка при попытке замьютить пользователя.", "en-US": "Unexpected error occurred while trying to mute user.", "uk": "Сталася непередбачена помилка при спробі заглушити користувача." },
      "error_kick": { "ru": "Произошла непредвиденная ошибка при попытке кикнуть пользователя.", "en-US": "Unexpected error occurred while trying to kick user.", "uk": "Сталася непередбачена помилка при спробі кикнути користувача." },
      "error_unmute": { "ru": "Произошла непредвиденная ошибка при попытке размутить пользователя.", "en-US": "Unexpected error occurred while trying to unmute user.", "uk": "Сталася непередбачена помилка при спробі розглушити користувача." },
      "not_banned": { "ru": "Участник не забанен", "en-US": "Member is not banned", "uk": "Учасник не забанений" },
      "by_moderator": { "en-US": " | by {user}", "ru": " | модератор {user}", "uk": " | модератор {user}" },
      "error_unban": { "ru": "Не удалось разбанить участника", "en-US": "Could not unban member", "uk": "Не вдалося разбанити участника" },
      "error_warn": { "ru": "Не удалось выдать предупреждение участнику.", "en-US": "Could not issue warning to member.", "uk": "Не вдалося видати попередження учаснику." },
      "case_not_found": { "ru": "Не удалось найти кейс. Проверьте, что вы указали действительный номер кейса.", "en-US": "Case not found. Check if the case number is valid.", "uk": "Не вдалося знайти кейс. Перевірте, чи ви вказали дійсний номер кейсу." },
      "no_warns": { "ru": "У пользователя нет предупреждений.", "en-US": "User has no warnings.", "uk": "У користувача немає попереджень." },
      "case_not_warn": { "ru": "Этот кейс не относится к предупреждениям! Это {action}", "en-US": "This case is not a warning! It is {action}", "uk": "Цей кейс не відноситься до попереджень! Це {action}" },
      "no_active_punishments": { "ru": "У этого пользователя нет действующих наказаний!", "en-US": "User has no active punishments!", "uk": "У цього користувача немає діючих покарань!" },
      "error_unwarn": { "ru": "Не удалось снять предупреждение.", "en-US": "Could not remove warning.", "uk": "Не вдалося зняти попередження." },
      "invalid_user_id": { "ru": "Указан неверный ID пользователя. ID должен состоять из 17-20 цифр.", "en-US": "Invalid User ID provided. ID must be 17-20 digits.", "uk": "Вказано невірний ID користувача. ID має складатися з 17-20 цифр." },
      "action_done_template": { "ru": "{action} выполнен", "en-US": "{action} executed", "uk": "{action} виконано" },
      "labels": {
        "ban": { "ru": "Бан", "en-US": "Ban", "uk": "Бан" },
        "kick": { "ru": "Кик", "en-US": "Kick", "uk": "Кік" },
        "mute": { "ru": "Мют", "en-US": "Mute", "uk": "Мют" },
        "warn": { "ru": "Предупреждение", "en-US": "Warning", "uk": "Попередження" },
        "unban": { "ru": "Разбан", "en-US": "Unban", "uk": "Розбан" },
        "unmute": { "ru": "Размют", "en-US": "Unmute", "uk": "Розмут" },
        "unwarn": { "ru": "Снятие предупреждения", "en-US": "Warning removal", "uk": "Зняття попередження" }
      }
    }
  },
  "tag": {
    "name": { "en-US": "tag", "ru": "тег", "uk": "тег" },
    "description": { "en-US": "Manage mini-reference tags", "ru": "Управление тегами (мини-справочник)", "uk": "Керування тегами (мінідовідник)" },
    "options": {
      "add": { "name": { "en-US": "add", "ru": "добавить", "uk": "додати" }, "description": { "en-US": "Create a new tag", "ru": "Создать новый тег", "uk": "Створити новий тег" }, "options": {
          "name": { "name": { "en-US": "name", "ru": "имя", "uk": "назва" }, "description": { "en-US": "Unique tag name", "ru": "Уникальное имя тега", "uk": "Унікальна назва тега" } },
          "content": { "name": { "en-US": "content", "ru": "содержимое", "uk": "вміст" }, "description": { "en-US": "Tag content", "ru": "Содержимое тега", "uk": "Вміст тега" } }
        }
      },
      "remove": { "name": { "en-US": "remove", "ru": "удалить", "uk": "видалити" }, "description": { "en-US": "Remove an existing tag", "ru": "Удалить существующий тег", "uk": "Видалити існуючий тег" }, "options": {
          "name": { "name": { "en-US": "name", "ru": "имя", "uk": "назва" }, "description": { "en-US": "Name of the tag to remove", "ru": "Имя тега для удаления", "uk": "Назва тега для видалення" } }
        }
      },
      "edit": { "name": { "en-US": "edit", "ru": "изменить", "uk": "змінити" }, "description": { "en-US": "Change tag content", "ru": "Изменить содержимое тега", "uk": "Змінити вміст тега" }, "options": {
          "name": { "name": { "en-US": "name", "ru": "имя", "uk": "назва" }, "description": { "en-US": "Name of the tag to edit", "ru": "Имя тега для редактирования", "uk": "Назва тега для редагування" } },
          "content": { "name": { "en-US": "content", "ru": "содержимое", "uk": "вміст" }, "description": { "en-US": "New tag content", "ru": "Новое содержимое тега", "uk": "Новий вміст тега" } }
        }
      },
      "get": { "name": { "en-US": "get", "ru": "получить", "uk": "отримати" }, "description": { "en-US": "Show tag content", "ru": "Показать содержимое тега", "uk": "Показати вміст тега" }, "options": {
          "name": { "name": { "en-US": "name", "ru": "имя", "uk": "назва" }, "description": { "en-US": "Tag name", "ru": "Имя тега", "uk": "Назва тега" } }
        }
      },
      "list": { "name": { "en-US": "list", "ru": "список", "uk": "список" }, "description": { "en-US": "Show all server tags", "ru": "Показать все теги сервера", "uk": "Показати всі теги сервера" } }
    },
    "messages": {
      "tag_not_found": { "ru": "Тег не найден.", "en-US": "Tag not found.", "uk": "Тег не знайдено." },
      "tag_added": { "ru": "Тег успешно добавлен.", "en-US": "Tag successfully added.", "uk": "Тег успішно додано." },
      "tag_removed": { "ru": "Тег успешно удален.", "en-US": "Tag successfully removed.", "uk": "Тег успішно видалено." },
      "tag_edited": { "ru": "Тег успешно изменен.", "en-US": "Tag successfully edited.", "uk": "Тег успішно змінено." },
      "already_exists": { "ru": "Тег `{name}` уже существует.", "en-US": "Tag `{name}` already exists.", "uk": "Тег `{name}` вже існує." },
      "created": { "ru": "Тег `{name}` создан.", "en-US": "Tag `{name}` created.", "uk": "Тег `{name}` створено." },
      "not_found_name": { "ru": "Тег `{name}` не найден.", "en-US": "Tag `{name}` not found.", "uk": "Тег `{name}` не знайдено." },
      "removed": { "ru": "Тег `{name}` удалён.", "en-US": "Tag `{name}` removed.", "uk": "Тег `{name}` видалено." },
      "edit_error": { "ru": "Тег `{name}` не найден или ничего не изменено.", "en-US": "Tag `{name}` not found or nothing changed.", "uk": "Тег `{name}` не знайдено або нічого не змінено." },
      "updated": { "ru": "Содержимое тега `{name}` обновлено.", "en-US": "Tag `{name}` content updated.", "uk": "Вміст тега `{name}` оновлено." },
      "tag_label": { "ru": "Тег: {name}", "en-US": "Tag: {name}", "uk": "Тег: {name}" },
      "list_empty": { "ru": "На этом сервере нет тегов.", "en-US": "There are no tags on this server.", "uk": "На цьому сервері немає тегів." },
      "list_title": { "ru": "Список тегов", "en-US": "Tags List", "uk": "Список тегів" },
      "unknown_sub": { "ru": "Неизвестная подкоманда.", "en-US": "Unknown subcommand.", "uk": "Невідома підкоманда." },
      "error": { "ru": "Произошла ошибка при выполнении команды.", "en-US": "An error occurred while executing the command.", "uk": "Сталася помилка при виконанні команди." }
    }
  },
  "iqtest": {
    "name": { "en-US": "iqtest", "ru": "iqтест", "uk": "iqтест" },
    "description": { "en-US": "Run knowledge check (Mojo Launcher) for a user with kick on failure.", "ru": "Запустить проверку знаний (Mojo Launcher) для пользователя с киком при провале.", "uk": "Запустити перевірку знань (Mojo Launcher) для користувача з кіком при провалі." },
    "options": {
      "target": { "name": { "en-US": "target", "ru": "цель", "uk": "ціль" }, "description": { "en-US": "User to test", "ru": "Пользователь, который будет проходить тест", "uk": "Користувач, який проходитиме тест" } }
    },
    "messages": {
      "not_found": { "ru": "Пользователь не найден на сервере.", "en-US": "User not found on the server.", "uk": "Користувач не знайдений на сервері." },
      "no_bots": { "ru": "Боты не могут проходить тесты!", "en-US": "Bots cannot take tests!", "uk": "Боти не можуть проходити тести!" }
    }
  },
  "report": {
    "name": { "en-US": "report", "ru": "жалоба", "uk": "скарга" },
    "description": { "en-US": "Deploy an interactive report panel.", "ru": "Разместить интерактивную панель для подачи жалоб.", "uk": "Розмістити інтерактивну панель для подачі скарг." },
    "options": {
      "faq_link": { "name": { "en-US": "faq_link", "ru": "ссылка_на_faq", "uk": "посилання_на_faq" }, "description": { "en-US": "Link to FAQ or server rules.", "ru": "Ссылка на FAQ или правила сервера.", "uk": "Посилання на FAQ або правила сервера." } }
    },
    "messages": {
      "panel_title": { "ru": "Система Жалоб", "en-US": "Report System", "uk": "Система Скарг" },
      "panel_desc": { "ru": "Здесь вы можете сообщить о нарушениях правил сервера. Ваши жалобы помогают поддерживать порядок.", "en-US": "Here you can report server rule violations. Your reports help maintain order.", "uk": "Тут ви можете повідомити про порушення правил сервера. Ваші скарги допомагають підтримувати порядок." },
      "how_to_title": { "ru": "Как подать жалобу:", "en-US": "How to report:", "uk": "Як подати скаргу:" },
      "how_to_desc": { "ru": "1. **Выберите тип** нарушения, нажав кнопку ниже.\n2. Заполните **форму**, подробно описав проблему.\n3. **Укажите нарушителя** (если есть) и **добавьте ссылки/доказательства**.\n4. Модераторы рассмотрят вашу жалобу. Вы получите уведомление о статусе в личные сообщения.", "en-US": "1. **Select type** of violation below.\n2. Fill out the **form** with details.\n3. **Mention offender** (if any) and **add evidence**.\n4. Moderators will review your report. You'll get status updates via DM.", "uk": "1. **Оберіть тип** порушення, натиснувши кнопку нижче.\n2. Заповніть **форму**, детально описавши проблему.\n3. **Вкажіть порушника** (якщо є) та **додайте посилання/докази**.\n4. Модератори розглянуть вашу скаргу. Ви отримаєте повідомлення про статус в особисті повідомлення." },
      "important_title": { "ru": "Важно:", "en-US": "Important:", "uk": "Важливо:" },
      "important_desc": { "ru": "Пожалуйста, используйте систему жалоб ответственно. Ложные жалобы могут привести к последствиям.", "en-US": "Please use the report system responsibly. False reports may lead to consequences.", "uk": "Будь ласка, використовуйте систему скарг відповідально. Неправдиві скарги можуть призвести до наслідків." },
      "footer": { "ru": "Спасибо за помощь в поддержании порядка.", "en-US": "Thanks for helping maintain order.", "uk": "Дякуємо за допомогу в підтримці порядку." },
      "btn_user": { "ru": "На пользователя", "en-US": "User report", "uk": "На користувача" },
      "btn_message": { "ru": "На сообщение", "en-US": "Message report", "uk": "На повідомлення" },
      "btn_moderator": { "ru": "На модератора", "en-US": "Moderator report", "uk": "На модератора" },
      "btn_other": { "ru": "Другое", "en-US": "Other", "uk": "Інше" },
      "btn_faq": { "ru": "Ознакомиться с правилами / FAQ", "en-US": "Check Rules / FAQ", "uk": "Ознайомитися з правилами / FAQ" },
      "success": { "ru": "Панель жалоб успешно размещена в канале <#{id}>.", "en-US": "Report panel successfully deployed in <#{id}>.", "uk": "Панель скарг успішно розміщена в каналі <#{id}>." },
    },
    "service": {
        "errors": {
          "no_permissions": { "ru": "У вас нет прав для выполнения этого действия.", "en-US": "You don't have permissions to perform this action.", "uk": "У вас немає прав для виконання цієї дії." },
          "channel_not_set": { "ru": "Канал для модерации жалоб не настроен для этого сервера. Обратитесь к администратору.", "en-US": "Moderation channel for reports is not configured. Contact admin.", "uk": "Канал для модерації скарг не налаштований. Зверніться до адміністратора." },
          "channel_not_found": { "ru": "Модераторский канал жалоб не найден или недоступен.", "en-US": "Moderation channel not found or inaccessible.", "uk": "Модераторський канал скарг не знайдений або недоступний." },
          "report_not_found": { "ru": "Исходное сообщение с жалобой не найдено.", "en-US": "Original report message not found.", "uk": "Початкове повідомлення зі скаргою не знайдено." },
          "report_no_embed": { "ru": "Сообщение с жалобой не содержит информации (эмбеда) для обработки.", "en-US": "Report message contains no embed info for processing.", "uk": "Повідомлення зі скаргою не містить інформації (ембеду) для обробки." },
          "unexpected": { "ru": "Произошла непредвиденная ошибка при обработке действия.", "en-US": "Unexpected error occurred during action processing.", "uk": "Сталася непередбачена помилка при обробці дії." }
        },
        "labels": {
          "accept": { "ru": "Принять", "en-US": "Accept", "uk": "Прийняти" },
          "decline": { "ru": "Отклонить", "en-US": "Decline", "uk": "Відхилити" },
          "in_progress": { "ru": "В процессе", "en-US": "In Progress", "uk": "В процесі" },
          "reply": { "ru": "Ответить", "en-US": "Reply", "uk": "Відповісти" },
          "resolved": { "ru": "Закрыть", "en-US": "Resolve", "uk": "Закрити" },
          "profile": { "ru": "Профиль нарушителя", "en-US": "Offender Profile", "uk": "Профіль порушника" },
          "add_note": { "ru": "Добавить заметку", "en-US": "Add Note", "uk": "Додати замітку" },
          "history": { "ru": "История действий:", "en-US": "Action history:", "uk": "Історія дій:" },
          "status": { "ru": "Статус:", "en-US": "Status:", "uk": "Статус:" },
          "from": { "ru": "От:", "en-US": "From:", "uk": "Від:" },
          "type": { "ru": "Тип жалобы:", "en-US": "Report Type:", "uk": "Тип скарги:" },
          "text": { "ru": "Текст жалобы:", "en-US": "Report Text:", "uk": "Текст скарги:" },
          "on": { "ru": "На:", "en-US": "Against:", "uk": "На:" },
          "evidence": { "ru": "Доказательства:", "en-US": "Evidence:", "uk": "Докази:" },
          "notes": { "ru": "Заметки модераторов:", "en-US": "Moderator Notes:", "uk": "Замітки модераторів:" },
          "evidence_link": { "ru": "[Нажмите для просмотра]", "en-US": "[Click to view]", "uk": "[Натисніть для перегляду]" }
        },
        "status": {
          "accepted": { "ru": "Принята (меры приняты)", "en-US": "Accepted (measures taken)", "uk": "Прийнята (заходи вжито)" },
          "declined": { "ru": "Отклонена", "en-US": "Declined", "uk": "Відхилена" },
          "in_progress": { "ru": "В процессе рассмотрения", "en-US": "Under review", "uk": "В процесі розгляду" },
          "resolved": { "ru": "Закрыта (решена)", "en-US": "Resolved", "uk": "Закрита (вирішена)" },
          "replied": { "ru": "Отвечено", "en-US": "Replied", "uk": "Відповідь надана" },
          "pending": { "ru": "В ожидании", "en-US": "Pending", "uk": "В очікуванні" }
        },
        "actions": {
          "accepted": { "ru": "Принята ({user})", "en-US": "Accepted ({user})", "uk": "Прийнята ({user})" },
          "declined": { "ru": "Отклонена ({user})", "en-US": "Declined ({user})", "uk": "Відхилена ({user})" },
          "in_progress": { "ru": "В процессе ({user})", "en-US": "In progress ({user})", "uk": "В процесі ({user})" },
          "resolved": { "ru": "Закрыта ({user})", "en-US": "Resolved ({user})", "uk": "Закрита ({user})" },
          "replied": { "ru": "Отвечено пользователю ({user})", "en-US": "Replied to user ({user})", "uk": "Відповідь надана користувачу ({user})" },
          "note_added": { "ru": "{user}: {note}", "en-US": "{user}: {note}", "uk": "{user}: {note}" },
          "submitted": { "ru": "Подана пользователем", "en-US": "Submitted by user", "uk": "Подана користувачем" }
        },
        "modals": {
          "report_title": { "ru": "Подать жалобу", "en-US": "Submit Report", "uk": "Подати скаргу" },
          "report_on_msg": { "ru": "На сообщение", "en-US": "On Message", "uk": "На повідомлення" },
          "report_on_user": { "ru": "На участника", "en-US": "On Member", "uk": "На учасника" },
          "report_on_mod": { "ru": "На модератора", "en-US": "On Moderator", "uk": "На модератора" },
          "report_other": { "ru": "Другое", "en-US": "Other", "uk": "Інше" },
          "decline_title": { "ru": "Причина отклонения", "en-US": "Decline Reason", "uk": "Причина відхилення" },
          "reply_title": { "ru": "Отправить ответ пользователю", "en-US": "Send Reply to User", "uk": "Надіслати відповідь користувачу" },
          "note_title": { "ru": "Добавить заметку к жалобе", "en-US": "Add Note to Report", "uk": "Додати замітку до скарги" },
          "description_label": { "ru": "Опишите проблему подробно", "en-US": "Describe the problem in detail", "uk": "Опишіть проблему детально" },
          "description_placeholder": { "ru": "Например: \"Спам\", \"Оскорбления\".", "en-US": "e.g. \"Spam\", \"Insults\".", "uk": "Наприклад: \"Спам\", \"Образи\"." },
          "target_label": { "ru": "Кто нарушитель? (ID, упоминание, никнейм)", "en-US": "Who is the offender? (ID, mention, nick)", "uk": "Хто порушник? (ID, згадка, нік)" },
          "target_placeholder": { "ru": "Например: 123456789012345678, @нарушитель или Nickname", "en-US": "e.g. 123456789012345678, @offender or Nickname", "uk": "Наприклад: 123456789012345678, @порушник або Nickname" },
          "link_label": { "ru": "Ссылка на доказательства (необязательно)", "en-US": "Link to evidence (optional)", "uk": "Посилання на докази (необов'язково)" },
          "link_placeholder": { "ru": "Например: discord.com/channels/...", "en-US": "e.g. discord.com/channels/...", "uk": "Наприклад: discord.com/channels/..." },
          "author_label": { "ru": "Автор сообщения", "en-US": "Message Author", "uk": "Автор повідомлення" },
          "link_info_label": { "ru": "Ссылка на сообщение", "en-US": "Message Link", "uk": "Посилання на повідомлення" },
          "decline_reason_label": { "ru": "Причина отклонения жалобы", "en-US": "Reason for declining", "uk": "Причина відхилення скарги" },
          "decline_reason_placeholder": { "ru": "Например: \"Недостаточно доказательств\", \"Нарушение не выявлено\".", "en-US": "e.g. \"Insufficient evidence\", \"No violation found\".", "uk": "Наприклад: \"Недостатньо доказів\", \"Порушення не виявлено\"." },
          "reply_label": { "ru": "Текст ответа пользователю", "en-US": "Reply text for user", "uk": "Текст відповіді користувачу" },
          "reply_placeholder": { "ru": "Например: \"Мы рассмотрели вашу жалобу и приняли меры.\"", "en-US": "e.g. \"We reviewed your report and took action.\"", "uk": "Наприклад: \"Ми розглянули вашу скаргу та вжили заходів.\"" },
          "note_label": { "ru": "Текст заметки", "en-US": "Note text", "uk": "Текст замітки" },
          "note_placeholder": { "ru": "Добавьте информацию, видимую только модераторам.", "en-US": "Add info visible only to moderators.", "uk": "Додайте інформацію, яку бачать лише модератори." }
        },
        "notifications": {
          "update_title": { "ru": "Обновление по вашей жалобе на сервере {guild}", "en-US": "Update on your report at {guild}", "uk": "Оновлення по вашій скарзі на сервері {guild}" },
          "reply_title": { "ru": "Ответ модератора по вашей жалобе на сервере {guild}", "en-US": "Moderator reply on your report at {guild}", "uk": "Відповідь модератора по вашій скарзі на сервері {guild}" },
          "decline_title": { "ru": "Ваша жалоба отклонена на сервере {guild}", "en-US": "Your report was declined at {guild}", "uk": "Ваша скарга відхилена на сервері {guild}" },
          "accepted_text": { "ru": "Ваша жалоба была принята модераторами, и по ней приняты меры. Спасибо за ваше обращение!", "en-US": "Your report was accepted, and measures were taken. Thanks!", "uk": "Ваша скарга була прийнята модераторами, і за нею вжито заходів. Дякуємо!" },
          "in_progress_text": { "ru": "Ваша жалоба сейчас находится на рассмотрении. Ожидайте дальнейших действий.", "en-US": "Your report is currently under review. Please wait.", "uk": "Ваша скарга зараз перебуває на розгляді. Очікуйте подальших дій." },
          "resolved_text": { "ru": "Ваша жалоба была успешно рассмотрена и закрыта.", "en-US": "Your report was successfully reviewed and closed.", "uk": "Ваша скарга була успішно розглянута та закрита." },
          "decline_text": { "ru": "К сожалению, ваша жалоба была отклонена модераторами.\n\n**Причина:**\n{reason}", "en-US": "Unfortunately, your report was declined.\n\n**Reason:**\n{reason}", "uk": "На жаль, ваша скарга була відхилена модераторами.\n\n**Причина:**\n{reason}" },
          "footer_status": { "ru": "Текущий статус: {status}", "en-US": "Current status: {status}", "uk": "Поточний статус: {status}" },
          "footer_reply": { "ru": "Ответ от модератора: {user}", "en-US": "Reply from: {user}", "uk": "Відповідь від модератора: {user}" },
          "footer_decline": { "ru": "Если у вас есть вопросы, свяжитесь с поддержкой сервера.", "en-US": "If you have questions, contact server support.", "uk": "Якщо у вас є запитання, зв'яжіться з підтримкою сервера." }
        },
        "feedback": {
          "action_performed": { "ru": "Действие \"{action}\" выполнено для жалобы. Статус обновлен.", "en-US": "Action \"{action}\" performed. Status updated.", "uk": "Дію \"{action}\" виконано. Статус оновлено." },
          "reply_sent": { "ru": "Ответ пользователю успешно отправлен!", "en-US": "Reply sent to user!", "uk": "Відповідь користувачу успішно надіслано!" },
          "reply_error": { "ru": "Не удалось отправить ответ пользователю. Возможно, он закрыл личные сообщения.", "en-US": "Could not send reply. User might have DMs closed.", "uk": "Не вдалося надіслати відповідь. Можливо, у користувача закриті особисті повідомлення." },
          "decline_done": { "ru": "Жалоба успешно отклонена, и причина отправлена пользователю!", "en-US": "Report declined and reason sent to user!", "uk": "Скаргу відхилено, причину надіслано користувачу!" },
          "note_done": { "ru": "Заметка успешно добавлена к жалобе!", "en-US": "Note added to report!", "uk": "Замітку додано до скарги!" },
          "report_sent": { "ru": "Ваша жалоба успешно отправлена модераторам! ID вашей жалобы: `{id}`.", "en-US": "Report sent to moderators! Report ID: `{id}`.", "uk": "Вашу скаргу надіслано модераторам! ID скарги: `{id}`." },
          "new_report_title": { "ru": "Новая жалоба", "en-US": "New Report", "uk": "Нова скарга" },
          "unknown_user": { "ru": "Неизвестный пользователь: `{target}` (ID не найден)", "en-US": "Unknown user: `{target}` (ID not found)", "uk": "Невідомий користувач: `{target}` (ID не знайдено)" },
          "not_found_user": { "ru": "Не удалось найти: `{target}`", "en-US": "Could not find: `{target}`", "uk": "Не вдалося знайти: `{target}`" }
        }
    },
  },
  "restrict": {
    "name": { "en-US": "restrict", "ru": "ограничить", "uk": "обмежити" },
    "description": { "en-US": "Manage command restrictions on the server.", "ru": "Управляет ограничениями команд на сервере.", "uk": "Керує обмеженнями команд на сервері." },
    "options": {
      "set": {
        "name": { "en-US": "set", "ru": "установить", "uk": "встановити" },
        "description": { "en-US": "Enable or disable a command for server or user.", "ru": "Включить или отключить команду для сервера или пользователя.", "uk": "Увімкнути або вимкнути команду для сервера або користувача." },
        "options": {
          "action": { 
            "name": { "en-US": "action", "ru": "действие", "uk": "дія" }, 
            "description": { "en-US": "Action: disable or enable", "ru": "Действие: disable (отключить) или enable (включить)", "uk": "Дія: disable (вимкнути) або enable (увімкнути)" },
            "choices": {
                "disable": { "en-US": "Disable", "ru": "Отключить", "uk": "Вимкнути" },
                "enable": { "en-US": "Enable", "ru": "Включить", "uk": "Увімкнути" }
            }
          },
          "command": { "name": { "en-US": "command", "ru": "команда", "uk": "команда" }, "description": { "en-US": "Command name to restrict.", "ru": "Название команды, которую нужно ограничить.", "uk": "Назва команди, яку потрібно обмежити." } },
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "Target user (optional, for specific user).", "ru": "Пользователь, для которого применяется ограничение (необязательно).", "uk": "Користувач, для якого застосовується обмеження (необов'язково)." } }
        }
      },
      "list": {
        "name": { "en-US": "list", "ru": "список", "uk": "список" },
        "description": { "en-US": "Show list of restricted commands.", "ru": "Показывает список команд, запрещенных на сервере или для пользователя.", "uk": "Показує список команд, заборонених на сервері або для користувача." },
        "options": {
          "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "Target user (optional).", "ru": "Пользователь для проверки (необязательно).", "uk": "Користувач для перевірки (необов'язково)." } }
        }
      }
    },
    "messages": {
      "no_perms": { "ru": "У вас нет прав для использования этой команды.", "en-US": "You don't have permissions to use this command.", "uk": "У вас немає прав для використання цієї команди." },
      "cannot_restrict_self": { "ru": "Нельзя запретить эту команду.", "en-US": "Cannot restrict this command.", "uk": "Не можна заборонити цю команду." },
      "cmd_not_found": { "ru": "Команда `{name}` не найдена.", "en-US": "Command `{name}` not found.", "uk": "Команду `{name}` не знайдено." },
      "restrict_self_error": { "ru": "Вы не можете запретить команду самому себе.", "en-US": "You cannot restrict a command for yourself.", "uk": "Ви не можете заборонити команду самому собі." },
      "target_user": { "ru": "для пользователя {user}", "en-US": "for user {user}", "uk": "для користувача {user}" },
      "target_server": { "ru": "на этом сервере", "en-US": "on this server", "uk": "на цьому сервері" },
      "already_disabled": { "ru": "Команда `{name}` уже была запрещена {target}.", "en-US": "Command `{name}` was already disabled {target}.", "uk": "Команда `{name}` вже була заборонена {target}." },
      "now_disabled": { "ru": "Команда `{name}` теперь **запрещена** {target}.", "en-US": "Command `{name}` is now **disabled** {target}.", "uk": "Команда `{name}` тепер **заборонена** {target}." },
      "error_disable": { "ru": "Произошла ошибка при попытке запретить команду `{name}` {target}.", "en-US": "Error occurred while trying to disable command `{name}` {target}.", "uk": "Сталася помилка при спробі заборонити команду `{name}` {target}." },
      "now_enabled": { "ru": "Команда `{name}` теперь **разрешена** {target}.", "en-US": "Command `{name}` is now **enabled** {target}.", "uk": "Команда `{name}` тепер **дозволена** {target}." },
      "not_disabled": { "ru": "Команда `{name}` не была запрещена {target}.", "en-US": "Command `{name}` was not disabled {target}.", "uk": "Команда `{name}` не була заборонена {target}." },
      "list_title_server": { "ru": "Запрещенные команды на {server}", "en-US": "Restricted commands on {server}", "uk": "Заборонені команди на {server}" },
      "list_title_user": { "ru": "Запрещенные команды для пользователя {user} на {server}", "en-US": "Restricted commands for user {user} on {server}", "uk": "Заборонені команди для користувача {user} на {server}" },
      "footer_total": { "ru": "Всего: {count} команд(а)", "en-US": "Total: {count} command(s)", "uk": "Всього: {count} команд(а)" },
      "empty_server": { "ru": "На этом сервере нет запрещенных команд для всех.", "en-US": "There are no server-wide restricted commands.", "uk": "На цьому сервері немає заборонених команд для всіх." },
      "empty_user": { "ru": "Для пользователя {user} нет персонально запрещенных команд.", "en-US": "There are no personal command restrictions for {user}.", "uk": "Для користувача {user} немає персонально заборонених команд." }
    }
  }
}

module.exports = {
  moderation
}