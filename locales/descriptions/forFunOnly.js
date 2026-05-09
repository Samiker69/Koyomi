const forFunOnly = {
  "captcha": {
    "name": {
      "en-US": "captcha",
      "ru": "капча",
      "uk": "капча"
    },
    "description": {
      "en-US": "Creates a captcha image",
      "ru": "Создаёт изображение капчи",
      "uk": "Створює зображення капчі"
    },
    "options": {
      "invisible": {
        "name": {
          "en-US": "invisible",
          "ru": "невидимо",
          "uk": "невидимо"
        },
        "description": {
          "en-US": "Make the message invisible?",
          "ru": "Сделать сообщение невидимым?",
          "uk": "Зробити повідомлення невидимим?"
        }
      },
      "length": {
        "name": {
          "en-US": "length",
          "ru": "длина",
          "uk": "довжина"
        },
        "description": {
          "en-US": "Number of characters",
          "ru": "Количество символов",
          "uk": "Кількість символов"
        }
      },
      "width": {
        "name": {
          "en-US": "width",
          "ru": "ширина",
          "uk": "ширина"
        },
        "description": {
          "en-US": "Width of the captcha image",
          "ru": "Ширина изображения капчи",
          "uk": "Ширина зображення капчі"
        }
      },
      "height": {
        "name": {
          "en-US": "height",
          "ru": "высота",
          "uk": "висота"
        },
        "description": {
          "en-US": "Height of the captcha image",
          "ru": "Высота изображения капчи",
          "uk": "Висота зображення капчі"
        }
      },
      "min_font_size": {
        "name": {
          "en-US": "min_font_size",
          "ru": "мин_размер_шрифта",
          "uk": "мін_розмір_шрифту"
        },
        "description": {
          "en-US": "Minimum font size",
          "ru": "Минимальный размер шрифта",
          "uk": "Мінімальний розмір шрифту"
        }
      },
      "max_font_size": {
        "name": {
          "en-US": "max_font_size",
          "ru": "макс_размер_шрифта",
          "uk": "макс_розмір_шрифту"
        },
        "description": {
          "en-US": "Maximum font size",
          "ru": "Максимальный размер шрифта",
          "uk": "Максимальний розмір шрифту"
        }
      },
      "max_rotation": {
        "name": {
          "en-US": "max_rotation",
          "ru": "макс_поворот",
          "uk": "макс_поворот"
        },
        "description": {
          "en-US": "Maximum text rotation (0.1-2.0)",
          "ru": "Максимальный поворот текста (0.1-2.0)",
          "uk": "Максимальний поворот тексту (0.1-2.0)"
        }
      },
      "max_skew": {
        "name": {
          "en-US": "max_skew",
          "ru": "макс_искажение",
          "uk": "макс_викривлення"
        },
        "description": {
          "en-US": "Maximum text skew (0.1-1.0)",
          "ru": "Максимальное искажение текста (0.1-1.0)",
          "uk": "Максимальне викривлення тексту (0.1-1.0)"
        }
      },
      "text_outline": {
        "name": {
          "en-US": "text_outline",
          "ru": "обводка_текста",
          "uk": "обведення_тексту"
        },
        "description": {
          "en-US": "Text outline",
          "ru": "Обводка текста",
          "uk": "Обведення тексту"
        }
      },
      "random_colors": {
        "name": {
          "en-US": "random_colors",
          "ru": "случайные_цвета",
          "uk": "випадкові_кольори"
        },
        "description": {
          "en-US": "Random colors for each character",
          "ru": "Случайные цвета для каждого символа",
          "uk": "Випадкові кольори для кожного символу"
        }
      },
      "gradient_bg": {
        "name": {
          "en-US": "gradient_bg",
          "ru": "градиентный_фон",
          "uk": "градієнтний_фон"
        },
        "description": {
          "en-US": "Gradient background",
          "ru": "Градиентный фон",
          "uk": "Градієнтний фон"
        }
      },
      "gradient_type": {
        "name": {
          "en-US": "gradient_type",
          "ru": "тип_градиента",
          "uk": "тип_градієнта"
        },
        "description": {
          "en-US": "Type of gradient",
          "ru": "Тип градиента",
          "uk": "Тип градієнта"
        },
        "choices": {
          "linear": {
            "en-US": "Linear",
            "ru": "Линейный",
            "uk": "Лінійний"
          },
          "radial": {
            "en-US": "Radial",
            "ru": "Радиальный",
            "uk": "Радіальний"
          }
        }
      },
      "noise_lines": {
        "name": {
          "en-US": "noise_lines",
          "ru": "линии_шума",
          "uk": "лінії_шуму"
        },
        "description": {
          "en-US": "Number of noise lines",
          "ru": "Количество линий шума",
          "uk": "Кількість ліній шуму"
        }
      },
      "noise_dots": {
        "name": {
          "en-US": "noise_dots",
          "ru": "точки_шума",
          "uk": "точки_шуму"
        },
        "description": {
          "en-US": "Number of noise dots",
          "ru": "Количество точек шума",
          "uk": "Кількість точок шуму"
        }
      },
      "noise_circles": {
        "name": {
          "en-US": "noise_circles",
          "ru": "круги_шума",
          "uk": "кола_шуму"
        },
        "description": {
          "en-US": "Number of noise circles",
          "ru": "Количество кругов шума",
          "uk": "Кількість кіл шуму"
        }
      },
      "curved_lines": {
        "name": {
          "en-US": "curved_lines",
          "ru": "изогнутые_линии",
          "uk": "зігнуті_лінії"
        },
        "description": {
          "en-US": "Curved noise lines",
          "ru": "Изогнутые линии шума",
          "uk": "Зігнуті лінії шуму"
        }
      },
      "noise_opacity": {
        "name": {
          "en-US": "noise_opacity",
          "ru": "прозрачность_шума",
          "uk": "прозорість_шуму"
        },
        "description": {
          "en-US": "Noise opacity (0.1-1.0)",
          "ru": "Прозрачность шума (0.1-1.0)",
          "uk": "Прозорість шуму (0.1-1.0)"
        }
      },
      "wave_distortion": {
        "name": {
          "en-US": "wave_distortion",
          "ru": "волновое_искажение",
          "uk": "хвильове_викривлення"
        },
        "description": {
          "en-US": "Wave distortion",
          "ru": "Волновые искажения",
          "uk": "Хвильові викривлення"
        }
      },
      "wave_amplitude": {
        "name": {
          "en-US": "wave_amplitude",
          "ru": "амплитуда_волн",
          "uk": "амплітуда_хвиль"
        },
        "description": {
          "en-US": "Wave amplitude",
          "ru": "Амплитуда волн",
          "uk": "Амплітуда хвиль"
        }
      },
      "wave_frequency": {
        "name": {
          "en-US": "wave_frequency",
          "ru": "частота_волн",
          "uk": "частота_хвиль"
        },
        "description": {
          "en-US": "Wave frequency (0.01-0.2)",
          "ru": "Частота волн (0.01-0.2)",
          "uk": "Частота хвиль (0.01-0.2)"
        }
      },
      "scratches": {
        "name": {
          "en-US": "scratches",
          "ru": "царапины",
          "uk": "подряпини"
        },
        "description": {
          "en-US": "Scratches",
          "ru": "Царапины",
          "uk": "Подряпини"
        }
      },
      "scratch_count": {
        "name": {
          "en-US": "scratch_count",
          "ru": "кол_царапин",
          "uk": "кіл_подряпин"
        },
        "description": {
          "en-US": "Number of scratches",
          "ru": "Количество царапин",
          "uk": "Кількість подряпин"
        }
      },
      "grid_interference": {
        "name": {
          "en-US": "grid_interference",
          "ru": "сетка_помех",
          "uk": "сітка_перешкод"
        },
        "description": {
          "en-US": "Grid interference",
          "ru": "Сетка помех",
          "uk": "Сітка перешкод"
        }
      },
      "overlay_interference": {
        "name": {
          "en-US": "overlay_interference",
          "ru": "помехи_поверх",
          "uk": "перешкоди_поверх"
        },
        "description": {
          "en-US": "Overlay interference over text",
          "ru": "Помехи поверх текста",
          "uk": "Перешкоди поверх тексту"
        }
      }
    },
    "messages": {
      "success": {
        "en-US": "Captcha generated! The code is: \`{code}\`",
        "ru": "Капча сгенерирована! Код: \`{code}\`",
        "uk": "Капча згенерована! Код: \`{code}\`"
      },
      "error": { "en-US": "Failed to generate captcha.", "ru": "Не удалось создать капчу.", "uk": "Не вдалося створити капчу." },
      "solve_everyone": { "en-US": "Everyone solve the captcha!", "ru": "Всем решать капчу!", "uk": "Всім вирішувати капчу!" }
    }
  },
  "ai": {
    "name": {
      "en-US": "ai",
      "ru": "ии",
      "uk": "шi"
    },
    "description": {
      "en-US": "Actions with AI",
      "ru": "Действия с AI",
      "uk": "Дії з ШІ"
    },
    "options": {
      "ask": {
        "name": {
          "en-US": "ask",
          "ru": "спросить",
          "uk": "запитати"
        },
        "description": {
          "en-US": "Ask gemini anything",
          "ru": "Спросить gemini о чём-либо",
          "uk": "Запитати gemini про щось"
        },
        "options": {
          "text": {
            "name": {
              "en-US": "text",
              "ru": "текст",
              "uk": "текст"
            },
            "description": {
              "en-US": "Request to gemini",
              "ru": "Запрос к gemini",
              "uk": "Запит до gemini"
            }
          },
          "image": {
            "name": {
              "en-US": "image",
              "ru": "изображение",
              "uk": "зображення"
            },
            "description": {
              "en-US": "Image to send",
              "ru": "Изображение для отправки",
              "uk": "Зображення для надсилання"
            }
          },
          "invisible": {
            "name": {
              "en-US": "invisible",
              "ru": "невидимо",
              "uk": "невидимо"
            },
            "description": {
              "en-US": "Makes the response invisible",
              "ru": "Делает ответ ai невидимым",
              "uk": "Робить відповідь ші невидимою"
            }
          }
        }
      },
      "add-user": {
        "name": {
          "en-US": "add-user",
          "ru": "добавить-юзера",
          "uk": "додати-юзера"
        },
        "description": {
          "en-US": "Adds a user to the database to allow using /ai",
          "ru": "Добавляет пользователя в бд, позволяя ему пользоваться командой /ai",
          "uk": "Додає користувача до БД, дозволяючи йому користуватися командою /ai"
        },
        "options": {
          "user": {
            "name": {
              "en-US": "user",
              "ru": "пользователь",
              "uk": "користувач"
            },
            "description": {
              "en-US": "User to add",
              "ru": "Пользователь",
              "uk": "Користувач"
            }
          }
        }
      },
      "remove-user": {
        "name": {
          "en-US": "remove-user",
          "ru": "удалить-юзера",
          "uk": "видалити-юзера"
        },
        "description": {
          "en-US": "Removes a user from the database",
          "ru": "Удаляет пользователя из бд",
          "uk": "Видаляє користувача з БД"
        },
        "options": {
          "user": {
            "name": {
              "en-US": "user",
              "ru": "пользователь",
              "uk": "користувач"
            },
            "description": {
              "en-US": "User to remove",
              "ru": "Пользователь",
              "uk": "Користувач"
            }
          }
        }
      },
      "settings": {
        "name": {
          "en-US": "settings",
          "ru": "настройки",
          "uk": "налаштування"
        },
        "description": {
          "en-US": "Shows your current AI settings",
          "ru": "Показывает ваши текущие настройки AI",
          "uk": "Показує ваші поточні налаштування AI"
        }
      },
      "edit": {
        "name": {
          "en-US": "edit",
          "ru": "редактировать",
          "uk": "редагувати"
        },
        "description": {
          "en-US": "Change AI settings",
          "ru": "Сменить настройки ai",
          "uk": "Змінити налаштування ai"
        },
        "options": {
          "model": {
            "name": {
              "en-US": "model",
              "ru": "модель",
              "uk": "модель"
            },
            "description": {
              "en-US": "Model for generation",
              "ru": "Модель для генерации",
              "uk": "Модель для генерації"
            }
          },
          "system_instructions": {
            "name": {
              "en-US": "system_instructions",
              "ru": "системные_инструкции",
              "uk": "системні_інструкції"
            },
            "description": {
              "en-US": "System instructions",
              "ru": "Системные инструкции",
              "uk": "Системні інструкції"
            }
          },
          "max_output_tokens": {
            "name": {
              "en-US": "max_output_tokens",
              "ru": "макс_токенов",
              "uk": "макс_токенів"
            },
            "description": {
              "en-US": "Max output tokens",
              "ru": "Максимум токенов, которыми AI ответит",
              "uk": "Максимум токенів, якими ШІ відповість"
            }
          },
          "temperature": {
            "name": {
              "en-US": "temperature",
              "ru": "температура",
              "uk": "температура"
            },
            "description": {
              "en-US": "Generation randomness (0.1-2)",
              "ru": "Регулирует случайность(креатичность ответа)",
              "uk": "Регулює випадковість (креативність відповіді)"
            }
          },
          "top_p": {
            "name": {
              "en-US": "top_p",
              "ru": "top_p",
              "uk": "top_p"
            },
            "description": {
              "en-US": "Token probability threshold",
              "ru": "Вероятность использования токена",
              "uk": "Ймовірність використання токена"
            }
          },
          "top_k": {
            "name": {
              "en-US": "top_k",
              "ru": "top_k",
              "uk": "top_k"
            },
            "description": {
              "en-US": "Vocabulary size for generation",
              "ru": "\"Словарный запас\" при генерации токена",
              "uk": "\"Словниковий запас\" при генерації токена"
            }
          },
          "history_limit": {
            "name": {
              "en-US": "history_limit",
              "ru": "лимит_истории",
              "uk": "ліміт_історії"
            },
            "description": {
              "en-US": "History limit (0 to disable)",
              "ru": "Лимит сохранения истории",
              "uk": "Ліміт збереження історії"
            }
          }
        }
      },
      "edit_safety": {
        "name": {
          "en-US": "edit_safety",
          "ru": "безопасность",
          "uk": "безпека"
        },
        "description": {
          "en-US": "Change model safety settings",
          "ru": "Изменение настроек безопасности модели",
          "uk": "Зміна налаштувань безпеки моделі"
        },
        "options": {
          "s_category": {
            "name": {
              "en-US": "category",
              "ru": "категория",
              "uk": "категорія"
            },
            "description": {
              "en-US": "Safety category name",
              "ru": "Название опции",
              "uk": "Назва опції"
            }
          },
          "s_value": {
            "name": {
              "en-US": "value",
              "ru": "значение",
              "uk": "значення"
            },
            "description": {
              "en-US": "Safety threshold value",
              "ru": "Режимы безопастности",
              "uk": "Режими безпеки"
            }
          }
        }
      },
      "add-apikey": {
        "name": {
          "en-US": "add-apikey",
          "ru": "добавить-ключ",
          "uk": "додати-ключ"
        },
        "description": {
          "en-US": "Add your Google AI API key",
          "ru": "Добавить апи ключ",
          "uk": "Додати апі ключ"
        },
        "options": {
          "apikey": {
            "name": {
              "en-US": "apikey",
              "ru": "ключ",
              "uk": "ключ"
            },
            "description": {
              "en-US": "Your API key from Google AI Studio",
              "ru": "Апи ключ",
              "uk": "Апі ключ"
            }
          },
          "for-public-use": {
            "name": {
              "en-US": "for-public-use",
              "ru": "для-всех",
              "uk": "для-всіх"
            },
            "description": {
              "en-US": "Allow others to use your key?",
              "ru": "Позволить нам использовать ваш ключ?",
              "uk": "Дозволити нам використовувати ваш ключ?"
            }
          }
        }
      },
      "delete-apikey": {
        "name": {
          "en-US": "delete-apikey",
          "ru": "удалить-ключ",
          "uk": "видалити-ключ"
        },
        "description": {
          "en-US": "Remove an API key from the bot",
          "ru": "Удалить апи-ключ из бота",
          "uk": "Видалити апі-ключ з бота"
        },
        "options": {
          "apikey": {
            "name": {
              "en-US": "apikey",
              "ru": "ключ",
              "uk": "ключ"
            },
            "description": {
              "en-US": "API key to delete",
              "ru": "Апи ключ",
              "uk": "Апі ключ"
            }
          },
          "delete-all": {
            "name": {
              "en-US": "delete-all",
              "ru": "удалить-все",
              "uk": "видалити-все"
            },
            "description": {
              "en-US": "Delete all your keys?",
              "ru": "Удалить все ваши ключи?",
              "uk": "Видалити всі ваші ключі?"
            }
          }
        }
      },
      "edit-apikey": {
        "name": {
          "en-US": "edit-apikey",
          "ru": "изменить-ключ",
          "uk": "змінити-ключ"
        },
        "description": {
          "en-US": "Modify settings for an existing key",
          "ru": "Изменить настройки для текущего ключа",
          "uk": "Змінити налаштування для поточного ключа"
        },
        "options": {
          "apikey": {
            "name": {
              "en-US": "apikey",
              "ru": "ключ",
              "uk": "ключ"
            },
            "description": {
              "en-US": "API key to edit",
              "ru": "Апи ключ",
              "uk": "Апі ключ"
            }
          },
          "for-public-use": {
            "name": {
              "en-US": "for-public-use",
              "ru": "для-всех",
              "uk": "для-всіх"
            },
            "description": {
              "en-US": "Allow others to use your key?",
              "ru": "Позволить нам использовать ваш ключ?",
              "uk": "Дозволити нам використовувати ваш ключ?"
            }
          }
        }
      },
      "model-info": {
        "name": {
          "en-US": "model-info",
          "ru": "инфо-о-модели",
          "uk": "інфо-про-модель"
        },
        "description": {
          "en-US": "Get information about a model",
          "ru": "Получает информацию о модели",
          "uk": "Отримує інформацію про модель"
        },
        "options": {
          "model": {
            "name": {
              "en-US": "model",
              "ru": "модель",
              "uk": "модель"
            },
            "description": {
              "en-US": "Model name (leave empty for current)",
              "ru": "Модель gemini",
              "uk": "Модель gemini"
            }
          }
        }
      }
    },
    "messages": {
       "no_access": {
         "en-US": "You do not have access to this command.",
         "ru": "У вас нет доступа к этой команде.",
         "uk": "У вас немає доступу до цієї команди."
       },
       "not_in_db": {
         "en-US": "It seems you are not in the database yet.",
         "ru": "Кажется, вас ещё нет в базе данных.",
         "uk": "Здається, вас ще немає в базі даних."
       },
       "no_api_keys": {
         "en-US": "You don't have any API keys to use this command.",
         "ru": "У вас нет ни одного апи ключа для использования этой команды.",
         "uk": "У вас немає жодного апі ключа для використання цієї команди."
       },
       "label_history_limit_limit": { "en-US": "History Limit (history_limit)", "ru": "Лимит истории (history_limit)", "uk": "Ліміт історії (history_limit)" },
       "label_si": { "en-US": "System Instructions (system_instructions)", "ru": "Системные инструкции (system_instructions)", "uk": "Системні інструкції (system_instructions)" },
       "label_safety": { "en-US": "Safety Settings", "ru": "Настройки безопасности", "uk": "Налаштування безпеки" },
       "label_temperature": { "en-US": "Temperature", "ru": "Температура", "uk": "Температура" },
       "label_total_tokens": { "en-US": "Total Tokens Used", "ru": "Всего токенов использовано", "uk": "Всього токенів використано" },
       "label_token_uses": { "en-US": "Token Uses", "ru": "Использований токенов", "uk": "Використання токенів" },
       "settings_updated": { "en-US": "Settings updated successfully!", "ru": "Настройки успешно обновлены!", "uk": "Налаштування успішно оновлені!" },
       "settings_not_changed": { "en-US": "Nothing was changed.", "ru": "Ничего не было изменено.", "uk": "Нічого не було змінено." },
       "safety_category_changed": { "en-US": "Safety category {category} set to {value}.", "ru": "Категория безопасности {category} установлена на {value}.", "uk": "Категорія безпеки {category} встановлена на {value}." },
       "unknown_category": { "en-US": "Unknown safety category.", "ru": "Неизвестная категория безопасности.", "uk": "Невідома категорія безпеки." },
       "apikey_added": { "en-US": "API key added successfully!", "ru": "API ключ успешно добавлен!", "uk": "API ключ успішно доданий!" },
       "apikey_required_non_all": { "en-US": "API key is required unless deleting all.", "ru": "API ключ обязателен, если вы не удаляете все.", "uk": "API ключ обов'язковий, якщо ви не видаляєте всі." },
       "keys_deleted_count": { "en-US": "{count} keys deleted.", "ru": "Удалено ключей: {count}.", "uk": "Видалено ключів: {count}." },
       "apikey_deleted": { "en-US": "API key deleted.", "ru": "API ключ удален.", "uk": "API ключ видалений." },
       "model_info_no_keys": { "en-US": "No API keys found to fetch model info.", "ru": "Не найдено API ключей для получения информации о модели.", "uk": "Не знайдено API ключів для отримання інформації про модель." },
       "user_added": { "en-US": "User {user} added to AI database.", "ru": "Пользователь {user} добавлен в базу AI.", "uk": "Користувач {user} доданий до бази ШІ." },
       "user_removed": { "en-US": "User {user} removed from AI database.", "ru": "Пользователь {user} удален из базы AI.", "uk": "Користувач {user} видалений з бази ШІ." },
       "unknown_subcommand": { "en-US": "Unknown subcommand.", "ru": "Неизвестная подкоманда.", "uk": "Невідома підкоманда." },
       "not_image": {
         "en-US": "This is not an image! Attachment will be ignored.\nExecuting request to AI...",
         "ru": "Это не изображение! Вложение будет проигнорировано.\nВыполняем запрос к ai...",
         "uk": "Це не зображення! Вкладення буде проігноровано.\nВиконуємо запит до ші..."
       },
       "image_too_large": {
         "en-US": "Image size is too large (max 20MB). Attachment will be ignored.\nExecuting request to AI...",
         "ru": "Размер изображения слишком большой (макс. 20мб). Вложение будет проигнорировано.\nВыполняем запрос к ai...",
         "uk": "Розмір зображення занадто великий (макс. 20мб). Вкладення буде проігноровано.\nВиконуємо запит до ші..."
       },
       "ai_unavailable": {
         "en-US": "AI functionality is unavailable as client.keyManager is empty.",
         "ru": "Функционал ИИ недоступен, так как client.keyManager пуст.",
         "uk": "Функціонал ШІ недоступний, оскільки client.keyManager порожній."
       },
       "ai_no_reply": {
         "en-US": "AI did not respond at all. There might be a service error...",
         "ru": "AI совсем ничего не ответила. Возможно, со стороны сервиса какая-то ошибка...",
         "uk": "ШІ зовсім нічого не відповів. Можливо, з боку сервісу якась помилка..."
       },
       "ai_no_reply_reason": {
         "en-US": "It seems... AI did not respond. Reason: {reason}",
         "ru": "Кажется... ai не ответила. Причина: {reason}",
         "uk": "Здається... ші не відповів. Причина: {reason}"
       },
       "wait_time": {
         "en-US": "Wait time: {sec} seconds, length: {length}",
         "ru": "Время ожидания {sec} секунд, длина {length}",
         "uk": "Час очікування {sec} секунд, довжина {length}"
       },
       "reply_too_long": {
         "en-US": "AI responded with text that is too long, so the response is in a file.",
         "ru": "AI ответила слишком длинным текстом, поэтому её ответ находится в файле.",
         "uk": "ШІ відповів занадто довгим текстом, тому його відповідь знаходиться у файлі."
       },
       "invalid_apikey": {
         "en-US": "Invalid API key. Removing key from database...",
         "ru": "Неверный апи ключ. Удаление ключа из бд...",
         "uk": "Невірний апі ключ. Видалення ключа з БД..."
       },
       "settings_title": {
         "en-US": "Your Gemini Settings",
         "ru": "Ваши настройки gemini",
         "uk": "Ваші налаштування gemini"
       },
       "settings_description": {
         "en-US": "System Instructions: {si}\n\nSafety Settings:\n\`\`\`json\n{ss}\`\`\`\n\nTip: to reset `top_k` and `top_p`, set them to a negative value: `/ai edit top_k:-1`.\nTo reset `system_instructions`, use `/ai edit system_instructions:{NULL}`",
         "ru": "Системные инструкции (system_instructions): {si}\n\nНастройки безопасности:\n\`\`\`json\n{ss}\`\`\`\n\nСовет: чтобы сбросить настройки `top_k` и `top_p`, укажите им отрицательное значение: `/ai edit top_k:-1`.\nЧтобы сбросить настройки `system_instructions`, используйте команду `/ai edit system_instructions:{NULL}`",
         "uk": "Системні інструкції (system_instructions): {si}\n\nНалаштування безпеки:\n\`\`\`json\n{ss}\`\`\`\n\nПорада: щоб скинути налаштування `top_k` і `top_p`, вкажіть їм від'ємне значення: `/ai edit top_k:-1`.\nЩоб скинути налаштування `system_instructions`, використовуйте команду `/ai edit system_instructions:{NULL}`"
       },
       "label_model": {
         "en-US": "Model (model)",
         "ru": "Модель (model)",
         "uk": "Модель (model)"
       },
       "label_max_tokens": {
         "en-US": "Max Output Tokens (max_output_tokens)",
         "ru": "Максимум токенов на ответ (max_output_tokens)",
         "uk": "Максимум токенів на відповідь (max_output_tokens)"
       },
       "label_history_limit": { "en-US": "History Limit (history_limit)", "ru": "Лимит истории (history_limit)", "uk": "Ліміт історії (history_limit)" },
       "label_si": { "en-US": "System Instructions (system_instructions)", "ru": "Системные инструкции (system_instructions)", "uk": "Системні інструкції (system_instructions)" },
       "label_safety": { "en-US": "Safety Settings", "ru": "Настройки безопасности", "uk": "Налаштування безпеки" }
    }
  },
  "eval": {
    "name": {
      "en-US": "eval",
      "ru": "эвал",
      "uk": "евал"
    },
    "description": {
      "en-US": "Execute JavaScript code (Owner only)",
      "ru": "Выполнить JavaScript код (Только для владельца)",
      "uk": "Виконати JavaScript код (Тільки для власника)"
    },
    "options": {
      "presence": {
        "name": {
          "en-US": "presence",
          "ru": "статус",
          "uk": "статус"
        },
        "description": {
          "en-US": "Sets bot status",
          "ru": "Устанавливает статус бота",
          "uk": "Встановлює статус бота"
        },
        "options": {
          "name-activity": {
            "name": {
              "en-US": "name-activity",
              "ru": "название-активности",
              "uk": "назва-активності"
            },
            "description": {
              "en-US": "Activity name",
              "ru": "Название активности",
              "uk": "Назва активності"
            }
          },
          "status": {
            "name": {
              "en-US": "status",
              "ru": "статус",
              "uk": "статус"
            },
            "description": {
              "en-US": "Online status",
              "ru": "Статус в сети",
              "uk": "Статус у мережі"
            }
          },
          "activity": {
            "name": {
              "en-US": "activity",
              "ru": "активность",
              "uk": "активність"
            },
            "description": {
              "en-US": "Activity type",
              "ru": "Тип активности",
              "uk": "Тип активності"
            }
          }
        }
      },
      "avatar": {
        "name": { "en-US": "avatar", "ru": "аватар", "uk": "аватар" },
        "description": { "en-US": "Set bot avatar", "ru": "Установить аватар бота", "uk": "Встановити аватар бота" },
        "options": {
          "file": { "name": { "en-US": "file", "ru": "файл", "uk": "файл" }, "description": { "en-US": "Image file", "ru": "Файл изображения", "uk": "Файл зображення" } }
        }
      },
      "banner": {
        "name": { "en-US": "banner", "ru": "баннер", "uk": "баннер" },
        "description": { "en-US": "Set bot banner", "ru": "Установить баннер бота", "uk": "Встановити банер бота" },
        "options": {
          "file": { "name": { "en-US": "file", "ru": "файл", "uk": "файл" }, "description": { "en-US": "Image file", "ru": "Файл изображения", "uk": "Файл зображення" } }
        }
      },
      "botinfo": {
        "name": { "en-US": "botinfo", "ru": "ботинфо", "uk": "ботінфо" },
        "description": { "en-US": "Bot client information", "ru": "Информация о клиенте бота", "uk": "Інформація про клієнта бота" }
      },
      "code": {
        "name": { "en-US": "code", "ru": "код", "uk": "код" },
        "description": { "en-US": "Code to execute", "ru": "Код для выполнения", "uk": "Код для виконання" }
      },
      "ephemeral": {
        "name": { "en-US": "ephemeral", "ru": "эфемерально", "uk": "ефемерально" },
        "description": { "en-US": "Hide response?", "ru": "Скрыть ответ?", "uk": "Приховати відповідь?" }
      }
    },
    "messages": {
      "no_access": { "en-US": "You do not have access to this command.", "ru": "У вас нет доступа к этой команде.", "uk": "У вас немає доступу до цієї команди." },
      "presence_updated": { "ru": "Статус обновлен на {presence}, активность: {type} {name}", "en-US": "Status updated to {presence}, activity: {type} {name}", "uk": "Статус оновлено на {presence}, активність: {type} {name}" },
      "presence_error": { "ru": "Ошибка при обновлении статуса", "en-US": "Error updating status", "uk": "Помилка при оновленні статусу" },
      "avatar_updated": { "ru": "Аватар успешно обновлен!", "en-US": "Avatar updated successfully!", "uk": "Аватар успішно оновлено!" },
      "avatar_error": { "ru": "Ошибка при обновлении аватара", "en-US": "Error updating avatar", "uk": "Помилка при оновленні аватара" },
      "banner_updated": { "ru": "Баннер успешно обновлен!", "en-US": "Banner updated successfully!", "uk": "Банер успішно оновлено!" },
      "banner_error": { "ru": "Ошибка при обновлении баннера", "en-US": "Error updating banner", "uk": "Помилка при оновленні банера" },
      "unknown_sub": { "en-US": "It seems this sub-command does not exist", "ru": "Кажется, такой саб-команды не существует", "uk": "Здається, такої саб-команди не існує" },
      "botinfo_title": { "en-US": "Current Bot Client Information", "ru": "Информация о текущем клиенте бота", "uk": "Інформація про поточний клієнт бота" },
      "botinfo_description": { "en-US": "`Servers` - which servers this bot is on\nYour ad could be here: https://samiker.xyz", "ru": "`Сервера` - на каких серверах находится этот бот\nЗдесь могла быть ваша реклама https://samiker.xyz", "uk": "`Сервери` - на яких серверах знаходиться цей бот\nТут могла бути ваша реклама https://samiker.xyz" },
      "guilds_title": { "en-US": "Servers the bot is on", "ru": "Сервера, на которых находится бот", "uk": "Сервери, на яких знаходиться бот" },
      "guilds_header": { "en-US": "Name(ID). Is owner: bool", "ru": "Название(айди). Является владельцем: bool", "uk": "Назва(айді). Є власником: bool" },
      "guild_owner_label": { "en-US": "Bot is owner: ", "ru": "Бот является владельцем: ", "uk": "Бот є власником: " },
      "buttons": {
        "guilds": { "en-US": "Servers", "ru": "Сервера", "uk": "Сервери" },
        "back": { "en-US": "Back", "ru": "Назад", "uk": "Назад" }
      }
    }
  },
  "love": {
    "name": { "en-US": "love", "ru": "любовь", "uk": "любов" },
    "description": { "en-US": "Check love compatibility", "ru": "Проверить совместимость в любви", "uk": "Перевірити сумісність у коханні" },
    "options": {
      "user1": { "name": { "en-US": "user1", "ru": "пользователь1", "uk": "користувач1" }, "description": { "en-US": "First user", "ru": "Первый пользователь", "uk": "Перший користувач" } },
      "user2": { "name": { "en-US": "user2", "ru": "пользователь2", "uk": "користувач2" }, "description": { "en-US": "Second user", "ru": "Второй пользователь", "uk": "Другий користувач" } }
    },
    "messages": {
      "title": { "en-US": "Love Meter", "ru": "Измеритель любви", "uk": "Вимірювач кохання" },
      "description": { "en-US": "Love compatibility between {user1} and {user2}", "ru": "Совместимость в любви между {user1} и {user2}", "uk": "Сумісність у коханні між {user1} та {user2}" }
    }
  },
  "minecraft": {
    "name": { "en-US": "minecraft", "ru": "майнкрафт", "uk": "майнкрафт" },
    "description": { "en-US": "Get Minecraft player information", "ru": "Получить информацию о игроке Minecraft", "uk": "Отримати інформацію про гравця Minecraft" },
    "options": {
      "player": { "name": { "en-US": "player", "ru": "игрок", "uk": "гравець" }, "description": { "en-US": "Minecraft player nickname", "ru": "Никнейм игрока Minecraft", "uk": "Нікнейм гравця Minecraft" } }
    },
    "messages": {
      "player_not_found": { "en-US": "Player {player} not found.", "ru": "Игрок {player} не найден.", "uk": "Гравця {player} не знайдено." },
      "info_title": { "en-US": "Minecraft Info: {player}", "ru": "Информация Minecraft: {player}", "uk": "Інформація Minecraft: {player}" },
      "label_skin_render": { "en-US": "Skin Render", "ru": "Рендер скина", "uk": "Рендер скіна" },
      "label_skin_download": { "en-US": "Skin Download", "ru": "Скачать скин", "uk": "Завантажити скін" },
      "label_namemc": { "en-US": "NameMC Profile", "ru": "Профиль NameMC", "uk": "Профіль NameMC" },
      "link_view": { "en-US": "View", "ru": "Посмотреть", "uk": "Переглянути" },
      "link_download": { "en-US": "Download", "ru": "Скачать", "uk": "Завантажити" },
      "link_go": { "en-US": "Go", "ru": "Перейти", "uk": "Перейти" },
      "error": { "en-US": "An error occurred while fetching player info.", "ru": "Произошла ошибка при получении информации о игроке.", "uk": "Сталася помилка при отриманні інформації про гравця." }
    }
  },
  "say": {
    "name": { "en-US": "say", "ru": "сказать", "uk": "сказати" },
    "description": { "en-US": "Make bot say something", "ru": "Заставить бота что-то сказать", "uk": "Змусити бота щось сказати" },
    "options": {
      "text": { "name": { "en-US": "text", "ru": "текст", "uk": "текст" }, "description": { "en-US": "Text to say", "ru": "Текст который скажет бот", "uk": "Текст який скаже бот" } },
      "image": { "name": { "en-US": "image", "ru": "изображение", "uk": "зображення" }, "description": { "en-US": "Image to send", "ru": "Изображение для отправки", "uk": "Зображення для надсилання" } },
      "reply_to": { "name": { "en-US": "reply_to", "ru": "ответ_на", "uk": "відповідь_на" }, "description": { "en-US": "Message ID or link to reply to", "ru": "ID сообщения или ссылка для ответа", "uk": "ID повідомлення або посилання для відповіді" } }
    },
    "messages": {
      "no_access": { "en-US": "You don't have access to this command.", "ru": "У вас нет доступа к этой команде.", "uk": "У вас немає доступу до цієї команди." },
      "text_or_image_required": { "en-US": "You must provide text or an image.", "ru": "Вы должны указать текст или изображение.", "uk": "Ви повинні вказати текст або зображення." },
      "success": { "en-US": "Message sent!", "ru": "Сообщение отправлено!", "uk": "Повідомлення надіслано!" },
      "error": { "en-US": "Could not send message.", "ru": "Не удалось отправить сообщение.", "uk": "Не вдалося надіслати повідомлення." }
    }
  },
  "action": {
    "name": { "en-US": "action", "ru": "действие", "uk": "дія" },
    "description": { "en-US": "Perform an action", "ru": "Выполнить действие", "uk": "Виконати дію" },
    "options": {
      "hug": {
        "name": { "en-US": "hug", "ru": "обнять", "uk": "обійняти" },
        "description": { "en-US": "Hug someone", "ru": "Обнять кого-то", "uk": "Обійняти когось" },
        "options": { "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to hug", "ru": "Пользователь, которого хотите обнять", "uk": "Користувач, якого хочете обійняти" } } }
      },
      "slap": {
        "name": { "en-US": "slap", "ru": "ударить", "uk": "вдарити" },
        "description": { "en-US": "Slap someone", "ru": "Ударить кого-то", "uk": "Вдарити когось" },
        "options": { "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to slap", "ru": "Пользователь, которого хотите ударить", "uk": "Користувач, якого хочете вдарити" } } }
      },
      "pat": {
        "name": { "en-US": "pat", "ru": "погладить", "uk": "погладити" },
        "description": { "en-US": "Pat someone", "ru": "Погладить кого-то", "uk": "Погладити когось" },
        "options": { "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to pat", "ru": "Пользователь, которого хотите погладить", "uk": "Користувач, якого хочете погладити" } } }
      },
      "kiss": {
        "name": { "en-US": "kiss", "ru": "поцеловать", "uk": "поцілувати" },
        "description": { "en-US": "Kiss someone", "ru": "Поцеловать кого-то", "uk": "Поцілувати когось" },
        "options": { "user": { "name": { "en-US": "user", "ru": "пользователь", "uk": "користувач" }, "description": { "en-US": "User to kiss", "ru": "Пользователь, которого хотите поцеловать", "uk": "Користувач, якого хочете поцілувати" } } }
      }
    },
    "messages": {
      "hug_msg": { "ru": "{author} обнимает {target}!", "en-US": "{author} hugs {target}!", "uk": "{author} обіймає {target}!" },
      "slap_msg": { "ru": "{author} дает пощечину {target}!", "en-US": "{author} slaps {target}!", "uk": "{author} дає ляпаса {target}!" },
      "pat_msg": { "ru": "{author} гладит {target} по голове!", "en-US": "{author} pats {target} on the head!", "uk": "{author} гладить {target} по голові!" },
      "kiss_msg": { "ru": "{author} целует {target}!", "en-US": "{author} kisses {target}!", "uk": "{author} цілує {target}!" },
      "self_action_error": { "ru": "Вы не можете сделать это с самим собой!", "en-US": "You cannot do this to yourself!", "uk": "Ви не можете зробити це з самим собою!" },
      "gif_error": { "ru": "Не удалось найти подходящую гифку.", "en-US": "Could not find a suitable GIF.", "uk": "Не вдалося знайти відповідну гіфку." }
    }
  }
};

module.exports = { forFunOnly };