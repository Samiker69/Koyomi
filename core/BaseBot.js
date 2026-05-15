const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

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