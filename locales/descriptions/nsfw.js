const nsfw = {
  "common": {
    "messages": {
      "untitled": { "ru": "Без заголовка", "en-US": "Untitled", "uk": "Без назви" }
    }
  },
  "booru": {
    "name": {
      "en-US": "booru",
      "ru": "бору",
      "uk": "бору"
    },
    "description": {
      "en-US": "Parse boorus",
      "ru": "Парсинг booru-сайтов",
      "uk": "Аналізувати booru-сайти"
    },
    "options": {
      "search": {
        "name": {
          "en-US": "search",
          "ru": "поиск",
          "uk": "пошук"
        },
        "description": {
          "en-US": "Search boorus",
          "ru": "Поиск бору",
          "uk": "Пошук бору"
        },
        "options": {
          "site": {
            "name": {
              "en-US": "site",
              "ru": "сайт",
              "uk": "сайт"
            },
            "description": {
              "en-US": "Site to be used for the search",
              "ru": "Сайт, который будет использоваться для поиска",
              "uk": "Сайт, який буде використовуватися для пошуку"
            }
          },
          "tags": {
            "name": {
              "en-US": "tags",
              "ru": "теги",
              "uk": "теги"
            },
            "description": {
              "en-US": "Tags (separated by space)",
              "ru": "Теги. Между тегами оставляйте только пробелы!",
              "uk": "Теги (відокремлюйте пробілами)"
            }
          },
          "limit": {
            "name": {
              "en-US": "limit",
              "ru": "лимит",
              "uk": "ліміт"
            },
            "description": {
              "en-US": "Total number of artworks",
              "ru": "Сколько всего будет артов",
              "uk": "Загальна кількість арту"
            }
          },
          "page": {
            "name": {
              "en-US": "page",
              "ru": "страница",
              "uk": "сторінка"
            },
            "description": {
              "en-US": "Page number",
              "ru": "Страница",
              "uk": "Номер сторінки"
            }
          },
          "no_ai": {
            "name": {
              "en-US": "no_ai",
              "ru": "без_ии",
              "uk": "без_шi"
            },
            "description": {
              "en-US": "Add tags that exclude AI art? (default false)",
              "ru": "Добавлять теги, исключающие AI арты? (по умолчанию false)",
              "uk": "Додавати теги, що виключають AI арти? (за замовчуванням false)"
            }
          }
        }
      },
      "random": {
        "name": {
          "en-US": "random",
          "ru": "рандом",
          "uk": "рандом"
        },
        "description": {
          "en-US": "Random booru image",
          "ru": "Рандомный бору",
          "uk": "Рандомний бору"
        }
      }
    },
    "messages": {
      "only_author": {
        "ru": "Только {user} может взаимодействовать",
        "en-US": "Only {user} can interact",
        "uk": "Тільки {user} може взаємодіяти"
      },
      "invalid_site": {
        "ru": "Неверно введён сайт. Используйте всплывающий список сайтов, чтобы больше не получать эту ошибку.",
        "en-US": "Invalid site. Use the autocomplete list to avoid this error.",
        "uk": "Невірно введено сайт. Використовуйте список, що спливає, щоб більше не отримувати цю помилку."
      },
      "site_not_found": {
        "ru": "Не удалось найти {site}. Убедитесь, что вы ввели верное название",
        "en-US": "Could not find {site}. Make sure you entered the correct name",
        "uk": "Не вдалося знайти {site}. Переконайтеся, що ви ввели правильну назву"
      },
      "nothing_found": {
        "ru": "Кажется, ничего не удалось найти. Проверьте правильность написания тегов{no_ai_tip}",
        "en-US": "Nothing found. Check your tags{no_ai_tip}",
        "uk": "Здається, нічого не вдалося знайти. Перевірте правильність написання тегів{no_ai_tip}"
        },
      "no_ai_tip": {
        "ru": " также попробуйте не использовать no_ai",
        "en-US": " also try not using no_ai",
        "uk": " також спробуйте не використовувати no_ai"
      },
      "post_blocked_title": {
        "ru": "Рейтинг {rating} | из {domain}",
        "en-US": "Rating {rating} | from {domain}",
        "uk": "Рейтинг {rating} | з {domain}"
      },
      "post_blocked_desc": {
        "ru": "Данный пост заблокирован, так как имеет опасный рейтинг для этого канала.\nИнформация о посте: `id {id}`",
        "en-US": "This post is blocked because it has a dangerous rating for this channel.\nPost info: `id {id}`",
        "uk": "Цей пост заблоковано, оскільки він має небезпечний рейтинг для цього каналу.\nІнформація про пост: `id {id}`"
      },
      "page_info": {
        "ru": "страница {current} из {total} {timeout}",
        "en-US": "page {current} of {total} {timeout}",
        "uk": "сторінка {current} з {total} {timeout}"
      },
      "timeout": {
        "ru": "(время вышло)",
        "en-US": "(timeout)",
        "uk": "(час вийшов)"
      },
      "error_title": {
        "ru": "Произошла ошибка при обработке команды",
        "en-US": "An error occurred while processing the command",
        "uk": "Сталася помилка при обробці команди"
      },
      "error_label": {
        "ru": "Ошибка",
        "en-US": "Error",
        "uk": "Помилка"
      },
      "command_label": {
        "ru": "Команда",
        "en-US": "Command",
        "uk": "Команда"
      },
      "generic_error": {
        "ru": "Произошла ошибка при работе команды",
        "en-US": "An error occurred while executing the command",
        "uk": "Сталася помилка при роботі команди"
      }
    }
  },
  "nhentai": {
    "name": {
      "en-US": "nhentai",
      "ru": "нхентай",
      "uk": "нхентай"
    },
    "description": {
      "en-US": "Random gallery from nhentai",
      "ru": "Случайная галерея с nhentai",
      "uk": "Випадкова галерея з nhentai"
    },
    "messages": {
      "not_nsfw": { 
        "ru": "Это не NSFW канал, чертов дрочун малолетний", 
        "en-US": "This is not an NSFW channel, you little pervert", 
        "uk": "Це не NSFW канал, бісовий дрочун малолітній" 
      },
      "fetch_error": {
        "ru": "Не удалось получить случайную галерею. Попробуй ещё раз.",
        "en-US": "Failed to get a random gallery. Try again.",
        "uk": "Не вдалося отримати випадкову галерею. Спробуй ще раз."
      },
      "not_author": {
        "ru": "Это не ваша галерея!",
        "en-US": "This is not your gallery!",
        "uk": "Це не ваша галерея!"
      },
      "page_load_error": {
        "ru": "Не удалось загрузить страницу.",
        "en-US": "Failed to load the page.",
        "uk": "Не вдалося завантажити сторінку."
      }
    },
    "options": {}
  },
  "reddit": {
    "name": {
      "en-US": "reddit",
      "ru": "реддит",
      "uk": "реддіт"
    },
    "description": {
      "en-US": "Search tags on reddit",
      "ru": "Поиск по тегам в reddit",
      "uk": "Пошук за тегами у reddit"
    },
    "options": {
      "category": {
        "name": {
          "en-US": "category",
          "ru": "категория",
          "uk": "категорія"
        },
        "description": {
          "en-US": "Content category to search for",
          "ru": "Категория контента для поиска",
          "uk": "Категорія контенту для пошуку"
        }
      }
    },
    "messages": {
      "not_nsfw": { 
        "ru": "Эта команда работает только в NSFW-каналах, чертов дрочун малолетний", 
        "en-US": "This command only works in NSFW channels, you little pervert", 
        "uk": "Ця команда працює тільки в NSFW-каналах, бісовий дрочун малолітній" 
      },
      "load_error": { 
        "ru": "Не удалось загрузить контент после нескольких попыток. Попробуйте другую категорию или повторите позже.", 
        "en-US": "Failed to load content after several attempts. Try another category or repeat later.", 
        "uk": "Не вдалося завантажити контент після кількох спроб. Спробуйте іншу категорію або повторіть пізніше." 
      }
    }
  }
}

module.exports = {
  nsfw
}