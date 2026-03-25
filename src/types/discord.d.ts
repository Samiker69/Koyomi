import { Collection } from 'discord.js';
import { ISlashCommand } from '../core/interfaces/Command';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, ISlashCommand>;
    }
}