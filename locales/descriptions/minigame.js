const minigame = {
  "guessthenumber": {
    "name": {
      "en-US": "guessthenumber",
      "ru": "угадайчисло",
      "uk": "вгадайчисло"
    },
    "description": {
      "en-US": "Guess the number for speed",
      "ru": "Угадай число на скорость",
      "uk": "Вгадай число на швидкість"
    },
    "options": {},
    "messages": {
      "already_active": {
        "en-US": "A game of \"Guess the Number\" is already active in this channel. Wait for it to end.",
        "ru": "В этом канале уже идёт игра «Угадай число». Подождите её окончания.",
        "uk": "У цьому каналі вже триває гра «Вгадай число». Зачекайте її завершення."
      },
      "btn_cancel": {
        "en-US": "Cancel Game",
        "ru": "Отменить игру",
        "uk": "Скасувати гру"
      },
      "title": {
        "en-US": "Guess the Number",
        "ru": "Угадай число",
        "uk": "Вгадай число"
      },
      "start_desc": {
        "en-US": "I've guessed a number from {low} to {high}. You have {time} seconds to guess it.",
        "ru": "Я загадал число от {low} до {high}. У вас {time} секунд, чтобы угадать его.",
        "uk": "Я загадав число від {low} до {high}. У вас {time} секунд, щоб вгадати його."
      },
      "footer": {
        "en-US": "Attempts: {attempts} | Players: {players}",
        "ru": "Попыток: {attempts} | Игроков: {players}",
        "uk": "Спроб: {attempts} | Гравців: {players}"
      },
      "only_initiator_cancel": {
        "en-US": "Only the initiator can cancel the game.",
        "ru": "Только инициатор может отменить игру.",
        "uk": "Тільки ініціатор може скасувати гру."
      },
      "game_cancelled": {
        "en-US": "Game cancelled by the initiator.",
        "ru": "Игра отменена инициатором.",
        "uk": "Гра скасована ініціатором."
      },
      "winner_desc": {
        "en-US": "Winner: {user}\nNumber: {target}\nAttempts: {attempts}",
        "ru": "Победитель: {user}\nЧисло: {target}\nПопыток: {attempts}",
        "uk": "Переможець: {user}\nЧисло: {target}\nСпроб: {attempts}"
      },
      "range_hint": {
        "en-US": "The number is between {low} and {high}.",
        "ru": "Число находится между {low} и {high}.",
        "uk": "Число знаходиться між {low} та {high}."
      },
      "timeout_desc": {
        "en-US": "Time's up! The number was: {target}",
        "ru": "Время вышло! Было загадано: {target}",
        "uk": "Час вийшов! Було загадано: {target}"
      }
    }
  },
  "2048": {
    "name": {
      "en-US": "2048",
      "ru": "2048",
      "uk": "2048"
    },
    "description": {
      "en-US": "Start a single-player 2048 game",
      "ru": "Начать одиночную игру 2048",
      "uk": "Розпочати одиночну гру 2048"
    },
    "options": {},
    "messages": {
      "cooldown": {
        "en-US": "Wait {time} sec.",
        "ru": "Подожди {time} сек.",
        "uk": "Зачекай {time} сек."
      },
      "already_active": {
        "en-US": "You already have a game in progress!",
        "ru": "У тебя уже идёт игра!",
        "uk": "У тебе вже йде гра!"
      },
      "btn_surrender": {
        "en-US": "Surrender",
        "ru": "Сдаться",
        "uk": "Здатися"
      },
      "footer": {
        "en-US": "Arrows — move, 🔁 — restart, 🏳️ — surrender.",
        "ru": "Стрелки — ход, 🔁 — начать заново, 🏳️ — сдаться.",
        "uk": "Стрілки — хід, 🔁 — почати спочатку, 🏳️ — здатися."
      },
      "not_your_game": {
        "en-US": "This is not your game!",
        "ru": "Это не твоя игра!",
        "uk": "Це не твоя гра!"
      },
      "surrendered": {
        "en-US": "\n\n🏳️ You surrendered.",
        "ru": "\n\n🏳️ Ты сдался.",
        "uk": "\n\n🏳️ Ти здався."
      },
      "game_over": {
        "en-US": "\n\n💀 Game over.",
        "ru": "\n\n💀 Игра окончена.",
        "uk": "\n\n💀 Гра закінчена."
      }
    }
  },
  "tictactoe": {
    "name": {
      "en-US": "tictactoe",
      "ru": "крестикинолики",
      "uk": "хрестикинулики"
    },
    "description": {
      "en-US": "Play Tic-Tac-Toe against another user",
      "ru": "Игра в Крестики-нолики против другого участника",
      "uk": "Гра в Хрестики-нулики проти іншого учасника"
    },
    "options": {
      "opponent": {
        "name": {
          "en-US": "opponent",
          "ru": "соперник",
          "uk": "суперник"
        },
        "description": {
          "en-US": "Choose your opponent",
          "ru": "Выберите вашего соперника",
          "uk": "Виберіть свого суперника"
        }
      }
    },
    "messages": {
      "no_bots": {
        "en-US": "You cannot play with bots!",
        "ru": "Нельзя играть с ботами!",
        "uk": "Не можна грати з ботами!"
      },
      "no_self": {
        "en-US": "You cannot play with yourself!",
        "ru": "Нельзя играть с самим собой!",
        "uk": "Не можна грати з самим собою!"
      },
      "already_in_game": {
        "en-US": "One of the players already has an active game.",
        "ru": "У одного из игроков уже есть активная игра.",
        "uk": "У одного з гравців вже є активна гра."
      },
      "invite_title": {
        "en-US": "Tic-Tac-Toe Challenge",
        "ru": "Вызов на Крестики-нолики",
        "uk": "Виклик на Хрестики-нулики"
      },
      "invite_desc": {
        "en-US": "{opponent}, {user} challenges you to a game. Accept or decline.",
        "ru": "{opponent}, {user} вызывает вас на игру. Примите или отклоните.",
        "uk": "{opponent}, {user} викликає вас на гру. Прийміть або відхиліть."
      },
      "btn_accept": {
        "en-US": "Accept",
        "ru": "Принять вызов",
        "uk": "Прийняти виклик"
      },
      "btn_decline": {
        "en-US": "Decline",
        "ru": "Отклонить",
        "uk": "Відхилити"
      },
      "btn_surrender": {
        "en-US": "Surrender",
        "ru": "Сдаться",
        "uk": "Здатися"
      },
      "not_your_challenge": {
        "en-US": "This is not your challenge!",
        "ru": "Это не ваш вызов!",
        "uk": "Це не ваш виклик!"
      },
      "challenge_declined": {
        "en-US": "Challenge declined.",
        "ru": "Вызов отклонён.",
        "uk": "Виклик відхилено."
      },
      "challenge_timeout": {
        "en-US": "Time to accept has expired.",
        "ru": "Время на принятие истекло.",
        "uk": "Час на прийняття минув."
      },
      "not_your_turn": {
        "en-US": "It's not your turn.",
        "ru": "Сейчас не ваш ход.",
        "uk": "Зараз не ваш хід."
      },
      "cell_occupied": {
        "en-US": "This cell is already occupied.",
        "ru": "Эта клетка уже занята.",
        "uk": "Ця клітинка вже зайнята."
      },
      "surrendered": {
        "en-US": "{user} surrendered! {winner} wins!",
        "ru": "{user} сдался! Победил {winner}!",
        "uk": "{user} здався! Переміг {winner}!"
      },
      "turn_x": {
        "en-US": "Turn: {user} (X)",
        "ru": "Ход: {user} (X)",
        "uk": "Хід: {user} (X)"
      },
      "turn_o": {
        "en-US": "Turn: {user} (O)",
        "ru": "Ход: {user} (O)",
        "uk": "Хід: {user} (O)"
      },
      "winner": {
        "en-US": "Winner: {user}!",
        "ru": "Победитель: {user}!",
        "uk": "Переможець: {user}!"
      },
      "draw": {
        "en-US": "Draw!",
        "ru": "Ничья!",
        "uk": "Нічия!"
      },
      "timeout": {
        "en-US": "Game ended due to inactivity.",
        "ru": "Игра завершена из-за бездействия.",
        "uk": "Гра завершена через бездіяльність."
      }
    }
  }
}

module.exports = {
  minigame
}