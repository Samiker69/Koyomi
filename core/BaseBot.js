const { Client, Collection, GatewayIntentBits, Partials, Options } = require('discord.js');

class BaseBot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessageReactions
            ],
            partials: [Partials.Message, Partials.Reaction],
            allowedMentions: { 
                parse: [] 
            },
            // Ограничение кэширования для снижения потребления ОЗУ
            makeCache: Options.cacheWithLimits({
                ...Options.DefaultMakeCacheSettings,
                MessageManager: 10, // Кэшировать только последние 10 сообщений на канал
                StageInstanceManager: 0,
                ApplicationCommandPermissionManager: 0,
                GuildBanManager: 0,
                GuildInviteManager: 0,
                GuildStickerManager: 0,
                GuildScheduledEventManager: 0,
            }),
            // Периодическая очистка кэша от неактивных данных
            sweepers: {
                ...Options.DefaultSweeperSettings,
                messages: {
                    interval: 3600, // Раз в час
                    lifetime: 1800, // Сообщения старше 30 минут удаляются
                },
                users: {
                    interval: 3600,
                    filter: () => (user) => user.id !== user.client.user?.id, // Удалять неактивных пользователей
                },
                guildMembers: {
                    interval: 3600,
                    filter: () => (member) => member.id !== member.guild.members.me?.id, // Удалять участников кроме самого бота
                },
                presences: {
                    interval: 600, // Каждые 10 минут
                    filter: () => () => true, // Полностью чистить кэш присутствий
                }
            }
        });

        // Стандартные коллекции
        this.commands = new Collection();
        this.cooldowns = new Collection();
        
        // Кастомные коллекции (из старого кода)
        this.lastMessages = new Map();
        this.lastChannels = new Map();
        this.queues = new Map();
        
        // Сервисы
        this.services = [];
        this.servicesCount = 0;

        // Статистика
        this.eventsCount = 0;
        this.commandsCount = 0;
    }
}

module.exports = BaseBot;