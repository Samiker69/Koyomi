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
          "uk": "Кількість символів"
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
      }
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
       "label_temperature": {
         "en-US": "Temperature (temperature)",
         "ru": "Температура ответов (temperature)",
         "uk": "Температура відповідей (temperature)"
       },
       "label_history_limit": {
         "en-US": "History Limit (history_limit)",
         "ru": "Лимит сохранения истории (history_limit)",
         "uk": "Ліміт збереження історії (history_limit)"
       },
       "label_total_tokens": {
         "en-US": "Total Tokens",
         "ru": "Всего токенов",
         "uk": "Всього токенів"
       },
       "label_token_uses": {
         "en-US": "Key usage count",
         "ru": "Сколько раз ваш токен был использован нами",
         "uk": "Скільки разів ваш токен був використаний нами"
       },
       "settings_updated": {
         "en-US": "Settings have been updated.",
         "ru": "Настройки были обновлены.",
         "uk": "Налаштування були оновлені."
       },
       "settings_not_changed": {
         "en-US": "Settings have not changed.",
         "ru": "Настройки не изменились.",
         "uk": "Налаштування не змінилися."
       },
       "safety_category_changed": {
         "en-US": "Category \`{category}\` value changed to \`{value}\`.",
         "ru": "Значение категории \`{category}\` было изменено на \`{value}\`.",
         "uk": "Значення категорії \`{category}\` було змінено на \`{value}\`."
       },
       "unknown_category": {
         "en-US": "Unknown category!",
         "ru": "Неизвестная категория!",
         "uk": "Невідома категорія!"
       },
       "apikey_added": {
         "en-US": "Your key has been successfully added! You can now use AI features.",
         "ru": "Ваш ключ успешно добавлен! Можете пользоваться функционалом AI.",
         "uk": "Ваш ключ успішно додано! Можете користуватися функціоналом ШІ."
       },
       "apikey_deleted": {
         "en-US": "\`{apikey}\` has been deleted.",
         "ru": "\`{apikey}\` был удалён.",
         "uk": "\`{apikey}\` було видалено."
       },
       "keys_deleted_count": {
         "en-US": "\`{count}\` keys have been deleted.",
         "ru": "\`{count}\` ключей было удалено.",
         "uk": "\`{count}\` ключів було видалено."
       },
       "apikey_required_non_all": {
         "en-US": "\`apikey\` cannot be empty unless you are deleting all tokens!",
         "ru": "\`apikey\` не может быть пустым, если вы не удаляете все токены!",
         "uk": "\`apikey\` не може бути порожнім, якщо ви не видаляєте всі токени!"
       },
       "model_info_no_keys": {
         "en-US": "You don't have any API keys to use this command.",
         "ru": "У вас нет ни одного апи ключа для использования этой команды.",
         "uk": "У вас немає жодного апі ключа для використання цієї команди."
       },
       "unknown_subcommand": {
         "en-US": "It seems this subcommand does not exist.",
         "ru": "Кажется, такой саб-команды не существует",
         "uk": "Здається, такої саб-команди не існує"
       },
       "thinking": {
         "en-US": "Thinking...",
         "ru": "Думаю...",
         "uk": "Думаю..."
       },
       "error": {
         "en-US": "An error occurred: {error}",
         "ru": "Произошла ошибка: {error}",
         "uk": "Сталася помилка: {error}"
       },
       "user_added": {
         "en-US": "User {user} has been added to the database.",
         "ru": "Пользователь {user} был добавлен в базу данных.",
         "uk": "Користувач {user} був доданий до бази даних."
       },
       "user_removed": {
         "en-US": "User {user} has been removed from the database.",
         "ru": "Пользователь {user} был удален из базы данных.",
         "uk": "Користувач {user} був видалений з бази даних."
       }
    }
  },
  "eval": {
    "name": {
      "en-US": "eval",
      "ru": "эвал",
      "uk": "евал"
    },
    "description": {
      "en-US": "(developer only)",
      "ru": "(Только для разработчиков)",
      "uk": "(тільки для розробника)"
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
        "name": {
          "en-US": "avatar",
          "ru": "аватар",
          "uk": "аватар"
        },
        "description": {
          "en-US": "Change bot avatar",
          "ru": "Сменить аватар бота",
          "uk": "Змінити аватар бота"
        },
        "options": {
          "file": {
            "name": {
              "en-US": "file",
              "ru": "файл",
              "uk": "файл"
            },
            "description": {
              "en-US": "Select file",
              "ru": "Выберите файл",
              "uk": "Виберіть файл"
            }
          }
        }
      },
      "banner": {
        "name": {
          "en-US": "banner",
          "ru": "баннер",
          "uk": "банер"
        },
        "description": {
          "en-US": "Change bot banner",
          "ru": "Сменить баннер бота",
          "uk": "Змінити банер бота"
        },
        "options": {
          "file": {
            "name": {
              "en-US": "file",
              "ru": "файл",
              "uk": "файл"
            },
            "description": {
              "en-US": "Select file",
              "ru": "Выберите файл",
              "uk": "Виберіть файл"
            }
          }
        }
      },
      "botinfo": {
        "name": {
          "en-US": "botinfo",
          "ru": "ботинфо",
          "uk": "ботінфо"
        },
        "description": {
          "en-US": "Shows detailed information about the bot",
          "ru": "Показывает подробную информацию о боте",
          "uk": "Показує детальну інформацію про бота"
        }
      }
    },
    "messages": {
      "no_access": {
        "en-US": "You do not have access to this command.",
        "ru": "Вы не можете использовать эту команду",
        "uk": "Ви не можете використовувати цю команду"
      },
      "presence_updated": {
        "en-US": "Presence updated: {presence}, {name}, {type}",
        "ru": "Статус изменён. {presence}, {name}, {type}",
        "uk": "Статус змінено. {presence}, {name}, {type}"
      },
      "presence_error": {
        "en-US": "Failed to update presence.",
        "ru": "Не удалось изменить статус",
        "uk": "Не вдалося змінити статус"
      },
      "avatar_updated": {
        "en-US": "Avatar updated.",
        "ru": "Аватар изменён.",
        "uk": "Аватар змінено."
      },
      "avatar_error": {
        "en-US": "Failed to update avatar.",
        "ru": "Не удалось изменить аватар",
        "uk": "Не вдалося змінити аватар"
      },
      "banner_updated": {
        "en-US": "Banner updated.",
        "ru": "Баннер изменён.",
        "uk": "Банер змінено."
      },
      "banner_error": {
        "en-US": "Failed to update banner.",
        "ru": "Не удалось изменить баннер",
        "uk": "Не вдалося змінити банер"
      }
    }
  },
  "love": {
    "name": {
      "en-US": "love",
      "ru": "любовь",
      "uk": "любов"
    },
    "description": {
      "en-US": "Calculates the love percentage between two users",
      "ru": "Подсчитывает процент любви между двумя участниками",
      "uk": "Підраховує відсоток любові між двома учасниками"
    },
    "options": {
      "user1": {
        "name": {
          "en-US": "user1",
          "ru": "участник1",
          "uk": "учасник1"
        },
        "description": {
          "en-US": "First user",
          "ru": "Первый участник",
          "uk": "Перший учасник"
        }
      },
      "user2": {
        "name": {
          "en-US": "user2",
          "ru": "участник2",
          "uk": "учасник2"
        },
        "description": {
          "en-US": "Second user",
          "ru": "Второй участник",
          "uk": "Другий учасник"
        }
      }
    },
    "messages": {
      "title": {
        "en-US": "💕 Love Calculator 💕",
        "ru": "💕 Калькулятор Любви 💕",
        "uk": "💕 Калькулятор Любові 💕"
      },
      "description": {
        "en-US": "How compatible are {user1} and {user2}?",
        "ru": "Насколько совместимы {user1} и {user2}?",
        "uk": "Наскільки сумісні {user1} та {user2}?"
      }
    }
  },
  "minecraft": {
    "name": {
      "en-US": "minecraft",
      "ru": "майнкрафт",
      "uk": "майнкрафт"
    },
    "description": {
      "en-US": "Provides information about a Minecraft player",
      "ru": "Предоставляет информацию о игроке Minecraft",
      "uk": "Надає інформацію про гравця Minecraft"
    },
    "options": {
      "player": {
        "name": {
          "en-US": "player",
          "ru": "игрок",
          "uk": "гравець"
        },
        "description": {
          "en-US": "Minecraft player's name",
          "ru": "Имя игрока Minecraft",
          "uk": "Ім'я гравця Minecraft"
        }
      }
    },
    "messages": {
      "player_not_found": {
        "en-US": "Player \`{player}\` not found.",
        "ru": "Игрок \`{player}\` не найден.",
        "uk": "Гравця \`{player}\` не знайдено."
      },
      "info_title": {
        "en-US": "Minecraft Player Info: {player}",
        "ru": "Информация по игроку {player}",
        "uk": "Інформація про гравця {player}"
      },
      "label_skin_render": {
        "en-US": "Skin Render",
        "ru": "Рендер скина",
        "uk": "Рендер скіна"
      },
      "label_skin_download": {
        "en-US": "Download Skin",
        "ru": "Скачать скин",
        "uk": "Завантажити скін"
      },
      "label_namemc": {
        "en-US": "NameMC Profile",
        "ru": "Профиль на NameMC",
        "uk": "Профіль на NameMC"
      },
      "link_view": {
        "en-US": "View",
        "ru": "Посмотреть",
        "uk": "Переглянути"
      },
      "link_download": {
        "en-US": "Download",
        "ru": "Скачать",
        "uk": "Завантажити"
      },
      "link_go": {
        "en-US": "Visit",
        "ru": "Перейти",
        "uk": "Перейти"
      }
    }
  },
  "say": {
    "name": {
      "en-US": "say",
      "ru": "сказать",
      "uk": "сказати"
    },
    "description": {
      "en-US": "Makes the bot send your message to the channel as itself",
      "ru": "Позволяет боту переслать ваше сообщение в канал от своего имени",
      "uk": "Дозволяє боту надіслати ваше повідомлення в канал від свого імені"
    },
    "options": {
      "text": {
        "name": {
          "en-US": "text",
          "ru": "текст",
          "uk": "текст"
        },
        "description": {
          "en-US": "Text of the message to send",
          "ru": "Текст сообщения для отправки",
          "uk": "Текст повідомлення для надсилання"
        }
      },
      "image": {
        "name": {
          "en-US": "image",
          "ru": "изображение",
          "uk": "зображення"
        },
        "description": {
          "en-US": "Attach an image to the message",
          "ru": "Прикрепить изображение к сообщению",
          "uk": "Прикріпити зображення до повідомлення"
        }
      },
      "reply_to": {
        "name": {
          "en-US": "reply_to",
          "ru": "ответить_на",
          "uk": "відповісти_на"
        },
        "description": {
          "en-US": "ID or link to a message to reply to",
          "ru": "ID или ссылка на сообщение для ответа",
          "uk": "ID або посилання на повідомлення для відповіді"
        }
      }
    },
    "messages": {
      "no_access": {
        "en-US": "You do not have access to this command.",
        "ru": "У вас нет доступа к этой команде.",
        "uk": "У вас немає доступу до цієї команди."
      },
      "text_or_image_required": {
        "en-US": "\`text\` or \`image\` must be filled!",
        "ru": "\`text\` или \`image\` должны быть заполнены!",
        "uk": "\`text\` або \`image\` повинні бути заповнені!"
      },
      "success": {
        "en-US": "Message sent successfully.",
        "ru": "Сообщение успешно отправлено.",
        "uk": "Повідомлення успішно надіслано."
      },
      "error": {
        "en-US": "Failed to send message.",
        "ru": "Не удалось отправить сообщение.",
        "uk": "Не вдалося надіслати повідомлення."
      }
    }
  }
}

module.exports = {
  forFunOnly
}