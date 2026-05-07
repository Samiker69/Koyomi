import { Collection, REST, Routes } from 'discord.js';
import type { ISlashCommand } from '../interfaces/command';

export class CommandDeployer {
    private readonly token: string;
    private readonly clientId: string;
    private readonly guildId: string;
    private readonly isDev: boolean;

    constructor() {
        this.token = process.env.TOKEN || '';
        this.clientId = process.env.CLIENT_ID || '';
        this.guildId = process.env.DEV_SERVER_ID || '';
        this.isDev = process.env.DEV === 'true';

        this.validateConfig();
    }

    private validateConfig() {
        if (!this.token || !this.clientId) {
            throw new Error('Missing TOKEN or CLIENT_ID in environment variables.');
        }
        if (this.isDev && !this.guildId) {
            throw new Error('DEV mode is active but DEV_SERVER_ID is missing.');
        }
    }

    public async deploy(commands: Collection<string, ISlashCommand>): Promise<void> {
        if (!this.token || !this.clientId) {
            console.error('[DEPLOY] Missing TOKEN or CLIENT_ID in .env');
            return;
        }

        const commandsJSON = commands.map(command => command.data.toJSON());

        const rest = new REST().setToken(this.token);

        try {
            if (this.isDev) {
                if (!this.guildId) {
                    throw new Error('DEV mode is ON, but DEV_SERVER_ID is not provided in .env');
                }

                console.log(`[DEPLOY] Refreshing ${commandsJSON.length} local guild (/) commands...`);
                
                await rest.put(
                    Routes.applicationGuildCommands(this.clientId, this.guildId),
                    { body: commandsJSON }
                );

                console.log('[DEPLOY] Successfully reloaded commands for DEV server.');
            } else {
                console.log(`[DEPLOY] Refreshing ${commandsJSON.length} global (/) commands...`);

                await rest.put(
                    Routes.applicationCommands(this.clientId),
                    { body: commandsJSON }
                );

                console.log('[DEPLOY] Successfully reloaded commands GLOBALLY.');
            }
        } catch (error) {
            console.error('[DEPLOY] Error while deploying commands:');
            console.error(error);
        }
    }
}