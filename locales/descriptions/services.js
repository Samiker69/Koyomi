const services = {
  "embed": {
    "moderator": { "en-US": "Moderator", "ru": "Модератор", "uk": "Модератор" },
    "user": { "en-US": "User", "ru": "Пользователь", "uk": "Користувач" },
    "reason": { "en-US": "Reason", "ru": "Причина", "uk": "Причина" },
    "duration": { "en-US": "Duration", "ru": "Длительность", "uk": "Тривалість" },
    "time": { "en-US": "Time", "ru": "Время", "uk": "Час" },
    "evidence": { "en-US": "Evidence", "ru": "Доказательства", "uk": "Докази" },
    "click_to_view": { "en-US": "Click to view", "ru": "Нажмите для просмотра", "uk": "Натисніть для перегляду" },
    "case": { "en-US": "Case", "ru": "Кейс", "uk": "Кейс" }
  },
  "mojotest": {
    "already_running": { "en-US": "User is already taking the test!", "ru": "Пользователь уже проходит тест!", "uk": "Користувач вже проходить тест!" },
    "role_error": { "en-US": "Failed to remove roles. Check bot hierarchy.", "ru": "Не удалось снять роли. Проверьте иерархию бота.", "uk": "Не вдалося зняти ролі. Перевірте ієрархію бота." },
    "test_started": { "en-US": "<@{user}>, your test has started! You cannot send messages.\n**No mistakes allowed!**", "ru": "<@{user}>, ваш тест начался! Вы не можете отправлять сообщения.\n**Ошибаться нельзя!**", "uk": "<@{user}>, ваш тест розпочався! Ви не можете надсилати повідомлення.\n**Помилятися не можна!**" },
    "question_title": { "en-US": "MojoLauncher Check - Question {current} of 3", "ru": "Проверка MojoLauncher - Вопрос {current} из 3", "uk": "Перевірка MojoLauncher - Питання {current} з 3" },
    "footer_note": { "en-US": "You have 30 seconds. Any mistake will lead to a kick.", "ru": "У вас есть 30 секунд. Любая ошибка приведёт к исключению (кик).", "uk": "У вас є 30 секунд. Будь-яка помилка призведе до виключення (кік)." },
    "next_question": { "en-US": "<@{user}>, next question!", "ru": "<@{user}>, следующий вопрос!", "uk": "<@{user}>, наступне питання!" },
    "test_failed": { "en-US": "Test failed", "ru": "Тест провален", "uk": "Тест провалено" },
    "failed_description": { "en-US": "User <@{user}> answered **incorrectly** and was kicked from the server.", "ru": "Пользователь <@{user}> ответил **неверно** и был кикнут с сервера.", "uk": "Користувач <@{user}> відповів **невірно** і був кікнутий з сервера." },
    "failed_content": { "en-US": "<@{user}> failed the test.", "ru": "<@{user}> провалил тест.", "uk": "<@{user}> провалив тест." },
    "test_passed": { "en-US": "Test passed successfully!", "ru": "Тест успешно пройден!", "uk": "Тест успішно пройдено!" },
    "passed_description": { "en-US": "User <@{user}> answered correctly to all 3 questions. Restrictions removed.", "ru": "Пользователь <@{user}> ответил правильно на все 3 вопроса. Ограничения сняты.", "uk": "Користувач <@{user}> відповів правильно на всі 3 питання. Обмеження знято." },
    "passed_content": { "en-US": "Test passed!", "ru": "Тест пройден!", "uk": "Тест пройдено!" },
    "timeout_title": { "en-US": "Time is up", "ru": "Время вышло", "uk": "Час вийшов" },
    "timeout_description": { "en-US": "User <@{user}> didn't answer in time and was kicked from the server.", "ru": "Пользователь <@{user}> не успел ответить на вопрос и был кикнут с сервера.", "uk": "Користувач <@{user}> не встиг відповісти на питання і був кікнутий з сервера." },
    "timeout_content": { "en-US": "Time is up.", "ru": "Время вышло.", "uk": "Час вийшов." },
    "audit_log": {
      "started": { "en-US": "MojoTest started", "ru": "Начало MojoTest", "uk": "Початок MojoTest" },
      "finished": { "en-US": "MojoTest finished", "ru": "Завершение MojoTest", "uk": "Завершення MojoTest" },
      "failed": { "en-US": "Failed MojoTest", "ru": "Провал MojoTest", "uk": "Провал MojoTest" }
    },
    "questions": [
      {
        "q": { "en-US": "What is Mojo Launcher?", "ru": "Что такое Mojo Launcher?", "uk": "Що таке Mojo Launcher?" },
        "a": [
          { "en-US": "Java Edition emulator for Android", "ru": "Эмулятор Java Edition для Android", "uk": "Емулятор Java Edition для Android" },
          { "en-US": "Launcher for Bedrock Edition", "ru": "Лаунчер для Bedrock Edition", "uk": "Лаунчер для Bedrock Edition" },
          { "en-US": "PC cheat client", "ru": "Чит-клиент для ПК", "uk": "Чит-клієнт для ПК" },
          { "en-US": "Server creation tool", "ru": "Программа для создания серверов", "uk": "Програма для створення серверів" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "What project is Mojo Launcher based on?", "ru": "На базе какого проекта основан Mojo Launcher?", "uk": "На базі якого проєкту заснований Mojo Launcher?" },
        "a": [
          { "en-US": "TLauncher", "ru": "TLauncher", "uk": "TLauncher" },
          { "en-US": "PojavLauncher", "ru": "PojavLauncher", "uk": "PojavLauncher" },
          { "en-US": "Lunar Client", "ru": "Lunar Client", "uk": "Lunar Client" },
          { "en-US": "Badlion Client", "ru": "Badlion Client", "uk": "Badlion Client" }
        ],
        "c": 1
      },
      {
        "q": { "en-US": "Which Minecraft version does Mojo Launcher run?", "ru": "Какую версию Minecraft позволяет запускать Mojo Launcher?", "uk": "Яку версію Minecraft дозволяє запускати Mojo Launcher?" },
        "a": [
          { "en-US": "Only old alpha versions", "ru": "Только старые альфа-версии", "uk": "Тільки старі альфа-версії" },
          { "en-US": "Minecraft: Bedrock Edition", "ru": "Minecraft: Bedrock Edition", "uk": "Minecraft: Bedrock Edition" },
          { "en-US": "Minecraft: Java Edition", "ru": "Minecraft: Java Edition", "uk": "Minecraft: Java Edition" },
          { "en-US": "Minecraft: Dungeons", "ru": "Minecraft: Dungeons", "uk": "Minecraft: Dungeons" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "Does Mojo Launcher support installing mods?", "ru": "Поддерживает ли Mojo Launcher установку модов?", "uk": "Чи підтримує Mojo Launcher встановлення модів?" },
        "a": [
          { "en-US": "No, only 'vanilla'", "ru": "Нет, только 'ванилла'", "uk": "Ні, тільки 'ваніла'" },
          { "en-US": "Only addons from Marketplace", "ru": "Только аддоны из Marketplace", "uk": "Тільки аддони з Marketplace" },
          { "en-US": "Yes, supports Forge and Fabric", "ru": "Да, поддерживает Forge и Fabric", "uk": "Так, підтримує Forge та Fabric" },
          { "en-US": "Yes, but only for a fee", "ru": "Да, но только платно", "uk": "Так, але тільки платно" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "Which operating system is the app available for?", "ru": "Для какой операционной системы доступно приложение?", "uk": "Для якої операційної системи доступний додаток?" },
        "a": [
          { "en-US": "iOS", "ru": "iOS", "uk": "iOS" },
          { "en-US": "Windows", "ru": "Windows", "uk": "Windows" },
          { "en-US": "Linux", "ru": "Linux", "uk": "Linux" },
          { "en-US": "Android", "ru": "Android", "uk": "Android" }
        ],
        "c": 3
      },
      {
        "q": { "en-US": "Can you play on multiplayer servers via Mojo?", "ru": "Можно ли играть на многопользовательских серверах через Mojo?", "uk": "Чи можна грати на багатокористувацьких серверах через Mojo?" },
        "a": [
          { "en-US": "Yes, on any Java servers", "ru": "Да, на любых Java-серверах", "uk": "Так, на будь-яких Java-серверах" },
          { "en-US": "No, single player only", "ru": "Нет, только одиночная игра", "uk": "Ні, тільки одиночна гра" },
          { "en-US": "Only on local network", "ru": "Только по локальной сети", "uk": "Тільки по локальній мережі" },
          { "en-US": "Only on Realms servers", "ru": "Только на серверах Realms", "uk": "Тільки на серверах Realms" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Does Mojo Launcher support installing shaders?", "ru": "Поддерживает ли Mojo Launcher установку шейдеров?", "uk": "Чи підтримує Mojo Launcher встановлення шейдерів?" },
        "a": [
          { "en-US": "Yes, via OptiFine/Iris", "ru": "Да, через OptiFine/Iris", "uk": "Так, через OptiFine/Iris" },
          { "en-US": "No, phones can't handle it", "ru": "Нет, телефоны не потянут", "uk": "Ні, телефони не потягнуть" },
          { "en-US": "Only built-in RTX shaders", "ru": "Только встроенные RTX шейдеры", "uk": "Тільки вбудовані RTX шейдери" },
          { "en-US": "Yes, but without shadows", "ru": "Да, но без теней", "uk": "Так, але без тіней" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "What does FPS mainly depend on when playing via Mojo?", "ru": "От чего в первую очередь зависит FPS при игре через Mojo?", "uk": "Від чого насамперед залежить FPS при грі через Mojo?" },
        "a": [
          { "en-US": "Internet speed", "ru": "От скорости интернета", "uk": "Від швидкості інтернету" },
          { "en-US": "Launcher version", "ru": "От версии лаунчера", "uk": "Від версії лаунчера" },
          { "en-US": "Phone power (CPU/RAM)", "ru": "От мощности телефона (процессор/ОЗУ)", "uk": "Від потужності телефону (процесор/ОЗУ)" },
          { "en-US": "Battery charge", "ru": "От заряда батареи", "uk": "Від заряду батареї" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "Can you play without a purchased (licensed) account?", "ru": "Можно ли играть без купленного (лицензионного) аккаунта?", "uk": "Чи можна грати без купленого (ліцензійного) аккаунта?" },
        "a": [
          { "en-US": "No, not at all", "ru": "Нет, вообще нельзя", "uk": "Ні, взагалі не можна" },
          { "en-US": "Yes, there is offline mode", "ru": "Да, есть оффлайн-режим (пиратка)", "uk": "Так, є офлайн-режим (піратка)" },
          { "en-US": "Yes, but only for 5 minutes", "ru": "Да, но только 5 минут", "uk": "Так, але тільки 5 хвилин" },
          { "en-US": "Only if you buy a subscription", "ru": "Только если купить подписку", "uk": "Тільки якщо купити передплату" }
        ],
        "c": 1
      },
      {
        "q": { "en-US": "Does Mojo Launcher support connecting keyboard and mouse to the phone?", "ru": "Поддерживает ли Mojo Launcher подключение клавиатуры и мыши к телефону?", "uk": "Чи підтримує Mojo Launcher підключення клавіатури та миші до телефону?" },
        "a": [
          { "en-US": "Yes, fully supported", "ru": "Да, полностью поддерживает", "uk": "Так, повністю підтримує" },
          { "en-US": "No, touch only", "ru": "Нет, только сенсор", "uk": "Ні, тільки сенсор" },
          { "en-US": "Supports only gamepads", "ru": "Поддерживает только геймпады", "uk": "Підтримує тільки геймпади" },
          { "en-US": "Only keyboard without mouse", "ru": "Только клавиатуру без мыши", "uk": "Тільки клавіатуру без миші" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Can you customize screen buttons (size, position)?", "ru": "Можно ли настраивать экранные кнопки (размер, положение)?", "uk": "Чи можна налаштовувати екранні кнопки (розмір, положення)?" },
        "a": [
          { "en-US": "No, interface is fixed", "ru": "Нет, интерфейс фиксированный", "uk": "Ні, інтерфейс фіксований" },
          { "en-US": "Only transparency", "ru": "Только прозрачность", "uk": "Тільки прозорість" },
          { "en-US": "Yes, full customization", "ru": "Да, есть полная кастомизация", "uk": "Так, є повна кастомізація" },
          { "en-US": "Available only in VIP version", "ru": "Настройка доступна только в VIP-версии", "uk": "Налаштування доступне тільки у VIP-версії" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "How is Mojo Launcher different from Minecraft PE (Bedrock)?", "ru": "Чем Mojo Launcher принципиально отличается от Minecraft PE (Bedrock)?", "uk": "Чим Mojo Launcher принципово відрізняється від Minecraft PE (Bedrock)?" },
        "a": [
          { "en-US": "It has different graphics", "ru": "Там другая графика", "uk": "Там інша графіка" },
          { "en-US": "It's emulation of full PC Java version", "ru": "Это эмуляция полноценной ПК-версии (Java)", "uk": "Це емуляція повноцінної ПК-версії (Java)" },
          { "en-US": "Mojo has fewer blocks", "ru": "В Mojo меньше блоков", "uk": "У Mojo менше блоків" },
          { "en-US": "Mojo is just a texture pack", "ru": "Mojo — это просто набор текстур", "uk": "Mojo — це просто набір текстур" }
        ],
        "c": 1
      },
      {
        "q": { "en-US": "Can you transfer your worlds from PC to phone for Mojo?", "ru": "Можно ли перенести свои миры с ПК на телефон для игры в Mojo?", "uk": "Чи можна перенести свої світи з ПК на телефон для гри в Mojo?" },
        "a": [
          { "en-US": "Yes, by copying them to saves folder", "ru": "Да, скопировав их в папку saves", "uk": "Так, скопіювавши їх у папку saves" },
          { "en-US": "No, worlds are incompatible", "ru": "Нет, миры несовместимы", "uk": "Ні, світи несумісні" },
          { "en-US": "Only via special converter", "ru": "Только через специальный конвертер", "uk": "Тільки через спеціальний конвертер" },
          { "en-US": "Only worlds created in new versions", "ru": "Только миры созданные в новых версиях", "uk": "Тільки світи, створені в нових версіях" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Is Russian language supported in Mojo Launcher interface?", "ru": "Есть ли в Mojo Launcher русский язык интерфейса?", "uk": "Чи є в Mojo Launcher російська мова інтерфейсу?" },
        "a": [
          { "en-US": "No, only English", "ru": "Нет, только английский", "uk": "Ні, тільки англійська" },
          { "en-US": "Only Chinese", "ru": "Только китайский", "uk": "Тільки китайська" },
          { "en-US": "Yes, interface is localized", "ru": "Да, интерфейс русифицирован", "uk": "Так, інтерфейс русифікований" },
          { "en-US": "Only in game chat", "ru": "Только в чате игры", "uk": "Тільки в чаті гри" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "Which CPU architecture does Mojo Launcher support best?", "ru": "Какую архитектуру процессоров поддерживает Mojo Launcher лучше всего?", "uk": "Яку архітектуру процесорів підтримує Mojo Launcher найкраще?" },
        "a": [
          { "en-US": "ARM64 (modern phones)", "ru": "ARM64 (современные телефоны)", "uk": "ARM64 (сучасні телефони)" },
          { "en-US": "x86 (old PCs)", "ru": "x86 (старые ПК)", "uk": "x86 (старі ПК)" },
          { "en-US": "ARMv7 (very old smartphones)", "ru": "ARMv7 (очень старые смартфоны)", "uk": "ARMv7 (дуже старі смартфони)" },
          { "en-US": "PowerPC", "ru": "PowerPC", "uk": "PowerPC" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Is Mojo Launcher free to use?", "ru": "Mojo Launcher бесплатен для использования?", "uk": "Mojo Launcher безкоштовний для використання?" },
        "a": [
          { "en-US": "Yes, completely free", "ru": "Да, полностью бесплатен", "uk": "Так, повністю безкоштовний" },
          { "en-US": "No, it requires monthly subscription", "ru": "Нет, нужна ежемесячная подписка", "uk": "Ні, потрібна щомісячна передплата" },
          { "en-US": "Only first 30 minutes are free", "ru": "Только первые 30 минут бесплатны", "uk": "Тільки перші 30 хвилин безкоштовні" },
          { "en-US": "Free for owners of PC version only", "ru": "Бесплатно только для владельцев ПК-версии", "uk": "Безкоштовно тільки для власників ПК-версії" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Does Mojo Launcher support Controller/Gamepad?", "ru": "Поддерживает ли Mojo Launcher контроллер/геймпад?", "uk": "Чи підтримує Mojo Launcher контролер/геймпад?" },
        "a": [
          { "en-US": "Yes, native support", "ru": "Да, нативная поддержка", "uk": "Так, нативна підтримка" },
          { "en-US": "Yes, with special mods like Controllable", "ru": "Да, со специальными модами (Controllable)", "uk": "Так, зі спеціальними модами (Controllable)" },
          { "en-US": "No, only touch control", "ru": "Нет, только сенсорное управление", "uk": "Ні, тільки сенсорне управління" },
          { "en-US": "Only on specific Sony phones", "ru": "Только на определенных телефонах Sony", "uk": "Тільки на певних телефонах Sony" }
        ],
        "c": 1
      },
      {
        "q": { "en-US": "What is the recommended RAM for stable gameplay?", "ru": "Какой объем ОЗУ рекомендуется для стабильной игры?", "uk": "Який обсяг ОЗП рекомендується для стабільної гри?" },
        "a": [
          { "en-US": "512 MB", "ru": "512 МБ", "uk": "512 МБ" },
          { "en-US": "1 GB", "ru": "1 ГБ", "uk": "1 ГБ" },
          { "en-US": "4 GB or more", "ru": "4 ГБ или более", "uk": "4 ГБ або більше" },
          { "en-US": "16 GB", "ru": "16 ГБ", "uk": "16 ГБ" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "Can you use custom skins in Mojo?", "ru": "Можно ли использовать свои скины в Mojo?", "uk": "Чи можна використовувати свої скіни в Mojo?" },
        "a": [
          { "en-US": "Yes, if you have a licensed account", "ru": "Да, если есть лицензионный аккаунт", "uk": "Так, якщо є ліцензійний акаунт" },
          { "en-US": "No, only default skins", "ru": "Нет, только стандартные скины", "uk": "Ні, тільки стандартні скіни" },
          { "en-US": "Only paid skins from the shop", "ru": "Только платные скины из магазина", "uk": "Тільки платні скіни з магазину" },
          { "en-US": "Yes, but only in singleplayer", "ru": "Да, но только в одиночной игре", "uk": "Так, але тільки в одиночній грі" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Does Mojo Launcher support playing via local network (LAN)?", "ru": "Поддерживает ли Mojo Launcher игру по локальной сети (LAN)?", "uk": "Чи підтримує Mojo Launcher гру по локальній мережі (LAN)?" },
        "a": [
          { "en-US": "Yes, like on PC", "ru": "Да, аналогично ПК-версии", "uk": "Так, аналогічно ПК-версії" },
          { "en-US": "No, LAN is not supported", "ru": "Нет, LAN не поддерживается", "uk": "Ні, LAN не підтримується" },
          { "en-US": "Only via Bluetooth", "ru": "Только через Bluetooth", "uk": "Тільки через Bluetooth" },
          { "en-US": "Only between two Mojo users", "ru": "Только между двумя пользователями Mojo", "uk": "Тільки між двома користувачами Mojo" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "What is the official site of the project?", "ru": "Какой официальный сайт проекта?", "uk": "Який офіційний сайт проєкту?" },
        "a": [
          { "en-US": "minecraft.net", "ru": "minecraft.net", "uk": "minecraft.net" },
          { "en-US": "google.com", "ru": "google.com", "uk": "google.com" },
          { "en-US": "mojolauncher.ru", "ru": "mojolauncher.ru", "uk": "mojolauncher.ru" },
          { "en-US": "mojang.com", "ru": "mojang.com", "uk": "mojang.com" }
        ],
        "c": 2
      },
      {
        "q": { "en-US": "How to install Fabric/Forge in the launcher?", "ru": "Как установить Fabric/Forge в лаунчере?", "uk": "Как установить Fabric/Forge у лаунчері?" },
        "a": [
          { "en-US": "Download .jar and run via 'Install .jar' button", "ru": "Скачать .jar и запустить через кнопку 'Установить .jar'", "uk": "Завантажити .jar та запустити через кнопку 'Встановити .jar'" },
          { "en-US": "Move files to system folder", "ru": "Перенести файлы в системную папку", "uk": "Перенести файли до системної папки" },
          { "en-US": "It's built-in, no need to install", "ru": "Оно встроено, устанавливать не нужно", "uk": "Воно вбудоване, встановлювати не потрібно" },
          { "en-US": "Installation is not supported", "ru": "Установка не поддерживается", "uk": "Встановлення не підтримується" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Does Mojo Launcher support Controller/Gamepad?", "ru": "Поддерживает ли Mojo Launcher контроллер/геймпад?", "uk": "Чи підтримує Mojo Launcher контролер/геймпад?" },
        "a": [
          { "en-US": "Yes, with special mods like Controllable", "ru": "Да, со специальными модами (Controllable)", "uk": "Так, зі спеціальними модами (Controllable)" },
          { "en-US": "Yes, native support", "ru": "Да, нативная поддержка", "uk": "Так, нативна підтримка" },
          { "en-US": "No, only touch control", "ru": "Нет, только сенсорное управление", "uk": "Ні, тільки сенсорне управління" },
          { "en-US": "Only on specific Sony phones", "ru": "Только на определенных телефонах Sony", "uk": "Тільки на певних телефонах Sony" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Can you run server-side software (like Purpur) via Mojo?", "ru": "Можно ли запускать серверное ПО (например, Purpur) через Mojo?", "uk": "Чи можна запускати серверне ПЗ (наприклад, Purpur) через Mojo?" },
        "a": [
          { "en-US": "Yes, it can run any Java software", "ru": "Да, он может запускать любое Java-ПО", "uk": "Так, він може запускати будь-яке Java-ПЗ" },
          { "en-US": "No, only client versions", "ru": "Нет, только клиентские версии", "uk": "Ні, тільки клієнтські версії" },
          { "en-US": "Only with Root access", "ru": "Только с Root-правами", "uk": "Тільки з Root-правами" },
          { "en-US": "Only on Linux", "ru": "Только на Linux", "uk": "Тільки на Linux" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "What to do if the game crashes with an error?", "ru": "Что делать, если игра вылетает с ошибкой?", "uk": "Що робити, якщо гра вилітає з помилкою?" },
        "a": [
          { "en-US": "Check logs and ask for help in Discord", "ru": "Проверить логи и попросить помощи в Discord", "uk": "Перевірити логи та попросити допомоги в Discord" },
          { "en-US": "Delete the app and never install it again", "ru": "Удалить приложение и больше не устанавливать", "uk": "Видалити додаток і більше не встановлювати" },
          { "en-US": "Wait for 2 hours", "ru": "Подождать 2 часа", "uk": "Зачекати 2 години" },
          { "en-US": "Reinstall Android", "ru": "Переустановить Android", "uk": "Перевстановити Android" }
        ],
        "c": 0
      },
      {
        "q": { "en-US": "Is there a version for iOS (iPhone/iPad)?", "ru": "Существует ли версия для iOS (iPhone/iPad)?", "uk": "Чи існує версія для iOS (iPhone/iPad)?" },
        "a": [
          { "en-US": "No, Mojo is Android only", "ru": "Нет, Mojo только для Android", "uk": "Ні, Mojo тільки для Android" },
          { "en-US": "Yes, in AppStore", "ru": "Да, в AppStore", "uk": "Так, в AppStore" },
          { "en-US": "Only for jailbroken devices", "ru": "Только для устройств с джейлбрейком", "uk": "Тільки для пристроїв з джейлбрейком" },
          { "en-US": "Available via TestFlight", "ru": "Доступно через TestFlight", "uk": "Доступно через TestFlight" }
        ],
        "c": 0
      }
    ]
  },
  "report": {
    "accepted_by": { "en-US": "Accepted by: {user}", "ru": "Принято: {user}", "uk": "Прийнято: {user}" },
    "under_review_by": { "en-US": "Under review by: {user}", "ru": "На рассмотрении: {user}", "uk": "На розгляді: {user}" },
    "resolved_by": { "en-US": "Resolved by: {user}", "ru": "Решено: {user}", "uk": "Вирішено: {user}" },
    "replied_by": { "en-US": "Replied by: {user}", "ru": "Ответил: {user}", "uk": "Відповів: {user}" },
    "declined_by": { "en-US": "Declined by: {user}", "ru": "Отклонено: {user}", "uk": "Відхилено: {user}" }
  }
};

module.exports = {
  services
};
