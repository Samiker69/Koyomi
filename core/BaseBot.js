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
            makeCache: Options.cacheWithLimits({
                ...Options.DefaultMakeCacheSettings,
                MessageManager: 10,
                StageInstanceManager: 0,
                ApplicationCommandPermissionManager: 0,
                GuildBanManager: 0,
                GuildInviteManager: 0,
                GuildStickerManager: 0,
                GuildScheduledEventManager: 0,
            }),
            sweepers: {
                ...Options.DefaultSweeperSettings,
                messages: {
                    interval: 3600,
                    lifetime: 1800,
                },
                users: {
                    interval: 3600,
                    filter: () => (user) => user.id !== user.client.user?.id,
                },
                guildMembers: {
                    interval: 3600,
                    filter: () => (member) => member.id !== member.guild.members.me?.id,
                },
                presences: {
                    interval: 600,
                    filter: () => () => true,
                }
            }
        });
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.queues = new Map();
        this.services = [];
        this.servicesCount = 0;
        this.eventsCount = 0;
        this.commandsCount = 0;
    }
}

module.exports = BaseBot;