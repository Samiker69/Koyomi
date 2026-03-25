import type { ClientEvents } from 'discord.js';

export interface IEvent<Key extends keyof ClientEvents> {
    name: Key;
    once?: boolean;
    execute: (...args: ClientEvents[Key]) => Promise<void>;
}