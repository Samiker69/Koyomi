const nsfw = {
  "booru": {
    "description": {
      "en-US": "Parse boorus",
      "ru": "parse boorus",
      "uk": "Аналізувати booru-сайти"
    },
    "options": {
      "tags": {
        "description": {
          "en-US": "Tags (separated by space)",
          "ru": "Теги. Между тегами оставляйте только пробелы!",
          "uk": "Теги (відокремлюйте пробілами)"
        }
      },
      "limit": {
        "description": {
          "en-US": "Total number of artworks",
          "ru": "Сколько всего будет артов",
          "uk": "Загальна кількість арту"
        }
      },
      "page": {
        "description": {
          "en-US": "Page number",
          "ru": "Страница",
          "uk": "Номер сторінки"
        }
      }
    }
  },
  "hentai": {
    "description": {
      "en-US": "Random gallery from nhentai",
      "ru": "Случайная галерея с nhentai",
      "uk": "Випадкова галерея з nhentai"
    },
    "options": {}
  },
  "tags": {
    "description": {
      "en-US": "Search tags",
      "ru": "Search tags",
      "uk": "Пошук за тегами"
    },
    "options": {
      "tags": {
        "description": {
          "en-US": "Search tags",
          "ru": "Search tags",
          "uk": "Пошук тегів"
        }
      },
      "page": {
        "description": {
          "en-US": "Search on a certain page",
          "ru": "Search on a certain page",
          "uk": "Пошук на певній сторінці"
        }
      },
      "amount": {
        "description": {
          "en-US": "Number of images to get (Discord limits to 10 embeds)",
          "ru": "Ammount of images to get (note that Discord can only embed 10 at a time!)",
          "uk": "Кількість зображень (Discord дозволяє лише 10)"
        }
      },
      "invisible": {
        "description": {
          "en-US": "Hide your search from others",
          "ru": "Set to true if you want no one to see what you are searching for",
          "uk": "Сховати пошук від інших"
        }
      },
      "no_ai": {
        "description": {
          "en-US": "Exclude AI-generated images",
          "ru": "Set True if you don't want to see ai images",
          "uk": "Виключити зображення, створені ШІ"
        }
      }
    }
  }
}

module.exports = {
	nsfw
}