import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { ISlashCommand } from './interfaces/command';

export class BaseBot extends Client {
    public commands: Collection<string, ISlashCommand>;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
            ],
        });

        this.commands = new Collection();
    }
}