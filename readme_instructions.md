# Discord Bot Admin Panel

Веб-панель администратора для Discord бота с управлением серверами, статистикой и настройками Gemini.

## Установка и запуск

### 1. Настройка Discord Application

1. Перейди на https://discord.com/developers/applications
2. Создай новое приложение или выбери существующее
3. В разделе **OAuth2 → General** скопируй:
   - **Client ID**
   - **Client Secret**
4. В **OAuth2 → Redirects** добавь: `http://localhost:6969/auth/discord/callback`

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка .env файла

Создай файл `.env` в корне проекта:

```env
# Discord Bot Token
token="твой_бот_токен"
clientId="твой_client_id"
clientSecret="твой_client_secret"
redirectUrl="http://localhost:6969"

# Ключи шифрования (сгенерируй новый)
ENCRYPTION_KEY="сгенерированный_ключ_32_символа"

# Gemini API ключи (опционально)
gemini_api_key="твой_gemini_ключ"
```

Для генерации ENCRYPTION_KEY используй:
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
```

### 4. Настройка администраторов

В файле `admin-panel.js` найди строку:
```javascript
const ADMIN_IDS = ['YOUR_USER_ID_HERE'];
```

Замени `'YOUR_USER_ID_HERE'` на свой Discord ID. Получить ID можно:
1. Включи режим разработчика в Discord (Настройки → Дополнительно → Режим разработчика)
2. ПКМ на себя → Копировать ID

### 5. Запуск

```bash
npm start
# или для разработки с автоперезапуском:
npm run dev
```

Панель будет доступна по адресу: http://localhost:6969

## Структура проекта

```
├── admin-panel.js          # Основной файл панели
├── package.json            # Зависимости
├── .env                    # Переменные окружения
├── database/               # База данных SQLite
│   └── main.db            # Автоматически создается
└── public/                 # Статические файлы (если нужны)
```

## Функционал

### ✅ Реализовано:
- 🔐 OAuth2 авторизация через Discord
- 📊 Общая статистика бота
- 🏠 Список серверов бота
- ⚙️ Управление отдельными серверами
- 📋 Просмотр кейсов модерации
- 🤖 Настройки Gemini AI
- 📤 Экспорт данных сервера
- 🗑️ Очистка данных сервера

### 🎯 Основные эндпоинты:

**Веб-интерфейс:**
- `/` - Главная страница (редирект)
- `/login` - Страница авторизации
- `/dashboard` - Основная панель
- `/server/:serverId` - Управление сервером
- `/gemini-settings` - Настройки Gemini

**API:**
- `GET /api/stats` - Общая статистика
- `GET /api/guilds` - Список серверов бота
- `GET /api/server/:serverId/stats` - Статистика сервера
- `GET /api/server/:serverId/cases` - Кейсы модерации
- `GET /api/server/:serverId/export` - Экспорт данных
- `DELETE /api/server/:serverId/clear` - Очистка данных

**Gemini API:**
- `POST /api/gemini/user-settings` - Сохранение настроек пользователя
- `POST /api/gemini/safety-settings` - Сохранение настроек безопасности

## Безопасность

- ✅ Проверка администраторских прав
- ✅ Сессии с истечением срока действия
- ✅ Проверка доступа к Gemini настройкам
- ✅ Валидация данных
- ✅ CSRF защита через сессии

## Интеграция с ботом

Для полной интеграции с Discord ботом, добавь в `bot.js`:

```javascript
// После инициализации клиента
const express = require('express');
const adminPanel = require('./admin-panel');

// Передай клиент в панель администратора
global.discordClient = client;

// Или используй IPC/WebSocket для связи между процессами
```

## Кастомизация

- **Админы**: Редактируй массив `ADMIN_IDS` или добавляй в таблицу `admin_users`
- **Стили**: CSS находится инлайн в HTML, можешь вынести в отдельные файлы
- **API**: Добавляй новые эндпоинты по необходимости
- **База данных**: SQLite автоматически создается и поддерживается

## Производственный деплой

1. Измени `redirectUrl` в `.env` на продакшн домен
2. Добавь новый redirect URI в Discord Application
3. Используй HTTPS в продакшене
4. Настрой reverse proxy (nginx)
5. Используй process manager (PM2)

```bash
pm2 start admin-panel.js --name "discord-admin-panel"
```

## Troubleshooting

**Ошибка "forbidden"**: Убедись что твой Discord ID добавлен в `ADMIN_IDS`

**Ошибка авторизации**: Проверь `clientId`, `clientSecret` и redirect URI

**База данных не создается**: Убедись что есть права на запись в папку `database/`

**Пустой список серверов**: Реализуй интеграцию с Discord API или подключи к боту